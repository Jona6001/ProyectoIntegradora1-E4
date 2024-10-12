function mostrarFecha() {
    var hoy = new Date();
    var fechaFormateada = hoy.getDate() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getFullYear();
    document.getElementById("fecha").textContent = fechaFormateada;
}
// Función para mostrar la fecha
mostrarFecha();
