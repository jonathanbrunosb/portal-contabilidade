# -*- coding: utf-8 -*-
"""Contraste do texto dos slides sobre o fundo REAL (imagem, desfoque, veu,
listras, arte do molde) -- o .claude/tools/contraste.js nao enxerga imagem.

Com o servidor.py no ar, rode da raiz do projeto:
    python .claude/tools/carrossel-teste/contraste.py 1440 2400
    python .claude/tools/carrossel-teste/contraste.py 1024 2000 "&gutter=32"
    python .claude/tools/carrossel-teste/contraste.py 600 3300 "&gutter=16&largura=343"

Como mede: o Edge headless exporta a caixa de cada linha de texto e fotografa
o fundo com o texto escondido; cada linha e medida contra o p95 dos pixels do
fundo sob ela (criterio) e o p99 (mostra os fios das listras). Minimo 4,5:1,
ou 3:1 para texto grande. Sempre com --incognito: sem isso o Edge reaproveita
o CSS do cache e a medida nao muda depois de editar.
"""
import html
import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image

EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
SAIDA = os.path.join(tempfile.gettempdir(), 'portal-carrossel-teste')
os.makedirs(SAIDA, exist_ok=True)
largura, altura = int(sys.argv[1]), int(sys.argv[2])
extra = sys.argv[3] if len(sys.argv) > 3 else ''
base = f'http://127.0.0.1:5599/__teste.html?x=1{extra}'
comum = ['--headless=new', '--incognito', '--disable-gpu', '--hide-scrollbars', f'--window-size={largura},{altura}',
         f'--user-data-dir={os.path.join(SAIDA, "perfil")}', '--virtual-time-budget=4000']
dom = subprocess.run([EDGE, *comum, '--dump-dom', base + '&caixas=1'], capture_output=True, text=True,
                     encoding='utf-8', timeout=90).stdout
caixas = json.loads(html.unescape(re.search(r'<pre id="caixas">(.*?)</pre>', dom, re.S).group(1)))
foto = os.path.join(SAIDA, 'fundo.png')
subprocess.run([EDGE, *comum, f'--screenshot={foto}', base + '&semtexto=1'], capture_output=True, timeout=90)
im = Image.open(foto).convert('RGB')


def lum(rgb):
    def canal(v):
        v /= 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = rgb
    return .2126 * canal(r) + .7152 * canal(g) + .0722 * canal(b)


def cor(css):
    return tuple(int(float(n)) for n in re.findall(r'[\d.]+', css)[:3])


pior = {}
for cx in caixas:
    if cx['y'] + cx['h'] > im.height:
        continue
    lums = sorted(lum(p) for p in im.crop((cx['x'], cx['y'], cx['x'] + cx['w'], cx['y'] + cx['h'])).get_flattened_data())
    texto = lum(cor(cx['cor']))
    razao = lambda fundo: (texto + .05) / (fundo + .05)
    p95, p99 = razao(lums[int(len(lums) * .95) - 1]), razao(lums[int(len(lums) * .99) - 1])
    chave = (cx['slide'], cx['classe'])
    if chave not in pior or p95 < pior[chave][0]:
        pior[chave] = (p95, p99, 3 if cx['grande'] else 4.5)
for (slide, classe), (p95, p99, minimo) in pior.items():
    print(f'{"ok " if p95 >= minimo else "BAIXO"} p95 {p95:5.2f}  p99 {p99:5.2f}  (min {minimo})  {slide[:28]:28} {classe}')
