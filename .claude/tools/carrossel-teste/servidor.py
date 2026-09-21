# -*- coding: utf-8 -*-
"""Servidor de teste do carrossel: serve o projeto e, em /__teste.html, a
pagina que empilha todos os slides no ar (para fotografar e medir cada um com
o Edge headless -- ver contraste.py e foto.ps1).

Rode da raiz do projeto, em segundo plano:
    python .claude/tools/carrossel-teste/servidor.py
Porta 5599, so em 127.0.0.1.
"""
import functools
import http.server
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))
PORTA = 5599


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if path.split('?')[0] == '/__teste.html':
            return os.path.join(AQUI, 'teste.html')
        return super().translate_path(path)

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    print(f'http://127.0.0.1:{PORTA}/__teste.html  (raiz {RAIZ})')
    http.server.ThreadingHTTPServer(('127.0.0.1', PORTA), functools.partial(Handler, directory=RAIZ)).serve_forever()
