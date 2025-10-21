// ===== ficha.js — versão compatível com o backend real =====
console.log("✅ ficha.js (versão final compatível) carregado");

const API = "https://maxfit-backend.onrender.com";
const $ = (id) => document.getElementById(id);

function fixVh() {
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fixVh();
addEventListener("resize", fixVh);
addEventListener("orientationchange", fixVh);

// =============================================================
// 🔹 Buscar todos os treinos do aluno logado
// =============================================================
async function apiGetTreinosAluno() {
  // Recupera o usuário logado (objeto salvo no login)
const usuario = JSON.parse(localStorage.getItem("usuario_logado") || "{}");
const alunoId = usuario.id;

if (!alunoId || usuario.tipo !== "aluno") {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "/pages/06-entrar.html";
  return [];
}


  try {
    const resp = await fetch(`${API}/api/treinos/${alunoId}`);
    if (!resp.ok) throw new Error("Falha ao buscar treinos");
    const treinos = await resp.json();
    console.log("📋 Treinos recebidos:", treinos);
    return treinos;
  } catch (err) {
    console.error("Erro ao buscar treinos:", err);
    return [];
  }
}

// =============================================================
// 🔹 Renderizar cards de treino
// =============================================================
function planCardHTML(treino) {
  const dataValidade = treino.validade
    ? new Date(treino.validade).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return `
    <div class="plan-card" data-id="${treino.id}">
      <div class="plan-title">${treino.titulo}</div>
      <div class="plan-line">
        ${treino.nivel ? `<span class="pill-mini">${treino.nivel}</span>` : ""}
        ${treino.objetivo ? `<span class="sep">•</span><span>${treino.objetivo}</span>` : ""}
      </div>
      <div class="plan-assign">Validade: ${dataValidade}</div>
    </div>
  `;
}

// =============================================================
// 🔹 Renderizar detalhe de treino (exercícios)
// =============================================================
function renderPlanDetail(treino) {
  $("planTitle").textContent = treino.titulo || "—";
  $("planMeta").textContent = [treino.nivel, treino.objetivo].filter(Boolean).join(" • ");

  if (!treino.exercicios || treino.exercicios.length === 0) {
    $("daysWrap").innerHTML = `<div class="ex-empty">Nenhum exercício cadastrado.</div>`;
    return;
  }

  $("daysWrap").innerHTML = treino.exercicios
    .map(
      (ex, i) => `
      <details class="day" ${i === 0 ? "open" : ""}>
        <summary class="day-head">
          <span class="day-name">${i + 1}. ${ex.nome}</span>
          <ion-icon name="chevron-down-outline"></ion-icon>
        </summary>
        <div class="day-body">
          <div class="ex-meta">
            <span>${ex.series} séries</span> • 
            <span>${ex.repeticoes} repetições</span> • 
            <span>${ex.descanso}s descanso</span>
          </div>
          ${
            ex.observacoes
              ? `<div class="ex-notes">Observações: ${ex.observacoes}</div>`
              : ""
          }
        </div>
      </details>
    `
    )
    .join("");
}

// =============================================================
// 🔹 Alternar entre lista e detalhe
// =============================================================
function toggleView(mode) {
  if (mode === "detail") {
    $("secLista").style.display = "none";
    $("secDetalhe").style.display = "block";
  } else {
    $("secDetalhe").style.display = "none";
    $("secLista").style.display = "block";
  }
}

// =============================================================
// 🔹 Inicialização da página
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
  const foto = localStorage.getItem("usuario_foto");
  if (foto) $("fotoPerfilTop").src = foto;

  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = "../index.html");
  });

  $("btnVoltarLista")?.addEventListener("click", () => toggleView("list"));

  const treinos = await apiGetTreinosAluno();

  if (!treinos.length) {
    $("planEmpty").style.display = "block";
    $("planList").innerHTML = "";
  } else {
    $("planEmpty").style.display = "none";
    $("planList").innerHTML = treinos.map(planCardHTML).join("");
  }

  // Clique em um treino para abrir detalhe
  $("planList").addEventListener("click", (e) => {
    const card = e.target.closest(".plan-card");
    if (!card) return;

    const treino = treinos.find((t) => t.id == card.dataset.id);
    if (!treino) {
      alert("Treino não encontrado.");
      return;
    }

    renderPlanDetail(treino);
    toggleView("detail");
  });
});
