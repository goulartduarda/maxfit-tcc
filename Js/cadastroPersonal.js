// /js/cadastroPersonal.js
document.addEventListener("DOMContentLoaded", () => {
  // Recupera os dados salvos na etapa 1
  const nome  = localStorage.getItem("cadastro_nome");
  const email = localStorage.getItem("cadastro_email");
  const senha = localStorage.getItem("cadastro_senha");
  const tipo  = localStorage.getItem("cadastro_tipo"); // "personal" ou "aluno"

  // Se quiser mostrar um "Olá, Fulana!"
  const nomeUsuario = document.getElementById("nomeUsuario");
  if (nome && nomeUsuario) nomeUsuario.textContent = `Olá, ${nome}!`;

  // Guarda de rota simples: se não veio da etapa 1, volta
  if (!nome || !email || !senha || tipo !== "personal") {
    // Se preferir, comente o alert
    // alert("Volte e preencha a etapa anterior (dados básicos).");
    // Redireciona para a etapa 1
    // window.location.href = "./08-cadastro.html";
    // return;
  }

  const form = document.getElementById("personalForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const cref = document.getElementById("cref").value.trim();
    const especialidadesSelecionadas = Array.from(
      document.querySelectorAll('input[name="especialidades"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!cref) {
      alert("Informe o CREF.");
      return;
    }
    if (especialidadesSelecionadas.length === 0) {
      alert("Selecione pelo menos uma especialidade.");
      return;
    }

    // Monta o objeto do usuário (personal)
    const usuario = {
      nome,
      email,
      senha, // ⚠️ apenas para DEV; no backend usaremos hash
      tipo: "personal",
      policyAccepted: false,
      dadosPersonal: {
        cref,
        especialidades: especialidadesSelecionadas,
      },
      createdAt: Date.now(),
    };

    // Lê a lista atual de usuários e atualiza (evita duplicar por e-mail)
    const lista = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const idx = lista.findIndex((u) => u.email === usuario.email);
    if (idx >= 0) {
      lista[idx] = usuario;
    } else {
      lista.push(usuario);
    }
    localStorage.setItem("usuarios", JSON.stringify(lista));

    // (Opcional) limpa as chaves temporárias da etapa 1
    localStorage.removeItem("cadastro_nome");
    localStorage.removeItem("cadastro_email");
    localStorage.removeItem("cadastro_senha");
    localStorage.removeItem("cadastro_tipo");

    // (Opcional) marca quem está "logado" agora
    localStorage.setItem("current_user_email", usuario.email);

    // Vai para a política (ajuste o caminho conforme sua estrutura)
    window.location.href = "./politica.html";
  });
});
