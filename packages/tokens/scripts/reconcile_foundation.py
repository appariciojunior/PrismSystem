#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

def load_json(p):
    return json.loads(Path(p).read_text())

def load_old_tokens(commit='0eb717e'):
    cmd = ['git', 'show', f'{commit}:packages/tokens/src/tokens.json']
    out = subprocess.check_output(cmd)
    return json.loads(out.decode('utf-8'))

def main():
    print('Loading current tokens...')
    current = load_json(TOKENS)
    print('Loading reference tokens from commit 0eb717e...')
    old = load_old_tokens('0eb717e')
    # Replace foundation section
    if 'foundation' in old:
        current['foundation'] = old['foundation']
        Path(TOKENS).write_text(json.dumps(current, indent=2, ensure_ascii=False) + '\n')
        print('Restored `foundation` from 0eb717e into', TOKENS)
    else:
        print('Reference commit does not contain foundation')

if __name__ == '__main__':
    main()
