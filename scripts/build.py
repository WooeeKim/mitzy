"""mitzy DB 빌드: 원본(*_src.py) + 사진(photos.json) → data/*.json, i18n/*.json"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from ingredients_src import INGREDIENTS, CATEGORIES
from recipes_src import RECIPES, MOMENT_TYPES
from en_src import (EN_ING, EN_REC, CATEGORIES_EN, METHODS_EN, TOOLS_EN, MOMENT_TYPES_EN, LEVELS_EN, CHIPS_EN)

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "data")

# 사진 (없으면 빈 칸)
photos_path = os.path.join(ROOT, "scripts", "photos.json")
PHOTOS = json.load(open(photos_path, encoding="utf-8")) if os.path.exists(photos_path) else {}

def photo(key):
    p = PHOTOS.get(key)
    if not p:
        return None
    if p.get("local"):  # 팀이 넣은 사진: data/images/ 안의 파일 (경로는 data/ 기준)
        return {
            "url": f"images/{p['local']}.jpg",
            "thumb": f"images/thumb/{p['local']}.jpg",
            "credit": p.get("credit", "팀 제공"),
            "credit_url": None,
            "source_url": p.get("source_url"),
            "license": p.get("license", "출처 확인 필요"),
            "alt": p.get("alt"),
        }
    return {
        "url": f"https://images.unsplash.com/{p['img'].split('/')[-1]}?w=1080&q=80&fm=jpg&fit=crop",
        "thumb": f"https://images.unsplash.com/{p['img'].split('/')[-1]}?w=400&q=70&fm=jpg&fit=crop",
        "credit": p.get("user") or ("@" + p["uname"]),
        "credit_url": f"https://unsplash.com/@{p['uname']}?utm_source=mitzy&utm_medium=referral" if p.get("uname") else None,
        "source_url": f"https://unsplash.com/photos/{p['id']}",
        "license": "Unsplash License",
        "alt": p.get("alt"),
    }

# ── 재료 ──
ING_IDS = set()
ingredients = []
for (iid, name, cat, days, storage, pantry, q, note) in INGREDIENTS:
    assert cat in CATEGORIES, (iid, cat)
    assert iid not in ING_IDS, iid
    ING_IDS.add(iid)
    name_en, storage_en, note_en = EN_ING[iid]
    assert (note is None) == (note_en is None), ("note 영어 짝 없음", iid)
    ingredients.append({
        "id": iid, "name": name, "name_en": name_en,
        "category": cat, "category_en": CATEGORIES_EN[cat],
        "shelf_days": days, "storage": storage, "storage_en": storage_en, "is_pantry": pantry,
        "note": note, "note_en": note_en, "photo": photo("ing:" + iid),
    })
# 물은 레시피에만 쓰고 냉장고에는 안 보임
ING_IDS.add("water")

# ── 레시피 ──
recipes = []
problems = []
for r in RECIPES:
    for (iid, amt, opt) in r["ingredients"]:
        if iid not in ING_IDS:
            problems.append(f"{r['id']}: 모르는 재료 {iid}")
    en = EN_REC[r["id"]]
    for k, ek in [("ingredients", "ing"), ("prep", "prep"), ("steps", "steps"), ("learn", "learn")]:
        if len(r[k]) != len(en[ek]):
            problems.append(f"{r['id']}: {k} 한국어 {len(r[k])}개 / 영어 {len(en[ek])}개")
    steps = []
    for i, (s, es) in enumerate(zip(r["steps"], en["steps"]), 1):
        st = {"n": i, "text": s["text"], "text_en": es[0]}
        if "sous_chef" in s:
            if len(es) != 3:
                problems.append(f"{r['id']} {i}단계: 영어에 믿쥐 cue·say 없음"); continue
            sc = s["sous_chef"]
            st["sous_chef"] = {"type": sc["type"], "label": sc["label"], "label_en": MOMENT_TYPES_EN[sc["type"]],
                               "cue": sc["cue"], "cue_en": es[1], "say": sc["say"], "say_en": es[2]}
        elif len(es) != 1:
            problems.append(f"{r['id']} {i}단계: 한국어엔 믿쥐 순간이 없는데 영어엔 있음")
        steps.append(st)
    moments = [s["sous_chef"]["type"] for s in steps if "sous_chef" in s]
    recipes.append({
        "id": r["id"], "name": r["name"], "name_en": en["name"],
        "minutes": r["minutes"], "burners": r["burners"], "level": r["level"],
        "method": r["method"], "method_en": [METHODS_EN[m][0] for m in r["method"]],
        "tools": r["tools"], "tools_en": [TOOLS_EN[t] for t in r["tools"]], "uses_leftover": r["leftover"],
        "ingredients": [{"id": i, "amount": a, "optional": o, "label_en": le}
                        for (i, a, o), le in zip(r["ingredients"], en["ing"])],
        "prep": r["prep"], "prep_en": en["prep"], "steps": steps,
        "sous_chef_moments": len(moments), "moment_types": sorted(set(moments)),
        "learn_points": r["learn"], "learn_points_en": en["learn"],
        "photo": photo("rec:" + r["id"]),
    })
ids = [r["id"] for r in recipes]
assert len(ids) == len(set(ids)), "레시피 id 중복"
if problems:
    print("\n".join(problems)); sys.exit(1)

# ── 온보딩: "레시피 없이 할 수 있는 요리" 칩 ──
onboarding = [
    {"chip": "간장계란밥",     "known_recipes": ["soy_egg_rice", "fried_egg"],          "skills": ["굽기"],         "level": 1},
    {"chip": "라면",           "known_recipes": ["ramen_egg"],                          "skills": ["끓이기"],       "level": 1},
    {"chip": "전자레인지 요리", "known_recipes": [],                                     "skills": ["전자레인지"],   "level": 1},
    {"chip": "계란후라이",     "known_recipes": ["fried_egg"],                          "skills": ["굽기"],         "level": 1},
    {"chip": "볶음밥",         "known_recipes": ["egg_fried_rice", "kimchi_fried_rice"], "skills": ["볶기"],         "level": 1},
    {"chip": "소시지볶음",     "known_recipes": ["sausage_veg"],                        "skills": ["볶기"],         "level": 1},
    {"chip": "계란말이",       "known_recipes": ["rolled_omelette"],                    "skills": ["부치기"],       "level": 2},
    {"chip": "두부부침",       "known_recipes": ["tofu_pan_fry"],                       "skills": ["부치기"],       "level": 1},
    {"chip": "제육볶음",       "known_recipes": ["jeyuk"],                              "skills": ["볶기"],         "level": 2},
    {"chip": "파스타",         "known_recipes": ["aglio_olio"],                         "skills": ["끓이기", "볶기"], "level": 2},
    {"chip": "튀김류",         "known_recipes": ["tonkatsu"],                           "skills": ["튀기기"],       "level": 3},
]
for o in onboarding:
    o["chip_en"] = CHIPS_EN[o["chip"]]
    o["skills_en"] = [METHODS_EN[k][0] for k in o["skills"]]
    for k in o["known_recipes"]:
        assert k in ids, k

meta = {
    "moment_types": MOMENT_TYPES, "moment_types_en": MOMENT_TYPES_EN,
    "levels": {"1": "한 가지 타이밍만 보면 됨", "2": "순서·타이밍 2~3개", "3": "불 조절·기름·반죽이 까다로움"},
    "levels_en": LEVELS_EN,
    "categories": CATEGORIES, "categories_en": [CATEGORIES_EN[c] for c in CATEGORIES],
    "methods": [{"ko": k, "en": v[0], "en_adj": v[1]} for k, v in METHODS_EN.items()],
    "tools": [{"ko": k, "en": v} for k, v in TOOLS_EN.items()],
}

def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
dump("ingredients.json", ingredients)
dump("recipes.json", recipes)
dump("onboarding_dishes.json", onboarding)
dump("meta.json", meta)

with_photo = sum(1 for x in ingredients + recipes if x["photo"])
print(f"재료 {len(ingredients)}개, 레시피 {len(recipes)}개, 온보딩 칩 {len(onboarding)}개, 사진 {with_photo}/{len(ingredients)+len(recipes)}")

# ── 앱 문구 i18n/ko.json · en.json (i18next 형식) ──
import re
from i18n_src import T
keys = [k for k, _, _ in T]
assert len(keys) == len(set(keys)), "i18n 키 중복"
ph = lambda s: sorted(set(re.findall(r"{{(\w+)}}", s)))
for k, ko, en_ in T:
    # 날짜처럼 언어마다 다른 값을 쓰는 곳은 예외
    if ph(ko) != ph(en_) and k != "common.date":
        print(f"i18n 경고: {k} 자리표시 다름 {ph(ko)} / {ph(en_)}")
os.makedirs(os.path.join(ROOT, "i18n"), exist_ok=True)
for lang, col in (("ko", 1), ("en", 2)):
    tree = {}
    for row in T:
        node = tree
        *path, last = row[0].split(".")
        for p in path:
            node = node.setdefault(p, {})
        node[last] = row[col]
    with open(os.path.join(ROOT, "i18n", f"{lang}.json"), "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)
print(f"앱 문구 {len(T)}개 → i18n/ko.json, i18n/en.json")
