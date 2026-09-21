import { icon,escapeHTML as e,safeURL,comVersao } from './ui.js?v=20260920-44';
// Carrossel de destaques da capa (16:9). Troca a cada 7 s; pausa com mouse ou
// foco em cima, pelo botão de pausa (WCAG 2.2.2) e não gira sozinho quando o
// sistema ou a preferência do portal pedem menos movimento.
const INTERVALO=7000;
export function initCarousel(root,items,onOpen) {
  if(!items.length) {
    root.hidden=true;
    return;
  }
  root.innerHTML=`<div class="dq-frame" aria-live="off">${items.map((item,i)=>`<div class="dq-slide${i?'':' on'}" role="group" aria-roledescription="destaque" aria-label="${i+1} de ${items.length}"${i?' aria-hidden="true"':''}><button type="button" class="dq-open" data-index="${i}" tabindex="${i?'-1':'0'}"><img src="${e(comVersao(safeURL(item.imagem))||'')}" alt="${e(item.alt||item.titulo)}"></button></div>`).join('')}</div>
    <div class="dq-bar">
      <div class="dq-caption" aria-live="polite"></div>
      <div class="dq-controls">
        <button type="button" class="dq-btn" data-dq="prev" aria-label="Destaque anterior">${icon('chevron').replace('class="icon"','class="icon dq-prev"')}</button>
        <div class="dq-dots" role="group" aria-label="Escolher destaque">${items.map((item,i)=>`<button type="button" data-dot="${i}" aria-label="Destaque ${i+1}: ${e(item.titulo)}"${i?'':' aria-current="true"'}></button>`).join('')}</div>
        <button type="button" class="dq-btn" data-dq="next" aria-label="Próximo destaque">${icon('chevron').replace('class="icon"','class="icon dq-next"')}</button>
        <button type="button" class="dq-btn" data-dq="pause" aria-pressed="false" aria-label="Pausar destaques"><span class="dq-pause-icon" aria-hidden="true"></span></button>
      </div>
    </div>`;
  const slides=[...root.querySelectorAll('.dq-slide')],dots=[...root.querySelectorAll('[data-dot]')];
  const caption=root.querySelector('.dq-caption'),pauseBtn=root.querySelector('[data-dq="pause"]');
  let atual=0,timer=null,pausado=false,segurando=false;
  const semMovimento=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('no-motion');
  function mostrar(n) {
    atual=(n+items.length)%items.length;
    slides.forEach((slide,i)=> {
      const ativo=i===atual;
      slide.classList.toggle('on',ativo);
      slide.toggleAttribute('aria-hidden',!ativo);
      slide.querySelector('.dq-open').tabIndex=ativo?0:-1;
    });
    dots.forEach((dot,i)=>i===atual?dot.setAttribute('aria-current','true'):dot.removeAttribute('aria-current'));
    const item=items[atual];
    caption.innerHTML=`<button type="button" class="dq-title" data-index="${atual}">${e(item.titulo)}</button><small>${e(item.categoria||'Destaque')} · ${atual+1} de ${items.length}</small>`;
  }
  function agendar() {
    clearInterval(timer);
    if(!pausado&&!segurando&&!semMovimento()&&items.length>1)timer=setInterval(()=>mostrar(atual+1),INTERVALO);
  }
  root.addEventListener('click',event=> {
    const abrir=event.target.closest('[data-index]');
    if(abrir) {
      onOpen(items[Number(abrir.dataset.index)]);
      return;
    }
    const dot=event.target.closest('[data-dot]');
    if(dot)mostrar(Number(dot.dataset.dot));
    const acao=event.target.closest('[data-dq]')?.dataset.dq;
    if(acao==='prev')mostrar(atual-1);
    if(acao==='next')mostrar(atual+1);
    if(acao==='pause') {
      pausado=!pausado;
      pauseBtn.setAttribute('aria-pressed',String(pausado));
      pauseBtn.setAttribute('aria-label',pausado?'Retomar destaques':'Pausar destaques');
      pauseBtn.classList.toggle('paused',pausado);
    }
    agendar();
  });
  ['mouseenter','focusin'].forEach(evento=>root.addEventListener(evento,()=> {
    segurando=true;
    agendar();
  }));
  ['mouseleave','focusout'].forEach(evento=>root.addEventListener(evento,event=> {
    if(event.type==='focusout'&&root.contains(event.relatedTarget))return;
    segurando=false;
    agendar();
  }));
  if(items.length<2)root.querySelector('.dq-controls').hidden=true;
  mostrar(0);
  agendar();
}
