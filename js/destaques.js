import { safeURL } from './ui.js?v=20260921-47';
import { comunicados,hashComunicado } from './newsletter.js?v=20260921-47';
// Destaques do carrossel da capa (decisão do usuário em 21/09/2026).
//
// Cada slide é um registro de data/destaques.json que **aponta para um
// destino** — um comunicado, um sistema da área, um portal do Grupo, um link
// externo, um atalho corporativo, uma página do portal ou um endereço livre — e
// guarda a agenda (início, fim, ordem, pausado). A aparência é opcional: o que
// o slide não disser (título, subtítulo, descrição, rótulo, imagens) vem do
// próprio destino, então corrigir um comunicado corrige o slide junto.
//
// Dois formatos: "imagem" (o padrão) põe a imagem do destino na altura toda do
// slide, com o fundo tirado dela; "molde" é a arte montada no Figma — fundo
// próprio e uma cena (as peças já nas posições do molde), gerados por
// .claude/tools/moldes-destaques.py a partir de projeto/comunicados.
export const TIPOS_ALVO= {
  comunicado:'Comunicado',sistema:'Sistema da área',portal:'Portal do Grupo',externo:'Link externo',
  atalho:'Atalho corporativo',pagina:'Página do portal',url:'Endereço livre'
}
;
export const SITUACOES= {
  'no-ar':'No ar',agendado:'Agendado',encerrado:'Encerrado',pausado:'Pausado'
}
;
// Mais que isso e o carrossel vira uma fila que ninguém vê até o fim: o
// primeiro slide concentra a maior parte dos cliques.
export const LIMITE_NO_AR=5;
const hoje=()=>new Date().toLocaleDateString('sv-SE');
export function situacaoDestaque(destaque) {
  if(destaque.ativo===false)return 'pausado';
  const dia=hoje();
  if(destaque.inicio&&dia<destaque.inicio)return 'agendado';
  if(destaque.fim&&dia>destaque.fim)return 'encerrado';
  return 'no-ar';
}
// O que o destino oferece ao slide. `null` quando o destino não existe mais ou
// não pode aparecer (comunicado em rascunho, por exemplo) — o slide some.
export function alvoDoDestaque(alvo,data) {
  const tipo=alvo?.tipo,ref=String(alvo?.ref||'');
  if(tipo==='comunicado') {
    const [colecao,id]=ref.split(':');
    const achado=comunicados(data).find(c=>c.colecao===colecao&&c.item.id===id);
    if(!achado)return null;
    const item=achado.item;
    return {
      href:hashComunicado(colecao,id),externo:false,titulo:item.titulo,subtitulo:item.resumo,descricao:'',
      rotulo:item.categoria,origem:item.origem,imagens:[item.imagemCapa||item.imagem].filter(Boolean),
      alt:item.imagemAlt,acao:'Ler o comunicado'
    }
    ;
  }
  if(tipo==='sistema') {
    const sistema=(data.sistemas||[]).find(s=>s.id===ref);
    if(!sistema)return null;
    const url=safeURL(sistema.link);
    return {
      href:url,externo:Boolean(url),semLink:!url,titulo:sistema.nome,subtitulo:'',descricao:sistema.descricao,
      rotulo:sistema.responsavel,origem:sistema.origem||'contabilidade',imagens:[],acao:'Abrir o sistema'
    }
    ;
  }
  if(tipo==='portal'||tipo==='externo') {
    const lista=tipo==='portal'?data.portais:data.externos;
    const item=(lista||[]).find(p=>p.id===ref);
    if(!item)return null;
    return {
      href:safeURL(item.link),externo:true,titulo:item.nome,descricao:item.descricao,rotulo:item.grupo,
      origem:item.origem||(tipo==='portal'?'equatorial':'externo'),imagens:[],acao:'Acessar'
    }
    ;
  }
  if(tipo==='atalho') {
    const link=(data.config?.links||[]).find(l=>l.nome===ref&&!l.target);
    if(!link)return null;
    return {
      href:safeURL(link.link),externo:true,titulo:link.nome,descricao:link.descricao,rotulo:'Atalho corporativo',
      origem:link.origem||'equatorial',imagens:[],acao:'Acessar'
    }
    ;
  }
  if(tipo==='pagina')return ref.startsWith('#')? {
    href:ref,externo:false,acao:'Abrir a página',imagens:[]
  }
  :null;
  if(tipo==='url') {
    const url=safeURL(ref);
    return url&&/^https?:/i.test(ref)? {
      href:url,externo:true,acao:'Acessar',imagens:[]
    }
    :null;
  }
  return null;
}
// O slide pronto para o carrossel: o que o destaque diz vale mais que o
// destino; o que ele deixa em branco vem do destino.
export function resolverDestaque(destaque,data) {
  const alvo=alvoDoDestaque(destaque.alvo,data);
  if(!alvo)return null;
  const valor=campo=>destaque[campo]||alvo[campo]||'';
  const titulo=valor('titulo');
  if(!titulo)return null;
  const imagens=(destaque.imagens&&destaque.imagens.length?destaque.imagens:alvo.imagens||[]).filter(Boolean).slice(0,2);
  return {
    id:destaque.id,titulo,subtitulo:valor('subtitulo'),descricao:valor('descricao'),rotulo:valor('rotulo'),
    origem:destaque.origem||alvo.origem||'',acao:destaque.acao||alvo.acao||'Abrir',imagens,alt:valor('alt'),
    fundoImagem:destaque.fundoImagem||'',fundo:destaque.fundo||'',fundoFim:destaque.fundoFim||destaque.fundo||'',
    formato:destaque.formato==='molde'?'molde':'imagem',
    lado:destaque.lado==='direita'?'direita':'esquerda',href:alvo.href||null,externo:Boolean(alvo.externo&&alvo.href),
    semLink:Boolean(alvo.semLink),alvo:destaque.alvo
  }
  ;
}
const porOrdem=(a,b)=>(a.ordem??99)-(b.ordem??99);
export function destaquesNoAr(data) {
  return (data.destaques||[]).filter(d=>situacaoDestaque(d)==='no-ar').sort(porOrdem)
    .map(d=>resolverDestaque(d,data)).filter(Boolean);
}
// O destaque que aponta para um destino (um comunicado, um sistema…), se houver.
export function destaqueDoAlvo(data,tipo,ref) {
  return (data.destaques||[]).find(d=>d.alvo?.tipo===tipo&&d.alvo?.ref===ref)||null;
}
