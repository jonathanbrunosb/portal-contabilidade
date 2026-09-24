# Diagnóstico — Portal Contabilidade (redesign "cara de portal")

Data: 2026-09-18 · Branch: `ajustes-frontend-dudu` · Perfil usado: Analista (Contabilidade IV)
Lentes: `portal-corporativo` (inventário de IA), `redesign-existing-projects`
(padrões genéricos), `ux-heuristics` (Krug + Nielsen, severidade 0–4).
Verificado ao vivo no preview em 1440 px e 375 px. Console sem erros.

**Nota de usabilidade: 5/10.** Busca visível e acessibilidade básica boas; a
navegação e a capa derrubam a nota.

## 1. Navegação (o foco do redesign)

| # | Achado | Evidência | Sev. |
|---|--------|-----------|------|
| N1 | O menu mostra só **2 destinos** do portal para o Analista (Central de Conteúdo, Estrutura das Equipes). Processos, Painel, Agenda, Editorial e Administração existem em `config.menu`, mas somem por perfil — e não há "Início". | `js/navigation.js:3`, `data/config.json › menu` | 3 |
| N2 | **CTA da capa leva a lugar nenhum**: "Acompanhar a gerência ↗" aponta para `#painel`, oculto para o Analista; a página só pula para `#central`. | clique testado: hash vira `#central`, painel oculto | 3 |
| N3 | **Breadcrumb falso**: "Workspace / Visão geral" é texto fixo, não clicável, jargão de SaaS e não muda de tela. Em Equipes ele some; lá existe outra trilha ("Gerência → Executivos(as) → Equipes") com outro formato. | `index.html` `.page-context`; tela Equipes | 3 |
| N4 | Sem **título de página consistente**: a capa tem um H1 de marketing; Equipes tem um banner em degradê; o resto são painéis dentro da mesma rolagem. Falha no Trunk Test ("em que página estou?"). | leitura de headings | 2 |
| N5 | **Acessos rápidos são `<button>` com `window.open`**, não links: sem URL no hover, sem abrir em nova aba com o botão do meio, sem copiar endereço. | `js/navigation.js:3,49` | 2 |
| N6 | Item ativo marcado só com classe `.active`, **sem `aria-current="page"`**. | varredura do `#navigation` | 2 |
| N7 | Rótulos de grupo "PORTAL" e "ACESSOS RÁPIDOS" em caixa alta; "Outros" é vago (leva à aba Sistemas). | `navigation.js:3`, `config.links[5]` | 1 |
| N8 | Conteúdo restrito (Painel da gerência) **aparece durante o carregamento** e só depois é escondido. | print no celular durante o load | 2 |
| N9 | Sistemas, Documentos e Automações ficam **escondidos em abas** dentro de um painel da capa ("Central de conteúdo"), e não como seções do site. | `index.html` tablist | 3 |

## 2. Construção "de IA" (revisado em 18/09/2026)

> Revisão: para o projeto, "elemento de IA" é a **montagem genérica do
> frontend** (grades, estilo das grades, menus, hero, adornos), não imagens,
> ilustrações ou cores. As ilustrações dos sistemas, o banner e a peça do
> ProjectHub **saem desta lista** — ver `projeto/brand/repertorio/README.md`.

**Estrutura e grades**
- Hero de landing page: slogan em caixa alta, H1 de 32–38 px em duas linhas,
  parágrafo institucional, CTA ↗ e 3 métricas soltas ("24 · 07 · D+4").
- Grade de cartões idênticos em Sistemas (6 cartões iguais, imagem + selo
  "Ativo" + botão "Acessar sistema ↗"), Notícias e Automações.
- Tudo dentro de `.panel` com borda + sombra + raio 14 px, inclusive o que
  deveria ser página.
- Seções do site escondidas em 5 abas da "Central de conteúdo".

**Menus**
- Sidebar de template: avatar grande no topo, rótulos "PORTAL"/"ACESSOS
  RÁPIDOS" em caixa alta, rodapé "Ambiente local · v1.0" com ponto pulsando.
- Breadcrumb decorativo "Workspace / Visão geral".

**Adornos**
- Faixa "RADAR" rolando sem parar (`@keyframes radar`, 45 s).
- `.live-dot` pulsando (hero e rodapé).
- Kickers em caixa alta digitados no HTML: "FIQUE POR DENTRO",
  "ACOMPANHAMENTO EXECUTIVO", "GOVERNANÇA DE CONTEÚDO", "PESSOAS & LIDERANÇA".
- 12 setas ↗/→ decorativas.
- Degradês como fundo de componente (hero 100deg, banner de Equipes 118deg),
  `backdrop-filter: blur`, sombra `0 24px 90px`.
- Microcopy de marketing: "Conectando pessoas e conhecimento.", "Ambiente
  integrado para…", "INFORMAÇÃO QUE CONECTA. GESTÃO QUE EVOLUI.".

**Observação sobre imagens (não é defeito de IA)**
- A imagem do *Monitor de Desempenho* traz um botão "Acessar sistema"
  desenhado dentro da figura, ao lado do botão real — problema de
  **usabilidade** (dois botões, um falso), vale recortar ou trocar a imagem.

**Conteúdo**
- `data/config.json › newsletterCategorias`: `"IA"` duplicado (bug).
- `data/noticias.json › news1`: "IA no apoio às rotinas contábeis" — decisão
  editorial, perguntar antes de mexer.

## 3. Sistema visual

| # | Achado | Evidência | Sev. |
|---|--------|-----------|------|
| V1 | **Escala tipográfica fora de controle**: 25 tamanhos distintos (8 px a 38 px, com 9.5, 12.5, 13.5). Na capa, a maior parte do texto está em **10–12 px** — pequeno demais para leitura corporativa. | `grep font-size` + medição ao vivo | 3 |
| V2 | Pesos 650 e 750 (não padrão) misturados com 600/700. | medição ao vivo | 1 |
| V3 | **143 cores hex literais** contra 137 usos de `var(--…)`: os tokens existem, mas metade do CSS ignora. | `css/styles.css` | 2 |
| V4 | 14 raios de borda e 14 letter-spacings diferentes; 17 sombras. | `css/styles.css` | 1 |
| V5 | `font-family` declara Inter, que não é carregada (cai em Segoe UI). Inofensivo, mas enganoso. | `:root` | 1 |
| V6 | Paleta com `--teal`, `--sky`, `--purple` sem papel definido — mais de um acento. | `:root` | 1 |

## 4. Capa (Início)

| # | Achado | Sev. |
|---|--------|------|
| C1 | No celular, o hero ocupa 358 px; o primeiro conteúdo útil começa a **501 px** (60% da primeira tela). No desktop, hero + métricas tomam o primeiro terço da tela. | 3 |
| C2 | Não há **acesso rápido aos sistemas na capa**: eles só existem no menu lateral (escondido no celular) e na terceira aba da Central. | 3 |
| C3 | Métricas do hero (24 processos, 07 sistemas, D+4) não levam a lugar algum; para o Analista, o painel correspondente nem existe. | 2 |
| C4 | Alvos de toque pequenos no celular: "Trocar identificação" 25 px, "Ler orientação →" 26 px, "Acompanhar a gerência" 18 px (mín. 44 px). | 2 |
| C5 | Selo "CONTEÚDO DEMONSTRATIVO" no texto de 35 registros (`noticias` 18, `newsletter` 6, `entregas` 6, `processos` 5). Ok como dado de exemplo, mas polui a leitura — decidir no redesign. | 1 |

## 5. O que está bom e deve ser preservado

- Busca global no topo (com atalho `/` indicado; não testei o atalho) — no lugar certo.
- Skip-link, `role="tablist"` com setas, foco visível, `aria-label` nos ícones.
- Sem rolagem horizontal no celular; menu hambúrguer funciona.
- Organograma de Equipes com fotos reais e "Visualizar equipe" — conteúdo
  genuinamente útil; precisa só do visual.
- Separação por perfil (Analista × Gestor × Administração) — manter a regra,
  mudar só a forma de mostrar.
- Voltar do navegador funciona entre Início e Equipes.

## 6. Prioridade sugerida para o redesign

1. **Arquitetura de navegação** (N1, N3, N4, N9, C2): mapa de seções, menu
   completo por perfil com "Início", breadcrumb real, título por página. →
   próxima etapa, com `information-architecture`.
2. **Capa de portal** (C1–C3, hero, radar, métricas): trocar o pitch por acesso
   rápido + comunicados + agenda.
3. **Trocar grades e cartões genéricos** por listas, tabelas e destaques com
   hierarquia; as imagens existentes podem continuar como conteúdo (ver
   `projeto/brand/repertorio/`).
4. **Sistema visual** (V1–V6): escala tipográfica curta (12/14/16/20/24),
   tokens obrigatórios, um acento, raios e sombras contidos.
5. **Limpeza de linguagem** (kickers, setas, slogans, `live-dot`) e conteúdo
   "IA" nos JSON (com sua confirmação).
6. Ajustes de acessibilidade (N5, N6, N8, C4).
