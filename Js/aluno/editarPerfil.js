// corrige 1vh em mobile
function fixVh(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fixVh();
addEventListener('resize', fixVh);
addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);

// helpers de data
function isoFromAny(v){
  if(!v) return '';
  // já está AAAA-MM-DD?
  if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // veio dd/mm/aaaa?
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(m) return `${m[3]}-${m[2]}-${m[1]}`;
  // fallback: tenta Date
  const d = new Date(v); if(!isNaN(d)) return d.toISOString().slice(0,10);
  return '';
}
function ptFromISO(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if(isNaN(d)) return '';
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
}

// carregar campos com dados salvos
document.addEventListener('DOMContentLoaded', () => {
  // voltar
  const back = $('btnVoltar');
  back?.addEventListener('click', (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else window.location.href = 'perfil.html';
  });

  // foto
  const fotoSalva = localStorage.getItem('usuario_foto');
  if (fotoSalva) $('fotoPreview').src = fotoSalva;

  // preencher inputs
  $('nome').value  = localStorage.getItem('usuario_nome') || '';
  $('email').value = localStorage.getItem('usuario_email') || '';
  $('nasc').value  = isoFromAny(localStorage.getItem('usuario_nascimento') || '');
  $('sexo').value  = localStorage.getItem('usuario_sexo') || '';
  $('cep').value   = localStorage.getItem('usuario_cep') || '';

  // câmera → abrir seletor de arquivo
  $('btnCamera').addEventListener('click', ()=> $('inputFoto').click());
  $('inputFoto').addEventListener('change', (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = ev => { $('fotoPreview').src = ev.target.result; $('fotoPreview').dataset.nova = ev.target.result; };
    r.readAsDataURL(f);
  });

  // salvar
  $('formEditar').addEventListener('submit', (e)=>{
    e.preventDefault();

    const nome  = $('nome').value.trim();
    const email = $('email').value.trim();
    const nasc  = $('nasc').value; // ISO AAAA-MM-DD
    const sexo  = $('sexo').value;
    const cep   = $('cep').value.trim();

    if(!nome){ alert('Informe seu nome.'); return; }
    if(email && !/^\S+@\S+\.\S+$/.test(email)){ alert('E-mail inválido.'); return; }
    if(cep && !/^\d{5}-?\d{3}$/.test(cep)){ alert('CEP inválido. Use 00000-000.'); return; }

    localStorage.setItem('usuario_nome', nome);
    if(email) localStorage.setItem('usuario_email', email); else localStorage.removeItem('usuario_email');
    if(nasc)  localStorage.setItem('usuario_nascimento', nasc); else localStorage.removeItem('usuario_nascimento');
    if(sexo)  localStorage.setItem('usuario_sexo', sexo); else localStorage.removeItem('usuario_sexo');
    if(cep)   localStorage.setItem('usuario_cep', cep); else localStorage.removeItem('usuario_cep');

    const novaFoto = $('fotoPreview').dataset.nova;
    if(novaFoto) localStorage.setItem('usuario_foto', novaFoto);

    alert('Perfil atualizado!');
    window.location.href = 'perfil.html';
  });

  // =========================
  // SAIR DA CONTA (LOGOUT)
  // =========================
  $('btnLogout')?.addEventListener('click', ()=>{
    if(!confirm('Deseja sair da sua conta?')) return;

    // Limpa chaves do usuário/sessão (ajuste os nomes conforme sua auth)
    const toClear = [];
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(k.startsWith('usuario_') || k==='usuario_id' || k==='auth_token' || k==='usuario_logado'){
        toClear.push(k);
      }
    }
    toClear.forEach(k => localStorage.removeItem(k));

    try{ sessionStorage.clear(); }catch(e){}

    // Redireciona (troque para sua tela de login, se houver)
     window.location.href = '../homepage/06-entrar.html';
  });

});
