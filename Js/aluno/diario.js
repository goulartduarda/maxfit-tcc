// ===== Ajuste de 1vh no mobile =====
function fixVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fixVh();
addEventListener('resize', fixVh);
addEventListener('orientationchange', fixVh);

const $ = (id) => document.getElementById(id);

// ===== Estado =====
let selectedMood = 2; // padrão "neutro"
const alunoId = localStorage.getItem("current_user_id");

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  const foto = localStorage.getItem('usuario_foto');
  if (foto && $('fotoPerfil')) $('fotoPerfil').src = foto;

  $('btnVoltar')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = '../index.html';
  });

  const today = new Date();
  $('data').value = today.toISOString().slice(0, 10);

  // moods
  document.querySelectorAll('.mood').forEach(btn => {
    if (Number(btn.dataset.mood) === selectedMood) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = Number(btn.dataset.mood);
    });
  });

  // adicionar imagem
  $('btnAddImg')?.addEventListener('click', () => $('inputImg').click());
  $('inputImg')?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      $('previewImg').src = ev.target.result;
      $('previewImg').style.display = 'block';
    };
    r.readAsDataURL(f);
  });

  $('btnSalvar').addEventListener('click', salvarEntrada);
  renderHistorico();
});

// ===== SALVAR no servidor =====
async function salvarEntrada() {
  const data = $('data').value;
  const treino = $('treino').value.trim();
  const avaliacao = $('avaliacao').value;
  const objetivo = $('objetivo').value.trim();
  const feito = $('feito').value.trim();
  const senti = $('senti').value.trim();
  const img = $('previewImg').src || '';

  if (!data) {
    alert('Selecione a data.');
    return;
  }
  if (!treino && !objetivo && !feito && !senti && !img) {
    alert('Preencha ao menos um campo.');
    return;
  }

  try {
    const body = {
      aluno_id: alunoId,
      data,
      treino_executado: treino,
      avaliacao,
      objetivo,
      feito_hoje: feito,
      como_me_senti: senti,
      imagem: img || null
    };

    const resp = await fetch("http://127.0.0.1:3000/api/diarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error("Erro ao salvar entrada");
    alert("✅ Entrada registrada com sucesso!");

    limparCampos();
    renderHistorico();
  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("❌ Erro ao salvar no servidor. Verifique se o backend está rodando.");
  }
}

// ===== CARREGAR do servidor =====
async function renderHistorico() {
  const box = $('historico');
  box.innerHTML = `<div class="item"><div class="item-sub">Carregando...</div></div>`;

  try {
    const resp = await fetch(`http://127.0.0.1:3000/api/diarios/${alunoId}`);
    if (!resp.ok) throw new Error("Erro ao buscar histórico.");
    const list = await resp.json();

    if (!Array.isArray(list) || list.length === 0) {
      box.innerHTML = `<div class="item"><div class="item-sub">Sem registros ainda.</div></div>`;
      return;
    }

    box.innerHTML = list.map((e) => {
      const dataPt = new Date(e.data).toLocaleDateString('pt-BR');
      const esc = (s) => (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      return `
        <div class="item" style="margin-bottom:10px;">
          <div class="item-head"><b>${dataPt}</b> — ${esc(e.treino_executado || "-")}</div>
          <div class="item-row"><b>Objetivo:</b> ${esc(e.objetivo || "-")}</div>
          <div class="item-row"><b>Feito hoje:</b> ${esc(e.feito_hoje || "-")}</div>
          <div class="item-row"><b>Como me senti:</b> ${esc(e.como_me_senti || "-")}</div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
    box.innerHTML = `<div class="item"><div class="item-sub">Erro ao carregar histórico.</div></div>`;
  }
}

// ===== Utils =====
function limparCampos() {
  $('treino').value = '';
  $('avaliacao').value = '';
  $('objetivo').value = '';
  $('feito').value = '';
  $('senti').value = '';
  $('previewImg').src = '';
  $('previewImg').style.display = 'none';
}
