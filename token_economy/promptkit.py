from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

from .wiki import parse_frontmatter, parse_tags, query_tokens


PLACEHOLDER_RE = re.compile(r"\{\{([A-Za-z0-9_-]+)\}\}")
PROMPT_START = "<!-- promptkit:start -->"
PROMPT_END = "<!-- promptkit:end -->"
PROMPT_STRUCTURE_RE = re.compile(r"\b(prompt engineering|prompt construction|writing prompts|prompt about prompts|reusable prompt)\b", re.IGNORECASE)


@dataclass(frozen=True)
class PromptEntry:
    slug: str
    kind: str
    path: Path
    title: str
    tags: list[str]
    slots: list[str]
    default: bool
    content: str

    def to_dict(self, root: Path) -> dict[str, Any]:
        return {
            "slug": self.slug,
            "kind": self.kind,
            "path": self.path.relative_to(root).as_posix(),
            "title": self.title,
            "tags": self.tags,
            "slots": self.slots,
            "default": self.default,
        }


def _library_root(root: Path) -> Path:
    return root / "prompts" / "library"


def _entry_kind(path: Path) -> str:
    parts = set(path.parts)
    if "templates" in parts:
        return "template"
    if "snippets" in parts:
        return "snippet"
    return "entry"


def _truthy(value: str) -> bool:
    return str(value or "").strip().lower() in {"1", "true", "yes", "y", "on"}


def _extract_prompt_content(body: str) -> str:
    if PROMPT_START in body and PROMPT_END in body:
        return body.split(PROMPT_START, 1)[1].split(PROMPT_END, 1)[0].strip()
    lines = body.splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    return "\n".join(lines).strip()


def _slug(path: Path) -> str:
    return path.stem


def read_entry(root: Path, path: Path) -> PromptEntry:
    text = path.read_text(encoding="utf-8", errors="replace")
    fm, body = parse_frontmatter(text)
    title = fm.get("title") or path.stem.replace("-", " ").title()
    return PromptEntry(
        slug=_slug(path),
        kind=_entry_kind(path),
        path=path,
        title=title,
        tags=parse_tags(fm.get("tags", "")),
        slots=parse_tags(fm.get("slots", fm.get("slot", ""))),
        default=_truthy(fm.get("default", "")),
        content=_extract_prompt_content(body),
    )


def entries(root: Path, kind: str | None = None) -> list[PromptEntry]:
    library = _library_root(root)
    if not library.exists():
        return []
    found = [read_entry(root, path) for path in sorted(library.rglob("*.md"))]
    if kind:
        singular = kind.removesuffix("s")
        found = [entry for entry in found if entry.kind == singular]
    return found


def list_entries(root: Path, kind: str | None = None) -> dict[str, Any]:
    return {
        "mode": "prompt_library_list",
        "library": str(_library_root(root)),
        "entries": [entry.to_dict(root) for entry in entries(root, kind)],
    }


def resolve_entry(root: Path, slug: str, kind: str | None = None) -> PromptEntry:
    candidates = entries(root, kind)
    for entry in candidates:
        if entry.slug == slug:
            return entry
    available = ", ".join(entry.slug for entry in candidates) or "none"
    raise KeyError(f"prompt library entry not found: {slug}; available: {available}")


def _score(entry: PromptEntry, query: str) -> float:
    tokens = query_tokens(query)
    haystack = " ".join([entry.slug, entry.title, " ".join(entry.tags), entry.content]).lower()
    score = 0.0
    for token in tokens:
        if token in haystack:
            score += 1.0
    for token in tokens:
        if token in entry.slug.lower() or token in entry.title.lower():
            score += 1.5
    for token in tokens:
        if token in " ".join(entry.tags).lower():
            score += 1.0
    if entry.default:
        score += 0.25
    return score


def ranked_entries(root: Path, query: str, kind: str | None = None) -> list[PromptEntry]:
    return sorted(entries(root, kind), key=lambda entry: (-_score(entry, query), entry.slug))


def _parse_vars(var_pairs: list[str] | None) -> dict[str, str]:
    values: dict[str, str] = {}
    for pair in var_pairs or []:
        if "=" not in pair:
            raise ValueError(f"--var must use key=value, got: {pair}")
        key, value = pair.split("=", 1)
        key = key.strip()
        if not key:
            raise ValueError(f"--var key cannot be empty: {pair}")
        values[key] = value
    return values


def _default_values(requirement: str, values: dict[str, str]) -> dict[str, str]:
    merged = {
        "today": date.today().isoformat(),
        "requirement": requirement,
        "task": requirement,
        "role": "a sharp chief-of-staff prompt architect",
        "audience": "Saar",
        "input": "{{input}}",
        "source_material": "{{source_material}}",
        "constraints": "Be clear, concrete, and concise. Do not invent facts. Ask for missing context only when it materially changes the answer.",
        "output_format": "Return the finished answer in the format requested by the user.",
    }
    merged.update(values)
    return merged


def _render(text: str, values: dict[str, str]) -> tuple[str, list[str]]:
    missing: list[str] = []

    def replace(match: re.Match[str]) -> str:
        key = match.group(1)
        value = values.get(key)
        if value is None:
            if key not in missing:
                missing.append(key)
            return match.group(0)
        return value

    return PLACEHOLDER_RE.sub(replace, text).strip(), missing


def select_template(root: Path, requirement: str, template_slug: str | None = None) -> PromptEntry:
    if template_slug:
        return resolve_entry(root, template_slug, "template")
    ranked = ranked_entries(root, requirement, "template")
    if ranked:
        return ranked[0]
    raise KeyError("no prompt templates found under prompts/library/templates")


def select_snippets(root: Path, requirement: str, snippet_slugs: list[str] | None = None, limit: int = 6) -> list[PromptEntry]:
    selected: list[PromptEntry] = []
    if snippet_slugs:
        selected.extend(resolve_entry(root, slug, "snippet") for slug in snippet_slugs)
    else:
        defaults = [entry for entry in entries(root, "snippet") if entry.default]
        matched = [entry for entry in ranked_entries(root, requirement, "snippet") if _score(entry, requirement) > 0 and not entry.default]
        selected.extend(defaults)
        selected.extend(matched)
    unique: list[PromptEntry] = []
    seen: set[str] = set()
    for entry in selected:
        if entry.slug not in seen:
            unique.append(entry)
            seen.add(entry.slug)
    return unique[:limit]


def draft_prompt(
    root: Path,
    requirement: str,
    *,
    template_slug: str | None = None,
    snippet_slugs: list[str] | None = None,
    var_pairs: list[str] | None = None,
) -> dict[str, Any]:
    template = select_template(root, requirement, template_slug)
    snippets = select_snippets(root, requirement, snippet_slugs, limit=12)
    if not snippet_slugs and (template.slug != "prompt-generator" or not PROMPT_STRUCTURE_RE.search(requirement)):
        snippets = [snippet for snippet in snippets if "prompt-structure" not in snippet.slots]
    snippets = snippets[:6]
    section_text = "\n\n".join(snippet.content for snippet in snippets if snippet.content)
    values = _default_values(requirement, _parse_vars(var_pairs))
    values.setdefault("sections", section_text)
    values["sections"] = section_text
    values.setdefault("context", section_text)
    values["context"] = values.get("context") or section_text
    rendered, missing = _render(template.content, values)
    return {
        "mode": "prompt_draft",
        "requirement": requirement,
        "template": template.to_dict(root),
        "snippets": [snippet.to_dict(root) for snippet in snippets],
        "missing_placeholders": missing,
        "rendered_prompt": rendered,
        "rationale": [
            f"template:{template.slug}",
            "snippets:" + ",".join(snippet.slug for snippet in snippets),
            "missing:" + ",".join(missing) if missing else "missing:none",
        ],
    }
