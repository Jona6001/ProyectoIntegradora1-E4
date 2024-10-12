// Manejar el evento de envío del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

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
            // Si el inicio de sesión es exitoso, redirige al usuario
            window.location.href = 'screens/main.html';
        } else {
            // Si las credenciales son incorrectas
            alert(result.message); // Usa el mensaje que se envía desde el servidor
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        alert('Ha ocurrido un error en la Base de Datos, estaremos trabajando en eso ;)');
    }
});

// Función para mostrar la fecha
function mostrarFecha() {
    const hoy = new Date();
    const fechaFormateada = hoy.getDate() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getFullYear();
    document.getElementById("fecha").textContent = fechaFormateada;
}

mostrarFecha();
