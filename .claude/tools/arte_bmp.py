# -*- coding: utf-8 -*-
"""Arte do cartão "BMP e RIT - Envio e Consulta" (ANEEL), 22/09/2026.

Reproduz a tela do sistema (http://bmp2.aneel.gov.br/UploadRit.aspx), lida no
Chrome do usuário a 1536 px: a barra verde do governo, o cabeçalho azul
listrado com "BMP / Balancete Mensal Padronizado", a faixa do menu com as abas
de canto chanfrado (Início, Enviar BMP, Consultar BMP, Enviar RIT, Consultar
RIT) e a faixa do título "RIT / Relatório de Informações Trimestrais".

Nada foi baixado: as cores saíram dos pixels das próprias imagens de fundo do
site, lidas pelo navegador (fundoCabecalho.jpg 1x62, fundoMenu.png 1x39,
m_niv01_bg.png 12x144, fundoCabecalhoTitulo.png 1x68), e a tipografia do CSS
(Verdana). A identificação de quem está logado, no canto direito, não entra.
Chamado pelo arte-marcas.py (`{'alt': ..., 'pronto': cartao}`).
"""

L, A = 512, 288
VERDANA = 'Verdana,Tahoma,Arial,sans-serif'

# Barra do governo federal (barra-brasil-v3).
GOV_VERDE, GOV_AMARELO = '#00500f', '#f7c600'
# Cabeçalho: listras de 2 px, escura/clara, no período de 4 px do jpg.
LISTRA_ESCURA, LISTRA_CLARA = '#125081', '#376890'
# Faixa do menu (fundoMenu.png, de cima para baixo) e o fio claro da base.
MENU = [(0.00, '#1f5a82'), (0.10, '#144c75'), (0.90, '#336488')]
MENU_FIO = '#a8c5d7'
# Aba (m_niv01_bg.png): degradê escuro e o canto de cima à direita chanfrado.
ABA = [(0.00, '#003d72'), (0.60, '#004b7c'), (1.00, '#004878')]
ABA_TEXTO = '#d3e3ee'
# Faixa do título (fundoCabecalhoTitulo.png) e as cores do h1 e do subtítulo.
TITULO_FAIXA = [(0.00, '#eeeff0'), (0.06, '#d3d7d4'), (0.38, '#ffffff'),
                (0.62, '#ffffff'), (0.93, '#d3d7d4'), (0.97, '#edeeee')]
TITULO_FIO = '#83acc6'
TITULO_COR, SUBTITULO_COR = '#22577b', '#3e779d'
# Quadro "Orientação" abaixo do título.
ORIENTACAO_FUNDO, ORIENTACAO_BORDA, ORIENTACAO_COR = '#f7f8f8', '#8ac4d4', '#3aa5c1'

ABAS = ['Início', 'Enviar BMP', 'Consultar BMP', 'Enviar RIT', 'Consultar RIT']


def _paradas(lista):
    return ''.join('<stop offset="%.2f" stop-color="%s"/>' % p for p in lista)


def _largura_texto(texto, tamanho):
    # Verdana negrito: ~0,68 do corpo por letra (medido nas abas: 11,2 px).
    return len(texto) * tamanho * 0.68


def cartao(alt):
    gov_h, cab_h, menu_h, titulo_h = 16, 96, 40, 66
    y_cab = gov_h
    y_menu = y_cab + cab_h
    y_tit = y_menu + menu_h
    y_ori = y_tit + titulo_h

    partes = []
    # Barra do governo, com as lingüetas amarelas "Acesso à Informação" e "BRASIL".
    partes.append('<rect width="%d" height="%d" fill="%s"/>' % (L, gov_h, GOV_VERDE))
    for x, w, rotulo in ((340, 104, 'Acesso à Informação'), (450, 58, 'BRASIL')):
        # Lingüeta com a ponta esquerda curva, como os gifs da barra.
        partes.append('<path d="M%d 2 H%d V%d H%d Q%d 2 %d 2 Z" fill="%s"/>'
                      % (x + 10, x + w, gov_h, x, x, x + 10, GOV_AMARELO))
        partes.append('<text x="%d" y="%d" font-family="%s" font-size="8" font-weight="700" '
                      'font-style="italic" fill="%s" text-anchor="middle">%s</text>'
                      % (x + w / 2 + 2, gov_h - 4, VERDANA, GOV_VERDE, rotulo))
    # Cabeçalho listrado e o título do sistema.
    partes.append('<rect y="%d" width="%d" height="%d" fill="url(#listras)"/>' % (y_cab, L, cab_h))
    partes.append('<text x="22" y="%d" font-family="%s" font-size="40" fill="#ffffff">BMP</text>'
                  % (y_cab + 46, VERDANA))
    partes.append('<text x="22" y="%d" font-family="%s" font-size="19" fill="#ffffff">'
                  'Balancete Mensal Padronizado</text>' % (y_cab + 76, VERDANA))
    # Faixa do menu com as abas.
    partes.append('<rect y="%d" width="%d" height="%d" fill="url(#menu)"/>' % (y_menu, L, menu_h))
    partes.append('<rect y="%d" width="%d" height="1" fill="%s"/>' % (y_menu + menu_h - 1, L, MENU_FIO))
    x, aba_h, chanfro, tamanho = 18, 22, 9, 10
    for rotulo in ABAS:
        w = _largura_texto(rotulo, tamanho) + 18
        topo = y_menu + menu_h - 1 - aba_h
        partes.append('<path d="M%.1f %d h%.1f l%d %d v%d h-%.1f z" fill="url(#aba)"/>'
                      % (x, topo, w - chanfro, chanfro, chanfro, aba_h - chanfro, w))
        partes.append('<text x="%.1f" y="%d" font-family="%s" font-size="%d" font-weight="700" '
                      'fill="%s" text-anchor="middle">%s</text>'
                      % (x + w / 2, topo + 15, VERDANA, tamanho, ABA_TEXTO, rotulo))
        x += w + 2
    # Faixa do título da página.
    partes.append('<rect y="%d" width="%d" height="%d" fill="url(#faixa)"/>' % (y_tit, L, titulo_h))
    partes.append('<rect y="%d" width="%d" height="2" fill="%s"/>' % (y_tit + titulo_h - 2, L, TITULO_FIO))
    partes.append('<text x="22" y="%d" font-family="%s" font-size="22" font-weight="700" fill="%s">RIT</text>'
                  % (y_tit + 27, VERDANA, TITULO_COR))
    partes.append('<text x="22" y="%d" font-family="%s" font-size="16" font-weight="700" '
                  'font-style="italic" fill="%s">Relatório de Informações Trimestrais</text>'
                  % (y_tit + 50, VERDANA, SUBTITULO_COR))
    # Quadro "Orientação", na altura que sobra.
    partes.append('<rect y="%d" width="%d" height="%d" fill="#ffffff"/>' % (y_ori, L, A - y_ori))
    partes.append('<rect x="18" y="%d" width="%d" height="%d" fill="%s"/>'
                  % (y_ori + 12, L - 36, A - y_ori - 12, ORIENTACAO_FUNDO))
    partes.append('<rect x="18" y="%d" width="%d" height="2" fill="%s"/>'
                  % (A - 2, L - 36, ORIENTACAO_BORDA))
    cy = y_ori + 12 + (A - y_ori - 12) / 2
    partes.append('<circle cx="42" cy="%.1f" r="13" fill="url(#info)"/>' % cy)
    partes.append('<text x="42" y="%.1f" font-family="Georgia,serif" font-size="17" font-weight="700" '
                  'font-style="italic" fill="#ffffff" text-anchor="middle">i</text>' % (cy + 6))
    partes.append('<text x="66" y="%.1f" font-family="%s" font-size="17" font-weight="700" fill="%s">'
                  'Orientação</text>' % (cy + 6, VERDANA, ORIENTACAO_COR))

    defs = (
        '<pattern id="listras" width="4" height="4" patternUnits="userSpaceOnUse">'
        '<rect width="4" height="4" fill="%s"/><rect y="1" width="4" height="2" fill="%s"/></pattern>'
        % (LISTRA_ESCURA, LISTRA_CLARA)
        + '<linearGradient id="menu" x1="0" y1="0" x2="0" y2="1">%s</linearGradient>' % _paradas(MENU)
        + '<linearGradient id="aba" x1="0" y1="0" x2="0" y2="1">%s</linearGradient>' % _paradas(ABA)
        + '<linearGradient id="faixa" x1="0" y1="0" x2="0" y2="1">%s</linearGradient>' % _paradas(TITULO_FAIXA)
        + '<radialGradient id="info" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#7cc6ec"/>'
          '<stop offset="1" stop-color="#1c79b8"/></radialGradient>'
    )
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" aria-label="%s">'
            '<defs>%s</defs>%s</svg>' % (L, A, alt, defs, ''.join(partes)))


if __name__ == '__main__':
    import io
    io.open('assets/externos/bmp-rit.svg', 'w', encoding='utf-8').write(cartao('ANEEL — BMP e RIT'))
    print('assets/externos/bmp-rit.svg')
