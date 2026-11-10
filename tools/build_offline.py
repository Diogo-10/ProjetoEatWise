"""Gera o pacote para baixar (download/EatWise-Prototipo.zip).

Site e app viram arquivos HTML únicos, com CSS, JS, receitas e fotos
embutidos, para abrir com dois cliques sem servidor (file://).
Sem internet, o reconhecimento por imagem usa o modo simulado.

Uso: python3 tools/build_app.py && python3 tools/build_offline.py
"""
import base64
import re
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tools'))
from bundle import bundle  # noqa: E402

PASTA = 'EatWise - Prototipo'
LEIA_ME = """EatWise - protótipo do grupo Seven
====================================

Como abrir
----------
Dê dois cliques no arquivo e ele abre no navegador (Chrome, Edge, Firefox ou Safari).
Não precisa instalar nada nem estar logado em nenhum serviço.

- "EatWise - Site (computador).html": versão web, com menu lateral.
- "EatWise - App (celular).html": versão de celular. No computador, aparece dentro de uma moldura de celular.

O que funciona abrindo direto do arquivo
----------------------------------------
- Todas as telas: inventário com validade, receitas recomendadas, perfil e preferências.
- Adicionar ingredientes escrevendo ("2 ovos, tomate e arroz").
- Foto dos alimentos: com internet, usa visão computacional (TensorFlow.js). Sem internet,
  entra o modo simulado e a tela avisa.
- Produto embalado: escolher uma foto da galeria e reconhecer a embalagem.
- Os dados ficam salvos no próprio navegador.

Limitação
---------
A câmera ao vivo do registro de produto embalado só abre pelo endereço https
(GitHub Pages). Abrindo o arquivo, use "Galeria" ou "Tirar foto".

Fotos dos produtos: Open Food Facts (licença CC BY-SA). Detalhes em "Creditos das fotos.md".
As sugestões de receitas não substituem a orientação de um nutricionista.
"""


def imagens_embutidas(html):
    imgs = {p.stem: 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode()
            for p in sorted((ROOT / 'assets' / 'produtos').glob('*.jpg'))}
    mapa = 'const IMG_DATA = {' + ','.join(f"'{k}':'{v}'" for k, v in imgs.items()) + '};\nconst IMG = k => IMG_DATA[k];'
    antigo = "const IMG = k => `assets/produtos/${k}.jpg`;"
    assert antigo in html, 'linha das imagens não encontrada'
    return html.replace(antigo, mapa)


def limpar_pwa(html):
    html = re.sub(r'<link rel="(manifest|apple-touch-icon)"[^>]*>\n?', '', html)
    html = re.sub(r'<link rel="icon" href="icons/[^"]*"[^>]*>\n?', '', html)
    return re.sub(r"if \('serviceWorker' in navigator.*?\n\}\n", '', html, flags=re.S)


def main():
    saida = ROOT / 'download' / PASTA
    shutil.rmtree(saida, ignore_errors=True)
    saida.mkdir(parents=True)
    site = imagens_embutidas(bundle(ROOT / 'index.html'))
    app = imagens_embutidas(limpar_pwa((ROOT / 'app' / 'index.html').read_text(encoding='utf-8')))
    (saida / 'EatWise - Site (computador).html').write_text(site, encoding='utf-8')
    (saida / 'EatWise - App (celular).html').write_text(app, encoding='utf-8')
    (saida / 'LEIA-ME.txt').write_text(LEIA_ME, encoding='utf-8')
    shutil.copy(ROOT / 'assets' / 'produtos' / 'CREDITOS.md', saida / 'Creditos das fotos.md')
    destino = ROOT / 'download' / 'EatWise-Prototipo.zip'
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(saida.iterdir()):
            z.write(f, f'{PASTA}/{f.name}')
    shutil.rmtree(saida)
    print(destino, destino.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
