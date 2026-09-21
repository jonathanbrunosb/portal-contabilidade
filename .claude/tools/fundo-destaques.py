# -*- coding: utf-8 -*-
"""Fundo de cada destaque: o matiz dominante da imagem, saturado.

Rode da raiz do projeto:  python .claude/tools/fundo-destaques.py
Depois de trocar a imagem de um destaque, rode de novo e suba a versao.

Primeira tentativa: mediana da faixa da imagem que encosta no texto, depois
escurecida ate o branco ter 7:1. Deu cor sem graca — `#425467`, `#3e5277`,
lousa. A mediana mistura tudo e o resultado cai para o cinza; escurecer sem
mexer na saturacao so deixa o cinza mais escuro.

Agora: histograma de matiz **ponderado pela saturacao**, ignorando o que e
quase cinza, quase branco ou quase preto. Sobra o azul do ProjectHub, o teal
da Auditoria, o indigo do Cronograma. Aplico saturacao alta nesse matiz e
baixo a luminosidade so ate dar os 7:1 — a cor fica funda e viva, nao apagada.

O fim do degrade gira 14 graus no matiz alem de escurecer: duas cores parentes
dao profundidade, a mesma cor duas vezes da chapado.
"""
import io
import json
import colorsys
import math

from PIL import Image


def lum(c):
    def f(v):
        v /= 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])


def razao_com_branco(c):
    return 1.05 / (lum(c) + 0.05)


def rgb(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h % 1.0, min(1.0, max(0.0, l)), min(1.0, max(0.0, s)))
    return (int(round(r * 255)), int(round(g * 255)), int(round(b * 255)))


def hexa(c):
    return '#%02x%02x%02x' % c


def matiz_dominante(caminho):
    """Matiz e saturacao que mandam na imagem, sem contar o que e cinza."""
    im = Image.open(caminho).convert('RGB').resize((96, 54), Image.LANCZOS)
    seno = coseno = peso = 0.0
    sats = []
    for r, g, b in im.getdata():
        h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
        if s < 0.18 or l < 0.10 or l > 0.92:
            continue            # cinza, sombra ou estouro de branco nao votam
        p = s * s               # cor viva pesa mais que cor lavada
        ang = h * 2 * math.pi
        seno += math.sin(ang) * p
        coseno += math.cos(ang) * p
        peso += p
        sats.append(s)
    if not peso:
        return 0.58, 0.55       # azul institucional, se a imagem for cinza
    h = (math.atan2(seno, coseno) / (2 * math.pi)) % 1.0
    sats.sort()
    return h, sats[int(len(sats) * 0.75)]        # terceiro quartil: o vivo, nao a media


def fundo_de(caminho):
    h, s = matiz_dominante(caminho)
    # Piso de saturacao: abaixo disso a cor comeca a virar lousa. As
    # ilustracoes do portal sao azuis lavados e batem no piso — sem ele, tres
    # slides sairiam quase do mesmo cinza-azulado.
    s = min(0.88, max(0.64, s * 1.3))
    l = 0.40
    cor = rgb(h, l, s)
    while razao_com_branco(cor) < 7.0 and l > 0.06:
        l -= 0.01
        cor = rgb(h, l, s)
    # Fim do degrade: mesmo matiz girado e mais fundo.
    fim = rgb(h - 0.038, max(0.05, l * 0.62), min(0.92, s * 1.06))
    return cor, fim, h, s, l


p = 'data/destaques.json'
itens = json.loads(io.open(p, encoding='utf-8').read().replace('\r\n', '\n'))
for item in itens:
    if item['imagem'].endswith('.svg'):
        # Placa desenhada por nos: a cor ja e a institucional do assunto, e
        # o leitor de pixel nem abre SVG.
        print('%-24s placa SVG, mantem %s' % (item['id'], item['fundo']))
        continue
    cor, fim, h, s, l = fundo_de(item['imagem'])
    item['fundo'] = hexa(cor)
    item['fundoFim'] = hexa(fim)
    print('%-20s %-8s %-8s  matiz %3d°  sat %.2f  lum %.2f  branco %.1f:1'
          % (item['id'], item['fundo'], item['fundoFim'], h * 360, s, l,
             razao_com_branco(cor)))
io.open(p, 'w', encoding='utf-8', newline='\n').write(
    json.dumps(itens, ensure_ascii=False, indent=2) + '\n')
print('destaques.json atualizado')
