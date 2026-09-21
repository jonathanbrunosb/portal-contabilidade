# Itens Resolvidos — Portal da Gerência de Contabilidade

> **Ledger acumulativo de pendências/tarefas concluídas.** Mais recente no topo. Cada entrada registra o que era o problema, a solução e os detalhes técnicos, para que seja possível reconstruir o que houve sem o chat original. O estado **atual e em aberto** vive em `PROJETO_ESTADO_ATUAL.md`.

---

## 2026-09-21

> O trabalho deste dia foi commitado **por assunto** na branch `ajustes-frontend-dudu` (`59832ff`..`8e7b0ef` + o commit do checkpoint), sem push.

### Commit por assunto e separação do dia em commits
- **Era:** o usuário pediu o checkpoint e que o projeto passe a "fazer commits sempre de acordo com os temas e assuntos". O dia inteiro (~12 assuntos, 59 arquivos) estava sem commit sobre `6b6273c`, e a regra antiga era "nada de commit sem o usuário pedir".
- **Solução:** regra nova em `.claude/CLAUDE.md` (lida em toda sessão; fica fora do Pages porque o workflow apaga `.claude`): cada assunto pronto e verificado vira um commit feito pelo Claude, com a documentação dele; nada na `main`; push só a pedido. Repetida na skill `portal-corporativo` (passo 6 e checklist), no `00-estado` e na memória (`commit-por-assunto`). O acumulado do dia foi separado em 16 commits por assunto + o do checkpoint.
- **Detalhes técnicos:** script de scratchpad (`dividir.py` + `mapa.json`): `difflib` compara cada arquivo com `6b6273c` (base **fixa** — com `HEAD` a numeração dos trechos mudava a cada commit e os 3 primeiros saíram errados; foram desfeitos com `git reset 6b6273c`, sem tocar no disco), cada trecho recebe um assunto, blocos mistos são repartidos (`cortes` por linha, `pares` linha a linha nos imports do `app.js`, `ajustes` com o texto de antes para trechos de assunto posterior dentro de trecho de assunto anterior — ex.: o realce dentro do CSS da Comunicação, o IFRS dentro do `destaques.json`). Cada estágio grava blobs LF com `git hash-object --no-filters` + `git update-index --cacheinfo`. Conferido: aplicar tudo = arquivos em disco; cada estágio com JSON válido, `node --check` no JS e chaves do CSS balanceadas. `js/newsletter.js` e a documentação do dia não se separam (reescritos ao longo do dia): o primeiro foi inteiro no commit da Comunicação; a documentação, no do checkpoint.
- **Verificação:** `git log 6b6273c..HEAD` com um commit por assunto; `git status` limpo depois do checkpoint.

### Capa: Comunicação aparece sem rolar
- **Era:** na maioria dos monitores a Comunicação só aparecia rolando (começava em 780–923 px). O usuário pensou em baixar o carrossel; recusou mexer na estrutura da Comunicação e pediu para tirar a faixa de título "Comunicação".
- **Solução:** a partir de 1200 px, Avisos e Acesso rápido numa coluna ao lado do carrossel; carrossel medido pela altura da janela; faixa de título e "Ver todos os comunicados" removidas (h2 só para leitor de tela). A Comunicação continua em três colunas na largura toda.
- **Detalhes técnicos:** `@media(min-width:1200px)` depois das regras de `.acesso` em `css/styles.css`: `.home-top` em grade `minmax(0,1fr) clamp(360px,30%,500px)`; `.dq` flex coluna e `.dqb{flex:1; aspect-ratio:auto; min-height:clamp(300px,46vh,420px)}` (estica se a coluna for mais alta); `.formato-imagem{--zona:min(50cqw,…)}`; `.dqb-titulo` com 3 linhas; `.home-side` flex coluna `space-between`; links do Acesso rápido com `padding:6px 4px; line-height:1.2`. `index.html`: `<h2 class="sr-only" id="news-title">`. Regras `.home-comunicacao-topo` removidas. Versão `20260921-46`. Só baixar o carrossel foi descartado: em 1536×730 ele teria de ter ~115 px. As capturas foram feitas com Playwright escolhendo "Visitante" — gravar a identidade no `localStorage` foi barrado pelo classificador de permissões e não foi contornado.
- **Verificação:** TESTES.md, "Capa com a Comunicação à vista".

### Realce nas abas e nos comunicados; 4 por origem na capa
- **Era:** o nome da seção encostava na borda da faixa de abas; o usuário pediu efeitos de realce nas abas e nos itens da Comunicação, com um "toque profissional e diferente" (passada do `/impeccable polish`), e que a capa mostrasse sempre os 4 últimos de cada origem.
- **Solução:** recuo do nome igual ao respiro do painel; realce que desliza nas abas (fio + véu), na cor da origem nas abas da Comunicação; nas faixas, borda na cor da origem, imagem aproximando, sublinhado suave e anel de foco na faixa inteira; o mesmo nas colunas da capa. Capa: `.slice(0,4)` por origem antes de escolher o destaque.
- **Detalhes técnicos:** tokens `--ease-saida`, `--dur-estado`, `--dur-imagem`, `--respiro-painel` (18/14 px, também usado em `#page-view #content-view`); `.pg-line` com `::before` (fio) e `::after` (véu com `mask-image`), cor via `color` + `currentColor`; `renderSubnav()` põe `data-origem` nas abas `comunicacao-*` e `moverLinha()` copia para a linha; texto das abas de `--azul-ativo` para `--azul-marca` (contraste sobre o véu 4,1 → 6,2); `colunasOrigem()` com `POR_COLUNA=4`. Versão `20260921-42`. Ver `03-sistema-visual.md` ("Realce dos comunicados e das abas").
- **Por que o comunicado de IA "não aparecia":** no Chrome do usuário ele já era o destaque da coluna Externo quando conferido; provavelmente a página estava aberta desde antes do cadastro.
- **Verificação:** TESTES.md, seção "Cabeçalho, capa e realce da Comunicação".

### Fio vertical no cabeçalho, entre o fundo sólido e a foto
- **Era:** no Chrome do usuário (janela larga, Windows a 125%) aparecia uma divisão onde a foto do cabeçalho começa; no painel do Claude, estreito, a foto cobre a largura toda e o fio não aparece.
- **Solução:** a borda esquerda da foto agora se dissolve no fundo.
- **Detalhes técnicos:** a foto (`portal-gerencia-contabilidade.webp`, 1672×940 exibida a `auto 420px` = 747 px) é mais escura que `--marinho-escuro` na borda — degrau de 11 a 19 tons medido. Em `.ph`, uma camada nova entre o degradê e a foto, do tamanho exato dela (`--ph-foto-largura: calc(420px * 1672 / 940)`), vai de `--marinho-escuro` a transparente em 45% da largura. Se trocar a foto, atualize as duas medidas nesse `calc`.
- **Verificação:** Edge headless a 1513 px/125% e 1891 px/100% — degrau caiu para 0 a 2 tons; console limpo; versão `20260921-39`.

### Página do comunicado em formato de jornal + subtítulo na capa
- **Era:** a página do comunicado deixava tela vazia à direita; o usuário pediu o formato de jornal (texto justificado contornando imagens com `float`). Na capa, os itens menores tinham só o título.
- **Solução:** texto na largura toda, justificado com hifenização; capa flutuando à direita, figuras alternando lados; abaixo, ações + ficha + "Mais comunicados" lado a lado. Subtítulo (`resumo`) abaixo do título nos itens das colunas da capa.
- **Detalhes técnicos:** `paginaComunicado()` monta `.comunicado-materia` (flow-root) + `.comunicado-rodape`; `figuraHTML(figura,n)` com `flutua-esquerda|direita` e link para a imagem inteira; app.js acrescenta `.comunicado-relacionados` (exporta `itemDaColuna`) e o bloco do carrossel na ficha. CSS: floats a 49% com `clear:both` — com 46% ficava uma fresta de ~70 px entre duas imagens e uma linha com uma palavra; corpo `--fs-lg` acima de 1300 px; sem float até 760 px. Duas versões anteriores recusadas (coluna de 800 px; texto e imagens em colunas separadas).
- **Verificação:** medido em 1880 e 375 px (ver TESTES.md).

### Lápis, abas Todos e Power BI, agenda em Avisos, comunicado do CFC, arte do IFRS 16
- **Era:** "Trocar imagem" cobria a arte; faltavam as abas Todos e Power BI; o usuário queria a reunião do Outlook em Avisos, um comunicado do artigo do CFC e a arte do IFRS coerente com a tela de entrada nova.
- **Solução:** lápis no canto da imagem; `telaTodos()` nas duas seções; aba Power BI com o BI - Gastos Gerenciáveis; `agenda.json` com `naCapa` → linha de calendário em Avisos (sem organizador, a pedido) e `.ics` sem convidados; comunicado Externo/IA do CFC com resumo próprio, 5 intertítulos e figuras; `arte_arrendamento.py` para o cartão e o fundo do slide.
- **Detalhes técnicos:** ícones `pencil`/`video` em `ui.js`; `seloDe()` nos cartões; `compromissosNaCapa()`, `linhaCompromisso()`, `icsCompromisso()` (RFC 5545, UTC−3), `openCompromisso()`; marcação `##`/`[figura N]` em `newsletter.js`; ilustrações em `assets/images/comunicados/cfc-ia-contabilidade-*.webp` (depois trocadas por 2 imagens do Gemini — capa e risco —, a pedido do usuário: "só umas 2, senão fica muito com cara de IA"; `creditoImagens` na ficha). O site do IFRS é bloqueado pelo firewall nesta máquina: lido pelo Chrome do usuário e pela página salva em `projeto/equatorial-links/`.
- **Verificação:** ver TESTES.md (seção de 21/09 à tarde).

### Carrossel: formato "imagem" com fundo tirado da própria imagem
- **Era:** nos slides comuns (fora dos moldes), a imagem ficava solta no meio de um degradê chapado; o usuário pediu a imagem **na altura toda** e um fundo com efeito, não cor sólida.
- **Solução:** formato `imagem` (padrão): a imagem encosta na borda e ocupa a altura toda (zona 16:9, até 56% da faixa) e se desfaz num fundo que é ela mesma espelhada e desfocada; por cima, as listras finas do molde do Cronograma, a diagonal para a segunda cor do slide e a sombra do canto de fora. No celular, a imagem vai para cima e se desfaz para baixo.
- **Detalhes técnicos:** `slideHTML()` gera `.formato-imagem` + `<img class="dqb-ambiente">`; `resolverDestaque()` devolve `formato`; `.dqb{container-type:size}` (celular: `inline-size`) para `--zona:min(56cqw,100cqh*16/9)`; `:after` com listras, sombra, diagonal e véu (`color-mix` da cor do slide), que firma antes do texto; tokens `--listra-slide`, `--desfoque-ambiente`, `--sombra-canto`. Campo **Formato** no formulário (a imagem secundária vale só no molde). Uma luz de canto clara foi testada e **retirada**: derrubava o texto de apoio para 3,8:1.
- **Verificação:** Edge headless numa página de teste (slides empilhados); contraste medido sobre o fundo real ≥ 4,5:1 em 1440, 1024 e 375.

### Carrossel: 2ª leva dos moldes do Figma e contraste sobre a arte
- **Era:** o usuário trocou os SVGs de `projeto/comunicados` (Cronograma com "antes e depois", Auditoria com texto à esquerda e capturas em alta, IFRS 16 com descrição e fundo novos).
- **Solução:** `.claude/tools/moldes-destaques.py` lê os SVGs e gera `<nome>-fundo.webp` e `<nome>-cena.webp` (peças nas posições do Figma, sobre transparente); os 3 slides viraram `"formato": "molde"` com a cena ocupando a zona das imagens. Nos moldes com fundo próprio, halo escuro atrás do texto e área em branco. A prévia do formulário deixou de pintar o texto de cinza.
- **Detalhes técnicos:** padrões `objectBoundingBox` com o recorte do `use`; sombra de `<g filter>` refeita no PIL; escala 2 quando as capturas vieram grandes (Auditoria). `FUNDOS_BLOQUEADOS` barra o fundo do IFRS 16 (mesma prévia VectorStock, só sem a faixa da marca d'água). `image 6/7` (dúvida anterior) eram o painel em Excel e o X claro do "antes" do Cronograma. 7 imagens antigas de `assets/destaques/` substituídas por 5. CSS: `.formato-molde.com-fundo:after` (`--halo-texto`), `.com-fundo .dqb-rotulo{color:#fff}`, `#dialog-body p:not(.dqb p)`. Ferramenta de medição salva em `.claude/tools/carrossel-teste/` (o `contraste.js` não enxerga imagem; o Edge precisa de `--incognito` para não usar CSS do cache).
- **Verificação:** cenas conferidas contra o SVG renderizado; antes do halo, o Cronograma dava 1,7:1 na área e 2,7:1 no título (já no molde); depois, tudo ≥ 4,5:1 nas três larguras; console limpo.

### Carrossel: slide inteiro clicável
- **Era:** só a metade da imagem do slide respondia ao clique.
- **Solução:** o alvo do clique passou a ficar acima do texto; depois virou um link de verdade (`<a>`), que abre destino externo em outra aba.
- **Detalhes técnicos:** `.dqb-texto` tinha `z-index:1` e cobria o `.dqb-abrir` (`inset:0`, sem z-index). Agora `.dqb-abrir{z-index:2}`; setas, pausa e bolinhas estão fora do trilho em `z-index:3`. `slideHTML()` em `js/carousel.js` gera `<a class="dqb-abrir" data-route>` (interno) ou com `target="_blank"` (externo); sem endereço, `<button>` que chama `openAccess()`.
- **Verificação:** `elementFromPoint` no título/resumo/imagem cai no link; clique no título abriu o comunicado.

### Carrossel: molde do Figma e gestão pela tela
- **Era:** comunicados, links e aplicações precisavam poder ir para o carrossel com configuração (quando, ordem, aparência); o slide precisava seguir o molde do usuário (`projeto/comunicados`, 2000×519).
- **Solução:** cada slide é um registro que **aponta para um destino** e herda dele o que ficar em branco; gestão pela Administração → Carrossel, pelo bloco "Carrossel da capa" do comunicado e pelo "Destacar no carrossel" das fichas, com prévia; os slides de Cronograma, IFRS 16 e Auditoria refeitos no molde com texto em HTML.
- **Detalhes técnicos:** `js/destaques.js` (novo: `alvoDoDestaque`, `resolverDestaque`, `situacaoDestaque`, `destaquesNoAr`, `LIMITE_NO_AR=5`); `js/carousel.js` reescrito (`slideHTML`, `initCarousel` com `AbortController`); `js/app.js` (`renderAdminCarrossel`, `openDestaqueForm`, `moverDestaque`, `aposMudarDestaques`, `botaoDestacar`, `opcoesDoAlvo`, `renderCarrossel`); `data/destaques.json` migrado para `alvo {tipo, ref}` + agenda + campos opcionais; imagens extraídas dos SVGs para `assets/destaques/` (~160 KB); `server/server.js` com `destaques` em `UPLOAD_DIRS`; aba no `index.html` e em `config.json › navegacao`; `fundo-destaques.py` não sobrescreve cor escolhida. O fundo do IFRS 16 do Figma (VectorStock com marca d'água) **não** foi usado.
- **Verificação:** testado com `server.js` numa cópia de `data/`: criar, reordenar (renumera 1..N), encerrar, excluir, validação; sem servidor, só leitura com prévia. AA, sem estouro, console limpo em 1440/~930/375.

### Comunicados da Comunicação Equatorial a partir dos e-mails
- **Era:** a coluna Equatorial da capa estava vazia; `projeto/modelos-emails/` tinha 6 e-mails da Comunicação para aproveitar.
- **Solução:** 6 comunicados de origem Equatorial (segurança digital, Código de Ética nas eleições, Código de Ética e LGPD, MigraSAP 4ª rodada, Agentes da Inovação, 10 cases de inovação aberta), publicados e aprovados por Eduardo.
- **Detalhes técnicos:** `data/noticias.json` (ids `eqtl-*`), imagens em `assets/images/comunicados/` com recorte `imagemCapa` para peças verticais; `midia()` em `js/newsletter.js` usa `imagemCapa||imagem`; `rotuloLink` ("Responder ao quiz"); link do quiz tirado do QR Code com OpenCV; **nenhum link rastreado** (os e-mails usam `app.simplificaci.com.br/dntracker` ligado ao e-mail do destinatário). Categorias novas em `config.json › newsletterCategorias`.
- **Verificação:** aba Equatorial com 6, coluna da capa com destaque + 4, página do MigraSAP com a peça inteira; AA.

### Página do comunicado em duas colunas
- **Era:** a página usava 800 px e empurrava tudo para baixo numa tela larga.
- **Solução:** texto, ações e ficha à esquerda; peça à direita, presa no alto e limitada à altura da janela; uma coluna abaixo de 1100 px.
- **Detalhes técnicos:** `paginaComunicado()` envolve `.comunicado-corpo` > figura + `.comunicado-principal`; CSS `.comunicado-pagina.com-figura .comunicado-corpo{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}`, figura `sticky`, `img{max-height:calc(100vh - 32px)}`.
- **Verificação:** 1900 px — página caiu de ~2.200 para ~1.350 px de altura; 1440/1024/375 sem estouro.

### Remoção dos dados ilustrativos e perfis de administração
- **Era:** a base misturava dados de exemplo com dados reais.
- **Solução:** removidos avisos, 13 comunicados de exemplo, processos, entregas, agenda, KPIs, `resumo`, semana fixa, marca "Dados ilustrativos", empresas "(exemplo)", perfis Marina Oliveira e Ana Martins e `assets/users/2026001.svg`; Painel com estados vazios; Jonathan e Eduardo com `administracao`.
- **Detalhes técnicos:** `data/usuarios.json` agora usa o mesmo `id` de `equipes.json` (a `identifyUser()` em `js/auth.js` procura `usuarios` primeiro); `renderDashboard()` com mensagens vazias; `renderPeriod()` sem semana; alertas da gerência sem "base demonstrativa". Achado: as 4 ilustrações de `assets/sistemas/*.webp` **estavam em uso** no carrossel (a nota dizia o contrário) — corrigido na nota.
- **Verificação:** varredura por "demonstrativo/exemplo/ilustrativo" só com falsos positivos; perfil Alexandra com Painel vazio e AA.

### Comunicação refeita e capa em três colunas
- **Era:** Newsletter e Notícias eram páginas separadas com cartões antigos; a capa tinha uma lista "Comunicação recente".
- **Solução:** lista única com abas por origem, uma faixa por comunicado, página própria com endereço; capa com três colunas por origem no formato da CNN Brasil; paleta das origens e selo cheio.
- **Detalhes técnicos:** `js/newsletter.js` reescrito (`comunicados`, `faixaComunicado`, `paginaComunicado`, `colunasOrigem`); `js/app.js` (`renderListaComunicacao`, `renderPaginaComunicado`, rotas `#central/comunicacao[-origem]` e `#central/comunicado/<col>/<id>`, compatibilidade com `#central/newsletter|noticias`); `config.json` com 4 abas; CSS antigo de notícias removido. Duplicata do ProjectHub exibida uma vez só.
- **Verificação:** abas, faixas, página, busca, carrossel e voltar do navegador testados; AA em 1440/1024/375.

### Origem do conteúdo e filtros
- **Era:** era preciso segregar todo o conteúdo em Contabilidade / Equatorial / Externo.
- **Solução:** campo `origem` em 11 arquivos de `data/`; filtro Origem (hoje em Documentos → Todos e na busca global), selo nas telas que misturam origens, linha "Origem" em toda ficha; busca global ampliada para portais, externos, automações e atalhos; filtro de grupo de Documentos removido ("filtro não repete aba"); duplicatas Cronograma/Auditoria/Outros saíram dos atalhos Equatorial e suas artes foram apagadas.
- **Detalhes técnicos:** `ORIGENS`/`seloOrigem`/`opcoesOrigem` em `js/ui.js`; `origemDe`, `filtroOrigem`, `BUSCA_COLECOES`, `registrosDaBusca`, `docGrupo`/`documentosDaAba` em `js/app.js`; `arte-marcas.py` sem as 2 receitas.
- **Verificação:** contagens por origem conferidas; cartão com selo mantém a altura (146 px em 1440, 140 em 1024).

### Continuar o trabalho nesta máquina
- **Era:** o projeto vinha de outra máquina, com a branch `ajustes-frontend-dudu` e material fora do Git.
- **Solução:** clone + `git switch ajustes-frontend-dudu`; pull do commit `6b6273c`; zip da outra máquina redistribuído (`projeto/`, 8 skills de terceiros em `.claude/skills/`, `skills-lock.json`, memória do Claude); zip movido para `Downloads`.
- **Detalhes técnicos:** `git status` limpo após a cópia (tudo coberto pelo `.gitignore`); o gerador `arte-marcas.py` reproduziu as 62 artes (diferenças só de quebra de linha e compressão do Pillow).
