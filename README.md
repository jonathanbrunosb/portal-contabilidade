# Portal da Gerência de Contabilidade

Portal corporativo local em HTML5, CSS3 e JavaScript Vanilla. Não precisa de Node.js, npm, frameworks, CDN, banco de dados ou serviços em nuvem para funcionar: por padrão, o servidor HTTP apenas entrega arquivos e todo o conteúdo vem de `data/*.json`, sem backend algum. Há, opcionalmente, um backend leve em Node.js (`server/server.js`, ver "Backend opcional") para quem quiser dados vivos e um registro de auditoria — ele continua lendo e escrevendo os mesmos JSONs, e o portal funciona exatamente igual sem ele.

## Executar

1. Extraia a pasta `portal-contabilidade` por completo.
2. Se já possui Python 3, dê dois cliques em `INICIAR.cmd`. Alternativamente, abra um terminal nesta pasta e execute:

   ```powershell
   python -m http.server 5500 --bind 127.0.0.1
   ```

3. Abra [http://localhost:5500/](http://localhost:5500/) no Chrome ou Edge e escolha seu nome no diálogo "Quem é você?" que aparece no primeiro acesso.
4. Mantenha o terminal aberto enquanto usa o portal. Para encerrar, pressione `Ctrl+C`.

Python é apenas uma opção de servidor estático. Você pode usar qualquer servidor de arquivos corporativo já disponível, inclusive Live Server ou IIS configurado para arquivos estáticos e JSON. Não há etapa de build. Se a porta 5500 estiver ocupada, encerre seu servidor anterior ou escolha outra porta no comando e na URL. O servidor criado durante a implementação pode já estar atendendo a porta 5500.

Não abra `index.html` por duplo clique: o protocolo `file://` bloqueia os módulos e/ou o carregamento dos JSONs. A execução suportada é HTTP em localhost. O vínculo `127.0.0.1` permite somente acesso no próprio computador. O teste de celular foi realizado por viewport, sem expor o portal na rede.

## Publicação (GitHub Pages)

O portal é publicado automaticamente pelo workflow `.github/workflows/pages.yml` a cada push em `main`, via GitHub Actions (`actions/deploy-pages`) — sem etapa de build, o conteúdo do repositório é servido como está.

**Domínio próprio:** `portal.contabilidade-eqtl.com`, definido pelo arquivo `CNAME` na raiz do repositório. Para o domínio funcionar de fato, dois passos fora do repositório são necessários (não automatizáveis por aqui):

1. **DNS**: no provedor do domínio `contabilidade-eqtl.com`, criar um registro **CNAME** para o subdomínio `portal` apontando para `jonathanbrunosb.github.io` (não usar registro `A`).
2. **GitHub**: em Settings → Pages do repositório, confirmar que o domínio customizado aparece verificado (pode levar alguns minutos a algumas horas após a propagação do DNS) e habilitar "Enforce HTTPS" assim que a opção estiver disponível.

Enquanto o DNS não propaga, o portal continua acessível pela URL padrão `https://jonathanbrunosb.github.io/portal-contabilidade/`.

## Estrutura

```text
portal-contabilidade/
├── index.html
├── INICIAR.cmd
├── README.md
├── TESTES.md
├── css/
│   └── styles.css
├── js/
│   ├── app.js                 # Composição das telas, catálogo, busca e eventos
│   ├── analytics.js           # Registro local de uso (abas, buscas, acessos, downloads)
│   ├── auth.js                # Identificação por seleção de nome e perfis de acesso
│   ├── data-service.js        # Carregamento das bases, futuro adaptador de API
│   ├── carousel.js            # Carrossel de destaques da capa
│   ├── navigation.js          # Menu do cabeçalho, submenus, menu do usuário e tabs por teclado
│   ├── newsletter.js          # Comunicação: lista, página de cada comunicado e colunas da capa
│   ├── teams.js               # Janela do organograma e expansão das equipes
│   └── ui.js                  # Ícones, escape de texto, URLs e diálogos
├── server/
│   └── server.js              # Backend opcional (Fase 2) — API viva sobre os mesmos JSONs
├── data/
│   ├── config.json            # Indicadores do Painel, menu, navegação e atalhos corporativos
│   ├── usuarios.json
│   ├── newsletter.json
│   ├── noticias.json
│   ├── equipes.json
│   ├── processos.json
│   ├── sistemas.json
│   ├── documentos.json
│   ├── agenda.json
│   ├── entregas.json
│   ├── destaques.json         # Carrossel da capa
│   └── avisos.json            # Avisos da capa (Extra, Prazo, Info)
└── assets/
    ├── logos/portal.svg
    └── users/                 # Fotos da equipe, avatar padrão e avatar de visitante
```

## Editar os conteúdos

Edite os JSONs em UTF-8, mantenha a sintaxe válida e atualize o navegador. Os arquivos são carregados com `cache: no-cache`. Não há formulário de cadastro nesta versão. IDs precisam ser únicos dentro de cada coleção e não devem conter `:`.

| Conteúdo | Onde alterar |
| --- | --- |
| Usuários, matrícula, cargo, foto e perfil | `data/usuarios.json` |
| Newsletter e orientações | `data/newsletter.json` |
| Notícias externas e pautas | `data/noticias.json` |
| Sistemas, descrições e endereços | `data/sistemas.json` |
| Equipes, líderes, empresas e responsabilidades | `data/equipes.json` |
| Acessos SAP, Power BI, OneStream, SharePoint etc. | `data/config.json`, propriedade `links` |
| Indicadores do Painel da gerência | `data/config.json`, propriedade `kpis` (lista vazia mostra "Nenhum indicador cadastrado ainda") |
| Processos, prazos e status | `data/processos.json` |
| Agenda e entregas | `data/agenda.json` e `data/entregas.json` |
| Documentos & Normas (referências oficiais) | `data/documentos.json`; grupos em `config.json › navegacao` |
| Destaques do carrossel da capa | `data/destaques.json` |
| Avisos da capa (Extra, Prazo, Info) | `data/avisos.json` |

Datas editoriais da home e competência são parametrizadas por `data/config.json`. Agenda e entregas representam o calendário da base, sem atualização por serviço externo.

### Usuários e identificação

A identificação aceita `?matricula=...` e prioriza uma matrícula válida recebida pela URL. Sem esse parâmetro, no primeiro acesso — ou ao clicar em "Trocar identificação" — o portal abre o diálogo "Qual área você atua?", que lista as áreas e as pessoas de `data/equipes.json` (ou a opção Visitante). O perfil sai do papel na equipe: líder = Gestor, Gerência = Gerência, demais = Colaborador. `data/usuarios.json` guarda só as exceções — hoje, Jonathan Bruno e Eduardo dos Santos Rocha, com a permissão extra `administracao`; cada entrada usa o mesmo `id` da pessoa em `equipes.json` e vale quando ela é escolhida na identificação. A escolha fica salva neste navegador (`localStorage`, chave `portal-identity`, ver `js/auth.js`). Cadastre a foto em `assets/users/` e informe o caminho em `foto`; falhas de imagem usam o avatar padrão. Esses mecanismos personalizam a interface e não constituem autenticação.

| Ação | Resultado esperado | Seções visíveis |
| --- | --- | --- |
| Selecionar "Jonathan Bruno Santos Bezerra" (Contabilidade IV) | Gestor | Conteúdo, Pessoas, Administração |
| Selecionar "Eduardo dos Santos Rocha" (Contabilidade IV) | Colaborador | Conteúdo, Pessoas, Administração |
| Selecionar "Alexandra Furtado Freire Paes Landim" (Gerência) | Gerência | Conteúdo, Pessoas, Gestão |
| Selecionar outra pessoa de uma equipe | Colaborador (ou Gestor, se for o líder) | Conteúdo, Pessoas |
| Escolher Visitante ou fechar sem escolher | Visitante | Conteúdo |

A escolha personaliza a interface; não autentica o usuário — o próprio perfil exibido traz o aviso "Identificação local, salva neste navegador — não é um login corporativo". O que o perfil determina é **o que aparece na tela**, não uma barreira de segurança: `hasAccess()` (`js/auth.js`), aplicado em `js/app.js`, usa a lista `permissoes` de cada usuário (`data/usuarios.json`) — ou o mapa `PERMISSIONS` por perfil, como padrão — para filtrar o menu, ocultar as seções "Estrutura das equipes" e "Painel da gerência" e restringir os resultados da busca global às coleções permitidas (`conteudo`, `time`, `gerencial`). Uma quarta capacidade, `administracao`, libera a Administração (ver seção própria) — hoje Jonathan Bruno e Eduardo dos Santos Rocha a têm em `permissoes`; para conceder a outra pessoa, crie em `data/usuarios.json` uma entrada com o `id` dela em `equipes.json` e inclua `"administracao"` na lista. A janela de Administração ainda pede um código de acesso. Quem fecha o diálogo sem escolher recebe o mesmo acesso de um Colaborador. Todos os JSONs continuam públicos para quem acessa o site publicado; não coloque credenciais neles, e trate isso como organização de interface, não como controle de acesso real — esse controle só existe com autenticação no servidor (ver "Próxima versão").

### Comunicação (Newsletter e notícias)

A seção **Comunicação** mostra, numa lista só, os comunicados publicados de `data/newsletter.json` e `data/noticias.json`, do mais recente ao mais antigo, com abas **Todos, Contabilidade, Equatorial e Externo** (pelo campo `origem`). Cada comunicado é uma faixa — imagem à esquerda; origem, categoria e data; título; subtítulo (`resumo`); e o começo do texto — e tem **página própria**, com endereço `#central/comunicado/<coleção>/<id>`, que pode ser copiado e enviado. A capa mostra os mais recentes em três colunas, uma por origem. Um comunicado cadastrado nos dois arquivos com o mesmo título aparece uma vez só (vale a cópia da Newsletter).

Duplique um objeto e preencha: `id`, `origem`, `categoria`, `titulo`, `resumo`, `conteudoCompleto`, `dataPublicacao`, `dataVigencia`, `fonte`, `link`, `documento`, `empresasImpactadas`, `areaResponsavel`, `responsavel`, `nivelImpacto`, `status`. Opcionais: `imagem` (de preferência 16:9) com `imagemAlt`; `imagemCapa`, um recorte horizontal usado na faixa e na capa quando a `imagem` é uma peça vertical (cartaz de e-mail) — a página do comunicado mostra a peça inteira; `rotuloLink`, o texto do botão quando o `link` não é a fonte e sim uma ação (ex.: "Responder ao quiz"); `indicadores`; e `sistemaId` (id de `data/sistemas.json`, vira o botão "Acessar" na página do comunicado). Sem `imagem`, a faixa e a capa mostram um quadro na cor da origem.

Ao reaproveitar e-mails da Comunicação, **não copie os links do e-mail**: eles passam por um rastreador de cliques com um código ligado a quem recebeu. Use só o endereço de destino (o QR Code da peça costuma trazê-lo). Para **preservar a fonte original**: transcreva o texto do e-mail como está (sem as saudações), use a peça e as fotos do próprio e-mail e ponha em `fonte` o remetente, a data, o assunto e quem assina. Imagem que o e-mail só carrega de fora (servidor da Comunicação) precisa ser baixada; os pixels de rastreamento (`errata`, `dntracker`) não.

- Datas: `AAAA-MM-DD`; vigência opcional pode ser `null`.
- Conteúdo: texto simples; use `\n` entre parágrafos. HTML não é interpretado. Duas marcas leves, para comunicado longo: uma linha `## Título` vira intertítulo e uma linha `[figura N]` põe ali a N-ª imagem de `figuras` — lista de `{ "imagem", "alt", "legenda" }`, mostrada com a legenda embaixo e na largura do texto. Mais duas marcas preservam o original de um e-mail: `**trecho**` é negrito, e uma figura com `"tipo": "retrato"` (foto de pessoa) fica pequena à esquerda, com o parágrafo seguinte ao lado, como num comunicado de movimentação. Na faixa da lista e na busca as marcas somem. Exemplo: o comunicado do CFC sobre IA generativa (`cfc-ia-contabilidade-seguranca-dados`), com capa e uma figura — só duas imagens, geradas no Gemini (o usuário pediu poucas, para não ficar "com cara de IA"); o crédito vai em `creditoImagens`, que vira a linha "Imagens" da ficha.
- Conteúdo de terceiros (origem Externo): escreva um resumo com as próprias palavras, credite autor e veículo em `fonte` e ponha o endereço da íntegra em `urlFonte`/`link` com `rotuloLink` ("Ler o artigo no site do CFC"). Imagem de terceiro não entra sem licença; ilustração própria, sim.
- `status` segue o fluxo editorial da Fase 4 — `Rascunho` → `Em revisão` → `Publicado` (ou `Recusado`). Só itens com `status: "Publicado"` aparecem na Comunicação, na capa e na busca; os demais ficam fora dessas visualizações, o que organiza a interface mas não é controle de acesso — o arquivo JSON continua completo e público a quem acessa o servidor. Editar manualmente ainda funciona; o "Painel editorial" (ver seção própria) é a alternativa validada, com o backend opcional ligado.
- Impactos: `Alto`, `Moderado`, `Baixo`.
- Categorias sugeridas estão em `config.json`: ANEEL, CPC, IFRS, Deliberação do Grupo, Comunicado Interno, Regulatório, Auditoria, Tecnologia, IA e Processos.
- `link` recebe a fonte primária e `documento` um arquivo local opcional.
- O movimento automático ficou restrito ao carrossel de destaques da capa, que pausa por hover, foco, botão ou preferência de movimento reduzido.

As notícias usam o mesmo esquema. Os comunicados de exemplo foram removidos em 21/09/2026; cadastre só conteúdo real.

### Sistemas e acessos

Preencha `link` com o endereço real e validado. Valores iniciais `null` abrem um aviso de configuração pendente; não há botões que simulam uma integração existente. Sistemas têm `nome`, `descricao`, `icon`, `status` e `responsavel`. Atualize o status após cadastrar o endereço. Links aceitam HTTP(S) ou caminhos locais relativos; protocolos executáveis são rejeitados.

### Equipes

“Estrutura das Equipes” é uma janela principal do portal, aberta por item próprio do menu. O organograma deriva de `data/equipes.json`, usa `id: "gerencia"` como raiz e mantém as quatro áreas subordinadas inicialmente recolhidas.

Cada área possui um `id` estável. `liderId` aponta para o `id` do respectivo objeto em `responsaveis`, e cada colaborador possui `areaId` com o `id` da área. Dessa forma, nomes podem ser corrigidos sem romper o vínculo. O primeiro integrante não é assumido como líder na janela: a referência usada é sempre `liderId`.

Para cadastrar um integrante, inclua em `responsaveis` um objeto `{ "id", "areaId", "nome", "cargo", "foto" }`. A interface cria o card automaticamente; cargo vazio aparece como “Cargo a cadastrar” e foto ausente ou inválida usa `assets/users/default.svg`. Não é necessário editar o HTML.

Responsabilidades e empresas atendidas aparecem na janela somente quando `dadosAreaValidados` for `true`. Mantenha o valor como `false` enquanto as informações ainda forem demonstrativas ou aguardarem validação.

### Origem do conteúdo

Todo conteúdo publicado tem o campo `origem`, que diz **quem escreveu** o conteúdo (não o tema):

- `"contabilidade"`: criado e gerido pela Gerência de Contabilidade;
- `"equatorial"`: do Grupo, para a empresa toda;
- `"externo"`: de fora do Grupo (órgão, norma, fornecedor, serviço de terceiro).

Uma análise da equipe sobre uma norma é `contabilidade`; a notícia reproduzida da ANEEL é `externo`; o tema continua em `categoria` ou `grupo`. O campo é **obrigatório** em `newsletter.json`, `noticias.json`, `documentos.json`, `avisos.json` e `destaques.json`. Em `sistemas.json`, `automacoes.json`, `portais.json`, `externos.json` e `config.json › links` ele também está preenchido; se faltar, vale o padrão da coleção (Contabilidade, Contabilidade, Equatorial, Externo e Equatorial). A origem vira as abas da Comunicação e as colunas da capa, o filtro "Origem" de Documentos e da busca global, o selo (na cor da origem: Contabilidade verde-água, Equatorial azul, Externo roxo) e a linha "Origem" de cada ficha.

### Documentos

Documentos & Normas lista **somente referências reais**, com link oficial verificado: cada item tem `grupo`, `titulo`, `descricao`, `fonte`, `link` (abre em nova aba) e `verificadoEm` (AAAA-MM-DD da última conferência do link). Um documento interno aprovado pode entrar com `arquivo` (caminho em `assets/documents/`), que habilita o botão "Baixar", e com `imagem`, que substitui o ícone do grupo no cartão. Os grupos e a ordem deles ficam em `config.json › navegacao` (`gruposDocumentos`); o menu abre direto a grade e a faixa de subpáginas mostra "Todos" e cada grupo. Não cadastre item sem link ou arquivo real.

### Destaques e avisos da capa

A capa abre com o **carrossel de destaques** e, a partir de 1200 px, **Avisos** e **Acesso rápido** numa coluna ao lado dele; o carrossel mede pela altura da janela (46%, entre 300 e 420 px), para as três colunas da **Comunicação** aparecerem sem rolar nos monitores comuns. Abaixo de 1200 px, o carrossel ocupa a largura toda e Avisos e Acesso rápido ficam abaixo dele, em duas colunas. Cada coluna da Comunicação mostra os 4 comunicados mais recentes da origem.

O carrossel segue o **molde desenhado pelo usuário** (Figma, 2000×519, em `projeto/comunicados`): faixa larga e baixa (proporção 3,85, com altura mínima de 300 px); as imagens de um lado; do outro, o **selo da origem** + a área, título, subtítulo, descrição e a ação. O texto é HTML, nunca pintado na imagem. Cada slide tem um de dois **formatos**:

- **Imagem** (o padrão, para comunicados, sistemas e links): a imagem ocupa **a altura toda**, encostada na borda (zona 16:9, até 56% da faixa), e se desfaz num fundo que é ela mesma espelhada e desfocada; por cima, as listras finas do molde do Cronograma, a diagonal para a segunda cor do slide e a sombra do canto de fora. Do lado do texto só há efeitos que escurecem, então o contraste nunca cai abaixo do da cor do slide.
- **Molde** (`"formato": "molde"`): a arte montada no Figma — fundo próprio (`fundoImagem`) e a **cena** (as peças já nas posições do molde, sobre fundo transparente) ocupando a zona das imagens; aceita até duas imagens soltas. Com fundo próprio, um halo escuro suave fica atrás do texto e a área vai em branco, para o texto passar de 4,5:1 sobre a arte. `python .claude/tools/moldes-destaques.py` gera `assets/destaques/<nome>-fundo.webp` e `<nome>-cena.webp` a partir dos SVGs de `projeto/comunicados` (o texto do Figma vem em contorno e não é extraído). Do formato do Conecta ficaram os cantos de 10 px, o deslizamento de 0,5 s, as setas de 42 px e as bolinhas de 9 px. **O slide inteiro é clicável**; destino externo abre em outra aba. No celular, as imagens vão para cima e o texto para baixo. Troca a cada 7 s, pausa com mouse/foco em cima, tem botão de pausa e não gira com "Reduzir movimento".

- `data/destaques.json` — **um registro por slide, apontando para um destino** (`js/destaques.js`):
  - `alvo`: `{ "tipo", "ref" }`. Tipos: `comunicado` (`ref` = `"newsletter:<id>"` ou `"noticias:<id>"`; só aparece se o comunicado estiver publicado), `sistema` (id de `sistemas.json`), `portal` (id de `portais.json`), `externo` (id de `externos.json`), `atalho` (nome em `config.json › links`), `pagina` (rota do portal, ex.: `"#central/documentos"`) ou `url` (endereço `https://` livre).
  - Agenda: `ativo` (falso = pausado, sem apagar), `inicio` e `fim` (AAAA-MM-DD — fora do período o slide sai sozinho) e `ordem`.
  - Aparência, **toda opcional** — o que ficar em branco vem do destino (título, resumo, descrição, categoria/grupo, imagem): `titulo`, `subtitulo`, `descricao`, `rotulo` (a área, ao lado do selo), `acao` (texto do botão), `imagens` (lista com até 2 caminhos; no formato imagem vale só a primeira), `formato` (`"molde"`; ausente = imagem), `fundoImagem`, `fundo` e `fundoFim` (cores do slide — o véu e a diagonal do formato imagem saem delas), `lado` (`"esquerda"`/`"direita"`, onde ficam as imagens) e `alt`. Página e endereço livre precisam de `titulo`.
  - Recomendação: **no máximo 5 no ar** — o primeiro slide concentra a maior parte dos cliques; a Administração avisa quando passa disso.
  - **Gestão pela tela** (exige o servidor opcional ligado): Administração → aba **Carrossel** (lista com a situação de cada slide — No ar, Agendado, Pausado, Encerrado —, Subir/Descer, Editar, Novo destaque); bloco **"Carrossel da capa"** na página de cada comunicado; botão **"Destacar no carrossel"** nas fichas de sistemas, portais, links externos e atalhos. O formulário mostra a prévia do slide e envia imagens para `assets/destaques/`. Sem servidor, tudo abre em modo leitura, com a prévia.
  - `python .claude/tools/fundo-destaques.py` preenche `fundo`/`fundoFim` a partir da primeira imagem, só nos slides sem cor e sem `fundoImagem` (`--refazer` recalcula todos).
- `data/avisos.json`: cada aviso tem `tipo` (`extra`, `prazo` ou `info`, no molde do "Extra!" da Comunicação), `titulo`, `texto`, `janela` (quando: horário ou prazo), `area` responsável, `inicio` e `fim`. A capa mostra até 3 vigentes, Extra primeiro; sem nenhum vigente, mostra "Nenhum aviso vigente".
- **Compromisso da agenda em Avisos** (21/09/2026): o item de `data/agenda.json` com `"naCapa": true` aparece no alto de Avisos como uma linha de calendário — a folhinha com o dia, o nome, o dia da semana e o horário (quem organiza não aparece, a pedido do usuário) — até a hora em que termina (até 2 por vez). Campos: `nome`, `descricao`, `data` (AAAA-MM-DD), `inicio` e `fim` (HH:MM, horário de Brasília), `horario` (texto, usado no Painel), `responsavel` (só no Painel da gerência), `local`, `link` e `fonte`. Com `link` (Teams, por exemplo), a linha ganha o botão **Entrar na reunião**; o nome abre a ficha, com **Salvar no calendário** — um `.ics` montado na hora, só com o que o portal mostra (sem a lista de convidados do convite original). Ao aproveitar um convite do Outlook (`.ics`), copie só título, data, horário, organizador, local e o link da reunião, se houver.
- **Acesso rápido** é montado sozinho: links de `config.json > links` com endereço e sistemas `Ativo` de `data/sistemas.json` (até 8).

### Adicionar menu

O menu exibido fica em `config.json > navegacao`: cada seção tem `label` e `icon` e, ou um `target` direto (como `Início`), ou uma lista `itens` que vira o submenu. Cada item de submenu aponta para um destino do portal: `target` e, opcionalmente, `tab` (aba da Central de Conteúdo), `view` (janela principal, como `equipes`) ou `adminTab` (aba da Administração). Duas chaves especiais montam a seção a partir dos dados: `acessosCorporativos` acrescenta os links de `config.json > links` (abrem em nova aba) e `gruposDocumentos` lista os grupos de Documentos & Normas na faixa de páginas, sem submenu. `config.json > menu` continua sendo a tabela de rotas (`target` → seção). Para uma nova janela, adicione sua seção ao HTML e um renderizador modular. Os ícones disponíveis estão em `ui.js`. Se o destino só deve aparecer para certos perfis, registre seu `target` em `TARGET_ACCESS` (`js/app.js`); seções sem itens visíveis somem do menu.

## Decisões técnicas e experiência

- Módulos ES nativos, dados separados e sem dependências externas.
- Cabeçalho institucional com a imagem da gerência, título, busca, "Bem-vindo" (menu do usuário: trocar identificação, preferências e, para a gerência, alertas) e o menu principal com ícones embutido na base da faixa. **O menu não abre submenu suspenso**: cada seção é um link direto para a sua primeira página, e as demais aparecem na faixa de subpáginas logo abaixo, em abas.
- Rotas em hash: `#inicio`, `#central/<aba>`, `#administracao/<aba>` e `#<seção>`; o botão Voltar do navegador funciona entre elas.
- No celular, o botão "Menu" abre as mesmas seções dentro da faixa e fecha após a seleção.
- Faixa de subpáginas no padrão do CFC, logo abaixo do menu, com as páginas da seção aberta. Vale para qualquer seção (inclusive Gestão, cujas páginas são painéis da capa) e fica escondida quando a seção tem uma página só (Pessoas) ou quando é uma janela com abas próprias (Administração); uma linha azul de 3 px fica sobre a página atual e desliza até o item sob o mouse ou foco (0,25 s; sem animação com "Reduzir movimento"). Seções: Comunicação (Todos, Contabilidade, Equatorial, Externo), **Portais e Links** (**Todos** = tudo da seção, de A a Z, com selo e filtro de origem; Contabilidade = sistemas da área; Equatorial = 4 portais do Grupo (comunicação, SharePoint e viagens); Portal de Serviços = os 8 serviços do atendimento interno; Gente e Gestão = os 8 de RH, a começar pelo Conecta; **Power BI** = painéis do Power BI (`destino: "portais-powerbi"`, hoje o BI - Gastos Gerenciáveis); Externos = 6 sites de terceiros), **Sistemas e automações** (**Todos**; Contabilidade = automações; Equatorial = atalhos de `config.json › links`, como SAP e Snowflake; Externos = ferramentas de terceiros que automatizam tarefa) e Documentos & Normas (por categoria). As abas Todos e Power BI são de 21/09; "Todos" é a primeira aba e é onde o menu leva.
- **Grade de cartões padrão** (`.pcard`) em todas as telas de lista — Portais e Links → Contabilidade, Sistemas e automações → Contabilidade e → Equatorial, e Documentos & Normas: cada item é uma **faixa horizontal** (~176 px de altura) com a imagem numa coluna fixa à esquerda, em altura cheia, e rótulo, título, descrição e ações no restante do espaço. **Dois por faixa** em telas largas, um abaixo de 1100 px, e continua faixa no celular. As ações são o status, o botão **"i"** (ficha do item) e **Acessar**/**Baixar**; **o clique em qualquer parte do cartão leva ao destino**, por um `::after` esticado a partir da ação principal (sem aninhar links). O cartão é um alvo só: o texto dele não é selecionável — a tentativa de deixá-lo selecionável foi testada em 20/09 e recusada, porque arrastar o mouse dentro do cartão selecionava texto em vez de parecer um botão. Cartão sem destino cadastrado não clica. Sem imagem cadastrada, o cartão mostra o ícone da categoria no mesmo espaço. Estilo de borda e sombra tirado de microsoft.com/pt-br.
- **Arte dos cartões**: todo cartão tem um SVG em `assets/{atalhos,sistemas,automacoes,documentos,portais,externos}/`, gerado por `.claude/tools/arte-marcas.py` (60 artes, uma por cartão). Quando o destino tem **tela de entrada própria**, a arte reproduz essa tela — o fundo, a logo e o título dela (ProjectHub, Cronograma de Fechamento, Portal de Auditoria, IFRS 16/CPC 06, Gestor de Horas, Central de Resultados, e o Brasão da República nas leis do Planalto). Quando não tem, entra a **marca oficial do titular** sobre o fundo da própria marca (ChatGPT em preto, EY no carvão `#2E2E38`, WeTransfer no azul `#409FFF`), **sem desenho decorativo**, com **rótulo abaixo** quando a mesma marca serve a vários cartões — a transação (`ME23N`, `FB03`), a norma (`SPED · ECD`) ou o sistema. Marcas em `assets/marcas/` (origem em `FONTES.md`); os insumos das telas em `projeto/marcas-telas/`, fora do site. **Uso referencial**: o cartão leva ao site da própria instituição. O passo a passo para criar a arte de um item novo está em `.claude/redesign/04-arte-dos-cartoes.md`.
- A arte do IFRS 16 / CPC 06 reproduz a **tela de entrada nova** (21/09/2026: painel branco e painel azul com a curva, a foto das torres e o "Contrato de Arrendamento"): é composta por `.claude/tools/arte_arrendamento.py`, que o `arte-marcas.py` chama, e que também gera o fundo do slide do IFRS no carrossel (`python .claude/tools/arte_arrendamento.py`). Os insumos (foto, ilustração, logo) estão em `projeto/marcas-telas/arrendamento-*`, tirados da página salva do sistema.
- Quem tem o perfil de administração troca a arte de um cartão pelo **lápis no canto de cima da imagem** (campo `imagem` em `data/sistemas.json` e `data/automacoes.json`; os atalhos de `config.json › links` são somente leitura na API e precisam ser editados no arquivo). Uploads vão para `assets/sistemas/`, `assets/automacoes/`, `assets/portais/`, `assets/externos/` ou `assets/users/`.
- Em Documentos & Normas o cartão traz o grupo como rótulo, a fonte oficial na faixa de ações e a data de conferência do link na ficha do "i". Sem tabela: a única que sobrou no portal é a de processos críticos, no painel da gerência.
- Rodapé institucional em todas as telas, com o **mapa do portal** (as mesmas seções e páginas do menu, filtradas pelo perfil), a área responsável (vinda de `data/equipes.json`, equipe `tipo: gerencia`) e a data de atualização da base.
- Tabs acessíveis por setas, Home e End; diálogos nativos com Escape e retorno de foco.
- Busca sem diferenciação de acentos, abrangendo conteúdos, equipes, colaboradores, agenda e entregas.
- **Faixa de busca e filtros padrão** em todas as telas de conteúdo (a capa não tem, porque lá a busca é a do cabeçalho): busca à esquerda, filtros no meio e "Limpar filtros" no fim, com a contagem do resultado no rodapé da tela. As grades de Portais e Links listam em ordem alfabética do título. Comunicação filtra por categoria (a origem é a aba), Portais e Links por equipe responsável, Automações por tecnologia e status, Documentos por origem (o grupo é a aba).
- Painel da gerência, Processos críticos, Agenda e Entregas mostram "Nenhum … cadastrado ainda" enquanto `config.json › kpis`, `processos.json`, `agenda.json` e `entregas.json` estiverem vazios.
- Preferências locais de tamanho de texto e movimento, com tolerância a armazenamento bloqueado.
- Tratamento de erro no carregamento e nova tentativa; nenhuma autenticação real, com ou sem o backend opcional (ver "Backend opcional").
- Identidade visual em azul marinho e azul corporativo; logo vetorial, ícones inline e a fonte do sistema (`"Segoe UI", Arial`), sem requisições a CDNs.
- **Sistema visual em tokens** no `:root` de `css/styles.css`: escala de 8 tamanhos (11 a 30 px), 3 pesos, 5 raios, 3 sombras e a paleta completa. Nenhuma cor literal fora do `:root`. Todo texto da interface atende ao contraste AA (4,5:1); ao mexer em cor, mantenha essa margem.

## Uso e métricas locais

O ícone de engrenagem abre, além das preferências de acessibilidade, um painel "Uso deste navegador" com a aba mais acessada, o sistema mais buscado, o termo mais pesquisado, o conteúdo mais consultado e o documento mais baixado.

- Os eventos (`js/analytics.js`) ficam somente em `localStorage`, neste navegador; nada é enviado a servidores. Não é uma medição corporativa: cada colaborador só vê o próprio uso, no próprio dispositivo.
- Nenhum dado pessoal além do termo de busca digitado é registrado; matrícula e nome não entram nos eventos.
- O checkbox "Registrar meu uso do portal neste navegador" permite desativar a coleta a qualquer momento; "Limpar dados locais" apaga o histórico salvo.
- O botão "Exportar dados" baixa um JSON com os eventos brutos — útil para reunir manualmente o uso de várias máquinas até existir uma API central (ver `data-service.js`).
- Isso resolve "o que sabemos sobre o uso do portal neste navegador", não "o que a Gerência usa como um todo". Métricas agregadas de verdade exigem um backend que receba esses eventos — o backend opcional abaixo ainda não recebe analytics, apenas conteúdo; é o próximo passo natural se isso for priorizado.

## Backend opcional (Fase 2 — dados vivos)

Por padrão o portal continua 100% estático, exatamente como descrito acima. `server/server.js` é um backend **opcional**: um servidor HTTP em Node.js nativo (sem `npm install`, sem dependências) que lê e escreve os **mesmos arquivos** de `data/`. Ligá-lo troca "editar JSON manualmente" por uma API validada com trilha de auditoria; desligá-lo não quebra nada — o frontend volta a ler os arquivos estáticos sozinho.

### Como ligar

1. Rode o backend (numa porta diferente do servidor de arquivos):

   ```powershell
   node server/server.js
   ```

   Por padrão sobe em `http://127.0.0.1:8787`. Variáveis de ambiente opcionais: `PORTAL_API_HOST`, `PORTAL_API_PORT`, `PORTAL_DATA_DIR` (para apontar a uma cópia dos dados, por exemplo em teste), `PORTAL_ASSETS_USERS_DIR` (destino das fotos enviadas pelo Painel Administrativo, padrão `assets/users/`), `PORTAL_ALLOWED_ORIGIN` (CORS; padrão `*`, restrinja ao endereço do portal antes de qualquer uso além do seu próprio computador) e `PORTAL_ADMIN_TOKEN` — **defina este antes de qualquer uso além do seu próprio computador**: sem ele, qualquer um que alcance o backend pode escrever; com ele, toda escrita (criar, editar, apagar, enviar foto) exige o cabeçalho `X-Admin-Token` com o valor exato.

   No Windows, copie `INICIAR_API.cmd.example` para `INICIAR_API.cmd`, edite a cópia trocando `SEU_TOKEN_AQUI` pelo token real e dê dois cliques nela para subir o backend já com o token configurado. `INICIAR_API.cmd` está no `.gitignore` de propósito — a cópia com o token real nunca deve ser commitada; só o `.example`, sem segredo nenhum, faz parte do repositório.

2. Ligue o frontend a ele: adicione antes de `<script type="module" src="js/app.js">` em `index.html`:

   ```html
   <script>window.PORTAL_API_ENABLED = true; window.PORTAL_API_PORT = 8787;</script>
   ```

   Sem essa flag, o portal nunca tenta contatar o backend — é por isso que ligá-lo é uma escolha explícita, não um comportamento automático que poderia gerar erro de conexão no console de quem nunca vai rodar o backend.

3. Continue servindo os arquivos estáticos normalmente (`INICIAR.cmd` ou `python -m http.server`). Com a flag ligada, o topo da página passa a mostrar "Dados ao vivo" (vindo da API) em vez de "Arquivo local"; se o backend cair, a badge volta sozinha para "Arquivo local" no próximo carregamento, sem quebrar a navegação.

### Endpoints

| Rota | Método | Efeito |
| --- | --- | --- |
| `/api/health` | GET | Verificação de disponibilidade, usada pelo frontend |
| `/api/<coleção>` | GET | Lista completa (`usuarios`, `newsletter`, `noticias`, `equipes`, `processos`, `sistemas`, `agenda`, `documentos`, `entregas`) |
| `/api/<coleção>/<id>` | GET | Um registro |
| `/api/<coleção>` | POST | Cria um registro (corpo com `id` único, sem `:`) |
| `/api/<coleção>/<id>` | PUT | Atualiza campos de um registro existente |
| `/api/<coleção>/<id>` | DELETE | Remove um registro |
| `/api/config` | GET | KPIs, resumo, menu e acessos — somente leitura nesta versão |
| `/api/_audit` | GET | Últimas 100 entradas da trilha de auditoria |
| `/api/_upload?filename=...` | POST | Envia uma foto (corpo = bytes brutos do arquivo, `Content-Type` da imagem); grava em `assets/users/` com nome normalizado e devolve `{ "caminho": "assets/users/arquivo.jpg" }`. Extensões aceitas: jpg, jpeg, png, webp, gif, svg; limite de 5MB |

Toda escrita grava em `server/audit.log` (fora do controle de versão) quem fez o quê e quando — o "quem" vem do cabeçalho opcional `X-Autor`, informado por quem chama a API, não validado. O "Painel editorial" (Fase 4) usa essas rotas para newsletter e notícias; o "Painel administrativo" (abaixo) usa `equipes` e `_upload`. As demais coleções seguem sem UI de edição, disponíveis para automações.

### Token de escrita (`PORTAL_ADMIN_TOKEN`)

Quando essa variável está definida, toda rota de escrita (`POST`, `PUT`, `DELETE`, `_upload`) exige o cabeçalho `X-Admin-Token` com o mesmo valor — sem ele, responde `401`. Quem vai usar o Painel Editorial ou o Painel Administrativo cola esse token uma vez no próprio portal (campo "Token de administração", salvo em `localStorage`, só naquele navegador); o backend nunca envia o token de volta nem o expõe em nenhuma resposta.

**O que isso é, e o que não é**: é um segredo compartilhado — distingue "tem o token" de "não tem", não distingue *quem*, entre os que têm, fez cada alteração (isso continua vindo do `X-Autor` autodeclarado, não verificado). Não é conta individual, não é SSO, não expira, não é revogável por pessoa — para revogar o acesso de alguém é preciso trocar o token e redistribuí-lo para quem deve continuar com acesso. Trate-o como uma senha de porta, não como um login: suficiente para barrar um estranho na rede, insuficiente para auditar quem fez o quê com confiança. Autenticação individual de verdade continua na "Próxima versão".

### O que isso não é

Fora do token de escrita acima, este backend **não adiciona autenticação nem autorização real**. Continua sendo, como a Fase 1 já deixa explícito na interface, uma camada de conveniência e governança (dado vivo, trilha de auditoria, validação de formato) — não um controle de acesso de verdade. Não exponha `server/server.js` fora de `localhost` ou de uma rede interna confiável sem definir `PORTAL_ADMIN_TOKEN` e, idealmente, HTTPS e uma origem de CORS restrita.

## Painel administrativo (equipes)

Menu "Administração", visível só para quem tem a capacidade `administracao` (perfil Administrador, ou qualquer usuário com `"administracao"` em `permissoes` — ver "Usuários e identificação"). Permite administrar a estrutura diretamente no portal:

- Criar, renomear, editar e excluir equipes. A raiz "Gerência" é protegida contra exclusão.
- Adicionar, editar e excluir colaboradores, alterar cargo e foto e escolher explicitamente a liderança de cada equipe.
- Editar descrição, responsabilidades, empresas atendidas e o indicador de dados validados.
- Exportar a base consolidada como `equipes.json`, importar um backup e restaurar a base original.

No portal estático e no GitHub Pages, as alterações são salvas em `localStorage` no navegador atual. Esse modo torna o cadastro utilizável sem Node.js; para compartilhar as alterações, use **Exportar JSON** e substitua `data/equipes.json` na publicação. Fotos escolhidas nesse modo devem ter até 750 KB. Com o backend opcional ativo, as alterações são gravadas nos arquivos do servidor, o upload usa a rota `_upload` e o token de escrita continua obrigatório quando `PORTAL_ADMIN_TOKEN` estiver configurado.

## Painel editorial (Fase 4 — governança de conteúdo)

O risco que esta fase fecha: publicar newsletter e notícias hoje significa editar `data/newsletter.json` ou `data/noticias.json` na mão, sem revisão nem trilha de quem aprovou o quê — arriscado para conteúdo com peso regulatório (ANEEL, CPC/IFRS, deliberações). O "Painel editorial", no menu Gestão (visível para perfis com a capacidade `gerencial` — ver "Usuários e identificação"), dá um fluxo com um mínimo de controle:

- **Fluxo de status**: `Rascunho` → `Em revisão` → `Publicado`, com desvio para `Recusado` (que pode reabrir como `Rascunho`). Cada item guarda um `historicoStatus` com quem moveu o quê e quando.
- **A única regra que o backend impõe de verdade**: não existe transição para `Publicado` sem um `aprovadoPor` informado no corpo da requisição — o servidor recusa (`400`) qualquer tentativa de publicar, ou de "reafirmar" a publicação de algo já publicado, sem essa informação. É deliberadamente a única regra rígida: o resto do fluxo (enviar para revisão, recusar, reabrir) é permissivo, porque o ponto de risco identificado era especificamente "publicar sem aprovação registrada", não uma máquina de estados completa.
- **Novo rascunho**: o botão "Novo rascunho +" abre um formulário (newsletter ou notícia) que sempre entra como `Rascunho` — mesmo que o corpo da requisição tente forçar outro status, o backend ignora e força `Rascunho`, para que criar não vire um atalho para publicar.
- **Exige o backend opcional ligado.** Sem ele (`window.PORTAL_API_ENABLED`), o painel mostra os itens em modo somente leitura, com aviso explícito, e o botão de novo rascunho fica desabilitado — não há como persistir uma edição sem a API rodando.

### Limitações conhecidas, de propósito

- Qualquer perfil com `gerencial` pode rascunhar **e** aprovar — não há separação entre "quem escreve" e "quem publica" nesta versão. O modelo de `permissoes` por usuário já suportaria uma capacidade `editorial-aprovar` separada; não foi feito para não alongar o escopo desta entrega.
- Editar o conteúdo de um item **já** `Publicado` sem alterar o campo `status` no corpo da requisição não exige nova aprovação. A regra dura é sobre a transição para `Publicado`, não sobre toda edição subsequente — considere isso ao decidir quem tem acesso de escrita à API.
- Confirmações usam `confirm()`/`prompt()` nativos do navegador (aprovar, recusar) em vez de um diálogo próprio — pragmático para esta entrega, mas o primeiro candidato a melhorar se o painel for usado no dia a dia.
- `usuarios`, `processos`, `sistemas`, `equipes`, `agenda`, `documentos` e `entregas` não têm esse fluxo de aprovação — continuam editáveis via API sem revisão, ou via JSON manual.

## Próxima versão

Substituir dados ilustrativos pelos conteúdos, fotos, documentos e URLs aprovados. O adaptador de dados para API (Fase 2), o fluxo editorial de rascunho/revisão/publicação (Fase 4) e um Painel administrativo com token de escrita compartilhado já existem como backend opcional — faltam: autenticação corporativa individual com SSO (o token de hoje é compartilhado, não distingue pessoas), permissões aplicadas de fato no servidor (hoje `hasAccess()` só organiza a interface), separação entre quem rascunha e quem aprova, integrações reais com SAP/Power BI/OneStream/SharePoint (Fase 3 — depende de endereços e credenciais que só a organização pode fornecer), histórico de indicadores e organograma completo. Essas integrações não estão implementadas nesta entrega.

## Histórico da entrega

Projeto novo: não havia arquivos de aplicação. Todos os arquivos desta pasta foram criados nesta implementação; nenhum arquivo anterior do usuário foi alterado ou removido. O registro do estado inicial foi preservado na área de trabalho da tarefa.

