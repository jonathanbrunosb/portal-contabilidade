import { escapeHTML as e,icon,badge,dateLabel,showDialog,detailGrid,safeURL,comVersao,normalize } from './ui.js?v=20260920-36';
const colors= {
  'ANEEL':'','CPC / IFRS':'purple','DELIBERAÇÃO DO GRUPO':'teal','COMUNICADO INTERNO':'orange','Grupo':'teal','Interno':'orange'
}
;
export function articleCard(item,collection) {
  const media=item.imagem?itemMedia(item,'noticia-media'):'';
  return `<article class="content-card">${media}<div class="card-meta"><span class="tag ${colors[item.categoria]||''}">${e(item.categoria)}</span><time class="card-date" datetime="${e(item.dataPublicacao)}">${e(dateLabel(item.dataPublicacao))}</time></div><h3>${e(item.titulo)}</h3><p>${e(item.resumo)}</p><div class="card-bottom">${badge('Impacto '+item.nivelImpacto.toLowerCase())}<button class="text-btn" data-record="${e(collection)}:${e(item.id)}">Ler ${collection==='newsletter'?'orientação':'notícia'}</button></div></article>`;
}
// Shared by Newsletter and Notícias cards: renders the image with a fallback
// icon already in the markup (toggled by CSS on the img's error — see
// wireNoticiaImages() in app.js), and, when the record references a
// registered sistema, the same status+access overlay used by Sistemas da
// Área (.system-media-badge/.system-media-access). The button reuses
// data-system, so the click goes through the existing openAccess() handler
// instead of duplicating the sistema's link/status here.
function itemMedia(item,wrapClass) {
  const src=item.imagem?safeURL(item.imagem):null;
  if(!src)return `<div class="${wrapClass} noticia-media-fallback">${icon('news')}</div>`;
  const overlay=item.statusSistema?`${badge(item.statusSistema,'system-media-badge')}${item.sistemaId?`<button class="primary-btn system-media-access" data-system="${e(item.sistemaId)}">Acessar sistema${icon('external').replace('class="icon"','class="icon ext"')}</button>`:''}`:'';
  return `<div class="${wrapClass}"><img src="${e(comVersao(src))}" alt="${e(item.imagemAlt||'')}" loading="lazy">${overlay}<span class="noticia-media-icon">${icon('news')}</span></div>`;
}
// Featured/secondary hero layout, same as Notícias & Impactos: the most
// recent publicação leads, full-width media and title, everything else
// stacks in an equal-size column at the right — .noticias-grid/.noticia-
// destaque/.noticias-secundarias are already generic grid/card components,
// not specific to the noticias collection, so nothing new is added here.
function newsletterDestaque(item) {
  const media=itemMedia(item,'noticia-destaque-media');
  return `<article class="content-card noticia-destaque">${media}<div class="noticia-destaque-body"><div class="card-meta"><span class="tag ${colors[item.categoria]||''}">${e(item.categoria)}</span><time class="card-date" datetime="${e(item.dataPublicacao)}">${e(dateLabel(item.dataPublicacao))}</time></div><h2>${e(item.titulo)}</h2><p>${e(item.resumo)}</p><div class="noticia-destaque-footer">${badge('Impacto '+item.nivelImpacto.toLowerCase())}<button class="text-btn" data-record="newsletter:${e(item.id)}">Ler orientação completa</button></div></div></article>`;
}
export function renderNewsletter(items) {
  const news=items.filter(i=>i.status==='Publicado').sort((a,b)=>b.dataPublicacao.localeCompare(a.dataPublicacao));
  const [destaqueItem,...secundarias]=news;
  const secundariasHTML=secundarias.length?`<div class="noticias-secundarias">${secundarias.map(item=>articleCard(item,'newsletter')).join('')}</div>`:'';
  const grid=destaqueItem?`<div class="noticias-grid${secundariasHTML?'':' no-secundarias'}">${newsletterDestaque(destaqueItem)}${secundariasHTML}</div>`:'<p class="empty-state">Nenhuma orientação publicada.</p>';
  return grid;
}
export function showArticle(item) {
  const link=safeURL(item.link),doc=safeURL(item.documento);
  const governanca=item.aprovadoPor?detailGrid({'Aprovado por':item.aprovadoPor,'Publicado em':dateLabel(item.dataAprovacao)}):'';
  showDialog(item.titulo,item.categoria,`${badge('Impacto '+item.nivelImpacto.toLowerCase())}<p>${e(item.resumo)}</p>${item.conteudoCompleto.split('\n').map(p=>`<p>${e(p)}</p>`).join('')}${detailGrid({'Publicação':dateLabel(item.dataPublicacao),'Vigência':dateLabel(item.dataVigencia),'Fonte':item.fonte,'Responsável':item.responsavel,'Área responsável':item.areaResponsavel,'Empresas impactadas':item.empresasImpactadas,'Status':item.status})}${governanca}${link?`<a class="primary-btn" href="${e(link)}" target="_blank" rel="noopener noreferrer">Consultar fonte${icon('external').replace('class="icon"','class="icon ext"')}</a>`:''} ${doc?`<a class="primary-btn" href="${e(doc)}" download>Baixar documento</a>`:''}`);
}

// ===== Notícias & Impactos =====
// Fixed initial chips per spec, extensible: any other categoria present in
// the active data set gets its own chip appended automatically, so adding a
// new categoria (Regulatório, Auditoria, Tecnologia…) needs no code change.
const NOTICIA_CATEGORIAS_BASE=['ANEEL','CPC / IFRS','Grupo','Interno'];
const NOTICIA_IMPACT_COLORS= {
  baixo:'green',moderado:'blue',relevante:'yellow',alto:'orange',critico:'red'
}
;
export const formatNewsDate=dateLabel;
// Dedicated mapping — kept separate from the shared, regex-based statusColor()
// so this 5-tier impact scale never affects status-badge coloring elsewhere.
export function getImpactClass(impacto) {
  return NOTICIA_IMPACT_COLORS[normalize(impacto||'')]||'blue';
}
function noticiaImpacto(item) {
  return item.impacto||item.nivelImpacto||'Moderado';
}
// Only active, published records are eligible for the public Notícias &
// Impactos grid; ordering by publication date keeps the most recent first
// before destaque/category filtering is applied.
export function loadNoticias(items) {
  return (items||[]).filter(item=>item.status==='Publicado'&&item.ativo!==false)
    .slice()
    .sort((a,b)=>(b.dataPublicacao||'').localeCompare(a.dataPublicacao||''));
}
export function noticiaCategorias(items) {
  const categorias=[...NOTICIA_CATEGORIAS_BASE];
  items.forEach(item=> {
    if(item.categoria&&!categorias.includes(item.categoria))categorias.push(item.categoria);
  }
  );
  return categorias;
}
function ultimaAtualizacaoNoticias(items) {
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
  return formatUltimaAtualizacao(ultimaAtualizacaoNoticias(items));
}
// Search covers every field the spec lists — título, resumo, categoria, fonte,
// palavras-chave, empresas impactadas, área responsável e classificação do
// impacto — by normalizing them all into one haystack per record.
export function filterNoticias(items,categoria,query) {
  const q=normalize(query||'').trim();
  return items.filter(item=> {
    if(categoria&&item.categoria!==categoria)return false;
    if(!q)return true;
    const haystack=normalize([item.titulo,item.resumo,item.categoria,item.fonte,(item.palavrasChave||[]).join(' '),(item.empresasImpactadas||[]).join(' '),item.areaResponsavel,noticiaImpacto(item)].filter(Boolean).join(' '));
    return haystack.includes(q);
  }
  );
}
export function renderIndicadoresNoticia(item) {
  const indicadores=Array.isArray(item.indicadores)?item.indicadores.filter(ind=>ind&&(ind.label||ind.valor)):[];
  if(!indicadores.length)return '';
  return `<div class="noticia-indicadores">${indicadores.map(ind=>`<div class="noticia-indicador"><strong>${e(ind.valor)}</strong><span>${e(ind.label)}</span></div>`).join('')}</div>`;
}
export function renderNoticiaDestaque(item) {
  if(!item)return '<p class="empty-state">Nenhuma notícia corresponde aos filtros informados.</p>';
  const impacto=noticiaImpacto(item);
  const fonteURL=safeURL(item.urlFonte||item.link);
  return `<article class="content-card noticia-destaque" data-noticia-id="${e(item.id)}">${itemMedia(item,'noticia-destaque-media')}<div class="noticia-destaque-body"><div class="card-meta"><span class="tag ${colors[item.categoria]||''}">${e(item.categoria)}</span><time class="card-date" datetime="${e(item.dataPublicacao)}">${e(formatNewsDate(item.dataPublicacao))}</time></div><h2>${e(item.titulo)}</h2><p>${e(item.resumo)}</p><span class="badge ${getImpactClass(impacto)}">Impacto potencial: ${e(impacto)}</span>${renderIndicadoresNoticia(item)}<div class="noticia-destaque-footer"><span class="noticia-fonte">Fonte: ${e(item.fonte||'Não informada')}</span>${fonteURL?`<a class="primary-btn noticia-fonte-link" href="${e(fonteURL)}" target="_blank" rel="noopener noreferrer">Ler na fonte oficial${icon('external').replace('class="icon"','class="icon ext"')}</a>`:''}</div></div></article>`;
}
function renderNoticiaCard(item) {
  const impacto=noticiaImpacto(item);
  const demonstrativo=item.demonstrativo?'<span class="noticia-demo-flag">Conteúdo demonstrativo</span>':'';
  return `<article class="content-card noticia-card" data-noticia-id="${e(item.id)}">${itemMedia(item,'noticia-media')}<div class="card-meta"><span class="tag ${colors[item.categoria]||''}">${e(item.categoria)}</span><time class="card-date" datetime="${e(item.dataPublicacao)}">${e(formatNewsDate(item.dataPublicacao))}</time></div><h3>${e(item.titulo)}</h3><p>${e(item.resumo)}</p>${demonstrativo}<div class="card-bottom"><span class="badge ${getImpactClass(impacto)}">${e('Impacto '+impacto.toLowerCase())}</span><button class="text-btn" data-noticia-detalhe="${e(item.id)}">Ler notícia</button></div></article>`;
}
export function renderNoticiasSecundarias(items) {
  if(!items.length)return '';
  return `<div class="noticias-secundarias">${items.map(renderNoticiaCard).join('')}</div>`;
}
// Hero grid shows at most 3 secondary cards, matching the destaque's own
// height instead of letting a long, unfiltered list dwarf it and leave the
// destaque column mostly blank underneath. A category/busca in effect means
// the person is intentionally narrowing results, so completeness matters
// more than the fixed-height hero layout — those views show every match.
const NOTICIAS_SECUNDARIAS_LIMITE=3;
// Orchestrator: applies category + search filters, promotes whichever match
// is flagged destaque (or the most recent match otherwise) into the hero
// slot, and renders the rest as secondary cards — never leaving the area
// blank, per spec section 6.
export function renderNoticias(items,categoria,query) {
  const filtered=filterNoticias(items,categoria,query);
  if(!filtered.length)return '<p class="empty-state">Nenhuma notícia corresponde aos filtros informados.</p>';
  const destaqueItem=filtered.find(item=>item.destaque)||filtered[0];
  let secundarias=filtered.filter(item=>item!==destaqueItem);
  if(!categoria&&!query)secundarias=secundarias.slice(0,NOTICIAS_SECUNDARIAS_LIMITE);
  const secundariasHTML=renderNoticiasSecundarias(secundarias);
  return `<div class="noticias-grid${secundariasHTML?'':' no-secundarias'}">${renderNoticiaDestaque(destaqueItem)}${secundariasHTML}</div>`;
}
