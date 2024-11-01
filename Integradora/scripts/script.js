// Variables para la paginación
let currentPage = 1;
const itemsPerPage = 8;
let citas = [];
let citasProximas = [];
let clientes = []; // Variable global para almacenar los clientes

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
    mostrarClientes('clientesBody'); // Cargar clientes al iniciar
};

// Función para cerrar sesión
// Función para cerrar sesión
async function cerrarSesion() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.removeItem('usuario'); // Elimina el usuario de localStorage
            window.location.href = "../index.html"; // Redirige al formulario de inicio de sesión
        } else {
            alert(result.message); // Manejo de errores si es necesario
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ha ocurrido un error al cerrar sesión.'); // Mensaje de error en caso de fallo
    }
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

// Mostrar citas próximas
async function mostrarCitasProximas() {
    try {
        const response = await fetch('/citas_proximas'); // Cambia la URL según tu endpoint real

        // Verificar que la respuesta sea válida
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const citasProximas = await response.json(); // Guardar las citas próximas en la variable global

        // Reiniciar currentPage a 1
        currentPage = 1;

        mostrarResultadosCitasProximas(citasProximas, 'citasBody', true); // Mostrar citas próximas

    } catch (error) {
        console.error('Error al cargar citas próximas:', error);
        const citasBody = document.getElementById('citasBody');
        citasBody.innerHTML = '<tr><td colspan="5"><center>Error al cargar citas próximas.</center></td></tr>';
    }
}

// Mostrar resultados de citas próximas
function mostrarResultadosCitasProximas(citasArray, idTablaCitas, conBotones) {
    const citasBody = document.getElementById(idTablaCitas);
    citasBody.innerHTML = '';

    if (citasArray.length === 0) {
        citasBody.innerHTML = '<tr><td colspan="5"><center>No hay citas próximas.</center></td></tr>';
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
            mostrarResultadosCitasProximas(citasArray, 'citasBody', true); // Usar la variable correcta
        };
        paginationContainer.appendChild(button);
    }
}




// Función para mostrar citas en la tabla con paginación
function mostrarResultadosCitas(citasArray, idTablaCitas, conBotones) {
    const citasBody = document.getElementById(idTablaCitas);
    citasBody.innerHTML = '';

    if (citasArray.length === 0) {
        citasBody.innerHTML = '<tr><td colspan="6"><center>No hay citas para el dia de hoy.</center></td></tr>';
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

// Función para mostrar clientes con paginación
function mostrarClientes(tablaclientes) {
    const clientesBody = document.getElementById(tablaclientes);
    clientesBody.innerHTML = '';

    fetch('/clientes')
        .then(response => response.json())
        .then(data => {
            clientes = data; // Guardar los clientes en la variable global
            mostrarResultadosClientes(clientes, clientesBody); // Mostrar clientes con paginación
        })
        .catch(error => {
            console.error('Error al mostrar los clientes:', error);
        });
}

// Función para mostrar clientes en la tabla con paginación
function mostrarResultadosClientes(clientesArray, clientesBody) {
    clientesBody.innerHTML = '';

    if (clientesArray.length === 0) {
        clientesBody.innerHTML = '<tr><td colspan="5"><center>No hay clientes registrados.</center></td></tr>';
        return;
    }

    // Calcular el índice inicial y final para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, clientesArray.length);

    // Mostrar solo los clientes de la página actual
    for (let i = startIndex; i < endIndex; i++) {
        const cliente = clientesArray[i];
        const row = `
        <tr>
            <td>${cliente.Nombre}</td>
            <td>${cliente.Apellido_Paterno} ${cliente.Apellido_Materno}</td>
            <td>${cliente.Tel}</td>
            <td>${cliente.Direccion}</td>
            <td>
                <button onclick="editarCliente(${cliente.Cliente_ID})">Editar</button>
                <button onclick="eliminarCliente(${cliente.Cliente_ID})">Eliminar</button>
            </td>
        </tr>`;
        clientesBody.innerHTML += row;
    }

    // Calcular el total de páginas y mostrar la paginación
    const totalPages = Math.ceil(clientesArray.length / itemsPerPage);
    mostrarPaginacionClientes(totalPages, clientesArray); // Pasar los clientes a la paginación
}

// Función para mostrar botones de paginación para clientes
function mostrarPaginacionClientes(totalPages, clientesArray) {
    const paginationContainer = document.getElementById('paginationClientes');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            mostrarResultadosClientes(clientesArray, document.getElementById('clientesBody')); // Usar la variable correcta
        };
        paginationContainer.appendChild(button);
    }
}

// Función para editar un cliente
function editarCliente(clienteID) {
    // Redirige a la página de edición de clientes con el ID del cliente
    window.location.href = `Cliente_Modificar.html?clienteID=${clienteID}`;
}

function eliminarCliente(clienteId) {
    if (confirm('¿Estás seguro de que deseas eliminar el cliente?')) {
    fetch(`/eliminarCliente/${clienteId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Cliente eliminado con éxito');
            mostrarClientes('clientesBody'); // Recargar la lista de clientes
        } else {
            alert('Error al eliminar el cliente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error en la solicitud de eliminación');
    });
}
}

// Función para mostrar servicios en la tabla con paginación
function mostrarResultadosServicios(serviciosArray, serviciosBody) {
    serviciosBody.innerHTML = '';

    if (serviciosArray.length === 0) {
        serviciosBody.innerHTML = '<tr><td colspan="4"><center>No hay servicios registrados.</center></td></tr>';
        return;
    }

    // Calcular el índice inicial y final para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, serviciosArray.length);

    // Mostrar solo los servicios de la página actual
    for (let i = startIndex; i < endIndex; i++) {
        const servicio = serviciosArray[i];
        const row = `
        <tr>
            <td>${servicio.Nombre}</td>
            <td>${servicio.Descripcion}</td>
            <td>${servicio.Costo} $</td>
          
            <td>
                <button onclick="editarServicio(${servicio.Servicio_ID})">Editar</button>
                <button onclick="eliminarServicio(${servicio.Servicio_ID})">Eliminar</button>
            </td>
        </tr>`;
        serviciosBody.innerHTML += row;
    }

    // Calcular el total de páginas y mostrar la paginación
    const totalPages = Math.ceil(serviciosArray.length / itemsPerPage);
    mostrarPaginacionServicios(totalPages, serviciosArray);
}

// Función para mostrar botones de paginación para servicios
function mostrarPaginacionServicios(totalPages, serviciosArray) {
    const paginationContainer = document.getElementById('paginationServicios');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            mostrarResultadosServicios(serviciosArray, document.getElementById('ServicioBody'));
        };
        paginationContainer.appendChild(button);
    }
}

// Función para cargar y mostrar los servicios al cargar la página
function cargarServicios() {
    fetch('/obtenerServicios')
        .then(response => response.json())
        .then(servicios => {
            mostrarResultadosServicios(servicios, document.getElementById('ServicioBody'));
        })
        .catch(error => {
            console.error('Error al cargar servicios:', error);
        });
}

// Función para editar un servicio
function editarServicio(servicioID) {
    // Redirige a la página de edición de servicios con el ID del servicio
    window.location.href = `Servicio_Modificar.html?servicioID=${servicioID}`;
}

// Función para eliminar un servicio
function eliminarServicio(servicioId) {
    if (confirm('¿Estás seguro de que deseas eliminar el servicio?')) {
        fetch(`/eliminarServicio/${servicioId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('Servicio eliminado con éxito');
                cargarServicios(); // Recargar la lista de servicios
            } else {
                alert('Error al eliminar el servicio');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en la solicitud de eliminación');
        });
    }
}

