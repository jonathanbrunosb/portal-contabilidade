# Registro de validação — 14/09/2026

Validação em servidor estático local e navegador integrado. Não foram executadas sessões separadas de Chrome e Edge nem testes em dispositivos físicos.

## Layout

| Viewport | Resultado |
| --- | --- |
| Desktop 1920 × 1080 | Conteúdo renderizado, largura da página 1905 px, sem overflow horizontal global |
| Notebook 1366 × 768 | Conteúdo renderizado, largura da página 1351 px, sem overflow horizontal global |
| Tablet 768 × 1024 | Menu recolhível e conteúdo dentro da largura; página 753 px |
| Celular 390 × 844 | Menu fechado inicialmente, conteúdo em coluna; página 375 px |

A diferença de 15 px corresponde à barra de rolagem vertical. No celular, a tabela tem 556 px dentro de um contêiner de 345 px, preservando a rolagem horizontal somente na tabela. As tabs também possuem rolagem própria.

## Fluxos verificados

- Matrícula `2026001`: Jonathan Bruno, Gestor, Contabilidade IV.
- Matrícula `123456` em `index.html`: Marina Oliveira, Gerência.
- Matrícula `999999`: colaborador não identificado e avatar padrão.
- URL sem matrícula: colaborador não identificado e matrícula não informada.
- Quatro tabs da central: newsletter, notícias, sistemas e documentos.
- Newsletter: quatro publicações, abertura do conteúdo completo e pausa do radar por botão.
- Organograma: Gerência e quatro equipes com líderes e contagens.
- Busca por `conciliações`: cinco resultados; termo inexistente retorna estado vazio; limpeza funciona.
- Documentos: filtro textual por conciliações e filtro de categoria IFRS; detalhes exibidos; destino de download válido.
- Sistemas: quatro cards; acesso sem URL mostra mensagem de configuração pendente.
- Menu mobile: abertura com `aria-expanded=true`, seleção de Sistemas e fechamento com `aria-expanded=false`.
- Navegação e rolagem entre seções; tabela contida no celular.
- Console consultado após a implementação e após a revisão: nenhum erro ou aviso JavaScript capturado.

## Arquivos e dados

- 11 JSONs com sintaxe válida e IDs únicos em cada coleção.
- Todos os HTML, CSS, JavaScript, JSON e SVG locais responderam HTTP 200.
- 13 documentos demonstrativos e caminhos dos avatares existentes.
- Destinos do menu correspondem às seções reais.
- Referências das soluções de equipes correspondem aos sistemas cadastrados.
- Sem instalação de dependências, sem requisições a CDN, sem publicação em nuvem.

## Limites e checklist para homologação corporativa

Não houve navegação nos sistemas reais, pois seus endereços não foram fornecidos. Downloads foram validados pelo destino HTTP e atributo de download; o fluxo de salvamento do navegador não foi homologado separadamente. Pausa por hover, preferência de movimento, navegação completa por teclado, zoom de 200% e políticas específicas de Chrome/Edge devem integrar a homologação corporativa. A implementação desses comportamentos está no código, mas não se declara aqui uma certificação de acessibilidade.

Todos os conteúdos e indicadores são demonstrativos. Validar documentos, datas, contagens, responsáveis e URLs com a Gerência antes do uso operacional.
