module.exports = (db) => {
    // Función para verificar las credenciales del usuario
    const verificarInicioSesion = (username, password, callback) => {
        const query = 'SELECT * FROM empleados WHERE Username = ? AND Password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return callback(err);
            }
            callback(null, results);
        });
    };
    

    // Función para obtener citas recientes
    function obtenerCitasRecientes(callback) {
        const query = "CALL mostrar_citas_dia();";
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    }

    // Función para obtener citas próximas
    function obtenerCitasProximas(callback) {
        const query = "CALL mostrar_citas_proximas();"; 
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    }

    // Función para obtener citas por fecha
    function obtenerCitasPorFecha(fecha, callback) {
        const query = "CALL obtener_citas_por_fecha(?);"; 
        db.query(query, [fecha], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]); 
        });
    }

    // Función para eliminar una cita
    function eliminarCita(citaId, callback) {
        const query = "DELETE FROM citas WHERE Cita_ID = ?";
        db.query(query, [citaId], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }

    


    //Mandar a llamar las funciones
    return {
        verificarInicioSesion,
        obtenerCitasRecientes,
        obtenerCitasProximas,
        obtenerCitasPorFecha,
        eliminarCita 
    };
};
