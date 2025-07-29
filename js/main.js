const dolar = 1;
const divisas = [
  { name: "BTC", valor: 2 },
  { name: "ETH", valor: 4 },
  { name: "LTC", valor: 0.5 },
];

// Variables
const mensaje = document.getElementById("mensaje");
const selectTipo = document.getElementById("selectTipo");
const selectMoneda = document.getElementById("selectMoneda");
const inputMonto = document.getElementById("inputMonto");
const btnConfirmar = document.getElementById("btnConfirmar");
const listaHistorial = document.getElementById("listaHistorial");
const btnLimpiarHistorial = document.getElementById("btnLimpiarHistorial");


let tipoOperacionSeleccionada = null;
let monedaSeleccionada = null;
let operacionEnCurso = false;

// Funciones
const dolar_divisas = (a, b) => a * b;
const comisionDolar = (a) => Number((a - a * 0.015).toFixed(4));
const divisas_dolar = (a, b) => a / b;
const comisionDivisas = (a) => Number((a - a * 0.03).toFixed(4));


function mostrarMensaje(texto, tipo = "info") {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}


function mostrarHistorialEnDOM() {
  listaHistorial.innerHTML = "";

  if (historialOperaciones.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay operaciones registradas.";
    listaHistorial.appendChild(li);
    return;
  }

  historialOperaciones.forEach(op => {
    const li = document.createElement("li");

    if (op.tipo === "usd-crypto") {
      li.textContent = `${op.fecha} - USD → ${op.moneda} | ${op.monto} USD a ${op.resultado} ${op.moneda}`;
    } else {
      li.textContent = `${op.fecha} - ${op.moneda} → USD | ${op.monto} ${op.moneda} a ${op.resultado} USD`;
    }

    listaHistorial.appendChild(li);
  });
}


function limpiarHistorial() {
  historialOperaciones = [];
  guardarHistorial();
  mostrarHistorialEnDOM();
  mostrarMensaje("Historial limpiado correctamente.", "info");

  tipoOperacionSeleccionada = null;
  monedaSeleccionada = null;
  operacionEnCurso = false;

  selectTipo.value = "";
  selectMoneda.value = "";
  inputMonto.value = "";

  selectMoneda.disabled = true;
  inputMonto.disabled = true;
  btnConfirmar.disabled = true;

  setTimeout(() => { mensaje.textContent = "Interfaz reiniciada. Seleccione una operación."; }, 1000);
}

function operacionDeCambio(nombreMoneda1, funcionDeConversion, comision, nombreMoneda2, monto) {
  if (!monto || isNaN(monto) || monto <= 0) {
    mostrarMensaje("Monto inválido. Intente nuevamente.", "error");
    return null;
  }

  const montoCompra = comision(funcionDeConversion(monto));
  mostrarMensaje(`¡FELICIDADES! Usted ha comprado ${montoCompra} ${nombreMoneda2}`, "success");

  operacionEnCurso = false;
  inputMonto.value = "";

  return montoCompra;
}


function ejecutarOperacion(montoIngresado) {
  let resultadoOperacion;
  const idxDivisa = monedaSeleccionada === 'BTC' ? 0 :
                    monedaSeleccionada === 'ETH' ? 1 : 2;
  const divisa = divisas[idxDivisa];

  switch (tipoOperacionSeleccionada) {
    case 'usd-crypto':
      resultadoOperacion = operacionDeCambio(
        "USD",
        (monto) => dolar_divisas(monto, divisa.valor),
        comisionDolar,
        divisa.name,
        montoIngresado
      );
      break;

    case 'crypto-usd':
      resultadoOperacion = operacionDeCambio(
        divisa.name,
        (monto) => divisas_dolar(monto, divisa.valor),
        comisionDivisas,
        "USD",
        montoIngresado
      );
      break;

    default:
      mostrarMensaje("Tipo de operación no válido.", "error");
      return;
  }

  if (resultadoOperacion) {
    const operacion = {
      tipo: tipoOperacionSeleccionada,
      moneda: monedaSeleccionada,
      monto: montoIngresado,
      resultado: resultadoOperacion,
      fecha: new Date().toLocaleString()
    };

    historialOperaciones.push(operacion);
    guardarHistorial();
    mostrarHistorialEnDOM();
  }
}


function mostrarConfirmacion(montoIngresado) {
  if (operacionEnCurso) return;
  operacionEnCurso = true;

  let mensajeConfirmacion = "";
  if (tipoOperacionSeleccionada === "usd-crypto") {
    mensajeConfirmacion = `¿Confirma la operación de compra de ${monedaSeleccionada} por ${montoIngresado} USD?`;
  } else {
    mensajeConfirmacion = `¿Confirma la operación de venta de ${montoIngresado} ${monedaSeleccionada} a USD?`;
  }

  mensaje.innerHTML = `
    ${mensajeConfirmacion}
    <br>
    <button id="btnYes">Confirmar</button>
    <button id="btnNo">Cancelar</button>
  `;

  document.getElementById("btnYes").addEventListener("click", () => ejecutarOperacion(montoIngresado));
  document.getElementById("btnNo").addEventListener("click", () => {
    mostrarMensaje("Operación cancelada.", "info");
    operacionEnCurso = false;
  });
}


function run() {
  mostrarHistorialEnDOM();

  selectTipo.addEventListener('change', () => {
    tipoOperacionSeleccionada = selectTipo.value;
    selectMoneda.disabled = false;
    mostrarMensaje("Seleccione la moneda deseada.", "info");
  });

  selectMoneda.addEventListener('change', () => {
    monedaSeleccionada = selectMoneda.value;
    inputMonto.disabled = false;
    btnConfirmar.disabled = false;
    mostrarMensaje("Ingrese el monto y confirme la operación.", "info");
  });

  btnConfirmar.addEventListener('click', () => {
    const montoIngresado = Number(inputMonto.value);

    if (!tipoOperacionSeleccionada) {
      mostrarMensaje("Primero seleccione el tipo de operación.", "error");
      return;
    }
    if (!monedaSeleccionada) {
      mostrarMensaje("Primero seleccione la moneda.", "error");
      return;
    }
    if (!montoIngresado || isNaN(montoIngresado) || montoIngresado <= 0) {
      mostrarMensaje("Ingrese un monto válido.", "error");
      return;
    }

    mostrarConfirmacion(montoIngresado);
  });

  btnLimpiarHistorial.addEventListener('click', limpiarHistorial);
}

// Inicio del programa
run();
