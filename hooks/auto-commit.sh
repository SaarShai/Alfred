#!/usr/bin/env bash
# Stop-hook: local WIP checkpoint so no agent turn ever leaves work uncommitted.
# Local commit only — never pushes, never --no-verify, never amends. A remote
# exists; publishing stays a deliberate manual action.
set -uo pipefail

# Always succeed: a failing Stop hook must never block the agent.
trap 'exit 0' EXIT

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" 2>/dev/null || exit 0

# Must be inside a git work tree.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

git_dir="$(git rev-parse --git-dir 2>/dev/null)" || exit 0

# Skip mid-merge / mid-rebase / mid-cherry-pick / mid-bisect — auto-committing
# would corrupt an in-progress operation.
for marker in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD BISECT_LOG; do
  [ -e "$git_dir/$marker" ] && exit 0
done
case "$(ls -d "$git_dir"/rebase-* 2>/dev/null)" in
  *rebase-*) exit 0 ;;
esac

# Nothing staged or unstaged or untracked -> nothing to do.
[ -z "$(git status --porcelain 2>/dev/null)" ] && exit 0

git add -A 2>/dev/null || exit 0

# Re-check: .gitignore may mean there is still nothing to commit.
git diff --cached --quiet 2>/dev/null && exit 0

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
git commit -m "chore: wip checkpoint ${ts}" >/dev/null 2>&1

exit 0
