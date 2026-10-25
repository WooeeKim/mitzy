"""Figma Copy 값과 레포 원본을 비교해요 — gui-change 스킬이 씀. 아무것도 고치지 않아요.

  python3 scripts/copy_diff.py <figma-copy.json>

figma-copy.json = .claude/skills/gui-change/scripts/read-copy.js 의 결과 (copy-sync도 같은 파일을 써요)
  {"common/next": ["다음", "Next"], ...}   (sample/* 는 빠져 있어요)

출력(JSON, 표준 출력):
  changed      : 값이 다른 문구. repo / figma 두 쪽 값과 레포에서 찾을 위치(ref)를 같이 줘요
  only_figma   : Figma에만 있는 이름. 레포에 원본이 없어서 사람이 정해야 해요
  same         : 같은 문구 개수
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from copy_payload import build_rows


def main(path):
    figma = {k: v for k, v in json.load(open(path, encoding="utf-8")).items() if not k.startswith("sample/")}
    repo = {r[0]: r for r in build_rows()}
    changed, only_figma, same = [], [], 0
    for name, (fko, fen) in sorted(figma.items()):
        if name not in repo:
            only_figma.append(name)
            continue
        _, rko, ren, ref = repo[name]
        if (rko, ren) == (fko, fen):
            same += 1
        else:
            changed.append({"name": name, "repo": [rko, ren], "figma": [fko, fen], "ref": ref})
    return {"changed": changed, "only_figma": only_figma, "same": same}


if __name__ == "__main__":
    result = main(sys.argv[1])
    json.dump(result, sys.stdout, ensure_ascii=False, indent=1)
    print(f"\n차이 {len(result['changed'])}개 · Figma에만 {len(result['only_figma'])}개 · 같음 {result['same']}개", file=sys.stderr)
