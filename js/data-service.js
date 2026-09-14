// Future API integration belongs here; views do not fetch data directly.
const collections=['usuarios','newsletter','noticias','equipes','processos','sistemas','agenda','documentos','entregas','config'];
export async function loadData() {
  const pairs=await Promise.all(collections.map(async name=> {
    const response=await fetch(`data/${name}.json`, {
      cache:'no-cache'
    }
    );
    if(!response.ok)throw new Error(`Não foi possível carregar ${name}.json (${response.status}).`);
    return [name,await response.json()];
  }
  ));
  return Object.fromEntries(pairs);
}
