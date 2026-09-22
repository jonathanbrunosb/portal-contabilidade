# Estado Atual do Projeto — Portal da Gerência de Contabilidade

> **Documento vivo — fonte única de estado.** Pode ser atualizado ou sobrescrito livremente sempre que o projeto evoluir. Histórico e rollback ficam no **git**. Itens concluídos vão para `PROJETO_ESTADO_RESOLVIDOS.md`. O detalhe de design (decisões travadas do redesign, medidas, receitas) continua em `.claude/redesign/00-estado-e-proximos-passos.md` e `.claude/redesign/03-sistema-visual.md`. **Regras de trabalho e de commit:** `.claude/CLAUDE.md`.
>
> **Snapshot técnico** — Data: **2026-09-22**
> **Git:** branch `ajustes-frontend-dudu`, **25 commits à frente de `6b6273c`**, um por assunto (seção 2); depois do checkpoint ("Documentar o dia 21/09 e adotar commit por assunto") vieram o dos comunicados tirados dos e-mails (IFRS 16 e Movimentação da Controladoria) e os dois da capa da Movimentação com as fotos (a larga e a miniatura 8:7); em 22/09, a busca do cabeçalho com sugestões, os links do ECD e do ECF, os cartões do BMP e RIT e do Claude nos Externos e este registro das tarefas deixadas para depois. **Nada enviado** (`git push` só quando o usuário pedir). `main` não recebeu nada.
> **App/Stack:** HTML + CSS + JavaScript puro (ES modules), sem build, sem CDN. Conteúdo em `data/*.json`. Servidor estático Python na porta **5500** (`.claude/launch.json`, nome `portal`). Backend **opcional** `server/server.js` (Node, porta 8787), ligado por `window.PORTAL_API_ENABLED = true`.
> **Working tree:** limpo depois do commit do checkpoint. Cache-buster: `?v=20260922-1`.
> **Máquina:** `projeto/` (material interno) e as skills de terceiros estão no disco, fora do Git (`.gitignore`).

---

## 0. Panorama rápido (TL;DR)

| Frente | Estado | Codificado? |
|--------|--------|-------------|
| **Commit por assunto** (regra nova, pedido do usuário) | concluída — `.claude/CLAUDE.md`, skill, memória | Sim (checkpoint) |
| Origem do conteúdo, filtro, selo, busca ampliada; Documentos sem filtro de grupo | concluída | Sim, `1b7792a` |
| Atalhos duplicados e artes órfãs removidos | concluída | Sim, `4bc7676` |
| **Comunicação** unificada por origem + página do comunicado em **formato de jornal** + capa em 3 colunas | concluída | Sim, `803a3b6` |
| Dados ilustrativos removidos; Jonathan e Eduardo administradores | concluída | Sim, `d65dd19` |
| 6 comunicados da Comunicação Equatorial (3 do boletim de Goiás removidos em 22/09) | concluída | Sim, `c074528` |
| **Carrossel** no molde do usuário, gestão pela tela, formatos imagem/molde, ferramentas de contraste | concluída | Sim, `a7343a1` |
| Lápis do administrador; abas **Todos** e **Power BI** | concluída | Sim, `ed85f94` |
| Reunião do Outlook em Avisos, com `.ics` | concluída — o convite não tem link de reunião | Sim, `01513bf` |
| Comunicado do CFC (IA generativa e dados), 2 imagens do Gemini | concluída | Sim, `644c00d` |
| Arte do IFRS 16 da nova tela de entrada | concluída | Sim, `e54539e` |
| Fio do cabeçalho (emenda fundo/foto) | concluída | Sim, `a259b2c` |
| **Realce** das abas e dos comunicados (passada do `/impeccable polish`) | concluída | Sim, `6b8245e` |
| Capa: sempre os 4 comunicados mais recentes por origem | concluída | Sim, `14a578b` |
| **Capa com a Comunicação à vista** (Avisos e Acesso rápido ao lado do carrossel) | concluída | Sim, `56673a2` |
| Ferramenta para trocar o código da Administração | concluída — o código atual não está no repositório | Sim, `8e7b0ef` |
| Publicação (GitHub Pages é público; o portal "será interno") | **bloqueada** — decisão de hospedagem | n/a |
| Decisões de conteúdo pendentes (moldes do carrossel, ANEEL, avisos, link da RR) | pendente, com o usuário | Não |

> **Atenção — bloqueio de publicação:** `.github/workflows/pages.yml` publica a `main` em **portal.contabilidade-eqtl.com, sem login**. O usuário decidiu que o portal **será interno** e autorizou conteúdo interno (comunicados da Comunicação Equatorial, foto de colegas, capturas reais dos sistemas). **Não fazer merge desta branch na `main` enquanto a hospedagem não for interna ou com autenticação.** Commits na branch não publicam nada; o `git push` da branch também não (o Pages publica só a `main`), mas continua dependendo de pedido do usuário.

---

## 1. Decisões arquiteturais

### 1.1 Origem do conteúdo
- **Campo `origem`** (`contabilidade` | `equatorial` | `externo`) em todo conteúdo publicado — **porque** o usuário precisa segregar por quem produz. **Critério: quem escreveu, não o tema.** Exceção do usuário (21/09): comunicado da Diretoria de Controladoria sobre a própria área (a Movimentação de 14/05) é Contabilidade.
- Paleta do usuário: Contabilidade verde-água `#0D6B64`, Equatorial `#004AAD`, Externo roxo `#6A4BC9` (tokens `--origem-*`, AA). Selo cheio; a categoria perdeu a cor.
- `origemDe(colecao,item)` + `ORIGEM_PADRAO` em `js/app.js`.

### 1.2 Navegação e filtros
- **"Filtro não repete aba"**: sem `<select>` de grupo em Documentos; filtros montados sobre a lista da aba e somem com uma opção só.
- **Busca do cabeçalho com sugestões** (22/09, `js/busca.js`): a lista aparece abaixo do campo ao digitar, agrupada pela seção do menu; Enter abre `#busca/<termo>`. Índice só com os campos que uma pessoa usaria (nunca o JSON inteiro): páginas, comunicados, sistemas, portais, links, atalhos, automações, documentos, pessoas (perfil com `time`), avisos/agenda da capa e, para a gerência, processos e entregas.

### 1.3 Comunicação
- **Lista única** (Newsletter + Notícias) com abas Todos / Contabilidade / Equatorial / Externo; dados continuam em dois arquivos (o Painel Editorial grava neles). Duplicata aparece uma vez.
- **Página própria** `#central/comunicado/<coleção>/<id>` em **formato de jornal** (texto justificado com hifenização, imagens em `float` a 49% alternando lados, rodapé com ações + ficha + "Mais comunicados"). Marcação no texto: `## ` intertítulo, `[figura N]` imagem de `figuras`.
- **Capa**: três colunas por origem, **sempre os 4 mais recentes** de cada uma (destaque = o mais recente dos 4 com imagem), **sem faixa de título** "Comunicação" (h2 só para leitor de tela).
- Comunicado de terceiros: resumo com palavras próprias, autor/veículo em `fonte`, íntegra em `urlFonte` + `rotuloLink`; nunca copiar texto de terceiros.

### 1.4 Dados e perfis
- Dados ilustrativos removidos (aprovado); blocos vazios mostram "Nenhum … cadastrado ainda".
- Administradores em `data/usuarios.json` com o mesmo `id` do quadro das equipes (Jonathan e Eduardo). A janela de Administração pede o **código de acesso** — só o hash `ADMIN_UNLOCK_HASH` fica em `js/app.js`; o código não está no repositório. Para trocar: `python .claude/tools/trocar-codigo-admin.py` + `versao.py --subir`.

### 1.5 Conteúdo da Comunicação Equatorial
- Portal **interno** → conteúdo interno autorizado (ver bloqueio). **Nunca copiar links dos e-mails** (rastreador); só destino direto.

### 1.6 Carrossel

| Decisão | Escolha |
|---------|---------|
| Gestão | Registro por slide em `data/destaques.json` que **aponta para um destino** e herda dele o que ficar em branco (`js/destaques.js`). |
| Onde se gerencia | Administração → Carrossel; bloco na página do comunicado; "Destacar no carrossel" nas fichas. Grava com o `server.js`. |
| Molde | O do usuário (Figma 2000×519), texto em HTML; `.claude/tools/moldes-destaques.py` gera fundo e cena. |
| Formatos | `imagem` (padrão: imagem na altura toda, fundo tirado dela) e `molde`. |
| Contraste | Só efeitos que escurecem do lado do texto; medido sobre o fundo real (`.claude/tools/carrossel-teste/`). |
| Tamanho na capa | **A partir de 1200 px**: ao lado de Avisos + Acesso rápido, altura pela janela `clamp(300px, 46vh, 420px)` (estica se a coluna for mais alta), imagem a 50%, título até 3 linhas. Abaixo de 1200 px: largura toda, proporção 3,85, mínimo 300 px. |
| Limite | 5 no ar (`LIMITE_NO_AR`); hoje são 6. |

### 1.7 Interface (21/09, noite)
- **Cabeçalho**: camada do tamanho exato da foto (`--ph-foto-largura: calc(420px * 1672 / 940)`) dissolve a borda dela no fundo — em janela > 747 px a borda virava um fio. Se trocar a foto, atualizar o `calc`.
- **Realce**: tokens `--ease-saida` (ease-out-quart), `--dur-estado` 0,2 s, `--dur-imagem` 0,6 s; `--respiro-painel` 18/14 px alinha o nome da seção com o conteúdo. `.pg-line` = fio + véu que deslizam; nas abas da Comunicação, cor da origem (`data-origem`). Texto das abas em `--azul-marca` (o `--azul-ativo` dava 4,1:1 sobre o véu). Faixas: borda na cor da origem, imagem 1,04, sublinhado suave, anel de foco na faixa inteira (`:has`). Sem aproximação com "Reduzir movimento".

### 1.8 Commit por assunto (pedido do usuário, 21/09)
- **Cada assunto pronto e verificado vira um commit feito pelo Claude, sem esperar pedido**, com código, dados, imagens **e a documentação dele**; `git add` por caminho; mensagem em português no imperativo. Nada na `main`; **push só a pedido**. Regra completa em `.claude/CLAUDE.md` (lida em toda sessão), repetida na skill `portal-corporativo` e na memória.
- **Por quê:** o dia 21/09 acumulou ~12 assuntos em 59 arquivos sem commit. Ele foi separado depois, trecho a trecho, nos commits `59832ff`..`8e7b0ef` (ver RESOLVIDOS); a documentação do dia misturava assuntos e foi no commit do checkpoint.

> **Premissas confirmadas:** o `server.js` grava qualquer campo (PUT faz merge) e aceita `destaques`; upload por lista fechada (`UPLOAD_DIRS`). O Pages publica tudo que está versionado, menos `.claude server projeto TESTES.md` e os dois `PROJETO_ESTADO_*.md`. O repositório guarda LF; os arquivos em disco misturam CRLF/LF (`eol.py`).

---

## 2. O que já foi codificado

| Commit | Conteúdo |
|--------|----------|
| `6b6273c` | Base (outra máquina): Portais e Links repartidos, carrossel do Conecta, arte dos cartões. |
| `59832ff` | Cache-buster 20260921-46 (só as referências `?v=`). |
| `1b7792a` | Origem do conteúdo, filtro e selo; busca ampliada; Documentos sem filtro de grupo. |
| `4bc7676` | Atalhos duplicados e artes órfãs removidos. |
| `803a3b6` | Comunicação unificada, página do comunicado em jornal, capa em 3 colunas (`js/newsletter.js` na forma final). |
| `d65dd19` | Dados ilustrativos removidos; administradores. |
| `c074528` | 6 comunicados da Comunicação Equatorial + imagens. |
| `a7343a1` | Carrossel no molde, gestão pela tela, formatos, `js/destaques.js`, ferramentas. |
| `ed85f94` | Lápis; abas Todos e Power BI. |
| `01513bf` | Reunião do Outlook em Avisos + `.ics`. |
| `644c00d` | Comunicado do CFC + 2 imagens do Gemini. |
| `e54539e` | Arte do IFRS 16 (`arte_arrendamento.py`). |
| `a259b2c` | Fio do cabeçalho. |
| `6b8245e` | Realce das abas e dos comunicados. |
| `14a578b` | 4 comunicados mais recentes por origem na capa. |
| `56673a2` | Avisos e Acesso rápido ao lado do carrossel; sem faixa de título da Comunicação. |
| `8e7b0ef` | `.claude/tools/trocar-codigo-admin.py`. |
| (checkpoint) | `.claude/CLAUDE.md`, docs do dia, `PROJETO_ESTADO_*.md`, `pages.yml` excluindo os arquivos de estado. |

> Os commits de `59832ff` a `8e7b0ef` foram **remontados depois** a partir do estado final: cada estágio foi conferido (JSON válido, `node --check` no JS, chaves do CSS), mas não foi aberto no navegador — só o estado final foi testado na tela.

**Onde vivem as funções principais:** ver "Como rodar" abaixo e o inventário do checkpoint anterior no histórico (`git show <checkpoint>:PROJETO_ESTADO_ATUAL.md`).

**Ainda não codificado (só plano):** cliques por slide na aba Carrossel; avisos da SIPAT e do Data Services; paginação da lista de Comunicação.

---

## 3. Planos e documentos

| Documento | Caminho | Frente |
|-----------|---------|--------|
| Regras do projeto e de commit | `.claude/CLAUDE.md` | todas |
| Estado do redesign, decisões travadas, pendências | `.claude/redesign/00-estado-e-proximos-passos.md` | todas (detalhe) |
| Sistema visual (tokens, grade, origem, Comunicação, carrossel, realce, capa) | `.claude/redesign/03-sistema-visual.md` | visual |
| Arte dos cartões | `.claude/redesign/04-arte-dos-cartoes.md` | arte |
| Regras de interface (carregar antes de mexer) | `.claude/skills/portal-corporativo/SKILL.md` | interface |
| Moldes do carrossel (Figma, SVG) | `projeto/comunicados/` (fora do Git) | carrossel |
| Registro de testes | `TESTES.md` | verificação |

---

## 5. Estado verificado

- Estado final conferido no navegador do app e no Edge/Playwright: **1280, 1366, 1440, 1536, 1920, 1024 e 375 px**; sem rolagem lateral; console limpo.
- **Capa**: títulos das colunas da Comunicação em 537 px (1280×593, 1366×657, 1536×730) e 623 px (1920×911); carrossel e coluna lateral com a mesma altura; contraste dos 6 slides ≥ 4,8:1 sobre o fundo real.
- **Realce**: medido no Chrome do usuário (1536 px, 125%); contraste das abas sobre o véu ≥ 4,7:1; anel de foco pelo teclado.
- **Cabeçalho**: degrau na borda da foto 0–2 tons (antes 11–19).
- **Commits remontados**: `dividir.py verificar` (aplicar tudo = arquivos em disco) e checagem de sintaxe em cada estágio.
- **Não verificado:** a Administração com o código de acesso real (o código não está no repositório); "Novo rascunho" do Painel Editorial com servidor; upload real de imagem; os estágios intermediários dos commits remontados na tela.

---

## 6. Próximos passos imediatos

1. **Resolver a hospedagem antes de qualquer merge na `main`** — `pages.yml` publica site aberto; a branch tem conteúdo interno.
2. **Enviar a branch** (`git push`) quando o usuário pedir — 25 commits locais.
3. **Código da Administração**: o usuário recupera o código na sessão de 16/09 (commit `9d9736c`) ou define um novo com `.claude/tools/trocar-codigo-admin.py`.
4. **Conteúdo dos moldes do carrossel** (`data/destaques.json`): fundo licenciado para o IFRS 16 (hoje a arte da tela de entrada); texto certo do Cronograma; Auditoria "Em desenvolvimento" ou "Ativo"; "Executiva IV" ou "Contabilidade IV"; descrição própria do Controle de Horas.
5. **Link da reunião** da RR (25/09) em `data/agenda.json › link`.
6. **Comunicado do CFC**: o artigo é de 19/04/2024 — confirmar a data de publicação no portal (21/09/2026).
7. **Reduzir o carrossel a 5 no ar** — hoje 6; candidato: Controle de Horas.
8. **Notícia da ANEEL**: trocar `responsavel`/`aprovadoPor` "Marina Oliveira" (fictícia) e `areaResponsavel` "Normas e Reporte".
9. **Avisos com prazo** (se o usuário quiser): SIPAT 21–25/09 e Data Services legado até 30/09.
10. **Permissão "gerencial" para Eduardo e Jonathan** — mapeado em 22/09, **o usuário vai fazer depois** (pediu para não mexer ainda).
    - *Por quê:* o Painel Editorial (menu Gestão) exige a capacidade `gerencial`; os dois perfis de `data/usuarios.json` têm `permissoes: ["conteudo","time","administracao"]` e, por isso, **não veem** Gestão nem o Painel Editorial — justamente quem administra o portal.
    - *Onde:* `data/usuarios.json` › "Jonathan Bruno Santos Bezerra" e "Eduardo dos Santos Rocha" › `permissoes`: acrescentar `"gerencial"`. Nenhuma mudança de código (`hasAccess()` em `js/auth.js` lê a lista; `TARGET_ACCESS`/`SECTION_ACCESS` em `js/app.js` já ligam Gestão a `gerencial`).
    - *O que muda na tela:* aparece o menu **Gestão** (Painel da Gerência, Processos críticos, Agenda & Entregas, Painel Editorial), o item "Alertas da gerência" no menu do usuário, e a busca passa a achar processos e entregas. Os painéis de gestão mostram "Nenhum … cadastrado ainda" enquanto `kpis`, `processos.json`, `agenda.json` e `entregas.json` estiverem vazios.
    - *Para editar pelo painel:* servidor ligado (`INICIAR_API.cmd`) e a página com `window.PORTAL_API_ENABLED = true` — pela cópia de teste da seção 7, nunca no `index.html` publicado. Sem servidor, o painel abre só para leitura.
    - *Decidir junto:* se mais alguém recebe `gerencial`; e se vale separar quem escreve de quem aprova (capacidade `editorial-aprovar`, citada no README, "Limitações conhecidas").
    - *Pronto quando:* identificado como Eduardo (e como Jonathan), o menu Gestão aparece e o Painel Editorial lista os comunicados; registrar em TESTES.md.
11. **Tela para cadastrar Avisos** — mapeado em 22/09, **o usuário vai fazer depois**.
    - *Por quê:* Avisos da capa só se editam à mão em `data/avisos.json` (hoje vazio — a capa mostra só a RR, que vem de `data/agenda.json` com `"naCapa": true`).
    - *Campos do aviso* (README, "Destaques e avisos da capa"): `id`, `tipo` (`extra` | `prazo` | `info`), `titulo`, `texto`, `janela` (quando), `area`, `origem`, `inicio` e `fim` (AAAA-MM-DD). A capa mostra até 3 vigentes, Extra primeiro, depois até 2 compromissos da agenda.
    - *Proposta:* uma aba **Avisos** na Administração, no molde da aba Carrossel — lista com a situação (No ar, Agendado, Encerrado, Pausado), Novo aviso, Editar, Pausar/Excluir; formulário com os campos acima e a prévia da linha como ela sai na capa (tarja do tipo + título + janela/área).
    - *Onde mexer:* `index.html` (botão `admin-tab-avisos` em `#admin-tabs`); `js/app.js` (`renderAdmin()` com o caso `avisos`, formulário no molde de `openDestaqueForm()`, gravação com `apiWrite('avisos', …)` e `renderHome()` depois de salvar); `data/config.json › navegacao` (item "Avisos" em Administração com `adminTab: "avisos"`); `css/styles.css` só se a lista precisar de algo além do que a aba Carrossel já usa. O `server/server.js` **já aceita** a coleção `avisos` (`LIST_COLLECTIONS`) — não precisa mexer no servidor.
    - *Decidir junto:* se a mesma aba também cadastra os compromissos da agenda que vão para a capa (`naCapa`), e se um aviso pode ter link.
    - *Pronto quando:* com o servidor ligado, um aviso criado pela tela aparece na capa dentro do período e some depois do `fim`; sem servidor, a aba abre só para leitura, com aviso; TESTES.md atualizado.
12. **Busca: termos curtos no meio da palavra** (achado em 22/09 ao conferir o BMP e RIT; decidir antes de mexer). "rit" também traz "Escrituração" (SPED) e "restrito" (EQTL Previ), porque o termo casa em qualquer ponto da palavra. Opção: em `js/busca.js › pontuar()`, exigir início de palavra para termos de até 3 letras quando o casamento não for no título. Custo: "sap" deixaria de achar comunicados que só dizem "MigraSAP" no texto (continuam os que têm no título).
13. Opcional: `/impeccable init` (o projeto não tem `PRODUCT.md`) e atualizar o Impeccable (v3.9.1 → v4.3.1, `npx impeccable update`).

---

## 7. Receita — testar a gestão do carrossel com o servidor

1. Copiar `data/*.json` para uma pasta temporária (ex.: scratchpad `api-teste/data`) e criar `api-teste/assets/users`.
2. Rodar: `PORTAL_DATA_DIR=<temp>/data PORTAL_ASSETS_USERS_DIR=<temp>/assets/users PORTAL_AUDIT_LOG=<temp>/audit.log node server/server.js` (Bash, em segundo plano).
3. Criar `projeto/_teste-api.html` = `index.html` com `<base href="/">` e `<script>window.PORTAL_API_ENABLED = true; window.PORTAL_API_PORT = 8787;</script>` no `<head>`; abrir em `http://127.0.0.1:5500/projeto/_teste-api.html`.
4. Identificar-se pela janela "Qual área você atua?" e liberar a Administração com o código.
5. No fim: parar o processo da porta 8787, apagar `projeto/_teste-api.html` e a pasta temporária.

---

## N. Como rodar / onde as coisas vivem

- **Subir:** `preview_start` com `name: "portal"` (porta 5500) — ou `INICIAR.cmd`. Backend opcional: `node server/server.js` (8787) + `window.PORTAL_API_ENABLED`.
- **Depois de mexer em CSS/JS/arte:** `python .claude/tools/versao.py --subir` e `python .claude/tools/eol.py <arquivos>` (`git diff --name-only --diff-filter=M` dá a lista; arquivo apagado quebra o `eol.py`).
- **Checar:** `.claude/tools/contraste.js` no console do preview — menos no carrossel, onde vale `.claude/tools/carrossel-teste/` (`servidor.py` + `contraste.py`). Capturas em tamanho real: Playwright está instalado (escolher "Visitante" na janela de identificação). Medir com `getBoundingClientRect()` antes de confiar numa captura do painel.
- **Git:** **um commit por assunto**, feito pelo Claude assim que o assunto fica pronto e verificado (`.claude/CLAUDE.md`); branch `ajustes-frontend-dudu`; nunca na `main`; push só a pedido.
- **Regras:** carregar a skill `portal-corporativo` antes de mexer na interface; antes de remover conteúdo de `data/*.json`, listar e confirmar; artes novas seguem `04-arte-dos-cartoes.md`; o firewall bloqueia `*.contabilidade-eqtl.com` nesta máquina (nunca "Proceed").
- **Onde vivem:** `js/app.js` (rotas, telas, admin, agenda, busca), `js/newsletter.js` (Comunicação), `js/destaques.js` + `js/carousel.js` (carrossel), `js/ui.js` (utilitários, ícones, origem), `css/styles.css` (tokens no `:root`), `data/*.json`, `assets/`, `server/server.js`, `.claude/tools/` (versão, EOL, contraste, arte, moldes, código da Administração), `projeto/` (fora do Git).
