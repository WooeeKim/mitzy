# 믿쥐 (Mitzy) — Team 3 · ID40003 Interactive System Design

20대 자취생의 요리를 옆에서 봐주는 보조 셰프 **믿쥐(Mitzy)** 과 앱.

## 여기서 볼 것
- `data/preview.html` — 브라우저로 열면 레시피와 재료를 사진과 함께 볼 수 있어요. 오른쪽 위에서 한국어/English를 바꿔요.
- `AGENTS.md` — 팀 작업 규칙이에요. 수정 요청은 AI에 한 줄로 쓰면 돼요.

## 폴더
- `data/` — 재료·레시피 DB (생성 파일), 사진, 출처 ([설명](data/README.md))
- `i18n/` — 앱 화면 문구 한국어·영어 (생성 파일, [설명](i18n/README.md))
- `design-tokens/` — Figma에서 내보낸 디자인 토큰 (생성 파일)
- `scripts/` — DB 원본(`*_src.py`)과 빌드·도구 스크립트
- `.claude/skills/` — AI 작업 절차

## DB 고치는 법
1. `scripts/*_src.py`를 고쳐요. 한국어와 영어를 같이 고쳐요.
2. `python3 scripts/build.py && python3 scripts/preview.py`로 다시 만들어요.
3. `data/preview.html`에서 확인해요.

자세한 규칙은 [AGENTS.md](AGENTS.md)에 있어요.
