const bcrypt = require('bcrypt');
module.exports = (db) => {
 // consultas.js
 function verificarInicioSesion(username, password, callback) {
    const query = 'SELECT * FROM empleados WHERE Username = ?';
    db.query(query, [username], (err, results) => {
        if (err) return callback(err);
        
        if (results.length > 0) {
            const user = results[0];
            // Comprobar la contraseña
            if (bcrypt.compareSync(password, user.Password)) {
                callback(null, [user]); // Pasar el usuario completo, que debe incluir el rol
            } else {
                callback(null, []); // Contraseña incorrecta
            }
        } else {
            callback(null, []); // Usuario no encontrado
        }
    });
}





    // Obtener citas recientes
    function obtenerCitasRecientes(callback) {
        const query = 'CALL mostrar_citas_dia()';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    }

    // Obtener citas próximas
    function obtenerCitasProximas(callback) {
        const query = 'CALL mostrar_citas_proximas()';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    }

    // Obtener citas por fecha
    function obtenerCitasPorFecha(fecha, callback) {
        const query = 'CALL obtener_citas_por_fecha(?)';
        db.query(query, [fecha], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    }

    // Función para obtener la lista de clientes
    function obtenerClientes(callback) {
        const query = 'SELECT * FROM clientes';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Función para obtener la lista de empleados
    function obtenerEmpleados(callback) {
        const query = 'SELECT * FROM empleados';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Función para obtener la lista de servicios
    function obtenerServicios(callback) {
        const query = 'SELECT * FROM servicios';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

     // Función para obtener la lista de estados
     function obtenerEstados(callback) {
        const query = 'SELECT Estado FROM Citas';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }


    // Función para agregar una nueva cita
    function agregarCita(clienteId, empleadoId, servicioId, fecha, hora, callback) {
        const query = 'INSERT INTO citas (Cliente_ID, Servicio_ID, Fecha, Hora) VALUES (?, ?, ?, ?)';
        db.query(query, [clienteId, servicioId, fecha, hora], (err, results) => {
            if (err) return callback(err);
            const citaId = results.insertId;
            const queryEmpleadosCitas = 'INSERT INTO empleados_citas (Empleados_ID, Cita_ID) VALUES (?, ?)';
            db.query(queryEmpleadosCitas, [empleadoId, citaId], callback);
        });
    }

// Eliminar una cita y las referencias en empleados_citas
function eliminarCita(citaId, callback) {
    const queryEmpleadosCitas = 'DELETE FROM empleados_citas WHERE Cita_ID = ?';
    db.query(queryEmpleadosCitas, [citaId], (err) => {
        if (err) return callback(err);
        
        const query = 'DELETE FROM citas WHERE Cita_ID = ?';
        db.query(query, [citaId], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    });
}


    // Función para obtener una cita por ID
    function obtenerCitaPorId(citaId, callback) {
        const query = 'SELECT * FROM citas WHERE Cita_ID = ?';
        db.query(query, [citaId], (err, results) => {
            if (err) return callback(err);
        });
    }

    // Función para actualizar una cita
    function actualizarCita(id, data, callback) {
        const sql = 'UPDATE citas SET ? WHERE Cita_ID = ?';
        db.query(sql, [data, id], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    }

    // Función para eliminar un cliente
    function eliminarCliente(clienteId, callback) {
        const sql = 'DELETE FROM clientes WHERE Cliente_ID = ?';
        db.query(sql, [clienteId], callback);
    }
        // Función para eliminar citas por cliente
    function eliminarCitasPorCliente(clienteId, callback) {
        const sql = 'DELETE FROM citas WHERE Cliente_ID = ?';
        db.query(sql, [clienteId], callback);
    }

    // Función para eliminar referencias en empleados_citas
    function eliminarReferenciasEnEmpleadosCitas(clienteId, callback) {
        const sql = `
            DELETE FROM empleados_citas 
            WHERE Cita_ID IN (
                SELECT Cita_ID FROM citas WHERE Cliente_ID = ?
            )
        `;
        db.query(sql, [clienteId], callback);
    }

    // Función para obtener una cliente por ID
    function obtenerClientePorId(clienteID, callback)  {
        const query = 'SELECT * FROM clientes WHERE Cliente_ID = ?'; 
        db.query(query, [clienteID], (error, results) => {
            if (error) {
                return callback(error);
            }
            // Asegúrate de que devuelves solo un cliente
            const cliente = results.length > 0 ? results[0] : null;
            callback(null, cliente);
        });
    }

    // Funcion para actualizar un cliente
    function actualizarCliente(id, data, callback) {
        const sql = 'UPDATE clientes SET ? WHERE Cliente_ID = ?';
        db.query(sql, [data, id], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    }

    // Funcion para agregar un cliente
    function agregarCliente(cliente) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO clientes (Nombre, Apellido_Paterno, Apellido_Materno, Tel, Direccion) VALUES (?, ?, ?, ?, ?)';
            db.query(query, [cliente.nombre, cliente.apellidoPaterno, cliente.apellidoMaterno, cliente.telefono, cliente.direccion], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    }
    
     // Función para eliminar un servicio
    function eliminarServicio(servicioId, callback) {
        const sql = 'DELETE FROM servicios WHERE Servicio_ID = ?';
        db.query(sql, [servicioId], callback);
    }

    // Función para eliminar citas por servicio
    function eliminarCitasPorServicio(servicioId, callback) {
        const sql = 'DELETE FROM citas WHERE Servicio_ID = ?';
        db.query(sql, [servicioId], callback);
    }

    // Función para eliminar referencias en empleados_citas por servicio
    function eliminarReferenciasEmpleadosCitasPorServicio(servicioId, callback) {
        const sql = `
            DELETE FROM empleados_citas 
            WHERE Cita_ID IN (
                SELECT Cita_ID FROM citas WHERE Servicio_ID = ?
            )
        `;
        db.query(sql, [servicioId], callback);
    }


    
   // Función para agregar un servicio
    function agregarServicio(servicio) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO servicios (Nombre, Descripcion, Costo) VALUES (?, ?, ?)';
            db.query(query, [servicio.nombre, servicio.descripcion, servicio.costo,], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    }

    // Función para obtener un servicio por ID
function obtenerServicioPorId(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM servicios WHERE Servicio_ID = ?'; 
        db.query(sql, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0]); // Devuelve el primer resultado
        });
    });
}

        
    // Función para actualizar un servicio
function actualizarServicio(id, data) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE servicios SET ? WHERE Servicio_ID = ?';
        db.query(sql, [data, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

// Función para obtener un empleado por ID
function obtenerEmpleadoPorId(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM empleados WHERE Empleados_ID = ?';
        db.query(sql, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0]); // Devuelve el primer resultado
        });
    });
}

// Función para obtener todos los roles distintos en empleados
function obtenerRoles() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT DISTINCT rol FROM empleados'; // Obtiene solo los roles únicos
        db.query(sql, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}



// Función para actualizar un empleado
function actualizarEmpleado(id, empleadoModificado) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE empleados SET Username = ?, Rol = ? WHERE Empleados_ID = ?';
        db.query(query, [empleadoModificado.username, empleadoModificado.rol, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}


  
function agregarEmpleado(empleado, callback) {
    const { username, rol, password } = empleado;
    const query = 'INSERT INTO empleados (Username, Rol, Password) VALUES (?, ?, ?)';
    db.query(query, [username, rol, password], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = {
    verificarInicioSesion,
    agregarEmpleado // Asegúrate de exportar la función
};




// Función para actualizar un empleado
function actualizarEmpleado(id, empleadoModificado) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE empleados SET Username = ?, Rol = ? WHERE Empleados_ID = ?';
        db.query(query, [empleadoModificado.username, empleadoModificado.rol, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

// Función para eliminar un empleado
function eliminarEmpleado(id, callback) {
    // Primero, elimina las referencias en empleados_citas
    const queryDeleteCitas = 'DELETE FROM empleados_citas WHERE Empleados_ID = ?';
    
    db.query(queryDeleteCitas, [id], (err) => {
        if (err) return callback(err);

        // Luego, elimina el empleado
        const queryDeleteEmpleado = 'DELETE FROM empleados WHERE Empleados_ID = ?';
        db.query(queryDeleteEmpleado, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    });
}






    return {
        verificarInicioSesion,
        obtenerCitasRecientes,
        obtenerCitasProximas,
        obtenerCitasPorFecha,
        agregarCita,
        eliminarCita,
        obtenerClientes,
        obtenerEmpleados,
        obtenerCitaPorId,
        obtenerServicios,
        actualizarCita,
        obtenerEstados,
        eliminarCliente,
        eliminarCitasPorCliente,
        eliminarReferenciasEnEmpleadosCitas,
        actualizarCliente,
        obtenerClientePorId,
        agregarCliente,
        eliminarServicio,
        eliminarCitasPorServicio,
        eliminarReferenciasEmpleadosCitasPorServicio,
        agregarServicio,
        obtenerServicioPorId,
        actualizarServicio,
        obtenerEmpleadoPorId,
        agregarEmpleado,
        actualizarEmpleado,
        obtenerRoles,
        eliminarEmpleado
    };
};
