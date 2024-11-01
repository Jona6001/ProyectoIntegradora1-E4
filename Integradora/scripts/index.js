// Iniciar sesion
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
            window.location.href = '../screens/main.html';
        } else {
            alert(result.message); 
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        alert('Ha ocurrido un error en la Base de Datos, estaremos trabajando en eso ;)');
    }
});

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó un token' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido' });
        }
        req.userId = decoded.id; // Guarda el ID del usuario en la solicitud
        next();
    });
}
    

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
