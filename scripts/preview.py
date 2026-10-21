"""data/preview.html 생성 — 브라우저로 열어서 레시피·재료·사진을 한눈에 확인하는 용도"""
import json, os, html
ROOT = os.path.join(os.path.dirname(__file__), "..")
D = os.path.join(ROOT, "data")
ing = json.load(open(os.path.join(D, "ingredients.json"), encoding="utf-8"))
rec = json.load(open(os.path.join(D, "recipes.json"), encoding="utf-8"))
NAME = {i["id"]: i["name"] for i in ing}; NAME["water"] = "물"
e = html.escape

def img(p, cls):
    if not p:
        return f'<div class="{cls} noimg">사진 없음</div>'
    return f'<img class="{cls}" src="{e(p["thumb"])}" alt="{e(p.get("alt") or "")}" loading="lazy">'

cards = []
for r in rec:
    ings = ", ".join(NAME[x["id"]] + " " + x["amount"] + (" (선택)" if x["optional"] else "") for x in r["ingredients"])
    steps = "".join(
        f'<li>{e(s["text"])}' + (f'<div class="sc">수솊 · {e(s["sous_chef"]["label"])}<br><span>보는 것: {e(s["sous_chef"]["cue"])}</span></div>' if "sous_chef" in s else "") + "</li>"
        for s in r["steps"])
    credit = f'<div class="cr">Photo: {e(r["photo"]["credit"])} / Unsplash</div>' if r["photo"] else ""
    cards.append(f'''<article class="card">{img(r["photo"], "hero")}{credit}
<h3>{e(r["name"])}</h3>
<p class="meta">{r["minutes"]}분 · {r["burners"]}구 가능 · 레벨 {r["level"]} · {e(" · ".join(r["method"]))} · 수솊이 도와줄 순간 {r["sous_chef_moments"]}번</p>
<p class="ing">{e(ings)}</p>
<details><summary>순서 보기</summary><ol>{steps}</ol></details></article>''')

tiles = "".join(f'<div class="tile">{img(i["photo"], "timg")}<b>{e(i["name"])}</b><small>{e(i["category"])}' +
                (f' · {i["shelf_days"]}일' if i["shelf_days"] else "") + "</small></div>" for i in ing)

page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>맛있쥐 DB 미리보기</title><style>
:root{{--bg:#faf8f5;--fg:#1d1d1f;--mut:#6e6e73;--card:#fff;--line:#e5e5ea;--acc:#c2410c}}
@media (prefers-color-scheme:dark){{:root{{--bg:#111;--fg:#f2f2f2;--mut:#a1a1a6;--card:#1c1c1e;--line:#333;--acc:#fb923c}}}}
body{{margin:0;font:15px/1.5 -apple-system,"Pretendard",sans-serif;background:var(--bg);color:var(--fg)}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px}} h1{{font-size:28px;margin:0 0 4px}} h2{{margin:32px 0 12px}}
.sub{{color:var(--mut);margin:0 0 16px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;padding-bottom:12px}}
.card h3,.card p,.card details{{margin:8px 12px 0}} .hero{{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}}
.meta{{color:var(--acc);font-size:13px}} .ing{{color:var(--mut);font-size:13px}}
.cr{{font-size:11px;color:var(--mut);margin:4px 12px 0}} ol{{padding-left:20px}} li{{margin:6px 0}}
.sc{{font-size:12px;color:var(--acc)}} .sc span{{color:var(--mut)}}
.noimg{{display:flex;align-items:center;justify-content:center;background:var(--line);color:var(--mut);aspect-ratio:4/3;font-size:13px}}
.tiles{{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}}
.tile{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px;text-align:center;font-size:13px}}
.timg{{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block}} .tile small{{display:block;color:var(--mut)}}
</style></head><body><main>
<h1>맛있쥐 DB 미리보기</h1><p class="sub">레시피 {len(rec)}개 · 재료 {len(ing)}개 · 사진은 Unsplash 무료 사진 (출처는 data/CREDITS.md)</p>
<h2>레시피</h2><div class="grid">{"".join(cards)}</div>
<h2>재료</h2><div class="tiles">{tiles}</div>
</main></body></html>'''
open(os.path.join(D, "preview.html"), "w", encoding="utf-8").write(page)
print("preview.html", len(page))
