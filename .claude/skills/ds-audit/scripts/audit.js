// ds-audit — 03 Screens 화면이 AGENTS.md 디자인 규칙을 지키는지 검사해요. 읽기만 하고 아무것도 고치지 않아요.
// 쓰는 법: Figma MCP use_figma 의 code 에 이 파일 내용을 그대로 붙여 넣어요.
// 일부 화면만 보려면 FRAME_IDS 에 화면 id 를 넣어요 (비우면 페이지의 모든 화면).
const PAGE_ID = '0:1';
const FRAME_IDS = [];

figma.skipInvisibleInstanceChildren = false;
const SPACE = [4, 8, 12, 16, 20, 24, 32, 48];
const RADIUS_KIT = [12, 24, 28, 32, 34, 36]; // iOS 27 키트 · 기기 모서리에서 나온 값 (토큰 없이 써도 됨)
const INSTANCE_NAME = /^(tile|chip|btn|card|dish|picked|nav|icon|thumb|step|prep|learned)\//;
const SYMBOL = /^[\u{100000}-\u{10FFFF}\s]+$/u; // SF Symbols 글자
const NUMERIC = /^[\d\s/:×.,~–-]+$/;               // 번호 · 시간 같은 값

const vars = await figma.variables.getLocalVariablesAsync();
const radiusTokens = new Set(vars.filter(v => v.name.startsWith('radius/')).map(v => Object.values(v.valuesByMode)[0]));
const page = await figma.getNodeByIdAsync(PAGE_ID); await page.loadAsync();
const frames = FRAME_IDS.length ? (await Promise.all(FRAME_IDS.map(id => figma.getNodeByIdAsync(id)))).filter(Boolean) : page.children.filter(n => n.type === 'FRAME');

const result = []; let errorCount = 0, warnCount = 0;
for (const F of frames) {
  const err = [], warn = [];
  async function walk(n, inInstance) {
    if (n !== F && !inInstance) {
      const bv = n.boundVariables || {};
      if (n.type === 'INSTANCE') {
        const main = await n.getMainComponentAsync();
        if (!main) err.push(`원본 없는 인스턴스: ${n.name}`);
        else {
          const props = n.componentProperties;
          for (const [key, p] of Object.entries(props)) {
            if (p.type !== 'TEXT' || (p.boundVariables && p.boundVariables.value)) continue;
            const value = String(p.value).trim(); const label = key.split('#')[0];
            // 이 변형에서 실제로 보이는 글자에 쓰이는 속성만 봐요 (숨겨진 줄 · 다른 변형 전용 속성은 건너뜀)
            const refs = n.findAll(x => x.componentPropertyReferences && x.componentPropertyReferences.characters === key);
            const shown = refs.some(x => { for (let a = x; a && a !== n; a = a.parent) if (!a.visible) return false; return true; });
            if (value && shown && !SYMBOL.test(value) && !NUMERIC.test(value)) warn.push(`Copy 연결 없는 속성 ${label}: "${value.slice(0, 18)}" (${n.name})`);
          }
          const glassSet = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent.name : main.name;
          if (n.name === 'Glass' && n.parent.type === 'FRAME' && n.parent.children[0] === n && /^Liquid Glass - Regular - (Small|Medium)$/.test(glassSet) && !/Prominent=True/.test(main.name)) warn.push(`키트 유리를 바로 씀 → Mitzy/Card 배경으로: ${n.parent.name}`);
        }
      }
      if (n.type === 'TEXT') {
        const c = n.characters.trim();
        if (!bv.characters && c && !SYMBOL.test(c) && !NUMERIC.test(c)) warn.push(`Copy 연결 없음: "${c.slice(0, 20)}"`);
        if (!n.textStyleId || n.textStyleId === figma.mixed) err.push(`텍스트 스타일 없음: "${c.slice(0, 20)}"`);
        if (/ · /.test(c)) warn.push(`가운데 점으로 이은 문구: "${c.slice(0, 24)}"`);
      }
      if (n.type !== 'INSTANCE' && !n.isMask) for (const prop of ['fills', 'strokes']) if (Array.isArray(n[prop])) for (const p of n[prop]) if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color)) err.push(`직접 넣은 색(${prop}): ${n.name}`);
      if (n.type === 'FRAME' && n.layoutMode !== 'NONE') {
        const flow = n.children.filter(c => c.visible && c.layoutPositioning !== 'ABSOLUTE');
        if (!bv.itemSpacing && n.itemSpacing && n.primaryAxisAlignItems !== 'SPACE_BETWEEN' && flow.length > 1) (SPACE.includes(n.itemSpacing) ? warn : err).push(`간격 ${n.itemSpacing} ${SPACE.includes(n.itemSpacing) ? '토큰에 안 묶임' : '토큰 밖 값'}: ${n.name}`);
        for (const side of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) if (!bv[side] && n[side]) (SPACE.includes(n[side]) ? warn : err).push(`여백 ${n[side]} ${SPACE.includes(n[side]) ? '토큰에 안 묶임' : '토큰 밖 값'}: ${n.name}`);
        if (n.primaryAxisAlignItems === 'SPACE_BETWEEN' && n.primaryAxisSizingMode === 'AUTO' && flow.length > 1) err.push(`space-between 인데 폭이 내용에 맞춰져 간격이 0: ${n.name} (FILL로)`);
        if (INSTANCE_NAME.test(n.name)) warn.push(`인스턴스 이름인데 프레임 (분리된 컴포넌트?): ${n.name}`);
      }
      if ((n.type === 'FRAME' || n.type === 'RECTANGLE') && n.cornerRadius && n.cornerRadius !== figma.mixed && !bv.topLeftRadius) {
        const r = n.cornerRadius, pill = Math.min(n.width, n.height) / 2 <= r + 1;
        if (pill || radiusTokens.has(r)) warn.push(`모서리 ${r} → 토큰에 묶기(${pill ? 'radius/full' : '같은 값 토큰'}): ${n.name}`);
        else if (!RADIUS_KIT.includes(r)) warn.push(`모서리 ${r}: 키트 · 동심원 값인지 확인: ${n.name}`);
      }
    }
    if ('children' in n) for (const c of n.children) await walk(c, inInstance || (n !== F && n.type === 'INSTANCE'));
  }
  await walk(F, false);
  const count = list => { const m = {}; list.forEach(x => m[x] = (m[x] || 0) + 1); return Object.entries(m).map(([k, c]) => c > 1 ? `${k} ×${c}` : k); };
  errorCount += err.length; warnCount += warn.length;
  if (err.length || warn.length) result.push({ frame: F.name, id: F.id, errors: count(err).slice(0, 25), warnings: count(warn).slice(0, 25) });
}
return { checked: frames.length, errors: errorCount, warnings: warnCount, frames: result };
