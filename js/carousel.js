import { icon,escapeHTML as e,safeURL,comVersao,seloOrigem } from './ui.js?v=20260924-1';
// Carrossel de destaques da capa.
//
// Molde do slide (21/09/2026): o do usuário, desenhado no Figma em 2000×519
// (projeto/comunicados) — fundo em imagem ou degradê; até duas imagens de um
// lado; do outro, selo da origem + área, título, subtítulo, descrição e a ação.
// O texto é HTML, nunca pintado na imagem, para ser lido por leitor de tela,
// achado na busca e legível no celular. Os slides chegam prontos de
// js/destaques.js (destaque + o que ele herda do destino).
//
// Do formato do Conecta ficaram os cantos de 10 px, o deslizamento lateral de
// 0,5 s, as setas de 42 px e as bolinhas de 9 px.
//
// O slide inteiro é o alvo do clique: um link que estica sobre ele (abre em
// outra aba quando o destino é externo). Troca a cada 7 s; pausa com mouse ou
// foco em cima, pelo botão de pausa (WCAG 2.2.2) e não gira sozinho quando o
// sistema ou a preferência do portal pedem menos movimento.
const INTERVALO=7000;
const img=(src,classe,alt='')=>`<img class="${classe}" src="${e(comVersao(safeURL(src))||'')}" alt="${e(alt)}" loading="lazy">`;
// HTML de um slide; também serve à prévia do formulário de destaque.
//
// Formato "imagem" (o padrão; pedido do usuário em 21/09/2026): a imagem ocupa
// a altura toda do slide e se desfaz no fundo, que é ela mesma desfocada — cada
// slide ganha a cor da própria peça, sem ninguém escolher cor. Por cima, as
// listras finas do molde do Cronograma e um véu da cor do slide do lado do
// texto, que garante o contraste. Formato "molde": fundo próprio e a cena do
// Figma inteira na zona das imagens (até duas imagens).
export function slideHTML(item,i=0,total=1) {
  const lado=item.lado==='direita'?'direita':'esquerda';
  const estilo=`--dqb-fundo:${e(item.fundo||'#123a63')};--dqb-fundo-fim:${e(item.fundoFim||item.fundo||'#0b2743')}`;
  const molde=item.formato==='molde';
  const imagens=(item.imagens||[]).slice(0,molde?2:1);
  const ambiente=!molde&&!item.fundoImagem&&imagens[0];
  const classes=['dqb-slide',molde?'formato-molde':'formato-imagem',imagens.length?'':'sem-imagens',item.fundoImagem?'com-fundo':'',i?'':'ativo'].filter(Boolean).join(' ');
  const alvo=item.href
    ?`<a class="dqb-abrir" href="${e(item.href)}" data-index="${i}"${item.externo?' target="_blank" rel="noopener noreferrer"':` data-route="${e(item.href)}"`} tabindex="${i?'-1':'0'}" aria-label="${e(item.titulo)}${item.externo?' (abre em outra aba)':''}"></a>`
    :`<button type="button" class="dqb-abrir" data-index="${i}" tabindex="${i?'-1':'0'}" aria-label="${e(item.titulo)}"></button>`;
  const seta=icon(item.externo?'external':'chevron').replace('class="icon"',`class="icon ${item.externo?'ext':'dqb-acao-seta'}"`);
  return `<article class="${classes}" style="${estilo}" data-lado="${lado}" role="group" aria-roledescription="destaque" aria-label="${i+1} de ${total}"${i?' aria-hidden="true"':''}>
      ${ambiente?img(imagens[0],'dqb-ambiente'):''}
      ${item.fundoImagem?img(item.fundoImagem,'dqb-fundo'):''}
      ${imagens.length?`<div class="dqb-imagens">${imagens.map((src,k)=>img(src,`dqb-img dqb-img-${k+1}`,k?'':item.alt||'')).join('')}</div>`:''}
      <div class="dqb-texto">
        ${item.origem||item.rotulo?`<p class="dqb-rotulos">${seloOrigem(item.origem)}${item.rotulo?`<span class="dqb-rotulo">${e(item.rotulo)}</span>`:''}</p>`:''}
        <p class="dqb-titulo">${e(item.titulo)}</p>
        ${item.subtitulo?`<p class="dqb-subtitulo">${e(item.subtitulo)}</p>`:''}
        ${item.descricao?`<p class="dqb-descricao">${e(item.descricao)}</p>`:''}
        <span class="dqb-acao">${e(item.acao||'Abrir')}${seta}</span>
      </div>
      ${alvo}
    </article>`;
}
export function initCarousel(root,items,onOpen) {
  // Redesenhar (depois de salvar um destaque) desliga o carrossel anterior:
  // sem isso, os ouvintes e o temporizador se acumulariam.
  root._desligarCarrossel?.();
  if(!items.length) {
    root.hidden=true;
    root.innerHTML='';
    return;
  }
  root.hidden=false;
  const controle=new AbortController(),{signal}=controle;
  const ponto=(item,i)=>`<button type="button" data-dot="${i}" aria-label="Destaque ${i+1}: ${e(item.titulo)}"${i?'':' aria-current="true"'}></button>`;
  const seta=(lado,rotulo,giro)=>`<button type="button" class="dqb-seta dqb-${lado}" data-dq="${lado==='ant'?'prev':'next'}" aria-label="${rotulo}">${icon('chevron').replace('class="icon"',`class="icon dqb-${giro}"`)}</button>`;
  root.innerHTML=`<div class="dqb">
      <div class="dqb-trilho">${items.map((item,i)=>slideHTML(item,i,items.length)).join('')}</div>
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
    // Um trilho só, deslocado em passos de 100%: é o deslizamento lateral.
    trilho.style.transform=`translateX(-${atual*100}%)`;
    slides.forEach((slide,i)=> {
      const ativo=i===atual;
      slide.classList.toggle('ativo',ativo);
      slide.toggleAttribute('aria-hidden',!ativo);
      slide.querySelector('.dqb-abrir').tabIndex=ativo?0:-1;
    }
    );
    pontos.forEach((ponto,i)=>i===atual?ponto.setAttribute('aria-current','true'):ponto.removeAttribute('aria-current'));
    // Quem usa leitor de tela não vê as bolinhas: a posição vai por aqui.
    status.textContent=`Destaque ${atual+1} de ${items.length}: ${items[atual].titulo}`;
  }
  function agendar() {
    clearInterval(timer);
    if(!pausado&&!segurando&&!semMovimento()&&items.length>1)timer=setInterval(()=>mostrar(atual+1),INTERVALO);
  }
  root.addEventListener('click',event=> {
    // O link do slide segue sozinho (rota interna pelo `data-route`, externo
    // em outra aba); aqui só se registra o clique e se trata o destino sem
    // endereço (sistema com link a cadastrar).
    const abrir=event.target.closest('.dqb-abrir');
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
  , {
    signal
  }
  );
  ['mouseenter','focusin'].forEach(evento=>root.addEventListener(evento,()=> {
    segurando=true;
    agendar();
  }
  , {
    signal
  }
  ));
  ['mouseleave','focusout'].forEach(evento=>root.addEventListener(evento,event=> {
    if(event.type==='focusout'&&root.contains(event.relatedTarget))return;
    segurando=false;
    agendar();
  }
  , {
    signal
  }
  ));
  root._desligarCarrossel=()=> {
    controle.abort();
    clearInterval(timer);
  }
  ;
  // Com um destaque só, navegar não faz sentido.
  if(items.length<2)root.querySelectorAll('.dqb-seta,.dqb-pontos,.dqb-pausa').forEach(el=>el.hidden=true);
  mostrar(0);
  agendar();
}
