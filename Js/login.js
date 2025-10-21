// ===== js/login.js — MaxFit =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const resposta = await fetch("https://maxfit-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.id) {
        alert(dados.mensagem || "E-mail ou senha incorretos.");
        return;
      }

      // ✅ Salva o objeto completo do usuário logado (vindo do banco)
      localStorage.setItem("usuario_logado", JSON.stringify(dados));

      // 🔀 Redireciona de acordo com o tipo de usuário
      if (dados.tipo === "personal") {
        window.location.href = "/pages/home-personal.html";
      } 
      else if (dados.tipo === "aluno") {
        window.location.href = "/pages/alunos/inicio.html";
      } 
      else if (dados.tipo === "admin") {
        window.location.href = "/pages/admin-home.html";
      } 
      else {
        alert("Tipo de usuário não reconhecido. Contate o suporte.");
      }

    } catch (erro) {
      console.error("❌ Erro no login:", erro);
      alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
  });
});
