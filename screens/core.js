// 믿쥐 프로토타입 공통: 언어 · 테마 · 데이터 · 상태 · 라우터 · 아이콘 · 작은 UI 도우미.
// 화면은 screens.js의 SCREENS에 있어요.

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "en" ? "en" : "ko";
const en = lang === "en";
const themeParam = params.get("theme");
document.documentElement.lang = lang;
if (themeParam === "light" || themeParam === "dark") document.documentElement.dataset.theme = themeParam;

// 창이 기기보다 낮으면 기기 틀을 줄여서 한눈에 보이게
const fit = () => document.documentElement.style.setProperty("--fit", Math.min(1, (innerHeight - 64) / 874));
addEventListener("resize", fit);
fit();

// ---------- 문구 ----------
const DB = { recipes: [], ingredients: [], dishes: [], meta: {}, copy: {} };
const pick = (o, k) => (en ? o[k + "_en"] ?? o[k] : o[k]);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// 한국어 조사: 받침 있으면 을/으로, 없으면 를/로
function josa(word, pair) {
  const c = word.charCodeAt(word.length - 1);
  const has = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
  const rieul = has && (c - 0xac00) % 28 === 8;
  if (pair === "으로") return word + (has && !rieul ? "으로" : "로");
  return word + (has ? "을" : "를");
}

// i18n: "a.b.c" 키, {{name}} 자리표시, _one/_other 복수형, 한국어 조사 보정
function t(key, vars = {}) {
  const get = (k) => k.split(".").reduce((o, p) => o?.[p], DB.copy);
  let s = get(key);
  if ("count" in vars) s = get(key + (vars.count === 1 ? "_one" : "_other")) ?? s;
  s = s ?? key;
  if (!en && vars.name) s = s.replace("{{name}}를", josa(vars.name, "를")).replace("{{name}}으로", josa(vars.name, "으로"));
  return s.replace(/\{\{(\w+)\}\}/g, (_, v) => vars[v] ?? "");
}

// 화면 문구에 없는 프로토타입 전용 안내 (Figma Copy에 없음)
const PROTO = {
  not_ready: ["프로토타입에서는 아직 안 돼요", "Not in the prototype yet"],
  shared: ["자랑할 사진을 만들었어요", "Share image ready"],
  known_added: ["도감에 \"원래 할 줄 알았어요\"로 넣었어요", "Added to your collection as already known"],
  known_removed: ["할 줄 아는 요리에서 뺐어요", "Removed from dishes you know"],
  scanned: ["재료 {{count}}개를 찾았어요", "Found {{count}} items"],
  next_step: ["눌러서 다음 단계 (믿쥐 대신)", "Tap for next step (instead of Mitzy)"],
  photo_saved: ["대표 사진을 바꿨어요", "Cover photo changed"],
  kitchen_saved: ["내 주방을 바꿨어요", "Kitchen updated"],
  reset: ["처음부터", "Start over"],
  demo: ["데모 데이터", "Demo data"],
  jump: ["화면으로 이동", "Jump to screen"],
};
const p = (k, vars = {}) => PROTO[k][en ? 1 : 0].replace(/\{\{(\w+)\}\}/g, (_, v) => vars[v] ?? "");

// ---------- 아이콘 (SF Symbols는 웹에 못 써서 단순한 SVG로 그려요) ----------
const svg = (d, cls = "icon", vb = 20, extra = "") =>
  `<svg class="${cls}" viewBox="0 0 ${vb} ${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const I = {
  back: (c) => svg('<path d="M12.5 4 6.5 10l6 6"/>', c, 20, 'stroke-width="2.2"'),
  close: (c) => svg('<path d="m5 5 10 10M15 5 5 15"/>', c, 20, 'stroke-width="2.2"'),
  check: (c) => svg('<path d="m4.5 10.5 3.5 3.5 7.5-8"/>', c, 20, 'stroke-width="2.4"'),
  chev: (c = "icon-s chev") => svg('<path d="m7 4 6 6-6 6"/>', c),
  plus: (c) => svg('<path d="M10 4v12M4 10h12"/>', c, 20, 'stroke-width="2.4"'),
  play: (c) => `<svg class="${c ?? "icon"}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 3.8v12.4c0 .7.8 1.2 1.4.8l9.6-6.2a1 1 0 0 0 0-1.6L7.4 3c-.6-.4-1.4.1-1.4.8Z"/></svg>`,
  pause: (c) => `<svg class="${c ?? "icon"}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="4.5" y="3" width="4" height="14" rx="1.5"/><rect x="11.5" y="3" width="4" height="14" rx="1.5"/></svg>`,
  redo: (c) => svg('<path d="M15.5 10a5.5 5.5 0 1 1-1.6-3.9"/><path d="M15.5 3.5v3h-3"/>', c),
  camera: (c) => svg('<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h2l1.5-2h4l1.5 2h2A1.5 1.5 0 0 1 17 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5Z"/><circle cx="10" cy="11" r="2.8"/>', c),
  search: (c) => svg('<circle cx="9" cy="9" r="5.5"/><path d="m13 13 3.5 3.5"/>', c),
  clock: (c) => svg('<circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 1.5"/>', c),
  flame: (c) => svg('<path d="M10 17.5c3 0 5-2 5-5 0-3.5-3-5-3.5-9-2 1.5-3 3.5-3 5.5-1-.5-1.5-1.5-1.5-2.5C5.5 8 5 10 5 12.5c0 3 2 5 5 5Z"/>', c),
  trash: (c) => svg('<path d="M4 6h12M8 6V4h4v2M5.5 6l.8 10h7.4l.8-10"/>', c),
  info: (c) => svg('<circle cx="10" cy="10" r="7.5"/><path d="M10 9v4.5M10 6.5v.01"/>', c),
  bulb: (c) => svg('<path d="M7 13.5c0-1.5-2-2.5-2-5.5a5 5 0 0 1 10 0c0 3-2 4-2 5.5Z"/><path d="M8 16.5h4"/>', c),
  lock: (c) => svg('<rect x="5" y="9" width="10" height="8" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/>', c),
  share: (c) => svg('<path d="M10 3v10M6.5 6.5 10 3l3.5 3.5"/><path d="M6 9.5H5v7.5h10V9.5h-1"/>', c),
  photo: (c) => svg('<rect x="3" y="5" width="11" height="10" rx="2"/><path d="M6 3h9a2 2 0 0 1 2 2v8"/><path d="m3 13 3-3 3 3"/>', c),
  gear: (c) => svg('<circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>', c),
  warn: (c) => svg('<path d="M10 3.5 2.5 16.5h15Z"/><path d="M10 8.5v3.5M10 14.3v.01"/>', c),
  sparkle: (c) => svg('<path d="M10 2.5c.6 3.8 1.9 5.2 5.5 5.8-3.6.6-4.9 2-5.5 5.7-.6-3.7-1.9-5.1-5.5-5.7 3.6-.6 4.9-2 5.5-5.8Z"/><path d="M15.5 13v4M13.5 15h4"/>', c),
  pan: (c) => svg('<circle cx="8" cy="11" r="5.5"/><path d="m12 7.5 5.5-3.5"/>', c),
  recipe: (c) => svg('<rect x="4" y="2.5" width="12" height="15" rx="2"/><path d="M7 7h6M7 10.5h6M7 14h3"/>', c),
  fridge: (c) => svg('<rect x="5" y="2.5" width="10" height="15" rx="2"/><path d="M5 8h10M8 5v1.5M8 10.5v3"/>', c),
  fork: (c) => svg('<path d="M6 2.5v5a2 2 0 0 0 4 0v-5M8 2.5v15M14 17.5v-15c-2 1-2.5 3-2.5 6s1 3 2.5 3"/>', c),
  book: (c) => svg('<path d="M4 4a2 2 0 0 1 2-1.5h10v13H6a2 2 0 0 0-2 2Z"/><path d="M4 17.5V4"/>', c),
  minus: (c) => svg('<path d="M5 10h10"/>', c, 20, 'stroke-width="2.4"'),
};
// 믿쥐 얼굴 (임시)
const mitzyFace = (size = 28) =>
  `<span class="mitzy" style="width:${size}px;height:${size}px"><svg viewBox="0 0 24 24" width="${size * 0.7}" height="${size * 0.7}" fill="currentColor" aria-hidden="true"><circle cx="6" cy="7" r="4"/><circle cx="18" cy="7" r="4"/><ellipse cx="12" cy="14" rx="7.5" ry="7"/><circle cx="9.3" cy="13" r="1" fill="var(--color-bg)"/><circle cx="14.7" cy="13" r="1" fill="var(--color-bg)"/></svg></span>`;

// ---------- 날짜 ----------
const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysAgo = (n) => {
  const d = new Date(today() - n * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const since = (iso) => Math.max(0, Math.round((today() - new Date(iso + "T00:00:00")) / DAY));
const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return t("common.date", { month: d.getMonth() + 1, day: d.getDate(), monthShort: d.toLocaleString("en", { month: "short" }) });
};

// ---------- 상태 (브라우저에만 저장) ----------
const KEY = "mitzy-proto-v1";
function demoState() {
  return {
    kitchen: { burners: "1", type: "induction", tools: ["frying_pan", "pot", "microwave"] },
    experience: ["간장계란밥", "라면", "계란후라이", "볶음밥"],
    fridge: [
      ["onion", 12], ["garlic", 3], ["green_onion", 1], ["chicken_leftover", 4], ["milk", 1], ["egg", 1],
      ["tofu", 1], ["salt", 0], ["cooking_oil", 0], ["rice", 1], ["beer", 9],
    ].map(([id, ago]) => ({ id, added: daysAgo(ago), useBy: null })),
    dex: [
      { id: "garlic_chicken_fried_rice", count: 1, known: false, photo: null },
      { id: "egg_fried_rice", count: 3, known: false, photo: null },
      { id: "kimchi_fried_rice", count: 2, known: false, photo: null },
      { id: "jeyuk", count: 0, known: true, photo: null },
    ],
    cooking: null,
    lastCook: null,
  };
}
const emptyState = () => ({ ...demoState(), experience: [], fridge: [], dex: [] });
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) ?? demoState(); } catch { S = demoState(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

// ---------- 데이터 도우미 ----------
const ING = {};
const REC = {};
const ing = (id) => ING[id];
const rec = (id) => REC[id];
const ingName = (id) => (ING[id] ? pick(ING[id], "name") : id === "water" ? (en ? "Water" : "물") : id);
const thumb = (id) => ING[id]?.photo?.thumb ?? "";
const inFridge = (id) => S.fridge.some((f) => f.id === id);

// "곧 상해요": 소비기한 2일 전부터, 없으면 등록일 + shelf_days 의 2일 전부터
function isSoon(f) {
  const i = ing(f.id);
  if (f.useBy) return (new Date(f.useBy + "T00:00:00") - today()) / DAY <= 2;
  if (!i || i.shelf_days == null) return false;
  return i.shelf_days - since(f.added) <= 2;
}
const missing = (r) => r.ingredients.filter((x) => !x.optional && !ING[x.id]?.is_pantry && x.id !== "water" && !inFridge(x.id));
const dexEntry = (id) => S.dex.find((d) => d.id === id);
const newDishes = () => S.dex.filter((d) => d.count > 0).length;
const GOAL = 5;
const level = () => 1 + Math.floor(newDishes() / GOAL);
const kitchenSummary = () =>
  t("kitchen.summary", { type: t("kitchen.type_" + S.kitchen.type), burners: S.kitchen.burners === "3plus" ? "3+" : S.kitchen.burners });
const recipePhoto = (r, size = "url") => r.photo?.[size] ?? r.photo?.url ?? "";

// ---------- 라우터 ----------
// "#/recipe/abc" → SCREENS["recipe"]("abc")
let current = { name: "", args: [] };
function go(hash, { replace = false } = {}) {
  if (replace) location.replace("#" + hash); else location.hash = hash;
}
function route() {
  const [name = "welcome", ...args] = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
  const screen = SCREENS[name] ? name : "welcome";
  const prev = current.name;
  current = { name: screen, args, prev };
  if (screen !== "cooking") restoreTheme();
  const app = document.getElementById("app");
  app.innerHTML = "";
  const view = document.createElement("div");
  view.className = "view";
  app.appendChild(view);
  SCREENS[screen].render(view, ...args);
  syncJump();
}

// 요리 중 화면은 항상 다크
function forceDark(on) {
  if (on) document.documentElement.dataset.theme = "dark";
}
function restoreTheme() {
  if (themeParam === "light" || themeParam === "dark") document.documentElement.dataset.theme = themeParam;
  else delete document.documentElement.dataset.theme;
}

// ---------- 작은 UI 도우미 ----------
const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];
const on = (root, sel, fn) => $$(root, sel).forEach((el) => el.addEventListener("click", (e) => fn(el, e)));
const screenEl = () => document.getElementById("screen");

function toast(msg, { action, onAction, bottom = 100 } = {}) {
  $$(screenEl(), ".toast").forEach((el) => el.remove());
  const el = document.createElement("div");
  el.className = "toast glass";
  el.style.bottom = bottom + "px";
  el.innerHTML = `<span class="text text-subheadline-regular">${esc(msg)}</span>${action ? `<button class="text-subheadline-emphasized" type="button">${esc(action)}</button>` : ""}`;
  screenEl().appendChild(el);
  if (action) $(el, "button").onclick = () => { el.remove(); onAction?.(); };
  setTimeout(() => el.remove(), 3500);
}

// 시트 · 메뉴: 뒤 배경(scrim)을 누르면 닫혀요
function overlay(html, cls, { onClose } = {}) {
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  const box = document.createElement("div");
  box.className = cls;
  box.innerHTML = html;
  const close = () => { scrim.remove(); box.remove(); onClose?.(); };
  scrim.onclick = close;
  screenEl().append(scrim, box);
  return { box, close };
}

// 길게 누르는 버튼
function holdable(el, fn, ms = 900) {
  el.style.setProperty("--hold-ms", ms + "ms");
  let timer;
  const start = (e) => { e.preventDefault(); el.classList.add("holding"); timer = setTimeout(() => { el.classList.remove("holding"); fn(); }, ms); };
  const cancel = () => { clearTimeout(timer); el.classList.remove("holding"); };
  el.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => el.addEventListener(ev, cancel));
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fn(); });
}

const navHTML = ({ left = "back", title = "", right = "", fade = false, solid = false } = {}) => `
  <nav class="nav${fade ? " fade" : ""}${solid ? " solid" : ""}">
    ${left ? `<button class="icon-btn glass" type="button" data-nav="${left}" aria-label="${left === "close" ? (en ? "Close" : "닫기") : en ? "Back" : "뒤로"}">${I[left]()}</button>` : "<span></span>"}
    ${title ? `<div class="nav-title text-headline-regular"><span>${esc(title)}</span></div>` : ""}
    ${right || "<span></span>"}
  </nav>`;

const tabbarHTML = (active) => `
  <nav class="tabbar glass" aria-label="${en ? "Tabs" : "탭"}">
    ${[["fridge", "fridge", "tabs.fridge"], ["recipes", "fork", "tabs.recipes"], ["dex", "book", "tabs.collection"]]
      .map(([r, icon, k]) => `<a href="#/${r}"${active === r ? ' aria-current="page"' : ""}>${I[icon]()}<span class="text-caption2-emphasized">${esc(t(k))}</span></a>`).join("")}
  </nav>`;

// 스크롤하면 제목이 내비로 올라가고, 큰 사진은 반 속도로 움직여요 (패럴랙스)
function watchScroll(view, { titleSel = "h1", parallax = true } = {}) {
  const scroll = $(view, ".scroll");
  const title = $(view, titleSel);
  const img = $(view, ".hero img");
  const onScroll = () => {
    const y = scroll.scrollTop;
    if (img && parallax) img.style.transform = `translateY(${Math.max(0, y) * 0.5}px)`;
    if (title) view.classList.toggle("scrolled", title.getBoundingClientRect().bottom < screenEl().getBoundingClientRect().top + 100 * (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fit")) || 1));
  };
  scroll.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------- 시작 ----------
Promise.all(
  ["../data/recipes.json", "../data/ingredients.json", "../data/onboarding_dishes.json", "../data/meta.json", `../i18n/${lang}.json`]
    .map((u) => fetch(u).then((r) => r.json())),
).then(([recipes, ingredients, dishes, meta, copy]) => {
  // data/ 안 사진은 data/ 기준 상대 경로라서 screens/에서 볼 수 있게 고쳐요
  const fix = (ph) => ph && ["url", "thumb"].forEach((k) => { if (ph[k] && !/^https?:/.test(ph[k])) ph[k] = "../data/" + ph[k]; });
  [...recipes, ...ingredients].forEach((x) => fix(x.photo));
  Object.assign(DB, { recipes, ingredients, dishes, meta, copy });
  ingredients.forEach((i) => (ING[i.id] = i));
  recipes.forEach((r) => (REC[r.id] = r));
  document.title = en ? "Mitzy prototype" : "믿쥐 프로토타입";
  setupTools();
  addEventListener("hashchange", route);
  route();
}).catch((e) => {
  console.error(e);
  document.getElementById("app").innerHTML =
    '<p class="text-body-regular muted" style="padding:96px 16px">data/*.json을 못 읽었어요. 레포 루트에서 서버를 켜고 /screens/index.html로 열어요.</p>';
});

// 디자인 확인용 도구: 화면 이동 · 언어 · 테마 · 상태 초기화
const JUMPS = [
  ["welcome", "온보딩 · 환영"], ["kitchen", "온보딩 · 내 주방"], ["experience", "온보딩 · 요리 경험"], ["summary", "온보딩 · 결과 요약"],
  ["fridge", "냉장고 · 내 냉장고"], ["fridge-add", "냉장고 · 직접 검색해서 추가"], ["fridge-camera", "냉장고 · 사진·영수증으로 추가"],
  ["ingredient/chicken_leftover", "냉장고 · 재료 상세"],
  ["recipes", "레시피 · 레시피 추천"], ["recipe/garlic_chicken_fried_rice", "레시피 · 레시피 상세"],
  ["cooking/garlic_chicken_fried_rice", "요리 중 · 진행 중"],
  ["done/garlic_chicken_fried_rice", "요리 끝 · 사진 고르기"], ["report/garlic_chicken_fried_rice", "요리 끝 · 리포트"],
  ["unlock/garlic_chicken_fried_rice", "요리 끝 · 새 요리 잠금 해제"],
  ["dex", "도감 · 내 요리 도감"], ["dex-item/egg_fried_rice", "도감 · 요리 상세"], ["dex-photo/egg_fried_rice", "도감 · 대표 사진 바꾸기"],
  ["known", "도감 · 이미 할 줄 아는 요리 추가"], ["settings", "도감 · 설정"],
];
function setupTools() {
  const sel = document.getElementById("jump");
  sel.innerHTML = `<option value="">${esc(p("jump"))}</option>` + JUMPS.map(([h, label]) => `<option value="${h}">${esc(label)}</option>`).join("");
  sel.onchange = () => { if (sel.value) go("/" + sel.value); };
  const langBtn = document.getElementById("lang");
  langBtn.textContent = en ? "한국어" : "English";
  langBtn.onclick = () => { params.set("lang", en ? "ko" : "en"); location.href = "?" + params + location.hash; };
  const themeBtn = document.getElementById("theme");
  const dark = themeParam === "dark" || (!themeParam && matchMedia("(prefers-color-scheme: dark)").matches);
  themeBtn.textContent = dark ? "Light" : "Dark";
  themeBtn.onclick = () => { params.set("theme", dark ? "light" : "dark"); location.href = "?" + params + location.hash; };
  const resetBtn = document.getElementById("reset");
  resetBtn.textContent = p("demo");
  resetBtn.title = en ? "Reset to demo data" : "데모 데이터로 되돌리기";
  resetBtn.onclick = () => { S = demoState(); save(); route(); };
}
function syncJump() {
  const sel = document.getElementById("jump");
  if (sel) sel.value = "";
}
