import { loadData,isLiveDataSource,apiWrite,apiUploadPhoto,getAdminToken,setAdminToken,hasLocalTeams,saveLocalTeams,clearLocalTeams,hasLocalAutomacoes,saveLocalAutomacoes,clearLocalAutomacoes } from './data-service.js?v=20260920-44';
import { identifyUser,renderUser,hasAccess,getStoredUserId,setStoredUserId } from './auth.js?v=20260920-44';
import { initializeNavigation,markCurrentSection,bindTabs,selectTab } from './navigation.js?v=20260920-44';
import { renderNewsletter,showArticle,loadNoticias,ultimaAtualizacaoLabel,noticiaCategorias,filterNoticias,renderNoticias } from './newsletter.js?v=20260920-44';
import { renderTeamStructure } from './teams.js?v=20260920-44';
import { initCarousel } from './carousel.js?v=20260920-44';
import { escapeHTML as e,normalize,icon,hydrateIcons,badge,dateLabel,showDialog,initializeDialog,detailGrid,safeURL,comVersao,notify } from './ui.js?v=20260920-44';
import { track,setAnalyticsEnabled,summary,exportAnalytics,clearAnalytics } from './analytics.js?v=20260920-44';
let data,currentTab='newsletter',currentAdminTab='equipes',currentUser,currentMenu=[],navSections=[];
const $=selector=>document.querySelector(selector);
// Capability required to see each menu target / page section / searchable collection.
const TARGET_ACCESS= {
  central:'conteudo',equipes:'time',processos:'gerencial',painel:'gerencial',agenda:'gerencial',editorial:'gerencial',administracao:'administracao'
}
;
const CENTRAL_TABS=['newsletter','noticias','sistemas','portais-equatorial','portais-externos','documentos','automacoes','atalhos-equatorial','automacoes-externos'];
// Páginas ainda sem conteúdo definido (o usuário vai desenhar).
const PAGINAS_EM_DEFINICAO=[];
const SECTION_ACCESS= {
  central:'conteudo',painel:'gerencial',editorial:'gerencial'
}
;
const EDITORIAL_COLLECTIONS=['newsletter','noticias'];
const EDITORIAL_CATEGORIAS= {
  newsletter:'Newsletter',noticias:'Notícia'
}
;
const COLLECTION_ACCESS= {
  newsletter:'conteudo',noticias:'conteudo',sistemas:'conteudo',documentos:'conteudo',portais:'conteudo',externos:'conteudo',equipes:'time',usuarios:'time',processos:'gerencial',agenda:'gerencial',entregas:'gerencial'
}
;
function applyAccess(user) {
  Object.entries(SECTION_ACCESS).forEach(([id,capability])=> {
    document.getElementById(id).hidden=!hasAccess(user,capability);
  }
  );
  $('.home-columns').classList.toggle('single-column',!hasAccess(user,'time'));
  $('#notifications').closest('li').hidden=!hasAccess(user,'gerencial');
}
// `opened` = o link já abriu em nova aba pelo próprio <a> do menu; aqui só registra.
function openAccess(item,{opened=false}={}) {
  if(opened) {
    track('system_access',{sistema:item.nome,configurado:true});
    return;
  }
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
  showDialog(item.nome,'Acesso corporativo',`<p>${e(item.descricao||'Acesso utilizado pela Gerência de Contabilidade.')}</p><p>O endereço deste acesso ainda não foi cadastrado. Solicite o link ao responsável da área.</p>${detailGrid({'Status':'Aguardando configuração','Responsável':item.responsavel||'Administração do portal'})}`);
}
// Cartao padrao das grades de Portais e Links, atalhos e automacoes. Medido em
// microsoft.com/pt-br: imagem numa coluna fixa a esquerda, conteudo ao lado e
// uma faixa de acoes no rodape. **O cartao inteiro leva ao destino**: a acao
// principal recebe `pcard-principal` e o CSS estica um `::after` dela por cima
// do cartao. A ficha continua saindo pelo "i", que fica por cima do esticado.
const podeAdministrar = () => hasAccess(currentUser, 'administracao');
function cardPortal(o) {
  const url = safeURL(o.imagem) || (o.imagem && !/^https?:/i.test(o.imagem) ? o.imagem : null);
  const media = url
    ? `<img class="pcard-img" src="${e(comVersao(url))}" alt="" loading="lazy">`
    : `<span class="pcard-simbolo">${icon(o.icone || 'grid')}</span>`;
  const trocar = o.alvoImagem && podeAdministrar()
    ? `<button class="pcard-trocar" data-trocar-imagem="${e(o.alvoImagem)}">${icon('image')}<span>${url ? 'Trocar imagem' : 'Definir imagem'}</span></button>`
    : '';
  const info = o.registro
    ? `<button class="pcard-info" data-record="${e(o.registro)}" aria-label="Informações sobre ${e(o.titulo)}">${icon('info')}</button>`
    : '';
  // A primeira acao do cartao e a principal: e ela que cobre o cartao. Sem
  // acao ("Acesso em configuracao"), nada e esticado e o cartao nao clica.
  const acao = (o.acao || '').replace('class="primary-btn pcard-acessar"',
    'class="primary-btn pcard-acessar pcard-principal"');
  return `<article class="pcard"><div class="pcard-media${url ? '' : ' sem-imagem'}">${media}${trocar}</div><div class="pcard-corpo">${o.rotulo ? `<p class="meta-label">${e(o.rotulo)}</p>` : ''}<h3>${e(o.titulo)}</h3><p class="pcard-texto">${e(o.descricao || '')}</p></div><div class="pcard-acoes">${o.statusHTML || '<span></span>'}<span class="pcard-botoes">${info}${acao}</span></div></article>`;
}
// O corpo do cartao fica acima do link esticado, para o texto poder ser
// selecionado. Em troca, o clique nele chega aqui: navega so quando o usuario
// nao estava selecionando texto, e nunca por cima de um link ou botao.
function ligarCliqueDoCorpo() {
  document.addEventListener('click', event => {
    const corpo = event.target.closest('.pcard-corpo');
    if(!corpo || event.target.closest('a,button')) return;
    if(String(getSelection() || '').trim()) return;
    corpo.closest('.pcard')?.querySelector('.pcard-principal')?.click();
  }
  );
}
const acaoAcessar = (url, nome, marca = 'data-quick') => `<a class="primary-btn pcard-acessar" href="${e(url)}" target="_blank" rel="noopener noreferrer" ${marca}="${e(nome)}">Acessar${icon('external').replace('class="icon"','class="icon ext"')}</a>`;
const acaoBaixar = (url, nome) => `<a class="primary-btn pcard-acessar" href="${e(url)}" download data-doc-title="${e(nome)}">${icon('download')}Baixar</a>`;
const ACAO_PENDENTE = '<span class="meta-label pcard-pendente">Acesso em configuração</span>';
function systemCard(item) {
  const url = safeURL(item.link);
  return cardPortal( {
    imagem:item.imagem,icone:item.icon,titulo:item.nome,descricao:item.descricao,
    rotulo:item.responsavel,statusHTML:badge(item.status),
    acao:url?acaoAcessar(url,item.nome):`<button class="primary-btn pcard-acessar" data-system="${e(item.id)}">Acessar</button>`,
    registro:`sistemas:${item.id}`,alvoImagem:`sistemas:${item.id}`
  }
  );
}
// Atalho corporativo (config.json › links) no mesmo cartão das demais grades.
function linkCard(item,index) {
  if(item.target)return '';
  const url=safeURL(item.link);
  return cardPortal( {
    imagem:item.imagem,icone:item.icon||'link',titulo:item.nome,descricao:item.descricao,
    rotulo:item.responsavel,statusHTML:badge(url?'Ativo':'Link não configurado'),
    acao:url?acaoAcessar(url,item.nome):`<button class="primary-btn pcard-acessar" data-access-link="${e(index)}">Acessar</button>`,
    registro:`links:${index}`
  }
  );
}
// Portal do Grupo (portais.json) e link externo (externos.json): o mesmo
// cartão das demais grades, com o grupo no rótulo e o domínio de destino no
// rodapé — num repositório de links, saber para onde se vai antes de clicar
// vale mais do que um selo de status.
const dominioDe=url=>{try{return new URL(url).host.replace(/^www\./,'');}catch{return '';}};
function portalCard(colecao) {
  return item=> {
    const url=safeURL(item.link);
    const host=url?dominioDe(url):'';
    return cardPortal( {
      imagem:item.imagem,icone:item.icon||'link',titulo:item.nome,descricao:item.descricao,
      rotulo:item.grupo,statusHTML:host?`<span class="meta-label pcard-fonte">${e(host)}</span>`:'<span></span>',
      acao:url?acaoAcessar(url,item.nome):ACAO_PENDENTE,
      registro:`${colecao}:${item.id}`,alvoImagem:`${colecao}:${item.id}`
    }
    );
  }
  ;
}
// Ordem dos grupos: a do próprio arquivo, que é como o usuário os organizou.
const gruposDe=lista=>[...new Set(lista.map(item=>item.grupo).filter(Boolean))];
// Uma tela de grade filtrável por grupo, usada por Portais → Equatorial e
// Portais → Externos: muda a coleção, o texto de apoio e nada mais.
function telaDeLinks( {colecao,destino,prefixo,rotuloBusca,placeholder,rodape,vazio,singular,plural} ) {
  const lista=(data[colecao]||[]).filter(item=>!destino||!item.destino||item.destino===destino);
  const ordem=gruposDe(lista);
  const filtros=[{id:`${prefixo}-grupo`,rotulo:'Grupo',todos:'Todos os grupos',opcoes:ordem}];
  const busca={id:`${prefixo}-busca`,rotulo:rotuloBusca,placeholder};
  $('#content-view').innerHTML=`${barraFiltro({busca,filtros})}<div class="pcard-grid" id="${prefixo}-cards"></div><div class="content-footer"><span id="${prefixo}-count" role="status" aria-live="polite"></span><span>${e(rodape)}</span></div>`;
  ligarBarraFiltro({busca,filtros,aoMudar:()=> {
    const query=normalize($(`#${prefixo}-busca`).value),grupo=$(`#${prefixo}-grupo`).value;
    const visiveis=lista.filter(item=>(!grupo||item.grupo===grupo)&&normalize(`${item.nome} ${item.descricao||''} ${item.grupo||''} ${item.link||''}`).includes(query))
      .sort((a,b)=>(ordem.indexOf(a.grupo)-ordem.indexOf(b.grupo))||a.nome.localeCompare(b.nome,'pt-BR'));
    $(`#${prefixo}-cards`).innerHTML=visiveis.map(portalCard(colecao)).join('')||`<p class="empty-state">${e(vazio)}</p>`;
    $(`#${prefixo}-count`).textContent=contagem(visiveis.length,singular,plural);
  }
  }
  );
}
// Documentos & Normas em tabela: conteúdo repetitivo, sem imagem própria.
// Ícone de apoio por grupo, já que documento não tem arte própria.
const ICONE_GRUPO= {
  'Normas contábeis':'file','Setor elétrico':'chart','Obrigações acessórias':'check',
  'Legislação':'shield','Grupo Equatorial':'briefcase'
}
;
function documentCard(item) {
  const link=safeURL(item.link),arquivo=safeURL(item.arquivo);
  return cardPortal( {
    imagem:item.imagem,icone:ICONE_GRUPO[item.grupo]||'file',titulo:item.titulo,descricao:item.descricao,
    rotulo:item.grupo,statusHTML:`<span class="meta-label pcard-fonte">${e(item.fonte||'Fonte a cadastrar')}</span>`,
    acao:`${link?acaoAcessar(link,item.titulo,'data-doc-link'):''}${arquivo?acaoBaixar(arquivo,item.titulo):''}`||ACAO_PENDENTE,
    registro:`documentos:${item.id}`
  }
  );
}
// Ordem dos grupos definida em config.json › navegacao (Documentos & Normas).
function gruposDocumentos() {
  const definidos=(data.config.navegacao||[]).find(s=>Array.isArray(s.gruposDocumentos))?.gruposDocumentos||[];
  const extras=[...new Set(data.documentos.map(d=>d.grupo).filter(g=>g&&!definidos.includes(g)))];
  return [...definidos,...extras].filter(g=>data.documentos.some(d=>d.grupo===g));
}
function documentResults() {
  const query=normalize($('#doc-search')?.value),grupo=$('#doc-filter')?.value;
  const ordem=gruposDocumentos();
  const records=data.documentos.filter(item=>(!grupo||item.grupo===grupo)&&normalize(JSON.stringify(item)).includes(query))
    .sort((a,b)=>(ordem.indexOf(a.grupo)-ordem.indexOf(b.grupo))||a.titulo.localeCompare(b.titulo,'pt-BR'));
  $('#document-results').innerHTML=records.map(documentCard).join('')||'<p class="empty-state">Nenhum documento encontrado. Tente outro grupo ou termo.</p>';
  $('#doc-count').textContent=`${records.length} ${records.length===1?'referência oficial':'referências oficiais'}`;
}
// Images render with a static fallback icon already in the markup (see
// itemMedia() in newsletter.js); an onerror listener just toggles which
// one is visible, keeping error handling out of inline HTML attributes.
function wireNoticiaImages(root) {
  root.querySelectorAll('.noticia-media img,.noticia-destaque-media img').forEach(img=>img.addEventListener('error',()=> {
    img.closest('.noticia-media,.noticia-destaque-media')?.classList.add('noticia-media-fallback');
  }
  , {
    once:true
  }
  ));
}
function renderNoticiasResults() {
  const query=$('#noticia-search')?.value||'';
  const categoria=$('#noticia-categoria')?.value||'';
  const ativos=loadNoticias(data.noticias);
  const resultados=$('#noticias-resultados');
  resultados.innerHTML=renderNoticias(ativos,categoria,query);
  const contador=$('#noticia-count');
  if(contador)contador.textContent=contagem(filterNoticias(ativos,categoria,query).length,'notícia','notícias');
  wireNoticiaImages(resultados);
}
// Global search results link into the tab via showRecord('noticias', id):
// instead of opening the read-more modal (data-noticia-detalhe does that),
// this opens/keeps the Notícias & Impactos tab, scrolls to the matching
// card and applies a temporary highlight, per spec section 16.
function focusNoticia(id) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  navigate({...(currentMenu.find(item=>item.target==='central')||{target:'central'}),tab:'noticias'});
  setTimeout(()=> {
    const card=document.querySelector(`[data-noticia-id="${CSS.escape(id)}"]`);
    if(!card)return;
    card.scrollIntoView( {
      behavior:reduced?'auto':'smooth',block:'center'
    }
    );
    card.classList.add('noticia-highlight');
    setTimeout(()=>card.classList.remove('noticia-highlight'),2200);
  }
  ,320);
}
const AUTOMATION_STATUSES=['Produção','Produção e Melhorias','Desenvolvimento e Testes'];
const AUTOMATION_FAMILIAS= {
  sap:'SAP / VBA',python:'Script Python',web:'RPA Web'
}
;
function automationTagClass(familia) {
  return familia==='python'?'tag purple':familia==='web'?'tag teal':'tag';
}
// Development status ("is it functional?") and link availability ("is there
// somewhere to click?") are independent — a row can be em Produção with the
// link still Em configuração. The badge color only ever reflects the former;
// the Acesso column is the only thing that reads the URL, so the two never get
// mixed into one signal.
function automationStatusColor(status) {
  return /desenvolvimento|teste/i.test(status)?'yellow':'green';
}
// Ícone de apoio por tecnologia, usado quando a automação ainda não tem arte.
const ICONE_FAMILIA= {
  sap:'grid',python:'file',web:'globe'
}
;
function automationCard(item) {
  const url=safeURL(item.url),arquivo=safeURL(item.arquivo);
  return cardPortal( {
    imagem:item.imagem,icone:ICONE_FAMILIA[item.familia]||'flow',titulo:item.titulo,descricao:item.descricao,
    rotulo:item.tipo,statusHTML:`<span class="badge ${automationStatusColor(item.statusDesenvolvimento)}">${e(item.statusDesenvolvimento)}</span>`,
    acao:url?acaoAcessar(url,item.titulo):arquivo?acaoBaixar(arquivo,item.titulo):ACAO_PENDENTE,
    registro:`automacoes:${item.id}`,alvoImagem:`automacoes:${item.id}`
  }
  );
}
function activeAutomations() {
  return data.automacoes.filter(item=>item.ativo!==false);
}
function renderAutomationsResults() {
  const words=normalize($('#aut-search').value).trim().split(/\s+/).filter(Boolean);
  const familia=$('#aut-type').value,status=$('#aut-status').value;
  const visible=activeAutomations()
    .filter(item=>(!familia||item.familia===familia)&&(!status||item.statusDesenvolvimento===status))
    .filter(item=>words.every(word=>normalize(`${item.titulo} ${item.descricao} ${item.tipo}`).includes(word)))
    .sort((a,b)=>(a.ordem??0)-(b.ordem??0));
  $('#aut-cards').innerHTML=visible.map(automationCard).join('')||'<p class="empty-state">Nenhuma automação corresponde aos filtros selecionados.</p>';
  $('#aut-count').textContent=`${visible.length} ${visible.length===1?'automação':'automações'}`;
}
// Faixa de busca e filtros das telas de conteúdo. Uma só forma em todas elas:
// a busca primeiro, os filtros depois e "Limpar filtros" no fim. A capa não
// tem faixa — lá a busca é a do cabeçalho.
function barraFiltro({busca,filtros=[]}) {
  const campos=filtros.map(filtro=>`<select id="${e(filtro.id)}" aria-label="${e(filtro.rotulo)}"><option value="">${e(filtro.todos)}</option>${filtro.opcoes.map(opcao=>`<option value="${e(opcao.valor??opcao)}">${e(opcao.rotulo??opcao)}</option>`).join('')}</select>`).join('');
  return `<div class="filter-bar" role="search"><input type="search" id="${e(busca.id)}" aria-label="${e(busca.rotulo)}" placeholder="${e(busca.placeholder)}">${campos}<button class="secondary-btn" id="filtro-limpar" type="button">Limpar filtros</button></div>`;
}
function ligarBarraFiltro({busca,filtros=[],aoMudar,aoLimpar}) {
  const campos=[$(`#${busca.id}`),...filtros.map(filtro=>$(`#${filtro.id}`))].filter(Boolean);
  $(`#${busca.id}`).oninput=aoMudar;
  filtros.forEach(filtro=>{const campo=$(`#${filtro.id}`);if(campo)campo.onchange=aoMudar;});
  $('#filtro-limpar').onclick=()=> {
    campos.forEach(campo=>{campo.value='';});
    if(aoLimpar)aoLimpar();else aoMudar();
    $(`#${busca.id}`)?.focus();
  }
  ;
  aoMudar();
}
const contagem=(n,singular,plural)=>`${n} ${n===1?singular:plural}`;
// Lista de valores distintos de um campo, para montar um <select> de filtro.
const valoresDe=(lista,campo)=>[...new Set(lista.map(item=>item[campo]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
function renderContent(tab) {
  currentTab=tab;
  track('tab_view',{tab});
  if(CENTRAL_TABS.includes(tab))activateMenu({target:'central',tab});
  if(tab==='newsletter') {
    const publicadas=data.newsletter.filter(item=>item.status==='Publicado');
    const filtros=[{id:'news-categoria',rotulo:'Categoria',todos:'Todas as categorias',opcoes:valoresDe(publicadas,'categoria')}];
    const busca={id:'news-busca',rotulo:'Pesquisar na Newsletter Contábil',placeholder:'Título, resumo, categoria ou fonte…'};
    $('#content-view').innerHTML=`${barraFiltro({busca,filtros})}<div id="news-resultados"></div><div class="content-footer"><span id="news-count" role="status" aria-live="polite"></span><span>Informações de exemplo para validação do portal</span></div>`;
    ligarBarraFiltro({busca,filtros,aoMudar:()=> {
      const alvo=$('#news-resultados');
      const visiveis=filterNoticias(publicadas,$('#news-categoria').value,$('#news-busca').value);
      alvo.innerHTML=renderNewsletter(visiveis);
      $('#news-count').textContent=contagem(visiveis.length,'publicação','publicações');
      wireNoticiaImages(alvo);
    }
    }
    );
  }
  if(tab==='noticias') {
    const ativos=loadNoticias(data.noticias);
    const filtros=[{id:'noticia-categoria',rotulo:'Categoria',todos:'Todas as categorias',opcoes:noticiaCategorias(ativos)}];
    const busca={id:'noticia-search',rotulo:'Pesquisar em Notícias & Impactos',placeholder:'Título, resumo, categoria, fonte ou empresa…'};
    $('#content-view').innerHTML=`${barraFiltro({busca,filtros})}<div id="noticias-resultados"></div><div class="content-footer"><span id="noticia-count" role="status" aria-live="polite"></span><span>Última atualização: ${e(ultimaAtualizacaoLabel(ativos))}</span></div>`;
    ligarBarraFiltro({busca,filtros,aoMudar:renderNoticiasResults});
  }
  if(PAGINAS_EM_DEFINICAO.includes(tab))$('#content-view').innerHTML='<p class="empty-state">Conteúdo em definição. Esta página será preenchida em breve.</p>';
  if(tab==='atalhos-equatorial') {
    const busca={id:'atalho-busca',rotulo:'Pesquisar atalho corporativo',placeholder:'Nome ou descrição do atalho…'};
    $('#content-view').innerHTML=`${barraFiltro({busca})}<div class="pcard-grid" id="atalho-cards"></div><div class="content-footer"><span id="atalho-count" role="status" aria-live="polite"></span><span>Atalhos corporativos do Grupo Equatorial. Endereços em data/config.json › links.</span></div>`;
    ligarBarraFiltro({busca,aoMudar:()=> {
      const query=normalize($('#atalho-busca').value);
      const visiveis=data.config.links.filter(item=>!item.target&&normalize(`${item.nome} ${item.descricao||''}`).includes(query));
      $('#atalho-cards').innerHTML=visiveis.map(item=>linkCard(item,data.config.links.indexOf(item))).join('')||'<p class="empty-state">Nenhum atalho corresponde à busca.</p>';
      $('#atalho-count').textContent=contagem(visiveis.length,'atalho','atalhos');
    }
    }
    );
  }
  if(tab==='portais-equatorial')telaDeLinks( {
    colecao:'portais',prefixo:'por',rotuloBusca:'Pesquisar portal do Grupo Equatorial',
    placeholder:'Nome, descrição, grupo ou endereço…',
    rodape:'Portais corporativos do Grupo. O acesso depende da sua identificação de rede — o portal só centraliza os endereços.',
    vazio:'Nenhum portal corresponde aos filtros.',singular:'portal',plural:'portais'
  }
  );
  if(tab==='portais-externos')telaDeLinks( {
    colecao:'externos',destino:'portais-externos',prefixo:'ext',rotuloBusca:'Pesquisar link externo',
    placeholder:'Nome, descrição, grupo ou endereço…',
    rodape:'Sites de terceiros que ajudam no dia a dia. Cada um tem cadastro e regras próprias — leia a ficha no “i” antes de enviar arquivo ou dado do Grupo.',
    vazio:'Nenhum link corresponde aos filtros.',singular:'link','plural':'links'
  }
  );
  if(tab==='automacoes-externos')telaDeLinks( {
    colecao:'externos',destino:'automacoes-externos',prefixo:'aex',
    rotuloBusca:'Pesquisar ferramenta externa',placeholder:'Nome, descrição, grupo ou endereço…',
    rodape:'Ferramentas de terceiros que automatizam tarefas do dia a dia. Cada uma tem cadastro e regras próprias — leia a ficha no “i” antes de enviar arquivo do Grupo.',
    vazio:'Nenhuma ferramenta corresponde aos filtros.',singular:'ferramenta',plural:'ferramentas'
  }
  );
  if(tab==='sistemas') {
    const filtros=[{id:'sis-responsavel',rotulo:'Equipe responsável',todos:'Todas as equipes',opcoes:valoresDe(data.sistemas,'responsavel')}];
    const busca={id:'sis-busca',rotulo:'Pesquisar sistema da área',placeholder:'Nome, descrição ou equipe responsável…'};
    $('#content-view').innerHTML=`${barraFiltro({busca,filtros})}<div class="pcard-grid" id="sis-cards"></div><div class="content-footer"><span id="sis-count" role="status" aria-live="polite"></span><span>Cadastre os endereços internos para habilitar os acessos.</span></div>`;
    ligarBarraFiltro({busca,filtros,aoMudar:()=> {
      const query=normalize($('#sis-busca').value),responsavel=$('#sis-responsavel').value;
      const visiveis=data.sistemas.filter(item=>(!responsavel||item.responsavel===responsavel)&&normalize(`${item.nome} ${item.descricao||''} ${item.responsavel||''}`).includes(query));
      $('#sis-cards').innerHTML=visiveis.map(systemCard).join('')||'<p class="empty-state">Nenhum sistema corresponde aos filtros.</p>';
      $('#sis-count').textContent=contagem(visiveis.length,'sistema','sistemas');
    }
    }
    );
  }
  if(tab==='documentos') {
    const filtros=[{id:'doc-filter',rotulo:'Grupo',todos:'Todos os grupos',opcoes:gruposDocumentos()}];
    const busca={id:'doc-search',rotulo:'Pesquisar documentos e normas',placeholder:'Título, descrição, grupo ou fonte…'};
    $('#content-view').innerHTML=`${barraFiltro({busca,filtros})}<div class="pcard-grid" id="document-results"></div><div class="content-footer"><span id="doc-count" role="status" aria-live="polite"></span><span>Referências oficiais: o endereço de cada uma foi conferido na fonte — a data está na ficha do documento.</span></div>`;
    ligarBarraFiltro({busca,filtros,aoMudar:documentResults,aoLimpar:()=>navigate(subnavTargets[0])});
  }
  if(tab==='automacoes') {
    const filtros=[
      {id:'aut-type',rotulo:'Tecnologia',todos:'Todas as tecnologias',opcoes:Object.entries(AUTOMATION_FAMILIAS).map(([valor,rotulo])=>({valor,rotulo}))},
      {id:'aut-status',rotulo:'Status de desenvolvimento',todos:'Todos os status',opcoes:AUTOMATION_STATUSES}
    ];
    const busca={id:'aut-search',rotulo:'Pesquisar automação',placeholder:'Título, descrição, tecnologia ou transação SAP…'};
    $('#content-view').innerHTML=`${barraFiltro({busca,filtros})}<div class="pcard-grid" id="aut-cards"></div><div class="content-footer"><span id="aut-count" role="status" aria-live="polite"></span><span>As soluções estão funcionais conforme o status informado; os acessos pelo portal podem estar em configuração.</span></div>`;
    ligarBarraFiltro({busca,filtros,aoMudar:renderAutomationsResults});
  }
}
function activateMenu(item) {
  if(!item)return;
  markCurrentSection(dest=>Boolean(dest)&&dest.target===item.target&&(!item.tab||!dest.tab||dest.tab===item.tab));
}
// Faixa de subpáginas no padrão do CFC. Vale para **qualquer** seção do menu:
// como o menu não abre mais submenu suspenso, é aqui que as demais páginas da
// seção aparecem, em abas. Fica escondida quando a seção tem uma página só ou
// quando ela é uma janela dedicada que já traz as próprias abas (Administração).
const paginasDe=s=>s.paginas||s.itens||[];
const mesmaPagina=(a,b)=>Boolean(a&&b)&&a.target===b.target&&(a.tab||'')===(b.tab||'')&&(a.grupo??'')===(b.grupo??'')&&(a.adminTab||'')===(b.adminTab||'');
let subnavTargets=[];
function renderSubnav(item) {
  const section=navSections.find(s=>paginasDe(s).some(child=>child.target===item.target&&(child.tab||'')===(item.tab||'')));
  const paginas=section?paginasDe(section):[];
  const atual=paginas.find(child=>mesmaPagina(child,item));
  const titulo=section?.label||'Portal';
  $('#page-title').textContent=titulo;
  // O nome da seção fica à esquerda das abas: em tela estreita o menu some e
  // era o único lugar que dizia onde se está.
  $('#page-section').textContent=titulo;
  $('.pg-subnav').setAttribute('aria-label',`Páginas de ${titulo}`);
  const janelaUnica=paginas.length>1&&paginas.every(pagina=>pagina.view&&pagina.view===paginas[0].view);
  subnavTargets=paginas;
  $('#page-subnav').innerHTML=paginas.map((child,i)=>`<li><a href="${e(routeHash(child))}" data-subnav="${i}"${child===atual?' aria-current="page"':''}>${e(child.label)}</a></li>`).join('');
  $('.pg-subnav').hidden=paginas.length<2||janelaUnica;
  if($('.pg-subnav').hidden)return;
  requestAnimationFrame(()=> {
    const faixa=$('.pg-abas'),ativo=faixa.querySelector('[aria-current]');
    if(ativo&&(ativo.offsetLeft<faixa.scrollLeft||ativo.offsetLeft+ativo.offsetWidth>faixa.scrollLeft+faixa.clientWidth))faixa.scrollLeft=Math.max(0,ativo.offsetLeft-24);
    moverLinha(ativo);
  }
  );
}
// Linha deslizante da faixa de subpáginas (efeito do CFC): fica sobre a página
// atual e acompanha o item sob o mouse ou o foco do teclado.
function moverLinha(alvo) {
  const linha=$('.pg-line');
  if(!linha)return;
  if(!alvo) {
    linha.style.opacity='0';
    return;
  }
  // A linha está dentro da faixa rolável e rola junto com ela.
  linha.style.opacity='1';
  linha.style.width=`${alvo.offsetWidth}px`;
  linha.style.transform=`translateX(${alvo.offsetLeft}px)`;
}
function ligarLinha() {
  const faixa=$('.pg-abas'),atual=()=>faixa.querySelector('[aria-current]');
  faixa.addEventListener('mouseover',event=>{const a=event.target.closest('a');if(a)moverLinha(a);});
  faixa.addEventListener('focusin',event=>{const a=event.target.closest('a');if(a)moverLinha(a);});
  faixa.addEventListener('mouseleave',()=>moverLinha(atual()));
  faixa.addEventListener('focusout',event=>{if(!faixa.contains(event.relatedTarget))moverLinha(atual());});
  window.addEventListener('resize',()=>moverLinha(atual()));
}
// Rotas: #inicio, #<target>, #central/<aba>, #administracao/<aba>.
function routeItem(hash) {
  const [target,sub]=String(hash||'').replace(/^#/,'').split('/');
  if(target==='inicio'||!target)return {target:'inicio'};
  const base=currentMenu.find(item=>item.target===target);
  if(!base)return null;
  if(sub&&target==='central'&&CENTRAL_TABS.includes(sub))return {...base,tab:sub};
  if(sub&&target==='administracao')return {...base,adminTab:sub};
  return base;
}
function routeHash(item) {
  if(item.target==='central'&&item.tab)return `#central/${item.tab}`;
  if(item.target==='administracao'&&item.adminTab)return `#administracao/${item.adminTab}`;
  return `#${item.target}`;
}
// A menu item with a `view` opens as its own dedicated screen (#home-view
// hidden entirely) instead of scrolling to a panel inside it — Estrutura das
// Equipes and Administração both work this way, so neither ever shows mixed
// in with Central de Conteúdo or the rest of the home page.
function navigate(item,updateHistory=true) {
  if(!item)return;
  if(item.target==='inicio') {
    $('#home-view').hidden=false;
    $('#page-view').hidden=true;
    $('.pg-subnav').hidden=true;
    $('#equipes').hidden=true;
    $('#administracao').hidden=true;
    activateMenu(item);
    if(updateHistory)history.pushState(null,'','#inicio');
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    $('#main').focus({preventScroll:true});
    return;
  }
  if(item.adminTab&&item.adminTab!==currentAdminTab)currentAdminTab=item.adminTab;
  const dedicatedView=item.view;
  const pagina=!dedicatedView&&Boolean(item.tab);
  $('#home-view').hidden=Boolean(dedicatedView)||pagina;
  $('#page-view').hidden=!pagina;
  $('#equipes').hidden=dedicatedView!=='equipes';
  $('#administracao').hidden=dedicatedView!=='administracao';
  activateMenu(item);
  if(dedicatedView==='equipes') {
    renderTeamStructure(data.equipes);
    track('team_structure_view');
  }
  else if(dedicatedView==='administracao') {
    renderAdmin();
    track('admin_view');
  }
  else if(item.tab) {
    renderContent(item.tab);
    if(item.grupo!==undefined&&$('#doc-filter')) {
      $('#doc-filter').value=item.grupo;
      documentResults();
    }
  }
  else activateMenu(item);
  renderSubnav(item);
  if(updateHistory)history.pushState(null,'',routeHash(item));
  requestAnimationFrame(()=> {
    if(pagina) {
      window.scrollTo({top:0,behavior:'auto'});
      $('#main').focus({preventScroll:true});
      return;
    }
    const target=dedicatedView?$(`#${dedicatedView}`):$(`#${item.target}`);
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
// Editorial dates (competência, atualização da base) follow the local
// dataset, independent of the device clock.
function renderPeriod() {
  const config = data.config;
  const reference = new Date(config.dataReferencia + 'T12:00:00');
  const period = new Date(config.competencia + '-01T12:00:00');
  const month = period.toLocaleDateString('pt-BR', {month: 'long'});
  $('.period').textContent = `Competência: ${month} de ${period.getFullYear()}`;
  $('#entregas .week-label').textContent = `Semana ${String(config.semanaLabel||'').toLowerCase()}`;
  $('#pf-updated').textContent = `${config.demonstracao ? 'Dados ilustrativos' : 'Base local'} · Atualização da base: ${reference.toLocaleDateString('pt-BR')}`;
}

// Capa: vigência de destaques e avisos pela data do dispositivo (AAAA-MM-DD).
const hoje=()=>new Date().toLocaleDateString('sv-SE');
const vigente=item=>(!item.inicio||item.inicio<=hoje())&&(!item.fim||hoje()<=item.fim);
const AVISO_TIPOS= {
  extra:'Extra',prazo:'Prazo',info:'Info'
}
;
function openDestaque(item) {
  track('destaque_open',{destaque:item.titulo});
  if(item.registro) {
    const [collection,id]=item.registro.split(':');
    showRecord(collection,id);
  }
  else if(item.sistema)openAccess(data.sistemas.find(s=>s.id===item.sistema));
  else if(item.rota)navigate(routeItem(item.rota));
}
function openAviso(id) {
  const aviso=data.avisos.find(a=>a.id===id);
  if(!aviso)return;
  track('aviso_open',{aviso:aviso.titulo});
  showDialog(aviso.titulo,`Aviso · ${AVISO_TIPOS[aviso.tipo]||'Info'}`,`<p>${e(aviso.texto)}</p>${detailGrid({'Quando':aviso.janela||'—','Área responsável':aviso.area||'—'})}${aviso.demonstrativo?'<p class="muted">Aviso de exemplo — substitua em data/avisos.json.</p>':''}`);
}
function renderHome() {
  const destaques=(data.destaques||[]).filter(vigente).sort((a,b)=>(a.ordem??99)-(b.ordem??99));
  initCarousel($('#destaques'),destaques,openDestaque);
  const ordemTipo= {
    extra:0,prazo:1,info:2
  }
  ;
  const avisos=(data.avisos||[]).filter(vigente).sort((a,b)=>(ordemTipo[a.tipo]??3)-(ordemTipo[b.tipo]??3)).slice(0,3);
  $('#avisos-list').innerHTML=avisos.map(a=>`<li><span class="aviso-tag ${e(a.tipo)}">${e(AVISO_TIPOS[a.tipo]||'Info')}</span><button type="button" class="aviso-title" data-aviso="${e(a.id)}">${e(a.titulo)}</button><small>${[a.janela,a.area].filter(Boolean).map(e).join(' · ')}${a.demonstrativo?' · Exemplo':''}</small></li>`).join('')||'<li class="empty-state">Nenhum aviso vigente.</li>';
  const vistos=new Set();
  const atalhos=[...data.config.links.filter(l=>!l.target).map(l=>({nome:l.nome,icon:l.icon,url:safeURL(l.link)})),...data.sistemas.filter(s=>s.status==='Ativo').map(s=>({nome:s.nome.split(' — ')[0],icon:s.icon||'grid',url:safeURL(s.link)}))]
    .filter(a=>a.url&&!vistos.has(a.nome)&&vistos.add(a.nome)).slice(0,8);
  $('#acesso-list').innerHTML=atalhos.map(a=>`<li><a href="${e(a.url)}" target="_blank" rel="noopener noreferrer" data-quick="${e(a.nome)}">${icon(a.icon||'link')}<span>${e(a.nome)}</span>${icon('external').replace('class="icon"','class="icon ext"')}</a></li>`).join('');
  const publicadas=[...data.newsletter.map(item=>({item,collection:'newsletter'})),...data.noticias.map(item=>({item,collection:'noticias'}))]
    .filter(({item})=>item.status==='Publicado').sort((a,b)=>(b.item.dataPublicacao||'').localeCompare(a.item.dataPublicacao||'')).slice(0,5);
  $('#news-list').innerHTML=publicadas.map(({item,collection})=>`<li><div class="news-meta"><span>${e(item.categoria)}</span><time datetime="${e(item.dataPublicacao)}">${e(dateLabel(item.dataPublicacao))}</time></div><button type="button" class="news-title" data-record="${collection}:${e(item.id)}">${e(item.titulo)}</button><p>${e(item.resumo)}</p></li>`).join('')||'<li class="empty-state">Nenhuma publicação.</li>';
}
// Rodapé: mapa do portal com as mesmas seções do menu (já filtradas pelo
// perfil) e a área responsável pela gerência.
let mapTargets=[];
function renderPortalMap(sections) {
  mapTargets=[];
  const link=item=>`<li><a href="${e(routeHash(item))}" data-map="${mapTargets.push(item)-1}">${e(item.label)}</a></li>`;
  $('#portal-map').innerHTML=sections.filter(section=>!section.target||section.paginas).map(section=>{
    const itens=section.paginas||section.itens||[];
    return `<div class="pf-col${itens.length>6?' wide':''}"><h2>${icon(section.icon)}<span>${e(section.label)}</span></h2><ul>${itens.map(link).join('')}</ul></div>`;
  }).join('');
  const gerencia=data.equipes.find(team=>team.tipo==='gerencia');
  if(gerencia)$('#pf-area').textContent=gerencia.nome;
}
function renderDashboard() {
  const config=data.config;
  $('#kpis').innerHTML=config.kpis.map(k=>`<article class="kpi"><div class="kpi-top"><span>${e(k.nome)}</span>${icon(k.icon)}</div><div class="kpi-value">${e(k.valor)}${badge(k.status)}</div><div class="progress ${e(k.cor)}" role="progressbar" aria-label="${e(k.metrica)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Number(k.progresso)}"><span style="width:${Math.max(0,Math.min(100,Number(k.progresso)))}%"></span></div><p class="kpi-foot">${e(k.metrica)}</p></article>`).join('');
  $('#process-table').innerHTML=data.processos.map(p=>`<tr><td><button class="text-btn" data-record="processos:${e(p.id)}">${e(p.nome)}</button></td><td>${e(p.responsavel)}</td><td>${e(p.prazo)}</td><td>${badge(p.status)}</td></tr>`).join('');
  $('#agenda-list').innerHTML=data.agenda.slice().sort((a,b)=>a.data.localeCompare(b.data)).map(a=>`<button class="agenda-event" data-record="agenda:${e(a.id)}"><span class="event-date">${e(a.data.slice(-2))}<small>${e(new Date(a.data+'T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase())}</small></span><span class="event-copy"><strong>${e(a.nome)}</strong><small>${e(a.horario)}· ${e(a.responsavel)}</small></span></button>`).join('');
  $('#deliveries').innerHTML=data.entregas.map(d=>`<button class="delivery" data-record="entregas:${e(d.id)}"><strong>${e(d.nome)}</strong><small>${e(d.responsavel)}</small><span class="delivery-bottom"><span>${e(dateLabel(d.prazo))}</span>${badge(d.status)}</span></button>`).join('');
}
function editorialActions(collection,item) {
  if(item.status==='Rascunho')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:revisao">Enviar para revisão</button>`;
  if(item.status==='Em revisão')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:publicar">Aprovar e publicar</button><button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:recusar">Recusar</button>`;
  if(item.status==='Recusado')return `<button class="text-btn" data-editorial="${e(collection)}:${e(item.id)}:reabrir">Reabrir como rascunho</button>`;
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
  showDialog('Novo rascunho','Painel editorial',`<form id="draft-form">
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
  $('#admin-responsaveis').innerHTML=adminEditState.responsaveis.map((p,i)=>`<fieldset class="admin-person-row" data-index="${i}"><legend>Colaborador ${i+1}</legend><img class="avatar" src="${e(comVersao(safeURL(p.foto)||p.foto||'assets/users/default.svg'))}" alt=""><label class="field">Nome completo<input type="text" class="admin-person-nome" value="${e(p.nome||'')}" required></label><label class="field">Cargo<input type="text" class="admin-person-cargo" value="${e(p.cargo||'')}" placeholder="Opcional"></label><label class="field">Foto ou caminho<input type="text" class="admin-person-foto-path" value="${e(p.foto||'')}" placeholder="assets/users/foto.png"></label><label class="admin-leader-choice"><input type="radio" name="admin-lider" value="${i}" ${p.id===adminEditState.liderId?'checked':''}> Liderança da equipe</label><label class="admin-file-label">Selecionar foto<input type="file" class="admin-person-foto" accept="image/*"></label><button type="button" class="danger-btn admin-remove-person" data-index="${i}">Excluir colaborador</button></fieldset>`).join('')||'<p class="empty-state compact">Nenhum colaborador cadastrado nesta equipe.</p>';
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
  showDialog(adminEditState.isNew?'Nova equipe':team.nome,'Administração de equipes',`<form id="admin-team-form"><div class="admin-form-grid"><label class="field">Nome da equipe<input id="admin-nome" value="${e(team.nome||'')}" required></label><label class="field">Sigla<input id="admin-sigla" value="${e(team.sigla||'')}" maxlength="12"></label></div><label class="field">Descrição da área<input id="admin-descricao" value="${e(team.descricao||'')}"></label><label class="field">Responsabilidades (uma por linha)<textarea id="admin-responsabilidades">${e((team.responsabilidades||[]).join('\n'))}</textarea></label><label class="field">Empresas atendidas (uma por linha)<textarea id="admin-empresas">${e((team.empresas||[]).join('\n'))}</textarea></label><label class="admin-validated"><input type="checkbox" id="admin-validado" ${team.dadosAreaValidados?'checked':''}> Informações da área validadas para exibição</label><div class="admin-subheading"><div><h3>Colaboradores</h3><p>Cadastre os integrantes e marque quem lidera a equipe.</p></div><button type="button" class="secondary-btn" id="admin-add-person">Adicionar colaborador +</button></div><div id="admin-responsaveis"></div><div class="admin-form-actions"><button class="primary-btn" type="submit">${adminEditState.isNew?'Criar equipe':'Salvar alterações'}</button>${!adminEditState.isNew&&team.id!=='gerencia'?'<button class="danger-btn" type="button" id="admin-delete-team">Excluir equipe</button>':''}</div></form>`);
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
let automationEditState=null;
// Same admin flow as equipes: same dialog helper, same live/local persistence
// split, same refresh-after-save pattern — a second collection through the
// one Administração storage path already established, not a new one.
function refreshAutomationsUI(message) {
  renderAdmin();
  if(currentTab==='automacoes')renderContent('automacoes');
  if(message)notify(message);
}
function openAutomationForm(item) {
  showDialog(automationEditState.isNew?'Nova automação':item.titulo,'Administração de automações',`<form id="admin-automation-form"><div class="admin-form-grid"><label class="field">Título<input id="admin-aut-titulo" value="${e(item.titulo||'')}" required></label><label class="field">Ordem de exibição<input id="admin-aut-ordem" type="number" min="1" value="${e(item.ordem||1)}" required></label></div><label class="field">Tecnologia<select id="admin-aut-familia">${Object.entries(AUTOMATION_FAMILIAS).map(([value,label])=>`<option value="${e(value)}" ${item.familia===value?'selected':''}>${e(label)}</option>`).join('')}</select></label><label class="field">Tipo (rótulo exibido no card)<input id="admin-aut-tipo" value="${e(item.tipo||'')}" required placeholder="Ex.: RPA SAP, Script Python, RPA Web"></label><label class="field">Descrição<textarea id="admin-aut-descricao" required>${e(item.descricao||'')}</textarea></label><label class="field">Status de desenvolvimento<select id="admin-aut-status">${AUTOMATION_STATUSES.map(s=>`<option ${item.statusDesenvolvimento===s?'selected':''}>${e(s)}</option>`).join('')}</select></label><label class="field">URL de acesso (opcional)<input id="admin-aut-url" type="url" placeholder="https://…" value="${e(item.url||'')}"></label><label class="admin-validated"><input type="checkbox" id="admin-aut-ativo" ${item.ativo!==false?'checked':''}> Automação ativa (visível na tab)</label><div class="admin-form-actions"><button class="primary-btn" type="submit">${automationEditState.isNew?'Criar automação':'Salvar alterações'}</button>${!automationEditState.isNew?'<button class="danger-btn" type="button" id="admin-delete-automation">Excluir automação</button>':''}</div></form>`);
  const deleteButton=$('#admin-delete-automation');
  if(deleteButton)deleteButton.onclick=()=>deleteAutomation(item.id,item.titulo);
  $('#admin-automation-form').onsubmit=async event=> {
    event.preventDefault();
    const submitBtn=event.target.querySelector('[type=submit]');
    submitBtn.disabled=true;
    try {
      const urlRaw=$('#admin-aut-url').value.trim();
      if(urlRaw&&!safeURL(urlRaw))throw new Error('URL inválida. Use um endereço http(s) válido.');
      const body= {
        id:automationEditState.id,
        categoriaPortal:'Automações',
        tipo:$('#admin-aut-tipo').value.trim(),
        familia:$('#admin-aut-familia').value,
        titulo:$('#admin-aut-titulo').value.trim(),
        descricao:$('#admin-aut-descricao').value.trim(),
        statusDesenvolvimento:$('#admin-aut-status').value,
        url:urlRaw||null,
        imagem:item.imagem||null,
        ativo:$('#admin-aut-ativo').checked,
        ordem:Number($('#admin-aut-ordem').value)||1
      }
      ;
      let updated=body;
      if(isLiveDataSource())updated=await apiWrite('automacoes',{id:automationEditState.isNew?undefined:item.id,method:automationEditState.isNew?'POST':'PUT',body,autor:currentUser.nome});
      const index=data.automacoes.findIndex(a=>a.id===item.id);
      if(automationEditState.isNew)data.automacoes.push(updated);else data.automacoes[index]=updated;
      if(!isLiveDataSource())saveLocalAutomacoes(data.automacoes);
      $('#detail-dialog').close();
      refreshAutomationsUI(automationEditState.isNew?'Automação criada.':'Automação atualizada.');
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
function openCreateAutomation() {
  const id=newId('automacao');
  const maiorOrdem=data.automacoes.reduce((max,item)=>Math.max(max,item.ordem||0),0);
  automationEditState= {
    id,isNew:true
  }
  ;
  openAutomationForm( {
    id,tipo:'',familia:'sap',titulo:'',descricao:'',statusDesenvolvimento:'Produção',url:null,ativo:true,ordem:maiorOrdem+1
  }
  );
}
function openEditAutomation(id) {
  const item=data.automacoes.find(a=>a.id===id);
  if(!item)return;
  automationEditState= {
    id,isNew:false
  }
  ;
  openAutomationForm(item);
}
async function deleteAutomation(id,titulo) {
  if(!confirm(`Excluir a automação “${titulo}”?`))return;
  try {
    if(isLiveDataSource())await apiWrite('automacoes',{id,method:'DELETE',body:{},autor:currentUser.nome});
    data.automacoes=data.automacoes.filter(item=>item.id!==id);
    if(!isLiveDataSource())saveLocalAutomacoes(data.automacoes);
    $('#detail-dialog').close();
    refreshAutomationsUI('Automação excluída.');
  }
  catch(error) {
    notify(error.message);
  }
}
// Selecting someone else's name in the identification picker (e.g. Jonathan,
// who has administracao access) must not be enough to reach the edit forms —
// this is a soft deterrent, not real authentication: it runs entirely in the
// browser, so it can't stop someone who opens dev tools. The password itself
// is never kept in the source as plain text, only its SHA-256 hash.
const ADMIN_UNLOCK_HASH='b6d30367e3010f5067fd937ec1abbc5fb4e5502f55b7c9bd9b798622b785ad8e';
const ADMIN_UNLOCK_KEY='portal-admin-unlocked';
function isAdminUnlocked() {
  try {
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY)==='1';
  }
  catch {
    return false;
  }
}
async function sha256Hex(text) {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function renderAdminLock() {
  $('#admin-view').innerHTML=`<div class="admin-lock"><p>Área restrita da Administração. Informe o código de acesso para continuar.</p><form id="admin-unlock-form"><label class="field">Código de acesso<input type="password" id="admin-unlock-code" autocomplete="off" required></label><button class="primary-btn" type="submit">Desbloquear</button></form><p class="empty-state compact" id="admin-unlock-error" hidden>Código incorreto. Tente novamente.</p></div>`;
  $('#admin-unlock-form').onsubmit=async event=> {
    event.preventDefault();
    const code=$('#admin-unlock-code').value;
    const hash=await sha256Hex(code);
    if(hash===ADMIN_UNLOCK_HASH) {
      try {
        sessionStorage.setItem(ADMIN_UNLOCK_KEY,'1');
      }
      catch {
        /* Storage may be blocked by corporate browser policy. */
      }
      renderAdmin();
    }
    else {
      $('#admin-unlock-error').hidden=false;
      $('#admin-unlock-code').value='';
      $('#admin-unlock-code').focus();
    }
  }
  ;
}
function renderAdminEquipes() {
  const live=isLiveDataSource();
  $('#admin-view').innerHTML=`<div class="admin-toolbar"><button class="primary-btn" id="admin-new-team">Nova equipe +</button><button class="secondary-btn" id="admin-export">Exportar JSON</button>${live?'':'<label class="secondary-btn admin-import">Importar JSON<input id="admin-import" type="file" accept="application/json,.json"></label>'}${hasLocalTeams()&&!live?'<button class="text-btn" id="admin-reset">Restaurar base original</button>':''}</div><div class="admin-team-list">${data.equipes.map(t=>`<article class="admin-team-card"><div><span class="team-code">${e(t.sigla||t.id)}</span><h3>${e(t.nome)}</h3><p>${e(t.descricao||'Sem descrição cadastrada.')}</p></div><div class="admin-team-meta"><strong>${(t.responsaveis||[]).length}</strong><span>colaborador(es)</span><button class="secondary-btn" data-admin-team="${e(t.id)}">Administrar</button></div></article>`).join('')}</div>`;
  $('#admin-new-team').onclick=openCreateTeam;
  $('#admin-export').onclick=exportTeams;
  const importInput=$('#admin-import');
  if(importInput)importInput.onchange=()=>importInput.files[0]&&importTeams(importInput.files[0]);
  const reset=$('#admin-reset');
  if(reset)reset.onclick=()=> { if(confirm('Descartar as alterações locais e restaurar a base original?')) { clearLocalTeams();location.reload(); } };
}
function renderAdminAutomacoes() {
  const automacoesOrdenadas=data.automacoes.slice().sort((a,b)=>(a.ordem??0)-(b.ordem??0));
  $('#admin-view').innerHTML=`<div class="admin-toolbar"><button class="primary-btn" id="admin-new-automation">Nova automação +</button></div><div class="admin-team-list">${automacoesOrdenadas.map(a=>`<article class="admin-team-card"><div><span class="tag ${automationTagClass(a.familia)}">${e(a.tipo)}</span><h3>${e(a.titulo)}</h3><p>${e(a.descricao)}</p></div><div class="admin-team-meta"><strong>${a.ativo!==false?'Ativa':'Inativa'}</strong><span>ordem ${e(a.ordem??'-')}</span><button class="secondary-btn" data-admin-automation="${e(a.id)}">Administrar</button></div></article>`).join('')||'<p class="empty-state compact">Nenhuma automação cadastrada.</p>'}</div>`;
  $('#admin-new-automation').onclick=openCreateAutomation;
}
// Equipes and Automações are separate tabs (same .tabs component as Central
// de Conteúdo) instead of one long stacked list — currentAdminTab is the
// only piece of state that needs to survive a re-render (e.g. after a
// create/edit/delete refresh) so the active tab doesn't reset.
function renderAdmin() {
  const unlocked=isAdminUnlocked();
  $('#admin-summary').hidden=!unlocked;
  $('#admin-tabs').hidden=!unlocked;
  if(!unlocked) {
    renderAdminLock();
    return;
  }
  const live=isLiveDataSource();
  const source=live?'Servidor conectado':hasLocalTeams()?'Alterações salvas neste navegador':'Base original do portal';
  const token=live?`<div class="admin-token-row"><label class="field">Token de administração<input type="password" id="admin-token" placeholder="Cole o token aqui" value="${e(getAdminToken())}"></label><button class="primary-btn" id="admin-token-save">Salvar token</button></div>`:'';
  $('#admin-summary').innerHTML=`<div class="admin-overview"><div><span class="meta-label">Fonte dos dados</span><strong>${e(source)}</strong><p>${live?'As alterações são gravadas no servidor e compartilhadas.':'As alterações ficam neste navegador. Exporte o JSON para backup ou para atualizar a base publicada.'}</p></div></div>${token}`;
  const tokenSave=$('#admin-token-save');
  if(tokenSave)tokenSave.onclick=()=> { setAdminToken($('#admin-token').value.trim());notify('Token salvo neste navegador.');renderAdmin(); };
  selectTab('#admin-tabs',$(`#admin-tab-${currentAdminTab}`));
  $('#admin-view').setAttribute('aria-labelledby',`admin-tab-${currentAdminTab}`);
  if(currentAdminTab==='automacoes')renderAdminAutomacoes();else renderAdminEquipes();
}
function showRecord(collection,id) {
  const item=data[collection]?.find(i=>i.id===id);
  if(!item)return;
  track('record_view',{collection,label:item.titulo||item.nome});
  if(collection==='newsletter') {
    showArticle(item);
    return;
  }
  if(collection==='noticias') {
    focusNoticia(id);
    return;
  }
  if(collection==='equipes') {
    navigate(currentMenu.find(item=>item.view==='equipes'));
    return;
  }
  if(collection==='sistemas') {
    const url=safeURL(item.link);
    showDialog(item.nome,'Sistema da área',`<p>${e(item.descricao)}</p>${detailGrid({'Responsável':item.responsavel||'—','Status':item.status||'—','Endereço':url?'Cadastrado':'Aguardando cadastro'})}${url?acaoAcessar(url,item.nome):'<p class="muted">O endereço deste sistema ainda não foi cadastrado. Solicite o link ao responsável da área.</p>'}`);
    return;
  }
  if(collection==='portais'||collection==='externos') {
    const url=safeURL(item.link);
    const externo=collection==='externos';
    showDialog(item.nome,item.grupo||(externo?'Link externo':'Portal do Grupo'),`<p>${e(item.descricao)}</p>${item.observacao?`<p class="muted">${e(item.observacao)}</p>`:''}${detailGrid({'Grupo':item.grupo||'—','Endereço':url?dominioDe(url):'Aguardando cadastro','Acesso':externo?'Cadastro próprio do serviço':'Identificação de rede do Grupo'})}${url?acaoAcessar(url,item.nome):'<p class="muted">O endereço deste item ainda não foi cadastrado.</p>'}`);
    return;
  }
  if(collection==='usuarios') {
    showDialog(item.nome,'Colaborador',detailGrid( {
      'Matrícula':item.matricula,'Cargo':item.cargo,'Área':item.area,'Equipe':item.equipe,'Perfil':item.perfil
    }
    ));
    return;
  }
  if(collection==='automacoes') {
    const url=safeURL(item.url);
    showDialog(item.titulo,'Automação',`<p>${e(item.descricao)}</p>${detailGrid({'Categoria no portal':item.categoriaPortal,'Tecnologia':item.tipo,'Status de desenvolvimento':item.statusDesenvolvimento,'Situação do acesso':url?'Disponível':'Acesso em configuração'})}${url?`<a class="primary-btn" href="${e(url)}" target="_blank" rel="noopener noreferrer">Acessar automação${icon('external').replace('class="icon"','class="icon ext"')}</a>`:'<p class="muted">O acesso pelo portal ainda está em configuração.</p>'}`);
    return;
  }
  if(collection==='documentos') {
    const link=safeURL(item.link),arquivo=safeURL(item.arquivo);
    showDialog(item.titulo,item.grupo||'Documentos & Normas',`<p>${e(item.descricao)}</p>${detailGrid({'Fonte':item.fonte||'—','Grupo':item.grupo||'—','Link verificado em':item.verificadoEm?dateLabel(item.verificadoEm):'—'})}<div class="doc-actions">${link?`<a class="primary-btn" href="${e(link)}" target="_blank" rel="noopener noreferrer" data-doc-link="${e(item.titulo)}">Acessar na fonte oficial${icon('external').replace('class="icon"','class="icon ext"')}</a>`:''}${arquivo?` <a class="primary-btn" href="${e(arquivo)}" download data-doc-title="${e(item.titulo)}">Baixar</a>`:''}</div>`);
    return;
  }
  showDialog(item.nome,collection==='agenda'?'Agenda da gerência':collection==='entregas'?'Entrega da semana':'Processo crítico',`<p>${e(item.descricao)}</p>${detailGrid({'Responsável':item.responsavel,'Prazo / data':item.data?dateLabel(item.data):/^\d{4}-/.test(item.prazo)?dateLabel(item.prazo):item.prazo,'Status / tipo':item.status||item.tipo,'Horário':item.horario||'Não se aplica'})}`);
}
// O "i" do atalho mostra a ficha; quem quer o destino usa o botão Acessar.
function showLinkInfo(index) {
  const item=data.config.links[Number(index)];
  if(!item)return;
  const url=safeURL(item.link);
  showDialog(item.nome,'Acesso corporativo',`<p>${e(item.descricao||'Acesso utilizado pela Gerência de Contabilidade.')}</p>${detailGrid({'Responsável':item.responsavel||'Administração do portal','Endereço':url?'Cadastrado':'Aguardando cadastro'})}${url?acaoAcessar(url,item.nome):'<p class="muted">O endereço deste acesso ainda não foi cadastrado. Solicite o link ao responsável da área.</p>'}`);
}
// Clicar na imagem do cartão (só para quem administra) troca a arte. Grava no
// backend quando ele está ativo; sem backend, só automações têm guarda local
// neste navegador — sistemas exigem o backend, como o resto da administração.
function colecaoDoCartao(collection) {
  return collection==='sistemas'?data.sistemas:collection==='automacoes'?data.automacoes:collection==='portais'?data.portais:collection==='externos'?data.externos:null;
}
function openTrocarImagem(alvo) {
  const [collection,id]=alvo.split(':');
  const lista=colecaoDoCartao(collection);
  const item=lista&&lista.find(registro=>registro.id===id);
  if(!item)return;
  const nome=item.nome||item.titulo;
  showDialog(nome,'Imagem do cartão',`<form id="form-imagem"><p>A arte ocupa uma área 16:9 no topo do cartão. Prefira um arquivo do próprio repositório; sem imagem, o cartão mostra o ícone da categoria.</p><label class="field">Caminho ou endereço da imagem<input id="img-caminho" value="${e(item.imagem||'')}" placeholder="assets/sistemas/exemplo.webp"></label><label class="field">Ou envie um arquivo<input id="img-arquivo" type="file" accept="image/*"></label><div class="admin-form-actions"><button class="primary-btn" type="submit">Salvar imagem</button>${item.imagem?'<button class="danger-btn" type="button" id="img-remover">Remover imagem</button>':''}</div></form>`);
  const remover=$('#img-remover');
  if(remover)remover.onclick=()=>salvarImagemCartao(collection,item,null);
  $('#form-imagem').onsubmit=async event=> {
    event.preventDefault();
    const botao=event.target.querySelector('[type=submit]');
    botao.disabled=true;
    try {
      const arquivo=$('#img-arquivo').files[0];
      let caminho=$('#img-caminho').value.trim();
      if(arquivo) {
        if(!isLiveDataSource())throw new Error('O envio de arquivo requer o backend opcional — ver README, "Backend opcional". Informe um caminho do repositório.');
        caminho=await apiUploadPhoto(arquivo,{autor:currentUser.nome,pasta:collection});
      }
      await salvarImagemCartao(collection,item,caminho||null);
    }
    catch(error) {
      notify(error.message);
    }
    finally {
      botao.disabled=false;
    }
  }
  ;
}
async function salvarImagemCartao(collection,item,imagem) {
  try {
    if(isLiveDataSource()) {
      const atualizado=await apiWrite(collection,{id:item.id,method:'PUT',body:{...item,imagem},autor:currentUser.nome});
      Object.assign(item,atualizado);
    }
    else if(collection==='automacoes') {
      item.imagem=imagem;
      saveLocalAutomacoes(data.automacoes);
    }
    else throw new Error('Alterar a arte dos sistemas requer o backend opcional — ver README, "Backend opcional".');
    $('#detail-dialog').close();
    renderContent(currentTab);
    notify(imagem?'Imagem atualizada.':'Imagem removida.');
  }
  catch(error) {
    notify(error.message);
  }
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
  )=>`<article class="content-card"><span class="meta-label">${e(({newsletter:'Newsletter',noticias:'Notícias',usuarios:'Colaboradores'})[collection]||collection)}</span><h3>${e(item.titulo||item.nome)}</h3><p>${e(item.resumo||item.descricao||item.cargo||'')}</p><button class="text-btn" data-record="${e(collection)}:${e(item.id)}">Ver detalhes</button></article>`).join('')||'<p class="empty-state">Nenhum resultado. Experimente “conciliações”, “IFRS” ou “Contabilidade IV”.</p>';
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
    showDialog('Preferências e uso','Preferências',`<p>Preferências salvas apenas neste navegador.</p><label class="settings-row"><input type="checkbox" id="pref-motion" ${document.body.classList.contains('no-motion')?'checked':''}> Reduzir movimento</label><label class="settings-row"><input type="checkbox" id="pref-size" ${document.body.classList.contains('comfortable')?'checked':''}> Aumentar textos dos conteúdos</label><label class="settings-row"><input type="checkbox" id="pref-analytics" ${prefs.noAnalytics?'':'checked'}> Registrar meu uso do portal neste navegador</label><h3>Uso deste navegador</h3><p class="muted">Sem envio a servidores; os dados ficam só neste dispositivo e podem ser exportados ou apagados a qualquer momento.</p>${detailGrid( {
      'Eventos registrados':String(s.total),'Aba mais acessada':usageList(s.topAbas,'Sem dados ainda'),'Sistema mais acessado':usageList(s.topSistemas,'Sem dados ainda'),'Termo mais pesquisado':usageList(s.topBuscas,'Sem dados ainda'),'Conteúdo mais consultado':usageList(s.topRegistros,'Sem dados ainda'),'Documento mais baixado':usageList(s.topDocumentos,'Sem dados ainda')
    }
    )}<div class="doc-actions"><button class="primary-btn" id="export-analytics">Exportar dados</button><button class="text-btn" id="clear-analytics">Limpar dados locais</button></div>`);
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
// First access asks for the área before the person — the área → colaborador
// choice is what changes what shows up next, so identifying by name alone
// (as before) forced everyone through one flat list. A visitor who isn't
// part of any área of the Gerência de Contabilidade gets its own option.
function openIdentityPicker() {
  const areas=data.equipes.map(team=>`<button class="identity-pick" data-area="${e(team.id)}">${icon('users')}<span><strong>${e(team.nome)}</strong><small>${e(team.responsaveis.length)} colaborador(es)</small></span></button>`).join('');
  showDialog('Qual área você atua?','Identificação',`<p>Escolha sua área para localizar seu nome na lista de colaboradores. A escolha fica salva só neste navegador — não é um login corporativo.</p><div class="identity-list">${areas}<button class="identity-pick" data-visitante>${icon('globe')}<span><strong>Sou visitante</strong><small>Não faço parte da Gerência de Contabilidade</small></span></button></div>`);
  document.querySelectorAll('[data-area]').forEach(btn=>btn.onclick=()=>openColaboradorPicker(btn.dataset.area));
  $('[data-visitante]').onclick=()=> {
    setStoredUserId('visitante');
    location.reload();
  }
  ;
}
// A colaborador already registered in Administração (data/usuarios.json) —
// used today only for the handful of profiles that need something beyond
// their área's default permissions, like Jonathan's admin access — keeps
// that profile when picked here, matched by name within the same área.
function openColaboradorPicker(areaId) {
  const team=data.equipes.find(t=>t.id===areaId);
  const rows=team.responsaveis.map(p=> {
    const matched=data.usuarios.find(u=>u.areaId===team.id&&normalize(u.nome)===normalize(p.nome));
    return `<button class="identity-pick" data-user="${e(matched?matched.id:p.id)}"><img class="avatar" src="${e(comVersao(safeURL(p.foto)||'assets/users/default.svg'))}" alt=""><span><strong>${e(p.nome)}</strong><small>${e(p.cargo||team.nome)}</small></span></button>`;
  }
  ).join('')||'<p class="empty-state">Nenhum colaborador cadastrado nesta área.</p>';
  showDialog(team.nome,'Identificação',`<button class="text-btn" id="identity-back">← Voltar</button><div class="identity-list">${rows}</div>`);
  $('#identity-back').onclick=openIdentityPicker;
  document.querySelectorAll('.identity-pick[data-user]').forEach(btn=>btn.onclick=()=> {
    setStoredUserId(btn.dataset.user);
    location.reload();
  }
  );
  document.querySelectorAll('.identity-pick .avatar').forEach(img=>img.addEventListener('error',()=> {
    img.src=comVersao('assets/users/default.svg');
  }
  , {
    once:true
  }
  ));
}
async function init() {
  hydrateIcons();
  initializeDialog();
  preferences();
  try {
    data=await loadData();
    currentUser=identifyUser(data.usuarios,data.equipes);
    renderUser(currentUser);
    applyAccess(currentUser);
    currentMenu=data.config.menu.filter(item=>hasAccess(currentUser,TARGET_ACCESS[item.target]||'conteudo'));
    const sections=(data.config.navegacao||[]).map(section=> {
      // Documentos & Normas abre direto na tabela; os grupos viram a faixa de páginas.
      if(Array.isArray(section.gruposDocumentos))return {...section,paginas:[{label:'Todos',target:'central',tab:'documentos',grupo:''},...gruposDocumentos().map(grupo=>({label:grupo,target:'central',tab:'documentos',grupo}))]};
      if(section.target)return section;
      return {...section,itens:(section.itens||[]).filter(item=>hasAccess(currentUser,TARGET_ACCESS[item.target]||'conteudo'))};
    }).filter(section=>section.target||section.itens.length);
    navSections=sections;
    ligarLinha();
    initializeNavigation({sections},{onSelect:navigate,hashOf:routeHash});
    renderPortalMap(sections);
    bindTabs('#admin-tabs',tab=> {
      currentAdminTab=tab.dataset.adminTab;
      renderAdmin();
    }
    );
    renderDashboard();
    renderHome();
    renderEditorial();
    renderAdmin();
    renderPeriod();
    const initialItem=location.hash?routeItem(location.hash):null;
    if(initialItem)navigate(initialItem,false);
    else activateMenu({target:'inicio'});
    window.addEventListener('popstate',()=> {
      navigate(routeItem(location.hash)||{target:'inicio'},false);
    });
    track('session_start');
    $('#switch-identity').onclick=openIdentityPicker;
    if(!getStoredUserId())openIdentityPicker();
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
      if(event.target.value&&$('#home-view').hidden)navigate({target:'inicio'},false);
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
      showDialog('Central de notificações','Alertas da gerência',`<p>${alerts.length} pontos de atenção na base demonstrativa.</p>${alerts.map(({item,collection})=>`<article class="content-card"><h3>${e(item.nome)}</h3><p>${e(item.responsavel)}</p><div class="card-bottom">${badge(item.status)}<button class="text-btn" data-record="${collection}:${e(item.id)}">Ver detalhes</button></div></article>`).join('')||'<p>Nenhum alerta.</p>'}`);
    }
    ;
    ligarCliqueDoCorpo();
    document.addEventListener('click',event=> {
      const record=event.target.closest('[data-record]');
      if(record) {
        const [collection,id]=record.dataset.record.split(':');
        if(collection==='links')showLinkInfo(id);else showRecord(collection,id);
      }
      const trocarImagem=event.target.closest('[data-trocar-imagem]');
      if(trocarImagem)openTrocarImagem(trocarImagem.dataset.trocarImagem);
      const system=event.target.closest('[data-system]');
      if(system)openAccess(data.sistemas.find(i=>i.id===system.dataset.system));
      const noticiaDetalhe=event.target.closest('[data-noticia-detalhe]');
      if(noticiaDetalhe) {
        const item=data.noticias.find(i=>i.id===noticiaDetalhe.dataset.noticiaDetalhe);
        if(item)showArticle(item);
      }
      const editorial=event.target.closest('[data-editorial]');
      if(editorial) {
        const [collection,id,action]=editorial.dataset.editorial.split(':');
        handleEditorialAction(collection,id,action);
      }
      const adminTeam=event.target.closest('[data-admin-team]');
      if(adminTeam)openEditTeam(adminTeam.dataset.adminTeam);
      const adminAutomation=event.target.closest('[data-admin-automation]');
      if(adminAutomation)openEditAutomation(adminAutomation.dataset.adminAutomation);
      const docLink=event.target.closest('[data-doc-link]');
      if(docLink)track('document_open',{documento:docLink.dataset.docLink});
      const download=event.target.closest('a[download]');
      if(download) {
        const article=download.closest('article');
        track('document_download',{documento:download.dataset.docTitle||article?.querySelector('p')?.textContent||article?.querySelector('h3')?.textContent||$('#dialog-title')?.textContent||'Documento'});
      }
      const aviso=event.target.closest('[data-aviso]');
      if(aviso)openAviso(aviso.dataset.aviso);
      const quick=event.target.closest('[data-quick]');
      if(quick)track('system_access',{sistema:quick.dataset.quick,configurado:true});
      const subnav=event.target.closest('[data-subnav]');
      if(subnav) {
        event.preventDefault();
        navigate(subnavTargets[Number(subnav.dataset.subnav)]);
      }
      const route=event.target.closest('[data-route]');
      if(route) {
        event.preventDefault();
        navigate(routeItem(route.getAttribute('data-route'))||{target:'inicio'});
      }
      const accessLink=event.target.closest('[data-access-link]');
      if(accessLink)openAccess(data.config.links[Number(accessLink.dataset.accessLink)]);
      const mapLink=event.target.closest('[data-map]');
      if(mapLink) {
        event.preventDefault();
        navigate(mapTargets[Number(mapLink.dataset.map)]);
      }
      const homeLink=event.target.closest('.ph-brand');
      if(homeLink) {
        event.preventDefault();
        navigate(routeItem(homeLink.hash)||{target:'inicio'});
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

