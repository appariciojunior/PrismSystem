#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'src' / 'tokens.json'

def main():
    data = json.loads(TOKENS.read_text())
    changed = 0
    # Recursively traverse JSON to find any 'interactive' dict
    def traverse(obj):
        nonlocal changed
        if isinstance(obj, dict):
            if 'interactive' in obj and isinstance(obj['interactive'], dict):
                inter = obj['interactive']
                active = inter.get('active')
                if isinstance(active, dict):
                    text_node = active.get('text')
                    if not isinstance(text_node, dict):
                        return
                    if 'default' in text_node and isinstance(text_node['default'], dict) and 'value' in text_node['default']:
                        ref_value = '{interactive.active.text.default}'
                    elif 'value' in text_node:
                        ref_value = '{interactive.active.text}'
                    else:
                        return

                    icon_node = active.get('icon')
                    if icon_node is None:
                        active['icon'] = {'value': ref_value, 'type': 'color', 'description': 'Icon colour cascades from active text'}
                        changed += 1
                        return

                    if 'default' in icon_node and isinstance(icon_node['default'], dict):
                        prev = icon_node['default'].get('value')
                        icon_node['default']['value'] = ref_value
                        icon_node['default'].setdefault('type', 'color')
                        icon_node['default'].setdefault('description', 'Icon colour cascades from active text')
                        if prev != ref_value:
                            changed += 1
                    else:
                        prev = icon_node.get('value')
                        icon_node['value'] = ref_value
                        icon_node.setdefault('type', 'color')
                        icon_node.setdefault('description', 'Icon colour cascades from active text')
                        if prev != ref_value:
                            changed += 1
            # continue traversal
            for v in obj.values():
                traverse(v)
        elif isinstance(obj, list):
            for item in obj:
                traverse(item)

    traverse(data)

    if changed:
        TOKENS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f"Cascaded active.text to active.icon for {changed} themes in {TOKENS}")

if __name__ == '__main__':
    main()
