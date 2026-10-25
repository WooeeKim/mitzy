---
name: gui-change
description: Apply one teammate's GUI change request end to end — a Mitzy (믿쥐) screen, component, color, spacing, corner, font, button or copy text, asked in plain words (e.g. "재료 상세 버튼을 삭제로 바꿔줘", "레시피 이름 오타 고쳐줘", "Figma에서 고친 문구 레포에 반영해줘") — by editing the Figma team file and the GitHub repo together, checking the result, and opening a PR. Use this for every GUI change request, whether the person started in Figma or in the repo, so the teammate only types the request and nothing else. Also use it when asked to 수정 반영, 한 줄로 고쳐줘, 양쪽에 반영, or to sync a Figma edit into the repo.
---

# gui-change — 수정 요청 한 줄을 Figma와 레포에 같이 반영

팀원이 할 일은 **무엇을 고칠지 AI에 한 줄로 쓰는 것**뿐이에요. 원본 찾기, 두 곳 반영, 검사, 브랜치, PR은 이 절차대로 AI가 해요. 공통 규칙은 [AGENTS.md](../../../AGENTS.md)에 있고, 이 파일은 순서만 적어요.

## 원본은 항목마다 하나
| 바뀌는 것 | 원본 | 다른 쪽 반영 |
|---|---|---|
| 화면 문구, 재료·레시피 이름·단계·배운 것 (한/영) | 레포 (`scripts/*_src.py`) | Figma `Copy` (copy-sync 절차) |
| 색·간격·모서리·글꼴 (변수) | Figma 변수 | 레포 `design-tokens/tokens.*` (tokens-export 절차) |
| 화면·컴포넌트 배치 | Figma | 레포는 바뀌는 게 없어요 |

요청이 Figma에서 왔든 레포에서 왔든 같은 규칙을 써요. 해당 항목의 원본을 고친 뒤 다른 쪽에 반영해요.

## 순서

### 0. 시작 확인
- Figma MCP가 되는지 확인해요 (`whoami`). 안 되면 팀원에게 "Figma에서 AI 연결을 한 번 해 주세요"라고만 말해요.
- `gh auth status`가 안 되면 팀원에게 "GitHub 로그인을 한 번 해 주세요"라고만 말해요. 이 PC에 `gh`가 없으면 설치부터 안내해요.
- 둘 다 되면 바로 다음 단계로 가요. 팀원에게 확인을 더 묻지 않아요.

### 1. 작업 브랜치 만들기
```bash
scripts/gui.sh start <짧은-이름>   # 예: recipe-button-text
```
커밋 안 된 변경이 있으면 멈춰요. 그 경우 팀원에게 "작업 중인 변경이 있어요"라고만 알리고 끝내요.

### 2. 요청을 원본에 맞춰 분류
요청 문장으로 먼저 판단하고, 애매하면 Figma와 레포를 비교해서 찾아요.

- **문구·데이터** → 3a
- **색·간격·모서리·글꼴** → 3b
- **화면·컴포넌트** → 3c
- **Figma에서 이미 고친 문구를 레포에 반영** → 3d

### 3a. 문구·데이터 고치기 (레포가 원본)
1. 원본 파일을 고쳐요. 한/영을 같이 고쳐요 (`i18n_src.py`, `recipes_src.py`, `en_src.py`, `ingredients_src.py`).
2. `python3 scripts/build.py && python3 scripts/preview.py`로 빌드해요. 경고가 나면 고친 뒤 다시 해요.
3. 4단계로 Figma에 반영해요.

### 3b. 색·간격·모서리·글꼴 고치기 (Figma가 원본)
1. figma-use 스킬을 읽고 `use_figma`로 Figma 변수나 프레임을 고쳐요. 규칙은 AGENTS.md 그대로예요.
2. 변수가 바뀌었으면 `tokens-export` 스킬의 절차로 `design-tokens/tokens.json`을 다시 쓰고 `python3 scripts/tokens_css.py`를 돌려요.

### 3c. 화면·컴포넌트 고치기 (Figma가 원본)
1. figma-use 스킬을 읽고 `use_figma`로 프레임을 고쳐요. 새 부품이 필요하면 `Mitzy/*` 규칙을 따라요.
2. 레포 파일은 바뀌지 않아요. 그래서 PR을 만들지 않고 Figma 반영으로 끝나요. 아래 5단계 검사는 같이 해요.

### 3d. Figma에서 고친 문구를 레포로 가져오기
1. `read-copy.js`를 `use_figma`로 실행하고, 결과를 스크래치 폴더에 `figma-copy.json`으로 저장해요.
2. `python3 scripts/copy_tool.py diff <figma-copy.json>`을 돌려요. `changed`는 Figma와 레포 값이 다른 문구예요.
3. 요청에서 Figma가 새 값이라는 게 분명하면 `changed`의 `figma` 값을 `ref` 위치의 원본에 그대로 넣어요. 고친 뒤 2를 다시 돌려 `changed`가 비었는지 확인해요.
4. `only_figma`(레포에 없는 이름)가 있으면 레포에 새로 만들지 팀원에게 한 번만 물어요. 답이 없으면 그 이름은 건드리지 않아요.
5. 레포가 바뀌었으니 2단계 빌드를 해요. Figma 값은 이미 새 값이라 4단계는 필요 없어요.

### 4. 레포 문구를 Figma에 반영 (3a에서 바뀐 경우만)
`copy-sync` 스킬 절차를 따라요.
1. `scripts/copy_tool.py payload <figma-copy.json>`으로 목록을 만들어요.
2. `apply-copy.js`의 `MODE`를 `'dry'`로 돌려 바뀔 내용을 확인해요. 그다음 `'apply'`로 한 번 더 돌려요. 이 절차는 팀원에게 묻지 않아요. 사람이 할 일이 아니라 AI가 확인하는 일이에요.

### 5. 검사
- `build.py`에 경고가 없어야 해요.
- 바뀐 화면마다 `ds-audit`(오류 0개 목표)과 `check-modes`(다크·영어 확인)를 돌려요. 오류가 남으면 고치고 다시 돌려요.
- 확인 결과는 PR 설명에 한두 줄로 적어요.

### 6. 올리기
```bash
scripts/gui.sh finish "<PR 제목>" <PR 설명 파일>
```
- 레포에 바뀐 파일이 없으면 "Figma에서만 바뀌었어요"라고 끝나요. PR은 만들지 않아요.
- 허용되지 않은 파일이 바뀌었으면 멈춰요. 그 파일을 원래대로 되돌리고 다시 해요.
- `COAUTHOR_LINE`에는 지금 쓰는 AI 모델의 `Co-Authored-By` 줄을 넣어요.
- `gh`가 없으면 스크립트가 PR 링크를 보여줘요. 그 링크를 팀원에게 알려줘요.

### 7. 보고
팀원에게는 세 줄만 말해요.
1. 무엇을 Figma에서 바꿨는지
2. 무엇을 레포에서 바꿨는지 (없으면 "레포는 그대로예요")
3. PR 링크 (있으면)

머지는 레포 관리자가 해요. 팀원이 머지를 기다리지 않아도 돼요.

## 주의
- 같은 항목을 Figma와 레포에서 둘 다 고쳤으면(`changed`인데 요청이 한쪽만 말하지 않을 때) 어느 쪽이 맞는지 팀원에게 한 번만 물어요. 나머지는 묻지 않아요.
- 생성 파일(`data/*.json`, `i18n/*.json`, `data/preview.html`, `design-tokens/tokens.*`)은 손으로 고치지 않아요. 항상 원본에서 다시 만들어요.
- `main`에 직접 올리지 않아요. 항상 `scripts/gui.sh start`로 만든 브랜치에서 작업해요.
- 한 번에 한 요청만 처리해요. 두 요청이 같은 화면이면 먼저 온 요청을 끝낸 뒤 다음 요청을 시작해요.
