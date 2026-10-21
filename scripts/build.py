"""mitzy DB 빌드: 원본(*_src.py) + 사진(photos.json) → data/*.json, data/csv/*.csv"""
import csv, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from ingredients_src import INGREDIENTS, CATEGORIES
from recipes_src import RECIPES, MOMENT_TYPES

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "data")
os.makedirs(os.path.join(OUT, "csv"), exist_ok=True)

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
    ingredients.append({
        "id": iid, "name": name, "category": cat,
        "shelf_days": days, "storage": storage, "is_pantry": pantry,
        "note": note, "photo": photo("ing:" + iid),
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
    steps = []
    for i, s in enumerate(r["steps"], 1):
        steps.append({"n": i, **s})
    moments = [s["sous_chef"]["type"] for s in steps if "sous_chef" in s]
    recipes.append({
        "id": r["id"], "name": r["name"],
        "minutes": r["minutes"], "burners": r["burners"], "level": r["level"],
        "method": r["method"], "tools": r["tools"], "uses_leftover": r["leftover"],
        "ingredients": [{"id": i, "amount": a, "optional": o} for (i, a, o) in r["ingredients"]],
        "prep": r["prep"], "steps": steps,
        "sous_chef_moments": len(moments), "moment_types": sorted(set(moments)),
        "learn_points": r["learn"],
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
    for k in o["known_recipes"]:
        assert k in ids, k

meta = {
    "moment_types": MOMENT_TYPES,
    "levels": {"1": "한 가지 타이밍만 보면 됨", "2": "순서·타이밍 2~3개", "3": "불 조절·기름·반죽이 까다로움"},
    "categories": CATEGORIES,
}

def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
dump("ingredients.json", ingredients)
dump("recipes.json", recipes)
dump("onboarding_dishes.json", onboarding)
dump("meta.json", meta)

# ── CSV (팀원이 엑셀·시트로 보기용) ──
def wcsv(name, header, rows):
    with open(os.path.join(OUT, "csv", name), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f); w.writerow(header); w.writerows(rows)

wcsv("ingredients.csv", ["id","이름","카테고리","보관일수","보관","상비양념","메모","사진","사진 출처"],
     [[i["id"],i["name"],i["category"],i["shelf_days"] or "",i["storage"],"O" if i["is_pantry"] else "",
       i["note"] or "", (i["photo"] or {}).get("url",""), (i["photo"] or {}).get("credit","")] for i in ingredients])
NAME = {i["id"]: i["name"] for i in ingredients}; NAME["water"] = "물"
wcsv("recipes.csv", ["id","이름","시간(분)","화구","레벨","조리법","도구","남은음식활용","수솊순간","재료","배운점","사진","사진 출처"],
     [[r["id"],r["name"],r["minutes"],r["burners"],r["level"]," · ".join(r["method"])," · ".join(r["tools"]),
       "O" if r["uses_leftover"] else "", r["sous_chef_moments"],
       ", ".join(f"{NAME[x['id']]} {x['amount']}"+("(선택)" if x["optional"] else "") for x in r["ingredients"]),
       " / ".join(r["learn_points"]), (r["photo"] or {}).get("url",""), (r["photo"] or {}).get("credit","")] for r in recipes])
wcsv("recipe_steps.csv", ["레시피","순서","내용","수솊 타입","수솊이 보는 신호","수솊 대사"],
     [[r["name"],s["n"],s["text"],(s.get("sous_chef") or {}).get("type",""),(s.get("sous_chef") or {}).get("cue",""),
       (s.get("sous_chef") or {}).get("say","")] for r in recipes for s in r["steps"]])

with_photo = sum(1 for x in ingredients + recipes if x["photo"])
print(f"재료 {len(ingredients)}개, 레시피 {len(recipes)}개, 온보딩 칩 {len(onboarding)}개, 사진 {with_photo}/{len(ingredients)+len(recipes)}")
