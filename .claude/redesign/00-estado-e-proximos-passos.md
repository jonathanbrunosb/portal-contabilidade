# Estado do redesign e próximos passos

Atualizado em 21/09/2026 · Branch `ajustes-frontend-dudu` (a partir de `main`,
que segue em produção para comparação) · **Um commit por assunto**, feito
pelo Claude assim que o assunto fica pronto (regra em `.claude/CLAUDE.md`).

Leia este arquivo primeiro ao retomar a conversa. Ele resume a intenção, o que
já foi decidido e feito, e o que vem a seguir.

> **Estado da última sessão e próximos passos imediatos:** `PROJETO_ESTADO_ATUAL.md`
> na raiz (snapshot) e `PROJETO_ESTADO_RESOLVIDOS.md` (o que foi concluído).
> Este arquivo guarda o detalhe de design e as decisões travadas.

---

## 1. A intenção do projeto

Repaginar o **Portal da Gerência de Contabilidade** (HTML/CSS/JS puro, sem
build) para que pareça **um portal corporativo**, com três objetivos, nesta
ordem:

1. **Navegação em primeiro lugar** — quem entra quer *chegar a um lugar*: um
   sistema, uma norma, um processo, uma pessoa.
2. **Visual institucional** da Equatorial, tirado da comunicação real da
   empresa (boletins e campanhas), não de um tema genérico.
3. **Sem construção de frontend "de IA"** — ver a definição no item 2.

### O que "elemento de IA" significa aqui (correção do usuário, 19/09)

É a **montagem genérica da interface**: grades de cartões idênticos, hero de
landing page, kickers em caixa alta, glass/blur, menus de template SaaS,
adornos animados sem função.

**Não** são imagens, ilustrações, personagens 3D ou mesclas de cor: essas o
usuário considera boas para deixar a comunicação leve e intuitiva, e são
repertório válido para **conteúdo** (ver `projeto/brand/repertorio/README.md`).

### Modelo de referência adotado

**cfc.org.br** — medido e documentado em
`projeto/brand/referencias/cfc/README.md`: cabeçalho, menu horizontal com
submenus, páginas de seção com faixa de subpáginas e a linha azul deslizante,
rodapé com mapa do portal.

---

## 2. Onde está cada coisa

| Documento | Para quê |
|---|---|
| `.claude/skills/portal-corporativo/SKILL.md` | **Regras do projeto**: direção, inventário do que sai, restrições da stack, decisões travadas. Carregue antes de mexer na interface |
| `.claude/redesign/01-diagnostico.md` | Diagnóstico inicial (nota 5/10, achados por severidade) |
| `.claude/redesign/02-arquitetura-navegacao.md` | Proposta de navegação aprovada. **Parcialmente desatualizada**: escrita antes dos ajustes de menu de 19/09 (ver item 4) |
| `.claude/redesign/03-sistema-visual.md` | **Sistema visual**: tokens (tipografia, cores com as correções de contraste, raios, sombras), o cartão em faixa, a arte dos cartões e a faixa de filtros. Leia antes de escrever qualquer cor, tamanho ou grade no CSS |
| `.claude/redesign/04-arte-dos-cartoes.md` | **Arte dos cartões, passo a passo**: como escolher o modo, acessar o destino, levantar a identidade, registrar no gerador e conferir. **Leia antes de adicionar qualquer item** a uma das seis coleções |
| `assets/marcas/FONTES.md` | Origem e titular de cada logomarca usada nos cartões |
| `.claude/redesign/02-prototipo-navegacao.html` | Protótipo que validou topo, menu e carrossel. Já implementado no portal real; serve de registro |
| `projeto/brand/` | Marca: guia de estilos, tokens, logos, referências dos e-mails, CFC e repertório. **Interno, não publicar** |
| `projeto/modelos-emails/` | 6 e-mails `.msg` da Comunicação (fonte da marca). **Interno** |

**Skills instaladas no projeto** (`.claude/skills/`): `portal-corporativo`
(própria), `impeccable`, `redesign-existing-projects`, `dudu-check-cores`,
`dudu-check-modais`, `ui-ux-pro-max`, `verification-before-completion`,
`web-design-guidelines`, `information-architecture`, `ux-heuristics`,
`better-typography`.

---

## 3. O que já está no portal real (fatias concluídas)

1. **Cabeçalho (faixa de identidade)** — imagem do hero antigo ancorada à
   direita + degradê; logo branco; título "Portal da Gerência de /
   **Contabilidade**" (Segoe UI 18/30, hierarquia por peso); busca translúcida
   sem dica de atalho; "Bem-vindo, <nome>" discreto com menu (trocar
   identificação, preferências e, para gerência, alertas). Sem A+/A e sem sino.
   ~149 px no total.
2. **Menu embutido na base da faixa** — tarja escura translúcida, itens
   centralizados com ícone, ativo com sublinhado laranja; dropdown branco
   alinhado à esquerda do item, borda superior laranja, **sem "Tudo em…"**;
   teclado e celular (botão "Menu"). Substituiu a barra lateral.
3. **Capa** — carrossel de destaques (formato do Conecta) com Avisos e
   Acesso rápido numa coluna ao lado dele a partir de 1200 px (altura pela
   janela, 21/09 à noite, para a Comunicação aparecer sem rolar); abaixo,
   **Comunicação em três colunas, uma por origem**, sem faixa de título
   (21/09, ver item 18 e `03-sistema-visual.md`). Saíram o bloco de apresentação, as
   três métricas e a trilha "Workspace / Visão geral".
4. **Enfeites removidos** — faixa RADAR, pontos pulsando, kickers em caixa
   alta, setas decorativas. Links externos usam o ícone de link externo.
5. **Rodapé institucional** em todas as telas, com mapa do portal por perfil,
   área responsável e data da base.
6. **Páginas de seção** (padrão CFC) — sem quadro de título; só a faixa de
   subpáginas colada ao menu (cinza `#ECECEC`, itens em caixa alta, linha azul
   de 3 px que desliza até o item sob o mouse/foco, 0,25 s). Substituiu a
   "Central de conteúdo" com 5 abas.
7. **Menus reorganizados** — "Sistemas" virou **Portais e Links**
   (Contabilidade = sistemas da área; Equatorial = 5 portais do Grupo;
   Portal de Serviços = os 8 serviços do atendimento interno; Gente e Gestão =
   os 8 de RH; Externos = 6 links de terceiros) e nasceu
   **Sistemas e automações**
   (Contabilidade = automações; Equatorial = 5 atalhos SAP e afins em grade;
   Externos = ferramentas de terceiros, hoje só o iLovePDF). Em 21/09
   Cronograma de Fechamento e Auditoria saíram dos atalhos Equatorial: eram o
   mesmo link de dois sistemas da Contabilidade, que continuam em Portais e
   Links → Contabilidade. O atalho "Outros", sem link, saiu junto.
8. **Repositório de links (20/09)** — `data/portais.json` serve **duas**
   páginas, separadas pelo campo `destino`: Portais e Links → Equatorial
   (Comunicação, SharePoint, Power BI, Viagens)
   Portais e Links → **Portal de Serviços** (Atendimento, Acessos e senhas,
   Solicitações por assunto) e Portais e Links → **Gente e Gestão** (Central
   do Funcionário, Desempenho e carreira, Benefícios e jornada). As duas
   separações são de 20/09: os nove itens
   do atendimento interno pesavam metade da tela Equatorial e não conversavam
   com os outros grupos; e o `/esc` não é uma página solta, é um **portal
   próprio — o Conecta** — com barra de menu e seções suas, então o cartão
   "Central do Funcionário" saiu de Pessoas e RH e virou a página dele. Logo
   depois o usuário mandou levar **todo o RH** para lá — Actio, Qulture.Rocks,
   Portal do Colaborador e EQTL Previ —, então o grupo "Pessoas e RH" deixou
   de existir em Equatorial, que ficou só com o que não é gente: comunicação,
   SharePoint, Power BI e viagens.

   Duas correções do usuário logo depois: o cartão **Meus favoritos** saiu (a
   lista de favoritos do Conecta era pessoal; o que ele queria ali era o
   **Saber**, que estava solto em Equatorial com o nome do fornecedor,
   "Learning.rocks") e **Minha Jornada de Trabalho** veio do Portal de
   Serviços para cá, com o endereço corrigido para o domínio
   `portaldeservicos` — estava cadastrado em `service-now.com`, que é o mesmo
   item do catálogo por outra porta. Depois o **Portal do Colaborador**
   (`portaldocolaborador.equatorial.corp`, rede interna, só com VPN) saiu e
   entrou o **Portal do Empregado**, na plataforma Senior por SSO.
   `data/externos.json`
   (Portais e Links → Externos: Auditoria, Inteligência artificial, Arquivos e
   documentos, Referências visuais). Ambos com faixa de busca, filtro por grupo
   e contagem, e listam em **ordem alfabética do título** (decisão de 20/09:
   o grupo continua no rótulo do cartão e no filtro, mas quem procura um nome
   varre a lista de A a Z sem precisar saber em que gaveta ele está). O cartão
   mostra o **domínio de destino** no rodapé e a ficha do
   "i" traz uma **observação** quando o acesso tem pegadinha (rede interna,
   workspace pessoal do Power BI, envio de arquivo a serviço público).
   `telaDeLinks()` é a mesma função para as quatro páginas; `destino` é o que
   reparte cada coleção. Origem:
   o export de favoritos em `projeto/equatorial-links/`, alocado item a item em
   `alocacao.md`. Snowflake e ONESOURCE TAX ONE entraram nos atalhos.
9. **Arte de todos os cartões (20/09, 61 SVGs)** — `.claude/tools/arte-marcas.py`
   substituiu `arte-motivos.py` e `arte-cartoes.py`, que foram apagados.
   `.pcard-img` passou de `object-fit: contain` para `cover`. São **dois modos**:
   - **`tela`** (9 cartões): reproduz a tela de entrada do destino — fundo, logo
     e título dela. ProjectHub e Central de Resultados usam a foto do próprio
     site; Cronograma de Fechamento e Portal de Auditoria, o degradê do painel
     de login (reproduzido em SVG a partir do CSS medido); IFRS 16/CPC 06 e
     Gestor de Horas, a paleta e o lockup de cada um; Lei 6.404 e LC 214, o
     Brasão da República do Planalto. Os insumos ficam em
     `projeto/marcas-telas/` — fora do site, porque já vão embutidos no SVG.
   - **`marca`** (52 cartões): marca oficial sobre o fundo da própria marca, sem
     desenho decorativo, com **rótulo abaixo** quando a marca se repete. 25
     marcas em `assets/marcas/` (origem em `FONTES.md`); 4 saem como assinatura
     tipográfica por falta de logo utilizável.
10. **Nome da seção na faixa de subpáginas (20/09)** — à esquerda das abas, com
   divisória, no padrão de microsoft.com/pt-br. Fica **fora da área rolável**:
   em tela estreita as abas rolam e o nome da seção permanece.
8. **Documentos & Normas** — abre direto na tabela, sem submenu; faixa com
   Todos + 5 grupos; **9 referências oficiais com link verificado** (CPC, CFC,
   IFRS, ANEEL/MCSE, SPED ECD e ECF, Lei 6.404, LC 214/2025, Central de
   Resultados da Equatorial). Os 13 documentos de exemplo e seus arquivos em
   `assets/documents/` foram apagados.
9. **Telas internas revisadas (fatia 5)** — **Sistemas e automações →
   Contabilidade**: saíram os quatro números do topo e a grade de 12 cartões;
   agora é tabela (Automação / Tecnologia / Status) com a contagem discreta no
   rodapé. A coluna de acesso só aparece quando alguma automação tiver link.
   **Comunicação → Notícias**: saiu o cabeçalho que repetia o nome da seção; a
   data da última atualização foi para o rodapé. **Pessoas → Estrutura das
   Equipes**: o banner azul em degradê virou uma barra clara com o rótulo da
   área e os botões Expandir/Recolher. Saiu também o degradê decorativo na
   borda das tabelas no celular.
10. **Sistema visual (fatia 6)** — escala tipográfica de 8 degraus no lugar de
    29 tamanhos; 3 pesos no lugar de 7; 5 raios no lugar de 15; 3 sombras no
    lugar de 15; e **nenhuma cor literal fora do `:root`** (eram 128). Todo
    texto passa em AA: o azul de ação, o cinza de apoio, as cores semânticas e
    o contorno de foco foram corrigidos. Detalhes em
    `.claude/redesign/03-sistema-visual.md`.
11. **Acabamento (fatia 7)** — o painel da gerência não pisca mais para quem
    não tem acesso (começa oculto no HTML); nenhum alvo de toque abaixo de
    24×24 px e nenhum texto abaixo de 12 px; o diálogo perdeu os rótulos em
    caixa alta e o desfoque do fundo; números em coluna com `tabular-nums`.
12. **Grade de cartões padronizada** — as três grades (Portais e Links →
    Contabilidade, Sistemas e automações → Equatorial e → Contabilidade)
    passaram a usar o mesmo cartão: uma **faixa horizontal** de ~176 px com a
    imagem numa coluna fixa à esquerda e as informações no restante, **duas
    por linha**. Clique no cartão não abre nada, ficha pelo "i" e destino por
    Acessar/Baixar. Borda e sombra medidas em microsoft.com/pt-br. Automações
    voltou de tabela para grade. Quem administra troca a arte clicando na
    imagem.
13. **Menu sem submenu suspenso** — clicar numa seção leva direto à primeira
    página dela; as demais aparecem na faixa de subpáginas, em abas, como
    Documentos & Normas já fazia. A faixa saiu de dentro do `#page-view` e
    passou a valer para qualquer seção, inclusive Gestão. Some quando a seção
    tem uma página só (Pessoas) ou já tem abas próprias (Administração).
14. **Faixa de busca e filtros padronizada** — toda tela de conteúdo tem a
    mesma faixa (busca, filtros, "Limpar filtros") e a contagem do resultado
    no rodapé. Ganharam faixa as telas que não tinham (sistemas da área,
    atalhos Equatorial e Newsletter); os chips de categoria de Notícias
    viraram um `<select>` na faixa. A capa segue sem faixa.
15. **Documentos & Normas entrou na mesma grade** de Portais e Links: saiu da
    tabela e virou cartão em faixa, com o grupo como rótulo, a fonte oficial
    na linha de ações e a data de conferência do link na ficha do "i". Não há
    mais tabela de conteúdo no portal — só a de processos críticos, no painel
    da gerência.
16. **Arte em todos os cartões** — 26 SVGs (5 atalhos, 12 automações, 9
    documentos) com **a marca oficial da fonte de cada item** (CFC, CPC, IFRS,
    ANEEL, Receita Federal, gov.br, SAP, SharePoint, EY, Python e Grupo
    Equatorial), preenchendo o quadro. **Refeita em 20/09** — ver o item 10.
17. **Origem do conteúdo (21/09)** — todo conteúdo publicado ganhou o campo
    `origem` (`contabilidade`, `equatorial` ou `externo`), em 11 arquivos de
    `data/`. Aparece como **filtro "Origem"** em Documentos → Todos e na busca
    global, como **selo cheio na cor da origem** onde a tela mistura origens e
    como linha "Origem" em **toda ficha**. A busca global passou a cobrir também
    portais, links externos, automações e atalhos corporativos — antes não
    achava "Paytrack", "ChatGPT" nem o próprio SAP. O "Novo rascunho" pede a
    origem; a automação grava sempre Contabilidade. Depois da limpeza dos dados
    ilustrativos e da carga dos e-mails (item 19), a Comunicação tem 1
    Contabilidade, 6 Equatorial e 1 Externo; documentos 0 + 1 + 8. Detalhes em
    `03-sistema-visual.md` § 9.
19. **Comunicados da Comunicação Equatorial (21/09)** — 6 comunicados de
    origem Equatorial transcritos dos e-mails de `projeto/modelos-emails/`
    (extraídos em `projeto/brand/referencias/emails/`), publicados e aprovados
    por Eduardo dos Santos Rocha: segurança digital, Código de Ética nas
    eleições, Código de Ética e LGPD, MigraSAP (4ª rodada do quiz), Agentes da
    Inovação e 10 cases de inovação aberta. Estão em `data/noticias.json`
    (ids `eqtl-*`); imagens em `assets/images/comunicados/`. Peça vertical tem
    `imagemCapa` (recorte 16:9 do topo) para a lista e a capa; a página mostra a
    peça inteira. **Regras usadas:** texto fiel à peça, com a Comunicação como
    fonte; **nenhum link rastreado** (os e-mails passam os cliques por um
    rastreador com código ligado ao e-mail do Eduardo) — o link do quiz do
    MigraSAP veio do QR Code da peça. Ficaram de fora, por escolha do usuário:
    SIPAT (21 a 25/09) e Data Services (até 30/09) como avisos, e o Engaja+;
    e, por estarem vencidos ou fora do tema, ONEE, Wellhub, "Eu faço a
    diferença", DDS, Movimente-se, Escola de Eletricistas, Virtus e baixa
    umidade. **Ver o bloqueio de publicação na seção 7.**
20. **Carrossel: molde novo e gestão (21/09)** — o slide segue o molde do
    usuário (Figma 2000×519 em `projeto/comunicados`): fundo, até duas
    imagens, selo + área, título, subtítulo, descrição e ação, com o texto em
    HTML. O **slide inteiro é clicável** (antes o texto cobria o botão e só a
    metade da imagem clicava). Cada slide aponta para um **destino**
    (comunicado, sistema, portal, link externo, atalho, página ou endereço
    livre) e herda dele o que deixar em branco. Gestão pela **Administração →
    Carrossel**, pelo bloco **"Carrossel da capa"** na página do comunicado e
    pelo **"Destacar no carrossel"** das fichas, com prévia do slide; gravar
    exige o servidor interno (testado de ponta a ponta com o `server.js` numa
    cópia dos dados: criar, reordenar, encerrar, excluir, validação). Os três
    slides de sistemas (Cronograma, IFRS 16, Auditoria) foram refeitos com o
    fundo e as capturas extraídos dos SVGs para `assets/destaques/`.
18. **Comunicação refeita (21/09)** — Newsletter Contábil e Notícias &
    Impactos viraram **uma lista só de comunicados**, com abas **Todos,
    Contabilidade, Equatorial e Externo**. Cada comunicado é uma **faixa**
    (imagem à esquerda; selo, categoria e data; título; subtítulo; texto até
    onde couber) e ganhou **página própria**
    (`#central/comunicado/<coleção>/<id>`) com o texto na íntegra, as ações e
    a ficha — o diálogo de leitura saiu. A **capa** trocou "Comunicação
    recente" por **três colunas, uma por origem**, no formato da capa da CNN
    Brasil que o usuário enviou. **Paleta das origens** escolhida pelo usuário:
    Contabilidade verde-água, Equatorial azul do Grupo, Externo roxo; a
    categoria perdeu a cor. O ProjectHub, cadastrado na Newsletter e em
    Notícias, aparece uma vez só (nada foi apagado). Detalhes em
    `03-sistema-visual.md` § 10.

---

## 4. Exigências do usuário (travadas — não proponha de novo)

### Origem do conteúdo (21/09)
- **Três origens**: **Contabilidade** (criado e gerido pela Gerência),
  **Equatorial** (do Grupo, para a empresa toda) e **Externo** (de fora do
  Grupo, com tema afim).
- **Critério: quem escreveu o conteúdo, não o tema.** Análise da equipe sobre
  uma norma = Contabilidade; notícia reproduzida da ANEEL = Externo;
  deliberação do Grupo = Equatorial. O tema fica na categoria/grupo.
- **Cor por origem** (paleta do usuário): Contabilidade verde-água `#0D6B64`,
  Equatorial azul `#004AAD`, Externo roxo `#6A4BC9`. O **selo é cheio**, com
  texto branco. A cor é só da origem: a categoria não tem cor própria.
- **Comunicação tem abas por origem** (Todos, Contabilidade, Equatorial,
  Externo), pedido do usuário. Nas outras telas que misturam origens
  (Documentos → Todos, busca global) a origem é filtro, e o selo aparece no
  cartão. Páginas de uma origem só não levam selo.

### Comunicação e capa (21/09)
- **Lista de faixas**, uma por comunicado: imagem à esquerda; tipo (origem) e
  título à direita; subtítulo; texto até onde couber. Clicar abre a **página
  própria** do comunicado, com endereço próprio.
- **Capa com três colunas**, uma por origem, no formato da capa da CNN Brasil:
  título na cor da origem, destaque com o título sobre a imagem, lista com
  miniatura e marca da origem no canto.
- Comunicado duplicado entre Newsletter e Notícias aparece **uma vez só**; os
  registros continuam nos arquivos.

### Cabeçalho e menu
- Menu com **ícones**; carrossel **16:9 ocupando metade** da capa.
- Faixa do topo **não é fixa** ao rolar; ~149 px (96 de identidade + 53 de menu).
- Hierarquia do título **por peso**, mesma fonte do portal (a Bahnschrift foi
  testada e recusada).
- **Nenhum submenu suspenso.** Clicar numa seção leva direto à primeira página;
  as demais aparecem na faixa de subpáginas, **em abas**, como Documentos &
  Normas já fazia. Vale para qualquer seção.
- **Sem quadro de título/trilha** nas páginas internas.
- **O nome da seção fica à esquerda das abas**, na faixa de subpáginas. Motivo
  dado pelo usuário: em tela estreita o menu some e essa era a única pista de
  onde se está. Não pode rolar junto com as abas.

### Grade de cartões (vale para todas as telas de lista)
- O cartão é uma **faixa horizontal**, com **altura de cerca de 1/3** do cartão
  alto que existiu antes, **dois por linha**. Hoje são **145 px** em 1440 e
  140 em 1024 — o usuário achou 199 px alto demais em 20/09. A altura é do
  conteúdo: a arte saiu do fluxo e a escala tipográfica encolheu 10%.
- A **imagem ocupa uma coluna fixa à esquerda**, em altura cheia; as
  informações ficam no restante do espaço.
- **Clicar em qualquer parte do cartão leva ao destino** (20/09, substitui a
  regra anterior de "clique não abre nada"). A ficha continua saindo pelo ícone
  **"i"**, que abre o modal — o usuário pediu para **manter o modal** nesse
  caminho. Sem destino cadastrado, o cartão não clica: hoje é o caso das 12
  automações, todas com `url` vazia.
- Borda e sombra no padrão medido em **microsoft.com/pt-br**.
- **Uma grade só** para todo conteúdo de lista. Documentos & Normas saiu da
  tabela e entrou nela; não há mais tabela de conteúdo no portal.

### Imagens dos cartões — **aprovadas pelo usuário em 20/09**
- **Quando o destino tem tela de entrada própria, a arte reproduz essa tela.**
  Acessar o link **em largura de desktop** (1600 px; o ProjectHub, por exemplo,
  esconde o painel de identidade em tela estreita), entender a composição e
  reaproveitar o que já está pronto: o fundo dela, a logo na posição dela, o
  título na tipografia dela. Cada cartão guarda a personalidade do sistema.
  Exemplos que o usuário deu: ProjectHub, Cronograma de Fechamento, Central de
  Resultados.
- **A marca tem de bater com o destino.** Se o link vai ao Planalto, a marca é o
  Brasão da República — não o gov.br (correção do usuário em 20/09).
- **Marca real, não desenho.** Para cada cartão, achar a **logomarca da
  empresa/instituição** dona do assunto (se a norma vem do CFC, vai a logo do
  CFC) e, se possível, algo do próprio tema junto.
- **Pesquisar a fundo, um a um.** Entrar no site de cada item (quando houver)
  para entender o teor e pegar a marca. Nada de tratar a grade em bloco.
- **A imagem preenche o quadro inteiro**, dimensionada para não ficar quebrada.
- **Se a imagem não puder preencher tudo**, o fundo do quadro recebe **o mesmo
  fundo da própria logo** (foi por isso que o painel ficou branco).
- **Sem ícone ou desenho junto da marca.** A arte é a marca e o fundo, mais nada.
- **Marca repetida pede rótulo.** Quando a mesma logo serve a vários cartões
  (SAP, Python, ServiceNow, Receita Federal, gov.br, Equatorial), vai um texto
  abaixo dela — a transação, a norma, o sistema — em harmonia com a imagem.
- Quem administra **troca a arte clicando na própria imagem** do cartão.
- Referências visuais que o usuário enviou: a capa do **Porto Bank** (azul
  profundo com luz atrás do assunto), o cartão do **XBOX Series S** (imagem em
  área fixa + título + texto + botão) e dois exemplos de marca institucional
  (ANEEL sobre claro, CFC/CRCs sobre azul).

### Faixa de busca e filtros
- **Toda tela de conteúdo tem a mesma faixa**: busca, filtros e "Limpar
  filtros", nessa ordem, com a contagem do resultado no rodapé.
- **Filtro não repete aba** (21/09). Se a faixa de subpáginas já recorta por um
  campo, ele não vira `<select>`: o filtro de grupo de Documentos & Normas saiu
  por isso. Nas outras seções as abas são páginas diferentes e os filtros
  recortam dentro delas, sem repetição.
- **A capa não tem** — lá a busca é a do cabeçalho.

### Conteúdo
- **O portal não é só ferramenta da empresa.** Ele é também um **repositório de
  links externos** que ajudam no dia a dia — IA, conversores, referências
  visuais. Não recuse um link por ser de terceiro.
- **Autenticação é com o usuário.** O portal centraliza e facilita; ele não
  resolve login, VPN nem permissão. Um link que exige conta própria ou rede
  interna entra do mesmo jeito — basta dizer isso na ficha.
- Documentos: **só conteúdo real**, com link oficial verificado.
- Trabalhar **direto nos arquivos reais** (a `main` segue em produção para
  comparação). **Um commit por assunto** assim que ele fica pronto e
  verificado (`.claude/CLAUDE.md`); `git push` só quando o usuário pedir.

---

## 5. Próximos passos

**Nada em avaliação.** As artes foram **aprovadas pelo usuário em
20/09/2026** (hoje são 60, uma por cartão). Regerar com `python .claude/tools/arte-marcas.py`; conferir em
`projeto/artes/contato.html` (todas, no tamanho real do cartão) e
`projeto/artes/telas.html` (as do modo `tela`, ampliadas).

**Achados das auditorias que aguardam decisão**
- **Largura do diálogo** (`dudu-check-modais`): em 1440 px o diálogo tem 640 px
  e o conteúdo de uma publicação chega a 1254 px — sobram ~490 px de rolagem
  com 800 px de tela vazia dos lados. Alargar para ~820 px cortaria quase toda
  a rolagem. Não apliquei: mexe em largura, e essa skill exige aval item a item.
- Os diálogos de edição (Novo rascunho, Administração) **não foram medidos**:
  exigem o backend opcional ligado.
- A categoria "IA" duplicada em `config.json` **não existe mais**.

**Consequências da origem (21/09) que aguardam decisão**
- As duas artes que sobraram dos atalhos retirados
  (`assets/atalhos/cronograma-fechamento.svg` e `auditoria.svg`) e as receitas
  delas no gerador **foram apagadas em 21/09**, com o aval do usuário. As artes
  dos sistemas equivalentes (`assets/sistemas/cronograma-de-fechamento.svg` e
  `portal-de-auditoria.svg`) continuam. O gerador faz agora 60 artes, uma por
  cartão.
- **Acesso rápido mudou sozinho**: ele junta atalhos e sistemas ativos até 8.
  Sem as duas duplicatas, o **ProjectHub** entrou e o **Portal de Auditoria**
  ficou de fora pelo limite.
- **Categorias**: com os exemplos fora, sobraram só "COMUNICADO INTERNO" (o
  ProjectHub) e "ANEEL". Ao cadastrar comunicados reais, padronizar a grafia
  (a lista sugerida está em `config.json › newsletterCategorias`) e evitar
  categorias que repetem a origem ("Grupo", "Interno").

**Carrossel (21/09) — decisões de conteúdo pendentes**
- **6 slides no ar**, acima do limite recomendado de 5. Encerrar ou pausar um
  (candidato: Controle de Horas, que ainda usa a ilustração antiga).
- **Moldes do Figma** (`projeto/comunicados`, 2ª leva de 21/09 já aplicada
  pela `.claude/tools/moldes-destaques.py`):
  - o **fundo do IFRS 16 é prévia da VectorStock** (a 2ª leva cortou a faixa da
    marca d'água, mas a licença continua faltando) — bloqueado em
    `FUNDOS_BLOQUEADOS`; o slide está no azul `#004389` do molde, com as
    listras, até vir um fundo licenciado;
  - **Cronograma e Portal de Auditoria continuam com o mesmo parágrafo** (o
    texto descreve o Portal de Auditoria e, no Cronograma, cita a si mesmo). No
    Cronograma segue a descrição do cadastro do sistema;
  - o **subtítulo** é status no IFRS 16 ("Ativo para uso") e na Auditoria
    ("Em desenvolvimento"), mas chamada no Cronograma; e a Auditoria está
    "Ativo" em `sistemas.json` — conferir qual vale;
  - a área está como **"Executiva IV · Conciliação e Auditoria"** (como no
    molde), enquanto o portal inteiro usa "Contabilidade IV";
  - *(resolvido)* `image 6/7` eram o "antes" do Cronograma — painel em Excel e
    o X claro sobre ele e a planilha —, e agora estão na cena do slide;
  - Controle de Horas mostra subtítulo e descrição quase iguais (a descrição
    vem do cadastro do sistema) — definir uma ou deixar só o subtítulo.
- Contagem de cliques por slide ainda não aparece na aba Carrossel (o portal
  registra `destaque_open` localmente; falta mostrar).

**Comunicação (21/09) — depende de conteúdo**
- A Comunicação tem **8 comunicados reais**, todos com imagem: ProjectHub
  (Contabilidade), tarifas da ANEEL (Externo) e 6 da Comunicação Equatorial
  (item 19). A coluna Contabilidade da capa só tem o ProjectHub.
- **A notícia da ANEEL ainda tem resíduo de exemplo**: `responsavel` e
  `aprovadoPor` são "Marina Oliveira" (perfil fictício removido) e
  `areaResponsavel` é "Normas e Reporte", área que não existe nas equipes.
  Definir com o usuário quem assina.
- A lista **não pagina**: com muitos comunicados, vale paginar ou carregar por
  partes.

**Bloqueios que dependem do usuário**
- **Administração (21/09):** Jonathan e Eduardo têm a permissão
  `administracao`, em `data/usuarios.json`, com o mesmo `id` que têm no quadro
  das equipes. Quem escolhe um deles na identificação vê o menu Administração
  e o botão "Trocar imagem". A janela ainda pede o **código de acesso** (hash
  em `ADMIN_UNLOCK_HASH`, `js/app.js`); o código não está no repositório.
- **Os atalhos Equatorial não gravam pela API**: `config.json` é somente
  leitura no servidor, então a arte deles só muda editando o JSON.
- **Dois cartões sem logo oficial** — ONESOURCE e ARGO saem como assinatura
  tipográfica. (O Qulture.Rocks saiu dessa lista em 20/09: a tela de entrada
  serve a assinatura oficial em SVG.) Ver o fim de `assets/marcas/FONTES.md` para
  trocar. (O Saber saiu dessa lista em 20/09: o banner de entrada dele tem
  lockup próprio, "Gente que Aprende".)
- **As seis ilustrações em `assets/sistemas/*.webp`** (não são prints: são
  ilustrações geradas de cada sistema). Corrigido em 21/09: **quatro estão em
  uso** no carrossel da capa (Cronograma, IFRS 16, Portal de Auditoria e
  Controle de Horas, destaques d3 a d6). **Monitor de Desempenho** e
  **ProjectHub** estão sem uso. O usuário pediu para manter. Não servem para
  comunicado de Equatorial: ilustram sistemas da Contabilidade, então um
  comunicado sobre eles é de origem Contabilidade. Há erros de texto dentro de
  algumas ("Eestalizado" e "Visão Global" duplicado no Portal de Auditoria;
  "Fluxo de fechamento" duas vezes no Cronograma) — o do Portal de Auditoria
  já aparece no carrossel.
- **A foto do banner da Central de Resultados** veio do site de RI e é um
  licenciamento de banco de imagens (iStock) que a Equatorial contratou para
  aquele site. O portal é publicado no GitHub Pages: vale confirmar com quem
  cuida do RI antes de publicar.
- **Dados ilustrativos removidos em 21/09** (aprovado pelo usuário): os 3
  avisos, 13 comunicados de exemplo (n1 a n5 e 8 notícias), processos,
  entregas e agenda, os 4 indicadores do Painel, o `resumo` sem uso, a semana
  fixa, a marca "Dados ilustrativos" do rodapé, as empresas "(exemplo)" das
  equipes e os perfis fictícios Marina Oliveira e Ana Martins. Ficaram 2
  comunicados reais (ProjectHub e tarifas da ANEEL); avisos, Painel, Processos,
  Agenda e Entregas mostram "Nenhum … cadastrado ainda". **Falta conteúdo
  real** para: avisos, comunicados (a coluna Equatorial da capa está vazia),
  indicadores, processos, agenda, entregas e as empresas atendidas por equipe.
  O `dataReferencia` do `config.json` (14/09/2026) é o que o rodapé mostra
  como "Atualização da base" — atualizar a cada carga.

---

## 6. Como trabalhar neste projeto

- **Preview**: `.claude/launch.json` → `preview_start` com `name: "portal"`
  (Python, porta 5500). Verificar sempre em **1366 px e 375 px**, conferir o
  console e testar com mais de um perfil.
- **Perfis de teste**: `localStorage['portal-identity']`. Eduardo (Colaborador)
  é `colaborador-eduardo-dos-santos-rocha`; para testar Gerência, use
  `colaborador-alexandra-furtado-freire-paes-landim`. **Sempre devolver a
  identificação do Eduardo depois do teste.**
- **Verificar sempre** com `.claude/tools/contraste.js` no console: ele confere
  contraste AA, alvo de toque mínimo de 24 px, texto abaixo de 12 px e estouro
  horizontal, tela por tela.
- **Capturas do preview mentem** de vez em quando (faixa de menu ou listas em
  branco) quando a janela do app está atrás de outra. Antes de caçar um bug,
  meça o elemento com `getBoundingClientRect()`.
- **Cache**: depois de mexer em CSS, JS ou numa arte, rode
  `python .claude/tools/versao.py --subir`. Ele sobe o `?v=AAAAMMDD-N` nas 19
  ocorrências de uma vez — `index.html`, o CSS e todos os imports, que precisam
  bater entre si, senão o navegador carrega duas cópias do mesmo módulo.
  **As imagens não têm número próprio**: `comVersao()` em `js/ui.js` lê a versão
  do endereço do próprio módulo e a carimba em tempo de renderização, então
  subir a versão basta para uma arte nova chegar a quem já visitou — sem
  Ctrl+F5. `python .claude/tools/versao.py` sem argumento mostra a versão atual
  e avisa se duas estiverem convivendo.
- **Quebras de linha**: o repositório tem CRLF e LF misturados. Depois de
  reescrever arquivos por script, rodar `.claude/tools/eol.py <arquivo>` para o
  diff mostrar só as mudanças reais. Sem isso, o diff "muda" o arquivo inteiro.
- **Ao apagar regras CSS**: `.claude/tools/cssprune.py` já apagou o fechamento
  de um comentário junto com a regra e transformou 110 regras em comentário — a
  página fica sem estilo e nada aparece no console. A ferramenta agora preserva
  os comentários e aborta se o total mudar; ainda assim, **conferir a tela no
  navegador depois de podar**.
- **Edições por script**: ler o arquivo com `.replace('\\r\\n','\\n')` antes de
  casar trechos de várias linhas.
- **Commit por assunto** (pedido do usuário em 21/09/2026, regra completa em
  `.claude/CLAUDE.md`): cada assunto pronto e verificado vira um commit, com a
  documentação dele; nada na `main`; `git push` só quando o usuário pedir.

## 7. Pendência de publicação

> **BLOQUEIO antes de qualquer merge na `main` (21/09/2026).** O usuário
> decidiu que o portal **será interno** e, por isso, autorizou carregar
> comunicados internos da Comunicação Equatorial (item 19 da seção 3), inclusive
> uma foto de colaboradores. Mas o workflow ainda publica a `main` em
> **portal.contabilidade-eqtl.com, sem login**. Enquanto isso não mudar
> (hospedagem interna ou autenticação), levar esta branch para a `main` põe
> conteúdo interno na internet. Resolver a hospedagem primeiro.

O workflow `.github/workflows/pages.yml` publica **a pasta inteira** do
repositório no GitHub Pages (site público). `projeto/` (marca + e-mails
internos, com nomes de colaboradores) e `skills-lock.json` estão fora do Git
hoje; se forem commitados, vão para o ar. Decidir antes do commit: `.gitignore`
ou exclusão no workflow.
