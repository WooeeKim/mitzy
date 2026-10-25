// gui-change 1단계 — Figma Copy 변수의 한국어·영어 값을 모두 읽어요 (읽기만 해요).
// 결과 JSON 문자열을 파일(예: 스크래치 폴더의 figma-copy.json)에 그대로 저장한 뒤
//   python3 scripts/copy_diff.py <그 파일>
// 으로 레포 원본과 비교해요.
const copy = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Copy');
if (!copy) throw new Error('Copy 변수 묶음을 찾지 못했어요. 팀 파일(o35yAGSYCSiuumWErSVqO3)이 맞는지 확인해요.');
const ko = copy.modes.find(m => m.name === 'ko').modeId;
const en = copy.modes.find(m => m.name === 'en').modeId;
const out = {};
for (const id of copy.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name.startsWith('sample/')) continue;
  out[v.name] = [String(v.valuesByMode[ko]), String(v.valuesByMode[en])];
}
return JSON.stringify(out);
