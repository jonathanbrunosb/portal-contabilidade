import { icon,escapeHTML as e,safeURL,comVersao } from './ui.js?v=20260921-13';
// Carrossel de destaques da capa, no formato do Conecta
// (portaldeservicos.equatorialenergia.com.br/esc), medido em 21/09/2026 a
// pedido do usuário: faixa **larga e baixa** (proporção 3,125 — lá são
// 2103×673), cantos de 10 px, troca por deslizamento horizontal de 0,5 s
// `ease-in-out`, setas redondas de 42 px a 15 px das bordas e bolinhas de
// 9 px centralizadas no rodapé.
//
// A diferença é o conteúdo: no Conecta os dizeres vêm pintados dentro do
// banner. Os nossos destaques são notícia com foto, então cada slide é
// partido — imagem de um lado, texto do outro — sobre um fundo tirado da
// própria imagem (`fundo`/`fundoFim` em data/destaques.json). Sem isso o
// texto ficaria solto num retângulo branco ao lado da foto.
//
// Troca a cada 7 s; pausa com mouse ou foco em cima, pelo botão de pausa
// (WCAG 2.2.2) e não gira sozinho quando o sistema ou a preferência do portal
// pedem menos movimento.
const INTERVALO=7000;
export function initCarousel(root,items,onOpen) {
  if(!items.length) {
    root.hidden=true;
    return;
  }
  const slide=(item,i)=> {
    const lado=item.lado==='direita'?'direita':'esquerda';
    const estilo=`--dqb-fundo:${e(item.fundo||'#123a63')};--dqb-fundo-fim:${e(item.fundoFim||'#0b2743')}`;
    return `<article class="dqb-slide${i?'':' ativo'}" style="${estilo}" data-lado="${lado}" role="group" aria-roledescription="destaque" aria-label="${i+1} de ${items.length}"${i?' aria-hidden="true"':''}>
      <div class="dqb-arte"><img src="${e(comVersao(safeURL(item.imagem))||'')}" alt="${e(item.alt||item.titulo)}"></div>
      <div class="dqb-texto">
        <p class="dqb-categoria">${e(item.categoria||'Destaque')}</p>
        <p class="dqb-titulo">${e(item.titulo)}</p>
        <p class="dqb-resumo">${e(item.resumo||'')}</p>
        <span class="dqb-acao">${e(item.acao||'Abrir destaque')}${icon('chevron').replace('class="icon"','class="icon dqb-acao-seta"')}</span>
      </div>
      <button type="button" class="dqb-abrir" data-index="${i}" tabindex="${i?'-1':'0'}" aria-label="Abrir destaque: ${e(item.titulo)}"></button>
    </article>`;
  }
  ;
  const ponto=(item,i)=>`<button type="button" data-dot="${i}" aria-label="Destaque ${i+1}: ${e(item.titulo)}"${i?'':' aria-current="true"'}></button>`;
  const seta=(lado,rotulo,giro)=>`<button type="button" class="dqb-seta dqb-${lado}" data-dq="${lado==='ant'?'prev':'next'}" aria-label="${rotulo}">${icon('chevron').replace('class="icon"',`class="icon dqb-${giro}"`)}</button>`;
  root.innerHTML=`<div class="dqb">
      <div class="dqb-trilho">${items.map(slide).join('')}</div>
      ${seta('ant','Destaque anterior','prev')}${seta('prox','Próximo destaque','next')}
      <div class="dqb-pontos" role="group" aria-label="Escolher destaque">${items.map(ponto).join('')}</div>
      <button type="button" class="dqb-pausa" data-dq="pause" aria-pressed="false" aria-label="Pausar destaques"><span class="dqb-pausa-icone" aria-hidden="true"></span></button>
    </div>
    <p class="sr-only" role="status" aria-live="polite"></p>`;
  const trilho=root.querySelector('.dqb-trilho');
  const slides=[...root.querySelectorAll('.dqb-slide')],pontos=[...root.querySelectorAll('[data-dot]')];
  const status=root.querySelector('[role="status"]'),pauseBtn=root.querySelector('[data-dq="pause"]');
  let atual=0,timer=null,pausado=false,segurando=false;
  const semMovimento=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('no-motion');
  function mostrar(n) {
    atual=(n+items.length)%items.length;
    // Um trilho so, deslocado em passos de 100%: e o que da o deslizamento
    // lateral do Conecta, no lugar do esmaecimento que havia antes.
    trilho.style.transform=`translateX(-${atual*100}%)`;
    slides.forEach((slide,i)=> {
      const ativo=i===atual;
      slide.classList.toggle('ativo',ativo);
      slide.toggleAttribute('aria-hidden',!ativo);
      slide.querySelector('.dqb-abrir').tabIndex=ativo?0:-1;
    }
    );
    pontos.forEach((ponto,i)=>i===atual?ponto.setAttribute('aria-current','true'):ponto.removeAttribute('aria-current'));
    // Quem usa leitor de tela nao ve as bolinhas: a posicao vai por aqui.
    status.textContent=`Destaque ${atual+1} de ${items.length}: ${items[atual].titulo}`;
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
    const ponto=event.target.closest('[data-dot]');
    if(ponto)mostrar(Number(ponto.dataset.dot));
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
  }
  );
  ['mouseenter','focusin'].forEach(evento=>root.addEventListener(evento,()=> {
    segurando=true;
    agendar();
  }
  ));
  ['mouseleave','focusout'].forEach(evento=>root.addEventListener(evento,event=> {
    if(event.type==='focusout'&&root.contains(event.relatedTarget))return;
    segurando=false;
    agendar();
  }
  ));
  // Com um destaque so, navegar nao faz sentido.
  if(items.length<2)root.querySelectorAll('.dqb-seta,.dqb-pontos,.dqb-pausa').forEach(el=>el.hidden=true);
  mostrar(0);
  agendar();
}
