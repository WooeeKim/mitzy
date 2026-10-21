# 맛있쥐 (MouseMouth) — Team 3 · ID40003 Interactive System Design

20대 자취생의 요리를 옆에서 봐주는 보조 셰프 **수솊(Mitzy)** 과 앱.

## 폴더
- `data/` — 앱과 수솊 AI가 쓰는 재료·레시피 DB (설명은 [`data/README.md`](data/README.md))
  - `preview.html` — 브라우저로 열면 레시피 37개·재료 50개를 사진과 함께 볼 수 있어요
  - `csv/` — 엑셀·구글 시트로 열어보는 표
- `scripts/` — DB 원본과 빌드 스크립트

## DB 고치는 법
1. `scripts/recipes_src.py` 또는 `scripts/ingredients_src.py` 수정
2. `python3 scripts/build.py && python3 scripts/preview.py`
3. `data/` 안의 JSON·CSV·미리보기가 같이 갱신돼요
