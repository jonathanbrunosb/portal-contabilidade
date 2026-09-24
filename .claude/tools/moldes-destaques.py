# -*- coding: utf-8 -*-
"""Imagens dos slides-molde do carrossel, tiradas dos SVGs do Figma.

Rode da raiz do projeto:  python .claude/tools/moldes-destaques.py
Depois atualize data/destaques.json (formato "molde") e suba a versao.

Os moldes do usuario ficam em projeto/comunicados/*.svg, 2000x519 (proporcao
3,85 do carrossel). O Figma exporta o texto como contorno (path), entao o
texto do slide nao sai daqui: vem dos dados, em HTML. Daqui saem so as imagens,
em assets/destaques/:

  <nome>-fundo.webp  as camadas que ocupam a altura toda (degrade, foto de
                     campanha), recortadas como o Figma recorta, 2000x519.
  <nome>-cena.webp   as pecas soltas (capturas, notebook, o X do "antes"),
                     nas posicoes exatas do molde, sobre fundo transparente,
                     recortadas na zona das imagens do slide (53% da faixa,
                     do lado onde estao as pecas). O CSS poe a cena inteira
                     nessa zona, entao a composicao do Figma se mantem.

Pecas com sombra no Figma (<g filter>) levam a sombra junto. A cena sai em
escala 2 quando as capturas vieram grandes o bastante, para nao borrar em tela
de alta densidade.

FUNDOS_BLOQUEADOS lista fundos que nao podem ir para o portal: o do IFRS 16 e
uma previa da VectorStock (a marca d'agua foi cortada no Figma, mas a licenca
continua faltando). O slide fica com o degrade do portal ate chegar uma imagem
licenciada.
"""
import base64
import glob
import io
import os
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET

from PIL import Image, ImageFilter

LARGURA, ALTURA = 2000, 519
ZONA = 1060  # 53% da faixa: a largura de .dqb-imagens no CSS
FUNDOS_BLOQUEADOS = {'IFRS 16': 'previa da VectorStock sem licenca'}
NS = {'s': 'http://www.w3.org/2000/svg'}
XLINK = '{http://www.w3.org/1999/xlink}href'


def slug(texto):
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', texto.lower()).strip('-')


def matriz(transform):
    """a, d, e, f de scale()/matrix() (os moldes nao giram nem inclinam)."""
    numeros = [float(n) for n in re.findall(r'-?[\d.]+(?:e-?\d+)?', transform or '')]
    if transform.startswith('scale'):
        sx = numeros[0]
        return sx, numeros[1] if len(numeros) > 1 else sx, 0.0, 0.0
    a, _, _, d, e, f = numeros
    return a, d, e, f


def caixa_do_path(d):
    numeros = [float(n) for n in re.findall(r'-?[\d.]+', d)]
    # "M410 70H30V450H410V70Z": H traz x, V traz y; basta o maior e o menor.
    xs = [numeros[0]] + [float(v) for v in re.findall(r'H(-?[\d.]+)', d)]
    ys = [numeros[1]] + [float(v) for v in re.findall(r'V(-?[\d.]+)', d)]
    return min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)


def ler_molde(caminho):
    raiz = ET.parse(caminho).getroot()
    imagens = {}
    for im in raiz.iter('{%s}image' % NS['s']):
        dados = re.sub(r'\s', '', im.get(XLINK).split('base64,', 1)[1])
        imagens[im.get('id')] = Image.open(io.BytesIO(base64.b64decode(dados))).convert('RGBA')
    padroes = {}
    for p in raiz.iter('{%s}pattern' % NS['s']):
        use = p.find('s:use', NS)
        padroes[p.get('id')] = (use.get(XLINK).lstrip('#'), matriz(use.get('transform', 'scale(1)')))
    sombras = {}
    for f in raiz.iter('{%s}filter' % NS['s']):
        desloc = f.find('s:feOffset', NS)
        desfoque = f.find('s:feGaussianBlur', NS)
        cores = f.findall('s:feColorMatrix', NS)
        if desloc is not None and desfoque is not None:
            alfa = float(cores[-1].get('values').split()[-2]) if cores else .25
            sombras[f.get('id')] = (float(desloc.get('dy', 0)), float(desloc.get('dx', 0)),
                                    float(desfoque.get('stdDeviation')), alfa)
    camadas, cor_base = [], None

    def visitar(no, sombra=None):
        nonlocal cor_base
        for filho in no:
            tag = filho.tag.split('}')[1]
            if tag == 'g':
                filtro = re.search(r'url\(#([^)]+)\)', filho.get('filter', ''))
                visitar(filho, sombras.get(filtro.group(1)) if filtro else sombra)
                continue
            if tag not in ('rect', 'path'):
                continue
            preenchimento = filho.get('fill', '')
            if tag == 'rect':
                x, y = float(filho.get('x', 0)), float(filho.get('y', 0))
                w, h = float(filho.get('width')), float(filho.get('height'))
            elif preenchimento.startswith('url('):
                x, y, w, h = caixa_do_path(filho.get('d'))
            else:
                continue
            padrao = re.search(r'url\(#([^)]+)\)', preenchimento)
            if padrao and padrao.group(1) in padroes:
                ref, m = padroes[padrao.group(1)]
                camadas.append({'imagem': imagens[ref], 'm': m, 'caixa': (x, y, w, h), 'sombra': sombra})
            elif tag == 'rect' and w >= LARGURA * .98 and h >= ALTURA * .98 and preenchimento.startswith('#'):
                cor_base = preenchimento  # o retangulo de cor chapada por baixo de tudo

    corpo = raiz.find('s:g', NS)
    visitar(corpo if corpo is not None else raiz)
    return camadas, cor_base


def recortar(camada, escala=1):
    """A imagem como o Figma mostra dentro da caixa (patternContentUnits =
    objectBoundingBox: o `use` leva o pixel da imagem para a fracao da caixa)."""
    imagem, (a, d, e, f), (_, _, w, h) = camada['imagem'], camada['m'], camada['caixa']
    x0, x1 = -e / a, (1 - e) / a
    y0, y1 = -f / d, (1 - f) / d
    recorte = imagem.crop((round(x0), round(y0), round(x1), round(y1)))
    return recorte.resize((max(1, round(w * escala)), max(1, round(h * escala))), Image.LANCZOS)


def colar(tela, camada, dx, escala):
    x, y, _, _ = camada['caixa']
    peca = recortar(camada, escala)
    px, py = round((x - dx) * escala), round(y * escala)
    if camada['sombra']:
        dy, dxs, desvio, alfa = camada['sombra']
        sombra = Image.new('RGBA', tela.size, (0, 0, 0, 0))
        bloco = Image.new('RGBA', peca.size, (0, 0, 0, 0))
        bloco.putalpha(peca.getchannel('A').point(lambda v: round(v * alfa)))
        sombra.alpha_composite(bloco, (px + round(dxs * escala), py + round(dy * escala)))
        tela.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(desvio * escala)))
    tela.alpha_composite(peca, (px, py))


def salvar(imagem, caminho):
    imagem.save(caminho, 'WEBP', quality=86, method=6)
    return f'{imagem.size[0]}x{imagem.size[1]} {os.path.getsize(caminho) // 1024} KB'


def main():
    destino = os.path.join('assets', 'destaques')
    os.makedirs(destino, exist_ok=True)
    for caminho in sorted(glob.glob(os.path.join('projeto', 'comunicados', '*.svg'))):
        titulo = os.path.splitext(os.path.basename(caminho))[0]
        nome = slug(titulo)
        camadas, cor_base = ler_molde(caminho)
        fundo = [c for c in camadas if c['caixa'][3] >= ALTURA * .98]
        pecas = [c for c in camadas if c['caixa'][3] < ALTURA * .98]
        print(f'\n== {titulo}  (cor de base {cor_base or "nenhuma"})')
        if fundo and titulo in FUNDOS_BLOQUEADOS:
            print(f'   fundo ignorado: {FUNDOS_BLOQUEADOS[titulo]}')
        elif fundo:
            tela = Image.new('RGBA', (LARGURA, ALTURA), cor_base or (0, 0, 0, 0))
            for c in fundo:
                colar(tela, c, 0, 1)
            print(f'   {nome}-fundo.webp: {salvar(tela.convert("RGB"), os.path.join(destino, nome + "-fundo.webp"))}')
        if not pecas:
            continue
        # As pecas ficam de um lado; o texto, do outro.
        centro = sum(c['caixa'][0] + c['caixa'][2] / 2 for c in pecas) / len(pecas)
        lado = 'esquerda' if centro < LARGURA / 2 else 'direita'
        dx = 0 if lado == 'esquerda' else LARGURA - ZONA
        escala = 2 if min(c['imagem'].width / c['caixa'][2] for c in pecas) >= 1.8 else 1
        tela = Image.new('RGBA', (ZONA * escala, ALTURA * escala), (0, 0, 0, 0))
        for c in pecas:
            colar(tela, c, dx, escala)
        print(f'   {nome}-cena.webp: {salvar(tela, os.path.join(destino, nome + "-cena.webp"))}  lado "{lado}", escala {escala}')


if __name__ == '__main__':
    sys.exit(main())
