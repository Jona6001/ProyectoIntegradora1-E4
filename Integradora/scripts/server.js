const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const open = require('open');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 6001;

// Configuración de la conexión a MySQL 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistemacitas'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const consultas = require('./consultas')(db); // Pasa la conexión a consultas

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    console.log('Iniciando sesión con:', req.body); // Agregar este log
    const { username, password } = req.body;

    consultas.verificarInicioSesion(username, password, (err, results) => {
        if (err) {
            console.error('Error al verificar inicio de sesión:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(200).json({ message: 'Inicio de sesión exitoso' });
        } else {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    });
});


// Ruta para obtener citas recientes o buscar por fecha
app.get('/citas_recientes', (req, res) => {
    const fecha = req.query.fecha;
    
    if (fecha) {
        consultas.obtenerCitasPorFecha(fecha, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ message: 'Error en el servidor al buscar citas por fecha' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No hay citas agregadas para ese día.' });
            }
            res.status(200).json(results);
        });
    } else {
        consultas.obtenerCitasRecientes((err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ message: 'Error en el servidor al buscar citas recientes' });
            }
            res.status(200).json(results);
        });
    }
});

// Ruta para obtener las citas próximas
app.get('/citas_proximas', (req, res) => {
    consultas.obtenerCitasProximas((err, results) => {
        if (err) {
            console.error('Error al obtener citas próximas:', err);
            return res.status(500).json({ message: 'Error al obtener citas próximas' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No hay citas próximas.' });
        }

        res.status(200).json(results);
    });
});

// Ruta para eliminar una cita
app.delete('/eliminarCita/:id', (req, res) => {
    const citaId = req.params.id;
    
    consultas.eliminarCita(citaId, (err, results) => {
        if (err) {
            console.error('Error al eliminar cita:', err);
            return res.status(500).json({ message: 'Error al eliminar la cita' });
        }
        res.status(200).json({ message: 'Cita eliminada con éxito' });
    });
});

// Ruta para agregar una nueva cita
app.post('/nueva_cita', (req, res) => {
    const { clienteId, empleadoId, servicioId, fecha, hora } = req.body;

    console.log('Datos recibidos para nueva cita:', { clienteId, empleadoId, servicioId, fecha, hora }); // Agregar este log

    consultas.agregarCita(clienteId, empleadoId, servicioId, fecha, hora, (err) => {
        if (err) {
            console.error('Error al agregar la cita:', err); // Log del error
            return res.status(500).json({ message: 'Error al agregar la cita' });
        }
        res.status(200).json({ message: 'Cita agregada con éxito' });
    });
});



// Ruta para obtener clientes
app.get('/clientes', (req, res) => {
    consultas.obtenerClientes((err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al obtener clientes' });
        res.json(resultados);
    });
});

// Ruta para obtener empleados
app.get('/empleados', (req, res) => {
    consultas.obtenerEmpleados((err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al obtener empleados' });
        res.json(resultados);
    });
});


// Ruta para obtener servicios
app.get('/obtenerServicios', (req, res) => {
    consultas.obtenerServicios((err, servicios) => {
        if (err) {
            return res.status(500).send('Error al obtener servicios');
        }
        res.json(servicios);
    });
});




// Ruta para obtener estados
app.get('/estados', (req, res) => {
    consultas.obtenerEstados((err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al obtener estados' });
        res.json(resultados);
    });
});


// Ruta para obtener una cita por ID
app.get('/cita/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cita = await consultas.obtenerCitaPorId(id); // Verifica que esta función esté definida correctamente
        if (cita) {
            res.json(cita);
        } else {
            res.status(404).send('Cita no encontrada');
        }
    } catch (error) {
        console.error('Error al obtener la cita:', error);
        res.status(500).send('Error del servidor');
    }
});



// Ruta para actualizar una cita
app.put('/citas/:id', (req, res) => {
    const citaId = req.params.id;
    const { clienteId, servicioId, fecha, hora, estado } = req.body; 
    const data = { Cliente_ID: clienteId, Servicio_ID: servicioId, Fecha: fecha, Hora: hora, Estado: estado };
    consultas.actualizarCita(citaId, data, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar la cita' });
        res.json({ success: true, result });
    });
});


// Ruta para eliminar un cliente
app.delete('/eliminarCliente/:id', (req, res) => {
    const clienteId = req.params.id;
    
    // Elimina las citas relacionadas primero
    consultas.eliminarCitasPorCliente(clienteId, (err) => {
        if (err) {
            console.error('Error al eliminar citas del cliente:', err);
            return res.status(500).json({ message: 'Error al eliminar citas del cliente' });
        }
        
        // Ahora elimina el cliente
        consultas.eliminarCliente(clienteId, (err) => {
            if (err) {
                console.error('Error al eliminar cliente:', err);
                return res.status(500).json({ message: 'Error al eliminar el cliente' });
            }
            res.status(200).json({ message: 'Cliente eliminado con éxito' });
        });
    });
});


// Ruta para obtener los clientes por ID
app.get('/clientes/:clienteID', (req, res) => {
    const clienteID = req.params.clienteID;
    console.log(`Recibiendo solicitud para obtener cliente con ID: ${clienteID}`); // Log para depuración

    consultas.obtenerClientePorId(clienteID, (error, cliente) => {
        if (error) {
            console.error('Error al obtener cliente:', error); // Log de error
            return res.status(500).json({ error: 'Error al obtener cliente' });
        }
        if (!cliente) {
            console.warn(`Cliente con ID ${clienteID} no encontrado`); // Log si el cliente no se encuentra
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        console.log('Cliente encontrado:', cliente); // Log del cliente encontrado
        res.json(cliente);
    });
});



// Ruta para actualizar un cliente
app.put('/clientes/:id', (req, res) => {
    const clienteId = req.params.id;
    const { Nombre, Apellido_Paterno, Apellido_Materno, Tel, Direccion } = req.body; 
    const data = { Nombre, Apellido_Paterno, Apellido_Materno, Tel, Direccion };
    
    consultas.actualizarCliente(clienteId, data, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar el cliente' });
        res.json({ success: true, result });
    });
});


// Ruta para agregar un nuevo cliente
app.post('/nuevo_cliente', (req, res) => {
    const cliente = req.body; // Aquí recibimos el cliente del cuerpo de la solicitud

    console.log('Datos recibidos para nuevo cliente:', cliente); // Agregar este log para depuración

    consultas.agregarCliente(cliente)
        .then(() => {
            res.status(200).json({ message: 'Cliente agregado con éxito' });
        })
        .catch(err => {
            console.error('Error al agregar el cliente:', err); // Log del error
            res.status(500).json({ message: 'Error al agregar el cliente' });
        });
});


// Ruta para agregar un nuevo servicio
app.post('/nuevo_servicio', (req, res) => {
    const servicio = req.body; // Aquí recibimos el servicio del cuerpo de la solicitud

    console.log('Datos recibidos para nuevo servicio:', servicio); // Agregar este log para depuración

    consultas.agregarServicio(servicio)
        .then(() => {
            res.status(200).json({ message: 'Servicio agregado con éxito' });
        })
        .catch(err => {
            console.error('Error al agregar el servicio:', err); // Log del error
            res.status(500).json({ message: 'Error al agregar el servicio' });
        });
});


// Ruta para obtener un servicio por ID
app.get('/servicios/:id', (req, res) => {
    const servicioId = req.params.id;
    consultas.obtenerServicioPorId(servicioId)
        .then(servicio => res.json(servicio))
        .catch(err => {
            console.error('Error al obtener servicio:', err);
            res.status(500).json({ error: 'Error al obtener servicio' });
        });
});

// Ruta para actualizar un servicio
app.put('/servicios/:servicioID', (req, res) => {
    const servicioID = req.params.servicioID;
    const servicioModificado = req.body; // Asegúrate de que tu cuerpo de la solicitud esté correctamente estructurado
    consultas.actualizarServicio(servicioID, servicioModificado)
        .then(() => res.status(200).json({ message: 'Servicio actualizado' }))
        .catch(error => res.status(500).json({ message: 'Error al actualizar el servicio', error }));
});


// Ruta para eliminar un servicio
app.delete('/eliminarServicio/:id', (req, res) => {
    const servicioId = req.params.id;
    
    // Elimina las citas relacionadas primero
    consultas.eliminarCitasPorServicio(servicioId, (err) => {
        if (err) {
            console.error('Error al eliminar citas del servicio:', err);
            return res.status(500).json({ message: 'Error al eliminar citas del servicio' });
        }

        // Elimina las referencias en empleados_citas por servicio
        consultas.eliminarReferenciasEnEmpleadosCitasPorServicio(servicioId, (err) => {
            if (err) {
                console.error('Error al eliminar referencias de empleados_citas:', err);
                return res.status(500).json({ message: 'Error al eliminar referencias de empleados_citas' });
            }
            
            // Ahora elimina el servicio
            consultas.eliminarServicio(servicioId, (err) => {
                if (err) {
                    console.error('Error al eliminar servicio:', err);
                    return res.status(500).json({ message: 'Error al eliminar el servicio' });
                }
                res.status(200).json({ message: 'Servicio eliminado con éxito' });
            });
        });
    });
});





// Iniciar el servidor cuando se ejecuta desde el CMD
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    open(`http://localhost:${PORT}`);
});
