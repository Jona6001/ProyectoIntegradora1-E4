// Variables para la paginación
let currentPage = 1;
const itemsPerPage = 6;
let citas = [];
let citasProximas = [];
let clientes = []; 
let empleados = [];

// Función para mostrar el nombre del usuario en el encabezado
function mostrarUsuNomb() {
    const usuario = localStorage.getItem('usuario');
    document.getElementById("bienvenido").textContent = usuario ? `Bienvenido ${usuario}` : "Bienvenido, Usuario Desconocido";
}
mostrarUsuNomb();

// Llamar la función de mostrar fecha al cargar la página
window.onload = function() {
    mostrarFecha();
    mostrarCitasRecientes('citasBodyMain');
    mostrarClientes('clientesBody'); 
};

// Función para cerrar sesión con confirmación
function cerrarSesion() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas cerrar sesión?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, envía la solicitud para cerrar sesión
            fetch('/logout', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = "/index.html";
                    } else {
                        throw new Error('Error al cerrar sesión');
                    }
                })
                .catch(error => {
                    console.error('Error al cerrar sesión:', error);
                    Swal.fire('Error', 'Ha ocurrido un error al cerrar sesión.', 'error');
                });
        }
    });
}
    


// Función para buscar citas por fecha
async function buscarCitasPorFecha() {
    const fechaSeleccionada = document.getElementById('fechaFiltro').value;

    // Validar que se haya seleccionado una fecha
    if (!fechaSeleccionada) {
        Swal.fire('Información', 'Por favor, selecciona una fecha.', 'info');
        return;
    }

    try {
        // Hacer la solicitud al servidor para obtener citas por fecha
        const response = await fetch(`/citas_recientes?fecha=${encodeURIComponent(fechaSeleccionada)}`);

        // Si la respuesta no es exitosa, considerar que no hay citas
        if (!response.ok) {
            document.getElementById('citasBody').innerHTML = `
                <tr>
                    <td colspan="6"><center>No hay citas para la fecha seleccionada.</center></td>
                </tr>`;
            return;
        }

        const citas = await response.json();

        // Verificar si hay citas para la fecha seleccionada
        if (citas.length === 0) {
            document.getElementById('citasBody').innerHTML = `
                <tr>
                    <td colspan="6"><center>No hay citas para la fecha seleccionada.</center></td>
                </tr>`;
            return;
        }

        // Mostrar los resultados en la tabla
        currentPage = 1;
        mostrarResultadosCitas(citas, 'citasBody', true);
    } catch {
        // Si ocurre un error, mostrar el mensaje de "No hay citas"
        document.getElementById('citasBody').innerHTML = `
            <tr>
                <td colspan="6"><center>No hay citas para la fecha seleccionada.</center></td>
            </tr>`;
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
        citasBody.innerHTML = '<tr><td colspan="6"><center>No se han encontrado citas próximas.</center></td></tr>';
    }
}

// Mostrar resultados de citas próximas
function mostrarResultadosCitasProximas(citasArray, idTablaCitas, conBotones) {
    const citasBody = document.getElementById(idTablaCitas);
    citasBody.innerHTML = '';

    if (citasArray.length === 0) {
        citasBody.innerHTML = '<tr><td colspan="6"><center>No hay citas próximas.</center></td></tr>';
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
            ${conBotones ? `<td>
                <button class="accion-btn editar" onclick="editarCita(${cita.Cita_ID})" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Editar</button>
                <button class="accion-btn eliminar" onclick="eliminarCita(${cita.Cita_ID})" style="background-color: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Eliminar</button></td>` : '' }
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

            ${conBotones ? `<td> <button onclick="editarCita(${cita.Cita_ID})" 
                style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Editar
            </button>
            <button onclick="eliminarCita(${cita.Cita_ID})" 
                style="background-color: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Eliminar
            </button></td>` : '' }
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
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/eliminarCita/${citaID}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Eliminado', 'La cita ha sido eliminada con éxito.', 'success');
                    mostrarCitasRecientes('citasBody', true); // Recargar la tabla de citas en el gestor
                } else {
                    Swal.fire('Error', 'Error al eliminar la cita.', 'error');
                }
            })
            .catch(error => {
                console.error('Error al eliminar cita:', error);
                Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
            });
        }
    });
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
                 <button onclick="editarCliente(${cliente.Cliente_ID})" 
                style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Editar
            </button>
            <button onclick="eliminarCliente(${cliente.Cliente_ID})" 
                style="background-color: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Eliminar
            </button>
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
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/eliminarCliente/${clienteId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Eliminado', 'El cliente ha sido eliminado con éxito.', 'success');
                    mostrarClientes('clientesBody'); // Recargar la lista de clientes
                } else {
                    Swal.fire('Error', 'Error al eliminar el cliente.', 'error');
                }
            })
            .catch(error => {
                console.error('Error al eliminar cliente:', error);
                Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
            });
        }
    });
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
          
            <td> <button onclick="editarServicio(${servicio.Servicio_ID})" 
                style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Editar
            </button>
            <button onclick="eliminarServicio(${servicio.Servicio_ID})" 
                style="background-color: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Eliminar
            </button>
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


// Función para mostrar empleados con paginación
function mostrarEmpleados(tablaEmpleados) {
    const empleadosBody = document.getElementById(tablaEmpleados);
    empleadosBody.innerHTML = '';

    fetch('/empleados')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los empleados');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos de /empleados:', data); // Verificar datos
            empleados = data; 
            mostrarResultadosEmpleados(empleados, empleadosBody);
        })
        .catch(error => {
            console.error('Error al mostrar los empleados:', error);
        });
}

// Función para mostrar empleados en la tabla con paginación
function mostrarResultadosEmpleados(empleadosArray, empleadosBody) {
    empleadosBody.innerHTML = '';

    if (empleadosArray.length === 0) {
        empleadosBody.innerHTML = '<tr><td colspan="3"><center>No hay empleados registrados.</center></td></tr>';
        return;
    }

    // Calcular el índice inicial y final para la paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, empleadosArray.length); // Usar empleadosArray.length

    console.log(`Mostrando empleados de la página ${currentPage}:`, empleadosArray.slice(startIndex, endIndex)); // Verificar empleados mostrados

    // Mostrar solo los empleados de la página actual
    for (let i = startIndex; i < endIndex; i++) {
        const empleado = empleadosArray[i];
        const row = `
        <tr>
            <td>${empleado.Username}</td>
            <td>${empleado.Rol}</td>
            <td> <button onclick="editarEmpleado(${empleado.Empleados_ID})" 
                style="background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Editar
            </button>
            <button onclick="eliminarEmpleado(${empleado.Empleados_ID})" 
                style="background-color: #f44336; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Eliminar
            </button>
            </td>
        </tr>`;
        empleadosBody.innerHTML += row;
    }

    // Calcular el total de páginas y mostrar la paginación
    const totalPages = Math.ceil(empleadosArray.length / itemsPerPage);
    mostrarPaginacionEmpleados(totalPages, empleadosArray); 
}

// Función para mostrar botones de paginación para empleados
function mostrarPaginacionEmpleados(totalPages, empleadosArray) {
    const paginationContainer = document.getElementById('paginationEmpleados');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            mostrarResultadosEmpleados(empleadosArray, document.getElementById('empleadosBody'));
        };
        paginationContainer.appendChild(button);
    }
}

// Función para editar un empleado
function editarEmpleado(Empleados_ID) {
    window.location.href = `Empleado_Modificar.html?Empleados_ID=${Empleados_ID}`;
}

// Función para eliminar un empleado
function eliminarEmpleado(Empleados_ID) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/eliminarEmpleado/${Empleados_ID}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        Swal.fire('Eliminado', 'El empleado ha sido eliminado con éxito.', 'success');
                        mostrarEmpleados('empleadosBody'); // Recargar la lista después de eliminar
                    } else {
                        Swal.fire('Error', 'Error al eliminar el empleado.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar empleado:', error);
                    Swal.fire('Error', 'No se pudo eliminar el empleado.', 'error');
                });
        }
    });
}
