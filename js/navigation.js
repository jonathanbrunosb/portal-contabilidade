import { icon,escapeHTML as e } from './ui.js';
export function initializeNavigation(config,onNavigate,onAccess) {
  document.querySelector('#navigation').innerHTML=`<p class="nav-label">PORTAL</p>${config.menu.map((item,i)=>`<a class="nav-link ${i===0?'active':''}" href="#${e(item.target)}" data-menu-index="${i}">${icon(item.icon)}<span>${e(item.label)}</span></a>`).join('')}<p class="nav-label">ACESSOS RÁPIDOS</p>${config.links.map((item,i)=>`<button class="nav-link" data-access="${i}">${icon(item.icon)}<span>${e(item.nome)}</span>${item.target?'':'<span class="external" aria-hidden="true">↗</span>'}</button>`).join('')}`;
  document.querySelector('#menu-toggle').innerHTML=icon('menu');
  const sidebar=document.querySelector('#sidebar'),scrim=document.querySelector('#scrim'),toggle=document.querySelector('#menu-toggle');
  function menu(open,restore=true) {
    sidebar.inert=!open&&!matchMedia('(min-width:1001px)').matches;
    sidebar.classList.toggle('open',open);
    scrim.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    document.body.style.overflow=open?'hidden':'';
    if(open)document.querySelector('#close-menu').focus();
    else if(restore)toggle.focus();
  }
  toggle.onclick=()=>menu(!sidebar.classList.contains('open'));
  document.querySelector('#close-menu').onclick=()=>menu(false);
  scrim.onclick=()=>menu(false);
  document.addEventListener('keydown',event=> {
    if(!sidebar.classList.contains('open'))return;
    if(event.key==='Escape') {
      menu(false);
      return;
    }
    if(event.key==='Tab') {
      const focusables=[...sidebar.querySelectorAll('a,button')].filter(el=>el.offsetParent!==null);
      const first=focusables[0],last=focusables.at(-1);
      if(event.shiftKey&&document.activeElement===first) {
        event.preventDefault();
        last.focus();
      }
      else if(!event.shiftKey&&document.activeElement===last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  );
  const mq=matchMedia('(min-width:1001px)');
  mq.addEventListener('change',()=> {
    menu(false,false);
  }
  );
  sidebar.inert=!mq.matches;
  document.querySelector('#navigation').addEventListener('click',event=> {
    const link=event.target.closest('.nav-link');
    if(!link)return;
    const wasOpen=sidebar.classList.contains('open');
    menu(false,false);
    if(link.dataset.access!==undefined) {
      onAccess(config.links[Number(link.dataset.access)]);
      return;
    }
    event.preventDefault();
    document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el===link));
    onNavigate(config.menu[Number(link.dataset.menuIndex)]);
    if(wasOpen)document.querySelector('#main').focus( {
      preventScroll:true
    }
    );
  }
  );
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

