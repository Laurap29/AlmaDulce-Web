const mysql = require('mysql2'); // Importar la librería mysqls para conectarse a bases de datos MySQL

 // Crear una conexión a la base de datos
const conn = mysql.createConnection({ 
    host: 'localhost', // Dirección del servidor de la base de datos
    user: 'root', // Nombre de usuario para la base de datos
    password: 'Pepe2018$$Lps1', // Contraseña para la base de datos
    database: 'proyecto_final' // Nombre de la base de datos a la que se desea conectar
}) 

conn.connect((err) => { // Intentar conectar a la base de datos
    if (err) { // Si hay un error durante la conexión
        console.error('Error al conectar la base de datos: ' + err.stack); // Imprimir el error en la consola
        return // Salir de la función
}
    console.log('Conexion exitosa a mysql'); // Imprimir un mensaje de éxito con el ID del hilo de conexión
    console.log("Conectado a la base:", conn.config.database);


});

module.exports = conn; // Exportar la conexión para que pueda ser utilizada en otros archivos