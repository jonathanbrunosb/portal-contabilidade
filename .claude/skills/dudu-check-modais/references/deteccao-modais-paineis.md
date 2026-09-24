# Achar os modais/painéis e montar a receita de abertura

Objetivo: listar cada modal/drawer/tela de edição, em **que rota** vive, **qual
ação o abre**, e as **variações** (criar × editar, abas, campos condicionais) —
para abrir cada um **ao vivo** com o `geometry.mjs`, não auditar só pela imagem.

## Passo 1 — Encontrar os componentes de painel
Grep no `frontend/src` por nomes e padrões:

| Procure | Sinaliza |
|---|---|
| `Modal`, `Dialog`, `Drawer`, `SidePanel`, `Sheet`, `Popover` grande | componente de painel |
| `role="dialog"`, `aria-modal`, `createPortal` | overlay/portal (o container real fica fora da árvore da tela) |
| `.modal`, `.drawer`, `.overlay`, `.side-panel` (CSS/classes) | seletor do container p/ `--container` |
| `open`, `isOpen`, `visible`, `useDisclosure` | estado que controla a abertura |
| `onSubmit`, `<form`, muitos `<input>/<select>/<textarea>` juntos | é formulário de edição — alvo principal |

Confirme o **seletor do container** que envolve o painel (ex.: `[role=dialog]`,
`.drawer`, `.modal-content`) — é o que você passa em `--container`.

## Passo 2 — Descobrir o gatilho de abertura (a "receita")
Para cada painel, ache o **elemento que o abre** na tela onde ele mora: texto do
botão (`Nova empresa`, `Novo processo`, `Editar`), ícone, linha de tabela
clicável. A receita é uma lista de passos que o `geometry.mjs` executa após o
login:

```json
[{"click":"text=Processos"}, {"click":"text=Novo processo"}]
```

Passos suportados pelo `geometry.mjs` (`--open`):
- `{"click":"<seletor ou text=...>"}` — clica (aceita seletor Playwright/CSS).
- `{"fill":"<seletor>","value":"<texto>"}` — preenche (para chegar a estado
  condicional).
- `{"wait": 400}` — espera ms (animação de abertura/drawer).
- `{"select":"<seletor>","value":"<opção>"}` — escolhe num `<select>`.

Cubra as **variações** que mudam o layout: modo **editar** (abre com dados,
seletor tipo primeira linha da tabela), abas internas, e campos que só aparecem
sob condição — cada um é uma auditoria própria.

## Passo 3 — Onde ficam largura/densidade (para corrigir centralizado)
Antes de sugerir, descubra se largura/padding/grid do painel vêm de um
**componente compartilhado** (`Modal`, `Drawer`, `FormRow`, `Field`) ou de CSS
por painel. Corrigir o compartilhado conserta todos de uma vez — prefira isso a
remendar cada tela. Cheque o de-para do v4
(`docs/modelos/design-system_v4-componentes.md`) para o componente/classe certo.

## Passo 4 — Rodar o app
Siga o skill `run-eqtl-frontend`: sobe backend (:8123 com CORS p/ :5199) + vite
(:5199), loga como admin do seed. O `geometry.mjs` desta skill reusa esse mesmo
login e portas — só aponte `BASE` e passe a receita `--open`.

## Armadilhas
- **Portal/overlay:** o container do modal costuma estar no fim do `<body>`, fora
  da árvore da rota — use o seletor de `role=dialog`/`.modal`, não um ancestral da
  página.
- **Animação:** meça **depois** de abrir (`{"wait":300}`), senão a caixa vem com
  tamanho/opacidade de transição.
- **Editar ≠ criar:** o modo editar traz dados reais e é onde campo corta —
  audite os dois.
- **Scroll interno:** alguns painéis têm o corpo com `overflow:auto` e header/
  footer fixos; o `geometry.mjs` reporta o scroll do corpo, não da página.
- **Largura menor:** rode `--viewport 1024` (e o padrão): campo cortado aparece na
  largura menor primeiro.
