import { escapeHTML as e,icon,dateLabel,detailGrid,safeURL,comVersao,normalize,ORIGENS,seloOrigem } from './ui.js?v=20260921-47';
// Comunicação (decisão do usuário em 21/09/2026): a Newsletter Contábil e
// Notícias & Impactos viraram uma lista só de comunicados, repartida por origem
// nas abas da seção (Todos, Contabilidade, Equatorial, Externo). Cada
// comunicado é uma faixa na lista e ganhou página própria, com endereço
// #central/comunicado/<coleção>/<id>. Os dados continuam em dois arquivos —
// newsletter.json e noticias.json — porque o Painel Editorial grava neles.
const CANAIS= {
  newsletter:'Newsletter Contábil',noticias:'Notícias & Impactos'
}
;
export const hashComunicado=(colecao,id)=>`#central/comunicado/${colecao}/${encodeURIComponent(id)}`;
// Publicados das duas coleções, do mais recente ao mais antigo. O mesmo
// comunicado cadastrado nas duas (mesmo título) aparece uma vez só: fica a
// cópia da Newsletter, que vem primeiro; a outra continua no arquivo e no
// Painel Editorial (decisão do usuário em 21/09 — nada é apagado).
export function comunicados(data) {
  const vistos=new Set();
  return [...(data.newsletter||[]).map(item=>({item,colecao:'newsletter'})),...(data.noticias||[]).map(item=>({item,colecao:'noticias'}))]
    .filter(({item})=>item.status==='Publicado'&&item.ativo!==false)
    .filter(({item})=> {
      const chave=normalize(item.titulo).trim();
      if(vistos.has(chave))return false;
      vistos.add(chave);
      return true;
    }
    )
    .sort((a,b)=>(b.item.dataPublicacao||'').localeCompare(a.item.dataPublicacao||''));
}
const impactoDe=item=>item.impacto||item.nivelImpacto||'';
// A busca cobre título, resumo, texto, categoria, fonte, palavras-chave,
// empresas impactadas, área responsável e impacto.
export function filtrarComunicados(lista,{categoria='',query=''}={}) {
  const q=normalize(query).trim();
  return lista.filter(({item})=> {
    if(categoria&&item.categoria!==categoria)return false;
    if(!q)return true;
    return normalize([item.titulo,item.resumo,textoCorrido(item),item.categoria,item.fonte,(item.palavrasChave||[]).join(' '),(item.empresasImpactadas||[]).join(' '),item.areaResponsavel,impactoDe(item)].filter(Boolean).join(' ')).includes(q);
  }
  );
}
// Imagem do comunicado ou, sem ela, um quadro na cor da origem com o ícone de
// comunicação — hoje a maioria dos comunicados ainda não tem imagem própria.
// Na lista e na capa a imagem é decorativa (o título está ao lado), então o
// `alt` fica vazio; na página do comunicado entra a descrição cadastrada.
// Peça vertical (cartaz de e-mail) tem `imagemCapa`, um recorte horizontal do
// topo, para a faixa e a capa; a página mostra a peça inteira (`imagem`).
function midia(item,classe) {
  const src=safeURL(item.imagemCapa||item.imagem);
  if(src)return `<span class="${classe}"><img src="${e(comVersao(src))}" alt="" loading="lazy"></span>`;
  return `<span class="${classe} sem-imagem ${e(item.origem||'')}">${icon('news')}</span>`;
}
// Imagem que falha ao carregar vira o mesmo quadro de quem não tem imagem; na
// página do comunicado, a figura some.
export function ligarMidias(root) {
  root.querySelectorAll('.midia-comunicado img').forEach(img=>img.addEventListener('error',()=> {
    const quadro=img.parentElement;
    quadro.classList.add('sem-imagem',img.closest('[data-origem]')?.dataset.origem||'sem-origem');
    quadro.innerHTML=icon('news');
  }
  , {
    once:true
  }
  ));
  root.querySelectorAll('.comunicado-figura img,.comunicado-figura-texto img,.comunicado-retrato img').forEach(img=>img.addEventListener('error',()=>img.closest('figure').remove(), {
    once:true
  }
  ));
}
const metaDe=item=>`<p class="comunicado-meta">${seloOrigem(item.origem)}<span>${e(item.categoria||'')}</span><time datetime="${e(item.dataPublicacao)}">${e(dateLabel(item.dataPublicacao))}</time></p>`;
// Marcação leve do texto do comunicado (21/09/2026): uma linha "## Título" abre
// um intertítulo e uma linha "[figura N]" põe ali a N-ª imagem de `figuras`
// ({imagem, alt, legenda}); "**trecho**" é o negrito do original. Na faixa da
// lista e na busca, as marcas somem.
const MARCA_FIGURA=/^\[figura (\d+)\]$/i;
const NEGRITO=/\*\*(.+?)\*\*/g;
const linhasDe=item=>(item.conteudoCompleto||'').split('\n').map(linha=>linha.trim()).filter(Boolean);
const textoCorrido=item=>linhasDe(item).filter(linha=>!MARCA_FIGURA.test(linha)).map(linha=>linha.replace(/^##\s+/,'').replace(NEGRITO,'$1')).join(' ');
// Escapa primeiro e só depois troca as marcas: o texto nunca vira HTML.
const comNegrito=linha=>e(linha).replace(NEGRITO,'<strong>$1</strong>');
// Como no jornal (pedido do usuário em 21/09/2026): a figura flutua e o texto
// a contorna. A capa flutua à direita; as figuras do texto alternam, a 1ª à
// esquerda, a 2ª à direita… Clicar abre a imagem inteira em outra aba —
// infográfico na largura da coluna pode pedir zoom.
function figuraHTML(figura,n) {
  const src=figura&&safeURL(figura.imagem);
  if(!src)return '';
  const lado=n%2?'direita':'esquerda';
  return `<figure class="comunicado-figura-texto flutua-${lado}"><a href="${e(comVersao(src))}" target="_blank" rel="noopener noreferrer" title="Abrir a imagem inteira em outra aba"><img src="${e(comVersao(src))}" alt="${e(figura.alt||'')}" loading="lazy"></a>${figura.legenda?`<figcaption>${e(figura.legenda)}</figcaption>`:''}</figure>`;
}
// Foto de pessoa (figura com `tipo: "retrato"`): pequena, à esquerda, presa ao
// parágrafo seguinte, como nos comunicados de movimentação do Grupo — cada
// perfil começa com a sua foto, e o próximo não sobe para o lado dela.
function perfilHTML(figura,paragrafo) {
  const src=safeURL(figura.imagem);
  const foto=src?`<figure class="comunicado-retrato"><img src="${e(comVersao(src))}" alt="${e(figura.alt||'')}" loading="lazy"></figure>`:'';
  return `<div class="comunicado-perfil">${foto}${paragrafo?`<p>${comNegrito(paragrafo)}</p>`:''}</div>`;
}
function corpoComunicado(item) {
  const linhas=linhasDe(item),saida=[];
  for(let i=0;i<linhas.length;i++) {
    const linha=linhas[i],marca=linha.match(MARCA_FIGURA);
    if(marca) {
      const figura=(item.figuras||[])[Number(marca[1])-1];
      if(figura?.tipo==='retrato') {
        const seguinte=linhas[i+1];
        const junta=seguinte&&!MARCA_FIGURA.test(seguinte)&&!seguinte.startsWith('## ');
        saida.push(perfilHTML(figura,junta?seguinte:''));
        if(junta)i++;
        continue;
      }
      saida.push(figuraHTML(figura,Number(marca[1])-1));
      continue;
    }
    if(linha.startsWith('## ')) {
      saida.push(`<h3 class="comunicado-intertitulo">${e(linha.slice(3))}</h3>`);
      continue;
    }
    saida.push(`<p>${comNegrito(linha)}</p>`);
  }
  return saida.join('');
}
// Faixa da lista: imagem à esquerda; origem, categoria e data; título;
// subtítulo; e o texto até onde couber. A faixa inteira leva à página do
// comunicado — o link do título estica um ::after por cima dela, como no .pcard.
export function faixaComunicado({item,colecao}) {
  const destino=hashComunicado(colecao,item.id);
  const texto=textoCorrido(item);
  return `<article class="comunicado-faixa" data-origem="${e(item.origem||'')}">${midia(item,'midia-comunicado comunicado-faixa-midia')}<div class="comunicado-faixa-corpo">${metaDe(item)}<h3><a class="comunicado-faixa-link" href="${e(destino)}" data-route="${e(destino)}">${e(item.titulo)}</a></h3>${item.resumo?`<p class="comunicado-faixa-subtitulo">${e(item.resumo)}</p>`:''}${texto?`<p class="comunicado-faixa-texto">${e(texto)}</p>`:''}<span class="comunicado-faixa-mais" aria-hidden="true">Ler comunicado completo</span></div></article>`;
}
export function renderIndicadoresNoticia(item) {
  const indicadores=Array.isArray(item.indicadores)?item.indicadores.filter(ind=>ind&&(ind.label||ind.valor)):[];
  if(!indicadores.length)return '';
  return `<div class="noticia-indicadores">${indicadores.map(ind=>`<div class="noticia-indicador"><strong>${e(ind.valor)}</strong><span>${e(ind.label)}</span></div>`).join('')}</div>`;
}
const linkExterno=(url,rotulo,extra='')=>`<a class="primary-btn" href="${e(url)}" target="_blank" rel="noopener noreferrer"${extra}>${e(rotulo)}${icon('external').replace('class="icon"','class="icon ext"')}</a>`;
// Página própria do comunicado: origem, categoria e data; título; subtítulo;
// imagem; texto na íntegra; indicadores; ações (fonte, documento, sistema) e a
// ficha com a governança editorial. O texto tem largura de leitura (~70ch).
export function paginaComunicado({item,colecao},{sistema=null}={}) {
  const fonte=safeURL(item.urlFonte||item.link),documento=safeURL(item.documento),src=safeURL(item.imagem);
  const acessoSistema=sistema&&safeURL(sistema.link);
  const acoes=[
    // `rotuloLink` quando o link não é a fonte, e sim uma ação (ex.: o quiz do MigraSAP).
    fonte?linkExterno(fonte,item.rotuloLink||'Consultar fonte'):'',
    documento?`<a class="primary-btn" href="${e(documento)}" download>${icon('download')}Baixar documento</a>`:'',
    acessoSistema?linkExterno(acessoSistema,`Acessar ${sistema.nome.split(' — ')[0]}`,` data-quick="${e(sistema.nome)}"`):''
  ].join('');
  const voltar=ORIGENS[item.origem]?`#central/comunicacao-${item.origem}`:'#central/comunicacao';
  const paragrafos=corpoComunicado(item);
  const ficha=detailGrid( {
    'Publicação':dateLabel(item.dataPublicacao),'Vigência':dateLabel(item.dataVigencia),'Origem':ORIGENS[item.origem],'Categoria':item.categoria,
    'Canal':CANAIS[colecao],'Fonte':item.fonte,'Responsável':item.responsavel,'Área responsável':item.areaResponsavel,
    'Empresas impactadas':item.empresasImpactadas,'Impacto':impactoDe(item),'Aprovado por':item.aprovadoPor,'Aprovado em':item.dataAprovacao?dateLabel(item.dataAprovacao):'',
    // De onde vêm as imagens, quando não são da fonte (ilustração gerada com IA).
    ...(item.creditoImagens?{'Imagens':item.creditoImagens}:{})
  }
  );
  // Matéria de jornal (pedidos do usuário em 21/09/2026 — a tela sobrava vazia
  // à direita): o texto ocupa a largura toda, justificado, e as imagens flutuam
  // dentro dele. Abaixo da matéria, as ações e, lado a lado, a ficha e "Mais
  // comunicados" (este entra pelo app.js, que tem a lista).
  // A peça original (cartaz, infográfico) costuma ter letra miúda: como nas
  // figuras do texto, clicar abre a imagem inteira em outra aba.
  const figura=src?`<figure class="comunicado-figura"><a href="${e(comVersao(src))}" target="_blank" rel="noopener noreferrer" title="Abrir a imagem inteira em outra aba"><img src="${e(comVersao(src))}" alt="${e(item.imagemAlt||'')}"></a></figure>`:'';
  return `<article class="comunicado-pagina${src?' com-figura':''}" data-origem="${e(item.origem||'')}" aria-labelledby="comunicado-titulo"><a class="text-btn comunicado-voltar" href="${e(voltar)}" data-route="${e(voltar)}">Voltar para a lista</a><header>${metaDe(item)}<h2 id="comunicado-titulo">${e(item.titulo)}</h2>${item.resumo?`<p class="comunicado-lead">${e(item.resumo)}</p>`:''}</header><div class="comunicado-materia">${figura}<div class="comunicado-texto">${paragrafos}</div>${renderIndicadoresNoticia(item)}</div><footer class="comunicado-rodape">${acoes?`<div class="comunicado-acoes">${acoes}</div>`:''}<div class="comunicado-rodape-grade"><section class="comunicado-ficha" aria-labelledby="comunicado-ficha-titulo"><h3 class="comunicado-ficha-titulo" id="comunicado-ficha-titulo">Ficha do comunicado</h3>${ficha}</section></div></footer></article>`;
}
// Capa: uma coluna por origem, no formato de portal de notícias — título da
// coluna na cor da origem, um destaque com o título sobre a imagem e, abaixo,
// uma lista com miniatura e título. Cada coluna mostra sempre os 4 mais
// recentes da origem (pedido do usuário em 21/09/2026: antes era o destaque
// mais outros 4, e o conjunto mudava conforme quem tinha imagem). O destaque é
// o mais recente dos 4 que tiver imagem; os outros seguem em ordem de data.
const POR_COLUNA=4;
function destaqueDaColuna({item,colecao}) {
  const destino=hashComunicado(colecao,item.id);
  return `<a class="coluna-destaque" href="${e(destino)}" data-route="${e(destino)}">${midia(item,'midia-comunicado coluna-destaque-midia')}<span class="coluna-destaque-titulo">${e(item.titulo)}</span></a>`;
}
// Também serve à lista "Mais comunicados" da página do comunicado.
export function itemDaColuna({item,colecao}) {
  const destino=hashComunicado(colecao,item.id);
  // O subtítulo abaixo do título ocupa a altura da miniatura, que sobrava vazia
  // (pedido do usuário em 21/09/2026).
  return `<li data-origem="${e(item.origem||'')}"><a class="coluna-item" href="${e(destino)}" data-route="${e(destino)}">${midia(item,'midia-comunicado coluna-miniatura')}<span class="coluna-item-texto"><span class="coluna-item-titulo">${e(item.titulo)}</span>${item.resumo?`<span class="coluna-item-resumo">${e(item.resumo)}</span>`:''}</span></a></li>`;
}
export function colunasOrigem(lista) {
  return Object.entries(ORIGENS).map(([origem,rotulo])=> {
    const itens=lista.filter(({item})=>item.origem===origem).slice(0,POR_COLUNA);
    const destaque=itens.find(({item})=>safeURL(item.imagem))||itens[0];
    const demais=itens.filter(c=>c!==destaque);
    const mais=`#central/comunicacao-${origem}`;
    const corpo=destaque
      ?`${destaqueDaColuna(destaque)}${demais.length?`<ul class="coluna-lista">${demais.map(itemDaColuna).join('')}</ul>`:''}<a class="coluna-mais" href="${mais}" data-route="${mais}">Veja mais em ${rotulo}</a>`
      :`<p class="coluna-vazia">Nenhum comunicado de ${rotulo} por enquanto.</p>`;
    return `<section class="coluna-origem ${origem}" data-origem="${origem}" aria-labelledby="coluna-${origem}"><h3 class="coluna-titulo" id="coluna-${origem}">${rotulo}</h3>${corpo}</section>`;
  }
  ).join('');
}
function ultimaAtualizacao(items) {
  const datas=items.map(item=>item.dataCaptura||item.dataPublicacao).filter(Boolean).sort();
  return datas.length?datas[datas.length-1]:null;
}
function formatUltimaAtualizacao(value) {
  if(!value)return 'Não disponível';
  if(!value.includes('T'))return dateLabel(value);
  const data=new Date(value);
  if(Number.isNaN(data.getTime()))return dateLabel(value.slice(0,10));
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
}
export function ultimaAtualizacaoLabel(items) {
  return formatUltimaAtualizacao(ultimaAtualizacao(items));
}
