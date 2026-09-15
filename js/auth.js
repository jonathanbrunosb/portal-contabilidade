import { escapeHTML as e,safeURL } from './ui.js';
// Presentation only: a browser-local choice is not authentication. hasAccess()
// controls which sections/menu items/search results render for a profile — it
// is a UX consistency layer, not a security boundary: the JSON sources remain
// public to anyone who can reach the published site (see README).
export const PERMISSIONS= {
  Administrador:['conteudo','gerencial','time','administracao'],Gerência:['conteudo','gerencial','time'],Gestor:['conteudo','time'],Colaborador:['conteudo'],Visitante:['conteudo']
}
;
const IDENTITY_KEY='portal-identity';
export function getStoredUserId() {
  try {
    return localStorage.getItem(IDENTITY_KEY);
  }
  catch {
    return null;
  }
}
export function setStoredUserId(id) {
  try {
    localStorage.setItem(IDENTITY_KEY,id);
  }
  catch {
    /* Storage may be blocked by corporate browser policy. */
  }
}
export function getMatriculaFromURL() {
  return new URLSearchParams(window.location.search).get('matricula')?.trim()||null;
}
export function identifyUser(users) {
  const matricula=getMatriculaFromURL();
  const id=getStoredUserId();
  return users.find(user=>matricula&&user.matricula===matricula)||users.find(user=>user.id===id)|| {
    matricula:matricula||'Não informada',nome:'Colaborador não identificado',cargo:'Escolha seu nome para personalizar',area:'Não identificada',perfil:'Visitante',equipe:'Não identificada',foto:'assets/users/default.svg'
  }
  ;
}
export function permissionsFor(user) {
  return user?.permissoes||PERMISSIONS[user?.perfil]||[];
}
export function hasAccess(user,capability) {
  return permissionsFor(user).includes(capability);
}
export function renderUser(user) {
  const photo=safeURL(user.foto)||'assets/users/default.svg';
  document.querySelector('#profile').innerHTML=`<img class="avatar large" src="${e(photo)}" alt="Avatar de ${e(user.nome)}"><h2>${e(user.nome)}</h2><p>${e(user.cargo)}</p><div class="profile-meta"><span>Matrícula: ${e(user.matricula)}</span><span class="profile-role">${e(user.perfil)}</span></div><span class="profile-area">Área: ${e(user.area)}</span><small class="profile-note">Identificação local, salva neste navegador — não é um login corporativo.</small><button class="text-btn profile-switch" id="switch-identity">Trocar identificação</button>`;
  document.querySelector('#top-user').innerHTML=`<span>${e(user.nome)}<small>${e(user.area)}</small></span><img class="avatar" src="${e(photo)}" alt="Avatar do colaborador">`;
  document.querySelectorAll('.avatar').forEach(img=>img.addEventListener('error',()=> {
    img.src='assets/users/default.svg';
  }
  , {
    once:true
  }
  ));
}

