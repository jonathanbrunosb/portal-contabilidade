# Sistema visual do portal (fatias 6 e 7)

Aplicado em 20/09/2026 em `css/styles.css`. Todos os tokens ficam no `:root`,
no topo do arquivo. **Não escreva cor, tamanho, raio ou sombra direto na
regra** — use o token; se faltar um, crie no `:root` e explique no comentário.

---

## 1. Tipografia

Uma escala de sete degraus, **sem nada abaixo de 12 px**. A hierarquia se faz
por **peso e cor**, não inventando um tamanho novo.

| Token | px | Onde se usa |
|---|---|---|
| `--fs-xs` | 12 | etiquetas, rótulos, legendas, filtros |
| `--fs-sm` | 12,5 | texto de apoio, descrições |
| `--fs-base` | 13 | **corpo**; títulos de cartão (em negrito) |
| `--fs-md` | 14,5 | títulos de bloco, busca do cabeçalho |
| `--fs-lg` | 16 | "Portal da Gerência de", títulos de seção |
| `--fs-xl` | 20 | `h2`, título do diálogo |
| `--fs-2xl` | 27 | "Contabilidade" no cabeçalho, número de indicador |

**Redução de 10% em 20/09/2026**, a pedido do usuário ("mais espaços e melhor
densidade"). Os dois menores degraus não podiam encolher: o piso de 12 px é
travado, e 10% os levaria a 10,8 e 11,7 px. A escala desceu um degrau — os
tamanhos médios e grandes caíram de 9 a 11% e os sete degraus continuam
distintos. Antes: 12, 13, 14, 16, 18, 22, 30.

Depois da redução, dois títulos-botão da capa (`.news-title` e `.dq-title`)
caíram para 22 px de altura clicável, abaixo dos 24 da WCAG 2.5.8; ganharam
2 px de recuo vertical.

Pesos: `--peso-leve` 300 (só a primeira linha do título do portal),
`--peso-medio` 600, `--peso-forte` 700. O corpo usa 400, que é o padrão.

Fonte: `--fonte` = `"Segoe UI", Arial, Helvetica, sans-serif`. A `Inter` saiu
da pilha — ela não é distribuída com o portal e renderizava diferente em quem
a tem instalada.

**Antes:** 29 tamanhos diferentes (de 8 px a 30 px) e 7 pesos, incluindo
650 e 750. O degrau de 11 px existiu por um dia e foi absorvido pelo de 12 px
na fatia 7 — abaixo de 12 px o texto cansa a vista.

Números em coluna (tabelas e indicadores) usam `font-variant-numeric:
tabular-nums`, para não "pular" de largura entre uma linha e outra.

---

## 2. Cores

Nenhuma cor literal de 6 dígitos sobrou fora do `:root`. Só `#fff` e os
valores com transparência (degradês do cabeçalho, tarja do menu, sombras).

**Base**

| Token | Valor | Para quê |
|---|---|---|
| `--marinho` / `--marinho-escuro` | `#071f49` / `#0b2e5c` | faixas escuras, rodapé |
| `--azul` | `#0f6cb8` | **cor de ação**: links, botão primário, foco |
| `--azul-escuro` | `#0d5c9e` | hover do azul |
| `--azul-marca` | `#004aad` | azul dos boletins da Comunicação |
| `--azul-profundo` | `#02407a` | faixa de subpáginas e linha deslizante (padrão CFC) |
| `--azul-ativo` | `#00739a` | subpágina sob o cursor/foco |
| `--foco` | = `--azul` | contorno de foco; no cabeçalho escuro vira branco |
| `--fundo` | `#f4f7fb` | fundo da página |

**Texto:** `--texto` (corpo), `--texto-2` (secundário), `--texto-apoio`
(apoio), `--texto-apoio-2` (ícones e marcas d'água), `--texto-claro` e
`--texto-claro-2` (sobre fundo escuro).

**Superfícies e bordas, do mais claro ao mais marcado:**
`--superficie-sutil` → `--superficie-2` → `--azul-suave` → `--borda` →
`--borda-suave` → `--borda-media` → `--borda-ativa` (estado de hover).
`--faixa-clara` (`#ececec`) é a faixa de subpáginas do CFC.

**Semânticas:** cada uma tem a cor do texto e o fundo claro correspondente —
`--verde`/`--verde-fundo`, `--amarelo`/`--ambar-fundo`,
`--laranja`/`--ambar-fundo`, `--vermelho`/`--vermelho-fundo`,
`--roxo`/`--roxo-fundo`, `--verde-agua`/`--verde-agua-fundo`.
`--vermelho-extra` (`#8b0000`) é o vermelho do cabeçalho "Extra!" dos
boletins; `--acento-laranja` (`#cd572f`) é o laranja do subtítulo dos
boletins, usado no sublinhado do menu ativo e na borda do submenu.

### Contraste

Todo texto da interface passa em **AA (4,5:1)**, verificado em todas as telas
com os perfis Colaborador e Gerência, em 1440, 1024 e 375 px. O que mudou para
isso:

- `--azul` era `#0e7fdb`: dava **4,1:1** tanto como texto sobre branco quanto
  como fundo de botão com texto branco. Passou para `#0f6cb8` (**5,4:1** nos
  dois sentidos).
- `--texto-apoio` era `#64748b`: 4,43:1 sobre o fundo da página. Passou para
  `#5f6d82` (4,89:1).
- As cores semânticas escureceram para atender ao contraste sobre o próprio
  fundo claro (o verde estava em 4,1:1, o verde-água em 3,6:1).
- O contorno de foco era `#18a8f2` (2,65:1 contra o branco, invisível na
  prática). Passou a usar `--foco`; dentro do cabeçalho escuro, `.ph
  *:focus-visible` troca para branco.
- A etiqueta "Prazo" usa `--laranja-marcador` (`#c04f29`): o laranja da marca
  não aguenta texto branco (4,2:1).

---

## 3. Raios e sombras

Raios: `--raio-xs` 4 px (etiquetas, barras), `--raio-sm` 6 px (campos e
botões), `--raio-md` 8 px (cartões e blocos), `--raio-lg` 12 px (painéis e
diálogo), `--raio-pilula` (chips). Avatares continuam em `50%`.
**Antes:** 15 valores diferentes, de 4 px a 20 px.

Sombras — três, e nada além delas:

- `--sombra-sutil` `0 1px 3px` — repouso (painéis, cartões, hover de cartão).
- `--sombra-media` `0 6px 16px` — elevado (submenu do cabeçalho, cartão da
  gerência, botão sobre imagem).
- `--sombra-alta` `0 12px 28px` — flutuante (diálogo, popover, toast).

**Antes:** 15 sombras distintas, incluindo uma `0 24px 90px`.

---

## 4. O que mais saiu

- A animação `noticia-pulse` (pulsava a notícia recém-aberta). O realce virou
  um contorno fixo, que cumpre a mesma função sem movimento e vale igual para
  quem pediu "Reduzir movimento".
- O degradê decorativo na borda das tabelas no celular (a tabela empilha e não
  rola).
- O token `--radius`, que era só um apelido de `--raio-lg`, e os tokens que
  ficaram sem uso.
- O `backdrop-filter: blur` do fundo do diálogo: o escurecimento já separa a
  janela do resto (fatia 7).
- Os rótulos em caixa alta do diálogo de detalhes (fatia 7). A caixa alta
  sobrou só onde é convenção de etiqueta curta: as tarjas EXTRA/PRAZO/INFO dos
  avisos e a faixa de subpáginas do padrão CFC.

---

## 5. Alvos de toque

Nada abaixo de **24 × 24 px** (WCAG 2.5.8): os pontos do carrossel ganharam
área de clique de 24 px com o ponto de 11 px desenhado por dentro, as setas e a
pausa vão a 44 px no celular, os links do mapa do portal e os títulos das
tabelas ganharam folga vertical, e as caixas de marcar passaram de 18 px para
24 px.

## 6. Grade de cartões (`.pcard`)

### Carrossel de destaques — molde do Figma e gestão (21/09/2026, 2ª versão)

> **Substitui o slide "partido" descrito logo abaixo** (mantido como histórico
> das medidas do Conecta e do cálculo de cor de fundo, que continuam valendo).

**Molde:** o do usuário, desenhado no Figma em **2000×519** (proporção 3,85,
`projeto/comunicados`). Fundo em imagem (`fundoImagem`, `cover`) ou degradê
(`fundo` → `fundoFim`); **zona de imagens** com 53% da faixa, do lado de
`lado`, com uma imagem centrada ou duas sobrepostas (a principal no alto, do
lado de fora; a segunda embaixo, do lado de dentro), com `drop-shadow`
(`--sombra-imagem`, que segue o recorte de um notebook sem fundo); do outro
lado, o texto: **selo da origem** (cheio) + fio (`--linha-clara`) + área, título
(`--fs-xl`, 2 linhas), subtítulo (2), descrição (3) e a ação — seta para
destino interno, ícone de link externo para destino externo. Altura mínima de
300 px (em 1024 a proporção sozinha daria 250). No celular, imagens em cima
(16:9) e texto embaixo. Os moldes em SVG têm o texto **em curvas**: não são
usados como imagem pronta; o fundo e as capturas foram extraídos para
`assets/destaques/` (~225 KB contra 6,5 MB) e o texto vem dos dados.

**Dois formatos (21/09/2026, 2ª leva dos moldes + pedido do usuário):**

- **`molde`** — os slides desenhados no Figma. `.claude/tools/moldes-destaques.py`
  lê os SVGs (padrões `objectBoundingBox` com o recorte do Figma, sombras de
  `<g filter>`) e gera `<nome>-fundo.webp` (camadas da altura toda) e
  `<nome>-cena.webp` (as peças nas posições do molde, sobre transparente,
  recortadas na zona de 53%; escala 2 quando as capturas vieram grandes). A
  cena ocupa a zona inteira (`.dqb-img-1:only-child{inset:0}`), então a
  composição do Figma se mantém. `FUNDOS_BLOQUEADOS` exclui o fundo do IFRS 16
  (prévia da VectorStock: a 2ª leva cortou a marca d'água, mas a licença
  continua faltando). Com fundo próprio, `.formato-molde.com-fundo:after` põe
  um **halo escuro** radial atrás do texto (`--halo-texto`, 0,62) e a área vai
  em branco — sem isso, o Cronograma dava 1,7:1 na área e 2,7:1 no título.
- **`imagem`** (padrão) — comunicados e sistemas com uma imagem. A imagem ocupa
  **a altura toda**, encostada na borda, numa zona `--zona:min(56cqw,100cqh*16/9)`
  (a `.dqb` é `container-type:size` no desktop e `inline-size` no celular) e se
  desfaz (`mask-image`, 76% → transparente) num **fundo que é ela mesma
  espelhada e desfocada** (`.dqb-ambiente`, `scale(-1.3,1.3)`,
  `--desfoque-ambiente`: a borda da peça continua no fundo). No `:after`, de
  cima para baixo: listras finas a 145° (`--listra-slide`, o grafismo do molde
  do Cronograma), sombra do canto de fora (`--sombra-canto`), diagonal para
  `--dqb-fundo-fim` e o véu da cor do slide, que firma **antes** do texto
  começar. **Regra:** do lado do texto só entram efeitos que escurecem — uma
  luz de canto clara foi testada e derrubou o apoio para 3,8:1.

Contraste medido sobre o fundo real (Edge headless: fundo fotografado sem o
texto, cada linha de texto contra o p95 dos pixels): tudo ≥ 4,5:1 em 1440,
1024 e 375 px; pior caso 4,8:1. A prévia do formulário ficava com texto cinza
porque `#dialog-body p` vencia as cores do slide: a regra agora é
`#dialog-body p:not(.dqb p)`.

**O slide inteiro é o alvo do clique:** um `<a class="dqb-abrir">` esticado em
`z-index:2`, acima do texto (antes o texto, em `z-index:1`, cobria o botão e só
a metade da imagem clicava). Setas, pausa e bolinhas ficam fora do trilho, em
`z-index:3`. Destino sem endereço (sistema com link a cadastrar) vira
`<button>` e abre o aviso de configuração.

**Gestão** (`js/destaques.js`): cada slide aponta para um **destino**
(`alvo.tipo` + `alvo.ref`: comunicado, sistema, portal, externo, atalho,
página do portal ou endereço livre) e só guarda o que difere dele. Situação:
**No ar**, **Agendado**, **Pausado** (`ativo:false`) ou **Encerrado** (depois do
`fim`). Limite recomendado de **5 no ar** (`LIMITE_NO_AR`). Portas de entrada:
aba "Carrossel" da Administração, bloco "Carrossel da capa" na página do
comunicado e "Destacar no carrossel" nas fichas. O formulário abre num
diálogo largo (`dialog.dialogo-largo`, até 1100 px) com a **prévia do slide**
(`slideHTML()`, a mesma função do carrossel, dentro de `.dqb-previa inert`).
Gravar exige o servidor opcional; `initCarousel()` desliga o carrossel
anterior (`AbortController` + `clearInterval`) antes de redesenhar.

### Carrossel de destaques — 1ª versão, slide partido (histórico)

Formato do **Conecta** (o `/esc` do Portal de Serviços), medido lá: faixa
**larga e baixa**, não mais meia largura em 16:9.

| Medida | Valor (medido no Conecta) |
|---|---|
| Proporção | **3,125**, com **teto de 372 px de altura** |
| Cantos | 10 px, `overflow:hidden` |
| Troca | `transform .5s ease-in-out` — desliza de lado, não esmaece |
| Setas | 42 px, círculo, `#00000059`, 15 px das bordas, centradas |
| Bolinhas | 9 px, brancas (55% / 100%), centralizadas no rodapé |
| Pausa | 30 px, canto superior direito |

**O slide é partido, e isso é nosso.** No Conecta os dizeres vêm pintados
dentro do banner; os nossos destaques são notícia com foto. Então: imagem de
um lado (62% da faixa), texto do outro, e o **fundo sai da própria imagem**.
O lado alterna a cada destaque, com `lado` no JSON para fixar.

- **A altura tem teto.** A proporção sozinha, numa faixa de 1361, dava 435 px
  — alto demais; o modelo tem 377 px de altura absoluta. Com `max-height:372px`
  a faixa fica ainda mais baixa nas telas largas (3,66 em 1440), que é o
  efeito desejado. **`width:100%` é obrigatório junto:** com `width:auto` o
  navegador honra a proporção encolhendo a *largura* até caber no teto, e a
  faixa deixa de ocupar a capa inteira.
- **A emenda é máscara na foto, não camada de cor por cima.** Cobrir a foto com
  `--dqb-fundo` deixava um corte vertical seco: a camada chegava à cor cheia,
  mas ao lado dela quem pintava era o degradê do slide, já noutro tom. Com
  `mask-image` a foto se apaga e o que aparece atrás é sempre o mesmo fundo.
  O degradê do slide corre no sentido da foto (100° / 260°), para ela sempre
  encostar na ponta clara e o texto ficar na funda.
- **A ilustração cabe inteira: `contain`, não `cover`.** A caixa da arte é
  62% da faixa (2,27 de proporção) e as ilustrações são 16:9 — no `cover` o
  corte chegava a 22% da altura e comia o desenho. Com `contain` e
  `object-position` na borda de fora, a ilustração aparece **sem corte
  nenhum**, encostada na borda; a sobra do outro lado é o próprio fundo. A
  máscara termina antes da borda da ilustração (76% da caixa contra 78% onde
  ela acaba), então o recorte reto dela já está transparente.
- `fundo` e `fundoFim` ficam em `data/destaques.json`, visíveis para quem
  edita. São calculados por `.claude/tools/fundo-destaques.py` a partir da
  imagem:
  **histograma de matiz ponderado pela saturação**, ignorando cinza, sombra e
  estouro de branco; saturação alta nesse matiz e luminosidade baixada só até
  o branco ter 7:1.
- **Mediana da borda não serve.** Foi a primeira tentativa e deu `#425467`,
  `#3e5277` — lousa. A mediana puxa para o cinza e escurecer sem mexer na
  saturação só entrega cinza mais escuro. Com o matiz dominante saem
  `#0b56a8`, `#105e75`, `#156174`. Há um **piso de saturação de 0,64**: as
  ilustrações do portal são azuis lavados e batem nele, e sem o piso três
  slides sairiam quase da mesma cor.

**Comunicado sem foto não entra.** Em 21/09 foram geradas placas escuras com a
marca do assunto (ANEEL, IFRS, Grupo) para os quatro comunicados publicados sem
imagem. O usuário recusou: numa faixa dessas, placa de logo ao lado de texto
não parece notícia, parece anúncio. Comunicado sem foto fica fora do carrossel
até ter imagem própria.

Contraste medido nos 6 slides, nas duas pontas do degradê: título 7,0:1,
resumo 5,7:1, categoria 5,3:1.

A capa mudou junto: o carrossel é de **largura total** e Avisos + Acesso
rápido passaram para duas colunas abaixo dele. Em meia largura a faixa de
3,125 daria 666×213 — baixa demais para caber foto e texto.

**Atualização de 21/09/2026 (noite) — Comunicação à vista sem rolar.** Com a
faixa de Avisos + Acesso rápido entre o carrossel e a Comunicação, ela
começava abaixo da tela em todo monitor comum (824 px em 1536×730, 780 em
1366×657, 923 em 1920×950). Só baixar o carrossel não resolvia: para ver o
começo das imagens em 1536×730 ele teria de ter ~115 px. A partir de
**1200 px**:

- Avisos e Acesso rápido sobem para uma **coluna à direita do carrossel**
  (`clamp(360px, 30%, 500px)`); Avisos no alto, Acesso rápido alinhado à base.
- O carrossel fica com o resto da largura (não é mais meia largura, e sim
  ~70%) e mede pela **altura da janela**: `min-height: clamp(300px, 46vh,
  420px)`, esticando se a coluna ao lado for mais alta — as bases sempre
  alinhadas. Nessa faixa a imagem do formato "imagem" vai a 50% da largura
  (era 56%) e o título pode ter 3 linhas.
- A Comunicação **não mudou** (pedido do usuário): três colunas na largura
  toda. Saíram a faixa de título "Comunicação" e o "Ver todos os
  comunicados" (o menu já leva lá; cada coluna tem o seu "Veja mais"); o h2
  ficou só para leitor de tela.
- Resultado (título das colunas → começo das imagens): 1280×593 537/573;
  1366×657 537/573; 1536×730 537/573; 1920×911 623/659. Abaixo de 1200 px a
  capa segue empilhada como antes.
- Contraste dos 6 slides na geometria nova (p95 do fundo real): mínimo 4,8:1
  (Tarifas, em 1366 e 1536). Nos moldes, o Cronograma perde uns pixels da
  borda esquerda das planilhas.

As grades de Portais e Links listam em **ordem alfabética do título**, não por
grupo (pedido do usuário em 20/09). O rótulo do grupo continua em cada cartão e
no filtro.

Padrão único de **todas** as telas de lista: Portais e Links → Contabilidade,
Sistemas e automações → Contabilidade e → Equatorial, e **Documentos &
Normas** (que era tabela até 20/09/2026). Não sobrou tabela no portal fora dos
painéis de Gestão.

**O cartão é uma faixa horizontal**, não um bloco alto: a imagem ocupa uma
coluna fixa à esquerda, em 16:9 centralizado, e as informações ficam no
restante.
Dois por faixa em telas largas, um abaixo de 1100 px — e **continua faixa no
celular**, com a coluna da imagem encolhendo em vez de a arte subir para cima
do texto.

| | Medida |
|---|---|
| Cartão | 650 × **145** px em 1440 (140 em 1024); raio `--raio-xl` (16), borda 1 px `--borda` |
| Sombra | `--sombra-sutil` — duas camadas rasas, receita medida em microsoft.com/pt-br |
| Coluna da imagem | `clamp(150px, 32%, 220px)`, **`aspect-ratio: 16/9` centralizada**, raio `--raio-md`, 8 px de respiro |
| Ajuste da arte | `object-fit:cover` — a arte tem fundo da própria marca e área segura nas bordas, então preenche o quadro sem tarja |
| Conteúdo | rótulo (`.meta-label`), título `--fs-md`/600 em até 2 linhas, descrição `--fs-sm` em até 2 linhas |
| Ações | faixa no rodapé (54 px): status à esquerda, "i" (32 px) e Acessar/Baixar à direita |

Regras da grade:

- **O clique em qualquer parte do cartão leva ao destino.** A ação principal
  — **Acessar** (link externo) ou **Baixar** (arquivo) — estica um `::after`
  sobre o cartão inteiro:

  ```css
  .pcard { position:relative }
  .pcard-principal { position:static }          /* senão o ::after cai dentro do botão */
  .pcard-principal::after { content:""; position:absolute; inset:0; z-index:1 }
  .pcard-info, .pcard-trocar,
  .pcard-acessar:not(.pcard-principal) { position:relative; z-index:2 }
  ```

  Não dá para embrulhar o cartão num `<a>`: dentro dele já há um link e um
  botão, e link dentro de link é HTML inválido — quebra teclado e leitor de
  tela. Com o `::after`, a tabulação continua com duas paradas por cartão e o
  nome acessível sai do link real. O `:focus-within` marca o cartão todo.
  A ficha continua saindo pelo **"i"**, que fica por cima do esticado.
- Quando não há endereço, o lugar da ação diz "Acesso em configuração" e **o
  cartão não clica** — não há para onde ir. Hoje é o caso das 12 automações.
- **O texto continua selecionável.** O corpo do cartão sobe para cima do
  esticado (`z-index:2`), senão o mouse nunca chega ao texto. Em troca, o
  clique no corpo é tratado em `ligarCliqueDoCorpo()` (`js/app.js`), que só
  navega quando `getSelection()` está vazia — quem arrasta para selecionar não
  é levado embora.
- **Altura (20/09, segunda medição).** O cartão tinha 199 px em 1440 e 210 em
  1024, com 36 px de folga vazia no corpo. Ficou em **156 px** (173 a 177 com
  título de duas linhas): `min-height` 176→156, faixa de ações 60→56 px
  (botões 36→32, ainda acima dos 24 da WCAG 2.5.8), rótulo do cartão em
  `--fs-xs` e recuos internos um ponto menores.
- **A moldura da imagem é 16:9 fixo, e a arte também.** Em altura cheia a
  moldura variava com o cartão — de 1,25 no celular a 1,73 no desktop, 38% de
  variação — e contra um quadro fixo uma das pontas sempre cortava. Com
  `aspect-ratio: 16/9` aqui e 512×288 na arte, **não corta em largura
  nenhuma** e a marca usa o quadro inteiro. Foi o que resolveu as assinaturas
  largas (ServiceNow, Microsoft, CPC) parecerem pequenas — o problema era o
  corte, não o tamanho do desenho.
- **Quem manda na altura do cartão é o conteúdo, não a arte.** `.pcard-img`
  está em `position:absolute`: com `height:100%` num pai de altura indefinida,
  o `<img>` assume a altura intrínseca da arte e passa a **ditar** o tamanho do
  cartão — era por isso que o cartão media 199 px com a arte em 1,10 e 178 px
  com ela em 1,25. Fora do fluxo, a arte não interfere.
- **Sem arte, o cartão mostra o ícone da categoria** no mesmo espaço — a
  altura não muda e a grade continua alinhada.
- Título e descrição são cortados em 2 linhas (`-webkit-line-clamp`) e a faixa
  de ações **não quebra** (`flex-wrap:nowrap`), com o texto da esquerda
  truncando por reticências. Sem isso um título ou uma fonte longa esticava uma
  faixa só e desalinhava a linha inteira da grade.
- O que vai em cada parte por tela: em sistemas e atalhos, o rótulo é a equipe
  responsável e a esquerda das ações é o status; em automações, o rótulo é a
  tecnologia e a esquerda é o status de desenvolvimento; em documentos, o
  rótulo é o grupo, a esquerda é a fonte e a data de conferência do link fica
  na ficha do "i".
- **Quem tem o perfil de administração troca a arte pelo próprio cartão**
  (botão sobre a imagem). Grava pelo backend opcional; sem ele, só
  automações guardam a escolha neste navegador. Os atalhos de
  `config.json › links` são somente leitura na API — a arte deles entra
  editando o JSON.
- Uploads vão para `assets/<coleção>/` (`sistemas`, `automacoes`, `users`),
  numa lista fechada de pastas no servidor.

---

## 7. Arte dos cartões

Cada item das grades tem arte própria em **SVG**, em `assets/atalhos/` (5),
`assets/automacoes/` (12) e `assets/documentos/` (9); `assets/sistemas/` guarda
as 6 ilustrações que já existiam.

A arte mostra **a marca da fonte do item** e preenche o quadro inteiro:

1. Fundo 500 × 400 — a proporção do espaço da imagem no cartão — **no fundo da
   própria marca** (branco, que é como todas foram desenhadas), com um véu da
   cor de acento entre 7% e 16% para a arte não ficar chapada.
2. **Marca d'água do assunto** — desenho de linha do que o item faz (pedido de
   compra, calendário com cadeado, torre de transmissão…), na cor de acento a
   13%, no canto. É o que diferencia os cartões que repetem a mesma marca.
3. **A marca oficial** centralizada, grande, inteira e sem recolorir.

Marca por item: CFC, CPC e IFRS nos documentos de normas; ANEEL no manual do
setor elétrico; Receita Federal nos dois SPED; gov.br nas duas leis; Grupo
Equatorial na Central de Resultados, no Cronograma e na Auditoria; SAP nos
atalhos SAP e nas 5 automações de SAP; SharePoint no atalho; EY no envio de
evidências; Python nos 6 scripts.

O painel da imagem é branco com um fio de 1 px: a arte preenche no desktop
(1,25 contra 1,26 do quadro) e, no celular, onde a coluna fica mais alta, a
sobra se confunde com o fundo branco da própria arte.

As marcas ficam em `assets/marcas/`, com a origem de cada uma em
`assets/marcas/FONTES.md`. **Uso referencial**: o cartão leva ao site da
própria instituição. Se a Comunicação pedir a retirada de alguma, troca-se a
imagem pelo editor do próprio cartão.

Gerador único: `.claude/tools/arte-marcas.py`. Ele embute a marca em base64
(a arte é um arquivo só), normaliza PNG de paleta para RGBA — sem isso o gov.br
não desenhava dentro do `<image>` —, limita a marca a 520 px de largura e avisa
quando uma marca clara cai num fundo claro. Peso: ~10 KB por arte, 602 KB nas 61.

O quadro é 440×400 (proporção 1,1, perto da coluna da imagem no cartão) e a
imagem usa `object-fit: cover`, então a arte tem **área segura**: nada essencial
fora de 60 px nas laterais e 44 px em cima e embaixo.

> O passo a passo para criar a arte de um **item novo** está em
> `.claude/redesign/04-arte-dos-cartoes.md`. O que vem abaixo é só o sistema.

Dois modos de composição. No modo **`tela`**, a arte reproduz a tela de entrada
do destino — o fundo dela (foto recortada ou degradê reconstruído a partir do
CSS medido), a logo na posição dela e o título na tipografia dela, alinhados à
esquerda. No modo **`marca`**, a marca fica centralizada sobre o fundo da
própria marca, com um rótulo abaixo quando ela se repete.

Duas armadilhas que custaram tempo: um SVG **sem `viewBox`** é esticado pelo
`<image>` até preencher a caixa (foi o que deformou a EY) — o gerador deduz o
`viewBox` de `width`/`height`; e algumas marcas vêm no arquivo em versão
**escura** porque o próprio site as inverte por CSS (ProjectHub, Cronograma),
então o gerador inverte também.

---

## 8. Faixa de busca e filtros (`.filter-bar`)

Uma só faixa, igual em **todas as telas de conteúdo**. A capa não tem — lá a
busca é a do cabeçalho. Sempre na mesma ordem:

**busca → filtros → "Limpar filtros"** (encostado à direita no desktop, à
esquerda quando os campos empilham no celular).

| Tela | Busca por | Filtros |
|---|---|---|
| Comunicação (Todos e cada origem) | título, subtítulo, texto, categoria, fonte, empresas, área | Categoria (quando a aba tem mais de uma) |
| Portais e Links → Contabilidade | nome, descrição, equipe | Equipe responsável |
| Sistemas e automações → Contabilidade | título, descrição, tecnologia, transação | Tecnologia, Status |
| Sistemas e automações → Equatorial | nome e descrição do atalho | — |
| Documentos & Normas | título, descrição, grupo, fonte | Origem (só na aba "Todos") |

Regras:

- Monte a faixa com `barraFiltro({busca,filtros})` e ligue com
  `ligarBarraFiltro({busca,filtros,aoMudar})` — **não escreva a marcação à
  mão**, senão a ordem e os tamanhos voltam a divergir de tela para tela.
- `ligarBarraFiltro` já chama `aoMudar()` uma vez ao ligar, então a tela nasce
  filtrada e contada sem uma segunda chamada.
- Toda tela com faixa mostra **a contagem do resultado** no rodapé
  (`role="status"`), no formato "12 automações".
- **Filtro não repete aba.** Em Documentos o grupo é a aba da faixa de
  subpáginas, então não há `<select>` de grupo na faixa de filtros (saiu em
  21/09, a pedido do usuário). `navigate()` grava o grupo da aba em `docGrupo`
  antes de desenhar a tela, e "Limpar filtros" limpa a busca e a origem sem
  sair da aba. Vale para qualquer tela nova: se a faixa de subpáginas já
  recorta por um campo, esse campo não vira filtro.
- Os filtros são montados sobre a lista **da aba aberta**: um filtro que, ali,
  teria uma opção só não aparece (é o caso da Origem nas abas de grupo de
  Documentos, todas de uma origem só).
- O filtro **Origem** vem de `filtroOrigem(id,lista)`: entra **antes** dos
  outros filtros (é o recorte mais largo) e só aparece quando a lista tem mais
  de uma origem. Hoje só Documentos → Todos o usa: em Comunicação a origem é a
  aba. As opções saem de `opcoesOrigem()` (`js/ui.js`), só com as
  origens presentes e sempre na ordem Contabilidade, Equatorial, Externo.

---

## 9. Origem do conteúdo e o selo (`.selo-origem`, 21/09/2026)

Todo conteúdo publicado tem o campo `origem`, com um de três valores:

| Valor | Rótulo | Quando | Cor (token) |
|---|---|---|---|
| `contabilidade` | Contabilidade | escrito, criado ou gerido pela Gerência de Contabilidade | verde-água `#0D6B64` (`--origem-contabilidade`) |
| `equatorial` | Equatorial | do Grupo, para a empresa toda, não só a Contabilidade | azul do Grupo `#004AAD` (`--origem-equatorial`) |
| `externo` | Externo | de fora do Grupo: órgão, norma, fornecedor, serviço de terceiro | roxo `#6A4BC9` (`--origem-externo`) |

Paleta escolhida pelo usuário em 21/09/2026. A cor sobre branco e o texto
branco sobre a cor passam em AA nas três (6,4, 8,1 e 6,1:1). Cada origem tem
também um fundo claro (`--origem-*-fundo`) para o quadro de quem não tem
imagem. As classes `.contabilidade`, `.equatorial` e `.externo` (ou o atributo
`data-origem`) definem `--cor-origem` e `--cor-origem-fundo`, herdadas por tudo
o que fica dentro.

**O critério é quem escreveu o conteúdo, não o tema** (decisão do usuário em
21/09/2026). A análise da equipe sobre a IFRS 18 é Contabilidade; a notícia
reproduzida da ANEEL é Externo; a deliberação do Grupo é Equatorial. O tema
continua em `categoria`/`grupo`. **Exceção pedida pelo usuário (21/09/2026):**
comunicado da Diretoria de Controladoria sobre a estrutura da própria área —
a Movimentação de 14/05/2026, enviada pela Comunicação do Grupo — é
Contabilidade; a `fonte` continua dizendo quem enviou.

- **Onde o selo aparece:** onde a tela **mistura** origens: faixas da
  Comunicação (aba "Todos" e também nas de origem, como etiqueta do tipo) e
  página de cada comunicado, cartões de Documentos & Normas (antes do grupo) e
  resultados da busca global. Nas páginas de Portais e Links e Sistemas e
  automações o selo **não** entra: a faixa de subpáginas já diz de onde é.
- **Toda ficha** (o "i" e a página do comunicado) traz a linha "Origem".
- **Desenho: cheio**, fundo na cor da origem e texto branco (pedido do usuário
  em 21/09/2026: distinguir de relance). Substituiu a primeira versão,
  contornada. Para a cor ficar só com a origem, a **categoria perdeu a cor**:
  nos comunicados ela é texto cinza ao lado do selo, e não mais `.tag` colorida.
- **Altura:** `line-height:1.3` faz o selo caber na linha de 18 px do rótulo do
  cartão; o `.pcard` não cresce. O rótulo com selo usa
  `.meta-label.rotulo-com-selo` (duas classes, para vencer o `display:block` do
  `.meta-label`, que vem depois no arquivo).
- **No código:** `ORIGENS`, `seloOrigem()` e `opcoesOrigem()` ficam em
  `js/ui.js`. Em `js/app.js`, `origemDe(colecao,item)` lê o campo e, quando ele
  falta, usa o padrão da coleção (`ORIGEM_PADRAO`: sistemas, automações e dados
  de gestão = Contabilidade; portais e atalhos = Equatorial; externos =
  Externo). Newsletter, notícias, documentos, avisos e destaques não têm padrão
  e precisam do campo.

---

## 10. Comunicação e a capa (21/09/2026)

**Comunicação é uma lista só.** A Newsletter Contábil e Notícias & Impactos
deixaram de ser páginas separadas: `comunicados(data)` (`js/newsletter.js`)
junta as duas coleções publicadas, do mais recente ao mais antigo. O mesmo
comunicado cadastrado nas duas (mesmo título) aparece uma vez só, a cópia da
Newsletter; a outra continua no arquivo e no Painel Editorial. Os dados seguem
em dois arquivos porque o fluxo editorial grava neles.

- **Abas:** Todos, Contabilidade, Equatorial e Externo (`#central/comunicacao`,
  `#central/comunicacao-<origem>`). Os endereços antigos
  (`#central/newsletter`, `#central/noticias`) levam a "Todos".
- **Faixa (`.comunicado-faixa`):** uma por linha. Imagem à esquerda
  (`clamp(180px,30%,340px)`, acompanha a altura do texto e tem no mínimo
  160 px); à direita, selo + categoria + data, título (2 linhas), subtítulo
  (2) e o texto até onde couber (3), com "Ler comunicado completo". A faixa
  inteira leva à página: o link do título estica um `::after`, como no
  `.pcard`. No celular a imagem estreita e o texto longo sai.
- **Sem imagem** (a maioria hoje): quadro no fundo claro da origem com o ícone
  de comunicação na cor dela (`.midia-comunicado.sem-imagem`). Imagem que falha
  ao carregar vira o mesmo quadro (`ligarMidias()`).
- **Página própria** (`#central/comunicado/<coleção>/<id>`): "Voltar para a
  lista", selo + categoria + data, título e subtítulo no topo (até 980 px).
  Abaixo, **duas colunas acima de 1100 px** (ajuste de 21/09 — a primeira
  versão tinha 800 px e deixava meia tela vazia): à esquerda o texto (72ch),
  indicadores, ações (fonte, documento, sistema citado) e a "Ficha do
  comunicado"; à direita a peça inteira, presa no alto da tela (`sticky`) e
  limitada à altura da janela, para um cartaz vertical não virar uma coluna de
  1.300 px. Abaixo de 1100 px, uma coluna, com a imagem logo depois do título
  (até 70% da altura da tela). A faixa de abas continua visível, com a
  aba da origem marcada; o título do comunicado vai para a aba do navegador.
  Rascunho ou endereço inexistente mostra aviso com link para a lista.
- A busca global, o carrossel e as colunas da capa abrem essa página.

**Capa: três colunas, uma por origem** (`colunasOrigem()`), no formato da
referência que o usuário enviou (capa da CNN Brasil):

- título da coluna na cor da origem, com um quadradinho de 7 px depois;
- **destaque** 16:10 com o título em branco sobre a imagem, sobre um véu
  (`--veu-imagem`) na base; sem imagem, o destaque é a própria cor da origem.
  O destaque tem a cor da origem por baixo, para o título ficar legível
  enquanto a foto carrega (e o `contraste.js` medir o fundo certo);
- **sempre os 4 mais recentes da origem** (pedido do usuário em 21/09: antes
  eram o destaque + outros 4, e o conjunto mudava conforme quem tinha imagem).
  O destaque é o mais recente dos 4 que tiver imagem; os demais ficam na
  lista, com **miniatura** 8:7 (128 px; 96 px entre 860 e 1100 px) e a marca
  da origem num retângulo de 24×7 px no canto;
- "Veja mais em <origem>", sem seta (seta decorativa está no inventário);
- abaixo de 860 px as colunas empilham.

**Página do comunicado = matéria de jornal (21/09/2026, 3ª versão, pedido do
usuário).** O texto ocupa a largura toda, **justificado** e com hifenização
(`hyphens:auto`, o `<html lang="pt-BR">` dá o idioma); as imagens **flutuam**
(`float`) e o texto as contorna: a capa à direita (até 49%, encolhe com cartaz
vertical, altura até a da tela); as figuras do texto alternam esquerda/direita,
com 49% e `clear:both`. Os 49% são de propósito: com 46%, uma imagem à direita
e a seguinte à esquerda deixavam uma fresta de ~70 px e a linha que cruzava a
passagem ficava com uma palavra só; com 49% + 32 px de margem as duas não cabem
lado a lado e essa linha desce inteira. Acima de 1300 px o corpo sobe para
`--fs-lg` (a linha ao lado da imagem passa de 800 px). Até 760 px nada
flutua. Abaixo da matéria (`.comunicado-rodape`, `clear:both`): as ações e, lado
a lado, a ficha e **"Mais comunicados"** (4, primeiro da mesma origem, com a
mesma linha da capa: miniatura, título e subtítulo). As versões anteriores —
coluna de 800 px, e texto e imagens em colunas separadas — deixavam tela vazia.

No `conteudoCompleto`, `## Título` vira `.comunicado-intertitulo` (`--fs-lg`,
peso forte) e `[figura N]` põe `.comunicado-figura-texto` — imagem com borda e
`--raio-md`, que abre inteira em outra aba ao clicar, e legenda em `--fs-sm`.
A imagem do topo (`.comunicado-figura`) também abre inteira ao clicar: a peça
original costuma ter letra miúda (a do IFRS 16 tem uma tabela).

**Comunicado tirado de e-mail (21/09/2026, noite — "preservar sempre a fonte
original").** O texto é a **transcrição** do e-mail, com os erros de digitação
do original; saem só as saudações ("Prezados(as), boa tarde!"). A peça e as
fotos são as do próprio e-mail, e a ficha diz de onde veio (`fonte`: remetente,
data, assunto e quem assina). Duas marcas a mais no texto:

- `**trecho**` é o **negrito** do original (`<strong>`, peso forte). O texto é
  escapado antes da troca, então nunca vira HTML; na faixa e na busca as marcas
  somem.
- Figura com `"tipo":"retrato"` é a **foto de uma pessoa**: em vez da figura de
  49%, vira `.comunicado-perfil` — a foto à esquerda
  (`clamp(96px,24%,168px)`) e o parágrafo seguinte contornando, dentro de um
  bloco `flow-root`. Cada perfil começa com a sua foto e o próximo parágrafo
  não sobe para o lado dela, como no e-mail de movimentação do Grupo. A foto
  não abre em outra aba (não há o que ampliar).
- `imagemFoco` (`"esquerda"` | `"direita"`) diz que lado da imagem os
  recortes guardam — miniatura 8:7 da capa, faixa estreita do celular — em vez
  do centro (`object-position` e a origem do zoom do hover no mesmo lado).
  Criado para a capa da Movimentação (pedido do usuário, 21/09): a Alexandra
  Furtado, Gerente de Contabilidade, num quadro grande à esquerda e os quatro
  executivos da Contabilidade em quadros 2×2 ao lado, sobre o degradê do
  banner "Carreira Equatorial" do e-mail (960×540, sem texto na imagem; quem é
  quem fica no `alt`). Com o recorte pelo centro, a Alexandra sumia no
  celular.
- `imagemMiniatura`: versão 8:7 (a proporção de `.coluna-miniatura`) usada só
  pela miniatura da capa e de "Mais comunicados" (`midia(...,{miniatura:true})`);
  com ela, o `imagemFoco` não se aplica, porque nada é recortado. Na
  Movimentação (pedido do usuário, 21/09): a mesma composição, com as fotos
  perdendo as laterais — Alexandra estreita (0,5) e os quatro quadros em
  retrato — para as cinco pessoas caberem inteiras no quadro de 128×112.
- **Links das imagens (regra do usuário, 22/09/2026, vale daqui em diante):**
  todo link que a imagem do e-mail traz — a imagem inteira envolvida por um
  `<a>`, um "clique aqui", um botão, um QR Code, um endereço de e-mail escrito
  na peça — entra em `links` (`{rotulo, url, area, figura}`) e fica
  **embutido na imagem** e **disponível na Comunicação**:
  - `area` = `[x, y, largura, altura]` em fração da imagem; o trecho vira um
    `<a class="comunicado-area">` por cima da peça (`.comunicado-imagem-mapa`).
    Passar o mouse na peça contorna os trechos em azul a 55%; sobre um deles,
    véu `--azul` a 14% e contorno de 2 px. `[0,0,1,1]` = a imagem inteira: o
    clique leva ao destino e a lupa do canto (`.comunicado-ampliar`, 34 px)
    abre a peça ampliada.
  - Sem `figura`, vale para a imagem do topo; `figura: N` põe o trecho na N-ª
    de `figuras`.
  - Todo link também vira **botão nas ações da página** (e-mail com o ícone
    `mail`), sem repetir a fonte nem o acesso ao sistema.
  - Aceita `https://`, `http://` e `mailto:`. **Link de rastreador do e-mail
    nunca entra** nem é aberto: o destino sai do QR Code (OpenCV), do texto da
    peça ou de um link direto. `.claude/tools/msgread.py` lista as imagens com
    link de cada e-mail e marca as de rastreador; o que está só desenhado na
    peça (e-mail, QR Code, "clique aqui") se acha lendo a imagem.

**Realce dos comunicados e das abas (21/09/2026, noite, pedido do usuário).**
Um vocabulário só para "este item está sob o mouse ou o foco", com os tokens
de movimento `--ease-saida` (ease-out-quart), `--dur-estado` (0,2 s) e
`--dur-imagem` (0,6 s):

- **Faixa da lista**: a borda toma a cor da origem (`color-mix` 45% com
  `--borda`), a sombra sobe para `--sombra-media`, a imagem aproxima para 1,04
  em 0,6 s, o título ganha sublinhado (que já existe transparente e só ganha
  cor, então aparece suave) e um fio corre sob "Ler comunicado completo". Ao
  clicar, a sombra volta ao repouso. O **anel de foco** contorna a faixa
  inteira (`:has(.comunicado-faixa-link:focus-visible)`), não só o título.
- **Colunas da capa e "Mais comunicados"**: a mesma aproximação da imagem e o
  mesmo sublinhado.
- **Abas**: a `.pg-line` virou um realce que desliza — fio de 3 px no alto e,
  abaixo, um véu da mesma cor a 9% que some para baixo. Nas abas de origem da
  Comunicação (`data-origem`, posto pelo `renderSubnav()`), texto, fio e véu
  tomam a cor da origem e trocam de cor enquanto deslizam; nas demais seções,
  `--azul-marca`. O `--azul-ativo` saiu das abas: sobre o véu ficava em
  4,1:1. Medido sobre o véu: marca 6,2, Contabilidade 4,95, Externo 4,7.
- **Nome da seção na faixa de abas**: recuo de `--respiro-painel` + 1 px (18 px,
  14 px até 720 px), o mesmo respiro do painel abaixo — nome, busca e lista
  começam na mesma coluna em qualquer largura.
- "Reduzir movimento" (sistema ou preferência do portal) tira a aproximação da
  imagem; borda, sombra e sublinhado continuam marcando o realce.

---

## 12. Ajustes de 21/09/2026 (tarde)

- **Lápis do administrador** (`.pcard-trocar`): botão redondo de 28 px no
  canto de cima da imagem, fundo branco, borda `--borda`, ícone `pencil`
  (novo em `ui.js`, junto do `video`). Substitui a faixa "Trocar imagem"
  que cobria a base da arte.
- **Abas "Todos"** (`telaTodos()`): a grade de sempre, com o selo da origem em
  cada cartão (a tela mistura origens) e o filtro Origem — a mesma regra de
  Documentos → Todos. Filtro de grupo some quando a aba tem um grupo só.
- **Compromisso em Avisos** (`.aviso-agenda`): no lugar da tarja, a folhinha
  `.aviso-data` (44 px, borda `--borda-media`, topo de 3 px em `--azul`, dia
  em `--fs-lg`); à direita, `.aviso-entrar` (botão azul com ícone `video`)
  quando há link. Em até 480 px o botão desce para baixo do texto.

---

## 12b. Busca do cabeçalho (22/09/2026)

Pedido do usuário: ao digitar, a lista de sugestões aparece **abaixo do
campo** (antes os resultados iam para baixo do carrossel, fora da tela).

- **Caixa de sugestões** (`.ph-sugestoes`, dentro do `.ph-search`, que ganhou
  `position:relative`): a linguagem do menu do usuário (`.ph-drop`) — painel
  branco, fio `--ph-laranja` de 3 px no alto, `--sombra-alta`, até
  `min(70vh,560px)` com rolagem própria. Grupos com o nome da seção do menu em
  `--fs-sm`/peso médio, sem caixa alta; separador `--borda` entre grupos.
  Opção (`.ph-sugestao`, 44 px de altura mínima): ícone, título (`--fs-md`,
  peso médio, uma linha com reticências) e detalhe (`--fs-sm`,
  `--texto-apoio`); ícone de link externo quando abre outra aba. Opção ativa:
  fundo `--azul-suave`, título e ícone `--azul-marca`. O trecho que bate vem
  em `<mark>` com fundo `--ambar-fundo`. Por último, "Ver todos os N
  resultados" em `--azul`.
- **Comportamento** (`js/busca.js`, padrão combobox da WAI-ARIA): abre a
  partir de 2 letras; até 8 sugestões, 3 por grupo; o grupo do melhor
  resultado vem primeiro. O foco não sai do campo (o `mousedown` na caixa é
  cancelado); fecha com Esc, Tab, clique fora ou ao sair do formulário.
- **Página de resultados** (`#busca/<termo>`): a faixa de busca e filtros de
  sempre ("Onde" e "Origem"), grupos com `h2` em `--fs-lg` e a contagem em
  peso médio, e cada resultado uma linha inteira clicável (`.busca-item`):
  ícone, selo da origem + detalhe, título, subtítulo em 2 linhas. Hover:
  fundo `--superficie-sutil` e título sublinhado em `--azul-marca`.
- A antiga seção "Resultados da busca" (`#search-section`, abaixo do
  carrossel, cartões com "Ver detalhes") saiu, com o CSS dela.

---

## 13. Como conferir depois de mexer

O script de auditoria de contraste usado aqui está em
`.claude/tools/contraste.js`: cole no console do preview (ou rode via
`javascript_tool`) e ele devolve `OK` ou a lista de elementos abaixo do
mínimo. Rode em cada tela, nos dois perfis, depois de mudar cor.

Aviso sobre o preview: o painel do navegador às vezes devolve uma captura
**incompleta** (faixa de menu ou listas em branco) quando a janela do app está
atrás de outra. Antes de sair caçando um bug que não existe, meça o elemento
com `getBoundingClientRect()` — se a altura estiver certa, era só a captura.
