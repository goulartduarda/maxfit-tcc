// ajusta 1vh
function fixVh(){ const vh = innerHeight*0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);
const DATA_URL = '../data/videos.json';

document.addEventListener('DOMContentLoaded', init);

async function init(){
  const foto = localStorage.getItem('usuario_foto'); 
  if (foto) $('fotoPerfilTop').src = foto;

  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    if(history.length>1) history.back();
    else location.href = 'tutoriais.html';
  });

  const id = new URL(location.href).searchParams.get('id');
  let data = [];
  try{
    const res = await fetch(DATA_URL, { cache:'no-store' });
    data = await res.json();
  }catch{}

  const v = data.find(x => String(x.id) === String(id));
  if(!v){ $('notFound').hidden = false; return; }

  // título e descrição
  $('vTitle').textContent = v.titulo || 'Vídeo';
  $('vDesc').textContent  = v.descricao || '—';

  // thumbs
  const t = v.thumb || '../img/placeholder-video.jpg';
  $('thumb').src  = t;
  $('thumb2').src = t;

  // links (youtube ou mp4) — sempre abre em nova aba
  const href = v.url || '#';
  $('watchLink').href = href;
  $('watchBtn').href  = href;
}
