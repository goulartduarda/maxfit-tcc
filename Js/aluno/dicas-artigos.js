// ===== Ajuste 1vh (mobile) =====
function fixVh() {
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
fixVh();
addEventListener("resize", fixVh);
addEventListener("orientationchange", fixVh);

// ===== Util =====
const $ = (id) => document.getElementById(id);

// ✅ Caminho ajustado para o local correto do JSON
const DATA_URL = "../../data/artigos.json";

let DATA = [];
let catAtiva = "todos";
let q = "";

// ===== Init =====
document.addEventListener("DOMContentLoaded", async () => {
  // avatar topo
  const foto = localStorage.getItem("usuario_foto");
  if (foto) {
    const img = $("fotoPerfilTop");
    if (img) img.src = foto;
  }

  // voltar
  $("btnVoltar")?.addEventListener("click", (e) => {
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = "suporte.html");
  });

  // carregar dados
  await carregar();

  // filtros (chips)
  document.querySelectorAll(".chip").forEach((ch) => {
    ch.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) =>
        c.classList.remove("active")
      );
      ch.classList.add("active");
      catAtiva = ch.dataset.cat;
      render();
    });
  });

  // busca (input)
  $("q").addEventListener("input", (e) => {
    q = (e.target.value || "").toLowerCase();
    render();
  });

  // clique nos cards → detalhe
  $("lista").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;

    // abre artigo.html passando o ID
    location.href = `artigo.html?id=${encodeURIComponent(id)}`;
  });

  render();
});

// ===== Carregar dados =====
async function carregar() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao carregar artigos");
    DATA = await res.json();
  } catch (err) {
    console.error("Erro ao carregar artigos:", err);
    DATA = [];
  }
}

// ===== Renderizar lista =====
function render() {
  const box = $("lista");
  let list = [...DATA];

  if (catAtiva !== "todos") list = list.filter((a) => a.categoria === catAtiva);

  if (q) {
    list = list.filter(
      (a) =>
        (a.titulo || "").toLowerCase().includes(q) ||
        (a.resumo || "").toLowerCase().includes(q) ||
        (a.tags || []).some((t) => (t || "").toLowerCase().includes(q))
    );
  }

  if (!list.length) {
    box.innerHTML = "";
    $("vazio").hidden = false;
    return;
  }

  $("vazio").hidden = true;

  box.innerHTML = list
    .sort((a, b) =>
      (b.atualizadoISO || "").localeCompare(a.atualizadoISO || "")
    )
    .map(cardHtml)
    .join("");
}

// ===== Modelo de card =====
function cardHtml(a) {
  const data = a.atualizadoISO
    ? new Date(a.atualizadoISO).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "";
  const tags = (a.tags || []).slice(0, 3).join(", ");

  return `
    <article class="card" data-id="${String(a.id)}">
      ${
        a.thumb
          ? `<img src="${escapeHtml(a.thumb)}" alt="">`
          : `<div style="width:96px;height:96px;border-radius:10px;background:#fff3e8"></div>`
      }
      <div>
        <div class="ctitle">${escapeHtml(a.titulo || "Artigo")}</div>
        <div class="cmeta">${a.categoria || ""}${
    data ? ` • ${data}` : ""
  }${tags ? ` • ${escapeHtml(tags)}` : ""}</div>
        ${
          a.resumo
            ? `<div class="cresumo">${escapeHtml(a.resumo)}</div>`
            : ``
        }
      </div>
    </article>
  `;
}

// ===== Sanitização HTML =====
function escapeHtml(s) {
  return String(s || "").replace(/[&<>]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
  }[c]));
}
