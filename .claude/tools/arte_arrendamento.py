# -*- coding: utf-8 -*-
"""Arte da tela de entrada do IFRS 16 / CPC 06 (R2) -- login novo, 21/09/2026.

A tela mudou: painel branco com a marca do Grupo e o titulo a esquerda; a
direita, um painel azul recortado por uma curva em S, com a foto das torres de
transmissao no alto, um circulo fino inclinado e a ilustracao do "Contrato de
Arrendamento". As medidas saem do `login.css` do proprio sistema (pagina salva
pelo usuario em projeto/equatorial-links/); os insumos ficam em
projeto/marcas-telas/ (arrendamento-login-foto.jpg, arrendamento-login-
contrato.svg, arrendamento-logo.png), fora do site.

Duas saidas, do mesmo desenho:
  - o cartao de Portais e Links (`cartao()`), chamado pelo arte-marcas.py;
  - o fundo do slide do IFRS 16 no carrossel. Rode da raiz do projeto:
        python .claude/tools/arte_arrendamento.py
    (gera assets/destaques/ifrs-16-login-fundo.webp, 2000x519, pelo Edge
    headless). O slide e um molde: o notebook a esquerda e o texto em HTML a
    direita, entao o fundo nao leva marca nem titulo.
"""
import base64
import io
import math
import os
import subprocess
import sys
import tempfile

from PIL import Image

TELAS = 'projeto/marcas-telas'
FOTO = 'arrendamento-login-foto.jpg'
CONTRATO = 'arrendamento-login-contrato.svg'
LOGO = 'arrendamento-logo.png'
SANS = 'Segoe UI,Arial,Helvetica,sans-serif'

# login.css
TINTA, APOIO = '#0a1d4b', '#627c9d'
DEGRADE = [(0.30, '#5c9eff'), (0.55, '#0751b1'), (1.00, '#03265d')]   # 125 graus
CURVA_COR, CIRCULO_COR = '#438ff3', '#28a7ef'
# Curva em S do recorte e do traco (viewBox 1000x1000 do login).
TRACO = [(635, 0), (490, 220), (455, 390), (490, 620), (535, 800), (430, 940), (340, 1000)]


def _uri_arquivo(nome, largura=None, formato=None):
    caminho = os.path.join(TELAS, nome)
    if nome.endswith('.svg'):
        return 'data:image/svg+xml;base64,' + base64.b64encode(open(caminho, 'rb').read()).decode()
    im = Image.open(caminho)
    im = im.convert('RGBA') if im.mode in ('RGBA', 'P', 'LA') else im.convert('RGB')
    if largura and im.width > largura:
        im = im.resize((largura, round(im.height * largura / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    if im.mode == 'RGBA' or formato == 'PNG':
        im.save(buf, 'PNG', optimize=True)
        return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    im.save(buf, 'JPEG', quality=84, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


def _degrade_css(ident, w, h, graus, paradas):
    """linear-gradient(<graus>deg, ...) do CSS em coordenadas de usuario: a
    linha do degrade passa pelo centro e vai de canto a canto."""
    rad = math.radians(graus)
    dx, dy = math.sin(rad), -math.cos(rad)
    meio = (abs(w * dx) + abs(h * dy)) / 2
    cx, cy = w / 2, h / 2
    stops = ''.join('<stop offset="%g" stop-color="%s"/>' % p for p in paradas)
    return ('<linearGradient id="%s" gradientUnits="userSpaceOnUse" x1="%g" y1="%g" x2="%g" y2="%g">%s'
            '</linearGradient>' % (ident, cx - dx * meio, cy - dy * meio, cx + dx * meio, cy + dy * meio, stops))


def _curva(x0, largura, altura):
    """A curva em S do login, em pixels: `largura` e a caixa de 1000 unidades
    do viewBox dele. (O recorte do login e `objectBoundingBox`; aqui ele vira
    coordenada de usuario, porque a caixa do grupo recortado e maior que o
    quadro -- a foto e o circulo passam da borda -- e a curva escorregava.)"""
    pts = [(x0 + x / 1000.0 * largura, y / 1000.0 * altura) for x, y in TRACO]
    return 'M%g,%g' % pts[0] + ''.join(' C%g,%g %g,%g %g,%g' % (pts[i] + pts[i + 1] + pts[i + 2])
                                       for i in range(1, len(pts), 3))


def _foto(x, y, w, h, posicao=0.67, largura=620, fade_esquerda=0.0):
    """A foto das torres como no login: `cover` com object-position 67%,
    desfeita para baixo (mask 72%) e com o veu azul por cima. `fade_esquerda`
    desfaz tambem a borda da esquerda, quando a foto nao encosta na curva."""
    im = Image.open(os.path.join(TELAS, FOTO))
    escala = max(w / im.width, h / im.height)
    iw, ih = im.width * escala, im.height * escala
    ix, iy = x + (w - iw) * posicao, y + (h - ih) / 2
    return ('<g mask="url(#some)"><image href="%s" x="%g" y="%g" width="%g" height="%g" preserveAspectRatio="none"/>'
            '<rect x="%g" y="%g" width="%g" height="%g" fill="url(#veuFoto)"/></g>'
            % (_uri_arquivo(FOTO, largura), ix, iy, iw, ih, x, y, w, h),
            '<linearGradient id="fadeFoto" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stop-color="#fff"/>'
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
            '<linearGradient id="fadeLado" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/>'
            '<stop offset="%g" stop-color="#000" stop-opacity="0"/></linearGradient>'
            '<mask id="some" maskUnits="userSpaceOnUse" x="%g" y="%g" width="%g" height="%g">'
            '<rect x="%g" y="%g" width="%g" height="%g" fill="url(#fadeFoto)"/>'
            '<rect x="%g" y="%g" width="%g" height="%g" fill="url(#fadeLado)"/></mask>'
            '<linearGradient id="veuFoto" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" stop-color="#075eb1" stop-opacity=".2"/><stop offset=".65" stop-color="#075eb1" stop-opacity="0"/>'
            '<stop offset="1" stop-color="#064496"/></linearGradient>'
            % (max(fade_esquerda, 0.0001), x, y, w, h, x, y, w, h, x, y, w, h))


def _circulo(w, h, cx_frac=0.92, cy_frac=0.60, larg_frac=0.74, alt_frac=0.66, traco=1.0):
    cx, cy = w * cx_frac, h * cy_frac
    return ('<ellipse cx="%g" cy="%g" rx="%g" ry="%g" transform="rotate(25 %g %g)" fill="none" '
            'stroke="%s" stroke-opacity=".4" stroke-width="%g"/>'
            % (cx, cy, w * larg_frac / 2, h * alt_frac / 2, cx, cy, CIRCULO_COR, traco))


def cartao(alt='IFRS 16 / CPC 06 (R2), sistema de arrendamentos'):
    """Cartao 16:9 (512x288): a tela de entrada inteira, na proporcao do login
    (1390x720 e quase 16:9), com a marca e o titulo maiores para ler no
    tamanho do cartao. Os selos da direita sairam: no cartao ficariam com
    letra de 4 px."""
    W, H = 512, 288
    curva = _curva(0, W, H)
    defs = [_degrade_css('arte', W, H, 125, DEGRADE),
            '<clipPath id="recorte"><path d="%s L%d,%d L%d,0 Z"/></clipPath>' % (curva, W, H, W)]
    foto, defs_foto = _foto(W * 0.48, 0, W * 0.65, H * 0.66, largura=520)
    defs.append(defs_foto)
    contrato_w = W * 0.40
    corpo = [
        '<rect width="%d" height="%d" fill="#fff"/>' % (W, H),
        '<g clip-path="url(#recorte)"><rect width="%d" height="%d" fill="url(#arte)"/>%s%s</g>'
        % (W, H, _circulo(W, H), foto),
        '<path d="%s" fill="none" stroke="%s" stroke-width="7"/>' % (curva, CURVA_COR),
        '<image href="%s" x="%g" y="%g" width="%g" height="%g"/>'
        % (_uri_arquivo(CONTRATO), W * 0.47, H * 0.25, contrato_w, contrato_w * 510 / 560),
        '<image href="%s" x="30" y="30" width="128" height="%g" preserveAspectRatio="xMinYMid meet"/>'
        % (_uri_arquivo(LOGO, 300), 128 * 486 / 2000.0),
    ]
    y = 104
    for linha in ('IFRS 16 /', 'CPC 06 (R2)'):
        corpo.append('<text x="30" y="%d" fill="%s" font-family="%s" font-size="26" font-weight="700" '
                     'letter-spacing="-.5">%s</text>' % (y, TINTA, SANS, linha))
        y += 30
    for linha in ('Sistema de Gestão', 'de Arrendamentos'):
        corpo.append('<text x="30" y="%d" fill="%s" font-family="%s" font-size="13.5">%s</text>'
                     % (y + 10, APOIO, SANS, linha))
        y += 18
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" role="img" '
            'aria-label="%s"><defs>%s</defs>\n%s\n</svg>\n' % (W, H, W, H, alt, ''.join(defs), '\n'.join(corpo)))


def fundo_carrossel():
    """Fundo do slide (2000x519). O notebook fica a esquerda (0-46%) e o texto
    a direita (54-100%): a curva do login passa no vao entre os dois e separa
    o azul claro, onde fica o notebook, do painel escuro com as torres, onde
    fica o texto -- como o branco e o azul da tela de entrada."""
    W, H = 2000, 519
    x_curva = 780          # a curva do login ocupa de 34% a 63,5% da caixa
    largura_curva = 460
    defs = [_degrade_css('claro', W, H, 125, [(0, '#8dbbff'), (0.35, '#5c9eff'), (1, '#3f86ee')]),
            _degrade_css('arte', W, H, 125, [(0.30, '#1c6fd6'), (0.55, '#0751b1'), (1.00, '#03265d')])]
    d_curva = _curva(x_curva, largura_curva, H)
    defs.append('<clipPath id="recorte"><path d="%s L%d,%d L%d,0 Z"/></clipPath>' % (d_curva, W, H, W))
    # Como no login: a foto so nos dois tercos de cima (o horizonte laranja
    # fica de fora), desfeita para baixo e, aqui, tambem para a esquerda.
    foto, defs_foto = _foto(W * 0.50, 0, W * 0.52, H * 0.70, posicao=0.60, largura=1000,
                            fade_esquerda=0.35)
    defs.append(defs_foto)
    corpo = [
        '<rect width="%d" height="%d" fill="url(#claro)"/>' % (W, H),
        '<g clip-path="url(#recorte)"><rect width="%d" height="%d" fill="url(#arte)"/>%s%s</g>'
        % (W, H, foto, _circulo(W, H, 0.86, 0.72, 0.36, 1.20, 1.6)),
        '<path d="%s" fill="none" stroke="%s" stroke-width="22"/>' % (d_curva, CURVA_COR),
    ]
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">'
            '<defs>%s</defs>\n%s\n</svg>\n' % (W, H, W, H, ''.join(defs), '\n'.join(corpo)))


def renderizar(svg, largura, altura, saida_png):
    """Rasteriza pelo Edge headless (mascara, recorte e degrade exatos)."""
    edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    pasta = tempfile.mkdtemp(prefix='arte-arrendamento-')
    pagina = os.path.join(pasta, 'arte.html')
    open(pagina, 'w', encoding='utf-8').write(
        '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}svg{display:block}</style>' + svg)
    subprocess.run([edge, '--headless=new', '--incognito', '--disable-gpu', '--hide-scrollbars',
                    '--force-device-scale-factor=1', '--window-size=%d,%d' % (largura, altura),
                    '--user-data-dir=' + os.path.join(pasta, 'perfil'), '--screenshot=' + saida_png,
                    '--virtual-time-budget=3000', 'file:///' + pagina.replace('\\', '/')],
                   capture_output=True, timeout=120)


if __name__ == '__main__':
    destino = os.path.join('assets', 'destaques', 'ifrs-16-login-fundo.webp')
    png = os.path.join(tempfile.gettempdir(), 'ifrs-16-login-fundo.png')
    renderizar(fundo_carrossel(), 2000, 519, png)
    Image.open(png).convert('RGB').crop((0, 0, 2000, 519)).save(destino, 'WEBP', quality=84, method=6)
    print('%s: %d KB' % (destino, os.path.getsize(destino) // 1024))
    sys.exit(0)
