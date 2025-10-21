// corrige 1vh em mobile (para a “tela de celular” ficar certinha)
function fixVh(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fixVh();
addEventListener('resize', fixVh);
addEventListener('orientationchange', fixVh);

// util rápido
const $ = (id)=>document.getElementById(id);

// navegação dos botões do topo
document.addEventListener('DOMContentLoaded', () => {
  const back = $('btnVoltar');
  if (back) {
    back.addEventListener('click', (e) => {
      e.preventDefault();
      // tenta voltar; se não houver histórico, vai para index
      if (history.length > 1) history.back();
      else window.location.href = '../index.html';
    });
  }

  const btnEditar = $('btnEditar');
  if (btnEditar) {
    btnEditar.type = 'button'; // evita submit se estiver dentro de um <form>
    btnEditar.addEventListener('click', () => {
      // redireciona para a página de edição dentro de /pages
      window.location.href = 'editarPerfil.html';
    });
  }

  loadProfile();
});

// carrega dados do cadastro
function loadProfile(){
  const nome = localStorage.getItem('usuario_nome') || '—';
  const email = localStorage.getItem('usuario_email') || '—';
  const nascISO = localStorage.getItem('usuario_nascimento') || '';
  const sexo = localStorage.getItem('usuario_sexo') || '—';
  const cep = localStorage.getItem('usuario_cep') || '—';
  const foto = localStorage.getItem('usuario_foto'); // base64 opcional
  let joined = localStorage.getItem('usuario_joined');

  // se nunca setou o "entrou dia", seta agora
  if(!joined){
    joined = new Date().toISOString();
    localStorage.setItem('usuario_joined', joined);
  }

  // formata datas para pt-BR
  function fmtLong(dISO){
    if(!dISO) return '—';
    const d = new Date(dISO);
    if(isNaN(d)) return '—';
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  }

  $('nome').textContent = nome;
  $('email').textContent = email;
  $('nasc').textContent = fmtLong(nascISO);
  $('sexo').textContent = sexo;
  $('cep').textContent = cep;
  $('entrou').textContent = `Entrou dia ${fmtLong(joined)}`;

  if(foto) $('fotoPerfil').src = foto;
}
