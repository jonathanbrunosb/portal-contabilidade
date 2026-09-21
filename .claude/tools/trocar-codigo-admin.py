# -*- coding: utf-8 -*-
"""Troca o codigo de acesso da janela de Administracao.

O codigo nunca fica no repositorio: so o hash SHA-256 dele, em
ADMIN_UNLOCK_HASH (js/app.js). Este script pede o codigo novo sem mostrar o
que e digitado, grava so o hash e nao imprime nem guarda o codigo.

Rode da raiz do projeto, num terminal:
    python .claude/tools/trocar-codigo-admin.py

Depois suba a versao (python .claude/tools/versao.py --subir) para o
navegador pegar o app.js novo. Lembrete: e uma trava so de interface, roda no
navegador; nao e autenticacao (ver README, "Usuarios e identificacao").
"""
import getpass
import hashlib
import os
import re
import sys

ARQUIVO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'js', 'app.js')
PADRAO = re.compile(r"(const ADMIN_UNLOCK_HASH=')[0-9a-f]{64}(')")

codigo = getpass.getpass('Novo codigo de acesso: ')
if len(codigo) < 8:
    sys.exit('Use pelo menos 8 caracteres. Nada foi alterado.')
if getpass.getpass('Repita o codigo: ') != codigo:
    sys.exit('Os dois nao conferem. Nada foi alterado.')

# newline='' preserva as quebras de linha do arquivo como estao.
with open(ARQUIVO, encoding='utf-8', newline='') as f:
    fonte = f.read()
if not PADRAO.search(fonte):
    sys.exit('ADMIN_UNLOCK_HASH nao encontrado em js/app.js. Nada foi alterado.')
novo = PADRAO.sub(lambda m: m.group(1) + hashlib.sha256(codigo.encode('utf-8')).hexdigest() + m.group(2), fonte, count=1)
with open(ARQUIVO, 'w', encoding='utf-8', newline='') as f:
    f.write(novo)
print('Codigo trocado. Suba a versao: python .claude/tools/versao.py --subir')
