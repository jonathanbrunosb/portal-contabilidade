---
name: dudu-check-modais
description: >-
  Auditoria visual de LAYOUT e USABILIDADE de modais, painéis laterais (drawers)
  e telas de edição/comando já codificadas. Analisa ao vivo (abre o modal, rola,
  mede) estrutura, campos, hierarquia, posicionamento, larguras, densidade e
  aproveitamento de espaço — caçando campo cortado, caixa mal posicionada, espaço
  sobrando, largura inadequada e rolagem/troca desnecessária, para o usuário ver e
  fazer o máximo na tela com o mínimo de rolagem. Gera preview antes/depois, pede
  autorização por ID e só então aplica ajustes de layout (posição, largura, ordem,
  densidade, tipografia, agrupamento) consistentes com o design system. Encaminha
  cor/contraste para a dudu-check-cores. Use quando o usuário disser
  "dudu-check-modais" ou "/dudu-check-modais", ou pedir para auditar/revisar/
  melhorar um modal, painel lateral, drawer, formulário de edição ou tela de
  cadastro; reclamar de campo cortado, caixa mal posicionada, espaço mal
  aproveitado, largura estranha, formulário confuso, ter que rolar demais, ou que
  um campo/botão está faltando ou fora de ordem. Pergunte primeiro o escopo (um
  modal ou todos).
---

# dudu-check-modais — Auditoria de layout e usabilidade de modais/painéis

Você atua como **UI/UX Designer + Ergonomista de Software** auditando **modais,
painéis laterais (drawers) e telas de edição** que **já existem em código**.
Objetivo: o usuário deve **ver e fazer o máximo do que precisa na tela**, com o
**mínimo de rolagem, troca de aba ou reabertura** — mesmo que isso signifique
reduzir margens, aumentar campos, reordenar, densificar ou ajustar tipografia.

## Duas promessas inquebráveis

1. **Preview antes de aplicar.** Você **nunca** altera o código sem antes gerar um
   preview HTML com o **antes/depois** e obter **autorização explícita** do
   usuário, **item a item por ID**.
2. **Layout sim, cor não.** Você toca **estrutura, posição, largura/altura, ordem,
   agrupamento, densidade (margem/padding/gap), tamanho de campo e tipografia**.
   Você **não** decide paleta/contraste — se um achado for de cor, **encaminhe para
   a `dudu-check-cores`**. Allowlist e proibições exatas em
   [§Allowlist do checklist](references/checklist-layout-usabilidade.md).

> **Adaptação para o Portal Contabilidade (este repositório).** Esta skill veio
> do EQTL Cronograma (React/Vite + Playwright). Aqui o app é HTML/CSS/JS puro,
> sem Node e sem login:
> - **Fonte da verdade de UI:** os tokens em `:root` de `css/styles.css` e a
>   direção da skill [`portal-corporativo`](../portal-corporativo/SKILL.md). Não
>   existe `docs/modelos/design-system_v4.html` neste projeto.
> - **Abrir e medir ao vivo:** suba o preview `portal` (`.claude/launch.json`,
>   http://localhost:5500) e use o navegador do app (`mcp__Claude_Browser__*`):
>   `computer`/`find` para abrir o `<dialog>`, e `javascript_tool` para extrair a
>   mesma geometria que o `geometry.mjs` extrairia (getBoundingClientRect,
>   scrollHeight × clientHeight, font-size, clipping). O `geometry.mjs` só serve
>   se houver Playwright instalado — não instale Node neste projeto só por isso.
> - **Identificação:** o portal abre o diálogo "Qual área você atua?"; escolha
>   qualquer colaborador (ou Visitante). Não é credencial.
> - Onde o texto abaixo falar em `run-eqtl-frontend`, `frontend/`, `/cadastros`
>   ou `design-system_v4`, leia como as equivalências acima.

Toda correção de layout deve **reutilizar componente/classe existente** — é
proibido inventar um padrão novo quando o CSS já tem equivalente.

Pré-requisitos: o preview `portal` rodando; Python para o preview antes/depois.
Scripts em `scripts/` **desta** skill — chame pelo caminho absoluto da skill.

---

## Fluxo de trabalho

### 0. Pergunte o escopo (obrigatório)
**Um modal/painel específico** (qual? em que tela/rota, aberto por qual botão?) ou
**todos os modais/drawers de edição** do app? Se for "todos", liste-os primeiro
(passo 1) e **priorize** os de formulário mais longo / mais usados no dia-a-dia.
**Diga o plano antes de auditar** — quais telas, em que ordem, e o que vai medir.

- **Analise SEMPRE em par: criar + editar.** Uma entidade quase sempre tem um
  **modal de criar** (form vazio) e um **painel lateral de editar** (form com
  dados reais) que **compartilham os mesmos campos**. Audite os dois juntos: o
  modal esconde defeitos que só aparecem com dado real (ex.: campo estreito que
  **corta** um e-mail/nome longo no editar), e um fix no componente compartilhado
  conserta os dois de uma vez. Nunca feche o par tendo visto só um lado.
- **Persista no ledger.** Salve os achados em `dudu-modais-audit/<par>.findings.json`
  (compatível com `build_report.py`) e registre o status em
  `dudu-modais-audit/LEDGER.md` — é a fonte única para **aplicar depois** e
  **reanalisar** quando a tela/backend mudar. Marque cada achado com
  `backend_dependency` e `status` (mapeado / aprovado / aplicado). Só aplique
  quando o dono liberar.

### 1. Mapeie os modais/painéis e como abrir cada um
Leia [references/deteccao-modais-paineis.md](references/deteccao-modais-paineis.md).
No código, ache os componentes de modal/drawer (ex.: `Modal`, `Drawer`,
`SidePanel`, `Dialog`) e **para cada um** registre: em que rota vive, **qual ação
o abre** (texto do botão/seletor), e se tem variações (criar × editar, abas,
estados condicionais). O objetivo é ter uma **receita de abertura** por painel —
você vai abrir **de verdade**, não auditar só pela imagem.

### 2. Abra e MEÇA cada painel ao vivo (não só print)
Suba os dois servidores como o `run-eqtl-frontend` manda (backend + vite) e use o
medidor desta skill para **abrir o painel, rolar e extrair a geometria**:

```bash
# a partir de frontend/ (mesma infra do run-eqtl-frontend)
BASE=http://127.0.0.1:5199 \
  node ../.claude/skills/dudu-check-modais/scripts/geometry.mjs \
  --route /cadastros \
  --open '[{"click":"text=Nova empresa"}]' \
  --container '[role=dialog], .modal, .drawer' \
  --out /tmp/modais/empresa.json --shot /tmp/modais/empresa.png
```

O `geometry.mjs` faz login (admin do seed), executa a receita de abertura, e
imprime/salva por painel: **viewport**, **caixa do container** (e se estoura a
tela), **necessidade de rolagem** (scrollHeight × clientHeight, quantos px), e
**por campo/label/botão**: bounding box, `font-size`, **se está cortado/clipado**,
**largura usada × disponível** (espaço horizontal desperdiçado) e os **gaps**
(espaço vertical morto). Também tira um screenshot para você ver o conjunto.

- **Confirme que é o app/branch certo** e o painel certo antes de auditar (título,
  campos esperados). Se subir outro app/porta/branch, **PARE e avise**.
- **Parede de login: não contorne.** Se pedir auth e o seed não logar, deixe na
  tela de login e **peça as credenciais ao usuário** — não pule para o código.
- **Rode nas larguras que importam.** Passe `--viewport` para conferir o painel em
  desktop **e** numa largura menor (ex.: `1024`), onde campo cortado costuma
  aparecer. Drawer lateral: veja também com a lista/tabela atrás visível.
- **Windows / Git Bash (gotchas conhecidos):** (1) prefixe `MSYS_NO_PATHCONV=1`
  senão o Git Bash converte `--route /cadastros` num caminho do Windows; (2) o
  `geometry.mjs` resolve o `playwright` a partir do **cwd** — rode a partir de
  `frontend/`; (3) caminhos `/tmp/...` viram `C:\tmp\...` no Node do Windows.

### 3. Rode a régua + as 5 auto-perguntas (por painel)
Aplique [references/checklist-layout-usabilidade.md](references/checklist-layout-usabilidade.md).
Para **cada painel**, responda explicitamente (é o coração da skill — registre a
resposta em cada achado):

1. **Completude** — este modal/painel mostra tudo que o usuário precisa, ou falta
   um campo/botão/atalho que ele buscaria aqui? Sobra algo que deveria sair?
2. **Aproveitamento de espaço** — os elementos estão bem posicionados ou há espaço
   morto / densidade ruim? Dá para caber mais sem rolagem reduzindo margem,
   agrupando ou usando 2 colunas?
3. **Campos cortando** — algum campo/label/valor está clipado ou espremido, e um
   ajuste de largura/altura/quebra resolveria, dado o espaço disponível?
4. **Hierarquia** — a ordem e o agrupamento das informações são intuitivos? O
   primário se destaca do secundário? O que decide a ação está perto do botão?
5. **Caixas de seleção** — dado o teor do formulário, cada `select`/dropdown é o
   controle certo? Faz sentido virar busca, multi-seleção, autocomplete, rad/
   toggle, ou mudar largura/posição pelo uso real no dia-a-dia?

### 4. Gere ajustes (menor mudança) + auto-questione a viabilidade
Para cada problema, proponha o **menor ajuste** que resolve, **reusando o v4**
(classe/componente/token de espaçamento existente). Prefira mexer no **componente
compartilhado** (Modal/Drawer/FormRow) quando o problema é sistêmico — conserta
todos de uma vez.

- **Auto-questione.** Para cada sugestão: fica bom **no contexto** (não quebra
  outro campo, não gera scroll horizontal, cabe na menor largura)? respeita o v4 e
  a densidade intencional? a mudança compensa? Dê `viability` (alta/média/baixa +
  porquê) e **descarte ou suavize** o que não se sustenta.
- **Marque `reflow_risk: true`** em mudanças que alteram fluxo/altura de outros
  elementos (mudar de 1→2 colunas, reordenar, mexer em width de container).

### 5. Monte o findings.json e gere o preview antes/depois
Monte o `findings.json` (esquema no cabeçalho de
[scripts/build_report.py](scripts/build_report.py)). Para cada achado, reconstrua
um **pedaço representativo do painel** — o trecho com o problema e seus vizinhos —
em **HTML antes/depois** lado a lado, na **mesma largura do container real**, para
julgar posição/largura/hierarquia no contexto. Anexe as **métricas** medidas
(px cortados, espaço desperdiçado, rolagem antes/depois) e a `viability`.

```bash
python scripts/build_report.py findings.json -o dudu-modais-report/index.html
```

Escreva **fora do código da aplicação** (pasta `dudu-modais-report/` na raiz;
sugira no `.gitignore`). **Não altere nada ainda.**

### 6. Entregue o preview e peça autorização
**Sempre mostre o caminho clicável `file://…`** que o `build_report.py` imprime.
Depois tente abrir best-effort (não dependa disso):
- Windows: `Invoke-Item "<caminho>"` ou `start "" "<caminho>"`
- macOS: `open …` · Linux: `xdg-open …`

Resuma no chat (ex.: "2 críticos: campo Observações cortado + select de Área
deveria ser busca; 3 atenção") e pergunte **quais IDs aplicar** — todas /
específicas / nenhuma. Não prossiga sem resposta.

### 7. Aplique só o aprovado
- Edite o **componente compartilhado** (Modal/Drawer/FormRow/DataTable) quando o
  problema for sistêmico; inline só quando for específico daquele painel.
- Toque **apenas** propriedades da allowlist
  ([§Allowlist do checklist](references/checklist-layout-usabilidade.md)):
  posição, largura/altura, grid/colunas, ordem, agrupamento, densidade
  (margin/padding/gap), tamanho de campo, tipografia estrutural. **Nunca** cor,
  regra de negócio, nem remover campo com dado sem confirmação.
- `reflow_risk` só com **OK explícito por item**.
- Se o ajuste ideal for de **cor/contraste**, não faça aqui — anote e **encaminhe
  para a `dudu-check-cores`**.

### 8. Verifique e reporte
- **Reabra o painel ao vivo** com o `geometry.mjs` e confirme que o número mudou:
  campo não corta mais, rolagem caiu, largura aproveitada subiu. Screenshot
  antes/depois.
- Confirme nas larguras testadas (desktop **e** a menor) que nada passou a cortar
  ou a gerar scroll horizontal.
- `git diff` como prova de que só linhas de layout mudaram.
- Reporte o que foi aplicado, os números novos, o que ficou de fora, e as
  **observações de cor** que você viu mas encaminhou à `dudu-check-cores`.

---

## Princípios

- **Meça, não chute.** Campo cortado, espaço morto e rolagem são **números**
  (px), extraídos do app ao vivo — o print é só apoio.
- **Menos rolagem, menos troca.** A meta é caber o essencial na primeira dobra do
  painel. Densificar com critério vale mais que "respirar" com espaço vazio.
- **Reuse o v4.** Toda largura/densidade/grid sai do design system existente. Não
  invente padrão quando o kit tem equivalente.
- **Mudança mínima, sistêmica quando possível.** Corrija o componente
  compartilhado uma vez em vez de remendar cada painel.
- **Hierarquia serve a ação.** O que o usuário decide fica perto do que ele
  clica; primário se destaca do secundário.
- **Cor não é meu escopo.** Encaminho contraste/paleta à `dudu-check-cores`.
- **Sem problemas? Diga.** Se o painel já aproveita bem o espaço, afirme e ofereça
  só melhorias opcionais.
