# 믿쥐 DB — 재료 · 레시피 · 사진

앱 화면(FigJam "[시디] Ideation" 보드의 GUI 섹션)과 믿쥐 AI가 같이 읽는 데이터예요.
JSON이 원본이에요. 팀원은 `preview.html`로 보면 돼요.

| 파일 | 내용 | 쓰는 화면 |
|---|---|---|
| `ingredients.json` | 재료 50개 | 냉장고 · 재료 검색 · 재료 상세 |
| `recipes.json` | 레시피 37개 (1인분) | 레시피 추천 · 레시피 상세 · 요리 중 · 리포트 |
| `onboarding_dishes.json` | "레시피 없이 할 수 있는 요리" 칩 11개 | 온보딩 요리 경험 |
| `meta.json` | 믿쥐 순간 타입, 레벨 설명, 카테고리 목록 | 공통 |

데이터를 고칠 때는 `scripts/` 원본을 고친 뒤 `python3 scripts/build.py`를 다시 돌리면 JSON이 갱신돼요.

## 한/영 전환
글자가 들어가는 칸마다 영어 칸이 `_en`으로 붙어 있어요. 앱은 언어 설정에 따라 `name` 또는 `name_en`을 고르면 돼요.

```js
const t = (obj, key) => lang === "en" ? obj[key + "_en"] : obj[key];
t(recipe, "name")            // "갈릭치킨볶음밥" / "Garlic Chicken Fried Rice"
t(step.sous_chef, "say")     // 믿쥐 대사
```

| 파일 | 영어 칸 |
|---|---|
| `ingredients.json` | `name_en` `category_en` `storage_en` `note_en` |
| `recipes.json` | `name_en` `method_en` `tools_en` `prep_en` `learn_points_en`, 재료마다 `label_en`("1 bowl rice"처럼 양까지 한 줄), 단계마다 `text_en`, 믿쥐 순간마다 `label_en` `cue_en` `say_en` |
| `onboarding_dishes.json` | `chip_en` `skills_en` |
| `meta.json` | `moment_types_en` `levels_en` `categories_en`, `methods`·`tools`(한↔영 표) |

- 영어 이름·문구는 Figma 팀 파일의 영어 화면(Copy 영어 모드)에 맞췄어요. 이름은 한국어 **믿쥐**, 영어 **Mitzy**예요.
- 영어 원본은 `scripts/en_src.py`예요. 한국어 단계 수와 영어 단계 수가 다르거나, 믿쥐 순간이 한쪽에만 있으면 `build.py`가 멈추고 알려줘요.
- 버튼·제목 같은 **화면 문구**는 DB가 아니라 저장소 맨 위 `i18n/` 폴더에 있어요.

---

## 재료 (`ingredients.json`)

```json
{
  "id": "chicken_leftover",
  "name": "치킨",
  "category": "육류",
  "shelf_days": 2,
  "storage": "냉장",
  "is_pantry": false,
  "note": "남은 배달 치킨. 육류는 보통 냉장 1~2일",
  "photo": { "url": "...", "thumb": "...", "credit": "...", "credit_url": "...", "source_url": "...", "license": "Unsplash License" }
}
```

- **category**: 채소 · 육류 · 유제품·계란 · 기타 · 양념 · 곡류 · 주류 (Figma "내 냉장고" 화면과 같은 이름·순서. 두부·스팸·김치 등은 기타, 면·떡·가루는 곡류)
- **shelf_days**: 등록한 날부터 며칠 지나면 "곧 상해요"를 띄울지 정하는 기준이에요. `null`이면 오래 가는 재료라 계산에서 빼요.
- **is_pantry**: 소금·간장·식용유 같은 상비 양념이에요. 레시피 추천에서 "모자란 재료"로 세지 않아요.
- **치킨** = 남은 배달 치킨이에요. 화면의 갈릭치킨볶음밥이 "치킨 겉 데우기"라서 생닭이 아니라 이미 익은 치킨으로 잡았어요. 생닭은 `chicken_thigh`(닭다리살)예요.

### "곧 상해요" 규칙
1. 사용자가 포장지 소비기한을 입력했으면 → 그 날짜 2일 전부터 표시
2. 입력 안 했으면 → `등록한 날 + shelf_days` 의 2일 전부터 표시
3. `shelf_days`가 `null`이면 표시하지 않음

재료 상세 시트 문구("등록 4일째 · 육류는 보통 냉장 1~2일 보관해요")는 `shelf_days`와 `storage`로 만들면 돼요.

---

## 레시피 (`recipes.json`)

```json
{
  "id": "garlic_chicken_fried_rice",
  "name": "갈릭치킨볶음밥",
  "minutes": 15, "burners": 1, "level": 2,
  "method": ["볶기"], "tools": ["프라이팬"], "uses_leftover": true,
  "ingredients": [{ "id": "rice", "amount": "1공기", "optional": false }, ...],
  "prep": ["마늘 3쪽 편 썰기", ...],
  "steps": [
    { "n": 1, "text": "기름 2숟가락, 약불로 마늘 볶기",
      "sous_chef": { "type": "color", "label": "믿쥐가 색을 봐줄게요",
                     "cue": "마늘 가장자리가 연한 금색",
                     "say": "마늘이 연한 금색이에요. 이제 양파 넣어요." } },
    { "n": 2, "text": "양파 넣고 투명해질 때까지 볶기" }
  ],
  "sous_chef_moments": 3,
  "moment_types": ["color", "flip", "stick"],
  "learn_points": ["마늘은 연한 금색이 되면 다음 재료를 넣는다", ...],
  "photo": { ... }
}
```

- **level**: 1 = 한 가지 타이밍만 보면 됨 / 2 = 순서·타이밍 2~3개 / 3 = 불 조절·기름·반죽이 까다로움
- **burners**: 37개 모두 1구로 가능해요. 냄비·팬을 같이 쓰는 파스타는 `prep`에 "면 먼저 삶아 건지기"를 넣어 순서로 해결했어요.
- **steps[].sous_chef**: 믿쥐가 개입하는 단계에만 있어요. 레시피 상세의 "믿쥐가 ~봐줄게요" 줄, 요리 중 음성, 상단의 "믿쥐가 도와줄 순간 N번"이 모두 여기서 나와요.
  - `type` — `color` 색 보기 · `flip` 뒤집기 · `heat_down` 불 줄이기 · `stick` 눌어붙기 전 · `boil` 끓어 넘치기 전 · `done` 다 됐을 때
  - `cue` — 카메라·마이크로 확인할 신호. **AI 프롬프트에 그대로 넣는 용도**예요.
  - `say` — 믿쥐 예시 대사. 짧게, 이유와 함께 (슬라이드 16 "WHY").
- **learn_points**: 리포트의 "오늘 배운 것" 후보예요. 실제로는 그날 믿쥐가 개입한 단계 것만 골라 보여주면 돼요.

### 레시피 추천 분류 (바로 가능 / 하나 더 / 둘 더)
```
모자란 재료 = recipe.ingredients 중
              optional이 false 이고
              is_pantry가 false 이고 (양념은 있다고 가정)
              내 냉장고에 없는 것
0개 → 바로 가능 · 1개 → 하나 더 · 2개 → 둘 더 · 3개 이상 → 숨김
```
추가 필터:
- `burners` > 내 화구 수 → 숨김
- `tools` 중 내 조리도구에 없는 게 있으면 → 숨김 (뚜껑은 누구나 있다고 보고 무시해도 됨)
- 곧 상해요 재료를 쓰는 레시피 → "곧 상하는 재료 사용" 태그, 같은 그룹 안에서 위로
- 내 레벨 + 1 이상 → "새로운 도전" 태그

---

## 온보딩 (`onboarding_dishes.json`)

"레시피 없이 할 수 있는 요리" 칩을 누르면:
- `known_recipes` → 도감에 "이미 할 줄 알아요"로 표시 (경험치는 안 줌)
- 고른 칩의 `level` 중 가장 높은 값 → 시작 레벨. 아무것도 안 고르면 1
- `skills` → 결과 요약 화면의 "굽기·볶기 위주의 간단한 요리부터" 문구에 사용

---

## 사진

- 82개는 [Unsplash](https://unsplash.com)의 **무료 사진**(Unsplash+ 유료 사진 제외)이에요. Unsplash License라 상업적 사용·수정이 가능하고, 출처는 `CREDITS.md`에 모두 적어뒀어요.
- `photo.url`은 1080px, `photo.thumb`은 400px 크롭이에요. Unsplash 사진은 URL로 바로 띄우면 돼요.
- **팀 제공 사진 5개**(떡볶이떡, 전분, 된장, 굴소스, 어묵볶음)는 `data/images/`에 파일로 들어 있어요. 경로가 `images/tteok.jpg`처럼 `data/` 기준 상대경로예요. 원본 출처를 확인해서 `CREDITS.md`에 채워주세요.
- 한식은 무료 사진이 적어서 **비슷한 요리 사진**으로 대신한 것들이 있어요 (예: 대패삼겹 김치볶음 ← 팬에서 볶는 빨간 볶음 요리, 김치전 ← 접시에 담긴 부침 요리). 발표에서 실제 요리 사진이 중요하면 이것부터 바꾸세요.
