---
name: copy-sync
description: Sync screen copy from the repo — scripts/i18n_src.py keys and DB names in data/*.json (ingredients, recipes, categories, onboarding dishes, recipe prep/steps/moments/learn points) — into the Mitzy Figma team file's Copy variables (ko/en modes). Use this whenever i18n_src.py or recipe/ingredient text changed, after merging a PR that touched copy, when Figma screens show old wording or English shows Korean, or when asked to 문구 맞추기 / Copy 동기화 / Figma 문구 업데이트.
---

# copy-sync — 레포 문구 → Figma Copy 변수

화면 문구의 원본은 레포예요(`scripts/i18n_src.py`, `data/*.json`). Figma `Copy` 변수(ko · en 모드)는 그 사본이라, 문구를 바꾸면 이 스킬로 맞춰요. 반대 방향(Figma → 레포)은 하지 않아요. Figma에서 문구를 바꾸고 싶으면 먼저 `i18n_src.py`를 고쳐요.

## 이름 규칙
| 레포 | Figma 변수 |
|---|---|
| i18n 키 `common.next` | `common/next` |
| 재료 이름 | `data/ingredient/<id>` |
| 레시피 이름 | `data/recipe/<id>` |
| 레시피 재료 한 줄 ("밥 1공기") | `data/recipe/<id>/ingredient/<재료 id>` |
| 불 켜기 전 준비 · 순서 · 믿쥐 도움 · 배운 것 | `data/recipe/<id>/prep/<n>` · `step/<n>` · `moment/<단계 번호>` · `learn/<n>` |
| 카테고리 · 온보딩 요리 칩 | `data/category/<영어 slug>` · `data/dish/<영어 slug>` |
| 화면 견본 값 ("06:12", "인덕션 1구") | `sample/*` — 레포에 없어요. 이 스킬은 건드리지 않아요 |

## 순서
Figma MCP가 연결돼 있어야 해요 (`create_session` fileKey `o35yAGSYCSiuumWErSVqO3`, `use_figma` 전에 figma-use 스킬).

1. **빌드**: `python3 scripts/build.py` — 경고 없이 끝나야 해요.
2. **Figma 이름 받기**: [`scripts/list-copy.js`](scripts/list-copy.js)를 `use_figma`로 실행하고, 돌아온 배열을 그대로 파일로 저장해요 (예: 스크래치 폴더의 `copy-names.json`).
3. **목록 만들기**: `python3 scripts/copy_payload.py --existing <copy-names.json>` — 표준 출력의 JSON이 PAYLOAD예요. 마지막 줄(표준 오류)에 개수가 나와요.
   - `data/*`는 Figma에 이미 있는 이름만 남겨요. 화면에 안 쓰는 레시피 단계까지 수백 개를 만들지 않으려는 거예요.
4. **미리 보기**: [`scripts/apply-copy.js`](scripts/apply-copy.js)의 `/*PAYLOAD*/` 자리에 3의 JSON을 통째로 넣고 `MODE = 'dry'`로 실행해요. 아무것도 바뀌지 않고 보고만 해요.
   - `create`: 새 i18n 키, `update`: 값이 바뀐 것, `deleted`: 레포에서 없어졌고 화면에도 안 쓰는 것, `keptInUse`: 레포에서 없어졌는데 화면이 아직 쓰는 것
5. **사람 확인**: 4의 결과를 보여주고 "적용해줘"를 받은 뒤 `MODE = 'apply'`로 다시 실행해요.
6. **확인**: `keptInUse`가 있으면 그 화면의 글자를 새 키로 다시 연결하거나, 키를 지운 게 맞는지 사람에게 물어요. 바꾼 문구가 들어간 화면은 ds-audit의 다크 · 영어 확인으로 봐요.

## 새 레시피를 화면에 넣을 때
화면에 처음 쓰는 레시피의 준비 · 순서 · 배운 것 변수는 아직 없어요. `apply-copy.js`의 `CREATE_DATA`에 앞부분을 넣으면 그것만 만들어요 (예: `['data/recipe/omurice']`).

## 안전장치
- PAYLOAD를 일부만 붙여 넣으면 나머지 문구가 "없어진 것"처럼 보여서, `apply-copy.js`가 실행을 멈춰요. 3의 출력을 통째로 넣어요.
- 화면이 쓰고 있는 변수는 지우지 않아요 (`keptInUse`로만 알려요).
- `apply`는 각 변수 설명(description)에 코드 위치(`t("common.next")` 같은)를 적어요. Dev Mode에서 개발자가 볼 수 있어요.
