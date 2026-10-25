# 맛있쥐 (MouseMouth) — Team 3 · ID40003 Interactive System Design

20대 자취생의 요리를 옆에서 봐주는 보조 셰프 **믿쥐(Mitzy)** 과 앱.

## 폴더
- `data/` — 앱과 믿쥐 AI가 쓰는 재료·레시피 DB (설명은 [`data/README.md`](data/README.md))
  - `preview.html` — 브라우저로 열면 레시피 37개·재료 50개를 사진과 함께 볼 수 있어요
  - `csv/` — 엑셀·구글 시트로 열어보는 표
- `i18n/` — 앱 화면 문구 한국어 `ko.json` · 영어 `en.json` (한/영 전환용)
- `scripts/` — DB 원본과 빌드 스크립트
- `design/` — Figma 변수에서 내보낸 디자인 토큰 `tokens.json` · 웹용 `tokens.css` (생성 파일)
- `AGENTS.md` — 팀원 AI가 따르는 작업 · 디자인 규칙 (Claude Code는 `CLAUDE.md`가 불러와요)
- `.claude/skills/` — 반복 작업 절차: `ds-audit`(Figma 화면 검사) · `copy-sync`(문구 → Figma) · `tokens-export`(Figma → 토큰)

## DB 고치는 법
1. `scripts/recipes_src.py` · `scripts/ingredients_src.py` (한국어), `scripts/en_src.py` (영어), `scripts/i18n_src.py` (화면 문구) 수정
2. `python3 scripts/build.py && python3 scripts/preview.py`
3. `data/` 안의 JSON·CSV·미리보기, `i18n/` 이 같이 갱신돼요 (`preview.html` 오른쪽 위에서 한국어/English 전환)

## 한/영 전환 (i18n)
Figma GUI의 한국어 페이지(iOS 26 Liquid Glass)와 영어 페이지(iOS 26 Liquid Glass (EN))에서 화면별 문구를 뽑아 짝을 맞췄어요.

- **화면 문구** → `i18n/ko.json` · `i18n/en.json`. 키는 화면 단위예요 (`onboarding.welcome.title`, `fridge.use_soon`, `cooking.watching` …). 한국어·영어는 `scripts/i18n_src.py` 한 파일에 나란히 적혀 있어서 같이 고치면 돼요.
- **레시피·재료 내용** → DB의 `_en` 칸 ([`data/README.md`](data/README.md#한영-전환)).
- 형식은 [i18next](https://www.i18next.com) 기준이에요. React Native·웹이면 그대로, Swift·Flutter면 같은 키로 옮기면 돼요.
  - `{{count}}`, `{{name}}` 같은 자리는 앱이 값을 채워요. `t("recipe.stat.burners_value", { count: 1 })`
  - 키 끝 `_one` / `_other`는 영어 단수·복수용이에요 ("1 moment" / "3 moments"). i18next는 `count`만 넘기면 알아서 골라요.
  - 날짜는 `common.date`에 한국어 `{{month}}월 {{day}}일`, 영어 `{{monthShort}} {{day}}`(Oct 7)로 따로 넘겨요.
- 한국어 조사: `fridge.removed`("{{name}}를 뺐어요"), `fridge.detail.dishes`("{{name}}으로 …")는 이름 끝 받침에 따라 을/를, 으로/로가 바뀌어요. 앱에서 받침을 확인해 고치거나 [es-hangul](https://es-hangul.slash.page) 같은 라이브러리를 쓰세요.
- 설정 화면에 언어 바꾸기 줄을 넣을 때 쓰라고 `common.language` · `language_ko` · `language_en`을 넣어뒀어요 (Figma엔 아직 없음).
