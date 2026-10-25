#!/usr/bin/env bash
# 수정 요청을 마칠 때 쓰는 스크립트 (gui-change 스킬 마지막 단계).
# 레포 변경이 있으면 빌드 → 커밋 → 푸시 → PR 생성까지 해요. 없으면 Figma만 바뀐 거라 아무것도 올리지 않아요.
#
#   scripts/gui-finish.sh "<PR 제목>" <PR 설명 파일>
#
# 환경 변수
#   COAUTHOR_LINE  커밋 끝에 붙일 줄 (예: "Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>")
#   NO_PUSH=1      푸시와 PR을 건너뛰고 커밋까지만 (테스트용)
set -euo pipefail

title="${1:-}"; body="${2:-}"
if [ -z "$title" ] || [ -z "$body" ] || [ ! -f "$body" ]; then
  echo '쓰는 법: scripts/gui-finish.sh "<PR 제목>" <PR 설명 파일>' >&2
  exit 1
fi

cd "$(git rev-parse --show-toplevel)"
branch=$(git branch --show-current)
case "$branch" in
  gui/*) ;;
  *) echo "gui/ 로 시작하는 작업 브랜치에서만 실행해요 (지금: $branch). scripts/gui-start.sh 를 먼저 실행해요." >&2; exit 1 ;;
esac

# 생성 파일은 항상 원본에서 다시 만들어요. 손으로 고친 생성 파일은 여기서 되돌아가요.
log=$(mktemp)
trap 'rm -f "$log"' EXIT
python3 scripts/build.py > "$log" 2>&1 || { cat "$log" >&2; echo "빌드가 실패해서 멈췄어요." >&2; exit 1; }
if grep -q "경고\|오류" "$log"; then cat "$log" >&2; echo "빌드 경고가 있어요. 고친 뒤 다시 실행해요." >&2; exit 1; fi
python3 scripts/preview.py > /dev/null

# 올려도 되는 곳만 담아요. 그 밖의 파일이 바뀌었으면 멈춰요.
allowed='^(AGENTS\.md|CLAUDE\.md|README\.md|data/|i18n/|design/|scripts/|\.claude/skills/)'
changed=$( (git diff --name-only; git ls-files --others --exclude-standard) | sort -u )
if [ -z "$changed" ]; then
  echo "레포에 바뀐 파일이 없어요. Figma에서만 바뀐 수정이라 올릴 게 없어요."
  exit 0
fi
bad=$(echo "$changed" | grep -Ev "$allowed" || true)
if [ -n "$bad" ]; then
  echo "허용되지 않은 파일이 바뀌어서 멈췄어요:" >&2
  echo "$bad" >&2
  exit 1
fi

echo "$changed" | xargs git add --
git commit -q -F - <<EOF
$title

${COAUTHOR_LINE:-}
EOF
echo "커밋: $(git log --oneline -1)"

if [ "${NO_PUSH:-0}" = "1" ]; then
  echo "NO_PUSH=1 이라 푸시와 PR은 건너뛰었어요."
  exit 0
fi

git push -q -u origin "$branch"

if command -v gh > /dev/null 2>&1 && gh auth status > /dev/null 2>&1; then
  gh pr create --base main --head "$branch" --title "$title" --body-file "$body"
else
  remote=$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
  echo "gh 로그인이 없어서 PR은 직접 열어야 해요:"
  echo "https://github.com/${remote}/compare/main...${branch}?expand=1"
fi
