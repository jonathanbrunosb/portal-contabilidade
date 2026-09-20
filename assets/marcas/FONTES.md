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
| `qulture-rocks.png` | Qulture.Rocks | site oficial (ícone 32 px — pequeno demais, **não usado**) |

## Telas de entrada reproduzidas

Nove cartões não usam logo sobre cor chapada: a arte **reproduz a tela de
entrada do destino**. Os insumos (foto de fundo e logo de cada sistema) ficam
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

> As telas precisam ser lidas **em largura de desktop** (1600 px): o ProjectHub,
> por exemplo, esconde o painel de identidade em tela estreita.

> A foto do banner da Central de Resultados é licenciamento de banco de imagens
> (iStock) contratado para o site de RI. Como o portal é publicado, confirme com
> quem cuida do RI antes de publicar.

## Cartões sem logo oficial

Quatro marcas não têm arquivo utilizável que eu tenha conseguido obter. A arte
sai como **assinatura tipográfica** sobre a cor da marca, e está sinalizada no
gerador em `ASSINATURA`:

| Cartão | Por quê |
|---|---|
| ONESOURCE (Thomson Reuters) | o que o Commons tem sob "Thomson" é a marca antiga da Thomson Corporation, não a da Thomson Reuters |
| Learning.rocks | o site devolve o mesmo ícone do Qulture.Rocks |
| Qulture.Rocks | só expõe um ícone de 32 px |
| ARGO (Pontes Tur) | o site não respondeu |

Para trocar qualquer uma delas: salve o arquivo aqui, aponte o nome em
`MARCA`, tire a entrada de `ASSINATURA` e rode
`python .claude/tools/arte-marcas.py`.
