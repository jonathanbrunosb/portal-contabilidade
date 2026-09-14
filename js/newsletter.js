import { escapeHTML as e,icon,badge,dateLabel,showDialog,detailGrid,safeURL } from './ui.js';
const colors= {
  'ANEEL':'','CPC / IFRS':'purple','DELIBERAÇÃO DO GRUPO':'teal','COMUNICADO INTERNO':'orange'
}
;
export function articleCard(item,collection) {
  return `<article class="content-card"><div class="card-meta"><span class="tag ${colors[item.categoria]||''}">${e(item.categoria)}</span><time class="card-date" datetime="${e(item.dataPublicacao)}">${e(dateLabel(item.dataPublicacao))}</time></div><h3>${e(item.titulo)}</h3><p>${e(item.resumo)}</p><div class="card-bottom">${badge('Impacto '+item.nivelImpacto.toLowerCase())}<button class="text-btn" data-record="${e(collection)}:${e(item.id)}">Ler ${collection==='newsletter'?'orientação':'notícia'} →</button></div></article>`;
}
export function renderNewsletter(items) {
  const news=items.filter(i=>i.status==='Publicado').sort((a,b)=>b.dataPublicacao.localeCompare(a.dataPublicacao));
  const ticker=news.map(item=>`<span><b>${e(item.categoria)}:</b> ${e(item.titulo)}</span>`).join('');
  return `<div class="radar"><span class="radar-label">${icon('radar')} RADAR</span><div class="radar-window"><div class="radar-track"><div style="display:flex">${ticker}</div><div style="display:flex" aria-hidden="true">${ticker}</div></div></div><button id="pause-radar" aria-label="Pausar radar" aria-pressed="false" title="Pausar radar">Ⅱ</button></div><div class="card-grid">${news.map(item=>articleCard(item,'newsletter')).join('')||'<p class="empty-state">Nenhuma orientação publicada.</p>'}</div><div class="content-footer"><span>Informações de exemplo para validação do portal</span><span>${news.length} publicações</span></div>`;
}
export function showArticle(item) {
  const link=safeURL(item.link),doc=safeURL(item.documento);
  showDialog(item.titulo,item.categoria,`${badge('Impacto '+item.nivelImpacto.toLowerCase())}<p>${e(item.resumo)}</p>${item.conteudoCompleto.split('\n').map(p=>`<p>${e(p)}</p>`).join('')}${detailGrid({'Publicação':dateLabel(item.dataPublicacao),'Vigência':dateLabel(item.dataVigencia),'Fonte':item.fonte,'Responsável':item.responsavel,'Área responsável':item.areaResponsavel,'Empresas impactadas':item.empresasImpactadas,'Status':item.status})}${link?`<a class="primary-btn" href="${e(link)}" target="_blank" rel="noopener noreferrer">Consultar fonte ↗</a>`:''} ${doc?`<a class="primary-btn" href="${e(doc)}" download>Baixar documento</a>`:''}`);
}
