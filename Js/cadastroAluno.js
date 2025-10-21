// js/cadastroAluno.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("alunoForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Dados básicos da etapa 1
    const nome  = localStorage.getItem("cadastro_nome");
    const email = localStorage.getItem("cadastro_email");
    const senha = localStorage.getItem("cadastro_senha");
    const tipo  = localStorage.getItem("cadastro_tipo");

    if (!nome || !email || !senha || tipo !== "aluno") {
      alert("Erro: dados básicos não encontrados. Volte e refaça o cadastro.");
      window.location.href = "./08-cadastro.html";
      return;
    }

    // Campo adicional do aluno
    const objetivo = document.getElementById("objetivo").value.trim();
    if (!objetivo) {
      alert("Informe seu objetivo.");
      return;
    }

    // Objeto do aluno
    const usuario = {
      nome,
      email,
      senha, // ⚠️ apenas para DEV; no backend usaremos hash
      tipo: "aluno",
      policyAccepted: false,
      dadosAluno: {
        objetivo
      },
      createdAt: Date.now(),
    };

    // Atualiza lista de usuários
    const lista = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const idx = lista.findIndex((u) => u.email === usuario.email);
    if (idx >= 0) {
      lista[idx] = usuario;
    } else {
      lista.push(usuario);
    }
    localStorage.setItem("usuarios", JSON.stringify(lista));

    // Limpa temporários
    localStorage.removeItem("cadastro_nome");
    localStorage.removeItem("cadastro_email");
    localStorage.removeItem("cadastro_senha");
    localStorage.removeItem("cadastro_tipo");

    // Marca logado
    localStorage.setItem("current_user_email", usuario.email);

    // Redireciona (política ou home do aluno)
    window.location.href = "./politica.html";
  });
});
