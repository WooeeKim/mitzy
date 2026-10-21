# 재료 마스터 원본
# (id, 이름, 카테고리, 기본 보관일수, 보관 위치, 양념/상비 여부, 사진 검색어(영문), 메모)
# 보관일수: 등록일부터 "곧 상해요"를 띄우는 기준. 포장지 소비기한을 입력하면 그쪽이 우선.
# None = 오래 가서 '곧 상해요' 계산에서 뺌.

CATEGORIES = ["채소", "육류", "유제품·계란", "기타", "양념", "곡류", "주류"]  # Figma GUI 내 냉장고 순서

INGREDIENTS = [
    # 채소
    ("onion", "양파", "채소", 21, "실온(서늘한 곳)", False, "onion", "썬 양파는 냉장 3일"),
    ("garlic", "마늘", "채소", 14, "냉장", False, "garlic cloves", "깐마늘 기준"),
    ("green_onion", "대파", "채소", 7, "냉장", False, "green onion", "씻어서 썰어두면 냉동 가능"),
    ("potato", "감자", "채소", 21, "실온(서늘한 곳)", False, "potato", "싹 나면 도려내기"),
    ("zucchini", "애호박", "채소", 7, "냉장", False, "zucchini", None),
    ("cabbage", "양배추", "채소", 14, "냉장", False, "cabbage", "자른 단면은 랩으로"),
    ("carrot", "당근", "채소", 21, "냉장", False, "carrot", None),
    ("mushroom", "버섯", "채소", 5, "냉장", False, "mushrooms", "새송이·양송이·팽이 공통"),
    ("chili", "청양고추", "채소", 10, "냉장", False, "green chili pepper", None),
    ("tomato", "토마토", "채소", 7, "실온→익으면 냉장", False, "tomato", None),
    ("spinach", "시금치", "채소", 4, "냉장", False, "spinach", None),
    # 육류
    ("chicken_leftover", "치킨", "육류", 2, "냉장", False, "fried chicken", "남은 배달 치킨. 육류는 보통 냉장 1~2일"),
    ("chicken_thigh", "닭다리살", "육류", 2, "냉장", False, "raw chicken thigh", None),
    ("pork_jeyuk", "돼지고기 앞다리살", "육류", 2, "냉장", False, "sliced pork", "제육용 얇게 썬 것"),
    ("pork_belly_thin", "대패삼겹살", "육류", 2, "냉장(냉동이면 30일)", False, "pork belly slices", None),
    ("spam", "스팸", "기타", 3, "개봉 후 냉장", False, "spam luncheon meat", "미개봉은 실온 오래 감"),
    ("sausage", "소시지", "기타", 7, "개봉 후 냉장", False, "sausages", None),
    ("bacon", "베이컨", "기타", 5, "개봉 후 냉장", False, "bacon", None),
    ("tuna_can", "참치캔", "기타", None, "실온(개봉 후 냉장 1일)", False, "canned tuna", None),
    ("fish_cake", "어묵", "기타", 5, "냉장", False, "korean fish cake", None),
    ("frozen_dumpling", "냉동만두", "기타", None, "냉동", False, "dumplings", None),
    ("frozen_cutlet", "냉동 돈가스", "기타", None, "냉동", False, "pork cutlet tonkatsu", None),
    # 유제품·계란
    ("egg", "계란", "유제품·계란", 21, "냉장", False, "eggs", None),
    ("milk", "우유", "유제품·계란", 5, "개봉 후 냉장", False, "milk", None),
    ("butter", "버터", "유제품·계란", 30, "냉장", False, "butter", None),
    ("cheese_slice", "슬라이스 치즈", "유제품·계란", 14, "냉장", False, "cheese slices", None),
    ("tofu", "두부", "기타", 3, "개봉 후 물에 담가 냉장", False, "tofu", "미개봉은 포장지 소비기한"),
    # 곡류
    ("rice", "밥", "곡류", 2, "냉장(냉동이면 30일)", False, "bowl of rice", "즉석밥은 실온 오래 감"),
    ("bread", "식빵", "곡류", 4, "실온", False, "sliced bread", "냉동하면 30일"),
    ("pasta", "파스타면", "곡류", None, "실온", False, "spaghetti pasta", None),
    ("ramen", "라면", "곡류", None, "실온", False, "instant ramen", None),
    ("udon", "우동면", "곡류", 14, "냉장", False, "udon noodles", None),
    ("tteok", "떡볶이떡", "곡류", 7, "냉장", False, "tteokbokki rice cakes", "굳으면 물에 불리기"),
    ("flour", "부침가루", "곡류", None, "실온", True, "flour", "튀김가루와 다름"),
    ("starch", "전분", "곡류", None, "실온", True, "corn starch", "부침가루와 헷갈리기 쉬움"),
    # 양념 (상비 양념은 '곧 상해요'에서 제외)
    ("salt", "소금", "양념", None, "실온", True, "salt", None),
    ("sugar", "설탕", "양념", None, "실온", True, "sugar", None),
    ("pepper", "후추", "양념", None, "실온", True, "black pepper", None),
    ("soy_sauce", "간장", "양념", None, "실온", True, "soy sauce", None),
    ("gochujang", "고추장", "양념", None, "냉장", True, "gochujang", None),
    ("gochugaru", "고춧가루", "양념", None, "냉동", True, "korean chili flakes", None),
    ("doenjang", "된장", "양념", None, "냉장", True, "doenjang soybean paste", None),
    ("oyster_sauce", "굴소스", "양념", None, "개봉 후 냉장", True, "oyster sauce", None),
    ("ketchup", "케찹", "양념", None, "개봉 후 냉장", True, "ketchup", None),
    ("mayo", "마요네즈", "양념", None, "개봉 후 냉장", True, "mayonnaise", None),
    ("sesame_oil", "참기름", "양념", None, "실온", True, "sesame oil", None),
    ("cooking_oil", "식용유", "양념", None, "실온", True, "cooking oil", None),
    ("olive_oil", "올리브유", "양념", None, "실온", True, "olive oil", None),
    ("kimchi", "김치", "기타", 30, "냉장", False, "kimchi", "시어질수록 볶음·찌개에 좋음"),
    # 주류
    ("beer", "맥주", "주류", None, "실온·냉장", False, "beer can", None),
]
