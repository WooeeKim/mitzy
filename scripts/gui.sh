#!/usr/bin/env bash
# 수정 요청 한 번의 시작과 끝을 맡아요 (gui-change 스킬이 씀).
#
#   scripts/gui.sh start <짧은-이름>               최신 main에서 gui/ 작업 브랜치 만들기
#   scripts/gui.sh finish "<PR 제목>" <설명 파일>    빌드 → 허용된 파일만 커밋 → 푸시 → PR
#
# finish 환경 변수
#   COAUTHOR_LINE  커밋 끝에 붙일 줄 (예: "Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>")
#   NO_PUSH=1      푸시와 PR을 건너뛰고 커밋까지만 (테스트용)
set -euo pipefail

cmd="${1:-}"
cd "$(git rev-parse --show-toplevel)"

usage() {
  echo '쓰는 법: scripts/gui.sh start <짧은-이름>' >&2
  echo '        scripts/gui.sh finish "<PR 제목>" <PR 설명 파일>' >&2
  exit 1
}

start() {
  local slug="${1:-}"
  [ -n "$slug" ] || usage
  if [ -n "$(git status --porcelain)" ]; then
    echo "커밋 안 된 변경이 있어서 멈췄어요. 아래 파일을 먼저 정리해 주세요." >&2
    git status --short >&2
    exit 1
  fi
  git fetch --quiet origin
  git switch --quiet main
  git pull --ff-only --quiet origin main
  local branch="gui/${slug}-$(date +%Y%m%d-%H%M)"
  git switch -c "$branch" --quiet
  echo "$branch"
}

finish() {
  local title="${1:-}" body="${2:-}"
  if [ -z "$title" ] || [ -z "$body" ] || [ ! -f "$body" ]; then usage; fi

  local branch
  branch=$(git branch --show-current)
  case "$branch" in
    gui/*) ;;
    *) echo "gui/ 로 시작하는 작업 브랜치에서만 실행해요 (지금: $branch). gui.sh start 를 먼저 실행해요." >&2; exit 1 ;;
  esac

  # 생성 파일은 항상 원본에서 다시 만들어요. 손으로 고친 생성 파일은 여기서 되돌아가요.
  local log
  log=$(mktemp)
  trap 'rm -f "$log"' RETURN
  python3 scripts/build.py > "$log" 2>&1 || { cat "$log" >&2; echo "빌드가 실패해서 멈췄어요." >&2; exit 1; }
  if grep -q "경고\|오류" "$log"; then cat "$log" >&2; echo "빌드 경고가 있어요. 고친 뒤 다시 실행해요." >&2; exit 1; fi
  python3 scripts/preview.py > /dev/null

  # 올려도 되는 곳만 담아요. 그 밖의 파일이 바뀌었으면 멈춰요.
  local allowed='^(AGENTS\.md|CLAUDE\.md|README\.md|data/|i18n/|design-tokens/|scripts/|\.claude/skills/|\.claude/launch\.json)'
  local changed bad
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
    local remote
    remote=$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
    echo "gh 로그인이 없어서 PR은 직접 열어야 해요:"
    echo "https://github.com/${remote}/compare/main...${branch}?expand=1"
  fi
}

case "$cmd" in
  start) shift; start "$@" ;;
  finish) shift; finish "$@" ;;
  *) usage ;;
esac
