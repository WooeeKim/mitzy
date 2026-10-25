---
name: tokens-export
description: Export the Mitzy Figma team file's design variables — Color (resolved for iOS 27 Light and Dark), Size (space, radius, touch) and Type, plus text styles — to design-tokens/tokens.json and generate design-tokens/tokens.css for the web with scripts/tokens_css.py. Use this whenever Figma variables or text styles changed (색 · 간격 · 모서리 · 글꼴 · 텍스트 스타일), before front-end or prototype work that needs design values in code, or when asked for 토큰 내보내기 / design tokens / CSS 변수.
---

# tokens-export — Figma 변수 → design-tokens/tokens.json · tokens.css

디자인 값의 원본은 Figma 팀 파일(`o35yAGSYCSiuumWErSVqO3`)의 변수예요. 이 스킬로 레포에 사본을 만들어요. `design-tokens/tokens.json`과 `design-tokens/tokens.css`는 생성 파일이라 직접 고치지 않아요.

## 순서
Figma MCP가 연결돼 있어야 해요 (`create_session`, `use_figma` 전에 figma-use 스킬).

1. [`scripts/read-tokens.js`](scripts/read-tokens.js)를 `use_figma`로 실행해요.
   - 색은 iOS 27 Colors의 Light · Dark로 각각 풀어서 실제 값(`#rrggbb` 또는 투명도까지 `#rrggbbaa`)을 적어요. 값을 풀려고 임시 프레임 2개를 만들고 바로 지워요.
   - `Icon/*` 텍스트 스타일(SF Symbols)은 웹에 쓰지 않아서 빼요.
2. 돌아온 JSON 문자열을 그대로 `design-tokens/tokens.json`에 저장해요.
3. `python3 scripts/tokens_css.py` → `design-tokens/tokens.css`가 생겨요.
4. `git diff design-tokens/`로 바뀐 값을 사람에게 보여줘요. 예상하지 못한 변화(색이 통째로 바뀜, 토큰이 사라짐)가 있으면 Figma 변수가 실수로 바뀐 건 아닌지 물어요.

## tokens.css 쓰는 법 (웹)
- 색: `var(--color-fg)` 등. 다크는 `prefers-color-scheme: dark` 또는 `<html data-theme="dark">`.
- 크기: `var(--space-16)`, `var(--radius-card)`, `var(--touch-min)`.
- 글자: `.text-headline-regular`처럼 텍스트 스타일 이름 클래스. 글꼴은 Figma 작업용(Noto Sans KR)이 아니라 웹 최종 글꼴 Pretendard예요 (`--font-sans`).
- 굵기 이름은 역할로 나가요 (`regular` 400 · `semibold` 600 · `bold` 700). Figma에선 작업 중이라 semibold가 Noto의 Medium으로 보여도 웹은 600이에요.

## 하지 않는 것
- SF Symbols 글리프 · SF Pro 글꼴은 웹에 넣지 않아요 (라이선스).
- Copy 문구는 이 스킬이 아니라 copy-sync가 맡아요 (방향도 반대예요: 레포 → Figma).
