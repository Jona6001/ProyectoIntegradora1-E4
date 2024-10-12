const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const open = require('open');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 6001;

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost', // Dirección del servidor MySQL
    user: 'root', // Usuario MySQL
    password: '', // La contraseña del usuario 
    database: 'clinica_dental' // El nombre de la base de datos a la que se va a conectar
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Middleware para manejar el cuerpo de las solicitudes
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta principal
app.use(express.static(path.join(__dirname, '../')));

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    open(`http://localhost:${PORT}`);
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

