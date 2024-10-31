// Variables para la paginación
let currentPage = 1;
const itemsPerPage = 8; // Cambia este valor para mostrar más o menos resultados por página
let citas = []; // Variable para almacenar las citas recientes
let citasProximas = []; // Variable para almacenar las citas próximas

// Función para mostrar el nombre del usuario en el encabezado
function mostrarUsuNomb() {
    const usuario = localStorage.getItem('usuario');
    document.getElementById("bienvenido").textContent = usuario ? `Bienvenido ${usuario}` : "Bienvenido, Usuario Desconocido";
}
mostrarUsuNomb();

// Función para mostrar la fecha actual
function mostrarFecha() {
    const hoy = new Date();
    const fechaFormateada = hoy.getDate() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getFullYear();
    document.getElementById("fecha").textContent = fechaFormateada;
}

// Llamar la función de mostrar fecha al cargar la página
window.onload = function() {
    mostrarFecha();
    mostrarCitasRecientes('citasBodyMain'); // Cargar citas en la tabla principal
    mostrarCitasRecientes('citasBody', true); // Cargar citas en la tabla del gestor de citas
};

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = "../index.html";
}

// Función para buscar citas por fecha
async function buscarCitasPorFecha() {
    const fechaSeleccionada = document.getElementById('fechaFiltro').value;
    if (!fechaSeleccionada) {
        alert('Por favor, selecciona una fecha.');
        return;
    }

    try {
        const response = await fetch(`/citas_recientes?fecha=${encodeURIComponent(fechaSeleccionada)}`);
        citas = await response.json(); // Guardar las citas en la variable global
        currentPage = 1; // Reiniciar la página a 1
        mostrarResultadosCitas(citas, 'citasBody', true);
    } catch (error) {
        console.error('Error al buscar citas:', error);
        alert('No hay citas para la fecha seleccionada.');
    }
}

// Función para mostrar citas en la tabla
async function mostrarCitasRecientes(idTablaCitas, conBotones = false) {
    try {
        const response = await fetch('/citas_recientes');
        citas = await response.json(); // Guardar las citas en la variable global
        mostrarResultadosCitas(citas, idTablaCitas, conBotones);
    } catch (error) {
        console.error('Error al cargar citas recientes:', error);
    }
}

// Función para mostrar citas próximas
async function mostrarCitasProximas() {
    try {
        const response = await fetch('/citas_proximas'); // Cambia la URL según tu endpoint real
        citasProximas = await response.json(); // Guardar las citas próximas en la variable global
        currentPage = 1; // Reiniciar la página a 1
        mostrarResultadosCitas(citasProximas, 'citasBody', true); // Mostrar citas próximas
    } catch (error) {
        console.error('Error al cargar citas próximas:', error);
        alert('No se pudieron cargar las citas próximas.');
    }
}

// Función para mostrar citas en la tabla con paginación
function mostrarResultadosCitas(citasArray, idTablaCitas, conBotones) {
    const citasBody = document.getElementById(idTablaCitas);
    citasBody.innerHTML = '';

    if (citasArray.length === 0) {
        citasBody.innerHTML = '<tr><td colspan="5"><center>No hay citas para mostrar.</center></td></tr>';
        return;
    }

    // Calcular el índice inicial y final para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, citasArray.length);

    // Mostrar solo las citas de la página actual
    for (let i = startIndex; i < endIndex; i++) {
        const cita = citasArray[i];
        const row = `
        <tr>
            <td>${cita.Nombre} ${cita.Apellido_Paterno}</td>
            <td>${new Date(cita.Fecha).toLocaleDateString('es-MX')}</td>
            <td>${cita.Hora}</td>
            <td>${cita.Servicio}</td>
            <td>${cita.Estado}</td>

            ${conBotones ? `<td><button onclick="editarCita(${cita.Cita_ID})">Editar</button>
            <button onclick="eliminarCita(${cita.Cita_ID})">Eliminar</button></td>` : '' }
        </tr>`;
        citasBody.innerHTML += row;
    }

    // Calcular el total de páginas y mostrar la paginación
    const totalPages = Math.ceil(citasArray.length / itemsPerPage);
    mostrarPaginacion(totalPages, citasArray); // Pasar las citas a la paginación
}

// Función para mostrar botones de paginación
function mostrarPaginacion(totalPages, citasArray) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            mostrarResultadosCitas(citasArray, 'citasBody', true); // Usar la variable correcta
        };
        paginationContainer.appendChild(button);
    }
}

// Función para editar una cita
function editarCita(citaID) {
    window.location.href = `Cita_Modificar.html?citaID=${citaID}`;
}

// Función para eliminar una cita con el botón
function eliminarCita(citaID) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        fetch(`/eliminarCita/${citaID}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('Cita eliminada con éxito');
                mostrarCitasRecientes('citasBody', true); // Recargar la tabla de citas en el gestor
            } else {
                alert('Error al eliminar la cita');
            }
        })
        .catch(error => console.error('Error al eliminar cita:', error));
    }
}


// Agregar el evento al botón de "Mostrar Citas Próximas"
document.getElementById('citasProximasBtn').addEventListener('click', mostrarCitasProximas);


