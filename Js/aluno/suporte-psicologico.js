// ===== Suporte Psicológico (versão simplificada sem API Key) =====

// utilitário rápido
const $ = (id) => document.getElementById(id);

// ajuste de altura mobile
function fixVh() {
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fixVh();
addEventListener("resize", fixVh);
addEventListener("orientationchange", fixVh);

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  // foto do perfil
  const foto = localStorage.getItem("usuario_foto");
  if (foto) {
    const img = $("fotoPerfilTop");
    if (img) img.src = foto;
  }

  // botão voltar
  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = "suporte.html");
  });

  // botões principais
  $("btnGeo").addEventListener("click", () => {
    alert("Função de localização automática requer ativar a Google API Key (opcional).");
  });

  $("btnBuscar").addEventListener("click", onBuscar);
});

// ===== Buscar =====
function onBuscar() {
  const input = $("locInput");
  const local = input.value.trim();

  if (!local) {
    alert("Digite uma cidade ou bairro para buscar psicólogos.");
    return;
  }

  // Cria busca simples no Google Maps
  const query = encodeURIComponent(`Psicólogo em ${local}`);
  window.open(`https://www.google.com/maps/search/${query}`, "_blank");
}
