// 믿쥐 프로토타입 화면들. Figma 03 Screens의 프레임 이름 순서대로 있어요.
// 각 화면은 render(view, ...args)로 그리고, 이동은 go("/이름/인자")로 해요.

const bindNav = (view, target) => on(view, "[data-nav]", () => (typeof target === "function" ? target() : go(target)));
const glassChip = (label, { on: isOn = false, attrs = "", cls = "" } = {}) =>
  `<button class="chip ${isOn ? "on" : "glass"} ${cls} text-subheadline-emphasized" type="button" aria-pressed="${isOn}" ${attrs}>${isOn ? I.check("icon-s") : ""}${label}</button>`;

const SCREENS = {};

// ======================= 온보딩 =======================

// [온보딩] 환영
SCREENS.welcome = {
  render(view) {
    view.innerHTML = `
      <div class="page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:var(--space-16);padding-bottom:160px">
        <div class="glass" style="width:240px;height:240px;border-radius:var(--radius-full);display:grid;place-items:center">${mitzyFace(150)}</div>
        <h1 class="text-title1-emphasized pre" style="margin-top:var(--space-16)">${esc(t("onboarding.welcome.title"))}</h1>
        <p class="text-subheadline-regular muted pre">${esc(t("onboarding.welcome.body"))}</p>
      </div>
      <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="cta">${esc(t("onboarding.welcome.cta"))}</button></div>`;
    $(view, "#cta").onclick = () => go("/kitchen");
  },
};

// [온보딩] 내 주방 (설정에서 열면 저장하고 돌아가요)
SCREENS.kitchen = {
  render(view, mode) {
    const fromSettings = mode === "settings";
    const k = structuredClone(S.kitchen);
    const draw = () => {
      const single = (field, opts) =>
        opts.map((o) => glassChip(esc(t("kitchen." + (field === "burners" ? "burners_" : "type_") + o)), { on: k[field] === o, attrs: `data-${field}="${o}"` })).join("");
      const tools = ["frying_pan", "pot", "air_fryer", "microwave", "kettle"]
        .map((o) => glassChip(esc(t("kitchen.tool_" + o)), { on: k.tools.includes(o), attrs: `data-tool="${o}"` })).join("") +
        `<button class="chip glass text-subheadline-emphasized" type="button" id="custom">${I.plus("icon-s")}${esc(t("kitchen.tool_custom"))}</button>`;
      view.innerHTML = `
        ${navHTML({ left: "back" })}
        <div class="scroll"><div class="page with-nav">
          ${fromSettings ? "" : `<div class="progress" style="margin-bottom:var(--space-24)"><i style="width:50%"></i></div>`}
          <h1 class="text-title1-emphasized">${esc(t("onboarding.kitchen.title"))}</h1>
          <p class="lede text-subheadline-regular muted">${esc(t("onboarding.kitchen.body"))}</p>
          <section class="section"><h2 class="text-headline-regular">${esc(t("kitchen.burners"))}</h2><div class="chips">${single("burners", ["1", "2", "3plus"])}</div></section>
          <section class="section"><h2 class="text-headline-regular">${esc(t("kitchen.burner_type"))}</h2><div class="chips">${single("type", ["gas", "induction", "highlight", "unknown"])}</div></section>
          <section class="section"><h2 class="text-headline-regular">${esc(t("kitchen.tools"))}</h2><div class="chips">${tools}</div></section>
        </div></div>
        <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="cta" ${k.tools.length ? "" : "disabled"}>${esc(t(fromSettings ? "common.save" : "common.next"))}</button></div>`;
      bindNav(view, fromSettings ? "/settings" : "/welcome");
      on(view, "[data-burners]", (el) => { k.burners = el.dataset.burners; draw(); });
      on(view, "[data-type]", (el) => { k.type = el.dataset.type; draw(); });
      on(view, "[data-tool]", (el) => { const o = el.dataset.tool; k.tools = k.tools.includes(o) ? k.tools.filter((x) => x !== o) : [...k.tools, o]; draw(); });
      $(view, "#custom").onclick = () => toast(p("not_ready"));
      $(view, "#cta").onclick = () => {
        S.kitchen = k; save();
        if (fromSettings) { go("/settings"); toast(p("kitchen_saved")); } else go("/experience");
      };
    };
    draw();
  },
};

// [온보딩] 요리 경험
SCREENS.experience = {
  render(view) {
    const picked = new Set(S.experience);
    const draw = () => {
      view.innerHTML = `
        ${navHTML({ left: "back" })}
        <div class="scroll"><div class="page with-nav">
          <div class="progress" style="margin-bottom:var(--space-24)"><i style="width:100%"></i></div>
          <h1 class="text-title1-emphasized pre">${esc(t("onboarding.experience.title"))}</h1>
          <p class="lede text-subheadline-regular muted">${esc(t("onboarding.experience.body"))}</p>
          <div class="chips section">${DB.dishes.map((d) => glassChip(esc(pick(d, "chip")), { on: picked.has(d.chip), attrs: `data-dish="${esc(d.chip)}"` })).join("")}</div>
        </div></div>
        <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="cta">${esc(t("common.next"))}</button></div>`;
      bindNav(view, "/kitchen");
      on(view, "[data-dish]", (el) => { const d = el.dataset.dish; picked.has(d) ? picked.delete(d) : picked.add(d); draw(); });
      $(view, "#cta").onclick = () => { S.experience = [...picked]; save(); go("/summary"); };
    };
    draw();
  },
};

// [온보딩] 결과 요약
SCREENS.summary = {
  render(view) {
    const kitchen = kitchenSummary();
    const toolNames = S.kitchen.tools.map((x) => t("kitchen.tool_" + x)).join(", ");
    const skills = [...new Set(DB.dishes.filter((d) => S.experience.includes(d.chip)).flatMap((d) => pick(d, "skills")))];
    const skillText = (skills.length ? skills.slice(0, 2) : [DB.meta.methods[0][en ? "en" : "ko"]]).join(en ? " & " : "·");
    const kitchenLine = en ? `${kitchen}` : `${kitchen}, ${S.kitchen.tools.length === 1 ? toolNames + " 하나인" : toolNames.split(", ")[0] + " 하나인"}`;
    const row = (icon, label, value) => `
      <li class="row"><span class="icon-box">${I[icon]()}</span><div class="text"><div><span class="label text-caption1-emphasized muted">${esc(label)}</span><span class="text-headline-regular">${esc(value)}</span></div></div></li>`;
    view.innerHTML = `
      <div class="scroll"><div class="page" style="padding-top:calc(var(--status-h) + var(--space-48))">
        <h1 class="text-title1-emphasized">${esc(t("onboarding.summary.title"))}</h1>
        <p class="lede text-subheadline-regular muted pre">${esc(t("onboarding.summary.body", { kitchen: kitchenLine }))}</p>
        <ul class="card glass info section">
          ${row("flame", t("onboarding.summary.burners"), kitchen)}
          ${row("pan", t("onboarding.summary.tools"), toolNames)}
          ${row("sparkle", t("onboarding.summary.start_label"), t("onboarding.summary.start_value", { skills: skillText }))}
        </ul>
      </div></div>
      <div class="bottom">
        <p class="hint text-footnote-regular muted">${esc(t("onboarding.summary.change_later"))}</p>
        <button class="btn prominent text-headline-regular" type="button" id="cta">${esc(t("onboarding.summary.cta"))}</button>
      </div>`;
    $(view, "#cta").onclick = () => go("/fridge-add/onboarding");
  },
};

// ======================= 냉장고 =======================

// [냉장고] 내 냉장고 · 추가 메뉴 열림 · 편집 중
SCREENS.fridge = {
  render(view) {
    let editing = false;
    const draw = () => {
      const groups = DB.meta.categories.map((c, i) => [c, DB.meta.categories_en[i]])
        .map(([c, cEn]) => [en ? cEn : c, S.fridge.filter((f) => ing(f.id)?.category === c)]).filter(([, items]) => items.length);
      const chip = (f) => {
        const i = ing(f.id);
        const soon = isSoon(f);
        const days = i.is_pantry ? "" : ` <span class="sub text-footnote-regular">${esc(t("common.days_short", { count: since(f.added) }))}</span>`;
        return `<button class="chip ${soon ? "on" : "glass"} text-subheadline-emphasized" type="button" data-id="${f.id}">${esc(pick(i, "name"))}${days}${editing ? `<span class="badge-x">${I.close("icon-s")}</span>` : ""}</button>`;
      };
      view.innerHTML = `
        <div class="scroll"><div class="page has-tabbar">
          <div class="title-row">
            <h1 class="text-large-title-emphasized">${esc(t("fridge.title"))}</h1>
            <button class="pill-btn ${editing ? "prominent-glass" : "glass"} text-headline-regular" type="button" id="edit">${esc(t(editing ? "common.done" : "common.edit"))}</button>
          </div>
          <p class="lede text-footnote-regular muted" style="display:flex;align-items:center;gap:var(--space-4)"><span class="dot" style="background:var(--color-fg)"></span>${esc(t("fridge.use_soon"))}</p>
          ${groups.length ? groups.map(([c, items]) => `<h2 class="section-label text-subheadline-regular muted">${esc(c)}</h2><div class="chips">${items.map(chip).join("")}</div>`).join("")
            : `<p class="section text-body-regular muted">${esc(t("fridge.add_search"))} →</p>`}
          ${editing ? "" : `<p class="text-footnote-regular muted" style="text-align:center;margin-top:var(--space-24)">${esc(t("fridge.footnote"))}</p>`}
        </div></div>
        ${editing ? "" : `<button class="icon-btn l prominent-glass" type="button" id="fab" aria-label="${en ? "Add" : "추가"}" style="position:absolute;right:var(--space-16);bottom:130px;z-index:12;width:56px;height:56px">${I.plus()}</button>`}
        ${tabbarHTML("fridge")}`;
      $(view, "#edit").onclick = () => { editing = !editing; draw(); };
      on(view, "[data-id]", (el) => {
        const id = el.dataset.id;
        if (!editing) return go("/ingredient/" + id);
        const idx = S.fridge.findIndex((f) => f.id === id);
        const [removed] = S.fridge.splice(idx, 1);
        save(); draw();
        toast(t("fridge.removed", { name: ingName(id) }), {
          action: t("common.undo"), bottom: 112,
          onAction: () => { S.fridge.splice(idx, 0, removed); save(); draw(); },
        });
      });
      $(view, "#fab")?.addEventListener("click", openMenu);
    };
    const openMenu = () => {
      const { box, close } = overlay(`
        <button type="button" data-go="/fridge-camera" class="text-body-regular">${esc(t("fridge.add_photo"))}${I.camera()}</button>
        <button type="button" data-go="/fridge-add" class="text-body-regular">${esc(t("fridge.add_search"))}${I.search()}</button>`, "menu glass");
      box.style.bottom = "196px";
      const x = document.createElement("button");
      x.className = "icon-btn l glass"; x.type = "button"; x.innerHTML = I.close(); x.setAttribute("aria-label", en ? "Close" : "닫기");
      Object.assign(x.style, { position: "absolute", right: "var(--space-16)", bottom: "130px", zIndex: 42, width: "56px", height: "56px" });
      screenEl().appendChild(x);
      const done = () => { close(); x.remove(); };
      x.onclick = done;
      $(screenEl(), ".scrim").addEventListener("click", () => x.remove());
      on(box, "[data-go]", (el) => { done(); go(el.dataset.go); });
    };
    draw();
  },
};

// [냉장고] 직접 검색해서 추가 (from=onboarding이면 다 고르고 레시피 추천으로)
SCREENS["fridge-add"] = {
  render(view, from, preset) {
    const picked = new Set((preset ?? "").split(",").filter(Boolean));
    let cat = "all";
    let q = "";
    const cats = DB.meta.categories.map((c, i) => [c, en ? DB.meta.categories_en[i] : c]);
    const draw = () => {
      const list = DB.ingredients.filter((i) => (cat === "all" || i.category === cat) && (!q || (i.name + i.name_en).toLowerCase().includes(q.toLowerCase())));
      const tiles = list.map((i) => {
        const sel = picked.has(i.id) || inFridge(i.id);
        return `<button class="tile" type="button" data-id="${i.id}" ${inFridge(i.id) ? "disabled" : ""}>
          <span class="pic small photo-sel ${sel ? "on" : ""} glass">${i.photo ? `<img src="${esc(i.photo.thumb)}" alt="" loading="lazy">` : ""}<span class="photo-check">${I.check("icon-s")}</span></span>
          <span class="name text-footnote-${sel ? "emphasized" : "regular"} ${sel ? "" : "muted"}">${esc(pick(i, "name"))}</span></button>`;
      }).join("");
      const tray = [...picked].map((id) => `<button class="chip with-thumb glass text-footnote-emphasized" type="button" data-un="${id}"><img class="thumb" src="${esc(thumb(id))}" alt="">${esc(ingName(id))}<span class="muted">${I.close("icon-s")}</span></button>`).join("");
      view.innerHTML = `
        ${navHTML({ left: from === "onboarding" ? "back" : "close", title: t("fridge.search.title"), solid: true })}
        <div class="scroll"><div class="page with-nav" style="padding-bottom:${picked.size ? 300 : 140}px">
          <div style="display:flex;gap:var(--space-8)">
            <label class="search glass">${I.search("icon muted")}<input id="q" placeholder="${esc(t("fridge.search.placeholder"))}" value="${esc(q)}"></label>
            <button class="icon-btn l glass" type="button" id="cam" aria-label="${esc(t("fridge.add_photo"))}">${I.camera()}</button>
          </div>
          <div class="chips" style="flex-wrap:nowrap;overflow-x:auto;margin:var(--space-16) calc(-1 * var(--space-16)) 0;padding:var(--space-4) var(--space-16);scrollbar-width:none">
            ${glassChip(esc(t("fridge.search.all")), { on: cat === "all", attrs: 'data-cat="all"' })}
            ${cats.map(([c, label]) => glassChip(esc(label), { on: cat === c, attrs: `data-cat="${esc(c)}"` })).join("")}
          </div>
          <div class="grid c4" style="margin-top:var(--space-16)">${tiles}</div>
        </div></div>
        ${picked.size ? `<div class="glass" style="position:absolute;left:0;right:0;bottom:0;z-index:10;border-radius:var(--radius-panel) var(--radius-panel) 50px 50px;padding:var(--space-16) var(--space-16) var(--home-indicator)">
          <p class="text-footnote-emphasized muted" style="margin-bottom:var(--space-8)">${esc(t("fridge.search.selected", { count: picked.size }))}</p>
          <div class="chips" style="max-height:104px;overflow-y:auto;padding:var(--space-4)">${tray}</div>
          <button class="btn prominent text-headline-regular" type="button" id="cta" style="margin-top:var(--space-12)">${esc(t("fridge.search.add", { count: picked.size }))}</button>
        </div>` : ""}`;
      bindNav(view, from === "onboarding" ? "/summary" : "/fridge");
      const input = $(view, "#q");
      input.oninput = () => { q = input.value; const pos = input.selectionStart; draw(); const n = $(view, "#q"); n.focus(); n.setSelectionRange(pos, pos); };
      $(view, "#cam").onclick = () => go("/fridge-camera");
      on(view, "[data-cat]", (el) => { cat = el.dataset.cat; draw(); });
      on(view, "[data-id]", (el) => { const id = el.dataset.id; picked.has(id) ? picked.delete(id) : picked.add(id); draw(); });
      on(view, "[data-un]", (el) => { picked.delete(el.dataset.un); draw(); });
      $(view, "#cta")?.addEventListener("click", () => {
        picked.forEach((id) => S.fridge.push({ id, added: daysAgo(0), useBy: null }));
        save();
        go(from === "onboarding" ? "/recipes" : "/fridge");
      });
    };
    draw();
  },
};

// [냉장고] 사진·영수증으로 추가
SCREENS["fridge-camera"] = {
  render(view) {
    let mode = "items";
    const corner = (r) => `<span style="position:absolute;width:36px;height:36px;border:4px solid var(--color-on-photo);${r}"></span>`;
    const draw = () => {
      view.innerHTML = `
        <img src="${esc(ing("egg").photo.url)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
        <div style="position:absolute;inset:0;background:linear-gradient(rgb(0 0 0/.25),transparent 30%,transparent 70%,rgb(0 0 0/.35))"></div>
        ${navHTML({ left: "close" })}
        <p class="text-headline-regular" style="position:absolute;top:calc(var(--status-h) + 20px);left:0;right:0;text-align:center;color:var(--color-on-photo);z-index:11">${esc(t("fridge.photo.title"))}</p>
        <p class="glass text-footnote-emphasized" style="position:absolute;top:120px;left:50%;transform:translateX(-50%);padding:var(--space-8) var(--space-16);border-radius:var(--radius-full);white-space:nowrap">${esc(t("fridge.photo.body"))}</p>
        <div style="position:absolute;left:40px;right:40px;top:200px;bottom:240px">
          ${corner("left:0;top:0;border-right:0;border-bottom:0;border-top-left-radius:20px")}${corner("right:0;top:0;border-left:0;border-bottom:0;border-top-right-radius:20px")}
          ${corner("left:0;bottom:0;border-right:0;border-top:0;border-bottom-left-radius:20px")}${corner("right:0;bottom:0;border-left:0;border-top:0;border-bottom-right-radius:20px")}
        </div>
        <div style="position:absolute;left:0;right:0;bottom:var(--home-indicator);padding:0 var(--space-16);display:flex;flex-direction:column;align-items:center;gap:var(--space-16)">
          <div class="segmented glass text-subheadline-emphasized" style="width:200px">
            <button type="button" data-mode="items" aria-pressed="${mode === "items"}">${esc(t("fridge.photo.mode_items"))}</button>
            <button type="button" data-mode="receipt" aria-pressed="${mode === "receipt"}">${esc(t("fridge.photo.mode_receipt"))}</button>
          </div>
          <button class="btn glass text-headline-regular" type="button" id="shutter">${I.camera()}${esc(t("fridge.photo.shutter"))}</button>
        </div>`;
      bindNav(view, "/fridge");
      on(view, "[data-mode]", (el) => { mode = el.dataset.mode; draw(); });
      $(view, "#shutter").onclick = () => {
        // 찍으면 믿쥐가 재료를 찾은 것처럼 직접 추가 화면에 미리 골라 둬요
        const found = (mode === "items" ? ["egg"] : ["egg", "onion", "milk", "tofu", "kimchi"]).filter((id) => !inFridge(id));
        const flash = document.createElement("div");
        Object.assign(flash.style, { position: "absolute", inset: 0, background: "#fff", zIndex: 60, animation: "fade .3s reverse" });
        screenEl().appendChild(flash);
        setTimeout(() => { flash.remove(); go("/fridge-add/camera/" + found.join(",")); toast(p("scanned", { count: found.length }), { bottom: 300 }); }, 250);
      };
    };
    draw();
  },
};

// [냉장고] 재료 상세 + 소비기한 입력 시트
SCREENS.ingredient = {
  render(view, id) {
    const f = S.fridge.find((x) => x.id === id) ?? { id, added: daysAgo(0), useBy: null };
    const i = ing(id);
    const soon = isSoon(f);
    const dishes = DB.recipes.filter((r) => r.ingredients.some((x) => x.id === id));
    const name = pick(i, "name");
    view.innerHTML = `
      ${navHTML({ left: "back" })}
      <div class="scroll"><div class="page with-nav">
        ${i.photo ? `<img src="${esc(i.photo.url)}" alt="${esc(i.photo.alt ?? "")}" style="width:100%;height:220px;object-fit:cover;border-radius:var(--radius-card)">` : ""}
        <div style="display:flex;align-items:center;gap:var(--space-8);margin-top:var(--space-16)">
          <h1 class="text-title1-emphasized">${esc(name)}</h1>${soon ? `<span class="tag text-caption1-emphasized">${esc(t("fridge.use_soon"))}</span>` : ""}
        </div>
        <ul class="card glass info section">
          <li class="row"><div class="text"><div><span class="label text-footnote-regular muted">${esc(t("fridge.detail.category"))}</span><span class="text-headline-regular">${esc(pick(i, "category"))}</span></div></div></li>
          <li class="row"><div class="text"><div><span class="label text-footnote-regular muted">${esc(t("fridge.detail.added"))}</span><span class="text-headline-regular">${esc(fmtDate(f.added))}</span></div>
            <span class="text-subheadline-regular muted">${esc(t("common.days_ago", { count: since(f.added) }))}</span></div></li>
          <li class="row"><div class="text"><div><span class="label text-footnote-regular muted">${esc(t("fridge.detail.use_by"))}</span><span class="text-headline-regular">${esc(f.useBy ? fmtDate(f.useBy) : t("fridge.detail.use_by_none"))}</span></div>
            <button class="pill-btn glass text-subheadline-emphasized" type="button" id="useby">${esc(t("fridge.detail.use_by_add"))}</button></div></li>
        </ul>
        <div class="card glass pad" style="margin-top:var(--space-12)">
          <p class="text-subheadline-emphasized" style="display:flex;gap:var(--space-8);align-items:center">${I.info("icon-s")}${esc(t("fridge.detail.how_title"))}</p>
          <p class="text-footnote-regular muted" style="margin-top:var(--space-4)">${esc(t("fridge.detail.how_body"))}</p>
        </div>
        ${dishes.length ? `<button class="link-row glass" type="button" id="dishes" style="margin-top:var(--space-12)">${I.fork()}<span class="text text-headline-regular">${esc(t("fridge.detail.dishes", { count: dishes.length, name }))}</span>${I.chev()}</button>` : ""}
      </div></div>
      <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="remove">${esc(t("fridge.detail.remove"))}</button></div>`;
    bindNav(view, "/fridge");
    $(view, "#dishes")?.addEventListener("click", () => go("/recipes"));
    $(view, "#remove").onclick = () => {
      S.fridge = S.fridge.filter((x) => x.id !== id); save(); go("/fridge");
      setTimeout(() => toast(t("fridge.removed", { name })), 50);
    };
    $(view, "#useby").onclick = () => useBySheet(f, () => { save(); route(); });
  },
};

function useBySheet(f, onSave) {
  const i = ing(f.id);
  const base = f.useBy ? new Date(f.useBy + "T00:00:00") : new Date(today().getTime() + (i.shelf_days ?? 7) * DAY);
  const col = (n, from, unit) => `<div class="col text-title2-regular" data-col="${unit}">${Array.from({ length: n }, (_, k) => `<div>${k + from}</div>`).join("")}</div>`;
  const { box, close } = overlay(`
    <div class="grabber"></div>
    <div class="title-row"><h2 class="text-title2-emphasized">${esc(pick(i, "name"))}</h2><span class="text-footnote-regular muted">${esc(t("fridge.use_by.since", { day: since(f.added) }))}</span></div>
    <p class="text-footnote-regular muted" style="margin-top:var(--space-4)">${esc(pick(i, "note") ?? pick(i, "storage"))}</p>
    <p class="text-headline-regular" style="margin-top:var(--space-16)">${esc(t("fridge.use_by.title"))}</p>
    <div class="wheel">${col(12, 1, "month")}${col(31, 1, "day")}
      <span class="text-title2-regular" style="position:absolute;left:58%;top:98px;pointer-events:none">${esc(t("fridge.use_by.month"))}</span></div>
    <div class="row2" style="display:flex;gap:var(--space-12)">
      <button class="btn glass text-headline-regular" type="button" id="unknown">${esc(t("fridge.use_by.unknown"))}</button>
      <button class="btn prominent text-headline-regular" type="button" id="save">${esc(t("common.save"))}</button>
    </div>`, "sheet glass");
  // 월 · 일 라벨을 숫자 옆에 두기 위해 숫자 뒤에 붙여요
  $$(box, '[data-col="month"] div').forEach((d) => (d.textContent += en ? "" : t("fridge.use_by.month")));
  $$(box, '[data-col="day"] div').forEach((d) => (d.textContent += en ? "" : t("fridge.use_by.day")));
  $(box, ".wheel > span").remove();
  const cols = { month: $(box, '[data-col="month"]'), day: $(box, '[data-col="day"]') };
  requestAnimationFrame(() => { cols.month.scrollTop = base.getMonth() * 44; cols.day.scrollTop = (base.getDate() - 1) * 44; });
  $(box, "#unknown").onclick = close;
  $(box, "#save").onclick = () => {
    const m = Math.round(cols.month.scrollTop / 44) + 1;
    const d = Math.round(cols.day.scrollTop / 44) + 1;
    let y = today().getFullYear();
    if (new Date(y, m - 1, d) < today() - 30 * DAY) y += 1;
    f.useBy = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (!S.fridge.includes(f)) S.fridge.push(f);
    close(); onSave();
  };
}

// ======================= 레시피 =======================

// [레시피] 레시피 추천
SCREENS.recipes = {
  render(view, group = "0") {
    const kitchenTools = new Set(S.kitchen.tools.map((x) => ({ frying_pan: "프라이팬", pot: "냄비", microwave: "전자레인지" }[x])).filter(Boolean));
    const fits = (r) => r.burners <= (S.kitchen.burners === "3plus" ? 9 : +S.kitchen.burners) && r.tools.every((x) => x === "뚜껑" || kitchenTools.has(x));
    const pool = DB.recipes.filter(fits);
    const groups = [0, 1, 2].map((n) => pool.filter((r) => missing(r).length === n));
    const g = Math.min(2, Math.max(0, +group || 0));
    const soonIds = new Set(S.fridge.filter(isSoon).map((f) => f.id));
    const row = (r) => {
      const tags = [];
      if (r.ingredients.some((x) => soonIds.has(x.id))) tags.push(t("recipes.tag_use_soon"));
      if (!dexEntry(r.id)) tags.push(t("recipes.tag_new_challenge"));
      const miss = missing(r).map((x) => ingName(x.id)).join(", ");
      return `<button class="list-row glass" type="button" data-id="${r.id}">
        <img class="thumb" src="${esc(recipePhoto(r, "thumb"))}" alt="" loading="lazy">
        <div class="text">
          <p class="text-headline-regular">${esc(pick(r, "name"))}</p>
          <p class="meta text-footnote-regular muted"><span>${I.clock("icon-s")}${esc(t("common.minutes", { count: r.minutes }))}</span><span>${I.flame("icon-s")}${esc(pick(r, "method").join(", "))}</span></p>
          ${miss ? `<p class="text-footnote-regular" style="margin-top:var(--space-4);color:var(--color-caution)">+ ${esc(miss)}</p>` : ""}
          ${tags.length ? `<div class="tags">${tags.map((x) => `<span class="tag text-caption2-emphasized">${esc(x)}</span>`).join("")}</div>` : ""}
        </div>${I.chev()}</button>`;
    };
    view.innerHTML = `
      <div class="scroll"><div class="page has-tabbar">
        <h1 class="text-large-title-emphasized">${esc(t("recipes.title"))}</h1>
        <p class="lede text-footnote-regular muted">${esc(t("recipes.basis", { kitchen: kitchenSummary() }))}</p>
        <div class="segmented glass text-subheadline-emphasized" style="margin:var(--space-16) 0">
          ${["group_ready", "group_one_more", "group_two_more"].map((k, n) => `<button type="button" data-g="${n}" aria-pressed="${g === n}">${esc(t("recipes." + k))} <span class="text-caption1-emphasized" style="opacity:.6">${groups[n].length}</span></button>`).join("")}
        </div>
        <div>${groups[g].map(row).join("") || `<p class="text-body-regular muted" style="text-align:center;padding:var(--space-48) 0">—</p>`}</div>
      </div></div>
      ${tabbarHTML("recipes")}`;
    on(view, "[data-g]", (el) => go("/recipes/" + el.dataset.g, { replace: true }));
    on(view, "[data-id]", (el) => go("/recipe/" + el.dataset.id));
  },
};

// [레시피] 레시피 상세 (위 · 스크롤 중 패럴랙스 · 스크롤 후)
SCREENS.recipe = {
  render(view, id) {
    const r = rec(id) ?? DB.recipes[0];
    const name = pick(r, "name");
    const known = !!dexEntry(r.id)?.known;
    const chipLabel = (x) => (en ? x.label_en : `${ingName(x.id)} ${x.amount}`) + (x.optional ? ` ${t("common.optional")}` : "");
    view.innerHTML = `
      ${navHTML({ left: "back", title: name, fade: true,
        right: `<button class="pill-btn ${known ? "prominent-glass" : "glass"} text-headline-regular hide-on-scroll" type="button" id="know">${I.check()}${esc(t("recipe.i_know_this"))}</button>` })}
      <div class="scroll">
        <div class="hero"><img src="${esc(recipePhoto(r))}" alt="${esc(r.photo?.alt ?? "")}"></div>
        <div class="page">
          <h1 class="text-title1-emphasized">${esc(name)}</h1>
          <div class="stats">
            ${[[t("recipe.stat.time"), t("common.minutes", { count: r.minutes })], [t("recipe.stat.burners"), t("recipe.stat.burners_value", { count: r.burners })],
              [t("recipe.stat.help"), t("common.times", { count: r.sous_chef_moments })]]
              .map(([l, v]) => `<div class="stat"><span class="text-caption1-emphasized muted">${esc(l)}</span><span class="text-headline-regular">${esc(v)}</span></div>`).join("")}
          </div>
          <section class="section"><h2 class="text-title3-emphasized">${esc(t("recipe.ingredients"))}</h2>
            <div class="chips">${r.ingredients.map((x) => `<span class="chip with-thumb glass text-subheadline-emphasized" style="${inFridge(x.id) || ING[x.id]?.is_pantry ? "" : "opacity:.45"}">${thumb(x.id) ? `<img class="thumb" src="${esc(thumb(x.id))}" alt="" loading="lazy">` : ""}${esc(chipLabel(x))}</span>`).join("")}</div></section>
          <section class="section"><h2 class="text-title3-emphasized">${esc(t("recipe.prep"))}</h2>
            <ol class="card glass steps">${pick(r, "prep").map((s, n) => `<li class="row"><span class="num prep text-footnote-emphasized">${n + 1}</span><div class="text text-body-regular">${esc(s)}</div></li>`).join("")}</ol></section>
          <section class="section"><h2 class="text-title3-emphasized">${esc(t("recipe.steps"))}</h2>
            <ol class="card glass steps">${r.steps.map((s) => `<li class="row"><span class="num step text-footnote-emphasized">${s.n}</span><div class="text">
              <p class="text-body-regular">${esc(pick(s, "text"))}</p>${s.sous_chef ? `<p class="help text-footnote-regular">${mitzyFace(16)}${esc(pick(s.sous_chef, "label"))}</p>` : ""}</div></li>`).join("")}</ol></section>
        </div>
      </div>
      <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="start">${I.play()}${esc(t("recipe.start"))}</button></div>`;
    bindNav(view, current.prev === "recipes" || !current.prev ? "/recipes" : current.prev === "dex-item" ? "/dex-item/" + r.id : "/recipes");
    watchScroll(view);
    $(view, "#know").onclick = () => {
      const d = dexEntry(r.id);
      if (d?.known && !d.count) { S.dex = S.dex.filter((x) => x !== d); toast(p("known_removed")); }
      else if (d) { d.known = !d.known; toast(p(d.known ? "known_added" : "known_removed")); }
      else { S.dex.push({ id: r.id, count: 0, known: true, photo: null }); toast(p("known_added")); }
      save();
      $(view, "#know").className = `pill-btn ${dexEntry(r.id)?.known ? "prominent-glass" : "glass"} text-headline-regular hide-on-scroll`;
    };
    $(view, "#start").onclick = () => {
      S.cooking = { id: r.id, step: 0, startedAt: Date.now(), pausedAt: null, pausedMs: 0, status: "running" };
      save(); go("/cooking/" + r.id);
    };
  },
};

// ======================= 요리 중 (다크, 고정 스택) =======================

// [요리 중] 진행 중 · 일시정지 · 오브젝트 연결 끊김
SCREENS.cooking = {
  render(view, id) {
    forceDark(true);
    const r = rec(id) ?? DB.recipes[0];
    if (!S.cooking || S.cooking.id !== r.id) S.cooking = { id: r.id, step: 0, startedAt: Date.now(), pausedAt: null, pausedMs: 0, status: "running" };
    const c = S.cooking;
    let tick;
    const elapsed = () => {
      const ms = (c.pausedAt ?? Date.now()) - c.startedAt - c.pausedMs;
      const s = Math.max(0, Math.floor(ms / 1000));
      return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    };
    const draw = () => {
      const step = r.steps[c.step];
      const pill = { running: [t("cooking.watching"), ""], paused: [t("cooking.status_waiting"), "wait"], off: [t("cooking.status_disconnected"), "off"] }[c.status];
      const guide = {
        running: `<div class="text"><p class="text-headline-regular">${esc(pick(step, "text"))}</p>${step.sous_chef ? `<p class="text-footnote-regular muted" style="margin-top:2px">${esc(pick(step.sous_chef, "label"))}</p>` : ""}</div>
          <span class="text-headline-regular muted">${esc(t("cooking.step_count", { current: c.step + 1, total: r.steps.length }))}</span>`,
        paused: `<div class="text"><p class="text-caption1-emphasized muted">${esc(t("cooking.pause"))}</p><p class="text-headline-regular">${esc(t("cooking.paused_body"))}</p></div>`,
        off: `<span class="icon-box" style="background:var(--color-fill);color:var(--color-danger)">${I.warn()}</span><div class="text"><p class="text-headline-regular">${esc(t("cooking.disconnected_title"))}</p><p class="text-footnote-regular muted">${esc(t("cooking.disconnected_body"))}</p></div>`,
      }[c.status];
      const big = {
        running: `<button class="big glass" type="button" id="big">${I.pause("icon-l")}<span class="text-title2-emphasized">${esc(t("cooking.pause"))}</span></button>`,
        paused: `<button class="big light" type="button" id="big">${I.play("icon-l")}<span class="text-title2-emphasized">${esc(t("cooking.resume"))}</span></button>`,
        off: `<button class="big light" type="button" id="big">${I.redo("icon-l")}<span class="text-title2-emphasized">${esc(t("cooking.reconnect"))}</span></button>`,
      }[c.status];
      const hold = {
        running: `<button class="hold light" type="button" id="hold"><span class="fill"></span><span class="text-title2-emphasized">${esc(t("cooking.finish"))}</span><span class="text-footnote-regular" style="opacity:.6">${esc(t("cooking.hold_to_finish"))}</span></button>`,
        paused: `<button class="hold glass" type="button" id="hold"><span class="fill"></span><span class="text-title2-emphasized">${esc(t("cooking.stop"))}</span><span class="text-footnote-regular muted">${esc(t("cooking.hold_to_stop"))}</span></button>`,
        off: `<button class="hold glass" type="button" id="hold"><span class="fill"></span><span class="text-title2-emphasized">${esc(t("cooking.ask_phone"))}</span></button>`,
      }[c.status];
      view.innerHTML = `
        <div class="cook">
          <div class="cook-top">
            <button class="status-pill glass text-footnote-emphasized" type="button" id="pill" title="${en ? "Tap to simulate disconnect" : "눌러서 연결 끊김 흉내"}">${mitzyFace(28)}${esc(pill[0])}<span class="dot ${pill[1]}"></span></button>
            <span class="text-footnote-regular muted" style="display:inline-flex;gap:var(--space-4);align-items:center" aria-label="${esc(t("cooking.elapsed_a11y", { time: elapsed() }))}">${I.clock("icon-s")}<span id="time">${elapsed()}</span></span>
          </div>
          <h1 class="text-title1-emphasized">${esc(pick(r, "name"))}</h1>
          <button class="guide glass" type="button" id="guide" title="${esc(p("next_step"))}">${guide}</button>
          ${big}
          ${hold}
          <p class="hint text-caption1-emphasized muted">${esc(t("cooking.knuckle_hint"))}</p>
        </div>`;
      $(view, "#big").onclick = () => {
        if (c.status === "running") { c.status = "paused"; c.pausedAt = Date.now(); }
        else { if (c.pausedAt) c.pausedMs += Date.now() - c.pausedAt; c.pausedAt = null; c.status = "running"; }
        save(); draw();
      };
      $(view, "#pill").onclick = () => {
        if (c.status === "off") return;
        if (c.status === "paused" && c.pausedAt) { c.pausedMs += Date.now() - c.pausedAt; c.pausedAt = null; }
        c.status = "off"; save(); draw();
      };
      // 믿쥐가 다음 단계로 넘겨주는 걸 눌러서 대신해요
      $(view, "#guide").onclick = () => { if (c.status === "running" && c.step < r.steps.length - 1) { c.step++; save(); draw(); } };
      holdable($(view, "#hold"), () => {
        if (c.status === "running") { S.lastCook = { id: r.id, minutes: Math.max(1, Math.round(((Date.now() - c.startedAt - c.pausedMs) / 60000))) || r.minutes, photo: 0 }; S.cooking = null; save(); go("/done/" + r.id); }
        else if (c.status === "paused") { S.cooking = null; save(); go("/recipe/" + r.id); }
        else toast(p("not_ready"), { bottom: 200 });
      });
    };
    draw();
    tick = setInterval(() => { const el = document.getElementById("time"); if (!el || current.name !== "cooking") return clearInterval(tick); el.textContent = elapsed(); }, 1000);
  },
};

// ======================= 요리 끝 =======================

// 요리 중 믿쥐가 찍은 사진 (프로토타입: 레시피 사진 + 믿쥐 순간마다 재료 사진)
function cookPhotos(r) {
  const shots = [{ src: recipePhoto(r), label: t("done.photo_finished") }];
  r.steps.filter((s) => s.sous_chef).slice(0, 2).forEach((s) => {
    const x = r.ingredients.find((g) => ING[g.id]?.photo && s.text.includes(ingName(g.id).slice(0, 2))) ?? r.ingredients[shots.length];
    shots.push({ src: ING[x?.id]?.photo?.url ?? recipePhoto(r), label: pick(s, "text").split(/[,，]/).pop().trim() });
  });
  return shots;
}

// [요리 끝] 사진 고르기
SCREENS.done = {
  render(view, id) {
    const r = rec(id) ?? DB.recipes[0];
    const shots = cookPhotos(r);
    let sel = 0;
    const draw = () => {
      view.innerHTML = `
        <div class="scroll"><div class="page" style="padding-top:calc(var(--status-h) + var(--space-16))">
          <h1 class="text-large-title-emphasized">${esc(t("done.title"))}</h1>
          <p class="lede text-footnote-regular muted">${esc(t("done.pick_photo"))}</p>
          <div style="position:relative;margin-top:var(--space-16);height:320px;border-radius:30px;overflow:hidden">
            <img src="${esc(shots[sel].src)}" alt="" style="width:100%;height:100%;object-fit:cover">
            <span class="pill-btn glass text-footnote-emphasized" style="position:absolute;left:12px;bottom:12px;height:32px;padding:0 var(--space-12)">${I.check("icon-s")}${esc(shots[sel].label)}</span>
          </div>
          <div class="grid c4" style="margin-top:var(--space-16)">
            ${shots.map((s, n) => `<button class="tile" type="button" data-n="${n}"><span class="pic small photo-sel ${n === sel ? "on" : ""}"><img src="${esc(s.src)}" alt=""><span class="photo-check">${I.check("icon-s")}</span></span>
              <span class="name text-footnote-${n === sel ? "emphasized" : "regular muted"}">${esc(s.label)}</span></button>`).join("")}
            <button class="tile" type="button" id="phone"><span class="pic small glass" style="display:grid;place-items:center">${I.camera()}</span><span class="name text-footnote-regular muted">${esc(t("done.take_phone"))}</span></button>
          </div>
        </div></div>
        <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="cta">${esc(t("common.next"))}</button></div>`;
      on(view, "[data-n]", (el) => { sel = +el.dataset.n; draw(); });
      $(view, "#phone").onclick = () => toast(p("not_ready"));
      $(view, "#cta").onclick = () => { S.lastCook = { ...(S.lastCook ?? { id: r.id, minutes: r.minutes }), photo: sel }; save(); go("/report/" + r.id); };
    };
    draw();
  },
};

// [요리 끝] 리포트 (스크롤 중 패럴랙스)
SCREENS.report = {
  render(view, id) {
    const r = rec(id) ?? DB.recipes[0];
    const last = S.lastCook?.id === r.id ? S.lastCook : { minutes: r.minutes, photo: 0 };
    const shot = cookPhotos(r)[last.photo ?? 0] ?? cookPhotos(r)[0];
    const used = new Set();
    let keep = true;
    // 오늘 바뀐 점: 숟가락 단위 재료 하나를 1 늘린 걸로 보여줘요 (프로토타입 예시)
    const spoon = r.ingredients.find((x) => /(\d+)숟가락/.test(x.amount));
    const changed = spoon ? (() => {
      const n = +spoon.amount.match(/(\d+)숟가락/)[1];
      return en ? [ingName(spoon.id), spoon.label_en.replace(/^\d+ tbsp.*/, `${n} tbsp`), `${n + 1} tbsp`] : [ingName(spoon.id), `${n}숟가락`, `${n + 1}숟가락`];
    })() : null;
    const learned = [...pick(r, "learn_points").slice(0, 2), t("report.heat_note", { type: t("kitchen.type_" + S.kitchen.type), level: 5 })];
    const usable = r.ingredients.filter((x) => !ING[x.id]?.is_pantry && x.id !== "water");
    const draw = () => {
      view.innerHTML = `
        ${navHTML({ left: "", title: pick(r, "name"), fade: true })}
        <div class="scroll">
          <div class="hero"><img src="${esc(shot.src)}" alt=""></div>
          <div class="page">
            <div class="title-row text-footnote-regular muted"><span>${esc(fmtDate(daysAgo(0)))}</span><span>${esc(t("report.with_mitzy", { minutes: last.minutes }))}</span></div>
            <h1 class="text-title1-emphasized" style="margin-top:var(--space-4)">${esc(pick(r, "name"))}</h1>
            <section class="section"><h2 class="text-title3-emphasized">${esc(t("report.learned"))}</h2>
              <ul class="card glass steps">${learned.map((s) => `<li class="row">${I.bulb()}<div class="text text-body-regular">${esc(s)}</div></li>`).join("")}</ul></section>
            <section class="section"><h2 class="text-title3-emphasized">${esc(t("report.changed"))}</h2>
              <ul class="card glass info">
                ${changed ? `<li class="row"><div class="text"><span class="text-subheadline-regular muted">${esc(changed[0])}</span>
                  <span style="display:inline-flex;gap:var(--space-8);align-items:center"><s class="text-subheadline-regular subtle">${esc(changed[1])}</s><span class="muted">→</span><span class="text-headline-regular">${esc(changed[2])}</span></span></div></li>` : ""}
                <li class="row"><div class="text"><span class="text-body-regular">${esc(t("report.keep"))}</span><button class="switch" type="button" role="switch" aria-checked="${keep}" id="keep"></button></div></li>
              </ul></section>
            <section class="section"><h2 class="text-title3-emphasized">${esc(t("report.used_up"))}</h2>
              <div class="chips">${usable.map((x) => glassChip(esc(ingName(x.id)), { on: used.has(x.id), attrs: `data-id="${x.id}"` })).join("")}</div></section>
          </div>
        </div>
        <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="save">${esc(t("report.save"))}</button></div>`;
      watchScroll(view);
      $(view, "#keep").onclick = () => { keep = !keep; $(view, "#keep").setAttribute("aria-checked", keep); };
      on(view, "[data-id]", (el) => { const x = el.dataset.id; used.has(x) ? used.delete(x) : used.add(x); const y = $(view, ".scroll").scrollTop; draw(); $(view, ".scroll").scrollTop = y; });
      $(view, "#save").onclick = () => {
        S.fridge = S.fridge.filter((f) => !used.has(f.id));
        let d = dexEntry(r.id);
        const isNew = !d || d.count === 0;
        if (!d) { d = { id: r.id, count: 0, known: false, photo: null }; S.dex.push(d); }
        d.count += 1;
        if (d.photo == null) d.photo = last.photo ?? 0;
        save();
        go(isNew ? "/unlock/" + r.id : "/dex-item/" + r.id);
      };
    };
    draw();
  },
};

// 레벨 진행 (도감 · 잠금 해제 공통)
const levelBlock = () => {
  const have = newDishes() % GOAL;
  const left = GOAL - have;
  return { have, left, lv: level(), pct: (have / GOAL) * 100 };
};

// [요리 끝] 새 요리 잠금 해제 (새 요리일 때만)
SCREENS.unlock = {
  render(view, id) {
    const r = rec(id) ?? DB.recipes[0];
    const d = dexEntry(r.id);
    const shot = cookPhotos(r)[d?.photo ?? 0];
    const nth = S.dex.filter((x) => x.count > 0).findIndex((x) => x.id === r.id) + 1 || newDishes();
    const L = levelBlock();
    view.innerHTML = `
      <div class="page" style="padding-top:calc(var(--status-h) + var(--space-24));text-align:center">
        <h1 class="text-title1-emphasized">${esc(t("unlock.title"))}</h1>
        <div class="card glass pad" style="margin:var(--space-24) var(--space-24) 0;animation:pop .5s cubic-bezier(.2,1.4,.4,1)">
          <div style="position:relative;height:170px;border-radius:var(--radius-thumb);overflow:hidden">
            <img src="${esc(shot.src)}" alt="" style="width:100%;height:100%;object-fit:cover">
            <span class="tag text-caption1-emphasized" style="position:absolute;left:8px;top:8px;gap:4px">${I.sparkle("icon-s")}${esc(t("unlock.badge"))}</span>
          </div>
          <p class="text-title3-emphasized" style="margin-top:var(--space-16)">${esc(pick(r, "name"))}</p>
          <p class="text-footnote-regular muted" style="margin-top:var(--space-4)">${esc(t("unlock.nth", { count: nth }))}</p>
        </div>
        <div style="text-align:left;margin-top:var(--space-48)">
          <p class="text-headline-regular">${esc(t("collection.to_next", { count: L.left, next: L.lv + 1 }))}</p>
          <div class="progress" style="margin-top:var(--space-12)"><i style="width:${L.pct}%"></i></div>
          <div class="title-row text-footnote-regular muted" style="margin-top:var(--space-8)"><span>${esc(t("common.level", { level: L.lv }))}</span><span>${esc(t("collection.progress_count", { have: L.have, goal: GOAL }))}</span></div>
        </div>
      </div>
      <div class="bottom"><div class="row2">
        <button class="btn glass text-headline-regular" type="button" id="share">${I.share()}${esc(t("unlock.share"))}</button>
        <button class="btn prominent text-headline-regular" type="button" id="view">${esc(t("unlock.view"))}</button>
      </div></div>`;
    $(view, "#share").onclick = () => toast(p("shared"), { bottom: 110 });
    $(view, "#view").onclick = () => go("/dex");
  },
};

// ======================= 도감 =======================

// [도감] 내 요리 도감
SCREENS.dex = {
  render(view) {
    const L = levelBlock();
    const made = S.dex.filter((d) => d.count > 0);
    const known = S.dex.filter((d) => d.count === 0 && d.known);
    const tile = (d) => {
      const r = rec(d.id);
      if (!r) return "";
      if (d.count > 0) {
        const shot = cookPhotos(r)[d.photo ?? 0] ?? cookPhotos(r)[0];
        return `<button class="tile" type="button" data-id="${d.id}"><span class="pic" style="position:relative;overflow:hidden"><img src="${esc(shot.src)}" alt="" style="width:100%;height:100%;object-fit:cover"><span class="count glass text-caption1-emphasized">${esc(t("collection.times", { count: d.count }))}</span></span>
          <span class="name text-subheadline-emphasized">${esc(pick(r, "name"))}</span></button>`;
      }
      return `<button class="tile" type="button" data-id="${d.id}"><span class="empty outline text-title3-emphasized muted">${esc(pick(r, "name").slice(0, en ? 6 : 2))}</span>
        <span><span class="name text-subheadline-emphasized" style="display:block">${esc(pick(r, "name"))}</span><span class="text-caption1-emphasized muted">${esc(t("collection.already_knew"))}</span></span></button>`;
    };
    const filled = made.length + known.length;
    const locked = Math.max(0, Math.ceil((filled + 1) / 3) * 3 - filled - 1, 8 - filled);
    view.innerHTML = `
      <div class="scroll"><div class="page has-tabbar">
        <div class="title-row">
          <h1 class="text-large-title-emphasized">${esc(t("collection.title"))}</h1>
          <button class="icon-btn glass" type="button" id="settings" aria-label="${esc(t("settings.title"))}">${I.gear()}</button>
        </div>
        <div class="card glass pad section" style="display:flex;gap:var(--space-12);align-items:center">
          ${mitzyFace(64)}
          <div class="text">
            <p class="glass text-subheadline-emphasized" style="display:inline-block;padding:var(--space-8) var(--space-12);border-radius:var(--radius-bubble) var(--radius-bubble) var(--radius-bubble) var(--radius-bubble-tail)">${esc(t("collection.to_next", { count: L.left, next: L.lv + 1 }))}</p>
            <div class="title-row text-caption1-emphasized muted" style="margin-top:var(--space-8)"><span>${esc(t("common.level", { level: L.lv }))}</span><span>${esc(t("collection.progress_count", { have: L.have, goal: GOAL }))}</span></div>
            <div class="progress" style="margin-top:var(--space-4)"><i style="width:${L.pct}%"></i></div>
          </div>
        </div>
        <div class="grid c3 section" style="row-gap:var(--space-16)">
          ${[...made, ...known].map(tile).join("")}
          ${Array.from({ length: locked }, () => `<div class="tile"><span class="empty glass subtle">${I.lock()}</span><span class="text-footnote-regular subtle">${esc(t("common.locked"))}</span></div>`).join("")}
          <button class="tile" type="button" id="add"><span class="empty outline">${I.plus("icon-l")}</span><span class="text-footnote-regular muted pre">${esc(t("collection.add_known"))}</span></button>
        </div>
      </div></div>
      ${tabbarHTML("dex")}`;
    $(view, "#settings").onclick = () => go("/settings");
    $(view, "#add").onclick = () => go("/known");
    on(view, "[data-id]", (el) => go("/dex-item/" + el.dataset.id));
  },
};

// [도감] 요리 상세 (스크롤 중 패럴랙스)
SCREENS["dex-item"] = {
  render(view, id) {
    const r = rec(id) ?? DB.recipes[0];
    const d = dexEntry(r.id) ?? { count: 0, photo: 0 };
    const shot = cookPhotos(r)[d.photo ?? 0] ?? cookPhotos(r)[0];
    view.innerHTML = `
      ${navHTML({ left: "back", title: pick(r, "name"), fade: true,
        right: `<button class="pill-btn glass text-headline-regular hide-on-scroll" type="button" id="photo">${I.photo()}${esc(t("collection.detail.change_photo"))}</button>` })}
      <div class="scroll">
        <div class="hero"><img src="${esc(shot.src)}" alt=""></div>
        <div class="page">
          <h1 class="text-title1-emphasized">${esc(pick(r, "name"))}</h1>
          <div class="stats">
            <div class="stat"><span class="text-caption1-emphasized muted">${esc(t("collection.detail.stat_made"))}</span><span class="text-headline-regular">${esc(t("common.times", { count: d.count }))}</span></div>
            <div class="stat"><span class="text-caption1-emphasized muted">${esc(t("collection.detail.stat_method"))}</span><span class="text-headline-regular">${esc(pick(r, "method")[0])}</span></div>
          </div>
          <section class="section"><h2 class="text-title3-emphasized">${esc(t("collection.detail.learned"))}</h2>
            <ul class="card glass steps">${pick(r, "learn_points").map((s) => `<li class="row">${I.bulb()}<div class="text text-body-regular">${esc(s)}</div></li>`).join("")}</ul></section>
          <button class="link-row glass section" type="button" id="mine">${I.recipe()}<span class="text text-headline-regular">${esc(t("collection.detail.my_version"))}</span><span class="text-subheadline-regular muted">${esc(t("common.minutes", { count: r.minutes }))}</span>${I.chev()}</button>
        </div>
      </div>
      <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="again">${I.redo()}${esc(t("collection.detail.cook_again"))}</button></div>`;
    bindNav(view, "/dex");
    watchScroll(view);
    $(view, "#photo").onclick = () => go("/dex-photo/" + r.id);
    $(view, "#mine").onclick = () => go("/recipe/" + r.id);
    $(view, "#again").onclick = () => { S.cooking = null; save(); go("/cooking/" + r.id); };
  },
};

// [도감] 대표 사진 바꾸기
SCREENS["dex-photo"] = {
  render(view, id) {
    const r = rec(id) ?? DB.recipes[0];
    const d = dexEntry(r.id);
    const shots = cookPhotos(r);
    let sel = d?.photo ?? 0;
    const draw = () => {
      view.innerHTML = `
        ${navHTML({ left: "close", title: t("collection.photo.title"), solid: true })}
        <div class="scroll"><div class="page with-nav">
          <p class="text-footnote-regular muted">${esc(t("collection.photo.body"))}</p>
          <div class="grid c2" style="margin-top:var(--space-16);row-gap:var(--space-16)">
            ${shots.map((s, n) => `<button class="tile" type="button" data-n="${n}"><span class="pic photo-sel ${n === sel ? "on" : ""}"><img src="${esc(s.src)}" alt=""><span class="photo-check" style="right:10px;bottom:10px">${I.check("icon-s")}</span></span>
              <span class="name text-subheadline-${n === sel ? "emphasized" : "regular muted"}">${esc(s.label)}</span></button>`).join("")}
            <button class="tile" type="button" id="phone"><span class="pic glass" style="display:grid;place-items:center">${I.camera()}</span><span class="name text-subheadline-regular muted">${esc(t("done.take_phone"))}</span></button>
          </div>
        </div></div>
        <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="use">${esc(t("collection.photo.use"))}</button></div>`;
      bindNav(view, "/dex-item/" + r.id);
      on(view, "[data-n]", (el) => { sel = +el.dataset.n; draw(); });
      $(view, "#phone").onclick = () => toast(p("not_ready"));
      $(view, "#use").onclick = () => { if (d) d.photo = sel; save(); go("/dex-item/" + r.id); setTimeout(() => toast(p("photo_saved")), 50); };
    };
    draw();
  },
};

// [도감] 이미 할 줄 아는 요리 추가
SCREENS.known = {
  render(view) {
    const picked = new Set();
    let q = "";
    const stage = (r) => (r.method.some((m) => m === "끓이기" || m === "졸이기") ? "stage_heat" : "stage_flip");
    const draw = () => {
      const list = DB.recipes.filter((r) => !dexEntry(r.id) && (!q || (r.name + r.name_en).toLowerCase().includes(q.toLowerCase())));
      view.innerHTML = `
        ${navHTML({ left: "close", title: t("collection.known.title"), solid: true })}
        <div class="scroll"><div class="page with-nav">
          <p class="text-footnote-regular muted">${esc(t("collection.known.body"))}</p>
          <label class="search glass" style="margin-top:var(--space-16)">${I.search("icon muted")}<input id="q" placeholder="${esc(t("collection.known.search"))}" value="${esc(q)}"></label>
          <ul class="card glass info" style="margin-top:var(--space-16)">
            ${list.map((r) => `<li class="row" data-id="${r.id}" style="cursor:pointer"><span class="check-circle ${picked.has(r.id) ? "on" : ""}">${picked.has(r.id) ? I.check("icon-s") : ""}</span>
              <div class="text"><span class="text-body-regular">${esc(pick(r, "name"))}</span><span class="text-subheadline-regular muted">${esc(t("collection.known." + stage(r)))}</span></div></li>`).join("")}
          </ul>
          <button class="chip dashed text-headline-regular" type="button" id="custom" style="width:100%;justify-content:center;margin-top:var(--space-16);min-height:var(--touch-control)">${I.plus()}${esc(t("collection.known.custom_title"))}</button>
          <p class="text-footnote-regular muted" style="text-align:center;margin-top:var(--space-8)">${esc(t("collection.known.custom_body"))}</p>
        </div></div>
        <div class="bottom"><button class="btn prominent text-headline-regular" type="button" id="cta" ${picked.size ? "" : "disabled"}>${esc(t("collection.known.add", { count: picked.size }))}</button></div>`;
      bindNav(view, "/dex");
      const input = $(view, "#q");
      input.oninput = () => { q = input.value; const pos = input.selectionStart; draw(); const n = $(view, "#q"); n.focus(); n.setSelectionRange(pos, pos); };
      on(view, "[data-id]", (el) => { const id = el.dataset.id; picked.has(id) ? picked.delete(id) : picked.add(id); const y = $(view, ".scroll").scrollTop; draw(); $(view, ".scroll").scrollTop = y; });
      $(view, "#custom").onclick = () => toast(p("not_ready"));
      $(view, "#cta").onclick = () => { picked.forEach((id) => S.dex.push({ id, count: 0, known: true, photo: null })); save(); go("/dex"); };
    };
    draw();
  },
};

// [도감] 설정
SCREENS.settings = {
  render(view) {
    const row = (id, label, value = "") => `<li class="row" id="${id}" style="cursor:pointer"><div class="text"><span class="text-body-regular">${esc(label)}</span>
      <span class="text-body-regular muted" style="display:inline-flex;align-items:center;gap:var(--space-4)">${esc(value)}${I.chev()}</span></div></li>`;
    view.innerHTML = `
      ${navHTML({ left: "back", title: t("settings.title"), solid: true })}
      <div class="scroll"><div class="page with-nav">
        <ul class="card glass info">
          ${row("kitchen", t("settings.kitchen"), kitchenSummary())}
          ${row("mitzy", t("settings.mitzy"), t("settings.connected"))}
          ${row("noti", t("settings.notifications"))}
          ${row("account", t("settings.account"))}
        </ul>
        <p class="text-footnote-regular muted" style="margin:var(--space-8) var(--space-16) 0">${esc(t("settings.moved_hint"))}</p>
      </div></div>`;
    bindNav(view, "/dex");
    $(view, "#kitchen").onclick = () => go("/kitchen/settings");
    ["mitzy", "noti", "account"].forEach((id) => ($(view, "#" + id).onclick = () => toast(p("not_ready"))));
  },
};
