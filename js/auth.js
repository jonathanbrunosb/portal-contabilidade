import { escapeHTML as e,safeURL } from './ui.js';
// Presentation only: a browser-local choice is not authentication. hasAccess()
// controls which sections/menu items/search results render for a profile — it
// is a UX consistency layer, not a security boundary: the JSON sources remain
// public to anyone who can reach the published site (see README).
export const PERMISSIONS= {
  Administrador:['conteudo','gerencial','time','administracao'],Gerência:['conteudo','gerencial','time'],Gestor:['conteudo','time'],Colaborador:['conteudo','time'],Visitante:['conteudo']
}
;
const IDENTITY_KEY='portal-identity';
const VISITOR_ID='visitante';
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
// A deliberately chosen "Visitante" is a valid, intentional access tier —
// not a placeholder for a failed or missing identification. isVisitor marks
// that intent explicitly, since perfil alone ('Visitante') is also reused as
// the least-privilege fallback in unidentifiedProfile() below.
export function getVisitorUser() {
  return {
    id:VISITOR_ID,matricula:null,nome:'Visitante',cargo:'Acesso ao Portal da Contabilidade',
    area:'Externa à Contabilidade',perfil:'Visitante',equipe:'Externa à Contabilidade',
    foto:'assets/users/avatar-visitante-portal.png',isVisitor:true
  }
  ;
}
export function isVisitorUser(user) {
  return Boolean(user?.isVisitor);
}
// Shown only when nothing could be identified at all (no matrícula, no
// stored id, or a stored id that no longer matches anyone) — distinct from
// getVisitorUser(), which represents an intentional, positive choice.
function unidentifiedProfile() {
  return {
    matricula:'Não informada',nome:'Colaborador não identificado',cargo:'Escolha sua área para se identificar',area:'Não identificada',perfil:'Visitante',equipe:'Não identificada',foto:'assets/users/default.svg'
  }
  ;
}
// `users` (data/usuarios.json) is a small curated set kept for special cases
// (e.g. an elevated `administracao` permission granted beyond the profile's
// default tier). `equipes` is the real roster — anyone picked from there via
// the área → colaborador flow gets a profile derived from their role in that
// team (leader vs. colaborador), without needing a manual usuarios.json entry.
export function identifyUser(users,equipes=[]) {
  const matricula=getMatriculaFromURL();
  const id=getStoredUserId();
  const byMatricula=matricula&&users.find(user=>user.matricula===matricula);
  if(byMatricula)return byMatricula;
  if(id===VISITOR_ID)return getVisitorUser();
  const byId=users.find(user=>user.id===id);
  if(byId)return byId;
  for(const team of equipes) {
    const person=(team.responsaveis||[]).find(p=>p.id===id);
    if(person)return {
      id:person.id,matricula:'Não informada',nome:person.nome,cargo:person.cargo||'Colaborador',
      area:team.nome,areaId:team.id,
      perfil:team.tipo==='gerencia'?'Gerência':(person.id===team.liderId?'Gestor':'Colaborador'),
      equipe:team.nome,foto:person.foto
    }
    ;
  }
  return unidentifiedProfile();
}
export function permissionsFor(user) {
  return user?.permissoes||PERMISSIONS[user?.perfil]||[];
}
export function hasAccess(user,capability) {
  return permissionsFor(user).includes(capability);
}
export function renderUser(user) {
  const visitor=isVisitorUser(user);
  const photo=safeURL(user.foto)||'assets/users/default.svg';
  const avatarAlt=visitor?'Avatar corporativo do perfil de visitante':`Avatar de ${e(user.nome)}`;
  const avatarTitle=visitor?' title="Visitante"':'';
  const support=visitor?'<p>Conteúdos disponíveis conforme o perfil de visitante.</p>':'';
  const perfilLine=visitor?`<span class="profile-area">Perfil: ${e(user.perfil)}</span>`:'';
  const switchLabel=visitor?'Identificar colaborador':'Trocar identificação';
  document.querySelector('#profile').innerHTML=`<img class="avatar large" src="${e(photo)}" alt="${avatarAlt}"${avatarTitle}><h2>${e(user.nome)}</h2><p>${e(user.cargo)}</p>${support}<span class="profile-area">Área: ${e(user.area)}</span>${perfilLine}<button class="text-btn profile-switch" id="switch-identity">${switchLabel}</button>`;
  document.querySelector('#top-user').innerHTML=`<span>${e(user.nome)}<small>${e(user.area)}</small></span><img class="avatar" src="${e(photo)}" alt="${avatarAlt}"${avatarTitle}>`;
  document.querySelectorAll('.avatar').forEach(img=>img.addEventListener('error',()=> {
    img.src='assets/users/default.svg';
  }
  , {
    once:true
  }
  ));
}

