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

from PIL import Image

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


def foto(nome, largura=620):
    """Recorta a foto na proporcao do quadro, pelo centro, e embute."""
    im = Image.open(os.path.join(TELAS, nome)).convert('RGB')
    alvo = float(L) / A
    if im.width / float(im.height) > alvo:
        larg = int(im.height * alvo)
        im = im.crop(((im.width - larg) // 2, 0, (im.width + larg) // 2, im.height))
    else:
        alt = int(im.width / alvo)
        im = im.crop((0, (im.height - alt) // 2, im.width, (im.height + alt) // 2))
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


def fundo_foto(arquivo, veu=None):
    corpo = ['<image href="%s" x="0" y="0" width="%d" height="%d" '
             'preserveAspectRatio="xMidYMid slice"/>' % (foto(arquivo), L, A)]
    defs = []
    if veu:
        paradas = ''.join('<stop offset="%g" stop-color="%s" stop-opacity="%g"/>' % p for p in veu)
        defs.append('<linearGradient id="v" x1="0" y1="0" x2="1" y2="1">%s</linearGradient>' % paradas)
        corpo.append('<rect width="%d" height="%d" fill="url(#v)"/>' % (L, A))
    return corpo, defs


# -------------------------------------------------------------- composicao
def compor(spec):
    """spec: dict com fundo, logo, titulo, subtitulo, rotulo, alinhamento."""
    if 'foto' in spec:
        corpo, defs = fundo_foto(spec['foto'], spec.get('veu'))
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

    tinta = INK_CLARO if fundo_claro else INK_ESCURO
    cor_titulo = spec.get('corTitulo', tinta)
    cor_sub = spec.get('corSub', tinta)
    fonte = SERIF if spec.get('serif') else SANS
    esquerda = spec.get('alinhamento', 'centro') == 'esquerda'

    if esquerda:
        # Lockup da tela de entrada: logo em cima, titulo e subtitulo abaixo.
        logo_h = spec.get('logoAltura', 32)
        corpo.append('<image href="%s" x="%d" y="%d" width="%d" height="%d" '
                     'preserveAspectRatio="xMinYMid meet"/>'
                     % (uri(spec['logo'], spec.get('trocas'), 640,
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
                         % (uri(spec['logo'], spec.get('trocas'), 640), *caixa))
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
    'cfc': ('cfc.png', BRANCO, {}), 'cpc': ('cpc.png', BRANCO, {}),
    'ifrs': ('ifrs.svg', BRANCO, {}), 'aneel': ('aneel.png', BRANCO, {}),
    'receita': ('receita-federal.svg', BRANCO, {}),
    'openai': ('openai.svg', '#000000', {'#74aa9c': '#000000'}),
    'ey': ('ey.svg', '#2e2e38', {'#161d23': '#ffffff'}),
    'wetransfer': ('wetransfer.svg', '#409fff', {'#000': '#ffffff'}),
    'equatorial': ('grupo-equatorial-branco.png', EQTL_AZUL, {}),
}
ASSINATURA = {'onesource': ('ONESOURCE', '#16283f'), 'learning-rocks': ('learning.rocks', '#151b2e'),
              'qulture-rocks': ('Qulture.Rocks', '#1d1b3a'), 'argo': ('ARGO', '#0b3b6f')}


def marca(alt, chave, rotulo=None):
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
ARRENDAMENTO = {
    'alt': 'IFRS 16 / CPC 06 (R2), sistema de arrendamentos',
    'degrade': ('#f1f5f9', '#e2e8f0', 135), 'logo': 'arrendamento-logo.png',
    'titulo': 'IFRS 16 / CPC 06 (R2)', 'subtitulo': 'Sistema de Gestão de Arrendamentos',
    'alinhamento': 'esquerda', 'tamanhoTitulo': 28, 'limite': 18,
    'corTitulo': '#1a3c5e', 'corSub': '#64748b', 'logoLargura': 150, 'logoAltura': 34,
}
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


def planalto(alt, titulo, ementa):
    """Pagina do Planalto: brasao da Republica sobre branco, texto em serifada.
    O link vai direto ao texto da lei, entao a marca certa e o brasao, nao o
    gov.br (correcao do usuario em 20/09/2026)."""
    return {'alt': alt, 'fundo': BRANCO, 'logo': 'brasao-republica.gif',
            'titulo': titulo, 'subtitulo': ementa, 'alinhamento': 'esquerda',
            'serif': True, 'tamanhoTitulo': 27, 'pesoTitulo': 400, 'limite': 20,
            'corTitulo': '#1c2433', 'corSub': '#5f6d82',
            'logoLargura': 54, 'logoAltura': 56}


# ------------------------------------------------------------------ cartoes
CARTOES = {
    'atalhos': {
        'sap': marca('SAP', 'sap', 'NWBC · Produção'),
        'sap-hana-qa': marca('SAP', 'sap', 'HANA · Ambiente QA'),
        'cronograma-fechamento': showcase('Cronograma de Fechamento', 'cronograma-logo.png',
                                          'Cronograma de Fechamento'),
        'sharepoint': marca('Microsoft SharePoint', 'sharepoint', 'SharePoint'),
        'auditoria': showcase('Portal da Contabilidade, controle de auditoria',
                              'auditoria-logo.png', 'Portal da Contabilidade'),
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
        'portal-servicos-home': marca('ServiceNow', 'servicenow', 'Portal de Serviços'),
        'portal-servicos-ocorrencias': marca('ServiceNow', 'servicenow', 'Minhas ocorrências'),
        'portal-servicos-acesso': marca('ServiceNow', 'servicenow', 'Acesso a sistemas'),
        'portal-servicos-sap': marca('SAP', 'sap', 'Solicitações SAP'),
        'portal-servicos-incidentes': marca('ServiceNow', 'servicenow', 'Problemas gerais'),
        'portal-servicos-office365': marca('Microsoft', 'microsoft', 'Acesso Office 365'),
        'portal-servicos-powerbi': marca('Microsoft Power BI', 'power-bi', 'Publicação em nuvem'),
        'portal-servicos-senha': marca('ServiceNow', 'servicenow', 'Redefinição de senha'),
        'portal-servicos-jornada': marca('ServiceNow', 'servicenow', 'Jornada de trabalho'),
        'workplace': marca('Meta', 'meta', 'Workplace'),
        'learning-rocks': assinatura('Learning.rocks', 'learning-rocks'),
        'sharepoint-eqtl-go': marca('Microsoft SharePoint', 'sharepoint', 'Equipe EQTL GO'),
        'bi-gastos-gerenciaveis': marca('Microsoft Power BI', 'power-bi', 'Gastos Gerenciáveis'),
        'central-funcionario': marca('ServiceNow', 'servicenow', 'Central do Funcionário'),
        'actio': marca('Actio', 'actio', 'Actio'),
        'portal-colaborador': marca('Grupo Equatorial', 'equatorial', 'Portal do Colaborador'),
        'eqtl-previ': marca('Grupo Equatorial', 'equatorial', 'EQTL Previ'),
        'qulture-rocks': assinatura('Qulture.Rocks', 'qulture-rocks'),
        'argo-pontes': assinatura('ARGO, da Pontes Tur', 'argo', 'Pontes Tur'),
        'paytrack': marca('Paytrack', 'paytrack', 'Paytrack'),
    },
    'externos': {
        'ey-canvas': marca('EY', 'ey', 'Canvas · Client Portal'),
        'chatgpt': marca('ChatGPT, da OpenAI', 'openai', 'ChatGPT'),
        'gemini': marca('Google Gemini', 'gemini'),
        'wetransfer': marca('WeTransfer', 'wetransfer', 'WeTransfer'),
        'datylon-graficos': marca('Datylon', 'datylon', 'Datylon'),
        'coolors-paletas': marca('Coolors', 'coolors'),
        'ilovepdf': marca('iLovePDF', 'ilovepdf'),
    },
}


def confere_contraste():
    """Marca clara sobre fundo claro (ou o contrario) some. So da para medir
    nas marcas em PNG do modo `marca`."""
    avisos = []
    for chave, (arquivo, fundo, _) in MARCA.items():
        if not arquivo.endswith('.png'):
            continue
        caminho = next(os.path.join(b, arquivo) for b in (MARCAS, LOGOS)
                       if os.path.exists(os.path.join(b, arquivo)))
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
