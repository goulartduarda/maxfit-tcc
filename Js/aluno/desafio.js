// ===== /Aluno-MaxFit/js/desafio.js =====
console.log("desafio.js v4 — totalmente integrado à API");

// ===== ajuste 1vh mobile =====
function fixVh() {
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fixVh();
addEventListener("resize", fixVh);
addEventListener("orientationchange", fixVh);

const $ = (id) => document.getElementById(id);
const alunoId = localStorage.getItem("current_user_id");

// ===== estado =====
let filtro = "ativos"; // 'todos' | 'ativos' | 'concluidos'

// ===== init =====
document.addEventListener("DOMContentLoaded", () => {
  // voltar
  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = "../index.html";
  });

  // foto do usuário
  const foto = localStorage.getItem("usuario_foto");
  if (foto && $("fotoPerfil")) $("fotoPerfil").src = foto;

  // filtros
  document.querySelectorAll(".chip").forEach((ch) => {
    ch.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      ch.classList.add("active");
      filtro = ch.dataset.f;
      render();
    });
  });

  // botões principais
  $("btnCriar")?.addEventListener("click", () => (location.href = "criarDesafio.html"));
  $("btnParticipar")?.addEventListener("click", () => (location.href = "participarTreinos.html"));

  // clique nos cards
  $("listaDesafios").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;
    const owned = card.dataset.owned === "1";

    if (!owned) {
      alert("Somente desafios criados por você podem ser editados ou excluídos.");
      return;
    }
    abrirSheetAcoes(id);
  });

  render();
});

// ===== buscar desafios do servidor =====
async function getDesafios() {
  try {
    const resp = await fetch(`http://127.0.0.1:3000/api/desafios/${alunoId}`);
    if (!resp.ok) throw new Error("Erro ao carregar desafios.");
    const list = await resp.json();
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Erro em getDesafios:", err);
    return [];
  }
}

// ===== render =====
async function render() {
  const box = $("listaDesafios");
  let list = await getDesafios();

  if (filtro === "ativos") list = list.filter((d) => d.status !== "concluido");
  if (filtro === "concluidos") list = list.filter((d) => d.status === "concluido");

  if (list.length === 0) {
    const msg =
      filtro === "concluidos"
        ? "Você ainda não concluiu desafios."
        : "Você ainda não está participando de desafios.";
    box.innerHTML = `<div class="empty">${msg}<br>Use <b>Criar desafios</b> ou aguarde um convite.</div>`;
    return;
  }

  list.sort((a, b) => new Date(a.data_fim) - new Date(b.data_fim));
  box.innerHTML = list.map(cardHtml).join("");
}

function cardHtml(d) {
  const data = d.data_fim
    ? new Date(d.data_fim).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
    : "—";
  const logo = d.logo || "../img/logo.png";
  const owned = String(d.aluno_id) === String(alunoId) ? "1" : "0";
  const status =
    d.status === "concluido" ? '<span class="badge done">Concluído</span>' : "";

  return `
  <div class="card" data-id="${String(d.id)}" data-owned="${owned}">
    <img class="logo" src="${logo}" alt="">
    <div>
      <div class="ctitle">${escapeHtml(d.titulo || "Desafio")} ${status}</div>
      <div class="deadline">Até ${data}</div>
    </div>
  </div>`;
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

// ======= Sheet de ações =======
function abrirSheetAcoes(id) {
  fecharSheetAcoes();
  const wrap = document.createElement("div");
  wrap.className = "sheet-backdrop";
  wrap.innerHTML = `
    <div class="sheet">
      <div class="sheet-handle"></div>
      <button class="sheet-btn" data-act="edit">Editar</button>
      <button class="sheet-btn" data-act="done">Marcar como concluído</button>
      <button class="sheet-btn danger" data-act="delete">Excluir</button>
      <button class="sheet-btn outline" data-act="cancel">Cancelar</button>
    </div>
  `;
  document.body.appendChild(wrap);

  wrap.addEventListener("click", (e) => {
    if (e.target === wrap) fecharSheetAcoes();
  });

  wrap.querySelectorAll(".sheet-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const act = btn.dataset.act;
      if (act === "edit") {
        location.href = `editarDesafio.html?id=${encodeURIComponent(id)}`;
      } else if (act === "done") {
        await concluirDesafio(id);
      } else if (act === "delete") {
        await excluirDesafio(id);
      } else {
        fecharSheetAcoes();
      }
    });
  });
}

function fecharSheetAcoes() {
  document.querySelectorAll(".sheet-backdrop").forEach((el) => el.remove());
}

// ===== Ações =====
async function concluirDesafio(id) {
  try {
    const resp = await fetch(`http://127.0.0.1:3000/api/desafios/${id}/concluir`, {
      method: "PUT",
    });
    if (!resp.ok) throw new Error();
    fecharSheetAcoes();
    await render();
    alert("✅ Desafio marcado como concluído!");
  } catch {
    alert("❌ Erro ao marcar desafio como concluído.");
  }
}

async function excluirDesafio(id) {
  if (!confirm("Deseja realmente excluir este desafio?")) return;
  try {
    const resp = await fetch(`http://127.0.0.1:3000/api/desafios/${id}`, {
      method: "DELETE",
    });
    if (!resp.ok) throw new Error();
    fecharSheetAcoes();
    await render();
    alert("🗑️ Desafio excluído com sucesso!");
  } catch {
    alert("❌ Erro ao excluir desafio.");
  }
}
