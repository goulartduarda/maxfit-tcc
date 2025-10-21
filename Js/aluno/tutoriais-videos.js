// ajuste de altura mobile
function fixVh(){ const vh = innerHeight*0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);
const DATA_URL = "../data/videos.json";

let DATA = [];
let catAtiva = 'todos';
let q = '';

document.addEventListener('DOMContentLoaded', async ()=>{
  // foto do topo
  const foto = localStorage.getItem('usuario_foto');
  if(foto) $('fotoPerfilTop').src = foto;

  // voltar
  $('btnVoltar')?.addEventListener('click', (e)=>{ 
    e.preventDefault(); 
    history.length>1?history.back():location.href='suporte.html'; 
  });

  // carregar vídeos
  await carregar();

  // filtros
  document.querySelectorAll('.chip').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      catAtiva = ch.dataset.cat;
      render();
    });
  });

  // busca
  $('q').addEventListener('input', (e)=>{ q = (e.target.value||'').toLowerCase(); render(); });

  // clique → abre vídeo.html
  $('lista').addEventListener('click', (e)=>{
    const card = e.target.closest('.card');
    if(!card) return;
    const id = card.dataset.id;
    location.href = `video.html?id=${encodeURIComponent(id)}`;
  });

  render();
});

async function carregar(){
  try{
    const res = await fetch(DATA_URL, { cache:'no-store' });
    DATA = await res.json();
  }catch{
    DATA = [];
  }
}

function render(){
  const box = $('lista');
  let list = [...DATA];

  if(catAtiva !== 'todos') list = list.filter(v => v.categoria === catAtiva);

  if(q){
    list = list.filter(v => (
      (v.titulo||'').toLowerCase().includes(q) ||
      (v.descricao||'').toLowerCase().includes(q)
    ));
  }

  if(!list.length){
    box.innerHTML = '';
    $('vazio').hidden = false;
    return;
  }
  $('vazio').hidden = true;

  box.innerHTML = list.map(cardHtml).join('');
}

function cardHtml(v){
  return `
    <article class="card" data-id="${String(v.id)}">
      <img src="https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg" alt="">
      <div>
        <div class="ctitle">${v.titulo}</div>
        <div class="cmeta">${v.categoria || ''}</div>
        ${v.descricao ? `<div class="cresumo">${v.descricao}</div>` : ``}
      </div>
    </article>
  `;
}
