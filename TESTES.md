# Registro de validação — 14/09/2026

Validação em servidor estático local e navegador integrado. Não foram executadas sessões separadas de Chrome e Edge nem testes em dispositivos físicos.

## Layout

| Viewport | Resultado |
| --- | --- |
| Desktop 1920 × 1080 | Conteúdo renderizado, largura da página 1905 px, sem overflow horizontal global |
| Notebook 1366 × 768 | Conteúdo renderizado, largura da página 1351 px, sem overflow horizontal global |
| Tablet 768 × 1024 | Menu recolhível e conteúdo dentro da largura; página 753 px |
| Celular 390 × 844 | Menu fechado inicialmente, conteúdo em coluna; página 375 px |

A diferença de 15 px corresponde à barra de rolagem vertical. No celular, a tabela tem 556 px dentro de um contêiner de 345 px, preservando a rolagem horizontal somente na tabela. As tabs também possuem rolagem própria.

## Fluxos verificados

- Matrícula `2026001`: Jonathan Bruno, Gestor, Contabilidade IV.
- Matrícula `123456` em `index.html`: Marina Oliveira, Gerência.
- Matrícula `999999`: colaborador não identificado e avatar padrão.
- URL sem matrícula: colaborador não identificado e matrícula não informada.
- Quatro tabs da central: newsletter, notícias, sistemas e documentos.
- Newsletter: publicações, abertura do conteúdo completo. Carrossel da capa: troca a cada 7 s, pausa por botão, hover e foco.
- Organograma: Gerência e quatro equipes com líderes e contagens.
- Busca por `conciliações`: cinco resultados; termo inexistente retorna estado vazio; limpeza funciona.
- Documentos: filtro textual por conciliações e filtro de categoria IFRS; detalhes exibidos; destino de download válido.
- Sistemas: quatro cards; acesso sem URL mostra mensagem de configuração pendente.
- Menu mobile: abertura com `aria-expanded=true`, seleção de Sistemas e fechamento com `aria-expanded=false`.
- Navegação e rolagem entre seções; tabela contida no celular.
- Console consultado após a implementação e após a revisão: nenhum erro ou aviso JavaScript capturado.

## Arquivos e dados

- 11 JSONs com sintaxe válida e IDs únicos em cada coleção.
- Todos os HTML, CSS, JavaScript, JSON e SVG locais responderam HTTP 200.
- 13 documentos demonstrativos e caminhos dos avatares existentes.
- Destinos do menu correspondem às seções reais.
- Referências das soluções de equipes correspondem aos sistemas cadastrados.
- Sem instalação de dependências, sem requisições a CDN, sem publicação em nuvem.

## Validação do redesign — 20/09/2026

Telas internas (fatia 5) e sistema visual (fatia 6), no navegador integrado,
servidor estático local.

| Viewport | Resultado |
| --- | --- |
| 1440 × 900 | Todas as seções renderizadas, sem overflow horizontal |
| 1024 × 800 | Cabeçalho, menu e capa em duas colunas; sem overflow |
| 375 × 812 | Cabeçalho empilhado (190 px), tabelas em blocos com rótulo; sem overflow |

- **Navegação completa**: as 11 páginas do menu abertas em sequência (Início,
  Newsletter, Notícias, Portais e Links × 3, Sistemas e automações × 3,
  Documentos & Normas, Estrutura das Equipes) — nenhuma falhou.
- **Perfis**: Colaborador (Eduardo) e Gerência (Alexandra). Com Gerência,
  também Painel da Gerência, Processos críticos, Agenda & Entregas, Painel
  Editorial e Alertas da gerência. A identificação original foi restaurada ao
  fim do teste.
- **Contraste (WCAG AA)**: `.claude/tools/contraste.js` executado em todas as
  telas acima, nos dois perfis, em 1440 e 375 px — **nenhum texto abaixo de
  4,5:1**. Varredura estática das regras do CSS (pares cor/fundo na mesma
  regra): nenhuma abaixo do mínimo.
- **Foco visível**: contorno de 3 px em `--foco` (5,4:1 sobre branco) no corpo
  da página e **branco** dentro da faixa escura do cabeçalho, conferido com Tab
  e Shift+Tab.
- **Diálogo de detalhes**: abre, fecha e mantém o link oficial.
- **Console**: nenhum erro em nenhuma das telas.

Limite: o perfil Administrador (janela de Administração) não foi reaberto
nesta rodada — ele usa os mesmos componentes e tokens das demais telas, mas
convém conferi-lo antes da homologação.

### Acabamento (fatia 7)

- **Alvos de toque**: varredura de todo elemento clicável visível em 1440 e
  375 px, nas 11 páginas do menu e no painel de menu do celular — **nenhum
  abaixo de 24 × 24 px**.
- **Tamanho de texto**: **nenhum texto abaixo de 12 px** em nenhuma tela.
- **Conteúdo restrito**: com perfil Colaborador, `#painel` e `#editorial`
  chegam ocultos do HTML e continuam ocultos; com perfil Gerência, aparecem
  com os quatro indicadores.
- **Diálogos medidos ao vivo** (aviso, publicação, preferências,
  identificação, alertas, detalhe de documento) em 1440 e 375 px: nenhum campo
  cortado, nenhum estouro horizontal. Achado registrado sem aplicar: a
  publicação rola ~490 px em 1440 px com a caixa em 640 px de largura.
- Diálogos de edição (Novo rascunho, Administração) não foram medidos: exigem
  o backend opcional.

## Origem do conteúdo — 21/09/2026

Validação no navegador integrado, em 1440, 1024 e 375 px, com os perfis
Colaborador (Eduardo) e Gerência (Alexandra).

- **Dados**: `origem` gravado em 11 JSONs; o diff mostra só as linhas novas e os
  três atalhos retirados (Cronograma de Fechamento, Auditoria, Outros).
- **Filtro Origem**: Notícias com 3 opções (7 Contabilidade + 1 Equatorial + 1
  Externo = 9 publicadas); Newsletter com 2; Documentos com 2 (Equatorial 1,
  Externo 8). "Limpar filtros" zera a origem junto com os demais campos.
- **Busca global**: "sap" traz automações (Contabilidade), os atalhos SAP e SAP
  HANA (Equatorial) e o serviço SAP do Portal de Serviços; filtrada por
  Equatorial, 1 resultado do portal. "paytrack" e "chatgpt", que antes não
  apareciam, agora aparecem com o selo certo. Com Gerência, processos, equipes,
  agenda e entregas entram como Contabilidade. "Limpar busca" zera a origem.
- **Fichas**: sistema, automação, atalho, portal, link externo, publicação e
  aviso mostram a linha "Origem" com o valor esperado.
- **Altura do cartão**: com selo, igual à do cartão sem selo — 146 px em 1440 e
  140 px em 1024. Linha de etiquetas das notícias: 1 linha no desktop e até 2
  no celular, como antes do selo.
- **Contraste** (`.claude/tools/contraste.js`): `OK` em Newsletter, Notícias,
  Documentos e na capa com resultados de busca, nas três larguras. Nenhum
  estouro horizontal e nenhum erro no console.
- **Documentos sem filtro de grupo**: o `<select>` saiu; as abas continuam
  recortando (Todos 9, Legislação 2, Grupo Equatorial 1). O filtro Origem só
  aparece em "Todos" (Externo: 8). "Limpar filtros" numa aba limpa a busca e
  continua na aba. Contraste `OK` e sem estouro em 375 px.
- Não testados: o campo Origem do "Novo rascunho" e a gravação da automação
  pela Administração — o primeiro exige o backend opcional, o segundo o perfil
  `administracao`, que nenhum usuário tem hoje.

## Comunicação e capa — 21/09/2026

Validação no navegador integrado, em 1440, 1024, ~930 e 375 px.

- **Abas**: Todos 13 comunicados, Contabilidade 10, Equatorial 2, Externo 1. O
  ProjectHub, cadastrado na Newsletter e em Notícias, aparece uma vez só. Cada
  aba tem endereço próprio; o filtro de Categoria some onde só há uma
  categoria (Externo).
- **Faixa**: imagem à esquerda (340 px em 1440, 278 em 1024, 104 no celular),
  224 px de altura no desktop; o texto longo some no celular. Clicar em
  qualquer ponto da faixa abre o comunicado.
- **Página do comunicado**: abre pela faixa, pela capa, pela busca global e
  pelo carrossel; o endereço aberto direto (link copiado) carrega a página; o
  título vai para a aba do navegador; a aba da origem fica marcada; "Voltar
  para a lista" e o botão Voltar do navegador funcionam. Rascunho e endereço
  inexistente mostram aviso com link para a lista. `#central/newsletter` (link
  antigo) leva a "Todos".
- **Capa**: três colunas de 435 px em 1440 e 308 em 1024; empilham no celular.
  Título na cor da origem; destaque com o título sobre a imagem; sem imagem, o
  destaque é a cor da origem. Miniaturas de 128 px (96 entre 860 e 1100 px).
- **Selo cheio** nos cartões de Documentos: 17,6 px de altura, cartão com a
  mesma altura de antes (140 px em 1024).
- **Contraste** (`contraste.js`): `OK` na capa, na lista e na página, nas
  larguras testadas. Nenhum estouro horizontal, nenhum erro no console. Perfil
  Gerência: Painel Editorial com os 16 registros.

## Remoção dos dados ilustrativos — 21/09/2026

- **Saíram** (aprovado pelo usuário): 3 avisos, 5 publicações da Newsletter e
  8 notícias de exemplo, 5 processos, 6 entregas, 3 eventos de agenda, os 4
  indicadores do Painel, o `resumo` e a semana fixa do `config.json`, as
  empresas "(exemplo)" das equipes, os perfis fictícios Marina Oliveira e Ana
  Martins e o avatar `assets/users/2026001.svg`. Uma nova varredura por
  "demonstrativo/exemplo/ilustrativo" nos dados só encontra falsos positivos
  (texto alternativo "Ilustração do…", "Demonstrações financeiras").
- **Capa**: "Nenhum aviso vigente"; Comunicação com ProjectHub
  (Contabilidade), tarifas da ANEEL (Externo) e "Nenhum comunicado de
  Equatorial por enquanto"; rodapé "Atualização da base: 14/09/2026", sem a
  marca de dados ilustrativos.
- **Perfil Eduardo**: vê o menu Administração e o botão "Trocar imagem" nos
  cartões; a janela pede o código de acesso, como antes.
- **Perfil Alexandra (Gerência)**: Painel, Processos, Agenda e Entregas mostram
  "Nenhum … cadastrado ainda"; Alertas da gerência diz "Nenhum ponto de
  atenção em processos e entregas"; Painel Editorial com os 3 registros
  restantes. Contraste `OK`, sem erro no console.

## Comunicados da Comunicação Equatorial — 21/09/2026

- 6 comunicados novos em `data/noticias.json`, origem Equatorial, publicados:
  a aba Equatorial mostra 6, com filtro de Categoria (Ética e compliance,
  Inovação, SAP, Segurança da informação). A coluna Equatorial da capa tem
  destaque (segurança digital) e 4 itens, todos com imagem, nenhuma quebrada.
- Peças verticais usam o recorte `imagemCapa` na lista e na capa; a página do
  MigraSAP mostra a peça inteira (794×945) e o botão "Responder ao quiz", que
  leva ao link tirado do QR Code (sem rastreador).
- Ficha: fonte da Comunicação com a data do e-mail, área responsável e
  "Aprovado por Eduardo dos Santos Rocha". Contraste `OK`, sem erro no console.

## Página do comunicado em duas colunas — 21/09/2026

- 1900 px: texto e ficha à esquerda (894 px), peça à direita (652×918,
  limitada à altura da janela); a página termina em ~1.350 px, antes passava
  de 2.200.
- 1440 px: coluna de 662 px + peça de 601 px; imagem horizontal (Código de
  Ética) ocupa a coluna toda (601×339).
- 1024 px e 375 px: uma coluna, imagem logo após o título (cartaz limitado a
  70% da altura da tela). Sem estouro, contraste `OK`, console limpo.

## Carrossel: molde novo e gestão — 21/09/2026

- **Clique**: `elementFromPoint` no título, no resumo e na imagem cai no link do
  slide; setas, pausa e bolinhas continuam por cima. Clicar no título abriu o
  comunicado.
- **Slides**: 6 no ar, com destinos certos (2 comunicados abrem no portal; 4
  sistemas abrem em outra aba). Cronograma e Auditoria com fundo desenhado e
  duas imagens; IFRS 16 no azul do molde com o notebook. 1361×353 em 1440;
  300 px de altura mínima em ~930; empilhado em 375, sem estouro. Contraste
  `OK`, console limpo.
- **Gestão com o servidor** (`server.js` numa cópia de `data/`, removida
  depois): "Destacar no carrossel" num comunicado → formulário com destino
  travado, datas de hoje a +30 dias e prévia → gravou só destino, agenda,
  posição e subtítulo; bloco do comunicado passou a "No ar · posição 2".
  Aba Carrossel: lista por situação, aviso de 7 no ar, Subir renumerou a fila
  1–7 e a capa acompanhou; "Encerrar agora" e "Excluir" funcionaram. Ficha de
  portal abre o formulário com o destino travado (slide sem imagens, abre em
  outra aba). Endereço livre sem título é recusado.
- **Sem servidor**: o formulário abre com prévia e o botão Salvar desativado,
  com a explicação.

## Carrossel: 2ª leva dos moldes e formato "imagem" — 21/09/2026

- **Moldes**: `moldes-destaques.py` gerou fundo + cena de Cronograma e
  Auditoria e só a cena do IFRS 16 (fundo VectorStock bloqueado). Cenas
  sobrepostas ao fundo conferem com o SVG renderizado (posições do Figma,
  sombra do painel da Auditoria, X claro sobre o "antes" do Cronograma).
- **Formato imagem** (ProjectHub, tarifas ANEEL, Controle de Horas): imagem na
  altura toda e encostada na borda em 1440 e 1024 (zona 628 px e 513 px); no
  celular, imagem em cima na largura toda, desfazendo-se para baixo.
- **Contraste sobre o fundo real**: página de teste fora do projeto com os
  slides empilhados, Edge headless (`--incognito`: sem cache, senão ele usa o
  CSS velho), fundo fotografado sem o texto, cada linha de texto contra o p95
  dos pixels. Tudo ≥ 4,5:1 (título ≥ 3:1) em 1440, 1024 e 375; pior caso
  4,8:1. Antes do ajuste: luz de canto derrubava o apoio para 3,8:1; o fundo
  do Cronograma deixava a área a 1,7:1 e o título a 2,7:1 (já era assim no
  molde; corrigido com o halo).
- **Formulário**: campo Formato alterna a prévia entre `formato-imagem` e
  `formato-molde`; texto da prévia agora branco/cinza-claro com margem zero
  (antes, `#dialog-body p` o deixava cinza-escuro sobre o azul).
- **Console** limpo; perfil Eduardo mantido.
- **Limite da ferramenta**: o painel do navegador devolveu imagem congelada no
  modo celular e com a janela aberta (o DOM estava certo); a conferência visual
  foi feita pela página de teste no Edge headless.

## Lápis, abas Todos e Power BI, agenda na capa, comunicado do CFC, arte do IFRS — 21/09/2026

- **Lápis**: para o perfil de administração, botão redondo de 28 px a 7 px do
  canto de cima da imagem (`aria-label` "Trocar imagem de <título>"); não
  cobre mais a arte.
- **Portais e Links**: abas Todos · Contabilidade · Equatorial · Portal de
  Serviços · Gente e Gestão · Power BI · Externos. Todos = 33 acessos, todos
  com selo; filtro Origem (Externo = 6). Power BI = só o BI - Gastos
  Gerenciáveis, sem filtro de grupo (um grupo só); ele saiu da aba Equatorial
  (4). **Sistemas e automações → Todos** = 18 itens, com filtro Origem.
- **Avisos**: a "RR Gerência Contabilidade" (25/09, 08:30–15:30) aparece em
  primeiro, com a folhinha do dia (sem quem organiza, a pedido do usuário); a
  ficha mostra data, horário, local "Não informado no convite" e "O convite não traz link de reunião"; o
  `.ics` sai 11:30Z–18:30Z, sem convidados, com linhas dobradas (RFC 5545).
- **Comunicado do CFC** (Externo, IA): lista Externo com 2 comunicados; a
  página tem capa, 5 intertítulos, 1 figura com legenda (duas imagens do Gemini no total, a pedido do usuário; crédito na ficha), botão "Ler o artigo
  no site do CFC"; nenhuma marca `##`/`[figura]` aparece na página nem na faixa.
- **Página do comunicado em formato de jornal** (1880 px): texto justificado
  (16 px) na largura toda; capa flutuando à direita (850×479) e figuras de
  850 px alternando lados, cada uma abaixo da anterior; nenhuma linha espremida
  entre imagens (com 46% havia uma linha só com "•" — 49% resolveu); rodapé
  com a ficha e "Mais comunicados" (4) lado a lado. Em 375: nada flutua,
  figura de 305 px, rodapé numa coluna, sem rolagem lateral.
- **Capa, colunas**: os itens menores mostram o subtítulo (texto de 60–78 px
  ao lado da miniatura de 112 px).
- **IFRS 16**: cartão refeito da tela de entrada nova; slide com fundo novo —
  contraste do texto 7,6–12,5:1 em 1440 e 7,2–9,7:1 no celular
  (`carrossel-teste/contraste.py`).
- `contraste.js` "OK" na capa, em Portais → Todos e na página do comunicado;
  sem rolagem lateral em 375; console limpo.
- **Acesso ao IFRS por esta máquina**: o firewall da rede (FortiGuard)
  bloqueia `arrendamento.contabilidade-eqtl.com` ("Unrated") e re-assina o
  certificado; os insumos vieram do Chrome do usuário e da página salva em
  `projeto/equatorial-links/`.

## Cabeçalho, capa e realce da Comunicação — 21/09/2026 (noite)

- **Fio no cabeçalho**: com a janela mais larga que a foto (747 px), a borda
  dela aparecia como uma linha vertical. Edge headless a 1513 px/125% e
  1891 px/100%: o degrau na borda caiu de 11–19 para 0–2 tons.
- **Capa**: no máximo 4 comunicados por origem — Equatorial 4 (antes 5),
  Externo 2 (o do CFC como destaque), Contabilidade 1. Conferido também no
  Chrome do usuário (1536 px, 125%).
- **Faixa de abas**: nome da seção, busca e lista na mesma coluna — 51 px em
  1440 e no Chrome do usuário, 41 px em 1024, 29 px em 375.
- **Realce**: abas de origem com `data-origem` (Todos sem); em Externo, fio,
  véu e texto roxos; em Portais → Todos, fio de 71 px na aba ativa em
  `--azul-marca`. Faixa sob o mouse: borda na cor da origem, sombra média,
  imagem em `scale(1.04)`, título sublinhado, fio de 154 px sob "Ler
  comunicado completo". Pelo teclado (Tab a partir de "Limpar filtros"), o
  anel de 3 px contorna a faixa inteira. Sem rolagem lateral; console limpo.

## Capa com a Comunicação à vista — 21/09/2026 (noite)

Medido com Playwright (Chromium, perfil Visitante): altura do carrossel e da
coluna lateral, e onde começam o título das colunas e as imagens da
Comunicação. Antes, a Comunicação começava em 780 px (1366×657), 824 px
(1536×730) e 923 px (1920×950) — sempre abaixo da tela.

| Tela | Carrossel | Coluna lateral | Títulos das colunas | Imagens |
|---|---|---|---|---|
| 1280×593 | 823×336 | 365×336 | 537 | 573 |
| 1366×657 | 883×336 | 391×336 | 537 | 573 |
| 1536×730 | 1002×336 | 442×336 | 537 | 573 |
| 1920×911 | 1312×419 | 500×419 | 623 | 659 |

- Bases do carrossel e da coluna alinhadas em todas; sem rolagem lateral;
  console limpo. 1199 e 1024 px: capa empilhada como antes; 375 px igual.
- Slides na geometria nova: nenhum texto sai do slide; contraste mínimo
  4,8:1 (p95 do fundo real, texto escondido). Reticências só onde já havia
  limite: descrição do Portal de Auditoria (3 linhas) e subtítulo do Controle
  de Horas em 1366 (2 linhas).
- Faixa de título "Comunicação" e "Ver todos os comunicados" removidas; o h2
  continua para leitor de tela (`.sr-only`).

## Comunicados tirados dos e-mails — 21/09/2026 (noite)

Dois e-mails de `projeto/comunicados-emails/`, os dois com origem
Contabilidade (a Movimentação por decisão do usuário):

- **IFRS 16 — novas melhorias** (`newsletter.json`,
  `n7-ifrs16-abertura-rit-nova-cara`, 21/09): texto do e-mail com os três
  negritos, a peça anexa (1672×941) no topo, que abre inteira ao clicar, e
  "Acessar IFRS 16 / CPC 06" pelo `sistemaId`. Vira o destaque da coluna
  Contabilidade na capa.
- **Movimentação da Diretoria de Controladoria** (`noticias.json`,
  `interno-movimentacao-controladoria-2026-05`, 14/05): 9 perfis, cada um
  com a foto recortada do e-mail (168 px em 1366 e 1024; 96 px em 375), 36
  negritos, banner "Carreira Equatorial" no topo e recorte 16:9 na lista.
  Pela data, entra no fim da lista.
- Playwright em 1366, 1024 e 375: nenhuma marca `**` à mostra, nenhuma imagem
  quebrada, sem rolagem lateral, console limpo.
- **Capa da Movimentação** (pedido do usuário): Alexandra à esquerda e os 4
  executivos da Contabilidade em quadros 2×2. Página (613×346 em 1366) e faixa
  larga mostram a composição inteira; com `imagemFoco: "esquerda"`, a
  miniatura da capa (128×112) mostra a Alexandra e a 1ª coluna de quadros, e
  a faixa do celular (104×176), a Alexandra inteira. Console limpo.
- **Miniatura 8:7 da Movimentação** (`imagemMiniatura`, 480×420): na capa e em
  "Mais comunicados" (página do IFRS 16), em 1366 e 375, as cinco pessoas
  aparecem inteiras no quadro de 128×112; o `imagemFoco` não entra ali.

## Busca do cabeçalho com sugestões — 22/09/2026

Pedido do usuário: a busca "não está funcionando" e, ao digitar, deve aparecer
a lista de sugestões abaixo. Causa: os resultados apareciam abaixo do
carrossel (a 537 px de uma janela de 657) e cada registro era comparado como
JSON inteiro. Conferido com Playwright (Chromium), perfil Visitante e perfil
identificado:

- **Sugestões** (1366 px): 1 letra não abre; "sap" → SAP e SAP HANA (atalhos),
  Fechamento SAP (automação), SAP — solicitações (Portal de Serviços), MigraSAP
  e ProjectHub (comunicados), "Ver todos os 10 resultados"; "power bi" → o
  portal, o BI - Gastos Gerenciáveis e a página Portais e Links › Power BI;
  "fb03" → Print em Lote de Documentos (FB03); "cpc 06" → o sistema e o
  comunicado do IFRS 16; "link" caiu de 59 para 8; "xyzw" → mensagem com o que
  dá para buscar.
- **Teclado e ARIA**: `role="combobox"`, `aria-expanded`, `aria-controls`,
  `aria-activedescendant` seguindo as setas; Esc fecha; status "N resultados"
  para leitor de tela. Enter numa sugestão externa abre a nova aba (SAP HANA);
  clique idem (Snowflake).
- **Destinos**: comunicado abre a página dele; página do portal abre com a aba
  certa; Enter sem escolha → `#busca/ifrs` ("5 resultados", grupos Portais e
  Links, Documentos & Normas e Comunicação); filtro "Onde" = Comunicação → 3;
  Voltar do navegador retorna à busca; `#busca/transação SAP` aberto direto
  preenche o campo.
- **Perfil identificado** (Ana Laura, equipe da Contabilidade): "alexandra"
  traz a pessoa (Pessoas) e o comunicado da Movimentação. Visitante não vê
  Pessoas (sem a capacidade `time`).
- **375 px**: a caixa ocupa a largura do campo (16–359 px), sem rolagem
  lateral; console limpo em todos os passos.

## BMP e RIT nos Externos — 22/09/2026

- **Cartão** "BMP e RIT - Envio e Consulta" em Portais e Links › Externos (7
  cartões), rótulo "Setor elétrico", domínio `bmp2.aneel.gov.br` no rodapé;
  Acessar abre `http://bmp2.aneel.gov.br/UploadRit.aspx`. Ficha do "i" com a
  descrição e a observação (acesso do agente, XML, Irregular/Inadimplente).
- **Arte** (`assets/externos/bmp-rit.svg`, `arte_bmp.py`): a tela do sistema —
  barra do governo, cabeçalho listrado "BMP / Balancete Mensal Padronizado",
  abas de canto chanfrado e a faixa "RIT / Relatório de Informações
  Trimestrais"; carrega em 1366 e 375 px. A identificação de quem estava logado
  no Chrome do usuário não entrou.
- Busca do cabeçalho: "rit" sugere o cartão; console limpo.

## Claude nos Externos — 22/09/2026

- **Cartão** "Claude" em Portais e Links › Externos (8 cartões), grupo
  "Inteligência artificial", ao lado do ChatGPT e do Gemini; Acessar abre
  `https://claude.ai/`; ficha com a mesma observação dos outros assistentes
  (ferramenta pública, nada sigiloso).
- **Arte** no modo marca (`assets/externos/claude.svg`): a logo oficial da
  tela de entrada do claude.ai — o SVG lido do DOM, conferido por soma dos
  traçados (1938 e 5802 caracteres, iguais ao site) — sobre o fundo medido
  `#fcfcfb`. A foto e o slogan da tela ficaram de fora.
- Busca do cabeçalho: "claude" sugere o cartão; console limpo.

## Links das imagens nos comunicados de e-mail — 22/09/2026

Regra do usuário: o link que a imagem traz no e-mail fica embutido nela e
também disponível na Comunicação. Conferido com Playwright em 1366 px:

- **MigraSAP Verdade ou Mentira**: 3 trechos por cima da peça — o botão
  "Clique aqui na 4ª rodada" (378×45) e o QR Code (151×147) levam ao quiz; o
  e-mail do rodapé abre `mailto:proj.migrasap@…`. Botões: "Responder ao quiz"
  (um só, embora dois trechos levem a ele) e o do e-mail. Passar o mouse
  contorna os trechos; sobre o QR Code, véu azul.
- **Agentes da Inovação**: o e-mail da peça (260×32) e o botão
  `mailto:agentesdainovacao@eqtlab.com.br`.
- **IFRS 16**: no e-mail a peça inteira era link para o sistema — a imagem
  leva a `arrendamento.contabilidade-eqtl.com`, a lupa do canto amplia, e o
  botão fica só o "Acessar IFRS 16 / CPC 06" (sem repetir).
- **Segurança digital** e **Movimentação**: peça sem link, imagem como antes.
- `msgread.py` nos e-mails de `projeto/modelos-emails`: aponta a imagem com
  link direto do IFRS 16 e marca como rastreador as do MigraSAP, do Engaja+ e
  dos boletins de Goiás. Console limpo.

## Três comunicados do MigraSAP — 22/09/2026

E-mails da Comunicação Grupo Equatorial de 10, 17 e 18/09 (peças baixadas com
autorização do usuário), origem Equatorial. Conferido com Playwright em 1366 e
375 px:

- **Aba Equatorial** com 6, em ordem de data: Tipo de Movimento (18/09),
  Segurança digital e Sociedade Parceira (17/09), Agentes da Inovação,
  Replanejamento (10/09) e Verdade ou Mentira. Na capa, o destaque da coluna
  Equatorial é o Tipo de Movimento.
- **Replanejamento do Go Live**: texto sem figuras; o e-mail do rodapé da peça
  é um trecho clicável (289×28 em 1366) e um botão.
- **Sociedade Parceira** e **Tipo de Movimento**: 3 intertítulos cada, 2 telas
  do SAP como figuras com legenda, nenhum `**` à mostra. Peça longa
  (`cartaz-alto`): as telas ficam logo depois do parágrafo que as chama, ao
  lado da peça (em 1366, 649 px de largura a partir da margem do texto).
- Botão "Dúvidas: proj.migrasap@…" nos três; sem rolagem lateral; console
  limpo. O trecho do e-mail na peça longa encolhe com ela (103×10 em 1366) —
  o botão logo abaixo leva ao mesmo endereço.

## Limites e checklist para homologação corporativa

Não houve navegação nos sistemas reais, pois seus endereços não foram fornecidos. Downloads foram validados pelo destino HTTP e atributo de download; o fluxo de salvamento do navegador não foi homologado separadamente. Pausa por hover, preferência de movimento, navegação completa por teclado, zoom de 200% e políticas específicas de Chrome/Edge devem integrar a homologação corporativa. A implementação desses comportamentos está no código, mas não se declara aqui uma certificação de acessibilidade.

Todos os conteúdos e indicadores são demonstrativos. Validar documentos, datas, contagens, responsáveis e URLs com a Gerência antes do uso operacional.
