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
| `--fs-xs` | 12 | etiquetas, rótulos, legendas, filtros, `th` e `td` das tabelas antigas |
| `--fs-sm` | 13 | texto de apoio, células de tabela, descrições |
| `--fs-base` | 14 | **corpo**; títulos de cartão (em negrito) |
| `--fs-md` | 16 | títulos de bloco, busca do cabeçalho |
| `--fs-lg` | 18 | "Portal da Gerência de", títulos de seção |
| `--fs-xl` | 22 | `h2`, título do diálogo |
| `--fs-2xl` | 30 | "Contabilidade" no cabeçalho, número de indicador |

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

Padrão único de **todas** as telas de lista: Portais e Links → Contabilidade,
Sistemas e automações → Contabilidade e → Equatorial, e **Documentos &
Normas** (que era tabela até 20/09/2026). Não sobrou tabela no portal fora dos
painéis de Gestão.

**O cartão é uma faixa horizontal**, não um bloco alto: a imagem ocupa uma
coluna fixa à esquerda, em altura cheia, e as informações ficam no restante.
Dois por faixa em telas largas, um abaixo de 1100 px — e **continua faixa no
celular**, com a coluna da imagem encolhendo para 104 px em vez de a arte subir
para cima do texto.

| | Medida |
|---|---|
| Cartão | 650 × 176 px em 1440; raio `--raio-xl` (16), borda 1 px `--borda` |
| Sombra | `--sombra-sutil` — duas camadas rasas, receita medida em microsoft.com/pt-br |
| Coluna da imagem | `clamp(150px, 32%, 220px)`, altura cheia, raio `--raio-md`, 8 px de respiro |
| Ajuste da arte | `object-fit:contain` — as ilustrações são 16:9 num espaço quase quadrado; cortar deixava metade de fora |
| Conteúdo | rótulo (`.meta-label`), título `--fs-md`/600 em até 2 linhas, descrição `--fs-sm` em até 2 linhas |
| Ações | faixa no rodapé: status à esquerda, "i" e Acessar/Baixar à direita |

Regras da grade:

- **O clique no cartão não abre nada.** A ficha sai pelo botão **"i"**; o
  destino, pelo botão **Acessar** (link externo) ou **Baixar** (arquivo).
  Quando não há endereço, o lugar da ação diz "Acesso em configuração".
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
| Newsletter Contábil | título, resumo, categoria, fonte | Categoria |
| Notícias & Impactos | idem + empresas e área responsável | Categoria |
| Portais e Links → Contabilidade | nome, descrição, equipe | Equipe responsável |
| Sistemas e automações → Contabilidade | título, descrição, tecnologia, transação | Tecnologia, Status |
| Sistemas e automações → Equatorial | nome e descrição do atalho | — |
| Documentos & Normas | título, descrição, grupo, fonte | Grupo |

Regras:

- Monte a faixa com `barraFiltro({busca,filtros})` e ligue com
  `ligarBarraFiltro({busca,filtros,aoMudar})` — **não escreva a marcação à
  mão**, senão a ordem e os tamanhos voltam a divergir de tela para tela.
- `ligarBarraFiltro` já chama `aoMudar()` uma vez ao ligar, então a tela nasce
  filtrada e contada sem uma segunda chamada.
- Toda tela com faixa mostra **a contagem do resultado** no rodapé
  (`role="status"`), no formato "12 automações".
- Em Documentos o grupo também é aba da faixa de subpáginas: ali "Limpar
  filtros" usa `aoLimpar` para voltar à aba "Todos", senão a aba marcada
  mentiria sobre o que está na tela.
- Os chips de categoria de Notícias viraram um `<select>` na faixa — eram o
  único controle desse tipo no portal.

---

## 9. Como conferir depois de mexer

O script de auditoria de contraste usado aqui está em
`.claude/tools/contraste.js`: cole no console do preview (ou rode via
`javascript_tool`) e ele devolve `OK` ou a lista de elementos abaixo do
mínimo. Rode em cada tela, nos dois perfis, depois de mudar cor.

Aviso sobre o preview: o painel do navegador às vezes devolve uma captura
**incompleta** (faixa de menu ou listas em branco) quando a janela do app está
atrás de outra. Antes de sair caçando um bug que não existe, meça o elemento
com `getBoundingClientRect()` — se a altura estiver certa, era só a captura.
