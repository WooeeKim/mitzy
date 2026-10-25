// tokens-export — Figma 변수(Color · Size · Type)와 텍스트 스타일을 읽어 tokens.json 내용을 돌려줘요.
// 색은 iOS 27 Colors 의 Light · Dark 모드로 각각 풀어서 실제 값을 적어요.
// 값을 풀기 위해 임시 프레임 2개를 만들고, 끝나면 바로 지워요 (파일에 남는 것 없음).
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const byName = n => colls.find(c => c.name === n);
const vars = await figma.variables.getLocalVariablesAsync();
const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('') + (c.a !== undefined && c.a < 0.999 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');
const out = { source: 'Figma 시디 GUI (o35yAGSYCSiuumWErSVqO3) — 직접 고치지 말고 tokens-export 스킬로 다시 만들어요', color: {}, space: {}, radius: {}, touch: {}, font: {}, text: {} };

const colorVars = vars.filter(v => v.variableCollectionId === byName('Color').id);
const alias = Object.values(colorVars[0].valuesByMode)[0];
const kit = await figma.variables.getVariableCollectionByIdAsync((await figma.variables.getVariableByIdAsync(alias.id)).variableCollectionId);
const temp = {};
for (const m of kit.modes) { const key = m.name.toLowerCase(); if (key !== 'light' && key !== 'dark') continue; const f = figma.createFrame(); f.name = 'tokens-export (임시)'; f.x = -99999; f.setExplicitVariableModeForCollection(kit, m.modeId); temp[key] = f; }
try {
  for (const v of colorVars) { const key = v.name.replace(/^color\//, ''); out.color[key] = {}; for (const [mode, f] of Object.entries(temp)) out.color[key][mode] = hex(v.resolveForConsumer(f).value); }
} finally { Object.values(temp).forEach(f => f.remove()); }

for (const v of vars.filter(v => v.variableCollectionId === byName('Size').id)) {
  const [group, key] = v.name.split('/'); const val = Object.values(v.valuesByMode)[0];
  if (out[group]) out[group][key] = val;
}
for (const v of vars.filter(v => v.variableCollectionId === byName('Type').id)) out.font[v.name.replace(/^font\//, '')] = Object.values(v.valuesByMode)[0];

const varName = {}; for (const v of vars) varName[v.id] = v.name;
for (const s of await figma.getLocalTextStylesAsync()) {
  if (s.name.startsWith('Icon/')) continue; // SF Symbols 는 웹에 안 씀
  const w = s.boundVariables && (s.boundVariables.fontStyle || s.boundVariables.fontWeight); const weightVar = w ? varName[w.id] : '';
  const lh = s.lineHeight.unit === 'PIXELS' ? s.lineHeight.value + 'px' : s.lineHeight.unit === 'PERCENT' ? s.lineHeight.value / 100 : 'normal';
  const ls = s.letterSpacing.value ? (s.letterSpacing.unit === 'PIXELS' ? +s.letterSpacing.value.toFixed(3) + 'px' : +(s.letterSpacing.value / 100).toFixed(4) + 'em') : '0';
  out.text[s.name] = { size: s.fontSize, lineHeight: lh, weight: weightVar ? weightVar.split('/').pop() : String(s.fontName.style).toLowerCase(), letterSpacing: ls };
}
return JSON.stringify(out, null, 2);
