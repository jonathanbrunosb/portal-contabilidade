# -*- coding: utf-8 -*-
"""Sobe o cache-buster do portal em um comando.

O `?v=AAAAMMDD-N` aparece no `index.html` (CSS, JS e os logos fixos) e em cada
`import` dos modulos — todos precisam bater, senao um modulo carrega duas vezes.
As imagens nao tem numero proprio: `comVersao()` em `js/ui.js` le a versao do
endereco do proprio modulo e carimba em tempo de renderizacao. Entao subir aqui
basta para uma arte trocada chegar ao usuario sem Ctrl+F5.

Uso, da raiz do projeto:

    python .claude/tools/versao.py            # mostra a versao atual
    python .claude/tools/versao.py --subir    # AAAAMMDD de hoje, contador +1
    python .claude/tools/versao.py 20261002-1 # define uma versao exata
"""
import datetime
import io
import os
import re
import subprocess
import sys

ALVOS = ['index.html', 'css/styles.css', 'js/app.js', 'js/ui.js', 'js/auth.js',
         'js/navigation.js', 'js/newsletter.js', 'js/teams.js', 'js/data-service.js',
         'js/carousel.js', 'js/analytics.js', 'js/destaques.js', 'js/busca.js']
PADRAO = re.compile(r'\?v=(\d{8}-\d+)')


def ler(caminho):
    return io.open(caminho, encoding='utf-8').read().replace('\r\n', '\n')


def versoes():
    achadas = {}
    for alvo in ALVOS:
        if not os.path.exists(alvo):
            continue
        for v in PADRAO.findall(ler(alvo)):
            achadas.setdefault(v, []).append(alvo)
    return achadas


def proxima(atual):
    hoje = datetime.date.today().strftime('%Y%m%d')
    if atual and atual.startswith(hoje):
        return '%s-%d' % (hoje, int(atual.split('-')[1]) + 1)
    return hoje + '-1'


def aplica(nova):
    total = 0
    for alvo in ALVOS:
        if not os.path.exists(alvo):
            continue
        texto = ler(alvo)
        trocado, n = PADRAO.subn('?v=' + nova, texto)
        if n:
            io.open(alvo, 'w', encoding='utf-8', newline='\n').write(trocado)
            total += n
            print('  %-24s %d' % (alvo, n))
    return total


if __name__ == '__main__':
    atuais = versoes()
    if not atuais:
        sys.exit('Nenhum ?v= encontrado. Confira a lista ALVOS.')
    if len(atuais) > 1:
        print('ATENCAO: versoes diferentes convivendo —')
        for v, arquivos in sorted(atuais.items()):
            print('  %s  %s' % (v, ', '.join(arquivos)))
    atual = sorted(atuais)[-1]

    argumentos = sys.argv[1:]
    if not argumentos:
        print('versao atual: %s  (%d ocorrencias)'
              % (atual, sum(len(a) for a in atuais.values())))
        print('para subir:   python .claude/tools/versao.py --subir')
        sys.exit(0)

    nova = proxima(atual) if argumentos[0] == '--subir' else argumentos[0]
    if not re.fullmatch(r'\d{8}-\d+', nova):
        sys.exit('Formato esperado: AAAAMMDD-N (ex.: 20261002-1)')

    print('%s -> %s' % (atual, nova))
    total = aplica(nova)
    print('%d ocorrencias atualizadas' % total)

    eol = os.path.join('.claude', 'tools', 'eol.py')
    if os.path.exists(eol):
        subprocess.run([sys.executable, eol])
