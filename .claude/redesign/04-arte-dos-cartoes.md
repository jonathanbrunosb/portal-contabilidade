# Arte dos cartões — como fazer a imagem de um item novo

> Leia **antes** de adicionar qualquer item a `data/sistemas.json`,
> `data/automacoes.json`, `data/documentos.json`, `data/portais.json`,
> `data/externos.json` ou `data/config.json › links`. Aprovado pelo usuário em
> 20/09/2026, depois de três correções — o caminho genérico foi recusado todas
> as vezes.

## A regra

**A imagem do cartão é a identidade real do destino, não uma ilustração do
tema.** Cada cartão tem de guardar a personalidade do próprio sistema: quem
olha a grade precisa reconhecer para onde vai antes de ler o título.

Nunca: desenho genérico, ícone decorativo junto da marca, marca de uma
instituição que não é a dona do link, logo boiando sobre cor escolhida por
gosto.

---

## Passo 1 — Escolher o modo

```
O link abre uma tela que eu consigo ver sem senha?
├── SIM, e ela tem identidade própria (fundo, logo, título)
│      → modo `tela`   — reproduza aquela tela
└── NÃO (SSO, intranet, ou é uma instituição sem tela a reaproveitar)
       → modo `marca`  — marca oficial sobre o fundo da própria marca
          └── e se não existir arquivo utilizável da marca
                 → `assinatura` — o nome em tipografia sobre a cor da marca
```

Na dúvida, **tente o modo `tela` primeiro**: é ele que dá personalidade.

---

## Passo 2 — Levantar o material

### Acesse em largura de desktop

**1600 px, sempre.** Muitos sistemas escondem o painel de identidade em tela
estreita — o ProjectHub é o caso: em janela pequena some tudo que interessa.

```
resize_window  → width 1600, height 900
navigate       → o link do cartão
```

### Leia o DOM, não só a captura

A captura mostra; o DOM dá os valores exatos. Cole no console do painel:

```js
await new Promise(r => setTimeout(r, 3500));
const fundos = [...document.querySelectorAll('*')].map(el => {
  const b = getComputedStyle(el).backgroundImage;
  return b && b !== 'none'
    ? { sel: el.tagName + '.' + String(el.className).slice(0, 45), bg: b.slice(0, 220) }
    : null;
}).filter(Boolean).slice(0, 10);
const imgs = [...document.images].map(i => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight }));
const txt = [...document.querySelectorAll('h1,h2,h3,p,span')].slice(0, 12).map(e => {
  const s = getComputedStyle(e), r = e.getBoundingClientRect();
  return e.textContent.trim() && r.width
    ? { t: e.textContent.trim().slice(0, 46), fs: s.fontSize, fw: s.fontWeight,
        ff: s.fontFamily.split(',')[0], cor: s.color,
        pos: [Math.round(r.x), Math.round(r.y)] }
    : null;
}).filter(Boolean);
JSON.stringify({ titulo: document.title, fundos, imgs, txt }, null, 1)
```

Anote: **onde o bloco fica no painel** (topo, meio ou rodapé), a URL do fundo,
a URL da logo, e o tamanho/peso/cor do título e do subtítulo.

> O bloco de identidade do Cronograma de Fechamento fica a **63% da altura** do
> painel. Eu tinha posto no meio e ficou errado. Meça.

### Baixe os insumos para fora do site

Fundo e logo vão para **`projeto/marcas-telas/`**, que não é publicado — eles
entram embutidos no SVG, não precisam ser servidos. Logos de instituição (modo
`marca`) vão para `assets/marcas/`, e a origem de cada uma entra em
`assets/marcas/FONTES.md`.

---

## Passo 3 — Registrar no gerador

Tudo fica em `.claude/tools/arte-marcas.py`, no dicionário `CARTOES`, sob a
pasta da coleção. Os campos do spec:

| Campo | Para quê |
|---|---|
| `alt` | texto alternativo — o titular da marca, não o nome do cartão |
| `foto` / `showcase` / `degrade` / `fundo` | o fundo, nessa ordem de precedência |
| `veu` | camadas `(posição, cor, opacidade)` sobre a foto |
| `logo` | arquivo da marca |
| `trocas` | substituições de cor dentro do SVG da marca, ex.: `{'#74aa9c': '#000000'}` para o ladrilho do ChatGPT virar preto |
| `inverter` | `True` quando a logo vem escura e o site a inverte por CSS |
| `claro` | `True` quando a foto de fundo é clara, para o texto sair em tinta escura |
| `titulo`, `subtitulo` | o lockup da tela de entrada |
| `alinhamento` | `esquerda` (modo `tela`) ou `centro` (modo `marca`) |
| `serif` | `True` quando o sistema usa serifada (Georgia) |
| `logoY`, `logoLargura`, `logoAltura`, `baseTitulo` | posição do bloco |
| `tamanhoTitulo`, `pesoTitulo`, `limite` | corpo do título e onde quebrar linha |
| `corTitulo`, `corSub` | as cores medidas no site |
| `rotulo` | modo `marca`: o texto que diferencia quando a marca se repete |

Atalhos prontos: `marca(alt, chave, rotulo)`, `assinatura(alt, chave, rotulo)`
e `showcase(alt, logo, titulo)` para o painel do Cronograma/Auditoria.

### Marca repetida pede rótulo

Se a mesma logo já serve a outro cartão, **é obrigatório** um rótulo abaixo
dela. Use o que diferencia de verdade: a transação (`ME23N`, `FB03`,
`S_ALR_87012277`), a norma (`SPED · ECD`, `LC 214/2025`), o ambiente
(`HANA · Ambiente QA`) ou o sistema (`Gastos Gerenciáveis`).

Depois, rode:

```bash
python .claude/tools/arte-marcas.py
```

---

## Passo 4 — Apontar o cartão para a arte

O campo `imagem` de cada item, com o caminho relativo à raiz:

| Coleção | Pasta da arte |
|---|---|
| `data/sistemas.json` | `assets/sistemas/<id>.svg` |
| `data/automacoes.json` | `assets/automacoes/<slug>.svg` |
| `data/documentos.json` | `assets/documentos/<slug>.svg` |
| `data/portais.json` | `assets/portais/<id>.svg` |
| `data/externos.json` | `assets/externos/<id>.svg` |
| `data/config.json › links` | `assets/atalhos/<slug>.svg` |

Se um item ficar sem `imagem`, o cartão cai no ícone da categoria — aceitável
como estado temporário, nunca como entrega.

---

## Passo 5 — Conferir

```bash
start http://localhost:5500/projeto/artes/contato.html   # as 61, no tamanho real do cartão
start http://localhost:5500/projeto/artes/telas.html     # as do modo tela, ampliadas
```

Depois no portal, na tela onde o cartão aparece. **As capturas do painel às
vezes voltam em branco** — quando desconfiar, meça em vez de olhar:

```js
const img = document.querySelector('.pcard-img');
const c = document.createElement('canvas'); c.width = 40; c.height = 36;
const g = c.getContext('2d'); g.drawImage(img, 0, 0, 40, 36);
const d = g.getImageData(0, 0, 40, 36).data;
JSON.stringify({ carregou: img.naturalWidth > 0, cantoSuperiorEsquerdo: [d[0], d[1], d[2]] })
```

O canto tem de ser a cor de fundo da arte — se vier branco numa arte escura, a
imagem não desenhou.

---

## Armadilhas que já custaram tempo

| Sintoma | Causa | O que fazer |
|---|---|---|
| Logo **esticada** (foi o caso da EY) | o SVG da marca não tem `viewBox`, então o `<image>` a estica até preencher a caixa | o gerador deduz o `viewBox` de `width`/`height`; confira se a marca nova caiu nesse caminho |
| Logo **invisível** | marca clara sobre fundo claro — foi o gov.br, que só existe em versão branca | fundo na cor institucional da marca; o gerador avisa (`AVISO ...`) nas marcas em PNG |
| Logo **não desenha** | PNG ou GIF de paleta com transparência não renderiza dentro de `<image>` | o gerador converte para RGBA; nada a fazer, só não contornar |
| Logo **descentralizada** | moldura transparente sobrando no PNG | o gerador corta pelo `getbbox()` do canal alfa |
| Logo **escura** num fundo escuro | o arquivo é a versão escura e o site a inverte por CSS (ProjectHub, Cronograma) | `inverter: True` |
| Conteúdo **cortado** na borda | `object-fit: cover` corta até 10% de cada lado | nada essencial fora de **60 px nas laterais e 44 px em cima e embaixo** do quadro 440×400 |
| Identidade **não aparece** no site | você abriu em janela estreita | 1600 px |

---

## Checklist antes de dar por pronto

- [ ] O link foi aberto **em 1600 px** e a identidade foi lida no DOM.
- [ ] A marca é a do **titular do destino** (link do Planalto → Brasão da
      República, não gov.br).
- [ ] O fundo combina com a logo; a arte **preenche o quadro**.
- [ ] **Nenhum ícone ou desenho** junto da marca.
- [ ] Marca repetida tem **rótulo** que a diferencia.
- [ ] Nada essencial na área de corte.
- [ ] O `imagem` do item aponta para o arquivo certo.
- [ ] Conferido na folha de contato **e** na tela do portal.
- [ ] Marca nova registrada em `assets/marcas/FONTES.md` (titular e origem).
- [ ] Insumos de tela em `projeto/marcas-telas/`, fora do site publicado.

---

## Depois de trocar uma arte, suba a versão

```bash
python .claude/tools/versao.py --subir
```

`comVersao()` em `js/ui.js` carimba o `?v=` do portal em toda imagem nossa na
hora de renderizar, lendo a versão do endereço do próprio módulo. Então **subir
a versão é o bastante** para a arte nova chegar a quem já visitou — sem
Ctrl+F5 e sem número separado para lembrar. Sem isso, a arte troca no
repositório e o navegador continua mostrando a antiga.

## Uma coisa a lembrar antes de publicar

**Cuidado com foto licenciada.** A do banner da Central de Resultados é iStock,
contratada para o site de RI. Reaproveitar num site público é outra coisa —
confirme antes.
