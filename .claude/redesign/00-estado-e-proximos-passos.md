# Estado do redesign e próximos passos

Atualizado em 20/09/2026 (2ª rodada) · Branch `ajustes-frontend-dudu` (a partir de `main`,
que segue em produção para comparação) · **Nada commitado ainda**.

Leia este arquivo primeiro ao retomar a conversa. Ele resume a intenção, o que
já foi decidido e feito, e o que vem a seguir.

---

## 1. A intenção do projeto

Repaginar o **Portal da Gerência de Contabilidade** (HTML/CSS/JS puro, sem
build) para que pareça **um portal corporativo**, com três objetivos, nesta
ordem:

1. **Navegação em primeiro lugar** — quem entra quer *chegar a um lugar*: um
   sistema, uma norma, um processo, uma pessoa.
2. **Visual institucional** da Equatorial, tirado da comunicação real da
   empresa (boletins e campanhas), não de um tema genérico.
3. **Sem construção de frontend "de IA"** — ver a definição no item 2.

### O que "elemento de IA" significa aqui (correção do usuário, 19/09)

É a **montagem genérica da interface**: grades de cartões idênticos, hero de
landing page, kickers em caixa alta, glass/blur, menus de template SaaS,
adornos animados sem função.

**Não** são imagens, ilustrações, personagens 3D ou mesclas de cor: essas o
usuário considera boas para deixar a comunicação leve e intuitiva, e são
repertório válido para **conteúdo** (ver `projeto/brand/repertorio/README.md`).

### Modelo de referência adotado

**cfc.org.br** — medido e documentado em
`projeto/brand/referencias/cfc/README.md`: cabeçalho, menu horizontal com
submenus, páginas de seção com faixa de subpáginas e a linha azul deslizante,
rodapé com mapa do portal.

---

## 2. Onde está cada coisa

| Documento | Para quê |
|---|---|
| `.claude/skills/portal-corporativo/SKILL.md` | **Regras do projeto**: direção, inventário do que sai, restrições da stack, decisões travadas. Carregue antes de mexer na interface |
| `.claude/redesign/01-diagnostico.md` | Diagnóstico inicial (nota 5/10, achados por severidade) |
| `.claude/redesign/02-arquitetura-navegacao.md` | Proposta de navegação aprovada. **Parcialmente desatualizada**: escrita antes dos ajustes de menu de 19/09 (ver item 4) |
| `.claude/redesign/03-sistema-visual.md` | **Sistema visual**: tokens (tipografia, cores com as correções de contraste, raios, sombras), o cartão em faixa, a arte dos cartões e a faixa de filtros. Leia antes de escrever qualquer cor, tamanho ou grade no CSS |
| `.claude/redesign/04-arte-dos-cartoes.md` | **Arte dos cartões, passo a passo**: como escolher o modo, acessar o destino, levantar a identidade, registrar no gerador e conferir. **Leia antes de adicionar qualquer item** a uma das seis coleções |
| `assets/marcas/FONTES.md` | Origem e titular de cada logomarca usada nos cartões |
| `.claude/redesign/02-prototipo-navegacao.html` | Protótipo que validou topo, menu e carrossel. Já implementado no portal real; serve de registro |
| `projeto/brand/` | Marca: guia de estilos, tokens, logos, referências dos e-mails, CFC e repertório. **Interno, não publicar** |
| `projeto/modelos-emails/` | 6 e-mails `.msg` da Comunicação (fonte da marca). **Interno** |

**Skills instaladas no projeto** (`.claude/skills/`): `portal-corporativo`
(própria), `impeccable`, `redesign-existing-projects`, `dudu-check-cores`,
`dudu-check-modais`, `ui-ux-pro-max`, `verification-before-completion`,
`web-design-guidelines`, `information-architecture`, `ux-heuristics`,
`better-typography`.

---

## 3. O que já está no portal real (fatias concluídas)

1. **Cabeçalho (faixa de identidade)** — imagem do hero antigo ancorada à
   direita + degradê; logo branco; título "Portal da Gerência de /
   **Contabilidade**" (Segoe UI 18/30, hierarquia por peso); busca translúcida
   sem dica de atalho; "Bem-vindo, <nome>" discreto com menu (trocar
   identificação, preferências e, para gerência, alertas). Sem A+/A e sem sino.
   ~149 px no total.
2. **Menu embutido na base da faixa** — tarja escura translúcida, itens
   centralizados com ícone, ativo com sublinhado laranja; dropdown branco
   alinhado à esquerda do item, borda superior laranja, **sem "Tudo em…"**;
   teclado e celular (botão "Menu"). Substituiu a barra lateral.
3. **Capa** — carrossel de destaques 16:9 na metade esquerda (7 s, pausa,
   setas, pontos, respeita "Reduzir movimento") + Avisos e Acesso rápido na
   direita; abaixo, "Comunicação recente". Saíram o bloco de apresentação, as
   três métricas e a trilha "Workspace / Visão geral".
4. **Enfeites removidos** — faixa RADAR, pontos pulsando, kickers em caixa
   alta, setas decorativas. Links externos usam o ícone de link externo.
5. **Rodapé institucional** em todas as telas, com mapa do portal por perfil,
   área responsável e data da base.
6. **Páginas de seção** (padrão CFC) — sem quadro de título; só a faixa de
   subpáginas colada ao menu (cinza `#ECECEC`, itens em caixa alta, linha azul
   de 3 px que desliza até o item sob o mouse/foco, 0,25 s). Substituiu a
   "Central de conteúdo" com 5 abas.
7. **Menus reorganizados** — "Sistemas" virou **Portais e Links**
   (Contabilidade = sistemas da área; Equatorial = 20 portais do Grupo;
   Externos = 7 links de terceiros) e nasceu **Sistemas e automações**
   (Contabilidade = automações; Equatorial = 8 atalhos SAP e afins em grade;
   Externos ainda pendente).
8. **Repositório de links (20/09)** — `data/portais.json` (Portais e Links →
   Equatorial, agrupado em Portal de Serviços, Comunicação e aprendizagem,
   SharePoint, Power BI, Pessoas e RH, Viagens) e `data/externos.json`
   (Portais e Links → Externos: Auditoria, Inteligência artificial, Arquivos e
   documentos, Referências visuais). Ambos com faixa de busca, filtro por grupo
   e contagem. O cartão mostra o **domínio de destino** no rodapé e a ficha do
   "i" traz uma **observação** quando o acesso tem pegadinha (rede interna,
   workspace pessoal do Power BI, envio de arquivo a serviço público). Origem:
   o export de favoritos em `projeto/equatorial-links/`, alocado item a item em
   `alocacao.md`. Snowflake e ONESOURCE TAX ONE entraram nos atalhos.
9. **Arte de todos os cartões (20/09, 61 SVGs)** — `.claude/tools/arte-marcas.py`
   substituiu `arte-motivos.py` e `arte-cartoes.py`, que foram apagados.
   `.pcard-img` passou de `object-fit: contain` para `cover`. São **dois modos**:
   - **`tela`** (9 cartões): reproduz a tela de entrada do destino — fundo, logo
     e título dela. ProjectHub e Central de Resultados usam a foto do próprio
     site; Cronograma de Fechamento e Portal de Auditoria, o degradê do painel
     de login (reproduzido em SVG a partir do CSS medido); IFRS 16/CPC 06 e
     Gestor de Horas, a paleta e o lockup de cada um; Lei 6.404 e LC 214, o
     Brasão da República do Planalto. Os insumos ficam em
     `projeto/marcas-telas/` — fora do site, porque já vão embutidos no SVG.
   - **`marca`** (52 cartões): marca oficial sobre o fundo da própria marca, sem
     desenho decorativo, com **rótulo abaixo** quando a marca se repete. 25
     marcas em `assets/marcas/` (origem em `FONTES.md`); 4 saem como assinatura
     tipográfica por falta de logo utilizável.
10. **Nome da seção na faixa de subpáginas (20/09)** — à esquerda das abas, com
   divisória, no padrão de microsoft.com/pt-br. Fica **fora da área rolável**:
   em tela estreita as abas rolam e o nome da seção permanece.
8. **Documentos & Normas** — abre direto na tabela, sem submenu; faixa com
   Todos + 5 grupos; **9 referências oficiais com link verificado** (CPC, CFC,
   IFRS, ANEEL/MCSE, SPED ECD e ECF, Lei 6.404, LC 214/2025, Central de
   Resultados da Equatorial). Os 13 documentos de exemplo e seus arquivos em
   `assets/documents/` foram apagados.
9. **Telas internas revisadas (fatia 5)** — **Sistemas e automações →
   Contabilidade**: saíram os quatro números do topo e a grade de 12 cartões;
   agora é tabela (Automação / Tecnologia / Status) com a contagem discreta no
   rodapé. A coluna de acesso só aparece quando alguma automação tiver link.
   **Comunicação → Notícias**: saiu o cabeçalho que repetia o nome da seção; a
   data da última atualização foi para o rodapé. **Pessoas → Estrutura das
   Equipes**: o banner azul em degradê virou uma barra clara com o rótulo da
   área e os botões Expandir/Recolher. Saiu também o degradê decorativo na
   borda das tabelas no celular.
10. **Sistema visual (fatia 6)** — escala tipográfica de 8 degraus no lugar de
    29 tamanhos; 3 pesos no lugar de 7; 5 raios no lugar de 15; 3 sombras no
    lugar de 15; e **nenhuma cor literal fora do `:root`** (eram 128). Todo
    texto passa em AA: o azul de ação, o cinza de apoio, as cores semânticas e
    o contorno de foco foram corrigidos. Detalhes em
    `.claude/redesign/03-sistema-visual.md`.
11. **Acabamento (fatia 7)** — o painel da gerência não pisca mais para quem
    não tem acesso (começa oculto no HTML); nenhum alvo de toque abaixo de
    24×24 px e nenhum texto abaixo de 12 px; o diálogo perdeu os rótulos em
    caixa alta e o desfoque do fundo; números em coluna com `tabular-nums`.
12. **Grade de cartões padronizada** — as três grades (Portais e Links →
    Contabilidade, Sistemas e automações → Equatorial e → Contabilidade)
    passaram a usar o mesmo cartão: uma **faixa horizontal** de ~176 px com a
    imagem numa coluna fixa à esquerda e as informações no restante, **duas
    por linha**. Clique no cartão não abre nada, ficha pelo "i" e destino por
    Acessar/Baixar. Borda e sombra medidas em microsoft.com/pt-br. Automações
    voltou de tabela para grade. Quem administra troca a arte clicando na
    imagem.
13. **Menu sem submenu suspenso** — clicar numa seção leva direto à primeira
    página dela; as demais aparecem na faixa de subpáginas, em abas, como
    Documentos & Normas já fazia. A faixa saiu de dentro do `#page-view` e
    passou a valer para qualquer seção, inclusive Gestão. Some quando a seção
    tem uma página só (Pessoas) ou já tem abas próprias (Administração).
14. **Faixa de busca e filtros padronizada** — toda tela de conteúdo tem a
    mesma faixa (busca, filtros, "Limpar filtros") e a contagem do resultado
    no rodapé. Ganharam faixa as telas que não tinham (sistemas da área,
    atalhos Equatorial e Newsletter); os chips de categoria de Notícias
    viraram um `<select>` na faixa. A capa segue sem faixa.
15. **Documentos & Normas entrou na mesma grade** de Portais e Links: saiu da
    tabela e virou cartão em faixa, com o grupo como rótulo, a fonte oficial
    na linha de ações e a data de conferência do link na ficha do "i". Não há
    mais tabela de conteúdo no portal — só a de processos críticos, no painel
    da gerência.
16. **Arte em todos os cartões** — 26 SVGs (5 atalhos, 12 automações, 9
    documentos) com **a marca oficial da fonte de cada item** (CFC, CPC, IFRS,
    ANEEL, Receita Federal, gov.br, SAP, SharePoint, EY, Python e Grupo
    Equatorial), preenchendo o quadro. **Refeita em 20/09** — ver o item 10.

---

## 4. Exigências do usuário (travadas — não proponha de novo)

### Cabeçalho e menu
- Menu com **ícones**; carrossel **16:9 ocupando metade** da capa.
- Faixa do topo **não é fixa** ao rolar; ~149 px (96 de identidade + 53 de menu).
- Hierarquia do título **por peso**, mesma fonte do portal (a Bahnschrift foi
  testada e recusada).
- **Nenhum submenu suspenso.** Clicar numa seção leva direto à primeira página;
  as demais aparecem na faixa de subpáginas, **em abas**, como Documentos &
  Normas já fazia. Vale para qualquer seção.
- **Sem quadro de título/trilha** nas páginas internas.
- **O nome da seção fica à esquerda das abas**, na faixa de subpáginas. Motivo
  dado pelo usuário: em tela estreita o menu some e essa era a única pista de
  onde se está. Não pode rolar junto com as abas.

### Grade de cartões (vale para todas as telas de lista)
- O cartão é uma **faixa horizontal**, com **altura de cerca de 1/3** do cartão
  alto que existiu antes (~176 px), **dois por linha**.
- A **imagem ocupa uma coluna fixa à esquerda**, em altura cheia; as
  informações ficam no restante do espaço.
- **Clicar no cartão não abre nada.** A ficha sai pelo ícone **"i"** (que abre
  o modal — o usuário pediu para **manter o modal** nesse caminho) e o destino
  pelo botão **Acessar** ou **Baixar**.
- Borda e sombra no padrão medido em **microsoft.com/pt-br**.
- **Uma grade só** para todo conteúdo de lista. Documentos & Normas saiu da
  tabela e entrou nela; não há mais tabela de conteúdo no portal.

### Imagens dos cartões — **aprovadas pelo usuário em 20/09**
- **Quando o destino tem tela de entrada própria, a arte reproduz essa tela.**
  Acessar o link **em largura de desktop** (1600 px; o ProjectHub, por exemplo,
  esconde o painel de identidade em tela estreita), entender a composição e
  reaproveitar o que já está pronto: o fundo dela, a logo na posição dela, o
  título na tipografia dela. Cada cartão guarda a personalidade do sistema.
  Exemplos que o usuário deu: ProjectHub, Cronograma de Fechamento, Central de
  Resultados.
- **A marca tem de bater com o destino.** Se o link vai ao Planalto, a marca é o
  Brasão da República — não o gov.br (correção do usuário em 20/09).
- **Marca real, não desenho.** Para cada cartão, achar a **logomarca da
  empresa/instituição** dona do assunto (se a norma vem do CFC, vai a logo do
  CFC) e, se possível, algo do próprio tema junto.
- **Pesquisar a fundo, um a um.** Entrar no site de cada item (quando houver)
  para entender o teor e pegar a marca. Nada de tratar a grade em bloco.
- **A imagem preenche o quadro inteiro**, dimensionada para não ficar quebrada.
- **Se a imagem não puder preencher tudo**, o fundo do quadro recebe **o mesmo
  fundo da própria logo** (foi por isso que o painel ficou branco).
- **Sem ícone ou desenho junto da marca.** A arte é a marca e o fundo, mais nada.
- **Marca repetida pede rótulo.** Quando a mesma logo serve a vários cartões
  (SAP, Python, ServiceNow, Receita Federal, gov.br, Equatorial), vai um texto
  abaixo dela — a transação, a norma, o sistema — em harmonia com a imagem.
- Quem administra **troca a arte clicando na própria imagem** do cartão.
- Referências visuais que o usuário enviou: a capa do **Porto Bank** (azul
  profundo com luz atrás do assunto), o cartão do **XBOX Series S** (imagem em
  área fixa + título + texto + botão) e dois exemplos de marca institucional
  (ANEEL sobre claro, CFC/CRCs sobre azul).

### Faixa de busca e filtros
- **Toda tela de conteúdo tem a mesma faixa**: busca, filtros e "Limpar
  filtros", nessa ordem, com a contagem do resultado no rodapé.
- **A capa não tem** — lá a busca é a do cabeçalho.

### Conteúdo
- **O portal não é só ferramenta da empresa.** Ele é também um **repositório de
  links externos** que ajudam no dia a dia — IA, conversores, referências
  visuais. Não recuse um link por ser de terceiro.
- **Autenticação é com o usuário.** O portal centraliza e facilita; ele não
  resolve login, VPN nem permissão. Um link que exige conta própria ou rede
  interna entra do mesmo jeito — basta dizer isso na ficha.
- Documentos: **só conteúdo real**, com link oficial verificado.
- Trabalhar **direto nos arquivos reais** (a `main` segue em produção para
  comparação). **Nada de commit** sem o usuário pedir.

---

## 5. Próximos passos

**Nada em avaliação.** As 61 artes foram **aprovadas pelo usuário em
20/09/2026**. Regerar com `python .claude/tools/arte-marcas.py`; conferir em
`projeto/artes/contato.html` (todas, no tamanho real do cartão) e
`projeto/artes/telas.html` (as do modo `tela`, ampliadas).

**Achados das auditorias que aguardam decisão**
- **Largura do diálogo** (`dudu-check-modais`): em 1440 px o diálogo tem 640 px
  e o conteúdo de uma publicação chega a 1254 px — sobram ~490 px de rolagem
  com 800 px de tela vazia dos lados. Alargar para ~820 px cortaria quase toda
  a rolagem. Não apliquei: mexe em largura, e essa skill exige aval item a item.
- Os diálogos de edição (Novo rascunho, Administração) **não foram medidos**:
  exigem o backend opcional ligado.
- A categoria "IA" duplicada em `config.json` **não existe mais**.

**Bloqueios que dependem do usuário**
- **Nenhum perfil tem a permissão `administracao`** nos dados de hoje, então o
  botão "Trocar imagem" e a janela de Administração nunca aparecem. Ou se cria
  esse perfil, ou a troca de imagem também vale para a Gerência.
- **Os atalhos Equatorial não gravam pela API**: `config.json` é somente
  leitura no servidor, então a arte deles só muda editando o JSON.
- **Quatro cartões sem logo oficial** — ONESOURCE, Learning.rocks,
  Qulture.Rocks e ARGO saem como assinatura tipográfica. Ver o fim de
  `assets/marcas/FONTES.md` para trocar.
- **Os seis prints em `assets/sistemas/*.webp`** não são mais usados. Os
  arquivos estão versionados; apagar só se o usuário confirmar.
- **A foto do banner da Central de Resultados** veio do site de RI e é um
  licenciamento de banco de imagens (iStock) que a Equatorial contratou para
  aquele site. O portal é publicado no GitHub Pages: vale confirmar com quem
  cuida do RI antes de publicar.
- Conteúdo real para destaques e avisos (`data/destaques.json`,
  `data/avisos.json` estão com exemplos marcados).

---

## 6. Como trabalhar neste projeto

- **Preview**: `.claude/launch.json` → `preview_start` com `name: "portal"`
  (Python, porta 5500). Verificar sempre em **1366 px e 375 px**, conferir o
  console e testar com mais de um perfil.
- **Perfis de teste**: `localStorage['portal-identity']`. Eduardo (Colaborador)
  é `colaborador-eduardo-dos-santos-rocha`; para testar Gerência, use
  `colaborador-alexandra-furtado-freire-paes-landim`. **Sempre devolver a
  identificação do Eduardo depois do teste.**
- **Verificar sempre** com `.claude/tools/contraste.js` no console: ele confere
  contraste AA, alvo de toque mínimo de 24 px, texto abaixo de 12 px e estouro
  horizontal, tela por tela.
- **Capturas do preview mentem** de vez em quando (faixa de menu ou listas em
  branco) quando a janela do app está atrás de outra. Antes de caçar um bug,
  meça o elemento com `getBoundingClientRect()`.
- **Cache**: depois de mexer em CSS, JS ou numa arte, rode
  `python .claude/tools/versao.py --subir`. Ele sobe o `?v=AAAAMMDD-N` nas 19
  ocorrências de uma vez — `index.html`, o CSS e todos os imports, que precisam
  bater entre si, senão o navegador carrega duas cópias do mesmo módulo.
  **As imagens não têm número próprio**: `comVersao()` em `js/ui.js` lê a versão
  do endereço do próprio módulo e a carimba em tempo de renderização, então
  subir a versão basta para uma arte nova chegar a quem já visitou — sem
  Ctrl+F5. `python .claude/tools/versao.py` sem argumento mostra a versão atual
  e avisa se duas estiverem convivendo.
- **Quebras de linha**: o repositório tem CRLF e LF misturados. Depois de
  reescrever arquivos por script, rodar `.claude/tools/eol.py <arquivo>` para o
  diff mostrar só as mudanças reais. Sem isso, o diff "muda" o arquivo inteiro.
- **Ao apagar regras CSS**: `.claude/tools/cssprune.py` já apagou o fechamento
  de um comentário junto com a regra e transformou 110 regras em comentário — a
  página fica sem estilo e nada aparece no console. A ferramenta agora preserva
  os comentários e aborta se o total mudar; ainda assim, **conferir a tela no
  navegador depois de podar**.
- **Edições por script**: ler o arquivo com `.replace('\\r\\n','\\n')` antes de
  casar trechos de várias linhas.
- **Nada de commit** sem o usuário pedir.

## 7. Pendência de publicação

O workflow `.github/workflows/pages.yml` publica **a pasta inteira** do
repositório no GitHub Pages (site público). `projeto/` (marca + e-mails
internos, com nomes de colaboradores) e `skills-lock.json` estão fora do Git
hoje; se forem commitados, vão para o ar. Decidir antes do commit: `.gitignore`
ou exclusão no workflow.
