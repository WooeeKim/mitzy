// ds-audit — 실제 화면에 Dark · English 모드를 잠깐 걸고 스크린샷을 찍은 뒤 원래 모드로 되돌려요.
// 복제본으로 확인하면 덮어쓴 값이 빠져서 틀리게 보여요. 꼭 실제 프레임에서 해요.
// 한 번에 스크린샷은 5장까지 돌아와요. 화면이 많으면 FRAME_IDS 를 5개씩 나눠 여러 번 실행해요.
const FRAME_IDS = ['42:9520'];
const DARK = true;
const ENGLISH = true;

const fg = (await figma.variables.getLocalVariablesAsync()).find(v => v.name === 'color/fg');
const kitVar = await figma.variables.getVariableByIdAsync(Object.values(fg.valuesByMode)[0].id);
const kit = await figma.variables.getVariableCollectionByIdAsync(kitVar.variableCollectionId); // iOS 27 Colors
const copy = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Copy');
const dark = kit.modes.find(m => /dark/i.test(m.name)).modeId, en = copy.modes.find(m => m.name === 'en').modeId;

const frames = (await Promise.all(FRAME_IDS.slice(0, 5).map(id => figma.getNodeByIdAsync(id)))).filter(Boolean);
const saved = new Map(frames.map(F => [F.id, Object.assign({}, F.explicitVariableModes)]));
for (const F of frames) { if (DARK) F.setExplicitVariableModeForCollection(kit, dark); if (ENGLISH) F.setExplicitVariableModeForCollection(copy, en); }
try {
  for (const F of frames) await F.screenshot({ scale: 0.45 });
} finally {
  for (const F of frames) for (const c of [kit, copy]) { const m = saved.get(F.id)[c.id]; if (m) F.setExplicitVariableModeForCollection(c, m); else F.clearExplicitVariableModeForCollection(c); }
}
return { checked: frames.map(F => F.name), restored: true };
