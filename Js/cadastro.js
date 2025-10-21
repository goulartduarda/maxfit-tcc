// js/cadastro.js — MaxFit com integração ao banco MySQL
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");
  const tipoInputs = document.querySelectorAll("input[name='userType']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmar = document.getElementById("confirmarSenha").value.trim();
    const tipo = document.querySelector("input[name='userType']:checked")?.value;

    if (!nome || !email || !senha || !confirmar || !tipo) {
      alert("Preencha todos os campos!");
      return;
    }

    if (senha !== confirmar) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, tipo }),
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.sucesso) {
        alert(dados.mensagem || "Erro ao cadastrar usuário.");
        return;
      }

      alert("Cadastro realizado com sucesso!");

      // Salva informações do usuário atual
      localStorage.setItem("current_user_email", email);
      localStorage.setItem("current_user_tipo", tipo);
      localStorage.setItem("current_user_id", dados.id);

      // Redireciona direto para o home correspondente
      if (tipo === "personal") {
        window.location.href = "/pages/home-personal.html";
      } else {
        window.location.href = "/pages/home-aluno.html";
      }
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      alert("Erro ao conectar com o servidor. Tente novamente.");
    }
  });

  // Alterna a seleção visual (efeito de botão selecionado)
  tipoInputs.forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".user-type-option").forEach((opt) => opt.classList.remove("selected"));
      input.parentElement.classList.add("selected");
    });
  });
});
