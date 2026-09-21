# Portal da Gerência de Contabilidade — instruções do projeto

Lidas pelo Claude Code em toda sessão. Ficam em `.claude/`, que o
`.github/workflows/pages.yml` apaga antes de publicar.

Antes de mexer na interface (`index.html`, `css/`, `js/`, `data/*.json` que
aparece na tela), carregue a skill `portal-corporativo`: ela traz as decisões
já travadas, o que não fazer e como verificar.

## Commits por assunto (pedido do usuário em 21/09/2026)

O usuário quer o histórico contando **o que foi feito, assunto por assunto** —
não um commit gigante no fim do dia. Por isso:

1. **Cada assunto pronto vira um commit, feito pelo Claude, sem esperar
   pedido.** Assunto = um pedido do usuário ou uma frente coerente ("realce das
   abas", "capa com a Comunicação à vista", "comunicado do CFC"). Três pedidos
   numa mensagem são três commits.
2. **Quando:** assim que o assunto estiver feito **e verificado** (preview,
   medidas, console), antes de começar o próximo. Isso mantém um assunto por
   arquivo de cada vez e evita separar trechos depois. Se o usuário ainda vai
   opinar sobre algo visual, commite o que foi entregue; o ajuste vira o
   commit seguinte.
3. **O que entra no commit do assunto:** código, dados, imagens **e** a
   documentação dele (README, TESTES, `.claude/redesign/*`, a skill,
   `PROJETO_ESTADO_*.md`) e a subida do cache-buster (`versao.py --subir`).
4. **Como:**
   - `python .claude/tools/eol.py <arquivos>` antes (o repositório mistura
     CRLF e LF);
   - `git add` **por caminho** — nunca `git add -A` nem `git add .`;
   - conferir com `git diff --cached --stat` antes de commitar;
   - se um arquivo tiver trechos de dois assuntos, separar os trechos
     (patch aplicado com `git apply --cached`, ou blob montado e gravado com
     `git update-index --cacheinfo`) — o `git add -p` interativo não funciona
     aqui.
5. **Mensagem:** em português, verbo no imperativo, título de até ~72
   caracteres no estilo do histórico ("Repartir Portais e Links, refazer o
   carrossel e revisar a arte dos cartões"). Corpo curto: o que mudou, **por
   quê** (o pedido ou o problema) e como foi conferido. Terminar com o
   `Co-Authored-By` indicado pelo ambiente.
6. **Nunca entra:** `projeto/` (material interno), `INICIAR_API.cmd` e `.env`
   (token real), `server/audit.log`, segredos, links de rastreamento de e-mail
   (`app.simplificaci.com.br/dntracker…`). O `.gitignore` cobre os caminhos,
   mas confira o `git status` mesmo assim.
7. **Branch e envio:**
   - nunca commitar na `main`; trabalhar numa branch (hoje
     `ajustes-frontend-dudu`);
   - **sem merge na `main`** enquanto o `pages.yml` publicar o site aberto
     (a branch tem conteúdo interno);
   - **`git push` só quando o usuário pedir.** Commit é local; enviar é outra
     decisão.
8. **Checkpoint** (skill `dudu-checkpoint-end`): neste projeto os arquivos de
   estado também são commitados pelo Claude ("Registrar o checkpoint de
   AAAA-MM-DD"), e a caixa de git do fim vira o comando de envio.
9. Ao fim de cada resposta que fechou assuntos, diga quais commits foram
   feitos (hash curto + título).
