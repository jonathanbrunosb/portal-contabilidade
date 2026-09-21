import { icon,escapeHTML as e } from './ui.js?v=20260921-49';
// Menu embutido na base da faixa do cabeçalho: uma seção por item, com ícone
// e **sem submenu suspenso**. Clicar leva direto à primeira página da seção; as
// demais aparecem na faixa de subpáginas, em abas — o mesmo caminho que
// Documentos & Normas já fazia. No celular, o botão "Menu" abre a mesma lista.
// `sections` já chega filtrado por perfil; cada página é um destino do portal
// ({target, tab?, view?, adminTab?, grupo?}) entregue a onSelect.
const desktop=matchMedia('(min-width:1001px)');
export function initializeNavigation({sections},{onSelect,hashOf}) {
  const nav=document.querySelector('#navigation'),bar=document.querySelector('#main-nav'),toggle=document.querySelector('#menu-toggle');
  const destinos=[],paginasPorSecao=[];
  nav.innerHTML=sections.map(section=>{
    const paginas=section.paginas||section.itens||[];
    const destino=section.target?section:paginas[0];
    if(!destino)return '';
    destinos.push(destino);
    paginasPorSecao.push(paginas.length?paginas:[destino]);
    return `<li><a class="ph-top" href="${e(hashOf(destino))}" data-nav="${destinos.length-1}">${icon(section.icon)}<span>${e(section.label)}</span></a></li>`;
  }).join('');
  nav.targets=destinos;
  nav.secoes=paginasPorSecao;
  toggle.innerHTML=`${icon('menu')}<span>Menu</span>`;

  const setMobile=openState=> {
    bar.classList.toggle('open',openState);
    toggle.setAttribute('aria-expanded',String(openState));
  }
  ;
  toggle.onclick=()=>setMobile(!bar.classList.contains('open'));
  desktop.addEventListener('change',()=>setMobile(false));

  nav.addEventListener('click',event=> {
    const dest=event.target.closest('[data-nav]');
    if(!dest)return;
    event.preventDefault();
    setMobile(false);
    onSelect(destinos[Number(dest.dataset.nav)]);
  }
  );

  // Menu do usuário (Bem-vindo): troca de identificação, preferências e alertas.
  const userBtn=document.querySelector('#top-user'),userMenu=document.querySelector('#user-menu');
  const setUser=state=> {
    userMenu.hidden=!state;
    userBtn.setAttribute('aria-expanded',String(state));
  }
  ;
  userBtn.onclick=()=>setUser(userMenu.hidden);
  userMenu.addEventListener('click',event=>{if(event.target.closest('button'))setUser(false);});
  userMenu.addEventListener('keydown',event=>{if(event.key==='Escape'){setUser(false);userBtn.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.ph-user-wrap'))setUser(false);});
}
// Marca como atual (aria-current) a seção que contém o destino aberto.
export function markCurrentSection(matches) {
  const nav=document.querySelector('#navigation'),secoes=nav.secoes||[];
  nav.querySelectorAll(':scope > li').forEach(li=>{
    const top=li.querySelector('.ph-top');
    const i=Number(top?.dataset.nav);
    const hit=top&&(secoes[i]||[]).some(matches);
    if(hit)top.setAttribute('aria-current','page');else top?.removeAttribute('aria-current');
  });
}
// WAI-ARIA keyboard pattern for both tab groups.
export function bindTabs(selector,callback) {
  const list=document.querySelector(selector);
  list.addEventListener('click',event=> {
    const tab=event.target.closest('[role=tab]');
    if(tab)callback(tab);
  }
  );
  list.addEventListener('keydown',event=> {
    const tabs=[...list.querySelectorAll('[role=tab]')];
    let index=tabs.indexOf(document.activeElement);
    if(index<0)return;
    if(event.key==='ArrowRight')index=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')index=(index-1+tabs.length)%tabs.length;
    else if(event.key==='Home')index=0;
    else if(event.key==='End')index=tabs.length-1;
    else return;
    event.preventDefault();
    tabs[index].focus();
    callback(tabs[index]);
  }
  );
}
export function selectTab(selector,selected) {
  document.querySelectorAll(`${selector} [role=tab]`).forEach(tab=> {
    const active=tab===selected;
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  }
  );
}

