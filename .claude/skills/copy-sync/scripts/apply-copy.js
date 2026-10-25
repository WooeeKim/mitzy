// copy-sync 2단계 — 레포 문구를 Figma Copy 변수에 맞춰요.
// PAYLOAD 자리에 `python3 scripts/copy_payload.py --existing <이름 파일>` 출력(JSON)을 그대로 붙여 넣어요.
// MODE = 'dry' 로 먼저 돌려 바뀔 내용을 보고, 사람이 확인한 뒤 'apply' 로 다시 돌려요.
const MODE = 'dry';
const CREATE_DATA = [];   // 새로 만들 data/* 이름의 앞부분. 예: ['data/recipe/omurice'] — 화면에 새 레시피를 넣을 때만
const PAYLOAD = /*PAYLOAD*/ { rows: [], figma_only_data: [] };

const copy = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Copy');
const ko = copy.modes.find(m => m.name === 'ko').modeId, en = copy.modes.find(m => m.name === 'en').modeId;
const have = new Map();
for (const id of copy.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); have.set(v.name, v); }
const scopes = (have.get('common/next') || [...have.values()][0]).scopes;
const want = new Map(PAYLOAD.rows.map(r => [r[0], r]));
// 안전장치: PAYLOAD가 일부만 붙여 넣어졌으면 나머지 문구를 "없어진 것"으로 보고 지워버릴 수 있어요. 그럴 땐 멈춰요.
const i18nWant = PAYLOAD.rows.filter(r => !r[0].startsWith('data/')).length;
const i18nHave = [...have.keys()].filter(n => !n.startsWith('data/') && !n.startsWith('sample/')).length;
if (i18nWant < i18nHave * 0.8) throw new Error(`PAYLOAD의 화면 문구가 ${i18nWant}개뿐이에요 (Figma ${i18nHave}개). copy_payload.py 출력을 통째로 붙여 넣었는지 확인해요.`);
const report = { mode: MODE, create: [], update: [], skippedNewData: 0, deleted: [], keptInUse: [] };

for (const [name, k, e, ref] of PAYLOAD.rows) {
  const v = have.get(name);
  if (!v) {
    if (name.startsWith('data/') && !CREATE_DATA.some(p => name.startsWith(p))) { report.skippedNewData++; continue; }
    report.create.push(`${name}: ${k} / ${e}`);
    if (MODE === 'apply') { const nv = figma.variables.createVariable(name, copy, 'STRING'); nv.scopes = scopes; nv.setValueForMode(ko, k); nv.setValueForMode(en, e); nv.description = ref; }
    continue;
  }
  if (v.valuesByMode[ko] !== k || v.valuesByMode[en] !== e) {
    report.update.push(`${name}: "${v.valuesByMode[ko]}" → "${k}" / "${v.valuesByMode[en]}" → "${e}"`);
    if (MODE === 'apply') { v.setValueForMode(ko, k); v.setValueForMode(en, e); }
  }
  if (MODE === 'apply' && v.description !== ref) v.description = ref; // 코드에서 쓰는 위치 (Dev Mode에서 보임)
}

// 레포에서 없어진 이름: i18n 키(sample · data 제외)와 Figma에만 남은 data 이름
const gone = [...have.keys()].filter(n => (!n.startsWith('sample/') && !n.startsWith('data/') && !want.has(n)) || PAYLOAD.figma_only_data.includes(n));
if (gone.length) {
  const goneIds = new Map(gone.map(n => [have.get(n).id, n])); const used = new Set();
  for (const pid of ['0:1', '45:2687']) {
    const pg = await figma.getNodeByIdAsync(pid); await pg.loadAsync();
    for (const n of pg.findAll(() => true)) {
      const c = n.boundVariables && n.boundVariables.characters; if (c && goneIds.has(c.id)) used.add(goneIds.get(c.id));
      if (n.type === 'INSTANCE') for (const p of Object.values(n.componentProperties)) if (p.boundVariables && p.boundVariables.value && goneIds.has(p.boundVariables.value.id)) used.add(goneIds.get(p.boundVariables.value.id));
    }
  }
  for (const n of gone) { if (used.has(n)) report.keptInUse.push(n); else { report.deleted.push(n); if (MODE === 'apply') have.get(n).remove(); } }
}
for (const k of ['create', 'update', 'deleted', 'keptInUse']) if (report[k].length > 60) report[k] = report[k].slice(0, 60).concat(`… 외 ${report[k].length - 60}개`);
return report;
