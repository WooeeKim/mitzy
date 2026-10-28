# 믿쥐 (Mitzy) — Team 3 · ID40003 Interactive System Design

20대 자취생의 요리를 옆에서 봐주는 보조 셰프 **믿쥐(Mitzy)** 과 앱.

## 여기서 볼 것
- **[화면 프로토타입](https://wooeekim.github.io/mitzy/screens/index.html)** — Figma 화면을 눌러볼 수 있게 옮긴 웹 프로토타입이에요. `main`에 머지되면 자동으로 바뀌어요. (원본 `screens/`)
- **[DB 미리보기](https://wooeekim.github.io/mitzy/data/preview.html)** · `data/preview.html` — 브라우저로 열면 레시피와 재료를 사진과 함께 볼 수 있어요. 오른쪽 위에서 한국어/English를 바꿔요.
- `AGENTS.md` — 팀 작업 규칙이에요. 수정 요청은 AI에 한 줄로 쓰면 돼요.

## 파일 찾기
| 찾는 것 | 어디 | 고치는 법 |
|---|---|---|
| 재료·레시피 내용 | `scripts/ingredients_src.py`, `scripts/recipes_src.py`, `scripts/en_src.py` | AI에 요청 |
| 화면 문구 (한/영) | `scripts/i18n_src.py` | AI에 요청 |
| 사진 | `scripts/photos.json`, `data/images/` | 개발자에게 요청 |
| 작업 규칙 | `AGENTS.md` | 팀 합의 후 PR |
| 디자인 값 (색·간격·글꼴) | `design-tokens/` | Figma에서 바꾸고 AI에 요청 |
| 화면 프로토타입 (웹) | `screens/` — Figma 03 Screens를 옮겨서 눌러볼 수 있게 만든 것. 미리보기 서버에서 `/screens/index.html` | 개발자 |
| 생성 파일 (보기만) | `data/*.json`, `i18n/*.json`, `data/preview.html`, `design-tokens/tokens.css` | 직접 고치지 않음 (빌드가 만듦) |
| 빌드·도구 스크립트 | `scripts/build.py`, `preview.py`, `copy_tool.py`, `tokens_css.py`, `gui.sh` | 개발자 |
| AI 설정 | `.claude/`, `CLAUDE.md` | 몰라도 됨 (개발자용) |

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
