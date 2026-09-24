import { escapeHTML as e,normalize,icon } from './ui.js?v=20260924-1';
// Busca do cabeçalho (refeita em 22/09/2026, pedido do usuário: "quando o
// usuário digitar, deve aparecer abaixo a lista dos itens sugeridos"). Antes,
// os resultados apareciam abaixo do carrossel, fora da tela, e cada registro
// era comparado como JSON inteiro — "link" achava 59 itens pelo nome do campo.
//
// Este módulo não conhece as coleções: recebe um índice de entradas montado
// pelo app.js ({grupo, titulo, detalhe, resumo, origem, icone, texto, peso,
// acao}) e cuida da pontuação, do destaque e da caixa de sugestões (padrão
// combobox da WAI-ARIA: o foco fica no campo e as setas movem a opção ativa).

// Palavras que não ajudam a achar nada; saem da consulta (a menos que ela seja
// só isso) e não ganham destaque.
const PALAVRAS_VAZIAS=new Set(['a','o','as','os','de','da','do','das','dos','e','em','no','na','nos','nas','para','por','com','um','uma','ao']);
export const MINIMO_CARACTERES=2;
export function termosDe(consulta) {
  const todos=normalize(consulta).split(/\s+/).filter(Boolean);
  const uteis=todos.filter(termo=>!PALAVRAS_VAZIAS.has(termo));
  return uteis.length?uteis:todos;
}
const escaparRegex=texto=>texto.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const inicioDePalavra=(texto,termo)=>new RegExp(`(^|[^a-z0-9])${escaparRegex(termo)}`).test(texto);
// Todos os termos precisam aparecer (no título ou no resto). O título vale
// mais: igual à consulta, começando por ela, com ela no início de uma palavra,
// com todos os termos… e só depois o que bate apenas no texto de apoio.
function pontuar(entrada,termos,frase) {
  const titulo=entrada.tituloN,resto=entrada.textoN;
  if(!termos.every(termo=>titulo.includes(termo)||resto.includes(termo)))return 0;
  let pontos;
  if(titulo===frase)pontos=100;
  else if(titulo.startsWith(frase))pontos=85;
  else if(inicioDePalavra(titulo,frase))pontos=75;
  else if(titulo.includes(frase))pontos=65;
  else {
    const noTitulo=termos.filter(termo=>titulo.includes(termo)).length;
    const noInicio=termos.filter(termo=>inicioDePalavra(titulo,termo)).length;
    pontos=noTitulo===termos.length?55+noInicio:20+noTitulo*8+noInicio*4;
  }
  return pontos+(entrada.peso||0);
}
// Prepara o índice (texto normalizado uma vez só) e devolve uma função de busca.
export function prepararIndice(entradas) {
  const lista=entradas.map(entrada=>({...entrada,tituloN:normalize(entrada.titulo).trim(),textoN:normalize(entrada.texto||'')}));
  return consulta=> {
    const frase=normalize(consulta).trim().replace(/\s+/g,' ');
    if(frase.length<MINIMO_CARACTERES)return [];
    const termos=termosDe(consulta);
    return lista.map(entrada=>({entrada,pontos:pontuar(entrada,termos,frase)}))
      .filter(r=>r.pontos>0)
      .sort((a,b)=>b.pontos-a.pontos||a.entrada.titulo.localeCompare(b.entrada.titulo,'pt-BR'))
      .map(r=>r.entrada);
  };
}
// Agrupa na ordem em que cada grupo aparece pela primeira vez no ranking: o
// grupo do melhor resultado vem primeiro.
export function agrupar(resultados,{porGrupo=Infinity,total=Infinity}={}) {
  const grupos=new Map();
  let usados=0;
  for(const entrada of resultados) {
    if(usados>=total)break;
    if(!grupos.has(entrada.grupo))grupos.set(entrada.grupo,[]);
    const itens=grupos.get(entrada.grupo);
    if(itens.length>=porGrupo)continue;
    itens.push(entrada);
    usados++;
  }
  return [...grupos].map(([grupo,itens])=>({grupo,itens})).filter(g=>g.itens.length);
}
// Marca no texto original (com acento e maiúscula) os trechos que batem com os
// termos normalizados: um mapa liga cada letra normalizada à letra de origem.
export function destacar(texto,termos) {
  const original=String(texto??'');
  const uteis=(termos||[]).filter(termo=>termo&&!PALAVRAS_VAZIAS.has(termo));
  if(!uteis.length)return e(original);
  let normalizado='';
  const origem=[];
  for(let i=0;i<original.length;i++) {
    for(const letra of normalize(original[i])) {
      normalizado+=letra;
      origem.push(i);
    }
  }
  const marcado=new Array(original.length).fill(false);
  for(const termo of uteis) {
    for(let k=normalizado.indexOf(termo);k!==-1;k=normalizado.indexOf(termo,k+termo.length)) {
      for(let j=k;j<k+termo.length;j++)marcado[origem[j]]=true;
    }
  }
  let html='',aberto=false;
  for(let i=0;i<original.length;i++) {
    if(marcado[i]!==aberto) {
      html+=marcado[i]?'<mark>':'</mark>';
      aberto=marcado[i];
    }
    html+=e(original[i]);
  }
  return aberto?`${html}</mark>`:html;
}
// Endereço de uma entrada: rota interna, link externo (nova aba) ou "#" quando
// a ação é abrir uma ficha.
export function atributosDoLink(entrada) {
  const acao=entrada.acao||{};
  if(acao.tipo==='externo')return `href="${e(acao.url)}" target="_blank" rel="noopener noreferrer"`;
  return `href="${e(acao.href||'#')}"`;
}
const iconeExterno=()=>icon('external').replace('class="icon"','class="icon ext"');

// ===== Caixa de sugestões =====
// `buscar(consulta)` devolve as entradas em ordem; `executar(entrada, evento)`
// leva ao destino; `verTodos(consulta)` abre a página de resultados.
export function ligarBuscaTopo({form,campo,buscar,executar,verTodos,porGrupo=3,total=8}) {
  const painel=document.createElement('div');
  painel.className='ph-sugestoes';
  painel.hidden=true;
  painel.innerHTML='<div class="ph-sugestoes-lista" id="busca-sugestoes" role="listbox" aria-label="Sugestões da busca"></div><p class="ph-sugestoes-vazio" hidden></p>';
  const status=document.createElement('p');
  status.className='sr-only';
  status.setAttribute('role','status');
  form.append(painel,status);
  const lista=painel.querySelector('[role="listbox"]'),vazio=painel.querySelector('.ph-sugestoes-vazio');
  campo.setAttribute('role','combobox');
  campo.setAttribute('aria-autocomplete','list');
  campo.setAttribute('aria-controls','busca-sugestoes');
  campo.setAttribute('aria-expanded','false');
  let opcoes=[],ativa=-1,consultaAtual='';

  function fechar() {
    painel.hidden=true;
    campo.setAttribute('aria-expanded','false');
    campo.removeAttribute('aria-activedescendant');
    ativa=-1;
  }
  function marcar(indice) {
    opcoes.forEach((op,i)=>op.el.setAttribute('aria-selected',String(i===indice)));
    ativa=indice;
    if(indice<0) {
      campo.removeAttribute('aria-activedescendant');
      return;
    }
    campo.setAttribute('aria-activedescendant',opcoes[indice].el.id);
    opcoes[indice].el.scrollIntoView({block:'nearest'});
  }
  function abrir(consulta) {
    consultaAtual=consulta;
    const frase=consulta.trim();
    if(normalize(frase).length<MINIMO_CARACTERES) {
      fechar();
      status.textContent='';
      return;
    }
    const resultados=buscar(frase);
    const termos=termosDe(frase);
    const grupos=agrupar(resultados,{porGrupo,total});
    let n=0;
    const opcao=entrada=>`<a class="ph-sugestao" role="option" id="busca-op-${n}" data-op="${n++}" aria-selected="false" tabindex="-1" ${atributosDoLink(entrada)}>${icon(entrada.icone||'file')}<span class="ph-sugestao-texto"><span class="ph-sugestao-titulo">${destacar(entrada.titulo,termos)}</span>${entrada.detalhe?`<span class="ph-sugestao-detalhe">${e(entrada.detalhe)}</span>`:''}</span>${entrada.acao?.tipo==='externo'?iconeExterno():''}</a>`;
    const blocos=grupos.map((g,i)=>`<div role="group" aria-labelledby="busca-grupo-${i}"><p class="ph-sugestoes-grupo" id="busca-grupo-${i}" role="presentation">${e(g.grupo)}</p>${g.itens.map(opcao).join('')}</div>`).join('');
    const todos=resultados.length?`<a class="ph-sugestao ph-sugestao-todos" role="option" id="busca-op-${n}" data-op="${n}" aria-selected="false" tabindex="-1" href="#busca/${e(encodeURIComponent(frase))}">${icon('search')}<span class="ph-sugestao-texto"><span class="ph-sugestao-titulo">Ver ${resultados.length===1?'o resultado':`todos os ${resultados.length} resultados`} para “${e(frase)}”</span></span></a>`:'';
    lista.innerHTML=blocos+todos;
    const entradas=grupos.flatMap(g=>g.itens);
    opcoes=[...lista.querySelectorAll('[role="option"]')].map((el,i)=>({el,entrada:entradas[i]||null}));
    vazio.hidden=resultados.length>0;
    vazio.innerHTML=resultados.length?'':`Nada encontrado para “${e(frase)}”. Procure pelo nome de um sistema, portal ou automação, uma transação SAP, uma norma, um comunicado ou uma pessoa.`;
    painel.hidden=false;
    campo.setAttribute('aria-expanded','true');
    marcar(-1);
    status.textContent=resultados.length?`${resultados.length} ${resultados.length===1?'resultado':'resultados'}; use as setas para escolher`:'Nenhum resultado';
  }
  // Clique (ou Enter, que clica na opção ativa): link externo segue sozinho
  // para a nova aba; o resto é tratado aqui.
  lista.addEventListener('click',evento=> {
    const el=evento.target.closest('[role="option"]');
    if(!el)return;
    const op=opcoes[Number(el.dataset.op)];
    fechar();
    if(!op?.entrada) {
      evento.preventDefault();
      verTodos(consultaAtual.trim());
      return;
    }
    if(op.entrada.acao?.tipo!=='externo')evento.preventDefault();
    executar(op.entrada,{consulta:consultaAtual.trim()});
  }
  );
  // O clique não tira o foco do campo (senão a caixa fecharia antes do clique).
  painel.addEventListener('mousedown',evento=>evento.preventDefault());
  lista.addEventListener('mousemove',evento=> {
    const el=evento.target.closest('[role="option"]');
    if(el&&Number(el.dataset.op)!==ativa)marcar(Number(el.dataset.op));
  }
  );
  campo.addEventListener('input',()=>abrir(campo.value));
  campo.addEventListener('focus',()=> {
    if(campo.value.trim())abrir(campo.value);
  }
  );
  campo.addEventListener('keydown',evento=> {
    const aberta=!painel.hidden&&opcoes.length;
    if(evento.key==='ArrowDown'||evento.key==='ArrowUp') {
      evento.preventDefault();
      if(painel.hidden)abrir(campo.value);
      if(!opcoes.length)return;
      const passo=evento.key==='ArrowDown'?1:-1;
      marcar(ativa<0?(passo>0?0:opcoes.length-1):(ativa+passo+opcoes.length)%opcoes.length);
      return;
    }
    if(evento.key==='Escape') {
      if(!painel.hidden) {
        evento.preventDefault();
        fechar();
      }
      else if(campo.value) {
        evento.preventDefault();
        campo.value='';
      }
      return;
    }
    if(evento.key==='Enter'&&aberta&&ativa>=0) {
      evento.preventDefault();
      opcoes[ativa].el.click();
    }
    if(evento.key==='Tab')fechar();
  }
  );
  // Enter sem opção escolhida: a página com todos os resultados.
  form.addEventListener('submit',evento=> {
    evento.preventDefault();
    const consulta=campo.value.trim();
    fechar();
    if(normalize(consulta).length>=MINIMO_CARACTERES)verTodos(consulta);
  }
  );
  form.addEventListener('focusout',evento=> {
    if(!form.contains(evento.relatedTarget))fechar();
  }
  );
  document.addEventListener('pointerdown',evento=> {
    if(!form.contains(evento.target))fechar();
  }
  );
  return {fechar};
}
