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
        const query = "CALL mostrar_citas_proximas();"; // Llama al procedimiento que muestra citas próximas
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    }

    return {
        verificarInicioSesion,
        obtenerCitasRecientes,
        obtenerCitasProximas
    };
};
