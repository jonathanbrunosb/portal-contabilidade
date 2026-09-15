import { loadData,isLiveDataSource } from './data-service.js';
import { identifyUser,renderUser,hasAccess } from './auth.js';
import { initializeNavigation,bindTabs,selectTab } from './navigation.js';
import { renderNewsletter,articleCard,showArticle } from './newsletter.js';
import { escapeHTML as e,normalize,icon,hydrateIcons,badge,dateLabel,showDialog,initializeDialog,detailGrid,safeURL,notify } from './ui.js';
import { track,setAnalyticsEnabled,summary,exportAnalytics,clearAnalytics } from './analytics.js';
let data,currentTab='newsletter',currentUser;
const $=selector=>document.querySelector(selector);
// Capability required to see each menu target / page section / searchable collection.
const TARGET_ACCESS= {
  central:'conteudo',processos:'gerencial',painel:'gerencial',agenda:'gerencial'
}
;
const SECTION_ACCESS= {
  central:'conteudo',equipes:'time',painel:'gerencial'
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
  const url=safeURL(item.link);
  track('system_access',{sistema:item.nome,configurado:!!url});
  if(url) {
    window.open(url,'_blank','noopener,noreferrer');
    return;
  }
  showDialog(item.nome,'ACESSO CORPORATIVO',`<p>${e(item.descricao||'Acesso utilizado pela Gerência de Contabilidade.')}</p><p>O endereço deste acesso ainda não foi cadastrado. Solicite o link ao responsável da área.</p>${detailGrid({'Status':'Aguardando configuração','Responsável':item.responsavel||'Administração do portal'})}`);
}
function systemCard(item) {
  return `<article class="content-card"><div class="system-symbol">${icon(item.icon)}</div><h3>${e(item.nome)}</h3><p>${e(item.descricao)}</p><div class="card-bottom">${badge(item.status)}<button class="text-btn" data-system="${e(item.id)}">Acessar sistema ↗</button></div></article>`;
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
function renderContent(tab) {
  currentTab=tab;
  track('tab_view',{tab});
  selectTab('.tabs',$(`#tab-${tab}`));
  $('#content-view').setAttribute('aria-labelledby',`tab-${tab}`);
  document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.navTab===tab));
  if(tab==='newsletter')$('#content-view').innerHTML=renderNewsletter(data.newsletter);
  if(tab==='noticias')$('#content-view').innerHTML=`<div class="card-grid">${data.noticias.filter(i=>i.status==='Publicado').map(i=>articleCard(i,'noticias')).join('')}</div><div class="content-footer">Pautas demonstrativas para acompanhamento — não representam notícias verificadas.</div>`;
  if(tab==='sistemas')$('#content-view').innerHTML=`<div class="card-grid">${data.sistemas.map(systemCard).join('')}</div><div class="content-footer">Cadastre os endereços internos para habilitar os acessos.</div>`;
  if(tab==='documentos') {
    $('#content-view').innerHTML=`<div class="filter-bar"><input type="search" id="doc-search" aria-label="Pesquisar documentos" placeholder="Pesquisar documentos…"><select id="doc-filter" aria-label="Categoria de documento"><option value="">Todas as categorias</option>${data.documentos.map(i=>`<option>${e(i.categoria)}</option>`).join('')}</select></div><div id="document-results" class="card-grid"></div><div class="content-footer" id="doc-count" aria-live="polite"></div>`;
    documentResults();
    $('#doc-search').oninput=documentResults;
    $('#doc-filter').onchange=documentResults;
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
function renderTeams(mode='equipes') {
  selectTab('.segmented',$(`#team-tab-${mode}`));
  $('#teams-view').setAttribute('aria-labelledby',`team-tab-${mode}`);
  if(mode==='equipes') {
    $('#teams-view').innerHTML=data.equipes.map(team=>`<article class="team-card"><div class="team-top"><span class="team-icon">${e(team.sigla)}</span><div class="team-copy"><h3>${e(team.nome)}</h3><p>${e(team.descricao)}</p><small class="team-leader">${e(team.lider)}</small></div><span class="team-count" title="${e(team.quantidade)} colaboradores">${icon('users')}${e(team.quantidade)}</span></div><div class="team-links">${['Equipe','Processos','Responsáveis','Empresas','Soluções'].map(f=>`<button class="text-btn" data-team="${e(team.id)}" data-facet="${e(f)}">${e(f)}</button>`).join('')}</div></article>`).join('');
  }
  else {
    const manager=data.equipes.find(t=>t.id==='gerencia');
    $('#teams-view').innerHTML=`<div class="org"><button class="org-root" data-team="gerencia">Gerência de Contabilidade<small>${e(manager.lider)}</small></button><div class="org-children">${data.equipes.filter(t=>t.id!=='gerencia').map(t=>`<button class="org-node" data-team="${e(t.id)}">${e(t.nome)}<small>${e(t.lider)} · ${e(t.quantidade)} colaboradores</small></button>`).join('')}</div></div>`;
  }
}
function showTeam(id,facet='Equipe') {
  const team=data.equipes.find(t=>t.id===id);
  track('team_view',{equipe:team.nome,facet});
  let content=detailGrid( {
    'Líder':team.lider,'Colaboradores':team.quantidade,'Empresas atendidas':team.empresas
  }
  );
  if(facet==='Equipe'||facet==='Responsáveis') {
    content+=`<h3>Responsáveis de referência</h3><ul class="detail-list">${team.responsaveis.map(p=>`<li>${e(p)}</li>`).join('')}</ul>`;
  }
  if(facet==='Equipe'||facet==='Processos')content+=`<h3>Principais responsabilidades</h3><ul class="detail-list">${team.responsabilidades.map(p=>`<li>${e(p)}</li>`).join('')}</ul>`;
  if(facet==='Soluções')content+=`<h3>Soluções do time</h3>${team.solucoes.map(id=>{const s=data.sistemas.find(s=>s.id===id);return s?`<p><button class="primary-btn" data-system="${e(s.id)}">${e(s.nome)} ↗</button></p>`:'';}).join('')}`;
  if(facet==='Empresas')content+=`<p>O atendimento segue a distribuição demonstrativa acima. A lista pode ser substituída pelas empresas reais da organização.</p>`;
  showDialog(team.nome,facet,`<p>${e(team.descricao)}</p>${content}`);
}
// Editorial dates follow the local dataset, independent of the device clock.
function renderPeriod() {
  const config = data.config;
  const reference = new Date(config.dataReferencia + 'T12:00:00');
  const period = new Date(config.competencia + '-01T12:00:00');
  const month = period.toLocaleDateString('pt-BR', {month: 'long'});
  const fonte = isLiveDataSource() ? 'Dados ao vivo' : 'Arquivo local';
  $('.context-date').innerHTML = `${e(reference.toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'}))} <span class="demo-label" title="${isLiveDataSource() ? 'Servido pelo backend em server/server.js' : 'Servido pelos arquivos estáticos em data/'}">${e(fonte)}</span> <span class="demo-label">${config.demonstracao ? 'Demonstração' : 'Base local'}</span>`;
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
function showRecord(collection,id) {
  const item=data[collection]?.find(i=>i.id===id);
  if(!item)return;
  track('record_view',{collection,label:item.titulo||item.nome});
  if(collection==='newsletter'||collection==='noticias') {
    showArticle(item);
    return;
  }
  if(collection==='equipes') {
    showTeam(id);
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
async function init() {
  hydrateIcons();
  initializeDialog();
  preferences();
  try {
    data=await loadData();
    currentUser=identifyUser(data.usuarios);
    renderUser(currentUser);
    applyAccess(currentUser);
    const menu=data.config.menu.filter(item=>hasAccess(currentUser,TARGET_ACCESS[item.target]||'conteudo'));
    initializeNavigation( {
      ...data.config,menu
    }
    ,renderContent,openAccess);
    bindTabs('.tabs',tab=>renderContent(tab.dataset.tab));
    bindTabs('.segmented',tab=>renderTeams(tab.dataset.teamTab));
    renderContent(currentTab);
    renderTeams();
    renderDashboard();
    renderPeriod();
    track('session_start');
    $('#search-form').onsubmit=event=> {
      event.preventDefault();
      const query=$('#global-search').value.trim();
      const resultados=search(query);
      if(query)track('search',{query,resultados});
      if(!$('#search-section').hidden)$('#search-section').scrollIntoView();
    }
    ;
    $('#global-search').oninput=event=>search(event.target.value);
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
      const team=event.target.closest('[data-team]');
      if(team)showTeam(team.dataset.team,team.dataset.facet);
      const system=event.target.closest('[data-system]');
      if(system)openAccess(data.sistemas.find(i=>i.id===system.dataset.system));
      const download=event.target.closest('a[download]');
      if(download) {
        const article=download.closest('article');
        track('document_download',{documento:article?.querySelector('p')?.textContent||article?.querySelector('h3')?.textContent||$('#dialog-title')?.textContent||'Documento'});
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
