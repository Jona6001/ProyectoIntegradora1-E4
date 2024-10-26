module.exports = (db) => {
    // Verificar el inicio de sesión
    function verificarInicioSesion(username, password, callback) {
        const query = 'SELECT * FROM empleados WHERE username = ? AND password = ?'; // Asegúrate de que el nombre de la tabla y las columnas son correctos
        db.query(query, [username, password], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
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
        const query = 'SELECT Cliente_ID, Nombre, Apellido_Paterno FROM clientes';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Función para obtener la lista de empleados
    function obtenerEmpleados(callback) {
        const query = 'SELECT Empleados_ID, Username FROM empleados';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    // Función para agregar una nueva cita
    function agregarCita(clienteId, empleadoId, fecha, hora, callback) {
        const query = 'INSERT INTO citas (Cliente_ID, Fecha, Hora) VALUES (?, ?, ?)';
        db.query(query, [clienteId, fecha, hora], (err, results) => {
            if (err) return callback(err);
            
            const citaId = results.insertId;
            const queryEmpleadosCitas = 'INSERT INTO empleados_citas (Empleados_ID, Cita_ID) VALUES (?, ?)';
            db.query(queryEmpleadosCitas, [empleadoId, citaId], callback);
        });
    }

    // Eliminar una cita
    function eliminarCita(citaId, callback) {
        const query = 'DELETE FROM citas WHERE Cita_ID = ?';
        db.query(query, [citaId], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
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
    };
};
