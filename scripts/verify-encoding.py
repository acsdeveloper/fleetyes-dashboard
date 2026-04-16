files = [
    (r'apps\v4\app\(dashboard)\drivers\page.tsx', [827, 881]),
    (r'apps\v4\app\(dashboard)\compliance\training-tab.tsx', [51, 415, 562, 745, 746, 782, 784, 844]),
]
import sys
for path, lines in files:
    with open(path, encoding='utf-8') as f:
        all_lines = f.readlines()
    print(f'--- {path} ---')
    for ln in lines:
        if ln < len(all_lines):
            line = all_lines[ln].rstrip()[:100]
            print(f'L{ln+1}: {line}')
