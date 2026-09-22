# -*- coding: utf-8 -*-
"""Arte dos cartoes do portal.

Duas maneiras de compor, conforme o que existe do outro lado do link:

**modo `tela`** - quando o destino tem uma tela de entrada com identidade
propria, a arte **reproduz essa tela**: o fundo dela (foto ou degrade), a
logo no lugar onde ela esta, o titulo na tipografia dela. Foi assim que o
usuario pediu em 20/09/2026, com os exemplos do ProjectHub, do Cronograma de
Fechamento e da Central de Resultados: acessar, entender, recortar e recompor,
para cada cartao guardar a personalidade do proprio sistema.

**modo `marca`** - quando o destino esta atras de SSO ou e uma instituicao sem
tela propria a reaproveitar, a arte e a **marca oficial** sobre o **fundo da
propria marca** (ChatGPT em preto, EY no carvao, gov.br no azul), sem desenho
decorativo. Quando a mesma marca serve a varios cartoes (SAP, Python,
ServiceNow, Receita Federal, Equatorial), um **rotulo abaixo** diferencia: a
transacao, a norma, o sistema.

Rode da raiz do projeto:  python .claude/tools/arte-marcas.py
"""
import base64
import io
import os
import re
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arte_arrendamento  # noqa: E402  (tela do IFRS 16, composta a parte)
import arte_bmp  # noqa: E402  (tela do BMP/RIT da ANEEL, composta a parte)

MARCAS = 'assets/marcas'
TELAS = 'projeto/marcas-telas'   # insumo do gerador; nao vai para o site
LOGOS = 'assets/logos'
L, A = 512, 288                  # 16:9, a mesma proporcao da moldura do cartao

# A moldura do cartao e 16:9 fixo, igual a este quadro, entao a arte nao e
# cortada em largura nenhuma. A margem existe so como respiro visual.
MARGEM_X, MARGEM_Y = 34, 22
SANS = 'Segoe UI,Arial,Helvetica,sans-serif'
SERIF = 'Georgia,Times New Roman,serif'
INK_CLARO, INK_ESCURO = '#3b4a60', '#ffffff'
BRANCO, EQTL_AZUL = '#ffffff', '#04204a'


# ------------------------------------------------------------------ imagens
CACHE = {}


def _prepara(caminho, trocas, largura_max, inverter=False):
    bruto = io.open(caminho, 'rb').read()
    if caminho.endswith('.svg'):
        texto = bruto.decode('utf-8')
        for de, para in trocas.items():
            texto = texto.replace(de + '"', para + '"').replace(de + ';', para + ';')
        # Sem viewBox o <image> estica a logo ate preencher a caixa (era o que
        # deformava a EY). Deduzo o viewBox de width/height quando falta.
        if 'viewBox' not in texto:
            larg = re.search(r'\bwidth="([\d.]+)', texto)
            alt = re.search(r'\bheight="([\d.]+)', texto)
            if larg and alt:
                texto = texto.replace('<svg', '<svg viewBox="0 0 %s %s"'
                                      % (larg.group(1), alt.group(1)), 1)
        return texto.encode('utf-8'), 'image/svg+xml'
    im = Image.open(io.BytesIO(bruto))
    if im.mode in ('P', 'LA', 'RGBA') or 'transparency' in im.info or inverter:
        # PNG/GIF de paleta com transparencia nao desenha dentro de <image>
        im = im.convert('RGBA')
        caixa = im.split()[3].getbbox()      # corta a moldura transparente
        if caixa:
            im = im.crop(caixa)
        if inverter:
            # A marca vem escura e o proprio site a inverte por CSS
            # (ProjectHub, Cronograma). Deixo so o alfa e pinto de branco.
            alfa = im.split()[3]
            im = Image.new('RGBA', im.size, (255, 255, 255, 0))
            im.putalpha(alfa)
        formato, tipo = 'PNG', 'image/png'
    else:
        im, formato, tipo = im.convert('RGB'), 'JPEG', 'image/jpeg'
    if im.width > largura_max:
        im = im.resize((largura_max, max(1, round(im.height * float(largura_max) / im.width))),
                       Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, formato, optimize=True, **({'quality': 82} if formato == 'JPEG' else {}))
    return buf.getvalue(), tipo


def uri(nome, trocas=None, largura_max=520, pasta=None, inverter=False):
    trocas = trocas or {}
    chave = (nome, tuple(sorted(trocas.items())), largura_max, pasta, inverter)
    if chave not in CACHE:
        caminho = None
        for base in ([pasta] if pasta else [MARCAS, TELAS, LOGOS]):
            if os.path.exists(os.path.join(base, nome)):
                caminho = os.path.join(base, nome)
                break
        assert caminho, nome
        bruto, tipo = _prepara(caminho, trocas, largura_max, inverter)
        CACHE[chave] = 'data:%s;base64,%s' % (tipo, base64.b64encode(bruto).decode())
    return CACHE[chave]


def foto(nome, largura=620, recorte=0.5, zoom=1.0):
    """Recorta a foto na proporcao do quadro e embute.

    `recorte` e a ancora horizontal, de 0 (borda esquerda) a 1 (direita); o
    padrao 0,5 centraliza. `zoom` fecha a janela antes do recorte, para deixar
    de fora o que nao deve entrar.

    Banner de campanha costuma ter dizeres nas duas pontas, e o recorte do
    quadro corta uma delas pela metade — fica a sobra de uma frase. Foi o caso
    do Conecta ("Bem-vindos ao Conecta." numa ponta) e do banner de Gente e
    Gestao ("Agora, todos os serviços de RH estão a um clique." na outra).
    Meça onde a frase termina e escolha a janela que a inclui inteira ou a
    deixa toda de fora.
    """
    im = Image.open(os.path.join(TELAS, nome)).convert('RGB')
    alvo = float(L) / A
    # Arredondo em vez de truncar: com `int()` a janela perdia 1 px de altura
    # em foto de proporcao quase 16:9, e isso mexia em arte ja aprovada.
    jl = min(im.width, int(round(im.height * alvo)))
    ja = min(im.height, int(round(jl / alvo)))
    jl, ja = int(jl / zoom), int(ja / zoom)
    x = int((im.width - jl) * min(max(recorte, 0.0), 1.0))
    y = (im.height - ja) // 2
    im = im.crop((x, y, x + jl, y + ja))
    im = im.resize((largura, int(largura / alvo)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=80, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


# ------------------------------------------------------------------- texto
def escapa(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))


def quebra(texto, limite):
    """Quebra em linhas de ate `limite` caracteres, sem cortar palavra."""
    linhas, atual = [], ''
    for palavra in texto.split():
        if atual and len(atual) + 1 + len(palavra) > limite:
            linhas.append(atual)
            atual = palavra
        else:
            atual = (atual + ' ' + palavra).strip()
    if atual:
        linhas.append(atual)
    return linhas


def claro(cor):
    r, g, b = (int(cor[i:i + 2], 16) for i in (1, 3, 5))
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150


def texto(x, y, conteudo, cor, tamanho, peso=600, fonte=SANS,
          ancora='start', opacidade=1.0, espaco=0.6):
    return ('<text x="%g" y="%g" text-anchor="%s" fill="%s" fill-opacity="%g" '
            'font-family="%s" font-size="%g" font-weight="%s" letter-spacing="%g">%s</text>'
            % (x, y, ancora, cor, opacidade, fonte, tamanho, peso, espaco, escapa(conteudo)))


# ----------------------------------------------------------------- fundos
def fundo_solido(cor):
    return ['<rect width="%d" height="%d" fill="%s"/>' % (L, A, cor)], []


def fundo_degrade(de, para, graus=135):
    import math
    rad = math.radians(graus)
    dx, dy = math.sin(rad), -math.cos(rad)
    x1, y1 = 0.5 - dx / 2, 0.5 - dy / 2
    defs = ['<linearGradient id="g" x1="%g" y1="%g" x2="%g" y2="%g">'
            '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient>' % (x1, y1, 1 - x1, 1 - y1, de, para)]
    return ['<rect width="%d" height="%d" fill="url(#g)"/>' % (L, A)], defs


def fundo_showcase():
    """O painel de entrada do Cronograma de Fechamento e do Portal de
    Auditoria: um degrade de 145 graus com tres focos de luz por cima."""
    base = [(0.00, '#17001e'), (0.24, '#74005e'), (0.40, '#ff145e'),
            (0.63, '#3010bf'), (0.87, '#040014')]
    paradas = ''.join('<stop offset="%g" stop-color="%s"/>' % p for p in base)
    defs = ['<linearGradient id="g" x1="0.12" y1="0" x2="0.88" y2="1">%s</linearGradient>' % paradas]
    corpo = ['<rect width="%d" height="%d" fill="url(#g)"/>' % (L, A)]
    focos = [('87%', '56%', 0.30, '#08bcff', 0.85, 0.18),
             ('43%', '24%', 0.44, '#ff1996', 0.92, 0.29),
             ('50%', '68%', 0.46, '#2d19ff', 0.82, 0.24)]
    for i, (cx, cy, r, cor, op, meio) in enumerate(focos):
        defs.append('<radialGradient id="f%d" cx="%s" cy="%s" r="%g">'
                    '<stop offset="0" stop-color="%s" stop-opacity="%g"/>'
                    '<stop offset="%g" stop-color="%s" stop-opacity="%g"/>'
                    '<stop offset="1" stop-color="%s" stop-opacity="0"/></radialGradient>'
                    % (i, cx, cy, r, cor, op, meio, cor, op, cor))
        corpo.append('<rect width="%d" height="%d" fill="url(#f%d)"/>' % (L, A, i))
    return corpo, defs


def focos_de_luz(focos, comeco=0):
    """Manchas radiais sobre o fundo, como as do painel do Cronograma e as
    da tela de entrada do Qulture. Cada foco e (cx, cy, raio, cor, opacidade,
    parada intermediaria)."""
    corpo, defs = [], []
    for n, (cx, cy, r, cor, op, meio) in enumerate(focos, comeco):
        defs.append('<radialGradient id="f%d" cx="%s" cy="%s" r="%g">'
                    '<stop offset="0" stop-color="%s" stop-opacity="%g"/>'
                    '<stop offset="%g" stop-color="%s" stop-opacity="%g"/>'
                    '<stop offset="1" stop-color="%s" stop-opacity="0"/></radialGradient>'
                    % (n, cx, cy, r, cor, op, meio, cor, op, cor))
        corpo.append('<rect width="%d" height="%d" fill="url(#f%d)"/>' % (L, A, n))
    return corpo, defs


def fundo_foto(arquivo, veu=None, largura=620, recorte=0.5, zoom=1.0):
    corpo = ['<image href="%s" x="0" y="0" width="%d" height="%d" '
             'preserveAspectRatio="xMidYMid slice"/>'
             % (foto(arquivo, largura, recorte, zoom), L, A)]
    defs = []
    if veu:
        paradas = ''.join('<stop offset="%g" stop-color="%s" stop-opacity="%g"/>' % p for p in veu)
        defs.append('<linearGradient id="v" x1="0" y1="0" x2="1" y2="1">%s</linearGradient>' % paradas)
        corpo.append('<rect width="%d" height="%d" fill="url(#v)"/>' % (L, A))
    return corpo, defs


# -------------------------------------------------------------- composicao
def compor(spec):
    """spec: dict com fundo, logo, titulo, subtitulo, rotulo, alinhamento.
    `pronto` e uma funcao que ja devolve o SVG inteiro (tela composta demais
    para os campos, como a do IFRS 16)."""
    if 'pronto' in spec:
        return spec['pronto'](spec['alt'])
    if 'foto' in spec:
        corpo, defs = fundo_foto(spec['foto'], spec.get('veu'),
                                 spec.get('fotoLargura', 620), spec.get('recorte', 0.5),
                                 spec.get('zoom', 1.0))
        fundo_claro = spec.get('claro', False)
    elif 'showcase' in spec:
        corpo, defs = fundo_showcase()
        fundo_claro = False
    elif 'degrade' in spec:
        corpo, defs = fundo_degrade(*spec['degrade'])
        fundo_claro = claro(spec['degrade'][0])
    else:
        corpo, defs = fundo_solido(spec.get('fundo', BRANCO))
        fundo_claro = claro(spec.get('fundo', BRANCO))

    if spec.get('focos'):
        mais_corpo, mais_defs = focos_de_luz(spec['focos'], 20)
        corpo += mais_corpo
        defs += mais_defs

    if spec.get('soFundo'):
        # A tela de entrada ja tem marca e tipografia dela (o banner do
        # Conecta traz "Bem-vindos ao Conecta." e a logo). Sobrepor o nosso
        # lockup seria escrever por cima do que ja esta escrito.
        cabeca = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" '
                  'height="%d" role="img" aria-label="%s">' % (L, A, L, A, escapa(spec['alt'])))
        meio = ('<defs>%s</defs>' % ''.join(defs)) if defs else ''
        return cabeca + '\n' + meio + '\n' + '\n'.join(corpo) + '\n</svg>\n'

    tinta = INK_CLARO if fundo_claro else INK_ESCURO
    cor_titulo = spec.get('corTitulo', tinta)
    cor_sub = spec.get('corSub', tinta)
    fonte = SERIF if spec.get('serif') else SANS
    esquerda = spec.get('alinhamento', 'centro') == 'esquerda'

    if esquerda and spec.get('disposicao') == 'lado':
        # Marca compacta (quase quadrada) pede o lockup deitado: ela cresce a
        # esquerda e o texto ocupa a direita. Empilhada, uma marca quadrada
        # cabia so num cantinho e metade da arte ficava vazia — foi o que o
        # usuario apontou no Portal do Empregado em 20/09.
        larg = spec.get('logoLargura', 118)
        alt = spec.get('logoAltura', 118)
        corpo.append('<image href="%s" x="%d" y="%g" width="%g" height="%g" '
                     'preserveAspectRatio="xMidYMid meet"/>'
                     % (uri(spec['logo'], spec.get('trocas'), spec.get('logoFonte', 640),
                            inverter=spec.get('inverter', False)),
                        MARGEM_X, (A - alt) / 2.0, larg, alt))
        texto_x = MARGEM_X + larg + spec.get('vao', 26)
        linhas = quebra(spec['titulo'], spec.get('limite', 12))
        tam = spec.get('tamanhoTitulo', 34)
        altura_linha = tam * 1.12
        recuo_sub = 32 if spec.get('subtitulo') else 0
        altura = (len(linhas) - 1) * altura_linha + tam + recuo_sub
        base = (A - altura) / 2.0 + tam * 0.86
        for i, linha in enumerate(linhas):
            corpo.append(texto(texto_x, base + i * altura_linha, linha, cor_titulo,
                               tam, spec.get('pesoTitulo', 600), fonte,
                               espaco=-0.4 if spec.get('serif') else 0))
        if spec.get('subtitulo'):
            corpo.append(texto(texto_x, base + (len(linhas) - 1) * altura_linha + recuo_sub,
                               spec['subtitulo'], cor_sub, 15, 500, SANS, opacidade=0.88))
    elif esquerda:
        # Lockup da tela de entrada: logo em cima, titulo e subtitulo abaixo.
        logo_h = spec.get('logoAltura', 32)
        corpo.append('<image href="%s" x="%d" y="%d" width="%d" height="%d" '
                     'preserveAspectRatio="xMinYMid meet"/>'
                     % (uri(spec['logo'], spec.get('trocas'),
                            # A marca aparece com ~60 px de largura na tela; 640
                            # e o teto historico. Arte nova pede o que precisa.
                            spec.get('logoFonte', 640),
                            inverter=spec.get('inverter', False)),
                        MARGEM_X, spec.get('logoY', 34),
                        spec.get('logoLargura', 156), logo_h))
        linhas = quebra(spec['titulo'], spec.get('limite', 15))
        tam = spec.get('tamanhoTitulo', 40)
        altura_linha = tam * 1.06
        topo = spec.get('baseTitulo', 160) - (len(linhas) - 1) * altura_linha / 2
        for i, linha in enumerate(linhas):
            corpo.append(texto(MARGEM_X, topo + i * altura_linha, linha, cor_titulo,
                               tam, spec.get('pesoTitulo', 600), fonte,
                               espaco=-0.4 if spec.get('serif') else 0))
        if spec.get('subtitulo'):
            corpo.append(texto(MARGEM_X, topo + (len(linhas) - 1) * altura_linha + 34,
                               spec['subtitulo'], cor_sub, 15, 500, SANS, opacidade=0.88))
    else:
        rotulo = spec.get('rotulo')
        linhas = quebra(rotulo, 20) if rotulo else []
        if spec.get('logo'):
            # A caixa da marca vai ate perto da area segura: e o que da
            # presenca as assinaturas largas (ServiceNow, Microsoft, CPC),
            # que sao limitadas pela largura e sobravam curtas.
            if linhas:
                caixa = (48, 34, L - 96, 132) if len(linhas) == 1 else (48, 28, L - 96, 116)
            else:
                caixa = (40, 36, L - 80, 216)
            corpo.append('<image href="%s" x="%d" y="%d" width="%d" height="%d" '
                         'preserveAspectRatio="xMidYMid meet"/>'
                         % (uri(spec['logo'], spec.get('trocas'),
                                spec.get('logoFonte', 640),
                                inverter=spec.get('inverter', False)), *caixa))
        else:
            assinatura = spec['assinatura']
            tam = min(58, int(58 * 11.0 / max(len(assinatura), 8)))
            corpo.append(texto(L / 2, 140 if linhas else 162, assinatura, tinta, tam,
                               700, fonte, 'middle', espaco=0.5))
        if linhas:
            base = 218 if len(linhas) == 1 else 198
            tam = min(30, int(30 * 21.0 / max(len(max(linhas, key=len)), 11)))
            for i, linha in enumerate(linhas):
                corpo.append(texto(L / 2, base + i * 34, linha, tinta, tam, 600,
                                   SANS, 'middle', 0.88))

    cabeca = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" '
              'height="%d" role="img" aria-label="%s">' % (L, A, L, A, escapa(spec['alt'])))
    meio = ('<defs>%s</defs>' % ''.join(defs)) if defs else ''
    return cabeca + '\n' + meio + '\n' + '\n'.join(corpo) + '\n</svg>\n'


# --------------------------------------------------------- marcas por chave
MARCA = {
    'sap': ('sap.svg', BRANCO, {}), 'sharepoint': ('sharepoint.svg', BRANCO, {}),
    'python': ('python.svg', BRANCO, {}), 'snowflake': ('snowflake.svg', BRANCO, {}),
    'servicenow': ('servicenow.svg', BRANCO, {}), 'microsoft': ('microsoft.svg', BRANCO, {}),
    'power-bi': ('power-bi.svg', BRANCO, {}), 'meta': ('meta.svg', BRANCO, {}),
    'gemini': ('gemini.svg', BRANCO, {}), 'coolors': ('coolors.svg', BRANCO, {}),
    'datylon': ('datylon.svg', BRANCO, {}), 'ilovepdf': ('ilovepdf.svg', BRANCO, {}),
    'actio': ('actio.png', BRANCO, {}), 'paytrack': ('paytrack.png', BRANCO, {}),
    'passatempo': ('passatempo.png', BRANCO, {}),
    'cfc': ('cfc.png', BRANCO, {}), 'cpc': ('cpc.png', BRANCO, {}),
    'ifrs': ('ifrs.svg', BRANCO, {}), 'aneel': ('aneel.png', BRANCO, {}),
    'receita': ('receita-federal.svg', BRANCO, {}),
    'openai': ('openai.svg', '#000000', {'#74aa9c': '#000000'}),
    'ey': ('ey.svg', '#2e2e38', {'#161d23': '#ffffff'}),
    'wetransfer': ('wetransfer.svg', '#409fff', {'#000': '#ffffff'}),
    'equatorial': ('grupo-equatorial-branco.png', EQTL_AZUL, {}),
    # A marca oficial e a plum `#5A0048` do cartao branco do login; sobre o
    # magenta da tela ela precisa sair em branco.
    'qulture': ('qulture-rocks.svg', '#5a0048', {'#5A0048': '#ffffff'}),
}
ASSINATURA = {'onesource': ('ONESOURCE', '#16283f'), 'argo': ('ARGO', '#0b3b6f')}


def marca(alt, chave, rotulo=None):
    """O `rotulo` so entra quando diferencia: a mesma marca servindo varios
    cartoes (SAP, Python, Receita) ou uma marca que nao e o nome do destino
    (Meta -> Workplace, OpenAI -> ChatGPT). Repetir embaixo o que a assinatura
    ja escreve em cima e ruido — saiu de Actio, Paytrack, WeTransfer e
    Datylon em 20/09."""
    arquivo, fundo, trocas = MARCA[chave]
    return {'alt': alt, 'logo': arquivo, 'fundo': fundo, 'trocas': trocas, 'rotulo': rotulo}


def assinatura(alt, chave, rotulo=None):
    nome, fundo = ASSINATURA[chave]
    return {'alt': alt, 'assinatura': nome, 'fundo': fundo, 'rotulo': rotulo}


# ------------------------------- telas de entrada reproduzidas (modo `tela`)
def showcase(alt, logo, titulo, subtitulo='Executiva Contabilidade IV'):
    """Painel de entrada do Cronograma de Fechamento / Portal de Auditoria."""
    # No desktop a logo fica a 63% da altura do painel e o titulo logo abaixo:
    # o recorte do cartao pega esse rodape, com a luz do degrade por cima.
    return {'alt': alt, 'showcase': True, 'logo': logo, 'titulo': titulo,
            'subtitulo': subtitulo, 'alinhamento': 'esquerda', 'serif': True,
            'tamanhoTitulo': 34, 'pesoTitulo': 400, 'limite': 16,
            'corSub': '#ffffff', 'inverter': True, 'logoY': 54,
            'logoLargura': 132, 'logoAltura': 28, 'baseTitulo': 168}


PROJECTHUB = {
    'alt': 'ProjectHub, do Grupo Equatorial', 'foto': 'projecthub-fundo.webp',
    # O veu do site (.95/.80/.60) cobre 720x640; no recorte de 440x400 ele
    # apagava a foto das torres, entao alivio mantendo as mesmas cores.
    'veu': [(0.0, '#0c1019', 0.84), (0.6, '#0c1019', 0.6), (1.0, '#1d4ed8', 0.44)],
    'logo': 'projecthub-logo.png', 'inverter': True, 'titulo': 'ProjectHub',
    'subtitulo': 'Gestão Integrada de Projetos', 'alinhamento': 'esquerda',
    'tamanhoTitulo': 38, 'limite': 14, 'corTitulo': '#ffffff', 'corSub': '#94a3b8',
}
# A tela de entrada mudou em 21/09/2026 (painel branco + painel azul recortado
# por uma curva, foto das torres e o "Contrato de Arrendamento"). O desenho e
# composto demais para os campos do spec: mora em arte_arrendamento.py, que
# tambem faz o fundo do slide do IFRS 16 no carrossel.
ARRENDAMENTO = {'alt': 'IFRS 16 / CPC 06 (R2), sistema de arrendamentos', 'pronto': arte_arrendamento.cartao}
GESTOR_HORAS = {
    'alt': 'Gestor de Horas, do Grupo Equatorial', 'fundo': '#111827',
    'logo': 'gestorhoras-logo.png', 'titulo': 'Gestor de Horas',
    'subtitulo': 'Executiva Contabilidade IV', 'alinhamento': 'esquerda',
    'tamanhoTitulo': 33, 'limite': 15, 'corTitulo': '#ffffff', 'corSub': '#9ca3af',
}
MONITOR = {
    'alt': 'Monitor de Desempenho, do Grupo Equatorial', 'fundo': EQTL_AZUL,
    'logo': 'grupo-equatorial-branco.png', 'titulo': 'Monitor de Desempenho',
    'subtitulo': 'Executiva Contabilidade IV', 'alinhamento': 'esquerda',
    'tamanhoTitulo': 31, 'limite': 15, 'corTitulo': '#ffffff', 'corSub': '#b9c6df',
}
CENTRAL_RESULTADOS = {
    'alt': 'Central de Resultados, Relação com Investidores do Grupo Equatorial',
    'foto': 'ri-banner.jpg',
    'veu': [(0.0, '#04204a', 0.76), (1.0, '#02407a', 0.54)],
    'logo': 'grupo-equatorial-branco.png', 'titulo': 'Central de Resultados',
    'subtitulo': 'Relação com Investidores', 'alinhamento': 'esquerda',
    'tamanhoTitulo': 31, 'limite': 15, 'corTitulo': '#ffffff', 'corSub': '#d6def0',
}


def portal_servicos(titulo, subtitulo='Portal de Serviços'):
    """Tela de entrada do Portal de Servicos (ServiceNow do Grupo), lida em
    1600 px: foto de fundo ja tingida de indigo, barra `#25418e` no topo e a
    logo Grupo Equatorial branca a esquerda. Os nove cartoes usavam a marca do
    fornecedor (ServiceNow, Microsoft, SAP) — que nao e para onde o link leva.
    Agora todos mostram a tela real, e o titulo diz qual servico e."""
    return {'alt': 'Portal de Serviços do Grupo Equatorial',
            'foto': 'portal-servicos-fundo.jpg',
            # A foto ja vem tingida; o veu so garante o contraste do texto
            # branco, nas cores da propria tela (roxo a esquerda, azul da
            # barra de topo a direita).
            'veu': [(0.0, '#2b1a5e', 0.48), (1.0, '#25418e', 0.33)],
            'logo': 'portal-servicos-logo.png',
            'titulo': titulo, 'subtitulo': subtitulo, 'alinhamento': 'esquerda',
            'tamanhoTitulo': 31, 'limite': 16, 'corTitulo': '#ffffff',
            'corSub': '#dbe3f6', 'logoLargura': 140, 'logoAltura': 31,
            # A moldura do cartao tem 220 px: 520 na foto e 280 na marca ja
            # cobrem tela de 2x. Como a mesma tela serve nove cartoes, cada KB
            # a mais e cobrado nove vezes.
            'logoFonte': 280, 'fotoLargura': 520}


# ------------------------------------------- Conecta (Central do Funcionario)
CONECTA = {
    # O banner de entrada ja e o lockup da tela: "Bem-vindos ao Conecta.",
    # o subtitulo e a logo. Recorte 0,14 porque o centro do banner (2103 px)
    # deixaria a chamada de fora.
    'alt': 'Conecta, a Central do Funcionário do Grupo Equatorial',
    'foto': 'esc-conecta-banner.png', 'recorte': 0.14, 'soFundo': True,
    'fotoLargura': 520,
}
CONECTA_GENTE = {
    # Primeira tentativa: banner + o nosso lockup por cima, como a tela faz.
    # Nao serve — o banner ja tem a marca Equatorial e dizeres proprios nas
    # duas pontas, e o lockup entregava duas logos e texto sobre texto. O
    # banner e o lockup. Recorte 0,55 para a marca do banner caber inteira.
    'alt': 'Gente e Gestão, no Conecta do Grupo Equatorial',
    'foto': 'esc-gente-banner.png', 'recorte': 1.0, 'zoom': 1.19, 'soFundo': True,
    'fotoLargura': 520,
}
SABER = {
    # O banner de entrada tem lockup proprio — "Gente que Aprende /
    # Conhecimento para transformar o futuro", com o selo dos dois capacetes —
    # entao ele e a arte, sem nada nosso por cima. Eu tinha descartado esse
    # banner como texto de campanha e usado o roxo `#7b1fa2` da plataforma;
    # o usuario corrigiu em 20/09.
    #
    # O arquivo vem do recorte que o usuario mandou: o CDN da plataforma serve
    # por URL assinada da CloudFront e recusa qualquer cliente sem o cookie
    # dele, entao nao da para baixar daqui.
    'alt': 'Gente que Aprende, a universidade corporativa do Grupo Equatorial',
    'foto': 'saber-banner.png', 'soFundo': True, 'fotoLargura': 520,
}


EMPREGADO = {
    # Plataforma Senior personalizada para o Grupo. O cinza e o resto da
    # lateral; o que vale e o bloco da marca, no alto: `#333579`, medido no
    # `.logo-preview`. (Correcao do usuario em 20/09 — eu tinha pegado o cinza.)
    # A marca do Grupo tambem esta no arquivo de personalizacao do tenant, mas
    # nesta tela nao aparece.
    'alt': 'Portal do Empregado, na plataforma Senior do Grupo Equatorial',
    'degrade': ('#333579', '#1d1e4d', 160), 'logo': 'senior-marca.png',
    'titulo': 'Portal do Empregado', 'subtitulo': 'Gestão de pessoas · Senior',
    'alinhamento': 'esquerda', 'tamanhoTitulo': 31, 'limite': 15,
    'corTitulo': '#ffffff', 'corSub': '#c3c5ee',
    # A marca e quase quadrada (159x150): no empilhado ela cabia num cantinho.
    'disposicao': 'lado', 'logoLargura': 112, 'logoAltura': 112,
    'tamanhoTitulo': 34, 'limite': 11, 'logoFonte': 320,
}


QULTURE = {
    # Tela de entrada lida em 1600 px: fundo plum `#5a0048` com manchas de luz
    # magenta, e o cartao branco no meio com a marca. Aqui a marca vem em
    # branco sobre o fundo dela — o cartao branco nao cabe em 220 px.
    'alt': 'Qulture.Rocks',
    'degrade': ('#5a0048', '#3d0031', 150),
    'focos': [('26%', '46%', 0.46, '#f75080', 0.60, 0.30),
              ('78%', '60%', 0.40, '#c2185b', 0.52, 0.26),
              ('50%', '18%', 0.34, '#931d5c', 0.44, 0.22)],
    # Sem rotulo: a assinatura ja escreve o nome do destino, e ela e unica —
    # a mesma regra que tirou o rotulo de Actio e Paytrack.
    'logo': 'qulture-rocks.svg', 'trocas': {'#5A0048': '#ffffff'},
}


def planalto(alt, titulo, ementa):
    """Pagina do Planalto: brasao da Republica sobre branco, texto em serifada.
    O link vai direto ao texto da lei, entao a marca certa e o brasao, nao o
    gov.br (correcao do usuario em 20/09/2026)."""
    # O brasao e quadrado (463x468): mesmo caso da borboleta da Senior.
    return {'alt': alt, 'fundo': BRANCO, 'logo': 'brasao-republica.gif',
            'titulo': titulo, 'subtitulo': ementa, 'alinhamento': 'esquerda',
            'disposicao': 'lado', 'serif': True, 'tamanhoTitulo': 26,
            'pesoTitulo': 400, 'limite': 15, 'corTitulo': '#1c2433',
            'corSub': '#5f6d82', 'logoLargura': 104, 'logoAltura': 104}


# ------------------------------------------------------------------ cartoes
CARTOES = {
    'atalhos': {
        'sap': marca('SAP', 'sap', 'NWBC · Produção'),
        'sap-hana-qa': marca('SAP', 'sap', 'HANA · Ambiente QA'),
        'sharepoint': marca('Microsoft SharePoint', 'sharepoint', 'SharePoint'),
        'snowflake': marca('Snowflake', 'snowflake'),
        'onesource': assinatura('ONESOURCE, da Thomson Reuters', 'onesource', 'Thomson Reuters'),
    },
    'sistemas': {
        'ifrs16-cpc06': ARRENDAMENTO,
        'monitor-de-desempenho': MONITOR,
        'controle-de-horas': GESTOR_HORAS,
        'projecthub': PROJECTHUB,
        'cronograma-de-fechamento': showcase('Cronograma de Fechamento', 'cronograma-logo.png',
                                             'Cronograma de Fechamento'),
        'portal-de-auditoria': showcase('Portal da Contabilidade, controle de auditoria',
                                        'auditoria-logo.png', 'Portal da Contabilidade'),
    },
    'automacoes': {
        'pedidos-compra-me23n': marca('SAP', 'sap', 'ME23N'),
        'fechamento-periodos': marca('SAP', 'sap', 'OB52 · GS02'),
        'cancelamento-erros-bmp': marca('SAP', 'sap', 'ZMCSE028'),
        'extrator-balancete': marca('SAP', 'sap', 'S_ALR_87012277'),
        'print-lote-fb03': marca('SAP', 'sap', 'FB03'),
        'upload-evidencias-ey': marca('EY', 'ey', 'Upload de evidências'),
        'imagens-faturas': marca('Python', 'python', 'Imagens de faturas'),
        'prefixo-em-lote': marca('Python', 'python', 'Prefixo em lote'),
        'renomear-pdfs-nf': marca('Python', 'python', 'Renomear PDFs de NF'),
        'criar-pastas': marca('Python', 'python', 'Criar pastas em lote'),
        'distribuir-arquivos': marca('Python', 'python', 'Distribuir arquivos'),
        'email-print-planilha': marca('Python', 'python', 'E-mail com print'),
    },
    'documentos': {
        'cfc-nbc': marca('Conselho Federal de Contabilidade', 'cfc'),
        'cpc-pronunciamentos': marca('Comitê de Pronunciamentos Contábeis', 'cpc'),
        'ifrs-standards': marca('IFRS Foundation', 'ifrs', 'Accounting Standards'),
        'aneel-mcse': marca('ANEEL', 'aneel', 'Manual do Setor Elétrico'),
        'sped-ecd': marca('Receita Federal', 'receita', 'SPED · ECD'),
        'sped-ecf': marca('Receita Federal', 'receita', 'SPED · ECF'),
        'lei-6404': planalto('Lei das Sociedades por Ações, no Planalto',
                             'Lei nº 6.404/1976', 'Sociedades por Ações · Planalto'),
        'lc-214-reforma': planalto('Lei Complementar nº 214/2025, no Planalto',
                                   'Lei Complementar nº 214/2025', 'Reforma Tributária · IBS e CBS'),
        'central-resultados-eqtl': CENTRAL_RESULTADOS,
    },
    'portais': {
        'portal-servicos-home': portal_servicos('Portal de Serviços', 'Atendimento interno do Grupo'),
        'portal-servicos-ocorrencias': portal_servicos('Minhas ocorrências'),
        'portal-servicos-acesso': portal_servicos('Acesso a sistemas'),
        'portal-servicos-sap': portal_servicos('Solicitações SAP'),
        'portal-servicos-incidentes': portal_servicos('Problemas gerais'),
        'portal-servicos-office365': portal_servicos('Acesso Office 365'),
        'portal-servicos-powerbi': portal_servicos('Power BI na nuvem'),
        'portal-servicos-senha': portal_servicos('Redefinição de senha'),
        'workplace': marca('Meta', 'meta', 'Workplace'),
        'sharepoint-eqtl-go': marca('Microsoft SharePoint', 'sharepoint', 'Equipe EQTL GO'),
        'bi-gastos-gerenciaveis': marca('Microsoft Power BI', 'power-bi', 'Gastos Gerenciáveis'),
        'conecta-central-funcionario': CONECTA,
        'conecta-gente-gestao': CONECTA_GENTE,
        'saber-universidade': SABER,
        # A marca ocupa no maximo 432 px do quadro; 640 de origem so pesava.
        'jornada-de-trabalho': dict(marca('Passatempo, do Grupo Equatorial', 'passatempo'),
                                    logoFonte=460),
        'actio': marca('Actio', 'actio'),
        'portal-do-empregado': EMPREGADO,
        'eqtl-previ': marca('Grupo Equatorial', 'equatorial', 'EQTL Previ'),
        'qulture-rocks': QULTURE,
        'argo-pontes': assinatura('ARGO, da Pontes Tur', 'argo', 'Pontes Tur'),
        'paytrack': marca('Paytrack', 'paytrack'),
    },
    'externos': {
        'ey-canvas': marca('EY', 'ey', 'Canvas · Client Portal'),
        'chatgpt': marca('ChatGPT, da OpenAI', 'openai', 'ChatGPT'),
        'gemini': marca('Google Gemini', 'gemini'),
        'wetransfer': marca('WeTransfer', 'wetransfer'),
        'datylon-graficos': marca('Datylon', 'datylon'),
        'coolors-paletas': marca('Coolors', 'coolors'),
        'ilovepdf': marca('iLovePDF', 'ilovepdf'),
        # Tela do sistema, lida no Chrome do usuário em 22/09/2026 (arte_bmp.py).
        'bmp-rit': {'alt': 'BMP e RIT, sistema da ANEEL', 'pronto': arte_bmp.cartao},
    },
}


def confere_contraste():
    """Marca clara sobre fundo claro (ou o contrario) some. So da para medir
    nas marcas em PNG do modo `marca`."""
    avisos = []
    for chave, (arquivo, fundo, _) in MARCA.items():
        if not arquivo.endswith('.png'):
            continue
        # Mesma ordem de busca do `uri()`: marca do Grupo que so existe como
        # insumo de tela (Passatempo) mora em TELAS, nao em MARCAS.
        caminho = next((os.path.join(b, arquivo) for b in (MARCAS, TELAS, LOGOS)
                        if os.path.exists(os.path.join(b, arquivo))), None)
        if not caminho:
            avisos.append('%s: arquivo %s nao encontrado' % (chave, arquivo))
            continue
        opacos = [p for p in Image.open(caminho).convert('RGBA').getdata() if p[3] > 120]
        if not opacos:
            continue
        media = sum(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in opacos) / len(opacos)
        if (media > 170) == claro(fundo):
            avisos.append('%s: marca %s sobre fundo %s'
                          % (chave, 'clara' if media > 170 else 'escura', fundo))
    return avisos


if __name__ == '__main__':
    for aviso in confere_contraste():
        print('AVISO ' + aviso)
    total = peso = 0
    for pasta, itens in CARTOES.items():
        destino = os.path.join('assets', pasta)
        os.makedirs(destino, exist_ok=True)
        for nome, spec in itens.items():
            svg = compor(spec).encode('utf-8')
            io.open(os.path.join(destino, nome + '.svg'), 'wb').write(svg)
            total += 1
            peso += len(svg)
    print('%d artes | %.0f KB no total | %.1f KB por arte'
          % (total, peso / 1024.0, peso / 1024.0 / total))
