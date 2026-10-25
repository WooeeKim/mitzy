#!/usr/bin/env bash
# 수정 요청을 시작할 때 쓰는 스크립트 (gui-change 스킬 1단계).
# 최신 main을 받고, 작업용 브랜치를 만들어요. 커밋 안 된 변경이 있으면 멈춰요.
#
#   scripts/gui-start.sh <짧은-이름>        예: scripts/gui-start.sh recipe-button-text
set -euo pipefail

slug="${1:-}"
if [ -z "$slug" ]; then
  echo "쓰는 법: scripts/gui-start.sh <짧은-이름>" >&2
  exit 1
fi

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "커밋 안 된 변경이 있어서 멈췄어요. 아래 파일을 먼저 정리해 주세요." >&2
  git status --short >&2
  exit 1
fi

git fetch --quiet origin
git switch --quiet main
git pull --ff-only --quiet origin main

branch="gui/${slug}-$(date +%Y%m%d-%H%M)"
git switch -c "$branch" --quiet
echo "$branch"
