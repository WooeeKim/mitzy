# 맛있쥐 (MouseMouth) — AI 작업 규칙

팀원 누구의 AI든 이 레포를 고칠 때 이 파일을 먼저 따라요. Codex · Cursor 같은 AI는 이 파일을 바로 읽고, Claude Code는 `CLAUDE.md`가 이 파일을 불러와요. 폴더 설명은 [README.md](README.md), DB 칸 설명은 [data/README.md](data/README.md)에 있어요.

## 원본만 고치기
생성되는 파일은 직접 고치지 않아요. 원본을 고친 뒤 다시 빌드해요.

| 고칠 것 | 원본 | 생성되는 파일 (직접 수정 금지) |
|---|---|---|
| 재료 · 레시피 (한국어) | `scripts/ingredients_src.py` · `scripts/recipes_src.py` | `data/*.json` · `data/csv/*.csv` |
| 재료 · 레시피 (영어) | `scripts/en_src.py` | 〃 |
| 화면 문구 (한/영) | `scripts/i18n_src.py` | `i18n/ko.json` · `i18n/en.json` |
| 사진 | `scripts/photos.json` · `data/images/` | `data/*.json`의 `photo` |
| 미리보기 모양 | `scripts/preview.py` | `data/preview.html` |
| 디자인 토큰 | Figma 변수 → `tokens-export` 스킬 | `design/tokens.json` → `design/tokens.css` (`python3 scripts/tokens_css.py`) |
| Figma 화면 문구 | `i18n_src.py` · `data/*.json` → `copy-sync` 스킬 | Figma `Copy` 변수 |

```bash
python3 scripts/build.py && python3 scripts/preview.py
```

- `build.py`가 경고나 오류를 내면(한/영 단계 수가 다름, i18n 키 중복, 자리표시 불일치) 고친 뒤 끝내요.
- 생성 파일에서 merge 충돌이 나면 생성 파일끼리 맞추지 말고, 원본 충돌만 풀고 다시 빌드해요.

## 미리보기
- Claude Code: `.claude/launch.json`의 `preview`로 서버를 켜고 `http://localhost:8000/data/preview.html`을 열어요. 원본을 고치고 다시 빌드한 뒤 새로고침하면 바로 보여요.
- 터미널: `python3 -m http.server 8000` 후 같은 주소.
- 오른쪽 위 버튼으로 한국어/English를 바꿔 두 언어 모두 확인해요.

## 팀원이 하는 일: 수정 요청 한 줄
- 팀원이 할 일은 **무엇을 고칠지 AI에 한 줄로 쓰는 것**뿐이에요. 예: "재료 상세 버튼을 삭제로 바꿔줘", "레시피 이름 오타 고쳐줘", "Figma에서 고친 문구 레포에 반영해줘".
- 원본 찾기, Figma와 레포 반영, 검사, 브랜치, PR은 AI가 `.claude/skills/gui-change/SKILL.md` 순서대로 해요. Claude Code가 아닌 AI는 그 파일을 열어 같은 순서로 해요.
- 처음 한 번만: AI에 Figma MCP 연결, GitHub 로그인(`gh auth login`). 이 둘은 팀원 계정에서 한 번만 하면 돼요.
- 머지는 레포 관리자가 해요. 팀원은 PR을 열거나 머지하지 않아요.
- 스크립트: `scripts/gui-start.sh <이름>`(작업 브랜치 만들기), `scripts/gui-finish.sh "<제목>" <설명 파일>`(빌드, 커밋, 푸시, PR).

## 반복 작업 (스킬)
| 할 일 | 스킬 | 언제 |
|---|---|---|
| 화면 규칙 검사 · 다크/영어 확인 | `ds-audit` | Figma를 고친 뒤, Figma를 바꾼 PR을 올리기 전 |
| 레포 문구를 Figma `Copy`에 맞추기 | `copy-sync` | `i18n_src.py` · DB 문구를 바꾼 뒤 |
| 디자인 토큰 내보내기 | `tokens-export` | Figma 변수 · 텍스트 스타일을 바꾼 뒤 |

- Claude Code는 `/ds-audit`처럼 불러요. 다른 AI는 `.claude/skills/<이름>/SKILL.md`를 읽고 같은 순서로 해요. 셋 다 Figma MCP 연결이 필요해요.
- Figma에 쓰는 실행 코드는 각 스킬의 `scripts/` 폴더에 있어요. 고칠 땐 스킬 파일을 고치고 PR로 올려요.

## 디자인 기준
- **Figma 팀 파일 (기준)**: [시디 GUI](https://www.figma.com/design/o35yAGSYCSiuumWErSVqO3/GUI) — 화면 · 변수 · 컴포넌트는 여기만 고쳐요.
- **개인 파일**: [w07 GUI](https://www.figma.com/design/Jo9yKP6UmTZn5xtd0doT2z/-w07--GUI) — 옮기기 전 원본이에요. 팀 파일은 더 이상 이 파일의 컴포넌트를 참조하지 않아요(`LG/*` 0개). 기록용으로만 남겨두고 여기서 작업하지 않아요.
- **Figma 라이브러리**: 팀 파일에는 iOS and iPadOS 27만 켜 둬요. iOS 26 · macOS 키트는 쓰지 않아요.
- **iOS 기준**: [iOS and iPadOS 27 (Community)](https://www.figma.com/design/NXgKUsG67Nu5Q2UddrTRQi/iOS-and-iPadOS-27--Community-) — 시스템 요소(Status Bar, Tab Bar, Toggle, Segmented Control, Liquid Glass 버튼·재질)는 이 키트 컴포넌트를 그대로 써요.
- **폰트: 최종은 Pretendard, Figma 작업 중에는 Noto Sans KR**
  - AI가 Figma를 고치는 환경(Figma 원격 MCP)에는 Pretendard가 없어서 Pretendard 글자는 AI가 고칠 수 없어요. 그래서 Figma 텍스트 스타일은 작업하는 동안 Noto Sans KR로 둬요.
  - 텍스트 스타일 15개는 모두 `Type` 변수에 묶여 있어요. 확정할 때 사람이 `font/family`를 `Pretendard`, `font/weight/semibold`를 `SemiBold`로 바꾸면 전부 바뀌어요. AI 작업이 다시 필요하면 되돌려요.
  - 웹은 Pretendard예요. jsDelivr의 `pretendard@v1.3.9` variable dynamic subset을 쓰고 `"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif` 순서로 적어요.
  - SF Pro는 웹에 올리지 않아요 (Apple 라이선스).
- **아이콘**: SF Symbols 글자(􀊄 같은)는 Figma 안에서만 써요. 웹에는 넣지 않아요 (라이선스, SF Pro 없으면 안 보임).
- Figma 변수는 4묶음이에요: `Color`(iOS 27 시스템 색을 가리키는 별칭) · `Size`(space · radius · touch) · `Type`(글꼴) · `Copy`(ko/en, 화면 문구 = `i18n_src.py` 키 + DB 이름). 색 · 간격 · 모서리는 변수, 글자는 텍스트 스타일(iOS 27 이름 15개 + SF Symbols용 `Icon/*` 4개)로만 써요. 직접 값을 넣지 않아요.
- Light/Dark는 프레임의 iOS 27 `Colors` 모드 하나로 바꿔요. 우리 색, 키트 컴포넌트, Liquid Glass가 같이 바뀌어요. 요리 중 화면은 Dark예요.
- 강조색 파랑 `color/accent`(→ iOS `Accents/Blue`)는 **사진 위 선택 표시(재료 타일 체크)에만** 써요. 파랑 위 체크 · 테두리는 `color/on-accent`(→ iOS `Grays/White`). 칩 · 버튼 등 나머지 "선택됨"은 검정 유리(`color/fg`)예요. 다른 곳에 파랑이 필요하면 먼저 이 규칙을 팀과 바꿔요.
- 유리 재질은 iOS 27 키트의 Liquid Glass 컴포넌트로 써요. 따로 효과 스타일을 만들지 않아요.
- 맛있쥐 전용 컴포넌트는 `02 Components`의 `Mitzy/*` 20개예요 (Button · Icon Button · Nav Button · Cooking Button · Chip · Ingredient Tile · Ingredient Token · Dish Tile · Recipe Card · List Row · Info Row · Step Row · Status Pill · Notice · Tab Bar · Segmented · Stat Row · Card · Photo Check · Search Field). Status Bar · Home Indicator · Grabber · 아이콘 내비 버튼(뒤로 · 닫기) · Toggle · 진행 막대 · 스크롤 끝 효과는 iOS 27 키트 컴포넌트를 그대로 써요. 글자 내비 버튼은 `Mitzy/Nav Button`, 탭 바는 `Mitzy/Tab Bar`, 목록 줄은 `Mitzy/List Row`, 라벨–값 줄은 `Mitzy/Info Row`, 보기 · 모드 전환은 `Mitzy/Segmented`(선택 = `color/fg` 알약), 제목 아래 사실 2–3개는 `Mitzy/Stat Row`, 검색창은 `Mitzy/Search Field`, 카드 안 목록 한 줄(준비 · 순서 · 배운 것)은 `Mitzy/Step Row`.
- 직접 만드는 판(정보 카드, 시트, 트레이, 말풍선 같은 것)은 프레임(배치 · 여백 토큰) + 맨 아래 `Mitzy/Card`(유리 배경, STRETCH)로 만들어요. 모양은 Card(작은 유리, 기본 `radius/card`) · Panel(큰 유리: 시트 · 트레이 · 메뉴, 기본 `radius/panel`) · Pill(`radius/full`) · Thumb(`radius/thumb`). 판 모서리가 기본값과 다르면 인스턴스의 유리 모서리도 같은 값으로 맞춰요. 검은 배지처럼 강조된 유리는 키트 Prominent 유리를 그대로 써요.
- 화면 아래 버튼: 하나만 있으면 `Mitzy/Button` Prominent(검정, 다크에선 흰색)예요. 두 개면 주 행동만 Prominent, 보조 행동은 Glass(예: 날짜 모름 / 저장, 자랑하기 / 도감 보기). 빼기 같은 행동도 화면의 유일한 행동이면 Prominent예요.
- 크기: 누르는 것의 높이는 `touch/min`(44: 칩 · 세그먼트 · 목록 줄 최소)과 `touch/control`(50: Button · Nav Button · Icon Button · Search Field, 키트 유리 버튼과 같은 높이) 두 가지예요. 요리 중 버튼은 `touch/cooking`(135).
- 모서리는 iOS 27 키트 값을 따르고, 안쪽 모서리는 바깥과 동심원이에요(안쪽 = 바깥 − 여백). 반복되는 값만 토큰이에요: 알약 · 원형 `radius/full`, 카드 안 아이콘 칸 `radius/icon`(10 = 26 − 16), 사진 썸네일 `radius/thumb`(22), 정보 카드 `radius/card`(26), 시트 `radius/panel`(40), 말풍선 `radius/bubble`(16) + 꼬리 `radius/bubble-tail`(4). 메뉴 28, 하단 트레이 36, 작은 카드 24, 큰 사진 28–34처럼 키트 · 기기 모서리에서 나온 값은 토큰으로 반올림하지 않고 그대로 써요.
- 사진 위 선택 표시(재료 타일 · 사진 고르기 · 대표 사진)는 사진을 35% 어둡게(`color/overlay` 35%) + `Mitzy/Photo Check`. 체크 중심은 사진 모서리 곡선의 중심이에요(오른쪽 · 아래 간격 = 사진 모서리 반지름 − 12). 사진 프레임은 자르기(clip)를 켜서 어둡게 덮는 층도 같은 모서리로 잘려요.
- 요리 중 화면 레이아웃은 "고정 스택"이에요: 위 정보 → 안내 칸(76 고정) → 주 버튼(남는 높이) → 길게 누르는 보조 버튼(135) → 안내 문구. 상태가 바뀌어도 칸과 버튼 자리는 그대로예요. 진행 중 안내 칸은 왼쪽에 할 일, 오른쪽에 단계(3 / 5)예요. 경과 시간은 시계 아이콘 + 시간만 보여줘요.
- **글자 배치**
  - 정보를 가운데 점(·)으로 잇지 않아요. 사실 2–3개는 `Mitzy/Stat Row`(라벨은 위, 값은 아래), 값과 보조 값 두 개는 좌우 배치(예: 왼쪽 "10월 7일", 오른쪽 "4일 전"), 카드처럼 좁은 곳은 SF Symbol + 값, 문장은 마침표로 나눠요. "유제품·계란"처럼 낱말을 나란히 적는 가운뎃점은 괜찮아요.
  - 간격은 `space/*` 토큰만 써요. 부품 안은 4 · 8 · 12 · 16 · 20 · 24, 화면 배치(큰 덩어리 사이)는 32 · 48. 아이콘 + 글자 한 쌍은 4(작은 아이콘) 또는 8, 줄 안의 아이콘 칸 · 번호와 글자는 12, 섹션 위 여백은 24예요.
  - 네비 버튼 아래 첫 콘텐츠는 16, 제목과 바로 아래 메타 한 줄은 `space/4`, 제목과 `Mitzy/Stat Row`는 `space/12`, 라벨과 값 사이는 0이에요. 카드 세로 여백 4 + 줄 여백 12 = 가장자리에서 16.
  - 예외: `Mitzy/Tab Bar` 안쪽 수치와 화면 프레임 모서리(50)는 iOS 기기 수치를 따라요.
  - 할 일 · 배운 것 목록은 모두 같은 모양이에요: 유리 카드(세로 여백 4, 가로 16) 안에 `Mitzy/Step Row`, 줄 사이 구분선(글자 시작점부터), 마지막 줄은 구분선 없음. 표시만 달라요: 불 켜기 전 준비 = 회색 번호, 순서 = 검은 번호(믿쥐 도움 줄은 Show Help), 배운 것 = 전구 아이콘. 빈 원은 눌러서 체크하는 것처럼 보여서 쓰지 않아요.
  - 편집 중 재료 칩은 칩 전체(44)가 빼기 버튼이고, × 배지(22)는 표시용이에요.
- **Figma를 AI로 고칠 때 주의**
  - 키트 컴포넌트에 화면에서 직접 색을 덮어쓰지 않아요. Colors 모드를 Dark로 바꾸면 키트 안쪽이 다른 변형으로 바뀌면서 덮어쓴 색이 풀려요(예: 파랑으로 돌아감). 색을 바꿔야 하면 `Mitzy/*` 컴포넌트 안에서 정해요.
  - 화면의 부품을 다른 컴포넌트로 바꿀 때 `swapComponent` 대신 새 인스턴스를 넣고, 속성과 Copy 연결을 다시 걸어요. swap한 인스턴스는 다크에서 색이 풀릴 수 있어요.
  - 다크 · 영어 확인은 프레임 복제본이 아니라 실제 프레임에 모드를 잠깐 걸고 확인한 뒤 되돌려요. 복제본은 덮어쓴 값이 빠져서 틀리게 보여요.
  - iOS 26 키트 부품을 iOS 27로 swap하면 옛 키트 색 변수로 덮어쓴 값이 남아서 다크에서 안 바뀔 수 있어요. swap한 키트 인스턴스는 `resetOverrides()` 후 필요한 값(아이콘 글리프 등)만 다시 넣어요.
  - 자동 레이아웃 프레임에 `resize()`를 쓰면 크기 모드가 둘 다 고정(FIXED)으로 바뀌어요. 내용에 맞춰야 하면 다시 AUTO로 돌려요.
  - space-between 줄은 폭을 FILL(또는 고정)로 둬요. 폭이 내용에 맞춰지면 나눌 공간이 없어 간격이 0이 돼요.
  - 컴포넌트 텍스트 속성 연결(`componentPropertyReferences`)은 글자를 컴포넌트 안에 넣은 뒤에 걸어요. 변형 속성 값은 문자열이에요("True" · "False").
  - 화면을 지우거나 옮기기 전에 원본인지 확인해요. 비교용 사본은 이름 끝에 "/ 수정01"처럼 붙여서 원본과 헷갈리지 않게 해요.
  - 토글 켜짐은 iOS 기본 초록 그대로 써요. 진행 막대의 채운 부분은 `color/fg`(키트 기본 파랑 대신). 진행 막대는 다크에서 내부 변형이 바뀌지 않아서 이 덮어쓰기는 유지돼요.
- 화면 문구는 컴포넌트 텍스트 속성이나 텍스트를 `Copy` 변수에 연결해요. 그러면 프레임의 Copy 모드(ko/en)만 바꿔도 영어 화면이 돼요.
- `Copy` 변수는 레포 문구에서 만들어요. 문구를 바꾸면 `i18n_src.py`를 고치고 Figma `Copy`도 같이 맞춰요.

## 협업
- `main`에 바로 올리지 않고 브랜치 → PR로 올려요. PR 설명에 고친 원본 파일과 미리보기에서 확인한 화면을 적어요.
- 커밋 전에 빌드를 돌려서 생성 파일이 원본과 맞는지 확인해요.
- Figma를 바꾼 PR에는 `ds-audit` 결과(오류 0)와 바꾼 화면의 다크 · 영어 확인을 적어요.
- 같은 Figma 화면을 두 사람(두 AI)이 동시에 고치지 않아요. 고치는 동안 화면 이름 앞에 "작업 중: 이름"을 붙여요.
- 문구는 한국어 · 영어를 같이 고쳐요 (`i18n_src.py`에 나란히 있어요). 한국어 조사 규칙은 README의 한/영 전환 항목을 따라요.
