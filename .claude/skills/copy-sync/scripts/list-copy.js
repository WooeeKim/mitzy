// copy-sync 1단계 — Figma Copy 변수 이름을 모두 돌려줘요 (읽기만 해요).
// 결과 배열을 그대로 파일(예: 스크래치 폴더의 copy-names.json)에 저장해 scripts/copy_payload.py --existing 에 넘겨요.
const copy = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Copy');
const names = [];
for (const id of copy.variableIds) names.push((await figma.variables.getVariableByIdAsync(id)).name);
return JSON.stringify(names.sort());
