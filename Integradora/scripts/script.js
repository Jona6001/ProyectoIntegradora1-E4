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
