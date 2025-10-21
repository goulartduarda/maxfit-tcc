// ===== /Js/aluno/participarTreinos.js =====
console.log("participarTreinos.js — conectado à API de desafios");

// ===== Helpers =====
const $ = (id) => document.getElementById(id);
const alunoId = localStorage.getItem("current_user_id");

// ===== ajuste de altura mobile =====
function fixVh() {
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fixVh();
addEventListener("resize", fixVh);
addEventListener("orientationchange", fixVh);

// ===== init =====
document.addEventListener("DOMContentLoaded", () => {
  // Botão voltar
  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = "desafio.html");
  });

  // Foto topo
  const foto = localStorage.getItem("usuario_foto");
  if (foto) $("fotoPerfilTop").src = foto;

  // Carregar desafios
  carregarDesafios();
});

// ===== carregar desafios =====
async function carregarDesafios() {
  const main = $("participarMain");
  main.innerHTML = "<p style='text-align:center'>Carregando desafios...</p>";

  try {
    // Busca TODOS os desafios do banco (não apenas do aluno)
    const resp = await fetch(`https://maxfit-backend.onrender.com/api/desafios`);
    if (!resp.ok) throw new Error("Erro ao buscar desafios.");

    const desafios = await resp.json();

    if (!Array.isArray(desafios) || desafios.length === 0) {
      main.innerHTML = `
        <div class="empty" style="text-align:center; margin-top:20px;">
          Nenhum desafio disponível no momento.
        </div>`;
      return;
    }

    // Mostra apenas desafios que NÃO foram criados pelo próprio aluno
    const filtrados = desafios.filter((d) => String(d.aluno_id) !== String(alunoId));

    if (filtrados.length === 0) {
      main.innerHTML = `
        <div class="empty" style="text-align:center; margin-top:20px;">
          Nenhum desafio disponível para participar.
        </div>`;
      return;
    }

    // Renderiza cards
    main.innerHTML = filtrados.map(cardHtml).join("");

    // Botão Participar
    main.querySelectorAll("[data-act='join']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await participarDesafio(id);
      });
    });
  } catch (err) {
    console.error("Erro ao carregar desafios:", err);
    main.innerHTML =
      "<p style='text-align:center'>❌ Erro ao carregar desafios. Verifique o backend.</p>";
  }
}

// ===== render dos cards =====
function cardHtml(d) {
  const dataFim = d.data_fim
    ? new Date(d.data_fim).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "—";

  return `
  <section class="card" style="margin:12px;">
    <h2 class="sec-title" style="margin-bottom:4px;">${escapeHtml(d.titulo)}</h2>
    <p style="font-size:0.95rem; color:#555; margin-bottom:6px;">
      ${escapeHtml(d.descricao || "Sem descrição.")}
    </p>
    <p style="font-size:0.85rem; color:#888;">
      Criado por: <b>${escapeHtml(d.nome_aluno || "Desconhecido")}</b><br>
      Término: <b>${dataFim}</b>
    </p>
    <div class="actions" style="margin-top:12px; display:flex; justify-content:flex-end;">
      <button class="btn-participar" data-act="join" data-id="${d.id}">Participar</button>
    </div>
  </section>`;
}

// ===== Participar de um desafio (rota real) =====
async function participarDesafio(id) {
  try {
    const resp = await fetch(`https://maxfit-backend.onrender.com/api/desafios/${id}/participar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aluno_id: alunoId }),
    });

    if (!resp.ok) throw new Error("Erro ao participar do desafio.");

    const data = await resp.json();
    alert("✅ Agora você está participando deste desafio!");
    console.log("Resposta do servidor:", data);

    carregarDesafios();
  } catch (err) {
    console.error(err);
    alert("❌ Erro ao participar do desafio. Verifique o servidor e tente novamente.");
  }
}

// ===== segurança =====
function escapeHtml(s) {
  return String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

/* ===== estilo laranja MaxFit ===== */
const style = document.createElement("style");
style.textContent = `
.btn-participar {
  background: linear-gradient(180deg, #FF7A00 0%, #FF5500 100%);
  color: #fff;
  font-weight: 600;
  padding: 8px 22px;
  border: none;
  border-radius: 999px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(255,85,0,0.3);
}
.btn-participar:hover {
  transform: scale(1.05);
  background: linear-gradient(180deg, #FF8C1A 0%, #FF6A00 100%);
  box-shadow: 0 4px 10px rgba(255,85,0,0.4);
}
.btn-participar:active {
  transform: scale(0.96);
  background: linear-gradient(180deg, #FF6A00 0%, #E64A00 100%);
}
`;
document.head.appendChild(style);
