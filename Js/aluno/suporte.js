// ===== suporte.js =====
const $ = (id)=>document.getElementById(id);

function fixVh(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const alunoId = localStorage.getItem("current_user_id") || null;

// ===== inicialização =====
document.addEventListener('DOMContentLoaded', ()=>{
  const foto = localStorage.getItem('usuario_foto');
  if (foto) { const img = $('fotoPerfilTop'); if (img) img.src = foto; }

  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = '../index.html');
  });

  $('formSuporte')?.addEventListener('submit', enviarMensagem);
  carregarHistorico();
});

// ===== envio de mensagem =====
async function enviarMensagem(e){
  e.preventDefault();
  const nome = $('nome').value.trim();
  const email = $('email').value.trim();
  const assunto = $('assunto').value.trim();
  const mensagem = $('mensagem').value.trim();

  if(!nome || !email || !assunto || !mensagem){
    alert("Preencha todos os campos antes de enviar.");
    return;
  }

  try {
    const resp = await fetch("https://maxfit-backend.onrender.com/api/suporte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aluno_id: alunoId,
        nome,
        email,
        assunto,
        mensagem
      })
    });

    const dados = await resp.json();
    if (!resp.ok || !dados.sucesso) throw new Error(dados.mensagem || "Erro ao enviar");

    alert("Mensagem enviada com sucesso!");
    $('formSuporte').reset();
    carregarHistorico();

  } catch (err) {
    console.error(err);
    alert("Erro ao enviar mensagem. Tente novamente.");
  }
}

// ===== histórico do aluno =====
async function carregarHistorico(){
  const box = $('historicoSuporte');
  if(!box) return;
  box.innerHTML = "<p>Carregando mensagens...</p>";

  try {
    const resp = await fetch(`https://maxfit-backend.onrender.com/api/suporte/${alunoId}`);
    const list = await resp.json();

    if(!Array.isArray(list) || list.length === 0){
      box.innerHTML = "<p>Você ainda não enviou mensagens de suporte.</p>";
      return;
    }

    box.innerHTML = list.map(msg => {
      const data = new Date(msg.data_envio).toLocaleString("pt-BR");
      return `
        <div class="card-msg">
          <div class="msg-head">
            <strong>${msg.assunto}</strong>
            <span>${data}</span>
          </div>
          <div class="msg-body">${escapeHtml(msg.mensagem)}</div>
          <div class="msg-status">${msg.status === 'respondido' ? '✅ Respondido' : '⏳ Aguardando resposta'}</div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error(err);
    box.innerHTML = "<p>Erro ao carregar histórico de suporte.</p>";
  }
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
}
