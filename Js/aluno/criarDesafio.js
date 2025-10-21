// ==================== criarDesafio.js ====================
// JS para a página /pages/alunos/criarDesafio.html

// ===== Ajuste de 1vh no mobile =====
function fixVh() {
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fixVh();
addEventListener("resize", fixVh);
addEventListener("orientationchange", fixVh);

// ===== Helpers =====
const $ = (id) => document.getElementById(id);
const aluno_id = localStorage.getItem("current_user_id");
const alunoNome = localStorage.getItem("usuario_nome") || "Aluno";

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  // Foto e nome no topo
  const foto = localStorage.getItem("usuario_foto");
  if (foto) {
    if ($("fotoPerfilTop")) $("fotoPerfilTop").src = foto;
    if ($("fotoAluno")) $("fotoAluno").src = foto;
  }
  if ($("nomeAluno")) $("nomeAluno").value = alunoNome;

  // Botão voltar
  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = "desafio.html";
  });

  // Se veio com ?id=..., ativa modo editar/concluir
  const url = new URL(location.href);
  const id = url.searchParams.get("id");
  const btnIrEditar = $("btnIrEditar");
  const btnConcluir = $("btnConcluir");

  if (id) {
    if (btnIrEditar) {
      btnIrEditar.style.display = "inline-block";
      btnIrEditar.href = `editarDesafio.html?id=${encodeURIComponent(id)}`;
    }
    if (btnConcluir) {
      btnConcluir.style.display = "inline-block";
      btnConcluir.addEventListener("click", () => concluirDesafio(id));
    }
  }

  // Envio do formulário
  $("formCriar")?.addEventListener("submit", salvarDesafio);
});

// ===== Criar desafio no servidor =====
async function salvarDesafio(e) {
  e.preventDefault();

  const titulo = $("titulo").value.trim();
  const descricao = $("descricao").value.trim();
  const data_fim = $("ate").value; // input de data (yyyy-mm-dd)

  if (!titulo) {
    alert("Informe o título do desafio.");
    return;
  }
  if (!data_fim) {
    alert("Informe a data de término do desafio.");
    return;
  }

  // Monta corpo conforme backend atual
  const body = { aluno_id, titulo, descricao, data_fim };

  try {
    const resp = await fetch("http://127.0.0.1:3000/api/desafios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const erro = await resp.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao criar desafio");
    }

    alert("✅ Desafio criado com sucesso!");
    window.location.href = "desafio.html";
  } catch (err) {
    console.error("Erro ao salvar desafio:", err);
    alert("❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.");
  }
}

// ===== Concluir desafio existente =====
async function concluirDesafio(id) {
  try {
    const resp = await fetch(`http://127.0.0.1:3000/api/desafios/${id}/concluir`, {
      method: "PUT",
    });

    if (!resp.ok) throw new Error("Erro ao concluir desafio");
    alert("✅ Desafio marcado como concluído!");
    window.location.href = "desafio.html";
  } catch (err) {
    console.error(err);
    alert("❌ Erro ao conectar com o servidor.");
  }
}
