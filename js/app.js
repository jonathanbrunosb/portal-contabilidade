import { loadData,isLiveDataSource,apiWrite,apiUploadPhoto,apiUploadContentImage,getAdminToken,setAdminToken,hasLocalTeams,saveLocalTeams,clearLocalTeams,hasLocalAutomacoes,saveLocalAutomacoes,clearLocalAutomacoes } from './data-service.js?v=20260923-1';
import { identifyUser,renderUser,hasAccess,getStoredUserId,setStoredUserId } from './auth.js?v=20260918-1';
import { initializeNavigation,bindTabs,selectTab } from './navigation.js';
import { renderNewsletter,showArticle,loadNoticias,renderNoticiasHeader,renderNoticiaFiltros,renderNoticias } from './newsletter.js?v=20260918-1';
import { renderTeamStructure } from './teams.js?v=20260918-1';
import { escapeHTML as e,normalize,icon,hydrateIcons,badge,dateLabel,showDialog,initializeDialog,detailGrid,safeURL,notify } from './ui.js';
import { track,setAnalyticsEnabled,summary,exportAnalytics,clearAnalytics } from './analytics.js';
import { readZip,validatePackage,findExisting,toPortalItem,portalItemId } from './ai-studio-import.js?v=20260923-1';
let data,currentTab='newsletter',currentAdminTab='equipes',currentUser,currentMenu=[];
const $=selector=>document.querySelector(selector);
// Capability required to see each menu target / page section / searchable collection.
const TARGET_ACCESS= {
  central:'conteudo',equipes:'time',processos:'gerencial',painel:'gerencial',agenda:'gerencial',editorial:'gerencial',administracao:'administracao'
}
;
const CENTRAL_TABS=['newsletter','noticias','sistemas','documentos','automacoes'];
const SECTION_ACCESS= {
  central:'conteudo',painel:'gerencial',editorial:'gerencial'
}
;
const EDITORIAL_COLLECTIONS=['newsletter','noticias'];
const EDITORIAL_CATEGORIAS= {
  newsletter:'Newsletter',noticias:'Notícia'
}
;
const COLLECTION_ACCESS= {
  newsletter:'conteudo',noticias:'conteudo',sistemas:'conteudo',documentos:'conteudo',equipes:'time',usuarios:'time',processos:'gerencial',agenda:'gerencial',entregas:'gerencial'
}
;
function applyAccess(user) {
  Object.entries(SECTION_ACCESS).forEach(([id,capability])=> {
    document.getElementById(id).hidden=!hasAccess(user,capability);
  }
  );
  $('.home-columns').classList.toggle('single-column',!hasAccess(user,'time'));
  $('#notifications').hidden=!hasAccess(user,'gerencial');
}
function openAccess(item) {
  if(item.target) {
    track('system_access',{sistema:item.nome,configurado:true});
    navigate(currentMenu.find(menuItem=>menuItem.target===item.target&&(!item.tab||menuItem.tab===item.tab))||item);
    return;
  }
  const url=safeURL(item.link);
  track('system_access',{sistema:item.nome,configurado:!!url});
  if(url) {
    window.open(url,'_blank','noopener,noreferrer');
    return;
  }
  showDialog(item.nome,'ACESSO CORPORATIVO',`<p>${e(item.descricao||'Acesso utilizado pela Gerência de Contabilidade.')}</p><p>O endereço deste acesso ainda não foi cadastrado. Solicite o link ao responsável da área.</p>${detailGrid({'Status':'Aguardando configuração','Responsável':item.responsavel||'Administração do portal'})}`);
}
// A system with a corporate image gets the status and the access button laid
// over the image itself (object-fit:cover keeps it from distorting); a
// system without one keeps the original icon + badge/button-below layout —
// that fallback must keep working since not every registered system has art.
function systemCard(item) {
  if(!item.imagem)return `<article class="content-card"><div class="system-symbol">${icon(item.icon)}</div><h3>${e(item.nome)}</h3><p>${e(item.descricao)}</p><div class="card-bottom">${badge(item.status)}<button class="text-btn" data-system="${e(item.id)}">Acessar sistema ↗</button></div></article>`;
  return `<article class="content-card"><div class="system-media"><img class="system-image" src="${e(safeURL(item.imagem)||'')}" alt="Ilustração do sistema ${e(item.nome)}" loading="lazy">${badge(item.status,'system-media-badge')}<button class="primary-btn system-media-access" data-system="${e(item.id)}">Acessar sistema ↗</button></div><h3>${e(item.nome)}</h3><p>${e(item.descricao)}</p></article>`;
}
function documentCard(item) {
  return `<article class="content-card doc-card"><div class="card-meta"><span class="system-symbol">${icon('file')}</span><span class="muted">${e(item.formato)}</span></div><h3>${e(item.categoria)}</h3><p>${e(item.titulo)}</p><div class="doc-actions"><button class="text-btn" data-record="documentos:${e(item.id)}">Abrir →</button><a class="text-btn" href="${e(safeURL(item.arquivo)||'')}" download>Baixar ↓</a></div></article>`;
}
function documentResults() {
  const query=normalize($('#doc-search')?.value),category=$('#doc-filter')?.value;
  const records=data.documentos.filter(item=>(!category||item.categoria===category)&&normalize(JSON.stringify(item)).includes(query));
  $('#document-results').innerHTML=records.map(documentCard).join('')||'<p class="empty-state">Nenhum documento encontrado. Tente outra categoria ou termo.</p>';
  $('#doc-count').textContent=`${records.length} documentos de exemplo` ;
}
// Images render with a static fallback icon already in the markup (see
// itemMedia() in newsletter.js); an onerror listener just toggles which
// one is visible, keeping error handling out of inline HTML attributes.
function wireNoticiaImages(root) {
  root.querySelectorAll('.noticia-media img,.noticia-destaque-media img').forEach(img=>img.addEventListener('error',()=> {
    img.closest('.noticia-media,.noticia-destaque-media')?.classList.add('noticia-media-fallback');
  }
  , {
    once:true
  }
  ));
}
function renderNoticiasResults() {
  const query=$('#noticia-search')?.value||'';
  const categoria=$('#content-view .noticia-chip[aria-selected="true"]')?.dataset.categoria||'';
  const resultados=$('#noticias-resultados');
  resultados.innerHTML=renderNoticias(loadNoticias(data.noticias),categoria,query);
  wireNoticiaImages(resultados);
}
// Global search results link into the tab via showRecord('noticias', id):
// instead of opening the read-more modal (data-noticia-detalhe does that),
// this opens/keeps the Notícias & Impactos tab, scrolls to the matching
// card and applies a temporary highlight, per spec section 16.
function focusNoticia(id) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if($('#home-view').hidden) {
    $('#home-view').hidden=false;
    $('#equipes').hidden=true;
    history.pushState(null,'','#central');
  }
  renderContent('noticias');
  requestAnimationFrame(()=>$('#central').scrollIntoView( {
    behavior:reduced?'auto':'smooth',block:'start'
  }
  ));
  setTimeout(()=> {
    const card=document.querySelector(`[data-noticia-id="${CSS.escape(id)}"]`);
    if(!card)return;
    card.scrollIntoView( {
      behavior:reduced?'auto':'smooth',block:'center'
    }
    );
    card.classList.add('noticia-highlight');
    setTimeout(()=>card.classList.remove('noticia-highlight'),2200);
  }
  ,320);
}
const AUTOMATION_STATUSES=['Produção','Produção e Melhorias','Desenvolvimento e Testes'];
const AUTOMATION_FAMILIAS= {
  sap:'SAP / VBA',python:'Script Python',web:'RPA Web'
}
;
function automationTagClass(familia) {
  return familia==='python'?'tag purple':familia==='web'?'tag teal':'tag';
}
// Development status ("is it functional?") and link availability ("is there
// somewhere to click?") are independent — a card can be em Produção with the
// link still Acesso em configuração. The badge color only ever reflects the
// former; the access affordance below the card is the only thing that reads
// the URL, so the two never get mixed into one signal.
function automationStatusColor(status) {
  return /desenvolvimento|teste/i.test(status)?'yellow':'green';
}
function automationCard(item) {
  const url=safeURL(item.url);
  const access=url?`<a class="primary-btn" href="${e(url)}" target="_blank" rel="noopener noreferrer">Acessar automação ↗</a>`:'<p class="access-pending">Acesso em configuração</p>';
  return `<article class="content-card" data-familia="${e(item.familia)}"><div class="card-meta"><span class="${automationTagClass(item.familia)}">${e(item.tipo)}</span></div><h3>${e(item.titulo)}</h3><p>${e(item.descricao)}</p><div class="card-bottom"><span class="badge ${automationStatusColor(item.statusDesenvolvimento)}">${e(item.statusDesenvolvimento)}</span><button class="text-btn" data-record="automacoes:${e(item.id)}">Ver detalhes →</button></div>${access}</article>`;
}
function activeAutomations() {
  return data.automacoes.filter(item=>item.ativo!==false);
}
function renderAutomationsOverview() {
  const ativos=activeAutomations();
  const count=familia=>ativos.filter(item=>item.familia===familia).length;
  $('#aut-metrics').innerHTML=`<article class="kpi"><div class="kpi-top"><span>Automações catalogadas</span>${icon('flow')}</div><div class="kpi-value">${ativos.length}</div></article><article class="kpi"><div class="kpi-top"><span>SAP / VBA</span>${icon('grid')}</div><div class="kpi-value">${count('sap')}</div></article><article class="kpi"><div class="kpi-top"><span>Script Python</span>${icon('file')}</div><div class="kpi-value">${count('python')}</div></article><article class="kpi"><div class="kpi-top"><span>RPA Web</span>${icon('globe')}</div><div class="kpi-value">${count('web')}</div></article>`;
}
function renderAutomationsResults() {
  const words=normalize($('#aut-search').value).trim().split(/\s+/).filter(Boolean);
  const familia=$('#aut-type').value,status=$('#aut-status').value;
  const visible=activeAutomations()
    .filter(item=>(!familia||item.familia===familia)&&(!status||item.statusDesenvolvimento===status))
    .filter(item=>words.every(word=>normalize(`${item.titulo} ${item.descricao} ${item.tipo}`).includes(word)))
    .sort((a,b)=>(a.ordem??0)-(b.ordem??0));
  $('#aut-cards').innerHTML=visible.map(automationCard).join('')||'<p class="empty-state">Nenhuma automação corresponde aos filtros selecionados.</p>';
  $('#aut-count').innerHTML=`<strong>${visible.length}</strong> ${visible.length===1?'automação encontrada':'automações encontradas'}`;
}
function renderContent(tab) {
  currentTab=tab;
  track('tab_view',{tab});
  selectTab('.tabs',$(`#tab-${tab}`));
  $('#content-view').setAttribute('aria-labelledby',`tab-${tab}`);
  activateMenu(currentMenu.find(item=>item.tab===tab)||(CENTRAL_TABS.includes(tab)?currentMenu.find(item=>item.target==='central'):null));
  if(tab==='newsletter') {
    $('#content-view').innerHTML=renderNewsletter(data.newsletter);
    wireNoticiaImages($('#content-view'));
  }
  if(tab==='noticias') {
    const ativos=loadNoticias(data.noticias);
    $('#content-view').innerHTML=`${renderNoticiasHeader(ativos)}${renderNoticiaFiltros(ativos)}<div class="filter-bar noticias-searchbar"><input type="search" id="noticia-search" aria-label="Buscar notícia" placeholder="Buscar notícia..."></div><div id="noticias-resultados"></div><div class="content-footer">Conteúdo curado pela Gerência de Contabilidade — itens sinalizados como demonstrativos são apenas ilustrativos.</div>`;
    renderNoticiasResults();
    $('#noticia-search').oninput=renderNoticiasResults;
    $('#content-view').querySelectorAll('.noticia-chip').forEach(chip=>chip.onclick=()=> {
      $('#content-view').querySelectorAll('.noticia-chip').forEach(other=>other.setAttribute('aria-selected',String(other===chip)));
      renderNoticiasResults();
    }
    );
  }
  if(tab==='sistemas')$('#content-view').innerHTML=`<div class="card-grid systems-grid">${data.sistemas.map(systemCard).join('')}</div><div class="content-footer">Cadastre os endereços internos para habilitar os acessos.</div>`;
  if(tab==='documentos') {
    $('#content-view').innerHTML=`<div class="filter-bar"><input type="search" id="doc-search" aria-label="Pesquisar documentos" placeholder="Pesquisar documentos…"><select id="doc-filter" aria-label="Categoria de documento"><option value="">Todas as categorias</option>${data.documentos.map(i=>`<option>${e(i.categoria)}</option>`).join('')}</select></div><div id="document-results" class="card-grid"></div><div class="content-footer" id="doc-count" aria-live="polite"></div>`;
    documentResults();
    $('#doc-search').oninput=documentResults;
    $('#doc-filter').onchange=documentResults;
  }
  if(tab==='automacoes') {
    $('#content-view').innerHTML=`<div class="kpi-grid" id="aut-metrics"></div><div class="filter-bar automations-filter"><input type="search" id="aut-search" aria-label="Pesquisar automação" placeholder="Título, descrição, tecnologia ou transação SAP…"><select id="aut-type" aria-label="Tecnologia"><option value="">Todas as tecnologias</option>${Object.entries(AUTOMATION_FAMILIAS).map(([value,label])=>`<option value="${e(value)}">${e(label)}</option>`).join('')}</select><select id="aut-status" aria-label="Status de desenvolvimento"><option value="">Todos os status</option>${AUTOMATION_STATUSES.map(s=>`<option>${e(s)}</option>`).join('')}</select><button class="secondary-btn" id="aut-clear" type="button">Limpar filtros</button></div><div class="content-footer"><span id="aut-count" role="status" aria-live="polite"></span><span>As soluções estão funcionais conforme o status informado; os acessos pelo portal podem estar em configuração.</span></div><div class="card-grid automations-grid" id="aut-cards"></div>`;
    renderAutomationsOverview();
    renderAutomationsResults();
    $('#aut-search').oninput=renderAutomationsResults;
    $('#aut-type').onchange=renderAutomationsResults;
    $('#aut-status').onchange=renderAutomationsResults;
    $('#aut-clear').onclick=()=> {
      $('#aut-search').value='';
      $('#aut-type').value='';
      $('#aut-status').value='';
      renderAutomationsResults();
      $('#aut-search').focus();
    }
    ;
  }
  const pause=$('#pause-radar');
  if(pause)pause.onclick=()=> {
    const paused=pause.closest('.radar').classList.toggle('paused');
    pause.setAttribute('aria-pressed',String(paused));
    pause.setAttribute('aria-label',paused?'Retomar radar':'Pausar radar');
    pause.textContent=paused?'▶':'Ⅱ';
  }
  ;
}
function activateMenu(item) {
  const index=currentMenu.indexOf(item);
  document.querySelectorAll('#navigation .nav-link').forEach(link=>link.classList.toggle('active',Number(link.dataset.menuIndex)===index));
}
// A menu item with a `view` opens as its own dedicated screen (#home-view
// hidden entirely) instead of scrolling to a panel inside it — Estrutura das
// Equipes and Administração both work this way, so neither ever shows mixed
// in with Central de Conteúdo or the rest of the home page.
function navigate(item,updateHistory=true) {
  if(!item)return;
  const dedicatedView=item.view;
  $('#home-view').hidden=Boolean(dedicatedView);
  $('#equipes').hidden=dedicatedView!=='equipes';
  $('#administracao').hidden=dedicatedView!=='administracao';
  activateMenu(item);
  if(dedicatedView==='equipes') {
    renderTeamStructure(data.equipes);
    track('team_structure_view');
  }
  else if(dedicatedView==='administracao') {
    renderAdmin();
    track('admin_view');
  }
  else if(item.tab)renderContent(item.tab);
  if(updateHistory)history.pushState(null,'',`#${item.target}`);
  requestAnimationFrame(()=> {
    const target=dedicatedView?$(`#${dedicatedView}`):$(`#${item.target}`);
    target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    $('#main').focus({preventScroll:true});
  });
}
// Headcount is derived from the registered roster for administration views.
function teamHeadcount(team) {
  if(team.id==='gerencia')return data.equipes.reduce((sum,t)=>sum+t.responsaveis.length,0);
  return team.responsaveis.length;
}
function teamMemberId(areaId,name,index) {
  const slug=normalize(name).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return `colaborador-${slug||`${areaId}-${index+1}`}`;
}
// Editorial dates (competência, atualização da base) follow the local
// dataset, independent of the device clock. The top page-context date is the
// one exception: it always shows today, read straight from the device clock.
function renderPeriod() {
  const config = data.config;
  const reference = new Date(config.dataReferencia + 'T12:00:00');
  const period = new Date(config.competencia + '-01T12:00:00');
  const month = period.toLocaleDateString('pt-BR', {month: 'long'});
  $('.context-date').textContent = new Date().toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'});
  $('.edition').textContent = `${month.toUpperCase()} / ${period.getFullYear()}`;
  $('.period').innerHTML = `<span class="live-dot"></span> Competência: ${e(month)} ${period.getFullYear()}`;
  $('#entregas .section-kicker').textContent = config.semanaLabel;
  $('.footer span:last-child').textContent = `${config.demonstracao ? 'Dados ilustrativos' : 'Base local'} · Atualização da base: ${reference.toLocaleDateString('pt-BR')}`;
}

function renderDashboard() {
  const config=data.config;
  $('#hero-metrics').innerHTML=config.resumo.map(m=>`<div class="hero-metric"><strong>${e(m.valor)}</strong><small>${e(m.label)}</small></div>`).join('');
  $('#kpis').innerHTML=config.kpis.map(k=>`<article class="kpi"><div class="kpi-top"><span>${e(k.nome)}</span>${icon(k.icon)}</div><div class="kpi-value">${e(k.valor)}${badge(k.status)}</div><div class="progress ${e(k.cor)}" role="progressbar" aria-label="${e(k.metrica)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Number(k.progresso)}"><span style="width:${Math.max(0,Math.min(100,Number(k.progresso)))}%"></span></div><p class="kpi-foot">${e(k.metrica)}</p></article>`).join('');
  $('#process-table').innerHTML=data.processos.map(p=>`<tr><td><button class="text-btn" data-record="processos:${e(p.id)}">${e(p.nome)}</button></td><td>${e(p.responsavel)}</td><td>${e(p.prazo)}</td><td>${badge(p.status)}</td></tr>`).join('');
  $('#agenda-list').innerHTML=data.agenda.slice().sort((a,b)=>a.data.localeCompare(b.data)).map(a=>`<button class="agenda-event" data-record="agenda:${e(a.id)}"><span class="event-date">${e(a.data.slice(-2))}<small>${e(new Date(a.data+'T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase())}</small></span><span class="event-copy"><strong>${e(a.nome)}</strong><small>${e(a.horario)}· ${e(a.responsavel)}</small></span></button>`).join('');
  $('#deliveries').innerHTML=data.entregas.map(d=>`<button class="delivery" data-record="entregas:${e(d.id)}"><strong>${e(d.nome)}</strong><small>${e(d.responsavel)}</small><span class="delivery-bottom"><span>${e(dateLabel(d.prazo))}</span>${badge(d.status)}</span></button>`).join('');
}
function editorialActions(collection,item) {
  if(item.status==='Rascunho')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:revisao">Enviar para revisão →</button>`;
  if(item.status==='Em revisão')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:publicar">Aprovar e publicar ✓</button><button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:recusar">Recusar ✕</button>`;
  if(item.status==='Recusado')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:reabrir">Reabrir como rascunho ↺</button>`;
  return '';
}
function editorialFooter(item) {
  const origem=item.aiStudio?` · AI Studio v${e(item.aiStudio.versionNumber)}${item.aiStudio.substitui?.length?' · substitui publicação anterior':''}`:'';
  if(item.status==='Em revisão'&&origem)return `Responsável: ${e(item.responsavel)}${origem}`;
  if(item.status==='Publicado')return `Aprovado por ${e(item.aprovadoPor||'—')} em ${e(dateLabel(item.dataAprovacao))}`;
  if(item.status==='Recusado')return `Motivo: ${e(item.motivoRecusa||'Não informado')}`;
  return `Responsável: ${e(item.responsavel)}`;
}
function editorialCard(collection,item) {
  return `<article class="content-card"><div class="card-meta"><span class="tag">${e(EDITORIAL_CATEGORIAS[collection])}</span>${badge(item.status)}</div><h3>${e(item.titulo)}</h3><p>${editorialFooter(item)}</p><div class="card-bottom">${editorialActions(collection,item)}</div></article>`;
}
function renderEditorial() {
  const live=isLiveDataSource();
  $('#new-draft').disabled=!live;
  $('#new-draft').title=live?'':'Requer o backend opcional (Fase 2) ativo — ver README, "Backend opcional".';
  const notice=live?'':'<p class="empty-state">Somente leitura: ligue o backend opcional (Fase 2) para enviar para revisão, aprovar, recusar ou criar rascunhos por aqui — ver README, "Backend opcional".</p>';
  const cards=EDITORIAL_COLLECTIONS.flatMap(collection=>data[collection].map(item=>editorialCard(collection,item)));
  $('#editorial-view').innerHTML=`${notice}<div class="card-grid">${cards.join('')||'<p class="empty-state">Nenhum conteúdo editorial cadastrado.</p>'}</div>`;
}
async function handleEditorialAction(collection,id,action) {
  const item=data[collection]?.find(i=>i.id===id);
  if(!item)return;
  let body;
  if(action==='revisao')body= {
    status:'Em revisão'
  }
  ;
  if(action==='publicar') {
    if(!confirm(`Aprovar e publicar "${item.titulo}" como ${currentUser.nome}?`))return;
    body= {
      status:'Publicado',aprovadoPor:currentUser.nome
    }
    ;
  }
  if(action==='recusar') {
    const motivo=prompt('Motivo da recusa:');
    if(!motivo)return;
    body= {
      status:'Recusado',motivoRecusa:motivo
    }
    ;
  }
  if(action==='reabrir')body= {
    status:'Rascunho'
  }
  ;
  if(!body)return;
  try {
    const updated=await apiWrite(collection, {
      id,method:'PUT',body,autor:currentUser.nome
    }
    );
    data[collection][data[collection].findIndex(i=>i.id===id)]=updated;
    // Substituição controlada: a versão anterior do AI Studio só sai do ar quando a nova é publicada.
    if(action==='publicar'&&Array.isArray(updated.aiStudio?.substitui)) {
      for(const oldId of updated.aiStudio.substitui) {
        const index=data[collection].findIndex(i=>i.id===oldId);
        if(index===-1||data[collection][index].status==='Substituído')continue;
        data[collection][index]=await apiWrite(collection,{id:oldId,method:'PUT',body:{status:'Substituído'},autor:currentUser.nome});
      }
    }
    renderEditorial();
    if(currentTab===collection)renderContent(collection);
    notify('Conteúdo editorial atualizado.');
  }
  catch(error) {
    notify(error.message);
  }
}
function openNewDraft() {
  if(!isLiveDataSource()) {
    notify('Requer o backend opcional (Fase 2) ativo — ver README, "Backend opcional".');
    return;
  }
  const categorias=data.config.newsletterCategorias||[];
  showDialog('Novo rascunho','PAINEL EDITORIAL',`<form id="draft-form">
    <label class="field">Tipo<select id="draft-tipo"><option value="newsletter">Newsletter Contábil</option><option value="noticias">Notícias &amp; Impactos</option></select></label>
    <label class="field">Categoria<input id="draft-categoria" list="draft-categorias" required></label>
    <datalist id="draft-categorias">${categorias.map(c=>`<option value="${e(c)}">`).join('')}</datalist>
    <label class="field">Título<input id="draft-titulo" required></label>
    <label class="field">Resumo<textarea id="draft-resumo" required style="min-height:50px"></textarea></label>
    <label class="field">Conteúdo completo<textarea id="draft-conteudo" required></textarea></label>
    <label class="field">Nível de impacto<select id="draft-impacto"><option>Baixo</option><option selected>Moderado</option><option>Alto</option></select></label>
    <label class="field">Área responsável<input id="draft-area" value="${e(currentUser.area||'')}"></label>
    <label class="field">Empresas impactadas (separadas por vírgula)<input id="draft-empresas" placeholder="Empresa A (exemplo), Empresa B (exemplo)"></label>
    <button class="primary-btn" type="submit">Salvar rascunho</button>
  </form>`);
  $('#draft-form').onsubmit=async event=> {
    event.preventDefault();
    const tipo=$('#draft-tipo').value;
    const body= {
      id:`redacao-${Date.now()}`,
      categoria:$('#draft-categoria').value.trim(),
      titulo:$('#draft-titulo').value.trim(),
      resumo:$('#draft-resumo').value.trim(),
      conteudoCompleto:$('#draft-conteudo').value.trim(),
      dataPublicacao:new Date().toISOString().slice(0,10),
      dataVigencia:null,
      fonte:'Rascunho criado pelo painel editorial',
      link:null,
      documento:null,
      empresasImpactadas:$('#draft-empresas').value.split(',').map(v=>v.trim()).filter(Boolean),
      areaResponsavel:$('#draft-area').value.trim(),
      responsavel:currentUser.nome,
      nivelImpacto:$('#draft-impacto').value
    }
    ;
    try {
      const created=await apiWrite(tipo, {
        method:'POST',body,autor:currentUser.nome
      }
      );
      data[tipo].push(created);
      renderEditorial();
      $('#detail-dialog').close();
      notify('Rascunho criado.');
    }
    catch(error) {
      notify(error.message);
    }
  }
  ;
}
let adminEditState=null;
const newId=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const listFromTextarea=value=>value.split('\n').map(item=>item.trim()).filter(Boolean);
function refreshTeamsUI(message) {
  renderAdmin();
  if(!$('#equipes').hidden)renderTeamStructure(data.equipes);
  if(message)notify(message);
}
async function fileAsDataURL(file) {
  if(file.size>750000)throw new Error('Para salvar no navegador, use uma foto de até 750 KB.');
  return new Promise((resolve,reject)=> {
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(new Error('Não foi possível ler a foto selecionada.'));
    reader.readAsDataURL(file);
  });
}
function renderResponsaveisEditor() {
  $('#admin-responsaveis').innerHTML=adminEditState.responsaveis.map((p,i)=>`<fieldset class="admin-person-row" data-index="${i}"><legend>Colaborador ${i+1}</legend><img class="avatar" src="${e(safeURL(p.foto)||p.foto||'assets/users/default.svg')}" alt=""><label class="field">Nome completo<input type="text" class="admin-person-nome" value="${e(p.nome||'')}" required></label><label class="field">Cargo<input type="text" class="admin-person-cargo" value="${e(p.cargo||'')}" placeholder="Opcional"></label><label class="field">Foto ou caminho<input type="text" class="admin-person-foto-path" value="${e(p.foto||'')}" placeholder="assets/users/foto.png"></label><label class="admin-leader-choice"><input type="radio" name="admin-lider" value="${i}" ${p.id===adminEditState.liderId?'checked':''}> Liderança da equipe</label><label class="admin-file-label">Selecionar foto<input type="file" class="admin-person-foto" accept="image/*"></label><button type="button" class="danger-btn admin-remove-person" data-index="${i}">Excluir colaborador</button></fieldset>`).join('')||'<p class="empty-state compact">Nenhum colaborador cadastrado nesta equipe.</p>';
  $('#admin-responsaveis').querySelectorAll('.admin-remove-person').forEach(btn=>btn.onclick=()=> {
    adminEditState.responsaveis.splice(Number(btn.dataset.index),1);
    renderResponsaveisEditor();
  }
  );
  $('#admin-responsaveis').querySelectorAll('.admin-person-foto').forEach((input,i)=>input.onchange=()=> {
    adminEditState.responsaveis[i]._file=input.files[0]||null;
  }
  );
}
function openEditTeam(id) {
  const team=data.equipes.find(t=>t.id===id);
  if(!team)return;
  adminEditState= {
    teamId:id,isNew:false,liderId:team.liderId,responsaveis:(team.responsaveis||[]).map(p=>( {
      ...p,_file:null
    }
    ))
  }
  ;
  openTeamForm(team);
}
function openCreateTeam() {
  const id=newId('equipe');
  adminEditState={teamId:id,isNew:true,liderId:'',responsaveis:[]};
  openTeamForm({id,nome:'',sigla:'',descricao:'',responsabilidades:[],empresas:[],dadosAreaValidados:false,tipo:'executiva'});
}
function openTeamForm(team) {
  showDialog(adminEditState.isNew?'Nova equipe':team.nome,'ADMINISTRAÇÃO DE EQUIPES',`<form id="admin-team-form"><div class="admin-form-grid"><label class="field">Nome da equipe<input id="admin-nome" value="${e(team.nome||'')}" required></label><label class="field">Sigla<input id="admin-sigla" value="${e(team.sigla||'')}" maxlength="12"></label></div><label class="field">Descrição da área<input id="admin-descricao" value="${e(team.descricao||'')}"></label><label class="field">Responsabilidades (uma por linha)<textarea id="admin-responsabilidades">${e((team.responsabilidades||[]).join('\n'))}</textarea></label><label class="field">Empresas atendidas (uma por linha)<textarea id="admin-empresas">${e((team.empresas||[]).join('\n'))}</textarea></label><label class="admin-validated"><input type="checkbox" id="admin-validado" ${team.dadosAreaValidados?'checked':''}> Informações da área validadas para exibição</label><div class="admin-subheading"><div><h3>Colaboradores</h3><p>Cadastre os integrantes e marque quem lidera a equipe.</p></div><button type="button" class="secondary-btn" id="admin-add-person">Adicionar colaborador +</button></div><div id="admin-responsaveis"></div><div class="admin-form-actions"><button class="primary-btn" type="submit">${adminEditState.isNew?'Criar equipe':'Salvar alterações'}</button>${!adminEditState.isNew&&team.id!=='gerencia'?'<button class="danger-btn" type="button" id="admin-delete-team">Excluir equipe</button>':''}</div></form>`);
  renderResponsaveisEditor();
  $('#admin-add-person').onclick=()=> {
    const personId=newId(`colaborador-${adminEditState.teamId}`);
    adminEditState.responsaveis.push( {
      id:personId,areaId:adminEditState.teamId,nome:'',cargo:'',foto:'assets/users/default.svg',_file:null
    }
    );
    if(!adminEditState.liderId)adminEditState.liderId=personId;
    renderResponsaveisEditor();
  }
  ;
  const deleteButton=$('#admin-delete-team');
  if(deleteButton)deleteButton.onclick=()=>deleteTeam(team.id,team.nome);
  $('#admin-team-form').onsubmit=async event=> {
    event.preventDefault();
    const submitBtn=event.target.querySelector('[type=submit]');
    submitBtn.disabled=true;
    try {
      const responsaveis=[];
      const rows=[...document.querySelectorAll('.admin-person-row')];
      const leaderIndex=Number(document.querySelector('input[name="admin-lider"]:checked')?.value??-1);
      for(let i=0;i<rows.length;i++) {
        const nome=rows[i].querySelector('.admin-person-nome').value.trim();
        if(!nome)continue;
        const pendente=adminEditState.responsaveis[i];
        const path=rows[i].querySelector('.admin-person-foto-path').value.trim();
        const foto=pendente._file?(isLiveDataSource()?await apiUploadPhoto(pendente._file,{autor:currentUser.nome}):await fileAsDataURL(pendente._file)):(path||'assets/users/default.svg');
        responsaveis.push( {
          id:pendente.id||teamMemberId(adminEditState.teamId,nome,i),areaId:adminEditState.teamId,nome,cargo:rows[i].querySelector('.admin-person-cargo').value.trim(),foto
        }
        );
      }
      const selectedLeader=leaderIndex>=0?adminEditState.responsaveis[leaderIndex]?.id:'';
      const leader=responsaveis.find(person=>person.id===selectedLeader)||responsaveis[0]||null;
      const body= {
        id:adminEditState.teamId,
        nome:$('#admin-nome').value.trim(),
        sigla:$('#admin-sigla').value.trim(),
        descricao:$('#admin-descricao').value.trim(),
        responsabilidades:listFromTextarea($('#admin-responsabilidades').value),
        empresas:listFromTextarea($('#admin-empresas').value),
        responsaveis,
        lider:leader?.nome||'',
        liderId:leader?.id||'',
        dadosAreaValidados:$('#admin-validado').checked,
        tipo:team.tipo||'executiva',
        solucoes:team.solucoes||[]
      }
      ;
      let updated=body;
      if(isLiveDataSource())updated=await apiWrite('equipes',{id:adminEditState.isNew?undefined:team.id,method:adminEditState.isNew?'POST':'PUT',body,autor:currentUser.nome});
      const index=data.equipes.findIndex(item=>item.id===team.id);
      if(adminEditState.isNew)data.equipes.push(updated);else data.equipes[index]=updated;
      if(!isLiveDataSource())saveLocalTeams(data.equipes);
      $('#detail-dialog').close();
      refreshTeamsUI(adminEditState.isNew?'Equipe criada.':'Equipe atualizada.');
    }
    catch(error) {
      notify(error.message);
    }
    finally {
      submitBtn.disabled=false;
    }
  }
  ;
}
async function deleteTeam(id,name) {
  if(id==='gerencia')return notify('A Gerência é a raiz da estrutura e não pode ser excluída.');
  if(!confirm(`Excluir a equipe “${name}” e todos os colaboradores vinculados?`))return;
  try {
    if(isLiveDataSource())await apiWrite('equipes',{id,method:'DELETE',body:{},autor:currentUser.nome});
    data.equipes=data.equipes.filter(team=>team.id!==id);
    if(!isLiveDataSource())saveLocalTeams(data.equipes);
    $('#detail-dialog').close();
    refreshTeamsUI('Equipe excluída.');
  }
  catch(error) {
    notify(error.message);
  }
}
function exportTeams() {
  const blob=new Blob([JSON.stringify(data.equipes,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download='equipes.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  notify('Base de equipes exportada.');
}
async function importTeams(file) {
  try {
    const teams=JSON.parse(await file.text());
    if(!Array.isArray(teams)||!teams.length)throw new Error('O arquivo deve conter uma lista de equipes.');
    const ids=new Set();
    teams.forEach(team=> {
      if(!team.id||!team.nome||ids.has(team.id)||!Array.isArray(team.responsaveis))throw new Error('Arquivo inválido: revise IDs, nomes e colaboradores.');
      ids.add(team.id);
      team.responsaveis.forEach(person=> { if(!person.id||!person.nome)throw new Error(`Colaborador inválido em ${team.nome}.`); person.areaId=team.id; });
    });
    data.equipes=teams;
    saveLocalTeams(teams);
    refreshTeamsUI('Base de equipes importada neste navegador.');
  }
  catch(error) {
    notify(error.message);
  }
}
let automationEditState=null;
// Same admin flow as equipes: same dialog helper, same live/local persistence
// split, same refresh-after-save pattern — a second collection through the
// one Administração storage path already established, not a new one.
function refreshAutomationsUI(message) {
  renderAdmin();
  if(currentTab==='automacoes')renderContent('automacoes');
  if(message)notify(message);
}
function openAutomationForm(item) {
  showDialog(automationEditState.isNew?'Nova automação':item.titulo,'ADMINISTRAÇÃO DE AUTOMAÇÕES',`<form id="admin-automation-form"><div class="admin-form-grid"><label class="field">Título<input id="admin-aut-titulo" value="${e(item.titulo||'')}" required></label><label class="field">Ordem de exibição<input id="admin-aut-ordem" type="number" min="1" value="${e(item.ordem||1)}" required></label></div><label class="field">Tecnologia<select id="admin-aut-familia">${Object.entries(AUTOMATION_FAMILIAS).map(([value,label])=>`<option value="${e(value)}" ${item.familia===value?'selected':''}>${e(label)}</option>`).join('')}</select></label><label class="field">Tipo (rótulo exibido no card)<input id="admin-aut-tipo" value="${e(item.tipo||'')}" required placeholder="Ex.: RPA SAP, Script Python, RPA Web"></label><label class="field">Descrição<textarea id="admin-aut-descricao" required>${e(item.descricao||'')}</textarea></label><label class="field">Status de desenvolvimento<select id="admin-aut-status">${AUTOMATION_STATUSES.map(s=>`<option ${item.statusDesenvolvimento===s?'selected':''}>${e(s)}</option>`).join('')}</select></label><label class="field">URL de acesso (opcional)<input id="admin-aut-url" type="url" placeholder="https://…" value="${e(item.url||'')}"></label><label class="admin-validated"><input type="checkbox" id="admin-aut-ativo" ${item.ativo!==false?'checked':''}> Automação ativa (visível na tab)</label><div class="admin-form-actions"><button class="primary-btn" type="submit">${automationEditState.isNew?'Criar automação':'Salvar alterações'}</button>${!automationEditState.isNew?'<button class="danger-btn" type="button" id="admin-delete-automation">Excluir automação</button>':''}</div></form>`);
  const deleteButton=$('#admin-delete-automation');
  if(deleteButton)deleteButton.onclick=()=>deleteAutomation(item.id,item.titulo);
  $('#admin-automation-form').onsubmit=async event=> {
    event.preventDefault();
    const submitBtn=event.target.querySelector('[type=submit]');
    submitBtn.disabled=true;
    try {
      const urlRaw=$('#admin-aut-url').value.trim();
      if(urlRaw&&!safeURL(urlRaw))throw new Error('URL inválida. Use um endereço http(s) válido.');
      const body= {
        id:automationEditState.id,
        categoriaPortal:'Automações',
        tipo:$('#admin-aut-tipo').value.trim(),
        familia:$('#admin-aut-familia').value,
        titulo:$('#admin-aut-titulo').value.trim(),
        descricao:$('#admin-aut-descricao').value.trim(),
        statusDesenvolvimento:$('#admin-aut-status').value,
        url:urlRaw||null,
        ativo:$('#admin-aut-ativo').checked,
        ordem:Number($('#admin-aut-ordem').value)||1
      }
      ;
      let updated=body;
      if(isLiveDataSource())updated=await apiWrite('automacoes',{id:automationEditState.isNew?undefined:item.id,method:automationEditState.isNew?'POST':'PUT',body,autor:currentUser.nome});
      const index=data.automacoes.findIndex(a=>a.id===item.id);
      if(automationEditState.isNew)data.automacoes.push(updated);else data.automacoes[index]=updated;
      if(!isLiveDataSource())saveLocalAutomacoes(data.automacoes);
      $('#detail-dialog').close();
      refreshAutomationsUI(automationEditState.isNew?'Automação criada.':'Automação atualizada.');
    }
    catch(error) {
      notify(error.message);
    }
    finally {
      submitBtn.disabled=false;
    }
  }
  ;
}
function openCreateAutomation() {
  const id=newId('automacao');
  const maiorOrdem=data.automacoes.reduce((max,item)=>Math.max(max,item.ordem||0),0);
  automationEditState= {
    id,isNew:true
  }
  ;
  openAutomationForm( {
    id,tipo:'',familia:'sap',titulo:'',descricao:'',statusDesenvolvimento:'Produção',url:null,ativo:true,ordem:maiorOrdem+1
  }
  );
}
function openEditAutomation(id) {
  const item=data.automacoes.find(a=>a.id===id);
  if(!item)return;
  automationEditState= {
    id,isNew:false
  }
  ;
  openAutomationForm(item);
}
async function deleteAutomation(id,titulo) {
  if(!confirm(`Excluir a automação “${titulo}”?`))return;
  try {
    if(isLiveDataSource())await apiWrite('automacoes',{id,method:'DELETE',body:{},autor:currentUser.nome});
    data.automacoes=data.automacoes.filter(item=>item.id!==id);
    if(!isLiveDataSource())saveLocalAutomacoes(data.automacoes);
    $('#detail-dialog').close();
    refreshAutomationsUI('Automação excluída.');
  }
  catch(error) {
    notify(error.message);
  }
}
// Selecting someone else's name in the identification picker (e.g. Jonathan,
// who has administracao access) must not be enough to reach the edit forms —
// this is a soft deterrent, not real authentication: it runs entirely in the
// browser, so it can't stop someone who opens dev tools. The password itself
// is never kept in the source as plain text, only its SHA-256 hash.
const ADMIN_UNLOCK_HASH='b6d30367e3010f5067fd937ec1abbc5fb4e5502f55b7c9bd9b798622b785ad8e';
const ADMIN_UNLOCK_KEY='portal-admin-unlocked';
function isAdminUnlocked() {
  try {
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY)==='1';
  }
  catch {
    return false;
  }
}
async function sha256Hex(text) {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function renderAdminLock() {
  $('#admin-view').innerHTML=`<div class="admin-lock"><p>Área restrita da Administração. Informe o código de acesso para continuar.</p><form id="admin-unlock-form"><label class="field">Código de acesso<input type="password" id="admin-unlock-code" autocomplete="off" required></label><button class="primary-btn" type="submit">Desbloquear</button></form><p class="empty-state compact" id="admin-unlock-error" hidden>Código incorreto. Tente novamente.</p></div>`;
  $('#admin-unlock-form').onsubmit=async event=> {
    event.preventDefault();
    const code=$('#admin-unlock-code').value;
    const hash=await sha256Hex(code);
    if(hash===ADMIN_UNLOCK_HASH) {
      try {
        sessionStorage.setItem(ADMIN_UNLOCK_KEY,'1');
      }
      catch {
        /* Storage may be blocked by corporate browser policy. */
      }
      renderAdmin();
    }
    else {
      $('#admin-unlock-error').hidden=false;
      $('#admin-unlock-code').value='';
      $('#admin-unlock-code').focus();
    }
  }
  ;
}
function renderAdminEquipes() {
  const live=isLiveDataSource();
  $('#admin-view').innerHTML=`<div class="admin-toolbar"><button class="primary-btn" id="admin-new-team">Nova equipe +</button><button class="secondary-btn" id="admin-export">Exportar JSON</button>${live?'':'<label class="secondary-btn admin-import">Importar JSON<input id="admin-import" type="file" accept="application/json,.json"></label>'}${hasLocalTeams()&&!live?'<button class="text-btn" id="admin-reset">Restaurar base original</button>':''}</div><div class="admin-team-list">${data.equipes.map(t=>`<article class="admin-team-card"><div><span class="team-code">${e(t.sigla||t.id)}</span><h3>${e(t.nome)}</h3><p>${e(t.descricao||'Sem descrição cadastrada.')}</p></div><div class="admin-team-meta"><strong>${(t.responsaveis||[]).length}</strong><span>colaborador(es)</span><button class="secondary-btn" data-admin-team="${e(t.id)}">Administrar</button></div></article>`).join('')}</div>`;
  $('#admin-new-team').onclick=openCreateTeam;
  $('#admin-export').onclick=exportTeams;
  const importInput=$('#admin-import');
  if(importInput)importInput.onchange=()=>importInput.files[0]&&importTeams(importInput.files[0]);
  const reset=$('#admin-reset');
  if(reset)reset.onclick=()=> { if(confirm('Descartar as alterações locais e restaurar a base original?')) { clearLocalTeams();location.reload(); } };
}
function renderAdminAutomacoes() {
  const automacoesOrdenadas=data.automacoes.slice().sort((a,b)=>(a.ordem??0)-(b.ordem??0));
  $('#admin-view').innerHTML=`<div class="admin-toolbar"><button class="primary-btn" id="admin-new-automation">Nova automação +</button></div><div class="admin-team-list">${automacoesOrdenadas.map(a=>`<article class="admin-team-card"><div><span class="tag ${automationTagClass(a.familia)}">${e(a.tipo)}</span><h3>${e(a.titulo)}</h3><p>${e(a.descricao)}</p></div><div class="admin-team-meta"><strong>${a.ativo!==false?'Ativa':'Inativa'}</strong><span>ordem ${e(a.ordem??'-')}</span><button class="secondary-btn" data-admin-automation="${e(a.id)}">Administrar</button></div></article>`).join('')||'<p class="empty-state compact">Nenhuma automação cadastrada.</p>'}</div>`;
  $('#admin-new-automation').onclick=openCreateAutomation;
}
// Equipes and Automações are separate tabs (same .tabs component as Central
// de Conteúdo) instead of one long stacked list — currentAdminTab is the
// only piece of state that needs to survive a re-render (e.g. after a
// create/edit/delete refresh) so the active tab doesn't reset.
function renderAdmin() {
  const unlocked=isAdminUnlocked();
  $('#admin-summary').hidden=!unlocked;
  $('#admin-tabs').hidden=!unlocked;
  if(!unlocked) {
    renderAdminLock();
    return;
  }
  const live=isLiveDataSource();
  const source=live?'Servidor conectado':hasLocalTeams()?'Alterações salvas neste navegador':'Base original do portal';
  const token=live?`<div class="admin-token-row"><label class="field">Token de administração<input type="password" id="admin-token" placeholder="Cole o token aqui" value="${e(getAdminToken())}"></label><button class="primary-btn" id="admin-token-save">Salvar token</button></div>`:'';
  $('#admin-summary').innerHTML=`<div class="admin-overview"><div><span class="section-kicker">FONTE DOS DADOS</span><strong>${e(source)}</strong><p>${live?'As alterações são gravadas no servidor e compartilhadas.':'As alterações ficam neste navegador. Exporte o JSON para backup ou para atualizar a base publicada.'}</p></div></div>${token}`;
  const tokenSave=$('#admin-token-save');
  if(tokenSave)tokenSave.onclick=()=> { setAdminToken($('#admin-token').value.trim());notify('Token salvo neste navegador.');renderAdmin(); };
  selectTab('#admin-tabs',$(`#admin-tab-${currentAdminTab}`));
  $('#admin-view').setAttribute('aria-labelledby',`admin-tab-${currentAdminTab}`);
  if(currentAdminTab==='automacoes')renderAdminAutomacoes();
  else if(currentAdminTab==='ai-studio')renderAdminAiStudio();
  else renderAdminEquipes();
}
// ===== Importação de pacotes do AI Studio (Sprint 7) =====
// Fluxo: selecionar ZIP → validar formato, CRC, SHA-256 e assinatura → pré-visualizar →
// confirmar → item "Em revisão" no Painel Editorial. Nunca publica automaticamente.
let aiImportState=null;
function aiStudioConfig() {
  return data.config.aiStudio||{};
}
function originBadge(origin) {
  const labels={verified:'Origem verificada (assinatura válida)',unverifiable:'Origem não verificável (chave pública não configurada)',unsigned:'Pacote sem assinatura',invalid:'Assinatura inválida'};
  return badge(labels[origin]||origin,origin==='verified'?'':'');
}
function renderAdminAiStudio() {
  const live=isLiveDataSource();
  const cfg=aiStudioConfig();
  $('#admin-view').innerHTML=`<div class="ai-import"><p class="muted">Importe pacotes gerados na <strong>Central de Publicações do AI Studio</strong>. O conteúdo entra como <strong>Em revisão</strong> no Painel Editorial e só aparece na Central de Conteúdo após a aprovação final.</p><p class="muted">${cfg.publicKeySpki?`Verificação de origem ativa${cfg.requireSignature?' — pacotes sem assinatura válida são bloqueados':''}.`:'Chave pública do AI Studio não configurada (data/config.json → aiStudio.publicKeySpki): a origem precisará ser confirmada manualmente.'} ${live?'Backend conectado: o item e a imagem serão gravados no servidor.':'Sem backend: a importação gera os arquivos para atualizar a publicação (newsletter.json e imagem).'}</p><label class="primary-btn admin-import">Selecionar pacote .zip<input id="ai-import-file" type="file" accept=".zip,application/zip"></label><div id="ai-import-result"></div></div>`;
  $('#ai-import-file').onchange=event=>event.target.files[0]&&analyzeAiPackage(event.target.files[0]);
}
async function analyzeAiPackage(file) {
  const out=$('#ai-import-result');
  out.innerHTML='<p class="loading">Validando pacote…</p>';
  if(aiImportState?.previewUrl)URL.revokeObjectURL(aiImportState.previewUrl);
  aiImportState=null;
  try {
    if(!/\.zip$/i.test(file.name))throw new Error('Selecione um arquivo .zip gerado pelo AI Studio.');
    const files=await readZip(await file.arrayBuffer());
    const cfg=aiStudioConfig();
    const result=await validatePackage(files,{publicKeySpki:cfg.publicKeySpki||null,requireSignature:Boolean(cfg.requireSignature)});
    if(!result.ok) {
      out.innerHTML=`<div class="ai-import-errors" role="alert"><strong>Importação bloqueada.</strong><ul>${result.errors.map(err=>`<li>${e(err)}</li>`).join('')}</ul></div>`;
      track('ai_import_rejected',{motivos:result.errors.length});
      return;
    }
    const manifest=result.manifest;
    const collection=manifest.destination.portal_collection;
    const existing=findExisting(data[collection]||[],manifest);
    if(existing?.kind==='duplicate') {
      out.innerHTML=`<div class="ai-import-errors" role="alert"><strong>Pacote já importado.</strong><p>A versão v${e(manifest.approval.version_number)} deste conteúdo já existe no portal como "${e(existing.item.titulo)}" (${e(existing.item.status)}). Nenhum registro duplicado foi criado.</p></div>`;
      return;
    }
    const previewUrl=URL.createObjectURL(new Blob([result.image],{type:'image/png'}));
    aiImportState={manifest,result,collection,replaces:existing?.kind==='replaces'?existing.items.map(i=>i.id):[],previewUrl};
    const categorias=[...new Set([manifest.destination.portal_category,...(data.config.newsletterCategorias||[])])];
    const needsManualOrigin=result.origin!=='verified';
    out.innerHTML=`<div class="ai-import-preview"><div class="ai-import-media"><img src="${previewUrl}" alt="Pré-visualização da peça"></div><div><span class="section-kicker">${e(manifest.category_label||manifest.category)} · ${e(manifest.destination.label)}</span><h3>${e(manifest.title)}</h3><p>${e(manifest.summary||'')}</p>${detailGrid({'Versão aprovada':`v${manifest.approval.version_number} (${manifest.version_id})`,'Aprovada em':manifest.approval.approved_at,'Data de referência':dateLabel(manifest.reference_date),'Fonte':manifest.source_name,'Link da fonte':manifest.source_url,'Link de acesso':manifest.access_url,'Sistema':manifest.system_name,'SHA-256 da imagem':result.imageHash})}<p>${originBadge(result.origin)} ${badge('Integridade conferida')}</p>${result.warnings.map(w=>`<p class="empty-state compact">${e(w)}</p>`).join('')}${aiImportState.replaces.length?`<p class="empty-state compact">Este pacote é uma nova versão de um conteúdo já importado (${aiImportState.replaces.map(e).join(', ')}). A publicação anterior permanece no ar até esta ser publicada; então será marcada como "Substituído".</p>`:''}<form id="ai-import-form"><div class="admin-form-grid"><label class="field">Categoria no portal<select id="ai-import-categoria">${categorias.map(c=>`<option ${c===manifest.destination.portal_category?'selected':''}>${e(c)}</option>`).join('')}</select></label><label class="field">Nível de impacto<select id="ai-import-impacto"><option>Baixo</option><option>Moderado</option><option>Alto</option></select></label></div><label class="field">Área responsável<input id="ai-import-area" value="${e(manifest.institutional_owner||'Gerência de Contabilidade')}" maxlength="120" required></label>${needsManualOrigin?'<label class="admin-validated"><input type="checkbox" id="ai-import-origin" required> Confirmo que recebi este pacote diretamente da Central de Publicações do AI Studio, por canal interno autorizado.</label>':''}<div class="admin-form-actions"><button class="primary-btn" type="submit">Importar para revisão</button><button class="text-btn" type="button" id="ai-import-cancel">Cancelar</button></div></form></div></div>`;
    $('#ai-import-cancel').onclick=renderAdminAiStudio;
    $('#ai-import-form').onsubmit=event=> { event.preventDefault(); confirmAiImport(); };
  }
  catch(error) {
    out.innerHTML=`<div class="ai-import-errors" role="alert"><strong>Pacote inválido.</strong><p>${e(error.message)}</p></div>`;
  }
}
function downloadBlob(blob,name) {
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function confirmAiImport() {
  const state=aiImportState;
  if(!state)return;
  const {manifest,result,collection,replaces}=state;
  const fileName=`${portalItemId(manifest)}.png`;
  const pasta=aiStudioConfig().pastaImagens||'assets/images/ai-studio';
  const options={categoria:$('#ai-import-categoria').value,nivelImpacto:$('#ai-import-impacto').value,areaResponsavel:$('#ai-import-area').value.trim(),autor:currentUser.nome,origin:result.origin,replaces};
  try {
    if(isLiveDataSource()) {
      const imagePath=await apiUploadContentImage(result.image,fileName,{autor:currentUser.nome});
      const item=toPortalItem(manifest,{...options,imagePath});
      await apiWrite(collection,{method:'POST',body:item,autor:currentUser.nome});
      const updated=await apiWrite(collection,{id:item.id,method:'PUT',body:{status:'Em revisão'},autor:currentUser.nome});
      data[collection].push(updated);
      renderEditorial();
      notify('Conteúdo importado como "Em revisão". Publique pelo Painel Editorial e confirme no AI Studio.');
    }
    else {
      const item=toPortalItem(manifest,{...options,imagePath:`${pasta}/${fileName}`});
      const updatedCollection=[...data[collection],item];
      downloadBlob(new Blob([result.image],{type:'image/png'}),fileName);
      downloadBlob(new Blob([JSON.stringify(updatedCollection,null,2)+'\n'],{type:'application/json'}),`${collection}.json`);
      notify(`Arquivos gerados: copie ${fileName} para ${pasta}/ e substitua data/${collection}.json na publicação.`);
    }
    track('ai_import_confirmed',{colecao:collection});
    renderAdminAiStudio();
  }
  catch(error) {
    notify(error.message);
  }
}
function showRecord(collection,id) {
  const item=data[collection]?.find(i=>i.id===id);
  if(!item)return;
  track('record_view',{collection,label:item.titulo||item.nome});
  if(collection==='newsletter') {
    showArticle(item);
    return;
  }
  if(collection==='noticias') {
    focusNoticia(id);
    return;
  }
  if(collection==='equipes') {
    navigate(currentMenu.find(item=>item.view==='equipes'));
    return;
  }
  if(collection==='sistemas') {
    openAccess(item);
    return;
  }
  if(collection==='usuarios') {
    showDialog(item.nome,'COLABORADOR',detailGrid( {
      'Matrícula':item.matricula,'Cargo':item.cargo,'Área':item.area,'Equipe':item.equipe,'Perfil':item.perfil
    }
    ));
    return;
  }
  if(collection==='automacoes') {
    const url=safeURL(item.url);
    showDialog(item.titulo,'AUTOMAÇÃO',`<p>${e(item.descricao)}</p>${detailGrid({'Categoria no portal':item.categoriaPortal,'Tecnologia':item.tipo,'Status de desenvolvimento':item.statusDesenvolvimento,'Situação do acesso':url?'Disponível':'Acesso em configuração'})}${url?`<a class="primary-btn" href="${e(url)}" target="_blank" rel="noopener noreferrer">Acessar automação ↗</a>`:'<p class="muted">O acesso pelo portal ainda está em configuração.</p>'}`);
    return;
  }
  if(collection==='documentos') {
    const url=safeURL(item.arquivo);
    showDialog(item.titulo,item.categoria,`<p>${e(item.descricao)}</p>${detailGrid({'Tipo':item.formato,'Responsável':item.responsavel,'Atualização':dateLabel(item.data),'Versão':item.versao})}<p>Documento demonstrativo. Substitua pela versão aprovada antes do uso operacional.</p>${url?`<a class="primary-btn" href="${e(url)}" target="_blank" rel="noopener noreferrer">Abrir documento ↗</a> <a class="primary-btn" href="${e(url)}" download>Baixar ↓</a>`:''}`);
    return;
  }
  showDialog(item.nome,collection==='agenda'?'AGENDA DA GERÊNCIA':collection==='entregas'?'ENTREGA DA SEMANA':'PROCESSO CRÍTICO',`<p>${e(item.descricao)}</p>${detailGrid({'Responsável':item.responsavel,'Prazo / data':item.data?dateLabel(item.data):/^\d{4}-/.test(item.prazo)?dateLabel(item.prazo):item.prazo,'Status / tipo':item.status||item.tipo,'Horário':item.horario||'Não se aplica'})}`);
}
function search(query) {
  const normalized=normalize(query.trim());
  $('#search-section').hidden=!normalized;
  if(!normalized)return 0;
  const matches=[];
  for(const collection of ['newsletter','noticias','processos','sistemas','documentos','equipes','usuarios','agenda','entregas']) {
    if(!hasAccess(currentUser,COLLECTION_ACCESS[collection]))continue;
    for(const item of data[collection]) {
      if((collection==='newsletter'||collection==='noticias')&&item.status!=='Publicado')continue;
      if(normalize(JSON.stringify(item)).includes(normalized))matches.push( {
        collection,item
      }
      );
    }
  }
  $('#search-count').textContent=`${matches.length} resultado${matches.length===1?'':'s'} para “${query.trim()}”`;
  $('#search-results').innerHTML=matches.map(( {
    collection,item
  }
  )=>`<article class="content-card"><span class="section-kicker">${e(({newsletter:'Newsletter',noticias:'Notícias',usuarios:'Colaboradores'})[collection]||collection)}</span><h3>${e(item.titulo||item.nome)}</h3><p>${e(item.resumo||item.descricao||item.cargo||'')}</p><button class="text-btn" data-record="${e(collection)}:${e(item.id)}">Ver detalhes →</button></article>`).join('')||'<p class="empty-state">Nenhum resultado. Experimente “conciliações”, “IFRS” ou “Contabilidade IV”.</p>';
  return matches.length;
}
function preferences() {
  let prefs= {
  }
  ;
  try {
    prefs=JSON.parse(localStorage.getItem('portal-preferences')||'{}');
  }
  catch {
    /* Storage may be blocked by corporate browser policy. */
  }
  document.body.classList.toggle('no-motion',!!prefs.noMotion);
  document.body.classList.toggle('comfortable',!!prefs.comfortable);
  setAnalyticsEnabled(!prefs.noAnalytics);
  const usageList=(pairs,vazio)=>pairs.length?pairs.map(([k,c])=>`${k} · ${c}×`).join(', '):vazio;
  $('#settings').onclick=()=> {
    const s=summary();
    showDialog('Preferências e uso','CONFIGURAÇÕES',`<p>Preferências salvas apenas neste navegador.</p><label class="settings-row"><input type="checkbox" id="pref-motion" ${document.body.classList.contains('no-motion')?'checked':''}> Reduzir movimento e pausar o radar</label><label class="settings-row"><input type="checkbox" id="pref-size" ${document.body.classList.contains('comfortable')?'checked':''}> Aumentar textos dos conteúdos</label><label class="settings-row"><input type="checkbox" id="pref-analytics" ${prefs.noAnalytics?'':'checked'}> Registrar meu uso do portal neste navegador</label><h3>Uso deste navegador</h3><p class="muted">Sem envio a servidores; os dados ficam só neste dispositivo e podem ser exportados ou apagados a qualquer momento.</p>${detailGrid( {
      'Eventos registrados':String(s.total),'Aba mais acessada':usageList(s.topAbas,'Sem dados ainda'),'Sistema mais acessado':usageList(s.topSistemas,'Sem dados ainda'),'Termo mais pesquisado':usageList(s.topBuscas,'Sem dados ainda'),'Conteúdo mais consultado':usageList(s.topRegistros,'Sem dados ainda'),'Documento mais baixado':usageList(s.topDocumentos,'Sem dados ainda')
    }
    )}<div class="doc-actions"><button class="primary-btn" id="export-analytics">Exportar dados ↓</button><button class="text-btn" id="clear-analytics">Limpar dados locais</button></div>`);
    ['#pref-motion','#pref-size','#pref-analytics'].forEach(selector=>$(selector).onchange=()=> {
      const settings= {
        noMotion:$('#pref-motion').checked,comfortable:$('#pref-size').checked,noAnalytics:!$('#pref-analytics').checked
      }
      ;
      document.body.classList.toggle('no-motion',settings.noMotion);
      document.body.classList.toggle('comfortable',settings.comfortable);
      setAnalyticsEnabled(!settings.noAnalytics);
      prefs=settings;
      try {
        localStorage.setItem('portal-preferences',JSON.stringify(settings));
      }
      catch {
        notify('Preferência aplicada nesta sessão. Armazenamento local indisponível.');
      }
    }
    );
    $('#export-analytics').onclick=exportAnalytics;
    $('#clear-analytics').onclick=()=> {
      clearAnalytics();
      notify('Dados de uso apagados deste navegador.');
      $('#settings').click();
    }
    ;
  }
  ;
}
// First access asks for the área before the person — the área → colaborador
// choice is what changes what shows up next, so identifying by name alone
// (as before) forced everyone through one flat list. A visitor who isn't
// part of any área of the Gerência de Contabilidade gets its own option.
function openIdentityPicker() {
  const areas=data.equipes.map(team=>`<button class="identity-pick" data-area="${e(team.id)}">${icon('users')}<span><strong>${e(team.nome)}</strong><small>${e(team.responsaveis.length)} colaborador(es)</small></span></button>`).join('');
  showDialog('Qual área você atua?','IDENTIFICAÇÃO',`<p>Escolha sua área para localizar seu nome na lista de colaboradores. A escolha fica salva só neste navegador — não é um login corporativo.</p><div class="identity-list">${areas}<button class="identity-pick" data-visitante>${icon('globe')}<span><strong>Sou visitante</strong><small>Não faço parte da Gerência de Contabilidade</small></span></button></div>`);
  document.querySelectorAll('[data-area]').forEach(btn=>btn.onclick=()=>openColaboradorPicker(btn.dataset.area));
  $('[data-visitante]').onclick=()=> {
    setStoredUserId('visitante');
    location.reload();
  }
  ;
}
// A colaborador already registered in Administração (data/usuarios.json) —
// used today only for the handful of profiles that need something beyond
// their área's default permissions, like Jonathan's admin access — keeps
// that profile when picked here, matched by name within the same área.
function openColaboradorPicker(areaId) {
  const team=data.equipes.find(t=>t.id===areaId);
  const rows=team.responsaveis.map(p=> {
    const matched=data.usuarios.find(u=>u.areaId===team.id&&normalize(u.nome)===normalize(p.nome));
    return `<button class="identity-pick" data-user="${e(matched?matched.id:p.id)}"><img class="avatar" src="${e(safeURL(p.foto)||'assets/users/default.svg')}" alt=""><span><strong>${e(p.nome)}</strong><small>${e(p.cargo||team.nome)}</small></span></button>`;
  }
  ).join('')||'<p class="empty-state">Nenhum colaborador cadastrado nesta área.</p>';
  showDialog(team.nome,'IDENTIFICAÇÃO',`<button class="text-btn" id="identity-back">← Voltar</button><div class="identity-list">${rows}</div>`);
  $('#identity-back').onclick=openIdentityPicker;
  document.querySelectorAll('.identity-pick[data-user]').forEach(btn=>btn.onclick=()=> {
    setStoredUserId(btn.dataset.user);
    location.reload();
  }
  );
  document.querySelectorAll('.identity-pick .avatar').forEach(img=>img.addEventListener('error',()=> {
    img.src='assets/users/default.svg';
  }
  , {
    once:true
  }
  ));
}
async function init() {
  hydrateIcons();
  initializeDialog();
  preferences();
  try {
    data=await loadData();
    currentUser=identifyUser(data.usuarios,data.equipes);
    renderUser(currentUser);
    applyAccess(currentUser);
    currentMenu=data.config.menu.filter(item=>hasAccess(currentUser,TARGET_ACCESS[item.target]||'conteudo'));
    initializeNavigation( {
      ...data.config,menu:currentMenu
    }
    ,navigate,openAccess);
    bindTabs('.tabs',tab=>renderContent(tab.dataset.tab));
    bindTabs('#admin-tabs',tab=> {
      currentAdminTab=tab.dataset.adminTab;
      renderAdmin();
    }
    );
    renderContent(currentTab);
    renderDashboard();
    renderEditorial();
    renderAdmin();
    renderPeriod();
    const route=location.hash.slice(1);
    const initialItem=currentMenu.find(item=>item.target===route)||(route==='inicio'?currentMenu.find(item=>item.target==='central'):null);
    if(initialItem)navigate(initialItem,false);
    window.addEventListener('popstate',()=> {
      const item=currentMenu.find(menuItem=>menuItem.target===location.hash.slice(1))||currentMenu.find(menuItem=>menuItem.target==='central');
      navigate(item,false);
    });
    track('session_start');
    $('#switch-identity').onclick=openIdentityPicker;
    if(!getStoredUserId())openIdentityPicker();
    $('#new-draft').onclick=openNewDraft;
    $('#search-form').onsubmit=event=> {
      event.preventDefault();
      const query=$('#global-search').value.trim();
      const resultados=search(query);
      if(query)track('search',{query,resultados});
      if(!$('#search-section').hidden)$('#search-section').scrollIntoView();
    }
    ;
    $('#global-search').oninput=event=> {
      if(event.target.value&&$('#home-view').hidden)navigate(currentMenu.find(item=>item.target==='central'),false);
      search(event.target.value);
    };
    $('#clear-search').onclick=()=> {
      $('#global-search').value='';
      search('');
      $('#global-search').focus();
    }
    ;
    document.addEventListener('keydown',event=> {
      if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('#detail-dialog').open) {
        event.preventDefault();
        $('#global-search').focus();
      }
    }
    );
    $('#notifications').onclick=()=> {
      const alerts=[...data.processos.filter(p=>/atenção|pendente|crítico/i.test(p.status)).map(p=>( {
        item:p,collection:'processos'
      }
      )),...data.entregas.filter(p=>/atenção|pendente|crítico/i.test(p.status)).map(p=>( {
        item:p,collection:'entregas'
      }
      ))];
      track('notifications_open',{alertas:alerts.length});
      showDialog('Central de notificações','ALERTAS DA GERÊNCIA',`<p>${alerts.length} pontos de atenção na base demonstrativa.</p>${alerts.map(({item,collection})=>`<article class="content-card"><h3>${e(item.nome)}</h3><p>${e(item.responsavel)}</p><div class="card-bottom">${badge(item.status)}<button class="text-btn" data-record="${collection}:${e(item.id)}">Ver detalhes →</button></div></article>`).join('')||'<p>Nenhum alerta.</p>'}`);
    }
    ;
    document.addEventListener('click',event=> {
      const record=event.target.closest('[data-record]');
      if(record) {
        const [collection,id]=record.dataset.record.split(':');
        showRecord(collection,id);
      }
      const system=event.target.closest('[data-system]');
      if(system)openAccess(data.sistemas.find(i=>i.id===system.dataset.system));
      const noticiaDetalhe=event.target.closest('[data-noticia-detalhe]');
      if(noticiaDetalhe) {
        const item=data.noticias.find(i=>i.id===noticiaDetalhe.dataset.noticiaDetalhe);
        if(item)showArticle(item);
      }
      const editorial=event.target.closest('[data-editorial]');
      if(editorial) {
        const [collection,id,action]=editorial.dataset.editorial.split(':');
        handleEditorialAction(collection,id,action);
      }
      const adminTeam=event.target.closest('[data-admin-team]');
      if(adminTeam)openEditTeam(adminTeam.dataset.adminTeam);
      const adminAutomation=event.target.closest('[data-admin-automation]');
      if(adminAutomation)openEditAutomation(adminAutomation.dataset.adminAutomation);
      const download=event.target.closest('a[download]');
      if(download) {
        const article=download.closest('article');
        track('document_download',{documento:article?.querySelector('p')?.textContent||article?.querySelector('h3')?.textContent||$('#dialog-title')?.textContent||'Documento'});
      }
      const homeLink=event.target.closest('.brand,.hero-link');
      if(homeLink) {
        event.preventDefault();
        const target=homeLink.hash.slice(1);
        navigate(currentMenu.find(item=>item.target===target)||currentMenu.find(item=>item.target==='central'));
      }
    }
    );
  }
  catch(error) {
    $('#load-error').hidden=false;
    $('#load-error').innerHTML=`<strong>Não foi possível carregar os dados locais.</strong><p>${e(error.message)}</p><p>Abra o portal por localhost, conforme o README, e confira os arquivos da pasta data.</p><button class="primary-btn" id="retry">Tentar novamente</button>`;
    $('#retry').onclick=()=>location.reload();
    $('#content-view').innerHTML='<p class="empty-state">Aguardando conexão com os arquivos locais.</p>';
  }
}
init();

