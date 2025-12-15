const btnRegistrar = document.getElementById('btnRegistrar')
const form = document.getElementById('formRegistroUsuario');

form.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que recargue la página
    guardarUsuario(new FormData(form));
});


function guardarUsuario(form) {
    const formData = new URLSearchParams(new FormData())
    for (const[key, value] of form.entries()) {
        formData.append(key, value)
    }
    fetch('http://localhost:3000/api/fu/guardarUser', {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(res => {
        if (res.ok) {
            return res.json()
        }else{
            throw new Error ('Error en la respuesta del servidor al guardar usuario')
        }
    })
    .then(data => {
        console.log('Usuario guardado exitosamente:', data)
        alert ('Usuario guardado con éxito')
        window.location.href = 'login.html' // Redirigir al usuario a la página de login
    })
    .catch(error => {
        console.error('Error al guardar el usuario:', error)
        alert('Error al guardar el usuario. Por favor, inténtelo de nuevo.')
    })

    
}

console.log("conn_user.js cargado correctamente");

function login(event) {
    event.preventDefault();

    const username = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;

    if (!username || !password) {
        alert("Por favor ingresa usuario y contraseña");
        return;
    }

    fetch("http://localhost:3000/api/fu/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password })
    })
    .then(res => res.json())
    .then(data => {

        if (!data.success) {
            alert("Usuario o contraseña incorrectos");
            return;
        }

        sessionStorage.setItem("usuario", JSON.stringify({
            id_usuario: data.userId,
            rol: data.rol
        }));

        if (data.rol === "admin") {
            window.location.href = "../pages/home_admin.html";
        } else {
            window.location.href = "../pages/home_usuario.html";
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error en el servidor");
    });
}
