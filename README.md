# Portal da Gerência de Contabilidade

Portal corporativo local em HTML5, CSS3 e JavaScript Vanilla. Não precisa de Node.js, npm, frameworks, CDN, banco de dados ou serviços em nuvem para funcionar: por padrão, o servidor HTTP apenas entrega arquivos e todo o conteúdo vem de `data/*.json`, sem backend algum. Há, opcionalmente, um backend leve em Node.js (`server/server.js`, ver "Backend opcional") para quem quiser dados vivos e um registro de auditoria — ele continua lendo e escrevendo os mesmos JSONs, e o portal funciona exatamente igual sem ele.

## Executar

1. Extraia a pasta `portal-contabilidade` por completo.
2. Se já possui Python 3, dê dois cliques em `INICIAR.cmd`. Alternativamente, abra um terminal nesta pasta e execute:

   ```powershell
   python -m http.server 5500 --bind 127.0.0.1
   ```

3. Abra [Portal local — Jonathan Bruno](http://localhost:5500/?matricula=2026001) no Chrome ou Edge.
4. Mantenha o terminal aberto enquanto usa o portal. Para encerrar, pressione `Ctrl+C`.

Python é apenas uma opção de servidor estático. Você pode usar qualquer servidor de arquivos corporativo já disponível, inclusive Live Server ou IIS configurado para arquivos estáticos e JSON. Não há etapa de build. Se a porta 5500 estiver ocupada, encerre seu servidor anterior ou escolha outra porta no comando e na URL. O servidor criado durante a implementação pode já estar atendendo a porta 5500.

Não abra `index.html` por duplo clique: o protocolo `file://` bloqueia os módulos e/ou o carregamento dos JSONs. A execução suportada é HTTP em localhost. O vínculo `127.0.0.1` permite somente acesso no próprio computador. O teste de celular foi realizado por viewport, sem expor o portal na rede.

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
│   ├── auth.js                # Matrícula e perfis demonstrativos
│   ├── data-service.js        # Carregamento das bases, futuro adaptador de API
│   ├── navigation.js          # Menu, foco e tabs por teclado
│   ├── newsletter.js          # Radar, cards e leitura das publicações
│   └── ui.js                  # Ícones, escape de texto, URLs e diálogos
├── server/
│   └── server.js              # Backend opcional (Fase 2) — API viva sobre os mesmos JSONs
├── data/
│   ├── config.json            # KPIs, resumo executivo, menu e acessos rápidos
│   ├── usuarios.json
│   ├── newsletter.json
│   ├── noticias.json
│   ├── equipes.json
│   ├── processos.json
│   ├── sistemas.json
│   ├── documentos.json
│   ├── agenda.json
│   └── entregas.json
└── assets/
    ├── logos/portal.svg
    ├── users/                 # Avatar padrão e avatar de iniciais
    └── documents/             # 13 documentos HTML demonstrativos
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
| Resumo do banner e indicadores | `data/config.json`, propriedades `resumo` e `kpis` |
| Processos, prazos e status | `data/processos.json` |
| Agenda e entregas | `data/agenda.json` e `data/entregas.json` |
| Documentos e categorias | `data/documentos.json` e arquivos em `assets/documents/` |

Datas editoriais da home e competência são parametrizadas por `data/config.json`. Agenda e entregas representam o calendário da base, sem atualização por serviço externo.

### Usuários e matrícula

`getMatriculaFromURL()` está em `js/auth.js` e usa `URLSearchParams`. As matrículas são strings; mantenha zeros à esquerda quando existirem. Cadastre a foto em `assets/users/` e informe o caminho em `foto`. Na ausência de fotografia foi usado um avatar de iniciais; falhas de imagem usam o avatar padrão.

| URL | Resultado esperado |
| --- | --- |
| URL | Resultado esperado | Seções visíveis |
| --- | --- | --- |
| `/?matricula=2026001` | Jonathan Bruno — Gestor | Central de conteúdo, Estrutura das equipes |
| `/index.html?matricula=123456` | Marina Oliveira — Gerência | Central de conteúdo, Estrutura das equipes, Painel da gerência |
| `/?matricula=2026002` | Ana Martins — Colaborador | Central de conteúdo |
| `/?matricula=999999` | Colaborador não identificado, avatar padrão | Central de conteúdo |
| `/` | Colaborador não identificado, matrícula não informada | Central de conteúdo |

A matrícula personaliza a interface; não autentica o usuário — o próprio perfil exibido traz o aviso "Identificação local pela matrícula — não é um login corporativo". O que o perfil determina é **o que aparece na tela**, não uma barreira de segurança: `hasAccess()` (`js/auth.js`), aplicado em `js/app.js`, usa a lista `permissoes` de cada usuário (`data/usuarios.json`) — ou o mapa `PERMISSIONS` por perfil, como padrão — para filtrar o menu, ocultar as seções "Estrutura das equipes" e "Painel da gerência" e restringir os resultados da busca global às coleções permitidas (`conteudo`, `time`, `gerencial`). Um visitante sem matrícula recebe o mesmo acesso de um Colaborador. Todos os JSONs continuam públicos para quem acessa o servidor local; não coloque credenciais neles, e trate isso como organização de interface, não como controle de acesso real — esse controle só existe com autenticação no servidor (ver "Próxima versão").

### Newsletter

Duplique um objeto e preencha: `id`, `categoria`, `titulo`, `resumo`, `conteudoCompleto`, `dataPublicacao`, `dataVigencia`, `fonte`, `link`, `documento`, `empresasImpactadas`, `areaResponsavel`, `responsavel`, `nivelImpacto`, `status`.

- Datas: `AAAA-MM-DD`; vigência opcional pode ser `null`.
- Conteúdo: texto simples; use `\n` entre parágrafos. HTML não é interpretado.
- `status` segue o fluxo editorial da Fase 4 — `Rascunho` → `Em revisão` → `Publicado` (ou `Recusado`). Só itens com `status: "Publicado"` aparecem na newsletter e na busca; os demais ficam fora dessas visualizações, o que organiza a interface mas não é controle de acesso — o arquivo JSON continua completo e público a quem acessa o servidor. Editar manualmente ainda funciona; o "Painel editorial" (ver seção própria) é a alternativa validada, com o backend opcional ligado.
- Impactos: `Alto`, `Moderado`, `Baixo`.
- Categorias sugeridas estão em `config.json`: ANEEL, CPC, IFRS, Deliberação do Grupo, Comunicado Interno, Regulatório, Auditoria, Tecnologia, IA e Processos.
- `link` recebe a fonte primária e `documento` um arquivo local opcional.
- O radar reúne as publicações, movimenta-se automaticamente e pausa por hover, foco, botão ou preferência de movimento reduzido.

As notícias usam o mesmo esquema. Todo o acervo inicial é demonstrativo: não representa novas normas nem orientações legais verificadas.

### Sistemas e acessos

Preencha `link` com o endereço real e validado. Valores iniciais `null` abrem um aviso de configuração pendente; não há botões que simulam uma integração existente. Sistemas têm `nome`, `descricao`, `icon`, `status` e `responsavel`. Atualize o status após cadastrar o endereço. Links aceitam HTTP(S) ou caminhos locais relativos; protocolos executáveis são rejeitados.

### Equipes

Cada equipe possui `lider`, `quantidade`, `responsaveis`, `responsabilidades`, `empresas` e `solucoes`. `solucoes` contém IDs de `sistemas.json`. A contagem inclui a equipe completa; a lista de responsáveis é uma lista de referência, não um cadastro completo de todos os colaboradores. O organograma deriva das equipes e usa `id: "gerencia"` como raiz.

`responsaveis` é uma lista de objetos `{ "nome", "cargo", "foto" }`, exibidos com avatar no diálogo "Responsáveis" de cada equipe. Cadastre a foto em `assets/users/` (mesmo padrão de `usuarios.json`: arquivo quadrado, `.jpg`/`.png`/`.svg`) e informe o caminho relativo em `foto`; na ausência de foto real, use `"assets/users/default.svg"` — falhas de carregamento da imagem também caem nesse avatar padrão automaticamente. `cargo` é livre (ex.: "Liderança", "Analista Contábil Sênior") e pode ficar vazio.

### Documentos

Troque os documentos demonstrativos por arquivos aprovados, como PDF, HTML ou DOCX, atualizando `arquivo`, `formato`, `versao`, `data` e `responsavel`. O navegador determina se o formato abre diretamente ou é baixado. Categoria e busca textual podem ser combinadas. Os 13 modelos locais abrem e podem ser baixados sem depender de links externos.

### Adicionar menu

Inclua um objeto em `config.json > menu`: `label`, `icon`, `target` e, opcionalmente, `tab`. O `target` corresponde ao ID de uma seção HTML. `tab` pode ser `newsletter`, `noticias`, `sistemas` ou `documentos`. Para uma nova tela, adicione sua seção ao HTML e seu renderizador em `app.js`; para uma nova tab, atualize também o tablist. Os ícones disponíveis estão em `ui.js`. Se a nova seção só deve aparecer para certos perfis, registre seu `target` em `TARGET_ACCESS` e seu `id` em `SECTION_ACCESS` (`js/app.js`) com a capacidade exigida — um `target` sem entrada em `TARGET_ACCESS` cai no padrão `conteudo` (hoje liberado a todo perfil, incluindo visitante sem matrícula); um `id` de seção sem entrada em `SECTION_ACCESS` nunca é ocultado, fica visível a todos.

## Decisões técnicas e experiência

- Módulos ES nativos, dados separados e sem dependências externas.
- Layout com sidebar fixa, topbar sticky e central de conteúdo em duas colunas no desktop.
- Menu móvel com fechamento após seleção, Escape e controle de foco.
- Tabs acessíveis por setas, Home e End; diálogos nativos com Escape e retorno de foco.
- Busca sem diferenciação de acentos, abrangendo conteúdos, equipes, colaboradores, agenda e entregas.
- Indicadores executivos demonstrativos independentes do subconjunto de registros detalhados: 24 processos e 07 sistemas não são contagens automáticas dos cinco processos e quatro sistemas exibidos.
- Preferências locais de tamanho de texto e movimento, com tolerância a armazenamento bloqueado.
- Tratamento de erro no carregamento e nova tentativa; nenhuma autenticação real, com ou sem o backend opcional (ver "Backend opcional").
- Identidade visual em azul marinho, azul corporativo e teal; logo vetorial, ícones inline e fontes do sistema, sem requisições a CDNs.

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

   Por padrão sobe em `http://127.0.0.1:8787`. Variáveis de ambiente opcionais: `PORTAL_API_HOST`, `PORTAL_API_PORT`, `PORTAL_DATA_DIR` (para apontar a uma cópia dos dados, por exemplo em teste) e `PORTAL_ALLOWED_ORIGIN` (CORS; padrão `*`, restrinja ao endereço do portal antes de qualquer uso além do seu próprio computador).

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

Toda escrita grava em `server/audit.log` (fora do controle de versão) quem fez o quê e quando — o "quem" vem do cabeçalho opcional `X-Autor`, informado por quem chama a API, não validado. O "Painel editorial" (Fase 4, ver seção própria) já usa essas rotas para newsletter e notícias; as demais coleções seguem sem UI de edição, disponíveis para automações.

### O que isso não é

Este backend **não adiciona autenticação nem autorização real**. Continua sendo, como a Fase 1 já deixa explícito na interface, uma camada de conveniência e governança (dado vivo, trilha de auditoria, validação de formato) — não um controle de acesso de verdade. Não exponha `server/server.js` fora de `localhost` ou de uma rede interna confiável sem antes adicionar autenticação, HTTPS e uma origem de CORS restrita.

## Painel editorial (Fase 4 — governança de conteúdo)

O risco que esta fase fecha: publicar newsletter e notícias hoje significa editar `data/newsletter.json` ou `data/noticias.json` na mão, sem revisão nem trilha de quem aprovou o quê — arriscado para conteúdo com peso regulatório (ANEEL, CPC/IFRS, deliberações). O "Painel editorial", no menu lateral (visível para perfis com a capacidade `gerencial` — ver "Usuários e matrícula"), dá um fluxo com um mínimo de controle:

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

Substituir dados ilustrativos pelos conteúdos, fotos, documentos e URLs aprovados. O adaptador de dados para API (Fase 2) e o fluxo editorial de rascunho/revisão/publicação (Fase 4) já existem como backend opcional — faltam: autenticação corporativa com SSO, permissões aplicadas de fato no servidor (hoje `hasAccess()` só organiza a interface), separação entre quem rascunha e quem aprova, integrações reais com SAP/Power BI/OneStream/SharePoint (Fase 3 — depende de endereços e credenciais que só a organização pode fornecer), histórico de indicadores e organograma completo. Essas integrações não estão implementadas nesta entrega.

## Histórico da entrega

Projeto novo: não havia arquivos de aplicação. Todos os arquivos desta pasta foram criados nesta implementação; nenhum arquivo anterior do usuário foi alterado ou removido. O registro do estado inicial foi preservado na área de trabalho da tarefa.
