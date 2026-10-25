"""Figma Copy 문구 도구 — copy-sync · gui-change 스킬이 씀 (파일을 고치지 않아요)

  python3 scripts/copy_tool.py payload [figma-copy.json]
      레포 원본의 문구 목록을 JSON으로 출력해요. figma-copy.json을 주면 그 안에 있는 data/* 만 남겨요.
  python3 scripts/copy_tool.py diff figma-copy.json
      Figma 값과 레포 원본을 비교해서 다른 문구(changed)와 Figma에만 있는 이름(only_figma)을 출력해요.

figma-copy.json = .claude/skills/gui-change/scripts/read-copy.js 의 결과 (이름: [한국어, 영어])
이름 규칙: i18n 키의 "." → "/" (common.next → common/next), DB 이름은 data/… 아래.
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
D = os.path.join(ROOT, "data")
sys.path.insert(0, os.path.dirname(__file__))


def load(name):
    return json.load(open(os.path.join(D, name), encoding="utf-8"))


def slug(s):  # "Dairy & eggs" → dairy_eggs
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def build_rows():
    """[이름, 한국어, 영어, 코드 위치] 목록. 부를 때마다 원본을 새로 읽어요."""
    from i18n_src import T
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
    return rows


def payload(existing=None):
    rows = build_rows()
    out = {"rows": rows}
    if existing:
        data = json.load(open(existing, encoding="utf-8"))
        have = set(data.keys() if isinstance(data, dict) else data)
        repo_data = {x[0] for x in rows if x[0].startswith("data/")}
        out["rows"] = [x for x in rows if not x[0].startswith("data/") or x[0] in have]
        out["figma_only_data"] = sorted(n for n in have if n.startswith("data/") and n not in repo_data)
        out["repo_only_data"] = len(repo_data - have)
    return out


def diff(path):
    figma = {k: v for k, v in json.load(open(path, encoding="utf-8")).items() if not k.startswith("sample/")}
    repo = {r[0]: r for r in build_rows()}
    changed, only_figma, same = [], [], 0
    for name, (fko, fen) in sorted(figma.items()):
        if name not in repo:
            only_figma.append(name)
            continue
        _, rko, ren, ref = repo[name]
        if (rko, ren) == (fko, fen):
            same += 1
        else:
            changed.append({"name": name, "repo": [rko, ren], "figma": [fko, fen], "ref": ref})
    return {"changed": changed, "only_figma": only_figma, "same": same}


def main(argv):
    if len(argv) >= 2 and argv[1] == "payload":
        result = payload(argv[2] if len(argv) > 2 else None)
        json.dump(result, sys.stdout, ensure_ascii=False)
        print(f"\nCopy 목록 {len(result['rows'])}개", file=sys.stderr)
    elif len(argv) == 3 and argv[1] == "diff":
        result = diff(argv[2])
        json.dump(result, sys.stdout, ensure_ascii=False, indent=1)
        print(f"\n차이 {len(result['changed'])}개 · Figma에만 {len(result['only_figma'])}개 · 같음 {result['same']}개", file=sys.stderr)
    else:
        print(__doc__, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
