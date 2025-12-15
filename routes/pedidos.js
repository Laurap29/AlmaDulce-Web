const express = require('express');
const router = express.Router();
const conn = require('../DB/connect');

router.get('/sabores', (req, res) => {
    conn.query("SELECT * FROM Sabores", (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Error en la BD" });
        res.json(rows);
    });
});

router.get('/tamanos', (req, res) => {
    conn.query("SELECT * FROM Tamanos", (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

router.get('/decoraciones', (req, res) => {
    conn.query("SELECT * FROM Decoraciones", (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json(rows);
    });
});

router.post("/pedidos/crear", (req, res) => {
    const { id_usuario, id_sabor, id_tamano, id_decoracion, mensaje_torta, total } = req.body;

    if (!id_usuario || !id_sabor || !id_tamano || !id_decoracion) {
        return res.json({ success: false, message: "Faltan datos requeridos" });
    }

    const query = `
        INSERT INTO Pedidos (id_usuario, id_sabor, id_tamano, id_decoracion, mensaje_torta, total, estado)
        VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
    `;

    conn.query(
        query,
        [id_usuario, id_sabor, id_tamano, id_decoracion, mensaje_torta, total],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, error: err });
            }

            res.json({ success: true, id_pedido: result.insertId });
        }
    );
});


router.get('/pedidos/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            p.id_pedido,
            s.nombre AS sabor,
            t.nombre AS tamano,
            d.nombre AS decoracion,
            p.mensaje_torta,
            p.fecha,
            p.estado,
            p.total
        FROM Pedidos p
        INNER JOIN Sabores s ON p.id_sabor = s.id_sabor
        INNER JOIN Tamanos t ON p.id_tamano = t.id_tamano
        INNER JOIN Decoraciones d ON p.id_decoracion = d.id_decoracion
        WHERE p.id_usuario = ?;
    `;

    conn.query(query, [id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Error en la BD" });
        res.json(rows);
    });
});

router.delete('/pedidos/:id', (req, res) => {
    const id = req.params.id;
    conn.query('DELETE FROM Pedidos WHERE id_pedido = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al eliminar' });
        res.json({ success: true, message: 'Pedido eliminado correctamente' });
    });
});

router.get('/pedidos/admin/all', (req, res) => {

    const query = `
        SELECT 
            p.id_pedido,
            p.id_usuario,
            p.id_sabor,
            p.id_tamano,
            p.id_decoracion,
            s.nombre AS sabor,
            t.nombre AS tamano,
            d.nombre AS decoracion,
            u.nombre AS nombre_usuario,
            u.apellido AS apellido_usuario,
            p.mensaje_torta,
            p.estado,
            p.total

        FROM Pedidos p
        INNER JOIN Usuarios u 
            ON p.id_usuario = u.id_usuario
        LEFT JOIN Sabores s 
            ON p.id_sabor = s.id_sabor
        LEFT JOIN Tamanos t 
            ON p.id_tamano = t.id_tamano
        LEFT JOIN Decoraciones d 
            ON p.id_decoracion = d.id_decoracion
        ORDER BY p.id_pedido DESC
    `;

    conn.query(query, (err, rows) => {
        if (err) {
            console.error("Error ejecutando consulta /pedidos/admin/all:", err);
            return res.status(500).json({ success: false, error: err });
        }

        res.json({ success: true, data: rows });
    });
});

router.post('/pedidos/admin/update', (req, res) => {
    const { id_pedido, id_sabor, id_tamano, id_decoracion, mensaje_torta, estado, total } = req.body;

    if (!id_pedido) {
        return res.status(400).json({
            success: false,
            message: 'Falta id_pedido'
        });
    }

    const query = `
        UPDATE Pedidos SET 
            id_sabor = ?, 
            id_tamano = ?, 
            id_decoracion = ?,
            mensaje_torta = ?, 
            estado = ?, 
            total = ?
        WHERE id_pedido = ?
    `;

    conn.query(query,
        [id_sabor, id_tamano, id_decoracion, mensaje_torta, estado, total, id_pedido],
        (err, result) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: 'Pedido actualizado correctamente' });
        }
    );
});

router.delete('/admin/pedidos/delete/:id', (req, res) => {
    const id = req.params.id;
    conn.query('DELETE FROM Pedidos WHERE id_pedido = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al eliminar' });
        res.json({ success: true, message: 'Pedido eliminado correctamente' });
    });
});


module.exports = router;
