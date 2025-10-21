// helpers
const $ = (id)=>document.getElementById(id);
const KEY = ()=> `desafios:${localStorage.getItem('usuario_id') || 'default'}`;

function loadList(){ try{ return JSON.parse(localStorage.getItem(KEY())||'[]'); }catch{ return []; } }
function saveList(list){ localStorage.setItem(KEY(), JSON.stringify(list)); }

document.addEventListener('DOMContentLoaded', ()=>{
  const foto = localStorage.getItem('usuario_foto');
  if (foto) $('fotoPerfilTop').src = foto;

  $('btnVoltar')?.addEventListener('click', (e)=>{ e.preventDefault(); history.length>1?history.back():location.href='desafio.html'; });

  const url = new URL(location.href);
  const id  = url.searchParams.get('id');
  if(!id){ alert('Desafio não informado.'); location.href='desafio.html'; return; }

  const list = loadList();
  const idx  = list.findIndex(d => String(d.id) === String(id));
  if(idx === -1){ alert('Desafio não encontrado.'); location.href='desafio.html'; return; }
  const d = list[idx];

  // preenche
  $('titulo').value    = d.titulo || '';
  $('descricao').value = d.descricao || '';
  $('ate').value       = d.ateISO || '';

  // salvar
  $('formEditar').addEventListener('submit', (e)=>{
    e.preventDefault();

    const titulo = $('titulo').value.trim();
    const descricao = $('descricao').value.trim();
    const ateISO = $('ate').value;

    if(!titulo){ alert('Informe o título.'); return; }
    if(!ateISO){ alert('Informe a data de término.'); return; }

    list[idx] = { ...d, titulo, descricao, ateISO, atualizadoEmISO: new Date().toISOString() };
    saveList(list);

    alert('Desafio atualizado!');
    location.href = 'desafio.html';
  });
});
