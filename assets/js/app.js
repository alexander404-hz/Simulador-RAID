/* ============================================================
   ESTADO
   ============================================================ */
const MAX_BAHIAS = 12;
const TAMANOS = [500, 1000, 2000, 3000, 4000, 6000, 8000, 10000];
let discos = []; // { id, capacidad }
let nextId = 0;

const paneles = {
  1: {
    select: document.getElementById("select1"),
    tipo: "0",
    pie: null,
    bar: null,
  },
  2: {
    select: document.getElementById("select2"),
    tipo: "1",
    pie: null,
    bar: null,
  },
};

const COLOR_CAPACIDAD = "#2dd4bf";
const COLOR_SEGURIDAD = "#ffb100";
const COLOR_SINUSAR = "#3a4360";

/* ============================================================
   PALETA DE DISCOS
   ============================================================ */
function formatoCapacidad(gb) {
  return gb === 500 ? "500 GB" : gb / 1000 + " TB";
}

function pintarPaleta() {
  const cont = document.getElementById("paleta-discos");
  cont.innerHTML = TAMANOS.map(
    (gb) => `
    <button class="disk-card" ${discos.length >= MAX_BAHIAS ? "disabled" : ""} onclick="agregarDisco(${gb})" aria-label="Insertar disco de ${formatoCapacidad(gb)}">
      <img src="img/disco.png" alt="">
      <span>${formatoCapacidad(gb)}</span>
      <small>insertar</small>
    </button>
  `,
  ).join("");
}

/* ============================================================
   CHASIS: RIEL DE LEDS + BAHÍAS
   ============================================================ */
function pintarChasis() {
  const rail = document.getElementById("rail-disks");
  rail.innerHTML = "";
  for (let i = 0; i < MAX_BAHIAS; i++) {
    const activo = i < discos.length;
    rail.innerHTML += `<div class="rail-row ${activo ? "active" : ""}"><span class="dot"></span>DISK ${i + 1}</div>`;
  }

  const grid = document.getElementById("bay-grid");
  grid.innerHTML = "";
  for (let i = 0; i < MAX_BAHIAS; i++) {
    const disco = discos[i];
    if (disco) {
      grid.innerHTML += `
        <div class="bay filled">
          <span class="bay-num">${i + 1}</span>
          <span class="bay-capacity mono">${formatoCapacidad(disco.capacidad)}</span>
          <button class="bay-remove" onclick="quitarDisco(${disco.id})" aria-label="Quitar disco ${i + 1}">×</button>
        </div>`;
    } else {
      grid.innerHTML += `<div class="bay"><span class="bay-num">${i + 1}</span></div>`;
    }
  }

  document.getElementById("nota-count").textContent = discos.length;
  document.getElementById("nota-suma").textContent =
    discos.reduce((a, d) => a + d.capacidad, 0) + " GB";
}

function agregarDisco(capacidad) {
  if (discos.length >= MAX_BAHIAS) return;
  discos.push({ id: nextId++, capacidad });
  refrescarTodo();
}

function quitarDisco(id) {
  discos = discos.filter((d) => d.id !== id);
  refrescarTodo();
}

function refrescarTodo() {
  pintarPaleta();
  pintarChasis();
  actualizarPanel(1);
  actualizarPanel(2);
}

/* ============================================================
   LÓGICA RAID (pura, sin efectos secundarios)
   ============================================================ */
function calcularRaid(tipo) {
  const n = discos.length;
  const suma = discos.reduce((a, d) => a + d.capacidad, 0);
  const menor = n ? Math.min(...discos.map((d) => d.capacidad)) : 0;

  const val = validarRaid(tipo);
  if (!val.valido)
    return {
      valido: false,
      mensaje: val.mensaje,
      suma,
      capacidad: 0,
      seguridad: 0,
      sinUsar: 0,
    };

  let capacidad = 0,
    seguridad = 0;
  switch (tipo) {
    case "0":
      capacidad = suma;
      seguridad = 0;
      break;
    case "1":
      capacidad = menor;
      seguridad = menor * n - menor;
      break;
    case "3":
    case "5":
      capacidad = menor * (n - 1);
      seguridad = menor;
      break;
    case "10":
      capacidad = menor * (n / 2);
      seguridad = capacidad;
      break;
    case "01":
      capacidad = menor * 2;
      seguridad = menor * (n - 2);
      break;
  }
  const sinUsar = suma - capacidad - seguridad;
  return { valido: true, mensaje: "", suma, capacidad, seguridad, sinUsar };
}

function validarRaid(tipo) {
  const n = discos.length;
  if (n < 2)
    return {
      valido: false,
      mensaje: "Inserta al menos 2 discos para poder simular un arreglo.",
    };
  if ((tipo === "3" || tipo === "5") && n < 3)
    return { valido: false, mensaje: "Este RAID necesita 3 discos o más." };
  if ((tipo === "10" || tipo === "01") && (n % 2 === 1 || n < 4))
    return {
      valido: false,
      mensaje:
        "La cantidad de discos para este RAID debe ser par y mayor o igual a 4.",
    };
  return { valido: true, mensaje: "" };
}

/* ============================================================
   RENDER DE PANELES + GRÁFICOS
   ============================================================ */
function actualizarPanel(idx) {
  const panel = paneles[idx];
  panel.tipo = panel.select.value;
  const r = calcularRaid(panel.tipo);

  document.getElementById("suma" + idx).innerHTML =
    r.suma + " <small>GB</small>";
  document.getElementById("capacidad" + idx).innerHTML =
    (r.valido ? r.capacidad : 0) + " <small>GB</small>";
  document.getElementById("seguridad" + idx).innerHTML =
    (r.valido ? r.seguridad : 0) + " <small>GB</small>";
  document.getElementById("sin_usar" + idx).innerHTML =
    (r.valido ? r.sinUsar : 0) + " <small>GB</small>";

  const msgBox = document.getElementById("panel" + idx + "-msg");
  msgBox.innerHTML = r.valido
    ? ""
    : `<div class="panel-msg">${r.mensaje}</div>`;

  const capacidad = r.valido ? r.capacidad : 0;
  const seguridad = r.valido ? r.seguridad : 0;
  const sinUsar = r.valido ? r.sinUsar : 0;

  if (!panel.pie) {
    panel.pie = crearPie(idx);
    panel.bar = crearBar(idx);
  }
  panel.pie.data.datasets[0].data = [capacidad, seguridad, sinUsar];
  panel.pie.update();
  panel.bar.data.datasets[0].data = [capacidad];
  panel.bar.data.datasets[1].data = [seguridad];
  panel.bar.data.datasets[2].data = [sinUsar];
  panel.bar.update();
}

function chartDefaults() {
  Chart.defaults.color = "#8b93ad";
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.borderColor = "#232f47";
}
chartDefaults();

function crearPie(idx) {
  const ctx = document.getElementById("chartPie" + idx);
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Capacidad", "Seguridad", "Sin usar"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: [COLOR_CAPACIDAD, COLOR_SEGURIDAD, COLOR_SINUSAR],
          borderColor: "#111827",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, boxHeight: 10, padding: 14 },
        },
      },
    },
  });
}

function crearBar(idx) {
  const ctx = document.getElementById("chartBar" + idx);
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: [""],
      datasets: [
        { label: "Capacidad", data: [0], backgroundColor: COLOR_CAPACIDAD },
        { label: "Seguridad", data: [0], backgroundColor: COLOR_SEGURIDAD },
        { label: "Sin usar", data: [0], backgroundColor: COLOR_SINUSAR },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { color: "#1c2438" } },
        y: { stacked: true, grid: { display: false } },
      },
    },
  });
}

/* ============================================================
   EVENTOS
   ============================================================ */
paneles[1].select.addEventListener("change", () => actualizarPanel(1));
paneles[2].select.addEventListener("change", () => actualizarPanel(2));

const modal = document.getElementById("myModal");
document.getElementById("myBtn").onclick = () => modal.classList.add("open");
document.getElementById("modalClose").onclick = () =>
  modal.classList.remove("open");
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("open");
});

/* ============================================================
   INICIO
   ============================================================ */
refrescarTodo();
