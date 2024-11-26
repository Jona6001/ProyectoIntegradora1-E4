const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const open = require('open');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 6001;

// Configuración de la conexión a MySQL 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistemacitas',
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
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});


// Configuración de la sesión
app.use(session({
    secret: 'homies6001', // Cambia esto por un secreto más seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si estás usando HTTPS
}));



// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    consultas.verificarInicioSesion(username, password, (err, results) => {
        if (err) {
            console.error('Error al verificar inicio de sesión:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            console.log('Resultados de la consulta:', results);

            req.session.user = {
                username: results[0].Username,
                rol: results[0].Rol // Asegúrate de que esto sea correcto
            };
            return res.status(200).json({ message: 'Inicio de sesión exitoso' });
        } else {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    });
});



// Ruta para obtener la sesión actual
app.get('/api/session', (req, res) => {
    console.log('Datos de sesión:', req.session.user); // Verifica que req.session.user tenga el rol correcto
    if (req.session.user) {
        res.json({
            loggedIn: true,
            username: req.session.user.username,
            rol: req.session.user.rol
        });
    } else {
        res.json({ loggedIn: false });
    }
});



// Ruta para manejar el cierre de sesión
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.redirect('/'); // Redirige al login después de cerrar sesión
    });
});

app.get('/isAuthenticated', (req, res) => {
    if (req.session.user) {
        res.sendStatus(200); // Usuario autenticado
    } else {
        res.sendStatus(401); // Usuario no autenticado
    }
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Ruta para verificar la sesión desde el frontend
app.get('/verificar_sesion', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ autenticado: true });
    } else {
        res.status(401).json({ autenticado: false });
    }
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

    console.log('Datos recibidos para nueva cita:', { clienteId, empleadoId, servicioId, fecha, hora });

    consultas.agregarCita(clienteId, empleadoId, servicioId, fecha, hora, (err) => {
        if (err) {
            console.error('Error al agregar la cita:', err);

            // Si el error es por el rango de 15 minutos, personalizamos el mensaje
            if (err.code === 'ER_SIGNAL_EXCEPTION' && err.sqlMessage.includes('Ya existe una cita programada dentro del rango de 15 minutos')) {
                return res.status(400).json({ message: 'Ya existe una cita programada dentro del rango de 15 minutos.' });
            }

            // Para otros errores genéricos
            return res.status(500).json({ message: 'Error al agregar la cita' });
        }

        res.status(200).json({ message: 'Cita agregada con éxito' });
    });
});



// Ruta para obtener clientes activos
app.get('/clientes', (req, res) => {
    consultas.obtenerClientes((err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al obtener clientes' });
        res.json(resultados);
    });
});

// Ruta para obtener clientes desactivados
app.get('/clientes_desactivados', (req, res) => {
    consultas.obtenerClientesDesactivados((err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al obtener clientes' });
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


// Ruta para obtener servicios desactivados
app.get('/obtenerServicios_desactivados', (req, res) => {
    consultas.obtenerServiciosDesactivados((err, servicios) => {
        if (err) {
            return res.status(500).send('Error al obtener servicios');
        }
        res.json(servicios);
    });
});

// Ruta para obtener empleados
app.get('/empleados', (req, res) => {
    consultas.obtenerEmpleados((err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al obtener empleados' });
        res.json(resultados);
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
app.get('/cita/:id', (req, res) => {
    const { id } = req.params;
    consultas.obtenerCitaPorId(id, (err, cita) => {
        if (err) {
            console.error('Error al obtener la cita:', err);
            res.status(500).send('Error del servidor');
        } else if (cita) {
            res.json(cita);
        } else {
            res.status(404).send('Cita no encontrada');
        }
    });
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


// Ruta para desactivar un cliente
app.patch('/desactivarCliente/:id', (req, res) => {
    const clienteId = req.params.id;

    consultas.desactivarCliente(clienteId, (err) => {
        if (err) {
            console.error('Error al desactivar cliente:', err);
            return res.status(500).json({ message: 'Error al desactivar el cliente' });
        }
        res.status(200).json({ message: 'Cliente desactivado con éxito' });
    });
});

// Ruta para activar un cliente
app.patch('/activarCliente/:id', (req, res) => {
    const clienteId = req.params.id;

    consultas.activarCliente(clienteId, (err, result) => {
        if (err) {
            console.error('Error al activar cliente:', err);
            return res.status(500).json({ message: 'Error al activar el cliente' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json({ message: 'Cliente activado con éxito' });
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


// Ruta para desactivar un servicio
app.patch('/desactivarServicio/:id', (req, res) => {
    const servicioId = req.params.id;
    console.log("Desactivando servicio con ID:", servicioId);  // Para depuración

    consultas.desactivarServicio(servicioId, (err) => {
        if (err) {
            console.error('Error al desactivar servicio:', err);
            return res.status(500).json({ message: 'Error al desactivar el servicio' });
        }
        console.log('Servicio desactivado con éxito');
        res.status(200).json({ message: 'Servicio desactivado con éxito' });
    });
});


// Ruta para activar un servicio
app.patch('/activarServicio/:id', (req, res) => {
    const servicioId = req.params.id;

    consultas.activarServicio(servicioId, (err, result) => {
        if (err) {
            console.error('Error al activar servicio:', err);
            return res.status(500).json({ message: 'Error al activar el servicio' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.status(200).json({ message: 'Servicio activado con éxito' });
    });
});




// Ruta para eliminar un empleado
app.delete('/eliminarEmpleado/:id', (req, res) => {
    const empleadoId = req.params.id;

    // Llamar a la función de eliminación
    consultas.eliminarEmpleado(empleadoId, (err, results) => {
        if (err) {
            console.error('Error al eliminar empleado:', err);
            return res.status(500).json({ error: 'Error al eliminar empleado' });
        }
        res.status(200).json({ message: 'Empleado eliminado con éxito' });
    });
});



// Ruta para obtener un empleado por ID
app.get('/empleados/:id', (req, res) => {
    const empleadoId = req.params.id;
    consultas.obtenerEmpleadoPorId(empleadoId)
        .then(empleado => {
            if (!empleado) {
                return res.status(404).json({ error: 'Empleado no encontrado' });
            }
            res.json(empleado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener el empleado' });
        });
});



// Ruta para actualizar un empleado
app.put('/empleados/:empleadoID', (req, res) => {
    const empleadoID = req.params.empleadoID; // Obtiene el ID del empleado de los parámetros de la URL
    const empleadoModificado = req.body; // Asegúrate de que el cuerpo de la solicitud tenga la estructura correcta

    // Llama a la función de actualización de empleado
    consultas.actualizarEmpleado(empleadoID, empleadoModificado)
        .then(() => res.status(200).json({ message: 'Empleado actualizado correctamente' }))
        .catch(error => res.status(500).json({ message: 'Error al actualizar el empleado', error }));
});



// Ruta para obtener todos los roles
app.get('/roles', (req, res) => {
    consultas.obtenerRoles()
        .then(roles => res.json(roles))
        .catch(err => {
            console.error('Error al obtener roles:', err);
            res.status(500).json({ error: 'Error al obtener roles' });
        });
});


app.post('/nuevo_empleado', (req, res) => {
    const { username, rol, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    consultas.agregarEmpleado({ username, rol, password: hashedPassword }, (error, results) => {
        if (error) {
            console.error('Error al agregar empleado:', error);

            // Verificamos si el error es por nombre duplicado
            if (error.code === 'ER_SIGNAL_EXCEPTION' && error.sqlMessage.includes('El nombre de usuario ya existe.')) {
                return res.status(400).json({ message: 'El nombre de usuario ya existe.' });
            }

            return res.status(500).json({ message: 'Error en el servidor' });
        }
        return res.status(201).json({ message: 'Empleado agregado exitosamente' });
    });
});


// Ruta para obtener las citas de un empleado específico
app.get('/citas/empleado/:id', (req, res) => {
    const empleadoId = req.params.id;

    // Llama a mostrarCitasEmpleados desde el objeto consultas
    consultas.mostrarCitasEmpleados(empleadoId, (err, citas) => {
        if (err) {
            console.error('Error al obtener citas:', err);
            return res.status(500).send('Error al obtener las citas');
        }
        res.json(citas); // Devuelve las citas al frontend
    });
});

app.get('/citas/empleado/:id', (req, res) => {
    const empleadoId = req.params.id;

    consultas.obtenerNombreEmpleado(empleadoId, (err, empleado) => {
        if (err) {
            console.error('Error al obtener nombre del empleado:', err);
            return res.status(500).send('Error al obtener el nombre del empleado');
        }

        consultas.mostrarCitasEmpleados(empleadoId, (err, citas) => {
            if (err) {
                console.error('Error al obtener citas:', err);
                return res.status(500).send('Error al obtener las citas');
            }

            res.json({ empleado, citas }); // Envía el nombre del empleado y las citas
        });
    });
});



// Ruta para cambiar contraseña
app.post('/cambiar_contrasena', (req, res) => {
    const { contrasena_actual, nueva_contrasena } = req.body;

    // Verificamos la contraseña actual
    consultas.verificarContra(contrasena_actual, (err, esValida) => {
        if (err) {
            console.error('Error al verificar la contraseña:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (!esValida) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Si la contraseña actual es válida, cambiamos la contraseña
        consultas.cambiarContra(nueva_contrasena, (err, success) => {
            if (err) {
                console.error('Error al cambiar la contraseña:', err);
                return res.status(500).json({ message: 'Error al cambiar la contraseña' });
            }

            return res.status(200).json({ message: 'Contraseña cambiada con éxito' });
        });
    });
});





// Iniciar el servidor cuando se ejecuta desde el CMD
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    open(`http://localhost:${PORT}`);
});