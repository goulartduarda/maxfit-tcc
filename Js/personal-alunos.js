document.addEventListener("DOMContentLoaded", () => {
  const listaAlunos = document.getElementById("listaAlunos");
  const btnNovo = document.getElementById("btnNovoAluno");
  const listaDisponiveis = document.getElementById("listaDisponiveis");

  const personalId = localStorage.getItem("current_user_id");

  if (!personalId) {
    alert("Sessão expirada. Faça login novamente.");
    location.href = "/pages/06-entrar.html";
    return;
  }

  // ==============================
  // CARREGAR ALUNOS VINCULADOS
  // ==============================
  async function carregarVinculados() {
    try {
      resp = await fetch(`https://maxfit-backend.onrender.com/api/alunos-do-personal/${personalId}`);
      const alunos = await resp.json();
      listaAlunos.innerHTML = "";

      if (alunos.length === 0) {
        listaAlunos.innerHTML = `<div class="text-center bg-secondary text-white py-2 rounded">Nenhum aluno vinculado ainda.</div>`;
        return;
      }

      alunos.forEach(a => {
        const div = document.createElement("div");
        div.className = "list-aluno";
        div.innerHTML = `
          <span>${a.nome} (${a.email})</span>
          <button class="btn btn-sm btn-outline-danger">Remover</button>
        `;
        div.querySelector("button").addEventListener("click", () => removerAluno(a.id));
        listaAlunos.appendChild(div);
      });
    } catch (e) {
      console.error("Erro ao carregar alunos vinculados:", e);
    }
  }

  // ==============================
  // CARREGAR ALUNOS DISPONÍVEIS
  // ==============================
  async function carregarDisponiveis() {
    try {
      const resp = await fetch("https://maxfit-backend.onrender.com/api/alunos-disponiveis");
      const alunos = await resp.json();
      listaDisponiveis.innerHTML = "";

      if (alunos.length === 0) {
        listaDisponiveis.innerHTML = `<li class="list-group-item bg-secondary text-white">Nenhum aluno disponível.</li>`;
        return;
      }

      alunos.forEach(a => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center bg-dark text-light";
        li.innerHTML = `
          <span>${a.nome} (${a.email})</span>
          <button class="btn btn-sm btn-outline-success">Vincular</button>
        `;
        li.querySelector("button").addEventListener("click", () => vincularAluno(a.id));
        listaDisponiveis.appendChild(li);
      });
    } catch (e) {
      console.error("Erro ao carregar alunos disponíveis:", e);
    }
  }

  // ==============================
  // VINCULAR ALUNO
  // ==============================
  async function vincularAluno(alunoId) {
    try {
      const resp = await fetch("https://maxfit-backend.onrender.com/api/vincular-aluno", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, personalId })
      });

      if (resp.ok) {
        alert("✅ Aluno vinculado com sucesso!");
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalNovoAluno"));
        modal.hide();
        carregarVinculados();
      } else {
        alert("Erro ao vincular aluno.");
      }
    } catch (e) {
      alert("Erro na conexão com o servidor.");
    }
  }

  // ==============================
  // REMOVER ALUNO
  // ==============================
  async function removerAluno(alunoId) {
    if (!confirm("Remover este aluno do personal?")) return;
    try {
      const resp = await fetch(`https://maxfit-backend.onrender.com/api/remover-aluno/${alunoId}`, { method: "PUT" });
      if (resp.ok) {
        alert("Aluno removido!");
        carregarVinculados();
      } else {
        alert("Erro ao remover aluno.");
      }
    } catch {
      alert("Erro na conexão com o servidor.");
    }
  }

  // ==============================
  // BOTÃO "NOVO ALUNO"
  // ==============================
  btnNovo.addEventListener("click", async () => {
    await carregarDisponiveis();
    const modal = new bootstrap.Modal(document.getElementById("modalNovoAluno"));
    modal.show();
  });

  // Inicializar
  carregarVinculados();
});
