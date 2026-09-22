import { escapeHTML as e,icon,safeURL,comVersao } from './ui.js?v=20260922-1';

const DEFAULT_AVATAR='assets/users/default.svg';

function photo(value) {
  return comVersao(safeURL(value)||DEFAULT_AVATAR);
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

// Responsibilities are the same `responsabilidades` registered in Administração,
// looked up by the area's stable id — never by leader name, so swapping the
// leader never changes what a card's popover shows.
function responsibilitiesInfo(area) {
  const items=(area.responsabilidades||[]).map(item=>`<li>${e(item)}</li>`).join('');
  const panelId=`leader-popover-${area.id}`;
  return `<button type="button" class="leader-info-trigger" data-responsibilities-for="${e(area.id)}" aria-haspopup="true" aria-expanded="false" aria-controls="${e(panelId)}" aria-label="Responsabilidades de ${e(area.nome)}">${icon('info')}</button>
    <div class="leader-info-panel" id="${e(panelId)}" role="region" aria-label="Responsabilidades · ${e(area.nome)}">
      <p class="leader-info-title">Responsabilidades · ${e(area.nome)}</p>
      ${items?`<ul>${items}</ul>`:'<p class="leader-info-empty">Responsabilidades ainda não cadastradas</p>'}
    </div>`;
}

function branchCard(area) {
  const leader=leaderFor(area);
  const members=area.responsaveis.filter(person=>person.id!==area.liderId);
  const panelId=`team-members-${area.id}`;
  return `<article class="structure-branch" data-area-id="${e(area.id)}">
    <div class="leader-info">
      <button class="structure-leader" type="button" data-team-toggle="${e(area.id)}" aria-expanded="false" aria-controls="${e(panelId)}">
        <img class="structure-leader-avatar" src="${e(photo(leader.foto))}" alt="Foto de ${e(leader.nome)}" data-avatar-fallback>
        <span class="structure-leader-copy"><strong>${e(leader.nome)}</strong><span>${e(leader.cargo||'Cargo a cadastrar')}</span><small>${e(area.nome)}</small></span>
      </button>
      ${responsibilitiesInfo(area)}
    </div>
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
    <h1 class="sr-only">Estrutura das Equipes</h1>
    <div class="structure-toolbar">
      <p class="meta-label">Gerência de Contabilidade · visão da estrutura</p>
      <div class="structure-actions" aria-label="Controles do organograma"><button class="secondary-btn" id="expand-all-teams" type="button">Expandir todas</button><button class="secondary-btn" id="collapse-all-teams" type="button">Recolher todas</button></div>
    </div>
    <div class="structure-frame">
      <p class="structure-path">Gerência <span aria-hidden="true">→</span> Executivos(as) <span aria-hidden="true">→</span> Equipes</p>
      ${manager?`<div class="structure-management"><div class="leader-info"><article class="structure-manager-card"><img src="${e(photo(manager.foto))}" alt="Foto de ${e(manager.nome)}" data-avatar-fallback><div><strong>${e(manager.nome)}</strong>${manager.cargo?`<span>${e(manager.cargo)}</span>`:''}<small>Gerência de Contabilidade</small></div></article>${responsibilitiesInfo(management)}</div></div>`:'<p class="structure-empty">Gerência a cadastrar.</p>'}
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
  bindResponsibilitiesPopovers(root);
}

// Popover open state is tracked per card via three independent reasons —
// mouse hover, keyboard focus, and a pinned tap/click — so each input
// method can show or hide its own card without touching the others.
// This runs entirely separate from the [data-team-toggle] wiring above,
// keeping "Visualizar equipe" independent from the responsibilities popover.
const supportsHover=matchMedia('(hover:hover) and (pointer:fine)').matches;
const POPOVER_MARGIN=12;

function popoverIsOpen(frame) {
  return frame.classList.contains('hover-open')||frame.classList.contains('focus-open')||frame.classList.contains('pinned');
}

function positionPopover(trigger,panel) {
  const rect=trigger.getBoundingClientRect();
  const width=Math.min(280,window.innerWidth-POPOVER_MARGIN*2);
  panel.style.width=`${width}px`;
  let left=Math.max(POPOVER_MARGIN,Math.min(rect.left,window.innerWidth-width-POPOVER_MARGIN));
  let top=rect.bottom+8;
  let maxHeight=window.innerHeight-top-POPOVER_MARGIN;
  if(maxHeight<140&&rect.top-POPOVER_MARGIN>140) {
    top=null;
    maxHeight=rect.top-8-POPOVER_MARGIN;
  }
  panel.style.left=`${left}px`;
  panel.style.maxHeight=`${Math.max(120,maxHeight)}px`;
  if(top===null) {
    panel.style.bottom=`${window.innerHeight-rect.top+8}px`;
    panel.style.top='auto';
  }
  else {
    panel.style.top=`${top}px`;
    panel.style.bottom='auto';
  }
}

function updatePopover(frame,trigger,panel) {
  const open=popoverIsOpen(frame);
  trigger.setAttribute('aria-expanded',String(open));
  if(open)positionPopover(trigger,panel);
}

function closeAllPinned(root) {
  root.querySelectorAll('.leader-info.pinned').forEach(frame=> {
    frame.classList.remove('pinned');
    updatePopover(frame,frame.querySelector('.leader-info-trigger'),frame.querySelector('.leader-info-panel'));
  });
}

function bindResponsibilitiesPopovers(root) {
  root.querySelectorAll('.leader-info').forEach(frame=> {
    const trigger=frame.querySelector('.leader-info-trigger');
    const panel=frame.querySelector('.leader-info-panel');
    if(!trigger||!panel)return;
    if(supportsHover) {
      frame.addEventListener('mouseenter',()=> {
        frame.classList.add('hover-open');
        updatePopover(frame,trigger,panel);
      });
      frame.addEventListener('mouseleave',()=> {
        frame.classList.remove('hover-open');
        updatePopover(frame,trigger,panel);
      });
    }
    frame.addEventListener('focusin',()=> {
      frame.classList.add('focus-open');
      updatePopover(frame,trigger,panel);
    });
    frame.addEventListener('focusout',event=> {
      if(frame.contains(event.relatedTarget))return;
      frame.classList.remove('focus-open');
      updatePopover(frame,trigger,panel);
    });
    trigger.addEventListener('click',event=> {
      event.stopPropagation();
      const opening=!frame.classList.contains('pinned');
      closeAllPinned(root);
      // A tap that closes the card must win over lingering focus/hover —
      // touch devices keep focus on the tapped button across taps, so
      // dropping only "pinned" would leave the popover stuck open.
      if(opening)frame.classList.add('pinned');
      else frame.classList.remove('pinned','focus-open','hover-open');
      updatePopover(frame,trigger,panel);
    });
  });
  if(!root.dataset.popoverGlobalBound) {
    root.dataset.popoverGlobalBound='1';
    document.addEventListener('click',event=> {
      // A pinned popover only closes for a click truly outside its card —
      // a click on that same card's own "Visualizar equipe"/members keeps
      // the popover as-is, so the two controls stay fully independent.
      root.querySelectorAll('.leader-info.pinned').forEach(frame=> {
        const card=frame.closest('.structure-branch,.structure-management')||frame;
        if(card.contains(event.target))return;
        frame.classList.remove('pinned');
        updatePopover(frame,frame.querySelector('.leader-info-trigger'),frame.querySelector('.leader-info-panel'));
      });
    });
    document.addEventListener('keydown',event=> {
      if(event.key!=='Escape')return;
      const openFrame=[...root.querySelectorAll('.leader-info')].find(popoverIsOpen);
      if(!openFrame)return;
      openFrame.classList.remove('hover-open','focus-open','pinned');
      updatePopover(openFrame,openFrame.querySelector('.leader-info-trigger'),openFrame.querySelector('.leader-info-panel'));
      if(openFrame.contains(document.activeElement))document.activeElement.blur();
    });
    window.addEventListener('resize',()=>root.querySelectorAll('.leader-info').forEach(frame=> {
      if(popoverIsOpen(frame))positionPopover(frame.querySelector('.leader-info-trigger'),frame.querySelector('.leader-info-panel'));
    }));
    window.addEventListener('scroll',()=>root.querySelectorAll('.leader-info').forEach(frame=> {
      if(popoverIsOpen(frame))positionPopover(frame.querySelector('.leader-info-trigger'),frame.querySelector('.leader-info-panel'));
    }),true);
  }
}

