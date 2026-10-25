# 화면 문구 (한/영)
Figma 팀 파일(시디 GUI)의 화면 문구를 한국어·영어 짝으로 맞춰요. Figma에서는 `Copy` 변수로 연결돼 있어요.

- **화면 문구** → `i18n/ko.json` · `i18n/en.json`. 키는 화면 단위예요 (`onboarding.welcome.title`, `fridge.use_soon`, `cooking.watching` …). 한국어·영어는 [`scripts/i18n_src.py`](../scripts/i18n_src.py) 한 파일에 나란히 적혀 있어서 같이 고치면 돼요.
- **레시피·재료 내용** → DB의 `_en` 칸 ([`data/README.md`](../data/README.md)).
- 형식은 [i18next](https://www.i18next.com) 기준이에요. React Native·웹이면 그대로, Swift·Flutter면 같은 키로 옮기면 돼요.
  - `{{count}}`, `{{name}}` 같은 자리는 앱이 값을 채워요. `t("recipe.stat.burners_value", { count: 1 })`
  - 키 끝 `_one` / `_other`는 영어 단수·복수용이에요 ("1 moment" / "3 moments"). i18next는 `count`만 넘기면 알아서 골라요.
  - 날짜는 `common.date`에 한국어 `{{month}}월 {{day}}일`, 영어 `{{monthShort}} {{day}}`(Oct 7)로 따로 넘겨요.
- 한국어 조사: `fridge.removed`("{{name}}를 뺐어요"), `fridge.detail.dishes`("{{name}}으로 …")는 이름 끝 받침에 따라 을/를, 으로/로가 바뀌어요. 앱에서 받침을 확인해 고치거나 [es-hangul](https://es-hangul.slash.page) 같은 라이브러리를 쓰세요.
- 설정 화면에 언어 바꾸기 줄을 넣을 때 쓰라고 `common.language` · `language_ko` · `language_en`을 넣어뒀어요 (Figma엔 아직 없음).
