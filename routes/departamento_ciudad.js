
const express = require('express')
const router = express.Router()
const conn = require('../DB/connect')


// Request / req => la solicitud que envia el usuario desde el navegador
// Response / res => la respuesta que el servidor le envia al usuario
router.get('/dc/departamento', (req, res) => {  
    conn.query('SELECT * FROM Departamentos WHERE activo = true', (err, rows) => {
      if (err) throw err
        res.json(rows) //envio los datos al cliente en formato json
    })
})

router.get('/dc/ciudades/:id', (req, res) => {
    const {id} = req.params
    conn.query('SELECT * FROM Ciudades WHERE fk_id_depto = ? AND activo = true', [id], (err, rows) => {
        if (err) throw err
                res.json(rows) //envio los datos al cliente en formato json
    })
})


module.exports = router;