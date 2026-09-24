---
name: portal-corporativo
description: >-
  Direção de design e regras de trabalho para repaginar o Portal da Gerência de
  Contabilidade como um PORTAL CORPORATIVO de verdade — navegação em primeiro
  lugar, visual institucional sóbrio e zero construção de frontend genérica
  "de IA" (grades, menus, hero, adornos). Use SEMPRE antes de
  alterar index.html, css/styles.css, js/*.js (renderização) ou data/*.json que
  apareça na tela; quando o usuário pedir para repaginar, redesenhar, dar cara de
  portal, deixar mais corporativo, melhorar a navegação/menu, ou remover
  elementos de IA / aparência genérica de IA. Define o que remover, o que
  preservar, as restrições da stack (HTML/CSS/JS puro, sem build, sem CDN) e
  como verificar no preview. Orquestra as demais skills do projeto.
---

# Portal corporativo — direção do redesign

> **Retomando a conversa?** Leia antes
> `.claude/redesign/00-estado-e-proximos-passos.md`: intenção do projeto,
> fatias já concluídas, decisões travadas, próximos passos e as convenções de
> trabalho (preview, perfis de teste, cache-buster, quebras de linha).

O objetivo do redesign é que o Portal Contabilidade pareça **uma intranet
corporativa madura**, e não uma landing page ou um dashboard gerado por IA.
Quem abre o portal quer **chegar a um lugar**: um sistema, um documento, um
processo, uma pessoa. A tela serve para isso.

## Norte (em ordem de prioridade)

1. **Navegação é o produto.** Menu com a estrutura do site à vista, busca
   proeminente, trilha de navegação (breadcrumb) real, títulos de página
   claros, links com destino previsível. Nenhum conteúdo importante fica
   escondido atrás de um carrossel, uma aba decorativa ou um "saiba mais" vago.
2. **Visual institucional.** Sóbrio, denso na medida certa, alinhado a uma
   grade. Paleta derivada da marca, neutros frios, uma cor de destaque para
   ação e as cores semânticas só para status. Tipografia do sistema
   (`Segoe UI`/Arial) com escala curta. Hierarquia por **peso**, não por
   troca de fonte (decisão de 19/09/2026: a Bahnschrift foi testada e
   recusada) — ex.: título do cabeçalho "Portal da Gerência de" em 300 e
   "Contabilidade" em 700.
   **Fonte da marca:** `projeto/brand/` — leia `guia-de-estilos.md` (paleta
   medida, tipografia dos boletins, estilo por tipo de informação, cabeçalhos
   por canal, infográfico editorial), `tokens-marca.css` (proposta de tokens)
   e `repertorio/README.md` antes de decidir cor, tipo ou imagem. Logos em
   `projeto/brand/logos/`.
3. **Zero construção de frontend "de IA".** O que o usuário chama de elemento
   de IA é a **montagem genérica da interface** — grades, estilo das grades,
   menus, hero, cartões, efeitos — e **não** imagens, ilustrações,
   personagens ou mesclas de cor. Ilustrações e cores de campanha são
   repertório bem-vindo para o **conteúdo** (ver `repertorio/README.md`).
4. **Nada quebra.** Acessibilidade atual (skip-link, roles de tabs, foco
   visível, `aria-*`), responsividade e os dados em `data/*.json` continuam
   funcionando.

## Inventário: construção "de IA" que existe hoje e deve sair

Confirme cada item no código antes de mexer — as linhas mudam.

**Estrutura e grades**
- **Hero de landing page** (`.hero` no `index.html`): slogan em caixa alta,
  título gigante em duas linhas, parágrafo institucional, CTA "↗" e três
  métricas soltas. Um portal abre com **acesso rápido e avisos**, não com um
  pitch. (A foto/ilustração em si não é o problema; o bloco de pitch é.)
- **Grade de cartões idênticos e altos** para tudo, cada tela com um formato
  diferente do da vizinha. *Resolvido em 20/09/2026:* existe **um** cartão, em
  faixa horizontal, usado por todas as telas de lista, sempre com a faixa de
  busca e filtros acima — ver `.claude/redesign/03-sistema-visual.md` § 6 e 7.
- **Métricas como vitrine** (`#hero-metrics`, KPIs grandes sem ação).
- **Tudo dentro de painéis flutuantes** (`.panel` com borda + sombra + raio
  14 px), inclusive o que deveria ser página.
- **Abas como navegação principal** (Central de conteúdo com 5 abas): seções
  do site escondidas atrás de tablist.

**Menus e navegação**
- **Sidebar de template SaaS**: perfil com avatar grande no topo, rótulos
  de grupo em caixa alta ("PORTAL", "ACESSOS RÁPIDOS"), rodapé "Ambiente
  local · v1.0" com ponto pulsando.
- **Breadcrumb decorativo** ("Workspace / Visão geral") que não navega.
- **Acessos rápidos como `<button>`** que abrem janela via JS.

**Adornos de interface**
- **Kickers/eyebrows em caixa alta** acima de cada título. Um título bom basta.
  *Resolvido em 20/09/2026:* a classe `.section-kicker` deixou de existir. A
  caixa alta sobrou só onde é convenção de etiqueta curta — as tarjas
  EXTRA/PRAZO/INFO dos avisos e a faixa de subpáginas do padrão CFC.
- **Pontos "ao vivo" pulsando** (`.live-dot`) sem nada ao vivo.
- **Setas decorativas ↗/→** em links e botões internos.
- **Animações sem função** na interface: faixa `radar` rolando 45 s em loop,
  `noticia-pulse`, `backdrop-filter: blur` (todos removidos em 20/09/2026),
  sombras longas (`0 24px 90px`),
  degradês como **fundo de componente** (banner de Equipes, cartões, botões).
  Exceção aprovada: o degradê + imagem da **faixa do cabeçalho**.
- **Microcopy de marketing** ("Conectando pessoas e conhecimento.",
  "INFORMAÇÃO QUE CONECTA…"). Troque por rótulos funcionais.
- **Escala tipográfica solta** e cores literais fora dos tokens. *Resolvido em
  20/09/2026:* ver `.claude/redesign/03-sistema-visual.md`. Agora **toda** cor,
  tamanho, peso, raio e sombra sai de um token do `:root`; nada de valor
  literal na regra.

**Não entra no inventário**
- Ilustrações dos sistemas, banner com imagem, peças de campanha, personagens,
  degradês **dentro de uma imagem** e cores de campanha no conteúdo. Avalie
  pela legibilidade e pela função, não por "parecer IA".
- Conteúdo que fala de IA (categoria `"IA"` em `data/config.json`, notícia
  `news1` em `data/noticias.json`) é decisão editorial: pergunte ao usuário
  antes de mexer. A duplicata `"IA"`, `"IA"` na lista de categorias é bug e
  pode ser corrigida.
- Cargo "Assistente" (`data/equipes.json`) e Automações VBA/RPA
  (`data/automacoes.json`) não têm relação com o tema.

Antes de remover conteúdo de `data/*.json`, liste os itens e confirme com o
usuário — é conteúdo da gerência, não só visual.

## Modelo adotado: cfc.org.br (topo + faixa de menu + carrossel)

Decisão do usuário em 19/09/2026. Especificação medida em
`projeto/brand/referencias/cfc/README.md` — leia antes de mexer no topo,
no menu ou na capa.

- **Cabeçalho = faixa de impacto e identidade** (~149 px, decisão de
  19/09/2026): fundo com a imagem `assets/images/banner/portal-gerencia-contabilidade.webp`
  ancorada à direita (`auto 420px`, sem `cover`, para cortar menos) e o
  degradê marinho de 100° do hero antigo; logo Grupo Equatorial branco +
  título em duas linhas (linha 1 menor, linha 2 maior): "Portal da Gerência de" (Segoe UI 300) /
  "Contabilidade" (700, maior); busca larga e sutil (translúcida), sem dica
  de atalho; identificação discreta "Bem-vindo, <nome>" com o
  cargo abaixo. **Sem** botões A+/A e **sem** sino.
- **Largura útil ampla**: container até ~1760 px, margem lateral 32 px.
- **Faixa de busca e filtros única (decisão de 20/09/2026):** toda tela de
  conteúdo tem a mesma faixa — busca, filtros e "Limpar filtros", nessa ordem
  — montada por `barraFiltro()`/`ligarBarraFiltro()` e com a contagem do
  resultado no rodapé. Só a capa fica sem (lá a busca é a do cabeçalho). Ver
  `.claude/redesign/03-sistema-visual.md` § 7.
- **Menu sem submenu suspenso (decisão de 20/09/2026):** clicar numa seção
  leva **direto** à primeira página dela; as demais aparecem na faixa de
  subpáginas, em abas — o caminho que Documentos & Normas já fazia. A faixa
  vale para qualquer seção (inclusive Gestão) e some quando a seção tem uma
  página só ou quando é uma janela com abas próprias (Administração).
- **Menu embutido na base da faixa do cabeçalho** (decisão de 19/09/2026,
  substitui a faixa branca separada): tarja escura translúcida
  `rgba(1,14,40,.55)` com fio superior branco 14%, ~52 px, **itens
  centralizados** com ícone + rótulo (Segoe UI 600, 15 px, branco 82%;
  hover branco com fundo 8%). Item ativo branco + **sublinhado laranja**
  `--acento-laranja` de 3 px. Cada seção é **um link** para a sua primeira
  página, com `aria-current` quando qualquer página dela está aberta. Ela
  **substitui a barra lateral**.
- **Carrossel de destaques**: troca a cada 7 s, transição de 0,6 s, **botão de
  pausa**, pausa no hover/foco, `alt` e título em texto, respeita
  `prefers-reduced-motion`. Usa as artes da Comunicação (repertório).
  **Decisão de 21/09/2026:** formato do **Conecta** (`/esc` do Portal de
  Serviços), medido lá — faixa **larga e baixa** (proporção 3,125), cantos de
  10 px, deslizamento lateral de 0,5 s, setas de 42 px a 15 px das bordas e
  bolinhas de 9 px no rodapé. **Atualizado em 21/09/2026 (noite):** a partir
  de 1200 px, Avisos e Acesso rápido ficam numa coluna **ao lado** do
  carrossel, que mede pela altura da janela (`clamp(300px, 46vh, 420px)`),
  para a Comunicação (três colunas, sem faixa de título) aparecer sem rolar
  em 1366, 1536 e 1920 px; abaixo de 1200 px, tudo empilha como antes.
  **Atualizado em 21/09/2026 (2ª versão):**
  o slide segue o **molde do usuário** (Figma 2000×519, `projeto/comunicados`)
  — fundo em imagem ou degradê, até duas imagens de um lado, e do outro selo da
  origem + área, título, subtítulo, descrição e ação, **tudo em HTML** (nunca
  texto pintado na imagem). **O slide inteiro é clicável.** Cada slide é um
  registro de `data/destaques.json` que **aponta para um destino** (comunicado,
  sistema, portal, link externo, atalho, página ou endereço livre) e herda dele
  o que deixar em branco; gestão pela Administração → Carrossel, pelo bloco na
  página do comunicado e pelo "Destacar no carrossel" das fichas (exige o
  servidor interno). No máximo **5 no ar**. Dois formatos: **imagem** (padrão —
  a imagem na altura toda, se desfazendo num fundo tirado dela, com as listras
  do molde) e **molde** (fundo e cena gerados dos SVGs por
  `.claude/tools/moldes-destaques.py`). Do lado do texto, só efeitos que
  escurecem; contraste medido sobre o fundo real, não pelo `contraste.js`
  (que não enxerga imagem). Ver
  `.claude/redesign/03-sistema-visual.md` ("Carrossel de destaques — molde do
  Figma e gestão").
- **Comunicação (decisão de 21/09/2026):** uma lista só de comunicados
  (Newsletter + Notícias), com abas Todos/Contabilidade/Equatorial/Externo,
  uma **faixa** por comunicado e **página própria** para cada um
  (`#central/comunicado/<coleção>/<id>`). A capa mostra a Comunicação em
  **três colunas, uma por origem**, no formato de portal de notícias. Cor por
  origem: Contabilidade verde-água, Equatorial azul do Grupo, Externo roxo;
  selo cheio; categoria sem cor. Ver `.claude/redesign/03-sistema-visual.md`
  § 10. **Comunicado tirado de e-mail** (21–22/09/2026): texto transcrito do
  original, peça e fotos do próprio e-mail, `fonte` com remetente, data,
  assunto e signatário, e **todo link das imagens embutido nelas e disponível
  como botão** (campo `links`, com a área de cada trecho). Link de rastreador
  nunca entra: o destino vem do QR Code, do texto da peça ou de link direto.
- **Celular**: botão "Menu" abre painel com as mesmas seções (não usar
  `<select>` como o CFC); carrossel com proporção mais alta.
- **Rodapé institucional** com **mapa do portal** (todas as seções/páginas),
  responsável pela área e data de atualização da base.
- **Sem quadro de título/trilha** nas páginas internas (recusado em 19/09): o
  menu e a faixa de subpáginas já dizem onde se está; o título fica só para
  leitores de tela.
- **Uma única grade** (`.pcard`) para todo conteúdo de lista de links e
  documentos, com a faixa de busca e filtros acima. A exceção é a Comunicação,
  que é uma lista de **faixas** de leitura (`.comunicado-faixa`), uma por
  linha. Tabela sobrou só nos painéis de Gestão.
- **Origem do conteúdo (decisão de 21/09/2026):** todo item publicado em
  `data/*.json` tem `origem` — `contabilidade` (criado e gerido pela Gerência),
  `equatorial` (do Grupo, para a empresa toda) ou `externo` (de fora do Grupo).
  **O critério é quem escreveu, não o tema** (exceção do usuário: comunicado
  da Diretoria de Controladoria sobre a própria área é Contabilidade). Item novo sem `origem` é
  cadastro incompleto. Na tela: abas por origem em Comunicação (pedido do
  usuário); filtro "Origem" em Documentos → Todos e na busca global; selo
  cheio `.selo-origem` onde a tela mistura origens; linha "Origem" em toda
  ficha. Ver `.claude/redesign/03-sistema-visual.md` § 9.
- **Decisão de 20/09/2026:** automações e Documentos & Normas chegaram a virar
  tabela e as duas **voltaram para a grade `.pcard`**, junto com sistemas e
  atalhos. Não há mais tabela de conteúdo no portal.
- **Decisão de 20/09/2026 (sistema visual):** escala de 7 tamanhos, hoje de
  **12 a 27 px** depois da redução de 10% pedida pelo usuário, **nada abaixo de
  12 px** (o piso não encolhe); 3 pesos, 5 raios e 3 sombras; fonte
  `"Segoe UI", Arial` (a `Inter` saiu da pilha); azul de ação `#0f6cb8` e
  demais cores ajustadas para AA em todo texto.
- **Decisão de 20/09/2026 (acabamento):** nenhum alvo clicável abaixo de
  24×24 px (WCAG 2.5.8). Seção restrita começa `hidden` no HTML e só aparece
  quando `applyAccess()` liberar — nunca deixe conteúdo gerencial piscar
  durante o carregamento.
- **Arte dos cartões (decisão de 20/09/2026, aprovada):** a imagem de cada
  cartão é a **identidade real do destino**, não uma ilustração do tema. Quando
  o link abre uma tela que dá para ver, a arte **reproduz essa tela** (fundo,
  logo e título dela, lidos em **1600 px** — muitos sistemas escondem o painel
  de identidade em janela estreita). Quando não dá, entra a **marca oficial do
  titular sobre o fundo da própria marca**, sem desenho decorativo, com
  **rótulo abaixo** quando a mesma marca serve a vários cartões. **Antes de
  criar a arte de um item novo, leia `.claude/redesign/04-arte-dos-cartoes.md`**
  — tem o passo a passo, os campos do gerador e as armadilhas.
- **Grade de cartões (`.pcard`), padrão único:** o cartão é uma **faixa
  horizontal** (~176 px de altura), com a imagem numa coluna fixa à esquerda em
  **proporção 16:9** e as informações no restante; **dois por faixa**, e
  continua faixa no celular. Altura hoje: 145 px em 1440. Clique em **qualquer parte do cartão** leva ao destino (decisão de
  20/09/2026, substitui a anterior): a ação principal estica um `::after` sobre
  o cartão, sem embrulhar tudo num `<a>` — link dentro de link é inválido e
  quebra teclado e leitor de tela. O "i" e o segundo botão ficam por cima e
  continuam clicáveis. Sem destino cadastrado, o cartão não clica. A ficha sai pelo "i".
  Sem arte, entra o ícone da categoria no mesmo espaço.
  Quem administra troca a arte pelo **lápis no canto de cima da imagem**
  (21/09/2026 — a faixa "Trocar imagem" cobria a arte). Portais e Links e
  Sistemas e automações abrem na aba **Todos** (tudo da seção, de A a Z, com
  selo e filtro de origem); Portais e Links tem também a aba **Power BI**.

## Restrições da stack (não negociáveis)

- **HTML5 + CSS3 + JavaScript Vanilla (ES modules).** Sem framework, sem npm,
  sem build, sem CDN, sem fonte web externa. Tudo roda offline via
  `python -m http.server`.
- CSS em um arquivo (`css/styles.css`), tokens em `:root`. Crie/ajuste tokens
  em vez de espalhar cores literais — o inventário dos tokens e as regras de
  contraste estão em `.claude/redesign/03-sistema-visual.md`. Depois de mexer
  em cor, rode `.claude/tools/contraste.js` no console do preview.
- Ao alterar CSS/JS, **incremente o cache-buster** `?v=AAAAMMDD-N` em
  `index.html` (tanto no `<link>` quanto no `<script>`).
- Conteúdo vem de `data/*.json`; não "chumbe" conteúdo no HTML.
- Textos da interface em **português do Brasil**.
- Consulte `README.md` e `TESTES.md` antes de mudar comportamento.

## Como trabalhar (e quais skills usar)

1. **Diagnóstico** — `redesign-existing-projects` (auditoria de padrões
   genéricos) + `ux-heuristics` (se instalada) na tela atual. Registre o que
   achou contra o inventário acima.
2. **Arquitetura de informação** — `information-architecture` (se instalada)
   para o mapa de seções, rótulos do menu e o que vai na capa. Valide o mapa
   com o usuário **antes** de mexer no layout.
3. **Direção visual e execução** — `impeccable` (`shape`, `layout`, `quieter`,
   `distill`, `typeset`, `polish`). Para inspiração de paletas/fontes
   corporativas, `ui-ux-pro-max` — mas **sem fonte externa** e sem estilo
   "glass/gradiente". `better-typography` (se instalada) para a escala tipográfica.
4. **Auditorias finais** — `dudu-check-cores` (contraste claro/escuro),
   `dudu-check-modais` (o `<dialog>` de detalhes e as janelas de Equipes e
   Administração), `web-design-guidelines` (se instalada) nos arquivos alterados.
5. **Antes de dizer que terminou** — `verification-before-completion`.
6. **Commit do assunto** — assunto pronto e verificado vira um commit, com a
   documentação dele, antes de começar o próximo (regra em `.claude/CLAUDE.md`,
   pedido do usuário em 21/09/2026). Nada na `main`; `git push` só a pedido.

Trabalhe em fatias pequenas (uma região da tela por vez) e mostre o resultado no
preview a cada fatia.

## Verificação no preview

- O preview se chama `portal` em `.claude/launch.json` (porta 5500). Use
  `preview_start` com `name: "portal"` e o navegador do app
  (`mcp__Claude_Browser__*`).
- No primeiro acesso aparece "Qual área você atua?": escolha qualquer
  colaborador ou Visitante (não é login).
- Confira em **1440 px, 1024 px e 375 px**, (o portal hoje só tem tema claro; se
  um tema escuro for criado, confira os dois), navegando só pelo teclado ao menos uma vez (Tab, `/` para a busca,
  setas nas abas).
- Veja o console (`read_console_messages`) — nenhum erro novo.
- Busca do cabeçalho (sugestões abaixo do campo ao digitar; Enter abre
  `#busca/<termo>`), abas da Central de conteúdo, diálogo de detalhes, janela de
  Equipes e Administração precisam continuar funcionando.

## Checklist de saída de cada fatia

- [ ] Nenhum item do inventário (estrutura, menus, adornos) sobrou na região alterada.
- [ ] A região ajuda o usuário a **chegar a algum lugar** (link, busca, filtro).
- [ ] Cores vêm de tokens; contraste AA (em todos os temas existentes).
- [ ] Cache-buster atualizado.
- [ ] Preview conferido nas três larguras e sem erro no console.
- [ ] Commit do assunto feito (`.claude/CLAUDE.md`).
