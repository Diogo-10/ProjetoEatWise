"""Junta o index.html com seus arquivos CSS, JS e dados em um único HTML.

Usado para gerar o app de celular (tools/build_app.py) e o pacote offline
(tools/build_offline.py). O site publicado usa os arquivos separados.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def bundle(index_path=ROOT / 'index.html'):
    html = Path(index_path).read_text(encoding='utf-8')
    base = Path(index_path).parent

    def css(m):
        return '<style>\n' + (base / m.group(1)).read_text(encoding='utf-8') + '</style>'
    html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)

    srcs = re.findall(r'<script src="([^"]+)"></script>\n', html)
    local = [s for s in srcs if not s.startswith('http')]
    parts = []
    for s in local:
        text = (base / s).read_text(encoding='utf-8')
        if not text.endswith('\n'):
            text += '\n'
        parts.append(text)
    # dados das receitas embutidos, para funcionar sem servidor (file://)
    receitas = base / 'data' / 'receitas.json'
    if receitas.exists():
        data = json.loads(receitas.read_text(encoding='utf-8'))
        parts.insert(0, 'window.EW_RECEITAS = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    first = f'<script src="{local[0]}"></script>\n'
    start = html.index(first)
    end = html.index(f'<script src="{local[-1]}"></script>\n') + len(f'<script src="{local[-1]}"></script>\n')
    block = html[start:end]
    for s in local:
        block = block.replace(f'<script src="{s}"></script>\n', '')
    html = html[:start] + block + '<script>\n' + ''.join(parts) + '</script>\n' + html[end:]
    return html


if __name__ == '__main__':
    print(len(bundle()))
