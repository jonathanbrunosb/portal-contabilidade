// Shared rendering utilities: every data value is escaped before entering HTML.
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ( {
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}
[c]));
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const dateLabel = value => value ? new Date(value+'T12:00:00').toLocaleDateString('pt-BR', {
  day:'2-digit',month:'short',year:'numeric'
}
).replaceAll('.','') : 'Não definida';
const paths =  {
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',home:'<path d="M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10"/>',external:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',settings:'<path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z"/><circle cx="12" cy="12" r="3"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',chevron:'<path d="m6 9 6 6 6-6"/>',news:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4v4H7zM14 8h3M14 12h3M7 16h10"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',flow:'<rect x="8" y="2" width="8" height="6" rx="1"/><path d="M12 8v5M5 13h14M5 13v3M19 13v3"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/>',file:'<path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8"/>',chart:'<path d="M3 3v18h18M7 16v-5M12 16V7M17 16V4"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h3M14 14h3M7 17h3"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3c0-5 12-5 12 0v3M16 5a3 3 0 0 1 0 6M18 14c3 0 3 3 3 6"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',shield:'<path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5zM8 12l3 3 5-6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',radar:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 8-8"/>',link:'<path d="m9 15 6-6M8 17l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 5 0M16 7l2-2a4 4 0 0 1 5 5l-5 5a4 4 0 0 1-5 0"/>',check:'<path d="m5 12 4 4L19 6"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',download:'<path d="M12 3v12M7 11l5 5 5-5M5 20h14"/>',image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4 4 3-3 4 4"/>',pencil:'<path d="M16.9 3.6a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L8.5 19 4 20l1-4.5Z"/><path d="m14.5 6 3.5 3.5"/>'
}
;
export const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.file}</svg>`;
export function hydrateIcons(root=document) {
  root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
}
export const statusColor = status => /atenção|alto|alerta/i.test(status) ? 'yellow' : /pendente|crítico|recusado/i.test(status) ? 'red' : /andamento|moderado|revisão/i.test(status) ? 'purple' : /dia|prazo|concluído|ativo|baixo|publicado/i.test(status) ? 'green' : '';
export const badge = (text,extraClass='') => `<span class="badge ${statusColor(text)}${extraClass?' '+extraClass:''}">${escapeHTML(text)}</span>`;
// Origem do conteúdo: quem escreveu, não o tema (decisão de 21/09/2026). Uma
// análise da equipe sobre a IFRS 18 é Contabilidade; a notícia reproduzida da
// ANEEL é Externo. O tema continua na categoria/grupo de cada coleção.
export const ORIGENS = {
  contabilidade:'Contabilidade',equatorial:'Equatorial',externo:'Externo'
};
export const seloOrigem = origem => ORIGENS[origem] ? `<span class="selo-origem ${origem}">${ORIGENS[origem]}</span>` : '';
// Opções do filtro "Origem": só as que existem na lista, na ordem fixa acima.
export const opcoesOrigem = lista => Object.entries(ORIGENS).filter(([valor])=>lista.some(item=>item.origem===valor)).map(([valor,rotulo])=>({valor,rotulo}));
// Only HTTP(S) and same-origin relative links are supported; reject script/data URLs.
// Versao do portal, lida do proprio endereco deste modulo (`?v=` que o
// index.html carimba). Nao ha um segundo numero para manter.
export const VERSAO=new URL(import.meta.url).searchParams.get('v')||'';
// Carimba a versao em arquivo servido por nos, para uma arte trocada chegar ao
// usuario sem Ctrl+F5. O index.html expira em ~10 min no GitHub Pages; quando
// ele renova, os endereços das imagens mudam junto e o navegador rebusca.
// Endereço de terceiro, `data:` e `blob:` ficam intactos.
export function comVersao(endereco) {
  if(!endereco||!VERSAO)return endereco;
  if(/^(data:|blob:)/i.test(endereco))return endereco;
  try {
    const url=new URL(endereco,location.href);
    if(url.origin!==location.origin)return endereco;
    url.searchParams.set('v',VERSAO);
    return url.pathname+url.search+url.hash;
  }
  catch {
    return endereco;
  }
}
export function safeURL(value) {
  if(!value)return null;
  try {
    const url=new URL(value,location.href);
    return ['http:','https:'].includes(url.protocol)?url.href:null;
  }
  catch {
    return null;
  }
}
let returnFocus;
export function showDialog(title,category,body) {
  const dialog=document.querySelector('#detail-dialog');
  if(!dialog.open)returnFocus=document.activeElement;
  document.querySelector('#dialog-title').textContent=title;
  document.querySelector('#dialog-category').textContent=category;
  document.querySelector('#dialog-body').innerHTML=body;
  if(!dialog.open)dialog.showModal();
  document.querySelector('#close-dialog').focus();
}
export function initializeDialog() {
  const dialog=document.querySelector('#detail-dialog');
  document.querySelector('#close-dialog').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=> {
    if(e.target===dialog) {
      const r=dialog.getBoundingClientRect();
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
    }
  }
  );
  dialog.addEventListener('close',()=>returnFocus?.focus());
}
export function detailGrid(values) {
  return `<dl class="detail-grid">${Object.entries(values).map(([k,v])=>`<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(Array.isArray(v)?v.join(', '):v||'Não informado')}</dd></div>`).join('')}</dl>`;
}
export function notify(message) {
  const el=document.querySelector('#toast');
  el.textContent=message;
  el.hidden=false;
  clearTimeout(notify.timer);
  notify.timer=setTimeout(()=>el.hidden=true,4500);
}

