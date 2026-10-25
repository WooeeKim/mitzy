"""Figma Copy 변수 목록 만들기 — copy-sync 스킬이 씀 (파일을 만들지 않고 표준 출력으로 내보냄)
레포 원본(i18n_src.py, data/*.json)에서 [변수 이름, 한국어, 영어, 코드 위치] 목록을 만들어요.

  python3 scripts/copy_payload.py                          # 전체 목록
  python3 scripts/copy_payload.py --existing names.json    # data/* 는 Figma에 이미 있는 이름만

이름 규칙: i18n 키의 "." → "/" (common.next → common/next), DB 이름은 data/… 아래.
"""
import argparse, json, os, re, sys
ROOT = os.path.join(os.path.dirname(__file__), "..")
D = os.path.join(ROOT, "data")
sys.path.insert(0, os.path.dirname(__file__))
from i18n_src import T

def load(name):
    return json.load(open(os.path.join(D, name), encoding="utf-8"))

def slug(s):  # "Dairy & eggs" → dairy_eggs
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

rows = [[k.replace(".", "/"), ko, en, f't("{k}")'] for k, ko, en in T]

ing = load("ingredients.json")
NAME = {i["id"]: i["name"] for i in ing}; NAME["water"] = "물"
for i in ing:
    rows.append([f"data/ingredient/{i['id']}", i["name"], i["name_en"], f'ingredients["{i["id"]}"].name'])
meta = load("meta.json")
for n, (ko, en) in enumerate(zip(meta["categories"], meta["categories_en"])):
    rows.append([f"data/category/{slug(en)}", ko, en, f"meta.categories[{n}]"])
for n, o in enumerate(load("onboarding_dishes.json")):
    rows.append([f"data/dish/{slug(o['chip_en'])}", o["chip"], o["chip_en"], f"onboarding_dishes[{n}].chip"])
for r in load("recipes.json"):
    base, ref = f"data/recipe/{r['id']}", f'recipes["{r["id"]}"]'
    rows.append([base, r["name"], r["name_en"], ref + ".name"])
    for n, x in enumerate(r["ingredients"]):
        rows.append([f"{base}/ingredient/{x['id']}", f"{NAME[x['id']]} {x['amount']}", x["label_en"], f"{ref}.ingredients[{n}]"])
    for n, (ko, en) in enumerate(zip(r["prep"], r["prep_en"]), 1):
        rows.append([f"{base}/prep/{n}", ko, en, f"{ref}.prep[{n - 1}]"])
    for s in r["steps"]:
        rows.append([f"{base}/step/{s['n']}", s["text"], s["text_en"], f"{ref}.steps[{s['n'] - 1}].text"])
        if "sous_chef" in s:  # 믿쥐가 도와주는 단계 = 같은 번호의 moment
            rows.append([f"{base}/moment/{s['n']}", s["sous_chef"]["label"], s["sous_chef"]["label_en"], f"{ref}.steps[{s['n'] - 1}].sous_chef.label"])
    for n, (ko, en) in enumerate(zip(r["learn_points"], r["learn_points_en"]), 1):
        rows.append([f"{base}/learn/{n}", ko, en, f"{ref}.learn_points[{n - 1}]"])

names = [x[0] for x in rows]
assert len(names) == len(set(names)), "Copy 이름 중복"

ap = argparse.ArgumentParser()
ap.add_argument("--existing", help="Figma Copy에 있는 변수 이름 목록(JSON 배열) 파일")
a = ap.parse_args()
out = {"rows": rows}
if a.existing:
    have = set(json.load(open(a.existing, encoding="utf-8")))
    repo_data = {x[0] for x in rows if x[0].startswith("data/")}
    out["rows"] = [x for x in rows if not x[0].startswith("data/") or x[0] in have]
    out["figma_only_data"] = sorted(n for n in have if n.startswith("data/") and n not in repo_data)
    out["repo_only_data"] = len(repo_data - have)
json.dump(out, sys.stdout, ensure_ascii=False)
print(f"\nCopy 목록 {len(out['rows'])}개" + (f", Figma에만 있는 data {len(out['figma_only_data'])}개, 레포에만 있는 data {out['repo_only_data']}개" if a.existing else ""), file=sys.stderr)
