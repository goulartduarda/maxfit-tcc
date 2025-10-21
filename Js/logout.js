// js/logout.js

function logout() {
  // Remove o usuário logado
  localStorage.removeItem("current_user_email");

  // (Opcional) limpar tudo da sessão:
  // localStorage.clear();

  // Redireciona para a tela de login
  window.location.href = "/pages/06-entrar.html";
}

// Disponibilizar no escopo global
window.logout = logout;
