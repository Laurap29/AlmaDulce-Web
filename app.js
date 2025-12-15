const express = require('express') 
const cors = require('cors')
const dc = require('./routes/departamento_ciudad')
const fu = require('./routes/user')
const pedidos = require('./routes/pedidos');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use('/api', dc)
app.use('/api', fu)
app.use('/api', pedidos)

app.listen(3000, () => { // Iniciar el servidor en el puerto 3000
  console.log('Servidor escuchando en el puerto http://localhost:3000')// Imprimir un mensaje en la consola cuando el servidor esté activo
});