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
mostrarUsuNomb()

// Función para cerrar sesión y regresar al login
function cerrarSesion() {
    localStorage.removeItem('usuario'); // Remover el nombre de usuario del localStorage
    window.location.href = "../index.html"; // Redirigir al login
}


// Función para buscar citas hasta la fecha seleccionada
async function buscarCitasPorFecha() {
    const fechaSeleccionada = document.getElementById('fechaFiltro').value;
    console.log("Fecha seleccionada:", fechaSeleccionada); 

    if (!fechaSeleccionada) {
        alert('Por favor, selecciona una fecha.');
        return;
    }

    try {
        const response = await fetch(`/citas_recientes?fecha=${encodeURIComponent(fechaSeleccionada)}`);

        if (!response.ok) {
            throw new Error('Error al buscar citas');
        }

        const citas = await response.json(); 
        mostrarResultadosCitas(citas);
    } catch (error) {
        console.error('Error al buscar citas:', error);
        alert('No hay citas para la fecha seleccionada.');
    }
}

// Función para mostrar citas recientes
async function mostrarCitasRecientes() {
    try {
        const response = await fetch('/citas_recientes');

        if (!response.ok) {
            throw new Error('Error al cargar citas recientes');
        }

        const citas = await response.json();
        mostrarResultadosCitas(citas); // Mostramos las citas recientes
    } catch (error) {
        console.error('Error al cargar citas recientes:', error);
    
    }
}

// Función para mostrar citas próximas
async function mostrarCitasProximas() {
    try {
        const response = await fetch('/citas_proximas');

        if (!response.ok) {
            throw new Error('Error al cargar citas próximas');
        }

        const citas = await response.json();
        mostrarResultadosCitas(citas); // Mostramos las citas próximas
    } catch (error) {
        console.error('Error al cargar citas próximas:', error);
        
    }
}

// Función para cambiar el formato de la fecha
function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-MX', opciones); 
}

// Función para mostrar citas en la tabla con botones de editar y eliminar
function mostrarResultadosCitas(citas) {
    const citasBody = document.getElementById('citasBody');
    citasBody.innerHTML = '';

    if (citas.length === 0) {
        citasBody.innerHTML = '<tr><td colspan="6">No se encontraron citas para la fecha seleccionada.</td></tr>';
        return;
    }

    citas.forEach(cita => {
        const fechaFormateada = formatearFecha(new Date(cita.Fecha)); 
        const row = `
        <tr>
            <td>${cita.Nombre} ${cita.Apellido_Paterno}</td>
            <td>${fechaFormateada}</td>
            <td>${cita.Hora}</td>
            <td>${cita.Estado}</td>
            <td>
                <button onclick="editarCita(${cita.Cita_ID})">Editar</button> <!-- Botón Editar -->
                <button onclick="eliminarCita(${cita.Cita_ID})">Eliminar</button> <!-- Botón Eliminar -->
            </td>
        </tr>`;
        citasBody.innerHTML += row;
    });
}


// Función para editar una cita
function editarCita(citaID) {
    window.location.href = `Cita_Modificar.html?citaID=${citaID}`;
}

// Función para eliminar una cita con el boton
function eliminarCita(citaID) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        fetch(`/eliminarCita/${citaID}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('Cita eliminada con éxito');
                mostrarCitasRecientes(); // Recargar la tabla de citas
            } else {
                alert('Error al eliminar la cita');
            }
        })
        .catch(error => console.error('Error al eliminar cita:', error));
    }
}

// Llama a mostrarCitasRecientes al cargar la página
document.addEventListener('DOMContentLoaded', mostrarCitasRecientes);
