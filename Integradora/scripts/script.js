// Función para buscar citas hasta la fecha seleccionada
async function buscarCitasPorFecha() {
    const fechaSeleccionada = document.getElementById('fechaFiltro').value;

    if (!fechaSeleccionada) {
        alert('Por favor, selecciona una fecha.');
        return;
    }

    try {
        const response = await fetch(`/citas_recientes?fecha=${fechaSeleccionada}`);

        if (!response.ok) {
            throw new Error('Error al buscar citas');
        }

        const citas = await response.json();
        mostrarResultadosCitas(citas);
    } catch (error) {
        console.error('Error al buscar citas:', error);
        alert('Ha ocurrido un error al buscar las citas.');
    }
}

function formatearFecha(fecha) {
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' }; // Formato: Día de Mes, Año
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

function mostrarResultadosCitas(citas) {
    const citasBody = document.getElementById('citasBody');
    citasBody.innerHTML = ''; // Limpiar resultados anteriores

    if (citas.length === 0) {
        citasBody.innerHTML = '<tr><td colspan="5">No se encontraron citas para la fecha seleccionada.</td></tr>';
        return;
    }

    citas.forEach(cita => {
        const fechaFormateada = formatearFecha(cita.Fecha); // Formatear la fecha
        const row = `<tr>
            <td>${cita.Cita_ID}</td>
            <td>${cita.Nombre} ${cita.Apellido_Paterno}</td>
            <td>${fechaFormateada}</td>
            <td>${cita.Hora}</td>
            <td>${cita.Estado}</td>
        </tr>`;
        citasBody.innerHTML += row;
    });
}

// Función para mostrar citas recientes
async function mostrarCitasRecientes() {
    try {
        const response = await fetch('/citas_recientes');

        if (!response.ok) {
            throw new Error('Error al cargar citas recientes');
        }

        const citas = await response.json();
        mostrarResultadosCitas(citas);
    } catch (error) {
        console.error('Error al cargar citas recientes:', error);
        alert('Ha ocurrido un error al cargar las citas recientes.');
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
        mostrarResultadosCitas(citas);
    } catch (error) {
        console.error('Error al cargar citas próximas:', error);
        alert('Ha ocurrido un error al cargar las citas próximas.');
    }
}
