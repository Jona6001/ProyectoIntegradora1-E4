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

// Confirmar conexion a la BD
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

// Confirmar inicio de sesión en el archivo de consultas 
const consultas = require('./consultas')(db); // Pasa la conexión a consultas

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    consultas.verificarInicioSesion(username, password, (err, results) => {
        if (err) {
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

// Iniciar el servidor cuando se ejecuta desde el CMD
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    open(`http://localhost:${PORT}`);
});
