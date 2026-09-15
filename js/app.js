import { loadData,isLiveDataSource,apiWrite,apiUploadPhoto,getAdminToken,setAdminToken,hasLocalTeams,saveLocalTeams,clearLocalTeams } from './data-service.js?v=20260915-3';
import { identifyUser,renderUser,hasAccess,getStoredUserId,setStoredUserId } from './auth.js';
import { initializeNavigation,bindTabs,selectTab } from './navigation.js';
import { renderNewsletter,articleCard,showArticle } from './newsletter.js';
import { renderTeamStructure } from './teams.js?v=20260915-3';
import { escapeHTML as e,normalize,icon,hydrateIcons,badge,dateLabel,showDialog,initializeDialog,detailGrid,safeURL,notify } from './ui.js';
import { track,setAnalyticsEnabled,summary,exportAnalytics,clearAnalytics } from './analytics.js';
let data,currentTab='newsletter',currentUser,currentMenu=[];
const $=selector=>document.querySelector(selector);
// Capability required to see each menu target / page section / searchable collection.
const TARGET_ACCESS= {
  central:'conteudo',equipes:'time',processos:'gerencial',painel:'gerencial',agenda:'gerencial',editorial:'gerencial',administracao:'administracao'
}
;
const CENTRAL_TABS=['newsletter','noticias','sistemas','documentos'];
const SECTION_ACCESS= {
  central:'conteudo',painel:'gerencial',editorial:'gerencial',administracao:'administracao'
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
function systemCard(item) {
  const media=item.imagem?`<img class="system-image" src="${e(safeURL(item.imagem)||'')}" alt="Ilustração do sistema ${e(item.nome)}" loading="lazy">`:`<div class="system-symbol">${icon(item.icon)}</div>`;
  return `<article class="content-card">${media}<h3>${e(item.nome)}</h3><p>${e(item.descricao)}</p><div class="card-bottom">${badge(item.status)}<button class="text-btn" data-system="${e(item.id)}">Acessar sistema ↗</button></div></article>`;
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
  activateMenu(currentMenu.find(item=>item.tab===tab)||(CENTRAL_TABS.includes(tab)?currentMenu.find(item=>item.target==='central'):null));
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
function activateMenu(item) {
  const index=currentMenu.indexOf(item);
  document.querySelectorAll('#navigation .nav-link').forEach(link=>link.classList.toggle('active',Number(link.dataset.menuIndex)===index));
}
function navigate(item,updateHistory=true) {
  if(!item)return;
  const teamsView=item.view==='equipes';
  $('#home-view').hidden=teamsView;
  $('#equipes').hidden=!teamsView;
  activateMenu(item);
  if(teamsView) {
    renderTeamStructure(data.equipes);
    track('team_structure_view');
  }
  else if(item.tab)renderContent(item.tab);
  if(updateHistory)history.pushState(null,'',`#${item.target}`);
  requestAnimationFrame(()=> {
    const target=teamsView?$('#equipes'):$(`#${item.target}`);
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
function editorialActions(collection,item) {
  if(item.status==='Rascunho')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:revisao">Enviar para revisão →</button>`;
  if(item.status==='Em revisão')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:publicar">Aprovar e publicar ✓</button><button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:recusar">Recusar ✕</button>`;
  if(item.status==='Recusado')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:reabrir">Reabrir como rascunho ↺</button>`;
  return '';
}
function editorialFooter(item) {
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
function renderAdmin() {
  const live=isLiveDataSource();
  const source=live?'Servidor conectado':hasLocalTeams()?'Alterações salvas neste navegador':'Base original do portal';
  const token=live?`<div class="admin-token-row"><label class="field">Token de administração<input type="password" id="admin-token" placeholder="Cole o token aqui" value="${e(getAdminToken())}"></label><button class="primary-btn" id="admin-token-save">Salvar token</button></div>`:'';
  $('#admin-view').innerHTML=`<div class="admin-overview"><div><span class="section-kicker">FONTE DOS DADOS</span><strong>${e(source)}</strong><p>${live?'As alterações são gravadas no servidor e compartilhadas.':'As alterações ficam neste navegador. Exporte o JSON para backup ou para atualizar a base publicada.'}</p></div><div class="admin-toolbar"><button class="primary-btn" id="admin-new-team">Nova equipe +</button><button class="secondary-btn" id="admin-export">Exportar JSON</button>${live?'':'<label class="secondary-btn admin-import">Importar JSON<input id="admin-import" type="file" accept="application/json,.json"></label>'}${hasLocalTeams()&&!live?'<button class="text-btn" id="admin-reset">Restaurar base original</button>':''}</div></div>${token}<div class="admin-team-list">${data.equipes.map(t=>`<article class="admin-team-card"><div><span class="team-code">${e(t.sigla||t.id)}</span><h3>${e(t.nome)}</h3><p>${e(t.descricao||'Sem descrição cadastrada.')}</p></div><div class="admin-team-meta"><strong>${(t.responsaveis||[]).length}</strong><span>colaborador(es)</span><button class="secondary-btn" data-admin-team="${e(t.id)}">Administrar</button></div></article>`).join('')}</div>`;
  $('#admin-new-team').onclick=openCreateTeam;
  $('#admin-export').onclick=exportTeams;
  const importInput=$('#admin-import');
  if(importInput)importInput.onchange=()=>importInput.files[0]&&importTeams(importInput.files[0]);
  const reset=$('#admin-reset');
  if(reset)reset.onclick=()=> { if(confirm('Descartar as alterações locais e restaurar a base original?')) { clearLocalTeams();location.reload(); } };
  const tokenSave=$('#admin-token-save');
  if(tokenSave)tokenSave.onclick=()=> { setAdminToken($('#admin-token').value.trim());notify('Token salvo neste navegador.');renderAdmin(); };
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
function openIdentityPicker(users) {
  const rows=users.map(u=>`<button class="identity-pick" data-user="${e(u.id)}"><img class="avatar" src="${e(safeURL(u.foto)||'assets/users/default.svg')}" alt=""><span><strong>${e(u.nome)}</strong><small>${e(u.cargo)} · ${e(u.equipe)}</small></span></button>`).join('');
  showDialog('Quem é você?','IDENTIFICAÇÃO',`<p>Escolha seu nome para personalizar o portal e assinar suas ações no Painel Editorial e na Administração. A escolha fica salva só neste navegador — não é um login corporativo.</p><div class="identity-list">${rows}</div>`);
  document.querySelectorAll('.identity-pick').forEach(btn=>btn.onclick=()=> {
    setStoredUserId(btn.dataset.user);
    location.reload();
  }
  );
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
    currentMenu=data.config.menu.filter(item=>hasAccess(currentUser,TARGET_ACCESS[item.target]||'conteudo'));
    initializeNavigation( {
      ...data.config,menu:currentMenu
    }
    ,navigate,openAccess);
    bindTabs('.tabs',tab=>renderContent(tab.dataset.tab));
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
    $('#switch-identity').onclick=()=>openIdentityPicker(data.usuarios);
    if(currentUser.perfil==='Visitante')openIdentityPicker(data.usuarios);
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
      const editorial=event.target.closest('[data-editorial]');
      if(editorial) {
        const [collection,id,action]=editorial.dataset.editorial.split(':');
        handleEditorialAction(collection,id,action);
      }
      const adminTeam=event.target.closest('[data-admin-team]');
      if(adminTeam)openEditTeam(adminTeam.dataset.adminTeam);
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

