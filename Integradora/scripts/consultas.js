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

    // Exportar la función para usarla en otros archivos
    return {
        verificarInicioSesion,
    };
};

