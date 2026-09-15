import { escapeHTML as e,icon,safeURL } from './ui.js';

const DEFAULT_AVATAR='assets/users/default.svg';

function photo(value) {
  return safeURL(value)||DEFAULT_AVATAR;
}

function leaderFor(area) {
  return area.responsaveis.find(person=>person.id===area.liderId)||area.responsaveis[0]||{
    nome:area.lider||'Liderança a cadastrar',cargo:'Cargo a cadastrar',foto:DEFAULT_AVATAR
  };
}

function memberCard(member,area) {
  return `<li class="structure-member">
    <img class="structure-member-avatar" src="${e(photo(member.foto))}" alt="Foto de ${e(member.nome||'integrante')}" data-avatar-fallback>
    <span class="structure-member-copy"><strong>${e(member.nome||'A cadastrar')}</strong><span>${e(area.nome)} · ${e(member.cargo||'Cargo a cadastrar')}</span></span>
  </li>`;
}

function validatedAreaDetails(area) {
  if(!area.dadosAreaValidados)return '';
  const responsibilities=(area.responsabilidades||[]).map(item=>`<li>${e(item)}</li>`).join('');
  const companies=(area.empresas||[]).map(item=>`<li>${e(item)}</li>`).join('');
  if(!responsibilities&&!companies)return '';
  return `<div class="structure-area-details">
    ${responsibilities?`<div><strong>Responsabilidades</strong><ul>${responsibilities}</ul></div>`:''}
    ${companies?`<div><strong>Empresas atendidas</strong><ul>${companies}</ul></div>`:''}
  </div>`;
}

function branchCard(area) {
  const leader=leaderFor(area);
  const members=area.responsaveis.filter(person=>person.id!==area.liderId);
  const panelId=`team-members-${area.id}`;
  return `<article class="structure-branch" data-area-id="${e(area.id)}">
    <button class="structure-leader" type="button" data-team-toggle="${e(area.id)}" aria-expanded="false" aria-controls="${e(panelId)}">
      <img class="structure-leader-avatar" src="${e(photo(leader.foto))}" alt="Foto de ${e(leader.nome)}" data-avatar-fallback>
      <span class="structure-leader-copy"><strong>${e(leader.nome)}</strong><span>${e(leader.cargo||'Cargo a cadastrar')}</span><small>${e(area.nome)}</small></span>
    </button>
    ${validatedAreaDetails(area)}
    <button class="structure-toggle" type="button" data-team-toggle="${e(area.id)}" aria-expanded="false" aria-controls="${e(panelId)}"><span>Visualizar equipe</span>${icon('chevron')}</button>
    <div class="structure-members" id="${e(panelId)}" hidden>
      <p class="structure-members-title">Integrantes</p>
      ${members.length?`<ul>${members.map(member=>memberCard(member,area)).join('')}</ul>`:'<p class="structure-empty">Nenhum integrante cadastrado nesta área.</p>'}
    </div>
  </article>`;
}

function setExpanded(root,areaId,expanded) {
  const controls=[...root.querySelectorAll(`[data-team-toggle="${areaId}"]`)];
  const panel=root.querySelector(`#team-members-${areaId}`);
  controls.forEach(control=>control.setAttribute('aria-expanded',String(expanded)));
  const label=controls.find(control=>control.classList.contains('structure-toggle'))?.querySelector('span');
  if(label)label.textContent=expanded?'Recolher equipe':'Visualizar equipe';
  if(panel)panel.hidden=!expanded;
}

export function renderTeamStructure(areas) {
  const root=document.querySelector('#teams-structure');
  const management=areas.find(area=>area.tipo==='gerencia'||area.id==='gerencia');
  const branches=areas.filter(area=>area!==management);
  const manager=management?leaderFor(management):null;
  root.innerHTML=`
    <div class="structure-toolbar">
      <div><span class="section-kicker">PESSOAS & LIDERANÇA</span><h1>Estrutura das Equipes</h1><p>Gerência de Contabilidade · visão da estrutura</p></div>
      <div class="structure-actions" aria-label="Controles do organograma"><button class="secondary-btn" id="expand-all-teams" type="button">Expandir todas</button><button class="secondary-btn" id="collapse-all-teams" type="button">Recolher todas</button></div>
    </div>
    <div class="structure-frame">
      <p class="structure-path">Gerência <span aria-hidden="true">→</span> Executivos(as) <span aria-hidden="true">→</span> Equipes</p>
      ${manager?`<div class="structure-management"><article class="structure-manager-card"><img src="${e(photo(manager.foto))}" alt="Foto de ${e(manager.nome)}" data-avatar-fallback><div><strong>${e(manager.nome)}</strong><span>${e(manager.cargo||'Cargo a cadastrar')}</span><small>Gerência de Contabilidade</small></div></article></div>`:'<p class="structure-empty">Gerência a cadastrar.</p>'}
      <div class="structure-branches">${branches.map(branchCard).join('')}</div>
    </div>`;

  root.querySelectorAll('[data-avatar-fallback]').forEach(image=>image.addEventListener('error',()=> {
    image.src=DEFAULT_AVATAR;
  },{once:true}));
  root.querySelectorAll('[data-team-toggle]').forEach(control=>control.addEventListener('click',()=> {
    setExpanded(root,control.dataset.teamToggle,control.getAttribute('aria-expanded')!=='true');
  }));
  root.querySelector('#expand-all-teams').addEventListener('click',()=>branches.forEach(area=>setExpanded(root,area.id,true)));
  root.querySelector('#collapse-all-teams').addEventListener('click',()=>branches.forEach(area=>setExpanded(root,area.id,false)));
}

