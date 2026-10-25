---
name: ds-audit
description: Audit the Mitzy (믿쥐) Figma team file screens against the design-system rules in AGENTS.md — text not linked to Copy variables, raw colors, spacing/padding off the space tokens, corner radii, middle-dot (·) meta lines, detached or missing components, kit glass used directly — and check screens in Dark and English on the real frames. Use this whenever someone asks to 검사/점검/audit the GUI or a screen, asks whether Figma screens follow the rules (규칙, 토큰, 연결 안 된 글자, 다크/영어 확인), after any AI or manual edit to the Figma file, and before opening a PR that changed Figma.
---

# ds-audit — Figma 화면 규칙 검사

시디 GUI 팀 파일(`o35yAGSYCSiuumWErSVqO3`)의 `03 Screens` 화면이 [AGENTS.md](../../../AGENTS.md)의 디자인 규칙을 지키는지 확인해요. 검사는 읽기만 해요. 고치는 건 결과를 보여준 뒤 사람이 정하면 해요.

## 준비
- Figma MCP가 연결돼 있어야 해요. 먼저 `create_session`(fileKey `o35yAGSYCSiuumWErSVqO3`)을 부르고, `use_figma` 전에 figma-use 스킬(또는 `skill://figma/figma-use/SKILL.md`)을 읽어요.
- 다른 AI도 같은 순서로 하면 돼요. Figma MCP의 `use_figma`에 아래 파일 내용을 붙여 넣는 방식이에요.

## 1. 규칙 검사
[`scripts/audit.js`](scripts/audit.js)를 `use_figma`의 code로 그대로 실행해요.
- 고친 화면만 보려면 맨 위 `FRAME_IDS`에 화면 id를 넣어요. 비우면 28개 화면을 다 봐요.
- 결과는 화면별 `errors`(꼭 고칠 것)와 `warnings`(확인할 것)예요.

| 항목 | 단계 | 왜 |
|---|---|---|
| 직접 넣은 색, 텍스트 스타일 없음, 토큰 밖 간격 · 여백, 폭이 내용에 맞춰진 space-between 줄 | 오류 | 다크 모드 · 토큰 내보내기 · 코드와 어긋나요 |
| Copy 연결 없는 글자 · 속성 | 경고 | 영어로 바꿔도 한국어가 남아요. 번호 · 시간 · SF Symbols는 빼고 봐요 |
| 토큰 값인데 안 묶인 간격 · 모서리 | 경고 | 값은 맞지만 토큰이 바뀌면 따라가지 않아요 |
| 키트 · 동심원 값이 아닌 모서리 | 경고 | 메뉴 28, 트레이 36, 작은 카드 24처럼 키트 값이면 괜찮아요 |
| 가운데 점(" · ")으로 이은 문구 | 경고 | 정보 행 · 좌우 배치 · 문장으로 나눠요 ("유제품·계란"처럼 띄어쓰기 없는 건 괜찮아요) |
| 인스턴스 이름인데 프레임, 키트 유리를 바로 씀 | 경고 | 분리된 컴포넌트이거나 `Mitzy/Card`로 바꿀 곳이에요 |

알려진 예외(경고로 나와도 괜찮은 것):
- 도감의 "제육" 같은 요리 표시 글자(Dish Tile `Mark`)는 한국어로 둬요.
- 환영 화면의 큰 유리 원(Hero Glass Disc)은 키트 Large 유리라서 `Mitzy/Card` 대상이 아니에요.

## 2. 다크 · 영어 확인
[`scripts/check-modes.js`](scripts/check-modes.js)의 `FRAME_IDS`에 고친 화면을 넣고 실행해요. 실제 프레임에 Dark · English 모드를 잠깐 걸어 스크린샷을 찍고, 끝나면 원래 모드로 되돌려요.
- 복제본으로 확인하지 않아요. 복제하면 덮어쓴 값이 빠져서 틀리게 보여요.
- 한 번에 5장까지만 돌아오니 화면이 많으면 나눠서 돌려요.
- 볼 것: 글자 · 아이콘이 배경에 묻히지 않는지, 영어가 넘치거나 잘리지 않는지, 검정 버튼이 다크에서 흰색으로 바뀌는지.

## 결과 보고
사람에게는 이렇게 짧게 알려요.
1. 검사한 화면 수, 오류 수, 경고 수
2. 오류: 화면 이름 → 레이어 → 무엇이 문제인지 → 고치는 법 (예: "직접 넣은 색 → `color/on-photo`에 묶기")
3. 경고 중 실제로 고칠 것만 (알려진 예외는 빼요)
4. 다크 · 영어 스크린샷에서 보인 문제

고치기는 사람이 "고쳐줘"라고 한 뒤에 해요. 고친 다음엔 같은 화면만 다시 검사해서 0개가 됐는지 확인해요.
