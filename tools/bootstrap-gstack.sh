#!/usr/bin/env bash
# Bootstrap the gstack engine for Alfred — project-scoped, reproducible, idempotent.
#
# Clones garrytan/gstack into vendor/gstack (shallow) if missing, then registers
# every gstack skill into .claude/skills/ via relative symlinks so Claude Code
# discovers them. Re-runnable: skips the clone if present, refreshes symlinks.
#
# Does NOT run gstack's global ./setup or build the bun browser binary — that
# writes to ~/.claude / ~/.codex and is outside this repo's no-global-install
# boundary. Run gstack's /gstack-upgrade skill to update the vendored tree.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GSTACK_DIR="$REPO_ROOT/vendor/gstack"
SKILLS_DIR="$REPO_ROOT/.claude/skills"
GSTACK_URL="https://github.com/garrytan/gstack.git"

if [ ! -d "$GSTACK_DIR/.git" ] && [ ! -f "$GSTACK_DIR/SKILL.md" ]; then
  echo "Cloning gstack -> vendor/gstack"
  git clone --single-branch --depth 1 "$GSTACK_URL" "$GSTACK_DIR"
else
  echo "gstack already present at vendor/gstack (skipping clone)"
fi

mkdir -p "$SKILLS_DIR"
n=0
for d in "$GSTACK_DIR"/*/; do
  name="$(basename "$d")"
  if [ -f "$d/SKILL.md" ]; then
    ln -snf "../../vendor/gstack/$name" "$SKILLS_DIR/$name"
    n=$((n + 1))
  fi
done

echo "Registered $n gstack skills into .claude/skills/"
echo "gstack version: $(cat "$GSTACK_DIR/VERSION" 2>/dev/null || echo unknown)"
