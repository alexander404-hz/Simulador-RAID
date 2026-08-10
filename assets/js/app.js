/* ============================================================
   ESTADO
   ============================================================ */
const MAX_BAHIAS_DESKTOP = 10;
const MAX_BAHIAS_COMPACTO = 6;
const BREAKPOINT_BAHIAS = 900;
let MAX_BAHIAS =
  window.innerWidth > BREAKPOINT_BAHIAS
    ? MAX_BAHIAS_DESKTOP
    : MAX_BAHIAS_COMPACTO;
const TAMANOS = [500, 1000, 2000, 3000, 4000, 6000, 8000, 10000];
let discos = []; // { id, capacidad, activo }
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

/* ============================================================
   COLORES (leídos desde las variables CSS, ver styles.css :root)
   ============================================================ */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const COLOR_CAPACIDAD = cssVar("--teal");
const COLOR_SEGURIDAD = cssVar("--accent");
const COLOR_SINUSAR = cssVar("--sin-usar");
const COLOR_TEXT_MUTED = cssVar("--text-muted");
const COLOR_GRID = cssVar("--chart-grid");
const COLOR_GRID_SOFT = cssVar("--border-soft");
const COLOR_PANEL_BG = cssVar("--bg-panel");

/* ============================================================
   PALETA DE DISCOS
   ============================================================ */
function formatoCapacidad(gb) {
  return gb === 500 ? "500GB" : gb / 1000 + "TB";
}

function pintarPaleta() {
  const cont = document.getElementById("paleta-discos");
  cont.innerHTML = TAMANOS.map(
    (gb) => `
    <button class="disk-card" ${discos.length >= MAX_BAHIAS ? "disabled" : ""} data-capacidad="${gb}" aria-label="Insertar disco de ${formatoCapacidad(gb)}">
      <span class="disk-card-visual">
        <span class="disk-card-cap mono">${formatoCapacidad(gb)}</span>
        <img src="assets/img/disco.webp" alt="">
        <span class="disk-card-add" aria-hidden="true">+${formatoCapacidad(gb)}</span>
      </span>
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
    const disco = discos[i];
    let clase = "";
    if (disco) clase = disco.activo === false ? "down" : "active";
    rail.innerHTML += `<div class="rail-row ${clase}"><span class="dot"></span>DISK ${i + 1}</div>`;
  }

  const grid = document.getElementById("bay-grid");
  grid.innerHTML = "";
  for (let i = 0; i < MAX_BAHIAS; i++) {
    const disco = discos[i];
    if (disco) {
      const caido = disco.activo === false;
      grid.innerHTML += `
        <div class="bay filled ${caido ? "down" : ""}">
          <span class="bay-num">${i + 1}</span>
          <span class="bay-capacity mono">${formatoCapacidad(disco.capacidad)}</span>
          ${caido ? '<span class="bay-fault">FALLO</span>' : ""}
          <button class="bay-power ${caido ? "is-off" : "is-on"}" data-id="${disco.id}" aria-label="${caido ? "Encender" : "Apagar"} disco ${i + 1}" title="${caido ? "Encender disco (reparar)" : "Apagar disco (simular falla)"}">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v7"/><path d="M6.5 6.5a7 7 0 1 0 11 0"/></svg>
          </button>
          <button class="bay-eject" data-id="${disco.id}" aria-label="Expulsar disco ${i + 1}" title="Expulsar disco">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5l7.5 8.2H4.5L12 4.5z"/><rect x="4.5" y="16.2" width="15" height="3.2" rx="1"/></svg>
          </button>
        </div>`;
    } else {
      grid.innerHTML += `<div class="bay"><span class="bay-num">${i + 1}</span></div>`;
    }
  }

  document.getElementById("nota-suma").textContent =
    discos.reduce((a, d) => a + d.capacidad, 0) + " GB";
}

function agregarDisco(capacidad) {
  if (discos.length >= MAX_BAHIAS) return;
  discos.push({ id: nextId++, capacidad, activo: true });
  refrescarTodo();
}

function quitarDisco(id) {
  discos = discos.filter((d) => d.id !== id);
  refrescarTodo();
}

function alternarEnergiaDisco(id) {
  const disco = discos.find((d) => d.id === id);
  if (!disco) return;
  disco.activo = disco.activo === false ? true : false;
  refrescarTodo();
}

function refrescarTodo() {
  pintarPaleta();
  pintarChasis();
  actualizarPanel(1);
  actualizarPanel(2);
  revisarEscrituraTrasCambio();
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
   TOLERANCIA A FALLOS (simulación de discos caídos)
   ============================================================ */
function indicesCaidos() {
  const arr = [];
  discos.forEach((d, i) => {
    if (d.activo === false) arr.push(i);
  });
  return arr;
}

// Para RAID 10 y 01: devuelve las parejas de columnas que deben
// conservar al menos un disco vivo para no perder esa porción de datos.
function paresRaid(tipo, n) {
  if (tipo === "10") {
    const pares = [];
    for (let p = 0; p < n / 2; p++) pares.push([p * 2, p * 2 + 1]);
    return pares;
  }
  if (tipo === "01") {
    const half = n / 2;
    const pares = [];
    for (let c = 0; c < half; c++) pares.push([c, c + half]);
    return pares;
  }
  return null;
}

// Evalúa qué le pasa al arreglo completo con los discos caídos actuales.
// estado: "ok" (todo sano) | "degradado" (hay fallas pero se reconstruye) | "perdida" (datos irrecuperables)
function estadoTolerancia(tipo, n, caidos) {
  if (caidos.length === 0) {
    return { estado: "ok", mensaje: "Todos los discos operativos." };
  }
  switch (tipo) {
    case "0":
      return {
        estado: "perdida",
        mensaje:
          "RAID 0 no tiene redundancia: con un solo disco caído se pierde todo el arreglo.",
      };
    case "1":
      if (caidos.length >= n) {
        return {
          estado: "perdida",
          mensaje: "Cayeron todas las copias: los datos se perdieron.",
        };
      }
      return {
        estado: "degradado",
        mensaje: `${caidos.length} disco(s) caído(s), pero queda al menos una copia viva: los datos siguen disponibles.`,
      };
    case "3":
    case "5":
      if (caidos.length === 1) {
        return {
          estado: "degradado",
          mensaje:
            "1 disco caído: la paridad reconstruye en vivo los datos que faltan.",
        };
      }
      return {
        estado: "perdida",
        mensaje:
          "Más de un disco caído: la paridad ya no alcanza para reconstruir todo. Hay pérdida de datos.",
      };
    case "10":
    case "01": {
      const pares = paresRaid(tipo, n);
      let parPerdido = false;
      let hayFalloParcial = false;
      pares.forEach((par) => {
        const muertos = par.filter((c) => caidos.includes(c)).length;
        if (muertos === par.length) parPerdido = true;
        else if (muertos > 0) hayFalloParcial = true;
      });
      if (parPerdido) {
        return {
          estado: "perdida",
          mensaje:
            "Un grupo espejado perdió ambos discos: esa parte de los datos ya no se puede recuperar.",
        };
      }
      if (hayFalloParcial) {
        return {
          estado: "degradado",
          mensaje:
            "Hay discos caídos, pero cada pareja conserva al menos una copia: el RAID reconstruye los datos.",
        };
      }
      return { estado: "ok", mensaje: "Todos los discos operativos." };
    }
    default:
      return { estado: "ok", mensaje: "" };
  }
}

// Estado de una celda de escritura (por columna/disco) dado el tipo de RAID.
function estadoCelda(tipo, n, caidos, col) {
  if (!caidos.includes(col)) return "ok";
  switch (tipo) {
    case "0":
      return "perdido";
    case "1": {
      const otroVivo = discos.some((d, i) => i !== col && d.activo !== false);
      return otroVivo ? "recuperado" : "perdido";
    }
    case "3":
    case "5":
      return caidos.length === 1 ? "recuperado" : "perdido";
    case "10":
    case "01": {
      const pares = paresRaid(tipo, n);
      const par = pares.find((p) => p.includes(col));
      const companero = par.find((c) => c !== col);
      return caidos.includes(companero) ? "perdido" : "recuperado";
    }
    default:
      return "ok";
  }
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

  panel.select.classList.toggle("has-error", !r.valido);

  const estadoBox = document.getElementById("panel" + idx + "-estado");
  if (estadoBox) {
    if (!r.valido) {
      estadoBox.innerHTML = "";
      estadoBox.className = "estado-pill";
    } else {
      const est = estadoTolerancia(panel.tipo, discos.length, indicesCaidos());
      const etiqueta =
        est.estado === "ok"
          ? "Operativo"
          : est.estado === "degradado"
            ? "Degradado — se reconstruye"
            : "Pérdida de datos";
      estadoBox.className = "estado-pill " + est.estado;
      estadoBox.innerHTML = `<span class="dot"></span>${etiqueta}`;
      estadoBox.title = est.mensaje;
    }
  }

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
  Chart.defaults.color = COLOR_TEXT_MUTED;
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.borderColor = COLOR_GRID;
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
          borderColor: COLOR_PANEL_BG,
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
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} GB`,
          },
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
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x} GB`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: COLOR_GRID_SOFT },
        },
        y: { stacked: true, grid: { display: false } },
      },
    },
  });
}

/* ============================================================
   ESCRITURA DE DATOS (sección 3)
   ============================================================ */
const writeEls = {
  select: document.getElementById("write-select"),
  input: document.getElementById("write-input"),
  binario: document.getElementById("write-binario"),
  msg: document.getElementById("write-msg"),
  grid: document.getElementById("write-grid"),
};

let ultimoLayout = null; // { n, filas, matrix, tipo } — matrix[fila][disco] = { tipo, valor }

function xorCaracteres(chars) {
  let acc = chars[0].charCodeAt(0);
  for (let i = 1; i < chars.length; i++) acc ^= chars[i].charCodeAt(0);
  return acc;
}

function calcularLayoutEscritura(tipo, n, palabra) {
  const MAX_FILAS = 6;
  let dataPorFila;
  if (tipo === "1") dataPorFila = 1;
  else if (tipo === "3" || tipo === "5") dataPorFila = n - 1;
  else if (tipo === "10" || tipo === "01") dataPorFila = n / 2;
  else dataPorFila = n; // RAID 0

  const filas = Math.min(
    MAX_FILAS,
    Math.max(1, Math.ceil(palabra.length / dataPorFila)),
  );
  const matrix = [];

  for (let f = 0; f < filas; f++) {
    const fila = new Array(n).fill(null);
    switch (tipo) {
      case "0":
        for (let c = 0; c < n; c++) {
          fila[c] = { tipo: "data", valor: palabra[(f * n + c) % palabra.length] };
        }
        break;
      case "1": {
        const ch = palabra[f % palabra.length];
        for (let c = 0; c < n; c++) {
          fila[c] = { tipo: c === 0 ? "data" : "mirror", valor: ch };
        }
        break;
      }
      case "3":
      case "5": {
        const parityCol = tipo === "3" ? n - 1 : n - 1 - (f % n);
        let j = 0;
        for (let c = 0; c < n; c++) {
          if (c === parityCol) continue;
          fila[c] = {
            tipo: "data",
            valor: palabra[(f * (n - 1) + j) % palabra.length],
          };
          j++;
        }
        const chars = fila.filter(Boolean).map((cell) => cell.valor);
        fila[parityCol] = {
          tipo: "paridad",
          valor: xorCaracteres(chars).toString(2).padStart(8, "0"),
        };
        break;
      }
      case "10": {
        const pares = n / 2;
        for (let p = 0; p < pares; p++) {
          const ch = palabra[(f * pares + p) % palabra.length];
          fila[p * 2] = { tipo: "data", valor: ch };
          fila[p * 2 + 1] = { tipo: "mirror", valor: ch };
        }
        break;
      }
      case "01": {
        const half = n / 2;
        for (let c = 0; c < half; c++) {
          const ch = palabra[(f * half + c) % palabra.length];
          fila[c] = { tipo: "data", valor: ch };
          fila[c + half] = { tipo: "mirror", valor: ch };
        }
        break;
      }
    }
    matrix.push(fila);
  }
  return { n, filas, matrix, tipo };
}

function formatoCelda(cell, estado) {
  if (estado === "perdido") return "×";
  if (cell.tipo === "paridad") return cell.valor; // ya viene en binario
  if (writeEls.binario.checked) {
    return cell.valor.charCodeAt(0).toString(2).padStart(8, "0");
  }
  return cell.valor === " " ? "␣" : cell.valor;
}

function etiquetaCelda(tipo, estado) {
  if (estado === "perdido") return "perdido";
  if (estado === "recuperado") return "reconstruido";
  if (tipo === "mirror") return "copia";
  if (tipo === "paridad") return "xor";
  return "dato";
}

function pintarEscritura() {
  if (!ultimoLayout) return;
  const { n, matrix } = ultimoLayout;
  const tipo = ultimoLayout.tipo;
  const caidos = indicesCaidos();

  let html = "";
  for (let c = 0; c < n; c++) {
    const disco = discos[c];
    const columnaCaida = caidos.includes(c);
    html += `<div class="write-col ${columnaCaida ? "down" : ""}">
      <div class="write-col-head mono">Disco ${c + 1}<span>${formatoCapacidad(disco.capacidad)}</span>${columnaCaida ? '<span class="write-col-fault">FALLO</span>' : ""}</div>`;
    matrix.forEach((fila, f) => {
      const cell = fila[c];
      const estado = estadoCelda(tipo, n, caidos, c);
      html += `<div class="write-cell ${cell.tipo} ${estado !== "ok" ? "is-" + estado : ""}" style="transition-delay:${f * 70}ms">
        <span class="write-cell-tag">${etiquetaCelda(cell.tipo, estado)}</span>
        <span class="write-cell-val mono">${formatoCelda(cell, estado)}</span>
      </div>`;
    });
    html += `</div>`;
  }
  writeEls.grid.innerHTML = html;

  requestAnimationFrame(() => {
    writeEls.grid
      .querySelectorAll(".write-cell")
      .forEach((el) => el.classList.add("in"));
  });

  pintarEstadoEscritura(tipo, n, caidos);
}

function pintarEstadoEscritura(tipo, n, caidos) {
  const box = document.getElementById("write-estado");
  if (!box) return;
  const est = estadoTolerancia(tipo, n, caidos);
  const etiqueta =
    est.estado === "ok"
      ? "Datos íntegros"
      : est.estado === "degradado"
        ? "Degradado: el RAID está reconstruyendo los datos"
        : "Pérdida de datos";
  box.className = "estado-banner " + est.estado;
  box.innerHTML = `<span class="dot"></span><div><b>${etiqueta}.</b> ${est.mensaje}</div>`;
}

function simularEscritura() {
  const tipo = writeEls.select.value;
  const palabra = writeEls.input.value.trim();
  const val = validarRaid(tipo);

  writeEls.grid.innerHTML = "";
  writeEls.estado = document.getElementById("write-estado");
  if (writeEls.estado) {
    writeEls.estado.innerHTML = "";
    writeEls.estado.className = "estado-banner";
  }

  writeEls.select.classList.toggle("has-error", !val.valido);

  if (!val.valido) {
    writeEls.msg.innerHTML = `<div class="panel-msg">${val.mensaje}</div>`;
    ultimoLayout = null;
    return;
  }
  if (!palabra) {
    writeEls.msg.innerHTML =
      '<div class="panel-msg">Escribe un texto para simular su escritura.</div>';
    ultimoLayout = null;
    return;
  }

  writeEls.msg.innerHTML = "";
  ultimoLayout = calcularLayoutEscritura(tipo, discos.length, palabra);
  pintarEscritura();
}

function revisarEscrituraTrasCambio() {
  // Ya no hay botón "Simular escritura": si había algo escrito (o ya se
  // había simulado antes), recalculamos solos con la nueva cantidad de
  // discos y/o el nuevo estado de energía.
  if (ultimoLayout || writeEls.input.value.trim()) {
    simularEscritura();
  }
}

/* ============================================================
   RESPONSIVE: MAX_BAHIAS según ancho de pantalla
   ============================================================ */
function actualizarMaxBahias() {
  const nuevoMax =
    window.innerWidth > BREAKPOINT_BAHIAS
      ? MAX_BAHIAS_DESKTOP
      : MAX_BAHIAS_COMPACTO;
  if (nuevoMax === MAX_BAHIAS) return;

  MAX_BAHIAS = nuevoMax;
  if (discos.length > MAX_BAHIAS) {
    discos = discos.slice(0, MAX_BAHIAS);
  }
  refrescarTodo();
}

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(actualizarMaxBahias, 150);
});

/* ============================================================
   EVENTOS
   ============================================================ */
document.getElementById("paleta-discos").addEventListener("click", (e) => {
  const card = e.target.closest(".disk-card");
  if (!card || card.disabled) return;
  agregarDisco(Number(card.dataset.capacidad));
});

document.getElementById("bay-grid").addEventListener("click", (e) => {
  const powerBtn = e.target.closest(".bay-power");
  if (powerBtn) {
    alternarEnergiaDisco(Number(powerBtn.dataset.id));
    return;
  }
  const ejectBtn = e.target.closest(".bay-eject");
  if (ejectBtn) {
    quitarDisco(Number(ejectBtn.dataset.id));
  }
});

paneles[1].select.addEventListener("change", () => actualizarPanel(1));
paneles[2].select.addEventListener("change", () => actualizarPanel(2));

const modal = document.getElementById("myModal");
document
  .getElementById("myBtn")
  .addEventListener("click", () => modal.classList.add("open"));
document
  .getElementById("modalClose")
  .addEventListener("click", () => modal.classList.remove("open"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("open");
});

writeEls.select.addEventListener("change", simularEscritura);
writeEls.binario.addEventListener("change", pintarEscritura);

let writeDebounceTimer = null;
const WRITE_DEBOUNCE_MS = 400;
writeEls.input.addEventListener("input", () => {
  clearTimeout(writeDebounceTimer);
  writeDebounceTimer = setTimeout(simularEscritura, WRITE_DEBOUNCE_MS);
});

/* ============================================================
   INICIO
   ============================================================ */
refrescarTodo();