document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("senhaForm");
  const emailInput = document.getElementById("email");
  const mensagem = document.getElementById("mensagem");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) return;

    // Simulação de envio de e-mail
    mensagem.textContent = `📩 Um link de redefinição foi enviado para ${email}`;
    mensagem.style.display = "block";

    // Desabilita botão para evitar múltiplos envios
    form.querySelector("button").disabled = true;
  });
});
