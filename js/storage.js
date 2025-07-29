let historialOperaciones = [];

function cargarHistorial() {
  const datos = localStorage.getItem("historialOperaciones");
  if (datos) {
    historialOperaciones = JSON.parse(datos);
  } else {
    historialOperaciones = [];
    localStorage.setItem(
      "historialOperaciones",
      JSON.stringify(historialOperaciones)
    );
  }
}

function guardarHistorial() {
  localStorage.setItem(
    "historialOperaciones",
    JSON.stringify(historialOperaciones)
  );
}

// Inicialización automática
cargarHistorial();
