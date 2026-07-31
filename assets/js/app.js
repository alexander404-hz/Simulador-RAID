let fila = -1;
let sumaInput = document.getElementById("suma");
let capacidadInput = document.getElementById("capacidad");
let seguridadInput = document.getElementById("seguridad");
let sinUsarInput = document.getElementById("sin_usar");
let graficoDiv = document.getElementById("grafico");
let graficoDiv2 = document.getElementById("grafico2");
let graficoDiv3 = document.getElementById("grafico3");
let graficoDiv4 = document.getElementById("grafico4");
let sumaInput2 = document.getElementById("suma2");
let capacidadInput2 = document.getElementById("capacidad2");
let seguridadInput2 = document.getElementById("seguridad2");
let sinUsarInput2 = document.getElementById("sin_usar2");
let capacidadRaid = 0,
  sumaRaid = 0,
  seguridadRaid = 0,
  sinUsarRaid = 0,
  mensaje = "",
  myChart1 = null,
  myChart2 = null,
  myChart3 = null,
  myChart4 = null;
let capacidadRaid2 = 0,
  seguridadRaid2 = 0,
  sinUsarRaid2 = 0;
let select = document.getElementById("select1");
let select2 = document.getElementById("select2");

function Generar(capacidadDisco) {
  if (fila < 5) {
    fila++;
    if (capacidadDisco == 500)
      var disco =
        "<li id=" +
        fila +
        " accesskey=" +
        capacidadDisco +
        " class='disco hdd online'><span>" +
        capacidadDisco +
        "GB</span><button onclick=quitar(" +
        fila +
        ")>X</button></li>";
    else
      var disco =
        "<li id=" +
        fila +
        " accesskey=" +
        capacidadDisco +
        " class='disco hdd online'><span>" +
        capacidadDisco / 1000 +
        "TB</span><button onclick=quitar(" +
        fila +
        ")>X</button></li>";

    let celdas = document.getElementById("lista_ranuras_online");

    celdas.innerHTML += disco;
    calcularCapacidad(
      1,
      select,
      capacidadRaid,
      seguridadRaid,
      sinUsarRaid,
      sumaInput,
      capacidadInput,
      seguridadInput,
      sinUsarInput,
    );
    calcularCapacidad(
      2,
      select2,
      capacidadRaid2,
      seguridadRaid2,
      sinUsarRaid2,
      sumaInput2,
      capacidadInput2,
      seguridadInput2,
      sinUsarInput2,
    );
  }
}

function quitar(posicion) {
  //Se obtiene un array de elementos que tengan por clase "disco hdd online"
  var discosOnLine = document.getElementsByClassName("disco hdd online");

  //Se almacena el elemento "disco hdd on line" que sera borrado despues
  let discoABorrar = discosOnLine[posicion];

  //Se elimina el elemento
  discoABorrar.remove();

  //Al eliminar un disco se debe actualizar los id, tomando el "tamnaño" para realizar esto
  for (let i = 0; i < discosOnLine.length; i++) {
    //se actualiza al id que debe ser en realidad
    discosOnLine[i].id = i;

    //se obtiene el elemento boton que elimina un disco
    var BotonQuitar = discosOnLine[i].getElementsByTagName("button")[0];

    //Se actualiza el id del boton que debe ser en realidad
    BotonQuitar.setAttribute("onclick", "quitar(" + i + ")");
  }

  fila--;
  let select = document.getElementById("select1");
  calcularCapacidad(
    1,
    select,
    capacidadRaid,
    seguridadRaid,
    sinUsarRaid,
    sumaInput,
    capacidadInput,
    seguridadInput,
    sinUsarInput,
  );
  calcularCapacidad(
    2,
    select2,
    capacidadRaid2,
    seguridadRaid2,
    sinUsarRaid2,
    sumaInput2,
    capacidadInput2,
    seguridadInput2,
    sinUsarInput2,
  );
}

function cambioSelect(id) {
  let select = document.getElementById("" + id + "");
  if (id == "select1")
    calcularCapacidad(
      1,
      select,
      capacidadRaid,
      seguridadRaid,
      sinUsarRaid,
      sumaInput,
      capacidadInput,
      seguridadInput,
      sinUsarInput,
    );
  else
    calcularCapacidad(
      2,
      select2,
      capacidadRaid2,
      seguridadRaid2,
      sinUsarRaid2,
      sumaInput2,
      capacidadInput2,
      seguridadInput2,
      sinUsarInput2,
    );
}

function calcularCapacidad(
  k,
  select,
  capacidadRaid,
  seguridadRaid,
  sinUsarRaid,
  sumaInput,
  capacidadInput,
  seguridadInput,
  sinUsarInput,
) {
  let discos = document.getElementsByClassName("disco hdd online");
  if (EsValido(select)) {
    calcularSuma();
    switch (select.value) {
      case "0":
        capacidadRaid = sumaRaid;
        seguridadRaid = 0;
        sinUsarRaid = sumaRaid - capacidadRaid - seguridadRaid;
        break;
      case "1":
        capacidadRaid = calcularMenor();
        seguridadRaid = capacidadRaid * discos.length - capacidadRaid;
        sinUsarRaid = sumaRaid - capacidadRaid - seguridadRaid;
        break;
      case "3":
        capacidadRaid = calcularMenor() * (discos.length - 1);
        seguridadRaid = calcularMenor();
        sinUsarRaid = sumaRaid - capacidadRaid - seguridadRaid;
        break;
      case "5":
        capacidadRaid = calcularMenor() * (discos.length - 1);
        seguridadRaid = calcularMenor();
        sinUsarRaid = sumaRaid - capacidadRaid - seguridadRaid;
        break;
      case "10":
        capacidadRaid = calcularMenor() * (discos.length / 2);
        seguridadRaid = capacidadRaid;
        sinUsarRaid = sumaRaid - capacidadRaid - seguridadRaid;
        break;
      case "01":
        capacidadRaid = calcularMenor() * 2;
        seguridadRaid = calcularMenor() * (discos.length - 2);
        sinUsarRaid = sumaRaid - capacidadRaid - seguridadRaid;
        break;
    }
    if (k == 1) {
      if (myChart1) {
        addDataPastel(myChart1, capacidadRaid, seguridadRaid, sinUsarRaid);
        addDataPastel(myChart3, capacidadRaid, seguridadRaid, sinUsarRaid);
      } else {
        crearChartPastel(1, capacidadRaid, seguridadRaid, sinUsarRaid);
        crearChartBarras(3, capacidadRaid, seguridadRaid, sinUsarRaid);
      }
    } else {
      if (myChart2 && k == 2) {
        addDataPastel(myChart2, capacidadRaid, seguridadRaid, sinUsarRaid);
        addDataPastel(myChart4, capacidadRaid, seguridadRaid, sinUsarRaid);
      } else {
        crearChartPastel(2, capacidadRaid, seguridadRaid, sinUsarRaid);
        crearChartBarras(4, capacidadRaid, seguridadRaid, sinUsarRaid);
      }
    }
  } else {
    //Aviso(mensaje)
    if (k == 1) {
      graficoDiv.innerHTML = "<p id='parrafo'>" + mensaje + "</p>";
      graficoDiv3.innerHTML = "<span id='parrafo'></span>";
    } else {
      graficoDiv2.innerHTML = "<p id='parrafo'>" + mensaje + "</p>";
      graficoDiv4.innerHTML = "<span id='parrafo'></span>";
    }
    sumaRaid = 0;
    capacidadRaid = 0;
    seguridadRaid = 0;
    sinUsarRaid = 0;
  }
  sumaInput.value = sumaRaid;
  capacidadInput.value = capacidadRaid;
  seguridadInput.value = seguridadRaid;
  sinUsarInput.value = sinUsarRaid;
}

function calcularMenor() {
  let menor = 100000;
  let discos = document.getElementsByClassName("disco hdd online");
  for (let j = 0; j < discos.length; j++) {
    capacidadActual = parseInt(discos[j].getAttribute("accesskey"));
    if (capacidadActual < menor) menor = capacidadActual;
  }
  return menor;
}
function calcularSuma() {
  let discos = document.getElementsByClassName("disco hdd online");
  sumaRaid = 0;
  for (let j = 0; j < discos.length; j++) {
    sumaRaid += parseInt(discos[j].getAttribute("accesskey"), 10);
  }
  sumaInput.value = sumaRaid;
}

//actualiza barras
function addDataBarra(myChart, capacidadRaid, seguridadRaid, sinUsarRaid) {
  myChart.data.datasets[0].data = [capacidadRaid];
  myChart.data.datasets[1].data = [seguridadRaid];
  myChart.data.datasets[2].data = [sinUsarRaid];
  myChart.update();
}

//actualiza pastel
function addDataPastel(myChart, capacidadRaid, seguridadRaid, sinUsarRaid) {
  myChart.data.datasets[0].data = [capacidadRaid, seguridadRaid, sinUsarRaid];
  myChart.update();
}

function crearChartBarras(k, capacidadRaid, seguridadRaid, sinUsarRaid) {
  if (k == 3)
    graficoDiv3.innerHTML =
      "<div style='width: 95%; height: 40vh;'><canvas id='myChart" +
      k +
      "'></canvas></div>";
  else
    graficoDiv4.innerHTML =
      "<div style='width: 95%; height: 40vh;'><canvas id='myChart" +
      k +
      "'></canvas></div>";

  const labels = [""];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Capacidad (GB)",
        data: [capacidadRaid],
        backgroundColor: "green",
        borderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Copia de seguridad (GB)",
        data: [seguridadRaid],
        backgroundColor: "yellow",
        borderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Sin usar (GB)",
        data: [sinUsarRaid],
        backgroundColor: "gray",
        borderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
        },
        legend: {
          display: true,
          labels: {
            color: "black",
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  };

  const myChart = new Chart(
    document.getElementById("myChart" + k + ""),
    config,
  );
}
function crearChartPastel(k, capacidadRaid, seguridadRaid, sinUsarRaid) {
  if (k == 1)
    graficoDiv.innerHTML =
      "<div style='width: 95%; height: 75vh;'><canvas id='myChart" +
      k +
      "'></canvas></div>";
  else
    graficoDiv2.innerHTML =
      "<div style='width: 95%; height: 75vh;'><canvas id='myChart" +
      k +
      "'></canvas></div>";

  const data = {
    labels: ["Capacidad", "Seguridad", "Sin usar"],
    datasets: [
      {
        label: "Tamaño (GB)",
        data: [capacidadRaid, seguridadRaid, sinUsarRaid],
        backgroundColor: ["green", "yellow", "gray"],
        hoverOffset: 4,
      },
    ],
  };

  const config = {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  };

  const myChart = new Chart(
    document.getElementById("myChart" + k + ""),
    config,
  );
}
function EsValido(select) {
  let esvalido = true;
  let discos = document.getElementsByClassName("disco hdd online");
  if (discos.length > 1) {
    switch (select.value) {
      case "3":
        if (discos.length < 3) {
          esvalido = false;
          mensaje = "Este raid necesita 3 discos o más";
        }

        break;
      case "5":
        if (discos.length < 3) {
          esvalido = false;
          mensaje = "Este raid necesita 3 discos o más";
        }
        break;
      case "10":
        if (discos.length % 2 == 1 || discos.length < 4) {
          esvalido = false;
          mensaje =
            "la cantidad de discos para este raid debe ser par y mayor o igual 4";
        }
        break;
      case "01":
        if (discos.length % 2 == 1 || discos.length < 4) {
          esvalido = false;
          mensaje =
            "la cantidad de discos para este raid debe ser par y mayor o igual 4";
        }
        break;
    }
  } else {
    esvalido = false;
    mensaje = "Por favor ingrese más discos";
  }

  return esvalido;
}

function Aviso(mensaje) {
  Swal.fire({
    title: "Aviso",
    text: mensaje,
    icon: "error",
  });
}

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
