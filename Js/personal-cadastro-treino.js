// ============================================================
// personal-cadastro-treino.js — MaxFit 💪
// ============================================================
const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {
  const selectAluno = document.getElementById("aluno");
  const formTreino = document.getElementById("formTreino");
  const containerExercicios = document.getElementById("exerciciosContainer");
  const btnAddExercicio = document.getElementById("btnAddExercicio");

  // ============================================================
  // 🔹 Recupera dados do personal logado (padrão atual)
  // ============================================================
  const personalId = localStorage.getItem("current_user_id");
  const personalTipo = localStorage.getItem("current_user_tipo");

  if (!personalId || personalTipo !== "personal") {
    alert("Acesso restrito. Faça login novamente como Personal.");
    window.location.href = "/pages/06-entrar.html";
    return;
  }

  // ============================================================
  // 🔹 1. Carregar alunos vinculados ao personal
  // ============================================================
  async function carregarAlunosVinculados() {
    try {
      const resp = await fetch(`${API}/api/alunos-do-personal/${personalId}`);
      const alunos = await resp.json();

      selectAluno.innerHTML = `<option value="">Selecione o aluno</option>`;

      if (!Array.isArray(alunos) || alunos.length === 0) {
        selectAluno.innerHTML = `<option value="">Nenhum aluno vinculado</option>`;
        return;
      }

      alunos.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = `${a.nome} (${a.email})`;
        selectAluno.appendChild(opt);
      });
    } catch (err) {
      console.error("Erro ao carregar alunos vinculados:", err);
      selectAluno.innerHTML = `<option value="">Erro ao carregar alunos</option>`;
    }
  }

  // ============================================================
  // 🔹 2. Adicionar novo bloco de exercício
  // ============================================================
  function criarCampoExercicio() {
    const div = document.createElement("div");
    div.className = "row g-2 mb-3 align-items-center border-bottom pb-2";

    div.innerHTML = `
      <div class="col-md-4">
        <input type="text" class="form-control nome-ex" placeholder="Nome do exercício" required>
      </div>
      <div class="col-md-2">
        <input type="number" class="form-control series-ex" placeholder="Séries" min="1" required>
      </div>
      <div class="col-md-2">
        <input type="number" class="form-control repeticoes-ex" placeholder="Reps" min="1" required>
      </div>
      <div class="col-md-2">
        <input type="text" class="form-control descanso-ex" placeholder="Descanso (seg)">
      </div>
      <div class="col-md-2 text-end">
        <button type="button" class="btn btn-sm btn-outline-danger remover-ex">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    div.querySelector(".remover-ex").addEventListener("click", () => div.remove());
    containerExercicios.appendChild(div);
  }

  // ============================================================
  // 🔹 3. Salvar treino completo no banco
  // ============================================================
  async function salvarTreino(e) {
    e.preventDefault();

    const aluno_id = selectAluno.value;
    const titulo = document.getElementById("titulo").value.trim();
    const objetivo = document.getElementById("objetivo").value.trim();
    const nivel = document.getElementById("nivel").value;
    const validade = document.getElementById("validade").value;

    if (!aluno_id || !titulo) {
      alert("Selecione um aluno e informe o título do treino!");
      return;
    }

    // Monta lista de exercícios
    const exercicios = [];
    document.querySelectorAll("#exerciciosContainer .row").forEach(div => {
      const nome = div.querySelector(".nome-ex").value.trim();
      const series = div.querySelector(".series-ex").value.trim();
      const repeticoes = div.querySelector(".repeticoes-ex").value.trim();
      const descanso = div.querySelector(".descanso-ex").value.trim();
      if (nome) exercicios.push({ nome, series, repeticoes, descanso });
    });

    if (exercicios.length === 0) {
      alert("Adicione ao menos um exercício!");
      return;
    }

    const treino = {
      aluno_id,
      personal_id: personalId,
      titulo,
      objetivo,
      nivel,
      validade,
      exercicios
    };

    try {
      const resp = await fetch(`${API}/api/treinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treino)
      });

      const data = await resp.json();

      if (resp.ok && data.sucesso) {
        alert("✅ Treino salvo com sucesso!");
        formTreino.reset();
        containerExercicios.innerHTML = "";
      } else {
        console.error("Erro no retorno da API:", data);
        alert("❌ Erro ao salvar treino. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao salvar treino:", err);
      alert("Erro ao conectar com o servidor.");
    }
  }

  // ============================================================
  // 🔹 4. Eventos
  // ============================================================
  btnAddExercicio.addEventListener("click", criarCampoExercicio);
  formTreino.addEventListener("submit", salvarTreino);

  // ============================================================
  // 🔹 5. Inicialização
  // ============================================================
  carregarAlunosVinculados();
});
