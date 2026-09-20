# Régua de layout & usabilidade (modais / painéis / edição)

Aplique por painel. Cada item vira um achado com `id`, `severity`, a resposta às
5 auto-perguntas e a `viability`. **Meça** — os limiares abaixo são sobre px
reais extraídos pelo `geometry.mjs`, não impressão.

## 1. Campo cortado / clipado (crítico por padrão)
- Elemento cujo conteúdo é truncado sem necessidade, `overflow` escondendo texto,
  input mais estreito que o dado típico, label quebrando feio, valor com
  reticências onde caberia inteiro.
- `geometry.mjs` marca `clipped:true` quando a caixa do campo ultrapassa a borda
  visível do container ou quando `scrollWidth > clientWidth` no próprio campo.
- **Regra:** campo cortado é sempre achado. A correção é a menor entre: alargar,
  permitir quebra, encurtar o vizinho, ou mudar o grid.

## 2. Rolagem evitável (o painel cabe?)
- `needsVScroll` = `scrollHeight − clientHeight`. Se > 0, pergunte: dá para caber
  na dobra reduzindo margem/gap, agrupando, usando 2 colunas ou movendo o
  secundário para uma seção recolhível?
- Rolagem horizontal em modal/painel = **sempre** defeito (corrigir width/grid).
- Meta: **o essencial + o botão de ação visíveis sem rolar**. Ação primária nunca
  deve ficar "abaixo da dobra".

## 3. Aproveitamento de espaço
- **Espaço morto:** gap vertical entre grupos, colunas de campo muito mais
  estreitas que o container (muita margem lateral sobrando), painel largo com
  campos em 1 coluna estreita.
- **Densidade errada:** padding/margens generosos empurrando conteúdo para fora da
  dobra num formulário longo. Densificar é válido — respeitando o mínimo do v4.
- Sinal do `geometry.mjs`: `wastedRightPx` (largura do container não usada pela
  coluna de campos) e `deadGapPx` (soma de gaps verticais acima do padrão).

## 4. Hierarquia e ordem
- Ordem de leitura ≠ ordem de importância: campo obrigatório/primário deve vir
  antes do opcional; título/identidade no topo; ação destrutiva separada da
  confirmação.
- Agrupamento: campos relacionados juntos (com rótulo de seção quando forem
  muitos); não misturar "identificação" com "configuração avançada".
- Ação primária alinhada/perto do conteúdo que a decide; botões na ordem do v4.

## 5. Controles de seleção (o teor pede outro controle?)
Dado o uso diário, questione cada `select`/dropdown:
- Lista longa (> ~10 itens) → **busca/autocomplete**.
- Escolher vários → **multi-seleção / checkboxes**.
- 2–4 opções curtas mutuamente exclusivas → **radio/segmented/toggle** (menos
  cliques que abrir dropdown).
- Largura do select desproporcional ao conteúdo (enorme para "Sim/Não", ou
  estreito cortando o rótulo mais longo) → ajustar.
- Posição: filtros/seletores que orientam o resto do form devem vir **antes** dos
  campos que dependem deles.

## 6. Completude
- Falta um campo/atalho/botão que o usuário buscaria **aqui** e hoje o obriga a
  sair e voltar? (ex.: "salvar e criar outro", link para o registro relacionado,
  campo que ele sempre preenche em seguida noutra tela).
- Sobra algo raramente usado ocupando a dobra? → recolher/mover, não remover sem
  confirmar.

## 7. Estados e responsividade
- Teste **criar × editar**, com/sem dados, campos condicionais abertos, mensagem
  de erro visível (ela empurra o layout?).
- Rode em desktop **e** numa largura menor (`--viewport 1024`): o que corta lá?
- Drawer lateral: confira com o conteúdo de trás visível — largura do drawer não
  pode espremer os campos.

---

## Allowlist — o que esta skill PODE tocar
Só propriedades de **layout/estrutura/tipografia estrutural**:
- Posição e fluxo: `display`, `flex*`, `grid*`, `order`, `gap`, `align/justify`,
  `position`, reordenar elementos no JSX.
- Dimensão: `width`, `min/max-width`, `height`, `min/max-height`, `flex-basis`,
  número de colunas do form.
- Densidade: `margin`, `padding`, `gap`, `line-height` (quando estrutural).
- Tipografia estrutural: `font-size`, `font-weight`, `letter-spacing`,
  `white-space`, `overflow`/`text-overflow`, `word-break` — para caber/hierarquia.
- Agrupamento: envolver campos numa seção, mover para `<details>`/aba, dividir
  em colunas — **reusando componentes do v4**.

## Proibido (encaminhe ou confirme)
- **Cor / contraste / paleta / tema** → encaminhar para a **`dudu-check-cores`**.
- **Regra de negócio, validação, o que o campo faz** → fora de escopo.
- **Remover um campo que carrega dado** ou mudar o que ele grava → só com
  confirmação explícita do usuário.
- **Inventar componente/estilo novo** quando o v4 já tem equivalente.
- Aplicar qualquer coisa **sem preview + autorização por ID**.
- `reflow_risk` (muda altura/fluxo de vizinhos) **sem OK explícito por item**.
