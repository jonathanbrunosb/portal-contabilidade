# Marcas usadas na arte dos cartões

Cada arquivo aqui é a **marca oficial do titular**, usada apenas para
identificar o destino do link dentro do portal (uso nominativo). Nenhuma marca
é do Grupo Equatorial, exceto as de `assets/logos/`. A composição final de cada
cartão é gerada por `.claude/tools/arte-marcas.py`.

Se o titular pedir a retirada, basta apagar o arquivo e trocar o cartão pelo
botão **"Trocar imagem"**, na própria imagem do cartão.

## Origem de cada arquivo

| Arquivo | Titular | Origem |
|---|---|---|
| `aneel.png` | ANEEL | site oficial da agência |
| `cfc.png` | Conselho Federal de Contabilidade | site oficial do CFC |
| `cpc.png` | Comitê de Pronunciamentos Contábeis | site oficial do CPC |
| `ifrs.svg` | IFRS Foundation | site oficial da IFRS Foundation |
| `receita-federal.svg` | Receita Federal do Brasil | Wikimedia Commons |
| `govbr.png` | Governo Federal (gov.br) | Wikimedia Commons — **versão branca**, por isso a arte usa o azul institucional `#1351b4` |
| `sap.svg` | SAP SE | Wikimedia Commons |
| `sharepoint.svg` | Microsoft | Wikimedia Commons |
| `microsoft.svg` | Microsoft | Wikimedia Commons — `Microsoft logo (2012).svg` |
| `power-bi.svg` | Microsoft | Wikimedia Commons — `New Power BI Logo.svg` |
| `python.svg` | Python Software Foundation | Wikimedia Commons |
| `ey.svg` | EY | site oficial da EY |
| `openai.svg` | OpenAI | Wikimedia Commons — `ChatGPT logo.svg` |
| `gemini.svg` | Google | Wikimedia Commons — `Google Gemini logo.svg` |
| `claude.svg` | Anthropic | claude.ai — o SVG da logo da tela de entrada (ícone em `#d97757` e o nome em `#0b0b0b`), lido do DOM em 22/09/2026 |
| `google.svg` | Google | Wikimedia Commons |
| `meta.svg` | Meta Platforms | Wikimedia Commons — usada no cartão do Workplace |
| `servicenow.svg` | ServiceNow | Wikimedia Commons |
| `snowflake.svg` | Snowflake Inc. | Wikimedia Commons |
| `wetransfer.svg` | WeTransfer | Wikimedia Commons — mark preto recolorido para branco sobre o azul `#409fff` da marca |
| `ilovepdf.svg` | iLovePDF | site oficial |
| `coolors.svg` | Coolors | site oficial |
| `datylon.svg` | Datylon | site oficial (ícone da marca) |
| `actio.png` | Actio | site oficial (ícone 192 px) |
| `paytrack.png` | Paytrack | site oficial (ícone 150 px) |
| `qulture-rocks.svg` | Qulture.Rocks | assinatura horizontal oficial (239×34), da tela de entrada. Vem na plum `#5A0048` do cartão branco do login; o gerador a troca por branco para pousar sobre o magenta |
| `senior-marca.png` | Senior Sistemas | arquivo de personalização do tenant do Grupo, no bucket público da Senior |
| `passatempo.png` | Passatempo (jornada de trabalho, Grupo Equatorial) | servida pela própria ficha do catálogo, no Portal de Serviços. Fica em `projeto/marcas-telas/` porque é marca interna e já vai embutida no SVG |
| `qulture-rocks.png` | Qulture.Rocks | site oficial (ícone 32 px — pequeno demais, **não usado**) |

## Telas de entrada reproduzidas

Vinte e dois cartões não usam logo sobre cor chapada: a arte **reproduz a tela
de entrada do destino**. Os insumos (foto de fundo e logo de cada sistema) ficam
em `projeto/marcas-telas/`, **fora do site publicado** — já vão embutidos no
SVG, não precisam ser servidos.

| Cartão | O que foi reaproveitado |
|---|---|
| ProjectHub | foto `login-institutional.webp` + véu em degradê + logo branca + o lockup "ProjectHub / Gestão Integrada de Projetos" |
| Cronograma de Fechamento | o painel de login: degradê de 145° com três focos de luz, reconstruído em SVG a partir do CSS medido, + título em Georgia |
| Portal de Auditoria | o mesmo painel, com a logo e o título do próprio sistema |
| IFRS 16 / CPC 06 | degradê `#F1F5F9 → #E2E8F0`, logo azul e as cores de texto do sistema |
| Gestor de Horas | logo branca do sistema sobre `#111827` |
| Monitor de Desempenho | marca Equatorial (o sistema ainda não tem endereço) |
| Central de Resultados | foto do banner do site de RI + véu azul + logo + título |
| Lei nº 6.404/1976 | Brasão das Armas da República, do Planalto |
| Lei Complementar nº 214/2025 | idem |
| Portal de Serviços (8 cartões) | foto de fundo do próprio portal + véu nas cores dele + logo Grupo Equatorial branca; o título diz qual serviço é |
| Conecta — Central do Funcionário | o banner de entrada, recortado na chamada "Bem-vindos ao Conecta."; **sem lockup nosso**, o banner já é o dele |
| Gente e Gestão | o banner da campanha de RH, janela fechada em 1,19 e ancorada à direita para não cortar frase pela metade; **sem lockup nosso** |
| Portal do Empregado | a moldura da plataforma Senior (bloco da marca, `#333579`) com a marca da Senior e o título |
| Qulture.Rocks | o magenta da tela de entrada (`#5a0048` com focos de luz) e a assinatura oficial em branco |
| Saber — Universidade Corporativa | o banner de entrada, que tem lockup próprio ("Gente que Aprende / Conhecimento para transformar o futuro" com o selo dos dois capacetes); **sem lockup nosso** |

> As telas precisam ser lidas **em largura de desktop** (1600 px): o ProjectHub,
> por exemplo, esconde o painel de identidade em tela estreita.

> O `/esc` é o **Conecta**, portal com identidade própria — banner de entrada,
> barra de menu `#333579` e seções suas. Insumos em `projeto/marcas-telas/`:
> `esc-conecta-banner.png`, `esc-gente-banner.png` e `esc-logo.png`, todos
> servidos pelo próprio portal.

> O banner do Saber não pode ser baixado daqui: o CDN da plataforma serve por
> **URL assinada da CloudFront** (`403 MissingKey`) e o canvas da página fica
> manchado por ser outro domínio. O arquivo em `projeto/marcas-telas/` é o
> recorte que o usuário salvou e entregou. Se ele mudar, peça um recorte novo.

> Os nove cartões do Portal de Serviços mostravam a marca do **fornecedor**
> (ServiceNow, Microsoft, SAP) — que não é para onde o link leva: todos abrem
> um item do catálogo do portal do Grupo. Trocados em 20/09 pela tela real,
> lida em 1600 px. Insumos: `portal-servicos-fundo.jpg` e
> `portal-servicos-logo.png`, servidos pelo próprio portal
> (`portaldeservicos.equatorialenergia.com.br`); a foto foi recortada na faixa
> que a tela mostra. Como a mesma tela serve nove cartões, cada KB embutido é
> cobrado nove vezes — daí `fotoLargura` e `logoFonte` no spec.

> A foto do banner da Central de Resultados é licenciamento de banco de imagens
> (iStock) contratado para o site de RI. Como o portal é publicado, confirme com
> quem cuida do RI antes de publicar.

## Cartões sem logo oficial

Duas marcas não têm arquivo utilizável que eu tenha conseguido obter. A arte
sai como **assinatura tipográfica** sobre a cor da marca, e está sinalizada no
gerador em `ASSINATURA`:

| Cartão | Por quê |
|---|---|
| ONESOURCE (Thomson Reuters) | o que o Commons tem sob "Thomson" é a marca antiga da Thomson Corporation, não a da Thomson Reuters |
| ARGO (Pontes Tur) | o site não respondeu |

Para trocar qualquer uma delas: salve o arquivo aqui, aponte o nome em
`MARCA`, tire a entrada de `ASSINATURA` e rode
`python .claude/tools/arte-marcas.py`.
