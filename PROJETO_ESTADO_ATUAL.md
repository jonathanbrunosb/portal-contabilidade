# Estado Atual do Projeto — Portal da Gerência de Contabilidade

> **Documento vivo — fonte única de estado.** Pode ser atualizado ou sobrescrito livremente sempre que o projeto evoluir. Histórico e rollback ficam no **git**. Itens concluídos vão para `PROJETO_ESTADO_RESOLVIDOS.md`. O detalhe de design (decisões travadas do redesign, medidas, receitas) continua em `.claude/redesign/00-estado-e-proximos-passos.md` e `.claude/redesign/03-sistema-visual.md`. **Regras de trabalho e de commit:** `.claude/CLAUDE.md`.
>
> **Snapshot técnico** — Data: **2026-09-22 (checkpoint)**
> **Git:** branch `ajustes-frontend-dudu`, **29 commits à frente de `6b6273c`** depois do commit deste checkpoint, um por assunto (seção 2). Último antes do checkpoint: `8ac9f49` "Publicar os três comunicados do MigraSAP de setembro". **Nada enviado** (`git push` só quando o usuário pedir). `main` não recebeu nada.
> **App/Stack:** HTML + CSS + JavaScript puro (ES modules), sem build, sem CDN. Conteúdo em `data/*.json`. Servidor estático Python na porta **5500** (`.claude/launch.json`, nome `portal`). Backend **opcional** `server/server.js` (Node, porta 8787), ligado por `window.PORTAL_API_ENABLED = true`.
> **Working tree:** limpo depois do commit do checkpoint. Cache-buster: `?v=20260922-3`.
> **Máquina:** `projeto/` (material interno: e-mails, peças baixadas, moldes) e as skills de terceiros estão no disco, fora do Git (`.gitignore`).

---

## 0. Panorama rápido (TL;DR)

| Frente | Estado | Codificado? |
|--------|--------|-------------|
| **Commit por assunto** (regra do usuário) | em uso — `.claude/CLAUDE.md`, skill, memória | Sim, `da4c663` |
| Origem do conteúdo, filtro, selo; Documentos sem filtro de grupo | concluída | Sim, `1b7792a` |
| **Comunicação** unificada por origem + página em **formato de jornal** + capa em 3 colunas | concluída | Sim, `803a3b6` |
| **Carrossel** no molde do usuário, gestão pela tela | concluída | Sim, `a7343a1` |
| Capa com a Comunicação à vista; realce das abas e comunicados | concluída | Sim, `56673a2`, `6b8245e` |
| **Comunicados tirados de e-mail** (IFRS 16, Movimentação, MigraSAP ×3, e os de 21/09) | concluída — 6 na aba Equatorial, 3 na Contabilidade | Sim, `e6b74bf`, `8ac9f49` |
| Capa da Movimentação com a Gerente e os executivos (larga + miniatura 8:7) | concluída | Sim, `fc2c40a`, `116ef01` |
| **Links das imagens dos e-mails** embutidos na peça e como botão (regra nova) | concluída e aplicada aos publicados | Sim, `7b1d8ff` |
| Boletim "Fique por Dentro" da Comunicação Equatorial Goiás | **removido** a pedido (3 comunicados) | Sim, `152731e` |
| **Busca do cabeçalho com sugestões** + página `#busca/<termo>` | concluída | Sim, `4c8a552` |
| Links do ECD e do ECF no gov.br | concluída | Sim, `9b63979` |
| Externos: **BMP e RIT** (ANEEL, arte da tela) e **Claude** | concluída | Sim, `dfd3e7e`, `8867bd9` |
| Permissão "gerencial" para Eduardo/Jonathan; tela de Avisos | **mapeadas — o usuário faz depois** (itens 10 e 11) | Não |
| Publicação (GitHub Pages é público; o portal "será interno") | **bloqueada** — decisão de hospedagem | n/a |
| Decisões de conteúdo pendentes (moldes do carrossel, ANEEL, avisos, link da RR) | pendente, com o usuário | Não |

> **Atenção — bloqueio de publicação:** `.github/workflows/pages.yml` publica a `main` em **portal.contabilidade-eqtl.com, sem login**. O usuário decidiu que o portal **será interno** e autorizou conteúdo interno (comunicados do Grupo, fotos e currículos de colegas, capturas reais dos sistemas e do SAP). **Não fazer merge desta branch na `main` enquanto a hospedagem não for interna ou com autenticação.** Commits e `git push` da branch não publicam nada (o Pages publica só a `main`); o push continua dependendo de pedido do usuário.

---

## 1. Decisões arquiteturais

### 1.1 Origem do conteúdo
- **Campo `origem`** (`contabilidade` | `equatorial` | `externo`) em todo conteúdo publicado — **porque** o usuário precisa segregar por quem produz. **Critério: quem escreveu, não o tema.** Exceção do usuário (21/09): comunicado da Diretoria de Controladoria sobre a própria área (a Movimentação de 14/05) é Contabilidade.
- Paleta do usuário: Contabilidade verde-água `#0D6B64`, Equatorial `#004AAD`, Externo roxo `#6A4BC9` (tokens `--origem-*`, AA). Selo cheio; a categoria perdeu a cor.
- `origemDe(colecao,item)` + `ORIGEM_PADRAO` em `js/app.js`.

### 1.2 Navegação, filtros e busca
- **"Filtro não repete aba"**: sem `<select>` de grupo em Documentos; filtros montados sobre a lista da aba e somem com uma opção só.
- **Busca do cabeçalho** (22/09, `js/busca.js` + `indiceDaBusca()` em `js/app.js`) — **porque** os resultados apareciam abaixo do carrossel, fora da tela, e o JSON inteiro era comparado. Sugestões abaixo do campo a partir de 2 letras (padrão combobox da WAI-ARIA), agrupadas pela seção do menu; Enter abre `#busca/<termo>` com filtros "Onde" e "Origem". Índice só com campos que uma pessoa usaria: páginas, comunicados, sistemas, portais, links, atalhos, automações, documentos, pessoas (perfil com `time`), avisos/agenda da capa e, para a gerência, processos e entregas.

### 1.3 Comunicação
- **Lista única** (Newsletter + Notícias) com abas Todos / Contabilidade / Equatorial / Externo; dados continuam em dois arquivos (o Painel Editorial grava neles). Duplicata aparece uma vez.
- **Página própria** `#central/comunicado/<coleção>/<id>` em **formato de jornal**. Marcação no texto: `## ` intertítulo, `[figura N]` imagem de `figuras`, `**…**` negrito do original; figura `"tipo":"retrato"` = foto de pessoa presa ao parágrafo.
- Imagens: `imagem` (página), `imagemCapa` (recorte da faixa/capa), `imagemMiniatura` (8:7, só miniaturas), `imagemFoco` (lado que os recortes guardam). Peça **mais de 1,8× mais alta que larga** marca a página `cartaz-alto`: as figuras do texto ficam onde o texto as chama, ao lado da peça.
- **Capa**: três colunas por origem, **sempre os 4 mais recentes** de cada uma, sem faixa de título.
- Comunicado de terceiros: resumo com palavras próprias, autor/veículo em `fonte`, íntegra em `urlFonte` + `rotuloLink`.

### 1.4 Comunicados tirados de e-mail (21–22/09, regras do usuário)
- **"Preservar sempre a fonte original":** texto **transcrito** (erros do original mantidos, só as saudações saem), negritos do original, peça e fotos do próprio e-mail, `fonte` com remetente, data, assunto e quem assina.
- **Links das imagens (22/09, vale daqui em diante):** todo link que a imagem traz — imagem inteira com `<a>`, "clique aqui", botão, QR Code, e-mail escrito — vai em `links` `{rotulo, url, area:[x,y,w,h], figura?}`: o trecho fica clicável por cima da peça (`[0,0,1,1]` = imagem inteira, com lupa para ampliar) e vira botão nas ações. Aceita `mailto:`.
- **Rastreador nunca:** `app.simplificaci.com.br/dntracker|errata|mail-report` não entra no portal nem é aberto (registra clique em nome de quem recebeu). O destino sai do QR Code (OpenCV), do texto da peça ou de link direto; `.claude/tools/msgread.py` aponta as imagens com link e marca as de rastreador.
- **Peças hospedadas fora** (servidor da Comunicação): baixar **só com autorização do usuário**, para `projeto/comunicados-emails/<data>-<assunto>/`; os pixels de rastreamento não são carregados.
- Boletim da Comunicação Equatorial **Goiás** foi removido a pedido (22/09); não repor sem pedido.

### 1.5 Dados e perfis
- Dados ilustrativos removidos (aprovado); blocos vazios mostram "Nenhum … cadastrado ainda".
- Administradores em `data/usuarios.json` (Jonathan e Eduardo) com `permissoes: ["conteudo","time","administracao"]` — **sem `gerencial`**, por isso não veem o Painel Editorial (item 10 dos próximos passos). A Administração pede o **código de acesso** — só o hash `ADMIN_UNLOCK_HASH` fica em `js/app.js`. Para trocar: `python .claude/tools/trocar-codigo-admin.py` + `versao.py --subir`.
- **Onde se edita a capa** (resposta de 22/09): carrossel em `data/destaques.json` (ou Administração → Carrossel, com servidor); Avisos em `data/avisos.json` (vazio) + `data/agenda.json` com `naCapa`; Acesso rápido automático (`config.json › links` + sistemas "Ativo", até 8); Comunicação em `newsletter.json`/`noticias.json` ou Painel Editorial (com servidor e `gerencial`).

### 1.6 Carrossel

| Decisão | Escolha |
|---------|---------|
| Gestão | Registro por slide em `data/destaques.json` que **aponta para um destino** e herda dele o que ficar em branco (`js/destaques.js`). |
| Onde se gerencia | Administração → Carrossel; bloco na página do comunicado; "Destacar no carrossel" nas fichas. Grava com o `server.js`. |
| Molde | O do usuário (Figma 2000×519), texto em HTML; `.claude/tools/moldes-destaques.py` gera fundo e cena. |
| Formatos | `imagem` (padrão) e `molde`. Contraste medido sobre o fundo real (`.claude/tools/carrossel-teste/`). |
| Tamanho na capa | ≥ 1200 px: ao lado de Avisos + Acesso rápido, `clamp(300px, 46vh, 420px)`; abaixo, largura toda. |
| Limite | 5 no ar (`LIMITE_NO_AR`); hoje são 6. |

### 1.7 Interface
- **Cabeçalho**: camada do tamanho exato da foto (`--ph-foto-largura`) dissolve a borda dela no fundo. Se trocar a foto, atualizar o `calc`.
- **Realce**: tokens `--ease-saida`, `--dur-estado`, `--dur-imagem`, `--respiro-painel`; `.pg-line` desliza nas abas (cor da origem na Comunicação).
- **Arte dos cartões**: modo tela quando dá para ver a tela (BMP e RIT: `arte_bmp.py`, cores lidas dos pixels do site pelo navegador, sem baixar); modo marca para assistentes de IA (ChatGPT, Claude, Gemini). Rodar o `arte-marcas.py` reescreve artes alheias (Pillow): `git checkout --` nelas e commitar só a nova.

### 1.8 Commit por assunto (pedido do usuário, 21/09)
- **Cada assunto pronto e verificado vira um commit feito pelo Claude, sem esperar pedido**, com código, dados, imagens **e a documentação dele**; `git add` por caminho; mensagem em português no imperativo. Nada na `main`; **push só a pedido**. Regra completa em `.claude/CLAUDE.md`.

> **Premissas confirmadas:** o `server.js` grava qualquer campo (PUT faz merge) e aceita `destaques` e `avisos`; upload por lista fechada (`UPLOAD_DIRS`). O Pages publica tudo que está versionado, menos `.claude server projeto TESTES.md` e os dois `PROJETO_ESTADO_*.md`. O repositório guarda LF; os arquivos em disco misturam CRLF/LF (`eol.py`). Os dados são buscados com `cache:'no-cache'` — mudança só em `data/*.json` não pede subir a versão.

---

## 2. O que já foi codificado

| Commit | Conteúdo |
|--------|----------|
| `6b6273c` | Base (outra máquina): Portais e Links repartidos, carrossel do Conecta, arte dos cartões. |
| `59832ff`..`8e7b0ef` | Dia 21/09 separado por assunto: versão -46, origem, atalhos, Comunicação unificada, dados ilustrativos, 6 comunicados Equatorial, carrossel, lápis/abas Todos e Power BI, reunião do Outlook, CFC, arte do IFRS 16, fio do cabeçalho, realce, 4 por origem, capa à vista, ferramenta do código da Administração. |
| `da4c663` | Checkpoint de 21/09 e a regra de commit por assunto (`.claude/CLAUDE.md`). |
| `e6b74bf` | Comunicados do IFRS 16 e da Movimentação da Controladoria (negrito, retrato, imagem do topo que amplia). |
| `fc2c40a` | Capa da Movimentação: Alexandra + 4 executivos em quadros; `imagemFoco`. |
| `116ef01` | Miniatura 8:7 da Movimentação (`imagemMiniatura`). |
| `4c8a552` | Busca do cabeçalho com sugestões e página `#busca/<termo>` (`js/busca.js`). |
| `9b63979` | Links do ECD e do ECF no gov.br. |
| `dfd3e7e` | BMP e RIT (ANEEL) nos Externos, arte da tela (`arte_bmp.py`). |
| `8867bd9` | Claude nos Externos (marca oficial, `assets/marcas/claude.svg`). |
| `b6ab296` | Tarefas deixadas para depois mapeadas (itens 10–12). |
| `152731e` | Boletim da Comunicação Equatorial Goiás removido (3 comunicados + imagens). |
| `7b1d8ff` | Links das imagens dos e-mails embutidos na peça e como botão; aplicado aos publicados; `msgread.py` aponta links e rastreadores. |
| `8ac9f49` | Três comunicados do MigraSAP (10, 17 e 18/09); layout `cartaz-alto`. |
| (checkpoint) | Este arquivo. |

**Ainda não codificado (só plano):** permissão `gerencial` para os administradores; aba Avisos na Administração; cliques por slide na aba Carrossel; avisos da SIPAT e do Data Services; paginação da lista de Comunicação.

---

## 3. Planos e documentos

| Documento | Caminho | Frente |
|-----------|---------|--------|
| Regras do projeto e de commit | `.claude/CLAUDE.md` | todas |
| Estado do redesign, decisões travadas, pendências | `.claude/redesign/00-estado-e-proximos-passos.md` | todas (detalhe) |
| Sistema visual (tokens, grade, origem, Comunicação, links das imagens, busca, carrossel) | `.claude/redesign/03-sistema-visual.md` | visual |
| Arte dos cartões | `.claude/redesign/04-arte-dos-cartoes.md` | arte |
| Regras de interface (carregar antes de mexer) | `.claude/skills/portal-corporativo/SKILL.md` | interface |
| E-mails e peças de origem | `projeto/comunicados-emails/`, `projeto/modelos-emails/` (fora do Git) | comunicados |
| Registro de testes | `TESTES.md` | verificação |

---

## 5. Estado verificado

- **Busca** (Playwright, 1366 e 375 px, Visitante e identificado): sugestões certas para "sap", "power bi", "fb03", "cpc 06"; setas/Enter/Esc; links externos abrem em outra aba pelo clique e pelo Enter; `#busca/<termo>` com filtros; Voltar funciona; rotas principais sem erro e sem rolagem lateral.
- **Comunicados de e-mail**: páginas do IFRS 16, Movimentação, MigraSAP ×4 e Agentes conferidas em 1366/1024/375 — trechos clicáveis nas posições certas (retângulos desenhados sobre a peça antes de gravar), botões sem repetição, lupa no IFRS 16, figuras na ordem nas peças longas, nenhum `**` à mostra.
- **Cartões novos**: BMP e RIT e Claude com arte, link, ficha e sugestão da busca; ECD/ECF levando ao gov.br.
- **Capa**: coluna Contabilidade 3 comunicados, Equatorial 4 dos 6 (destaque: Tipo de Movimento), Externo 2; miniatura da Movimentação com as 5 pessoas inteiras.
- **Não verificado:** a Administração com o código real; "Novo rascunho" do Painel Editorial com servidor; upload real de imagem; os trechos clicáveis num leitor de tela real (só pelos atributos `aria-label`).

---

## 6. Próximos passos imediatos

1. **Resolver a hospedagem antes de qualquer merge na `main`** — `pages.yml` publica site aberto; a branch tem conteúdo interno.
2. **Enviar a branch** (`git push`) quando o usuário pedir — 29 commits locais.
3. **Código da Administração**: o usuário recupera o código na sessão de 16/09 (commit `9d9736c`) ou define um novo com `.claude/tools/trocar-codigo-admin.py`.
4. **Conteúdo dos moldes do carrossel** (`data/destaques.json`): fundo licenciado para o IFRS 16; texto certo do Cronograma; Auditoria "Em desenvolvimento" ou "Ativo"; "Executiva IV" ou "Contabilidade IV"; descrição própria do Controle de Horas. O slide do IFRS 16 ainda aponta para o sistema — pode passar a abrir o comunicado das melhorias.
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
    - *Decidir junto:* se a mesma aba também cadastra os compromissos da agenda que vão para a capa (`naCapa`), e se um aviso pode ter link (a regra dos links das imagens já dá o molde: `links` com `rotulo`/`url`).
    - *Pronto quando:* com o servidor ligado, um aviso criado pela tela aparece na capa dentro do período e some depois do `fim`; sem servidor, a aba abre só para leitura, com aviso; TESTES.md atualizado.
12. **Busca: termos curtos no meio da palavra** (achado em 22/09; decidir antes de mexer). "rit" também traz "Escrituração" (SPED) e "restrito" (EQTL Previ). Opção: em `js/busca.js › pontuar()`, exigir início de palavra para termos de até 3 letras quando o casamento não for no título. Custo: "sap" deixaria de achar comunicados que só dizem "MigraSAP" no texto (continuam os que têm no título).
13. **Trecho clicável pequeno nas peças longas** (MigraSAP de 17 e 18/09: o e-mail do rodapé fica com ~103×10 px porque a peça encolhe até a altura da tela). O botão logo abaixo leva ao mesmo endereço (atende a exceção "controle equivalente" do WCAG 2.5.8); se o usuário quiser, dá para ampliar o alvo sem mover o trecho.
14. Opcional: `/impeccable init` (o projeto não tem `PRODUCT.md`) e atualizar o Impeccable (v3.9.1 → v4.3.1, `npx impeccable update`).

---

## 7. Receita — testar a gestão do carrossel com o servidor

1. Copiar `data/*.json` para uma pasta temporária (ex.: scratchpad `api-teste/data`) e criar `api-teste/assets/users`.
2. Rodar: `PORTAL_DATA_DIR=<temp>/data PORTAL_ASSETS_USERS_DIR=<temp>/assets/users PORTAL_AUDIT_LOG=<temp>/audit.log node server/server.js` (Bash, em segundo plano).
3. Criar `projeto/_teste-api.html` = `index.html` com `<base href="/">` e `<script>window.PORTAL_API_ENABLED = true; window.PORTAL_API_PORT = 8787;</script>` no `<head>`; abrir em `http://127.0.0.1:5500/projeto/_teste-api.html`.
4. Identificar-se pela janela "Qual área você atua?" e liberar a Administração com o código.
5. No fim: parar o processo da porta 8787, apagar `projeto/_teste-api.html` e a pasta temporária.

## 8. Receita — comunicado a partir de e-mail

1. `python .claude/tools/msgread.py projeto/comunicados-emails <scratchpad>/emails` — texto, anexos e **imagens com link** (marca as de rastreador). A data sai do `__properties_version1.0` (PR_CLIENT_SUBMIT_TIME).
2. Peça hospedada fora: ver no navegador do app e **pedir autorização** antes de baixar; salvar em `projeto/comunicados-emails/<data>-<assunto>/`.
3. Transcrever fiel à peça (negrito `**`, intertítulos `##`, figuras `[figura N]`, retratos); `fonte` com remetente, data, assunto, quem assina.
4. Links: de cada imagem, `links` com `area` (desenhar os retângulos sobre a peça para conferir); rastreador nunca — destino do QR Code, do texto ou de link direto.
5. Imagens em `assets/images/comunicados/` (peça, `-capa` 16:9, figuras); conferir no Playwright em 1366 e 375; commit do assunto.

---

## N. Como rodar / onde as coisas vivem

- **Subir:** `preview_start` com `name: "portal"` (porta 5500) — ou `INICIAR.cmd`. Backend opcional: `node server/server.js` (8787) + `window.PORTAL_API_ENABLED`.
- **Depois de mexer em CSS/JS/arte:** `python .claude/tools/versao.py --subir` e `python .claude/tools/eol.py <arquivos>`.
- **Checar:** `.claude/tools/contraste.js` no console do preview — menos no carrossel (`.claude/tools/carrossel-teste/`). Capturas em tamanho real: Playwright está instalado (escolher "Visitante" na janela de identificação). Medir com `getBoundingClientRect()` antes de confiar numa captura do painel.
- **Editar documentação por script:** o heredoc do Bash quebra com aspas e `\b` — escrever o script com o Write e rodar; arquivos com CRLF pedem trocar sobre o texto normalizado para LF.
- **Git:** **um commit por assunto**, feito pelo Claude assim que o assunto fica pronto e verificado (`.claude/CLAUDE.md`); branch `ajustes-frontend-dudu`; nunca na `main`; push só a pedido.
- **Regras:** carregar a skill `portal-corporativo` antes de mexer na interface; antes de remover conteúdo de `data/*.json`, listar e confirmar; artes novas seguem `04-arte-dos-cartoes.md`; o firewall bloqueia `*.contabilidade-eqtl.com` nesta máquina (nunca "Proceed"); baixar arquivo só com autorização.
- **Onde vivem:** `js/app.js` (rotas, telas, admin, agenda, índice da busca), `js/busca.js` (pontuação, destaque, caixa de sugestões), `js/newsletter.js` (Comunicação, links das imagens), `js/destaques.js` + `js/carousel.js` (carrossel), `js/ui.js` (utilitários, ícones, origem), `css/styles.css` (tokens no `:root`), `data/*.json`, `assets/`, `server/server.js`, `.claude/tools/` (versão, EOL, contraste, arte, moldes, código da Administração, `msgread.py`), `projeto/` (fora do Git).
