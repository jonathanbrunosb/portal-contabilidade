# Portal da Gerência de Contabilidade

Portal corporativo local em HTML5, CSS3 e JavaScript Vanilla. Não usa Node.js, npm, frameworks, CDN, banco de dados ou serviços em nuvem. Todo o conteúdo é servido por arquivos locais. O servidor HTTP apenas entrega arquivos; não há backend da aplicação.

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
- Publicações com `status: "Publicado"` aparecem na newsletter e na busca. Rascunhos ficam fora dessas visualizações; isso não é controle de acesso.
- Impactos: `Alto`, `Moderado`, `Baixo`.
- Categorias sugeridas estão em `config.json`: ANEEL, CPC, IFRS, Deliberação do Grupo, Comunicado Interno, Regulatório, Auditoria, Tecnologia, IA e Processos.
- `link` recebe a fonte primária e `documento` um arquivo local opcional.
- O radar reúne as publicações, movimenta-se automaticamente e pausa por hover, foco, botão ou preferência de movimento reduzido.

As notícias usam o mesmo esquema. Todo o acervo inicial é demonstrativo: não representa novas normas nem orientações legais verificadas.

### Sistemas e acessos

Preencha `link` com o endereço real e validado. Valores iniciais `null` abrem um aviso de configuração pendente; não há botões que simulam uma integração existente. Sistemas têm `nome`, `descricao`, `icon`, `status` e `responsavel`. Atualize o status após cadastrar o endereço. Links aceitam HTTP(S) ou caminhos locais relativos; protocolos executáveis são rejeitados.

### Equipes

Cada equipe possui `lider`, `quantidade`, `responsaveis`, `responsabilidades`, `empresas` e `solucoes`. `solucoes` contém IDs de `sistemas.json`. A contagem inclui a equipe completa; a lista de responsáveis é uma lista de referência, não um cadastro completo de todos os colaboradores. O organograma deriva das equipes e usa `id: "gerencia"` como raiz.

### Documentos

Troque os documentos demonstrativos por arquivos aprovados, como PDF, HTML ou DOCX, atualizando `arquivo`, `formato`, `versao`, `data` e `responsavel`. O navegador determina se o formato abre diretamente ou é baixado. Categoria e busca textual podem ser combinadas. Os 13 modelos locais abrem e podem ser baixados sem depender de links externos.

### Adicionar menu

Inclua um objeto em `config.json > menu`: `label`, `icon`, `target` e, opcionalmente, `tab`. O `target` corresponde ao ID de uma seção HTML. `tab` pode ser `newsletter`, `noticias`, `sistemas` ou `documentos`. Para uma nova tela, adicione sua seção ao HTML e seu renderizador em `app.js`; para uma nova tab, atualize também o tablist. Os ícones disponíveis estão em `ui.js`.

## Decisões técnicas e experiência

- Módulos ES nativos, dados separados e sem dependências externas.
- Layout com sidebar fixa, topbar sticky e central de conteúdo em duas colunas no desktop.
- Menu móvel com fechamento após seleção, Escape e controle de foco.
- Tabs acessíveis por setas, Home e End; diálogos nativos com Escape e retorno de foco.
- Busca sem diferenciação de acentos, abrangendo conteúdos, equipes, colaboradores, agenda e entregas.
- Indicadores executivos demonstrativos independentes do subconjunto de registros detalhados: 24 processos e 07 sistemas não são contagens automáticas dos cinco processos e quatro sistemas exibidos.
- Preferências locais de tamanho de texto e movimento, com tolerância a armazenamento bloqueado.
- Tratamento de erro no carregamento e nova tentativa; nenhum backend ou autenticação real.
- Identidade visual em azul marinho, azul corporativo e teal; logo vetorial, ícones inline e fontes do sistema, sem requisições a CDNs.

## Uso e métricas locais

O ícone de engrenagem abre, além das preferências de acessibilidade, um painel "Uso deste navegador" com a aba mais acessada, o sistema mais buscado, o termo mais pesquisado, o conteúdo mais consultado e o documento mais baixado.

- Os eventos (`js/analytics.js`) ficam somente em `localStorage`, neste navegador; nada é enviado a servidores. Não é uma medição corporativa: cada colaborador só vê o próprio uso, no próprio dispositivo.
- Nenhum dado pessoal além do termo de busca digitado é registrado; matrícula e nome não entram nos eventos.
- O checkbox "Registrar meu uso do portal neste navegador" permite desativar a coleta a qualquer momento; "Limpar dados locais" apaga o histórico salvo.
- O botão "Exportar dados" baixa um JSON com os eventos brutos — útil para reunir manualmente o uso de várias máquinas até existir uma API central (ver `data-service.js`).
- Isso resolve "o que sabemos sobre o uso do portal neste navegador", não "o que a Gerência usa como um todo". Métricas agregadas de verdade exigem um backend que receba esses eventos — está fora do escopo desta entrega estática.

## Próxima versão

Substituir dados ilustrativos pelos conteúdos, fotos, documentos e URLs aprovados. Depois, evoluir o adaptador de dados para API e autenticação corporativa com SSO, permissões aplicadas no servidor, gestão editorial com revisão e auditoria, histórico de indicadores e organograma completo. Essas integrações não estão implementadas nesta entrega.

## Histórico da entrega

Projeto novo: não havia arquivos de aplicação. Todos os arquivos desta pasta foram criados nesta implementação; nenhum arquivo anterior do usuário foi alterado ou removido. O registro do estado inicial foi preservado na área de trabalho da tarefa.
