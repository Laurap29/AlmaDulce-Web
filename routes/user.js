const express = require('express')
const router = express.Router()
const conn = require('../DB/connect')

router.post('/fu/guardarUser', (req, res) => {
    
    console.log(req.body);

    const { nombres, apellidos, correo, rol, direccion, ciudad, username, pass } = req.body;
    if (!nombres || !apellidos || !correo || !rol || !direccion || !ciudad || !username || !pass) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos por enviar'
        });
    }

    const query = `INSERT INTO Usuarios (nombre, apellido, email, direccion, fk_id_ciudad, usuario, pass, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombres, apellidos, correo, direccion, ciudad, username, pass, rol];

    conn.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al guardar el usuario:', err);
            return res.status(502).json({
                success: false,
                message: 'Respuesta de error por parte de la base de datos'
            });
        }
        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente'
        });
    });

});

router.post('/fu/login', (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos'
        });
    }

    const query = `
        SELECT id_usuario, rol 
        FROM Usuarios 
        WHERE usuario = ? AND pass = ?
    `;

    conn.query(query, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: 'Error en base de datos'
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const user = result[0];

        res.json({
            success: true,
            userId: user.id_usuario,
            rol: user.rol
        });
    });
});


module.exports = router;
