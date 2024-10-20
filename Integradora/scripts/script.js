// Función para mostrar la fecha actual
function mostrarFecha() {
    const hoy = new Date();
    const fechaFormateada = hoy.getDate() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getFullYear();
    document.getElementById("fecha").textContent = fechaFormateada;
}

// Función para mostrar el nombre del usuario en el encabezado
function mostrarUsuNomb() {
    const usuario = localStorage.getItem('usuario');
    
    // Verificar si el usuario está almacenado en localStorage
    if (usuario && usuario.trim() !== "") {
        document.getElementById("bienvenido").textContent = `Bienvenido ${usuario}`;
    } else {
        console.error('No se encontró un nombre de usuario en localStorage');
        document.getElementById("bienvenido").textContent = "Bienvenido, Usuario Desconocido"; // Mensaje por defecto
    }
}

// Función para cerrar sesión y regresar al login
function cerrarSesion() {
    localStorage.removeItem('usuario'); // Remover el nombre de usuario del localStorage
    window.location.href = "../index.html"; // Redirigir al login
}

// Llamar las funciones al cargar la página
mostrarFecha();
mostrarUsuNomb();


// Función para mostrar solo las citas a partir de la fecha actual
function mostrarCitasRecientes() {
    const hoy = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato 'yyyy-mm-dd'
    filtrarCitas(hoy);
}

// Función para filtrar las citas por una fecha seleccionada en el calendario
function filtrarCitasPorFecha() {
    const fechaSeleccionada = document.getElementById('fechaFiltro').value;
    if (fechaSeleccionada) {
        filtrarCitas(fechaSeleccionada);
    }
}

// Función general para filtrar las citas en base a una fecha
function filtrarCitas(fechaFiltro) {
    const tabla = document.getElementById('tablaCitas');
    const filas = tabla.getElementsByTagName('tr');
    
    // Recorrer todas las filas de la tabla (excluyendo el encabezado)
    for (let i = 1; i < filas.length; i++) {
        const celdaFecha = filas[i].getElementsByTagName('td')[2]; // Columna de la fecha
        const fechaCita = celdaFecha.textContent; // Obtener el valor de la fecha de la cita

        // Mostrar u ocultar las filas basadas en la fecha
        if (fechaCita >= fechaFiltro) {
            filas[i].style.display = ""; // Mostrar la fila si la fecha es mayor o igual a la fecha filtro
        } else {
            filas[i].style.display = "none"; // Ocultar la fila si la fecha es menor
        }
    }
}
