# Arquitetura de navegação — Portal Contabilidade (proposta)

> **Aviso (19/09/2026):** aprovado e implementado, mas **parcialmente
> desatualizado**. Depois desta proposta o usuário pediu: menu embutido na
> faixa do cabeçalho, "Sistemas" → **Portais e Links**, novo menu **Sistemas e
> automações**, páginas de seção **sem** faixa de título/trilha (só a faixa de
> subpáginas com a linha deslizante) e Documentos & Normas abrindo direto na
> tabela, com grupos. O estado real está em `00-estado-e-proximos-passos.md`.

Data: 2026-09-19 · Status: **implementado (ver aviso acima)** · Protótipo visual:
http://localhost:5500/.claude/redesign/02-prototipo-navegacao.html

Base: diagnóstico (`01-diagnostico.md`), modelo cfc.org.br
(`projeto/brand/referencias/cfc/README.md`), marca (`projeto/brand/`).
Decisões do usuário já incorporadas: **faixa de menu com ícones**; carrossel
em **16:9 ocupando metade da largura**.

---

## 1. Mapa do portal

Rotas em hash (o portal é estático, sem servidor de rotas). Entre colchetes, a
permissão exigida (`js/auth.js › PERMISSIONS`).

- **Início** `#/inicio` [conteudo]
- **Comunicação** `#/comunicacao` [conteudo]
  - Newsletter Contábil `#/comunicacao/newsletter`
  - Notícias & Impactos `#/comunicacao/noticias`
  - Avisos `#/comunicacao/avisos` *(novo — tipo "Extra!")*
  - Leitura de uma publicação `#/comunicacao/<tipo>/<id>`
- **Sistemas** `#/sistemas` [conteudo]
  - Sistemas da área `#/sistemas` (lista com filtro)
  - Acessos corporativos `#/sistemas/acessos` (SAP, SAP HANA QA, Cronograma, SharePoint, Auditoria)
  - Automações `#/sistemas/automacoes`
- **Documentos & Normas** `#/documentos` [conteudo]
  - Por categoria `#/documentos?categoria=IFRS` (Normas CPC, IFRS, Fechamento, ECD, ECF, Conciliações, Demonstrações Financeiras, Auditoria, ANEEL, Manuais)
- **Pessoas** `#/pessoas` [time]
  - Estrutura das Equipes `#/pessoas/equipes`
  - Equipe `#/pessoas/equipes/<id>`
- **Gestão** `#/gestao` [gerencial]
  - Painel da Gerência `#/gestao/painel`
  - Processos críticos `#/gestao/processos`
  - Agenda & Entregas `#/gestao/agenda`
  - Painel Editorial `#/gestao/editorial`
- **Administração** `#/administracao` [administracao]
  - Equipes `#/administracao/equipes`
  - Automações `#/administracao/automacoes`
- Busca `#/busca?q=…` (utilitário, todos)

### Menu por perfil

| Perfil | Itens na faixa de menu | Total |
|---|---|---|
| Visitante | Início · Comunicação · Sistemas · Documentos & Normas | 4 |
| Colaborador, Gestor | + Pessoas | 5 |
| Gerência | + Gestão | 6 |
| Administrador | + Administração | 7 |

Máximo de **7 itens** — cabe na faixa com ícone + rótulo a partir de 1280 px.

## 2. Modelo de navegação

**Primária — menu com ícones embutido na base da faixa do cabeçalho**
(ajuste de 19/09/2026; antes era uma faixa branca separada no modelo CFC):
tarja escura translúcida sobre a imagem, itens centralizados, ativo com
sublinhado laranja; dropdown branco alinhado à esquerda do item, com borda
superior laranja e só as subpáginas (sem "Tudo em…").
- Cada item: **ícone de linha 20 px + rótulo** (15 px, peso 700), altura 52 px.
- Ícones do conjunto que o portal já tem (`js/ui.js`): Início = casa (novo),
  Comunicação = `news`, Sistemas = `grid`, Documentos = `file`, Pessoas =
  `users`, Gestão = `chart`, Administração = `settings`.
- Itens com filhos mostram `▾` e abrem **dropdown** (hover, clique ou
  teclado). O item pai leva à página índice da seção.
- Item ativo: texto branco + sublinhado laranja de 3 px, `aria-current="page"`.

**Secundária**: dentro de cada seção, **abas ou filtros** para as subpáginas
(ex.: Comunicação › Newsletter | Notícias | Avisos) + **breadcrumb** real
(`Início › Comunicação › Notícias`) + **título da página**.

**Cabeçalho institucional (faixa de impacto)** — ajustado em 19/09/2026:
- Fundo: a mesma imagem do modelo antigo (`assets/images/banner/portal-gerencia-contabilidade.webp`)
  ancorada à direita (`auto 420px`) com o degradê marinho de 100° do hero.
  ~149 px de altura no total: 96 px de identidade + ~53 px do menu.
- Esquerda: logo Grupo Equatorial **branco** + fio vertical + título em duas
  linhas: "Portal da Gerência de" (18 px, peso 300) / **"Contabilidade"**
  (30 px, peso 700); logo com 34 px de altura.
- Centro-direita: **busca larga e sutil** (até 520 px), fundo branco 10%,
  borda branca 30%, texto branco; realça no foco. Sem dica de atalho.
- Direita: identificação discreta — avatar pequeno, **"Bem-vindo, Eduardo"**
  e, abaixo, o cargo/área em 12 px com opacidade reduzida. Clique abre
  "Trocar identificação".
- **Removidos**: botões A+/A e sino de avisos (avisos ficam no bloco da capa).

**Largura da página**: container de até **1760 px** com 32 px de margem lateral
(antes 1170 px) — em 1366 px a área útil vai de 32 a 1334 px.

**Celular (< 900 px)**: cabeçalho com logo + botão **Menu** + busca (ícone).
O botão abre painel com as mesmas seções e subpáginas em lista (sem
`<select>`). Carrossel ocupa a largura toda, mantendo 16:9.

**Rodapé**: **mapa do portal** (todas as seções e subpáginas visíveis ao
perfil), área responsável, data de atualização da base.

## 3. Hierarquia de conteúdo

### Início
1. **Faixa superior em duas metades**
   - Esquerda (50%): **carrossel de destaques 16:9** (~630×355 px em 1366 px de
     tela; ~800×450 px em 1920 px): comunicados, campanhas, eventos. Troca a cada 7 s,
     pontos + setas + **pausar**, pausa no hover/foco, título e resumo em
     texto sob a imagem ou sobreposto com contraste AA.
   - Direita (50%): **Avisos** (até 3, com selo por tipo: Extra/Prazo/Info)
     e **Acesso rápido** (6 sistemas mais usados, ícone + nome, link real).
   - Por quê: quem entra no portal quer *ir a um sistema* ou *saber o que
     mudou* — as duas coisas ficam acima da dobra, lado a lado.
2. **Comunicação recente** (2/3): últimas publicações da Newsletter e de
   Notícias numa lista única (data, categoria, título, resumo), com "Ver
   todas". — o conteúdo que muda toda semana.
3. **Coluna lateral** (1/3): Agenda da semana; Documentos recentes. —
   apoio, consulta rápida.
4. Rodapé com mapa do portal.

### Comunicação
1. Título + breadcrumb + filtros (tipo, categoria, período).
2. Lista editorial (não grade de cartões): data, categoria, título, resumo,
   nível de impacto quando houver.
3. Leitura da publicação em coluna de ~680 px (modelo dos boletins).

### Sistemas
1. Acessos corporativos (links externos, marcados como tal).
2. Sistemas da área: **lista** com ícone/miniatura, nome, descrição, status,
   responsável e botão "Acessar" — as imagens atuais podem ficar como
   miniatura.
3. Automações: tabela filtrável (tipo, família, status).

### Documentos & Normas
1. Filtro por categoria (chips) + busca local.
2. Tabela: título, categoria, versão, data, formato, ação (abrir/baixar).

### Pessoas
1. Organograma atual (gerência → executivas → equipes), sem banner em
   degradê; título de página + breadcrumb.

### Gestão (Gerência/Admin)
1. Painel (KPIs com ação), Processos críticos (tabela), Agenda & Entregas,
   Painel Editorial — cada um como subpágina, não painéis empilhados na capa.

## 4. Fluxos principais

### Abrir um sistema (o mais frequente)
1. Usuário abre o portal → Início.
2. Vê **Acesso rápido** ao lado do carrossel.
   - Se o sistema está lá → clica → abre em nova aba (link real).
   - Se não está → menu **Sistemas** (ou busca `/`) → lista → Acessar.

### Ler o que mudou na semana
1. Início → **Comunicação recente** ou destaque do carrossel.
2. Clica no título → página da publicação (breadcrumb para voltar à lista).

### Encontrar uma norma
1. Menu **Documentos & Normas** → chip da categoria → tabela → abrir.
   - Ou busca global → resultado agrupado por tipo.

### Gerência acompanha o fechamento
1. Menu **Gestão ▾ › Painel da Gerência** → KPI → Processo crítico.

## 5. Nomenclatura

| Conceito | Rótulo na interface | Observação |
|---|---|---|
| Página inicial | **Início** | substitui "Workspace / Visão geral" |
| Newsletter + notícias + avisos | **Comunicação** | substitui "Central de conteúdo" |
| Aviso pontual/urgente | **Aviso** (selo "Extra") | mesma lógica do "Extra!" da Comunicação |
| Destaques rotativos | **Destaques** | nome do carrossel na interface/`aria-label` |
| Sistemas + acessos + automações | **Sistemas** | "Acessos rápidos" deixa de ser seção |
| Documentos | **Documentos & Normas** | mantém o nome atual |
| Organograma | **Pessoas › Estrutura das Equipes** | |
| Painel, processos, agenda, editorial | **Gestão** | agrupa o que é `gerencial` |
| Botão de sistema | **Acessar** | sem seta decorativa; ícone "externo" só em link de fora |

## 6. Componentes compartilhados

| Componente | Onde | Variações |
|---|---|---|
| Cabeçalho institucional | todas as páginas | celular: logo + Menu + busca |
| Faixa de menu com ícones + dropdown | todas | itens filtrados por perfil |
| Breadcrumb + título de página | todas, exceto Início | |
| Carrossel de destaques | Início | celular: largura total |
| Bloco de avisos | Início, Comunicação › Avisos | compacto (3) × completo |
| Lista editorial | Início, Comunicação | compacta × com filtros |
| Tabela filtrável | Documentos, Automações, Processos | |
| Rodapé com mapa do portal | todas | itens por perfil |
| Diálogo de detalhes (existente) | Sistemas, Documentos | mantido |

## 7. Crescimento de conteúdo

- **Comunicação** cresce toda semana → paginação ("Carregar mais") e filtro
  por período; Início mostra só as 5 últimas.
- **Documentos** cresce por categoria → chips + busca; nada de abas.
- **Destaques** → novo `data/destaques.json` com `inicio`/`fim` de exibição
  e `ordem`; saem sozinhos do carrossel ao vencer. Máximo recomendado: 6.
- **Avisos** → vencem pela data; os vencidos vão para o arquivo em
  Comunicação › Avisos.

## 8. Rotas

- Padrão: `#/secao/subpagina/id`.
- Filtros em query: `#/documentos?categoria=IFRS`, `#/busca?q=conciliação`.
- Compatibilidade: `#central`, `#equipes`, `#painel`, `#administracao` e
  demais âncoras antigas redirecionam para as rotas novas.
- Rota sem permissão → página "Esta seção é restrita ao seu perfil" com link
  para Início (em vez de pular silenciosamente, como hoje com `#painel`).

## 9. Dados novos ou alterados

| Arquivo | Mudança |
|---|---|
| `data/config.json › menu` | nova estrutura: seção, ícone, rota, permissão, filhos |
| `data/destaques.json` *(novo)* | id, título, resumo, imagem 16:9, alt, link, início, fim, ordem |
| `data/avisos.json` *(novo)* | id, tipo (extra/prazo/info), título, texto, janela/prazo, área responsável, início, fim |
| `data/config.json › links` | vira "Acessos corporativos" em Sistemas; "Outros" some |

Imagens 16:9 disponíveis hoje: `assets/images/comunicados/projecthub-lancamento.webp`
(1672×941). As demais peças da Comunicação precisam de versão 16:9 (ou
enquadramento com `object-fit`).

## 10. Decisões pendentes

1. Aprovar o **mapa e os rótulos** (seção 1 e 5).
2. Confirmar que **Processos** entra em **Gestão** (hoje é só `gerencial`).
3. Conteúdo do carrossel: usar as peças da Comunicação (repertório) e
   publicações com imagem? Quem cadastra os destaques?
4. Criar **Avisos** como tipo novo, ou só reaproveitar a Newsletter com
   categoria "Comunicado Interno"?
