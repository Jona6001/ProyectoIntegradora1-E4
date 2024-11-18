document.addEventListener("DOMContentLoaded", function() {
});

// Iniciar sesión
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('usu').value;
    const password = document.getElementById('pass').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('usuario', username);
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: '¡Bienvenido de nuevo!',
                confirmButtonText: 'Continuar',
            }).then(() => {
                window.location.href = '/screens/main.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: result.message,
                confirmButtonText: 'Intentar de nuevo',
            });
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error en el servidor',
            text: 'Ha ocurrido un error en la Base de Datos, estaremos trabajando en eso ;)',
            confirmButtonText: 'Aceptar',
        });
    }
});


// Función para mostrar la fecha actual
function mostrarFecha() {
    const hoy = new Date();
    const fechaFormateada = hoy.getDate() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getFullYear();
    document.getElementById("fecha").textContent = fechaFormateada;
}

// Llamar la función de mostrar fecha al cargar la página
window.onload = function() {
    mostrarFecha();
};
