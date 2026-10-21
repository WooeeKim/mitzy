"""data/preview.html 생성 — 브라우저로 열어서 레시피·재료·사진을 한눈에 확인하는 용도"""
import json, os, html
ROOT = os.path.join(os.path.dirname(__file__), "..")
D = os.path.join(ROOT, "data")
ing = json.load(open(os.path.join(D, "ingredients.json"), encoding="utf-8"))
rec = json.load(open(os.path.join(D, "recipes.json"), encoding="utf-8"))
NAME = {i["id"]: i["name"] for i in ing}; NAME["water"] = "물"
e = html.escape
def L(ko, en):  # 한/영 둘 다 넣고 CSS로 하나만 보이게
    return f'<span class="ko">{e(ko)}</span><span class="en">{e(en)}</span>'

def img(p, cls):
    if not p:
        return f'<div class="{cls} noimg">사진 없음</div>'
    return f'<img class="{cls}" src="{e(p["thumb"])}" alt="{e(p.get("alt") or "")}" loading="lazy">'

cards = []
for r in rec:
    ings = L(", ".join(NAME[x["id"]] + " " + x["amount"] + (" (선택)" if x["optional"] else "") for x in r["ingredients"]),
             ", ".join(x["label_en"] + (" (optional)" if x["optional"] else "") for x in r["ingredients"]))
    steps = "".join(
        f'<li>{L(s["text"], s["text_en"])}' + (f'<div class="sc">{L(s["sous_chef"]["label"], s["sous_chef"]["label_en"])}<br>'
        f'<span>{L("보는 것: " + s["sous_chef"]["cue"], "Watches for: " + s["sous_chef"]["cue_en"])}</span><br>'
        f'<span>{L("“" + s["sous_chef"]["say"] + "”", "“" + s["sous_chef"]["say_en"] + "”")}</span></div>' if "sous_chef" in s else "") + "</li>"
        for s in r["steps"])
    credit = (f'<div class="cr">Photo: {e(r["photo"]["credit"])}' + (" / Unsplash" if r["photo"]["license"] == "Unsplash License" else "") + "</div>") if r["photo"] else ""
    cards.append(f'''<article class="card">{img(r["photo"], "hero")}{credit}
<h3>{L(r["name"], r["name_en"])}</h3>
<p class="meta">{L(f'{r["minutes"]}분 · {r["burners"]}구 가능 · 레벨 {r["level"]} · {" · ".join(r["method"])} · 수솊이 도와줄 순간 {r["sous_chef_moments"]}번',
  f'{r["minutes"]} min · {r["burners"]} burner OK · Level {r["level"]} · {" · ".join(r["method_en"])} · Sous helps at {r["sous_chef_moments"]} moment' + ("s" if r["sous_chef_moments"] != 1 else ""))}</p>
<p class="ing">{ings}</p>
<details><summary>{L("순서 보기", "Steps")}</summary><ol>{steps}</ol></details></article>''')

tiles = "".join(f'<div class="tile">{img(i["photo"], "timg")}<b>{L(i["name"], i["name_en"])}</b><small>' +
                L(i["category"] + (f' · {i["shelf_days"]}일' if i["shelf_days"] else ""),
                  i["category_en"] + (f' · {i["shelf_days"]}d' if i["shelf_days"] else "")) + "</small></div>" for i in ing)

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
html[lang=ko] .en, html[lang=en] .ko{{display:none}}
.top{{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}}
.sw{{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}}
.sw button{{border:0;background:var(--card);color:var(--fg);padding:8px 14px;font:inherit;cursor:pointer}}
.sw button[aria-pressed=true]{{background:var(--acc);color:#fff}}
</style></head><body><main>
<div class="top"><div><h1>{L("맛있쥐 DB 미리보기", "MouseMouth DB preview")}</h1><p class="sub">{L(f"레시피 {len(rec)}개 · 재료 {len(ing)}개 · 사진 출처는 data/CREDITS.md", f"{len(rec)} recipes · {len(ing)} ingredients · photo credits in data/CREDITS.md")}</p></div>
<div class="sw" role="group" aria-label="Language"><button data-l="ko">한국어</button><button data-l="en">English</button></div></div>
<h2>{L("레시피", "Recipes")}</h2><div class="grid">{"".join(cards)}</div>
<h2>{L("재료", "Ingredients")}</h2><div class="tiles">{tiles}</div>
</main><script>
const set=l=>{{document.documentElement.lang=l;document.querySelectorAll('.sw button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===l));try{{localStorage.setItem('lang',l)}}catch(_){{}}}};
let l0='ko';try{{l0=localStorage.getItem('lang')||'ko'}}catch(_){{}}
document.querySelectorAll('.sw button').forEach(b=>b.onclick=()=>set(b.dataset.l));set(l0);
</script></body></html>'''
open(os.path.join(D, "preview.html"), "w", encoding="utf-8").write(page)
print("preview.html", len(page))
