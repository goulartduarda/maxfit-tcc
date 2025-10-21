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
let editingId = null;

// ===== init =====
document.addEventListener("DOMContentLoaded", () => {
  if (!alunoId) {
    alert("Você precisa estar logado para acessar esta página.");
    location.href = "../../06-entrar.html";
    return;
  }

  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = "../inicio.html");
  });

  const foto = localStorage.getItem("usuario_foto");
  if (foto) $("fotoPerfilTop").src = foto;

  $("data").value = new Date().toISOString().slice(0, 10);
  $("formProg").addEventListener("submit", onSubmit);
  $("btnLimparFiltro").addEventListener("click", () => {
    $("filtroEx").value = "";
    render();
  });
  $("filtroEx").addEventListener("input", render);
  $("btnCancelarEd").addEventListener("click", resetForm);

  render();
});

// ===== submit / salvar =====
async function onSubmit(e) {
  e.preventDefault();

  const data_registro = $("data").value;
  const exercicio = $("exercicio").value.trim();
  const peso = parseFloat($("peso").value);
  const repeticoes = parseInt($("reps").value);
  const series = parseInt($("series").value);
  const rpe = parseFloat($("rpe").value) || null;
  const observacoes = $("obs").value.trim();

  if (!exercicio) return alert("Informe o nome do exercício.");
  if (!(peso > 0)) return alert("Informe o peso corretamente.");

  try {
    const body = {
      aluno_id: alunoId,
      data_registro,
      exercicio,
      peso,
      repeticoes,
      series,
      rpe,
      observacoes
    };

    const url = editingId
      ? `http://127.0.0.1:3000/api/progresso/${editingId}`
      : `http://127.0.0.1:3000/api/progresso`;
    const method = editingId ? "PUT" : "POST";

    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error("Falha ao salvar progresso.");

    alert("✅ Progresso salvo com sucesso!");
    resetForm();
    render();
  } catch (err) {
    console.error("Erro:", err);
    alert("❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.");
  }
}

// ===== limpar formulário =====
function resetForm() {
  editingId = null;
  $("btnSalvar").textContent = "Registrar";
  $("btnCancelarEd").hidden = true;
  $("formProg").reset();
  $("data").value = new Date().toISOString().slice(0, 10);
}

// ===== render histórico =====
async function render() {
  const wrap = $("histList");
  const filtro = ($("filtroEx").value || "").toLowerCase().trim();
  $("vazio").hidden = true;

  try {
    const resp = await fetch(`http://127.0.0.1:3000/api/progresso/${alunoId}`);
    if (!resp.ok) throw new Error();

    const list = await resp.json();
    if (!Array.isArray(list) || list.length === 0) {
      wrap.innerHTML = "";
      $("vazio").hidden = false;
      return;
    }

    let filtered = list.sort((a, b) => b.data_registro.localeCompare(a.data_registro));
    if (filtro) filtered = filtered.filter((x) =>
      (x.exercicio || "").toLowerCase().includes(filtro)
    );

    wrap.innerHTML = filtered.map(itemCard).join("");
  } catch (err) {
    console.error("Erro ao carregar progresso:", err);
    wrap.innerHTML = "<p>Erro ao carregar progresso.</p>";
  }
}

// ===== montar os cards do histórico =====
function itemCard(d) {
  const date = d.data_registro
    ? new Date(d.data_registro).toLocaleDateString("pt-BR")
    : "—";
  return `
  <article class="hcard" data-id="${String(d.id)}">
    <div>
      <div class="h-title">Registro em ${date}</div>
      <div class="h-meta">
        <b>Exercício:</b> ${d.exercicio || "-"}<br>
        <b>Peso:</b> ${d.peso || "-"} kg • 
        <b>Reps:</b> ${d.repeticoes || "-"} • 
        <b>Séries:</b> ${d.series || "-"}<br>
        <b>RPE:</b> ${d.rpe || "-"} • 
        <b>Obs:</b> ${d.observacoes || "-"}
      </div>
    </div>
  </article>`;
}
