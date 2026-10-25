"""design-tokens/tokens.json → design-tokens/tokens.css (웹에서 쓰는 CSS 변수)
tokens.json 은 Figma 변수에서 tokens-export 스킬로 만들어요. 두 파일 모두 직접 고치지 않아요.

  python3 scripts/tokens_css.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(__file__), "..")
D = os.path.join(ROOT, "design-tokens")
t = json.load(open(os.path.join(D, "tokens.json"), encoding="utf-8"))

# Figma는 작업용 Noto Sans KR이지만 웹은 최종 글꼴 Pretendard (AGENTS.md 폰트 규칙)
FONT_WEB = '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif'
WEIGHT = {"regular": 400, "medium": 500, "semibold": 600, "bold": 700}

def rgb(h):  # "#rrggbb" 또는 "#rrggbbaa"
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    a = int(h[7:9], 16) / 255 if len(h) == 9 else 1
    return f"rgb({r} {g} {b})" if a > 0.999 else f"rgb({r} {g} {b} / {round(a, 3)})"

def slug(s):  # "Title1/Emphasized" → title1-emphasized
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

colors = lambda mode: [f"  --color-{k}: {rgb(v[mode])};" for k, v in t["color"].items()]
out = ["/* 생성 파일 — design-tokens/tokens.json 에서 scripts/tokens_css.py 로 만들어요. 직접 고치지 않아요. */", ":root {"]
out += colors("light")
for group in ("space", "radius", "touch"):
    out += [f"  --{group}-{k}: {v}px;" for k, v in t[group].items()]
out.append(f"  --font-sans: {FONT_WEB};")
out += [f"  --font-weight-{k}: {v};" for k, v in WEIGHT.items()]
out.append("}")
out += ["@media (prefers-color-scheme: dark) {", "  :root:not([data-theme=\"light\"]) {"] + ["  " + l for l in colors("dark")] + ["  }", "}"]
out += [":root[data-theme=\"dark\"] {"] + colors("dark") + ["}"]
for name, s in t["text"].items():
    ls = f" letter-spacing: {s['letterSpacing']};" if s.get("letterSpacing") not in (None, "0", "normal") else ""
    out.append(f".text-{slug(name)} {{ font: var(--font-weight-{s['weight']}) {s['size']}px/{s['lineHeight']} var(--font-sans);{ls} }}")
open(os.path.join(D, "tokens.css"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("tokens.css", len(t["color"]), "colors,", sum(len(t[g]) for g in ("space", "radius", "touch")), "sizes,", len(t["text"]), "text styles")
