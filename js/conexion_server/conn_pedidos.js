let preciosSabores = {};
let preciosTamanos = {};
let preciosDecoraciones = {};
let pedidoAEliminar = null; // para modal

const usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (!usuario) {
    alert("No estás logueado");
    window.location.href = "../pages/login.html";
}
const id_usuario = usuario.id_usuario;

function cargarSelect(url, selectId, placeholder, tipo) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById(selectId);
            select.innerHTML = `<option value="">${placeholder}</option>`;
            data.forEach(item => {
                if (tipo === "sabor") preciosSabores[item.id_sabor] = 0;
                if (tipo === "tamano") preciosTamanos[item.id_tamano] = Number(item.precio);
                if (tipo === "decoracion") preciosDecoraciones[item.id_decoracion] = Number(item.precio_extra);

                let precio = item.precio ?? item.precio_extra ?? 0;
                const opt = document.createElement("option");
                opt.value = item.id_sabor || item.id_tamano || item.id_decoracion;
                opt.textContent = `${item.nombre} - $${precio}`;
                select.appendChild(opt);
            });
            select.addEventListener("change", calcularTotal);
        });
}

function calcularTotal() {
    const sabor = document.getElementById("sabor").value;
    const tamano = document.getElementById("tamano").value;
    const decoracion = document.getElementById("decoracion").value;
    const total = (preciosSabores[sabor] || 0) + (preciosTamanos[tamano] || 0) + (preciosDecoraciones[decoracion] || 0);
    document.getElementById("totalPedido").textContent = total;
}

function cargarMisPedidos() {
    let url = usuario.rol === "admin" 
        ? "http://localhost:3000/api/pedidos/admin/all"
        : `http://localhost:3000/api/pedidos/${id_usuario}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#tablaPedidos tbody");
            tbody.innerHTML = "";

            data.forEach(pedido => {
                const tr = document.createElement("tr");

                let acciones = '';
                if(usuario.rol === "admin"){
                    acciones = `
                        <button class="btn btn-warning btn-sm me-1" onclick="editarPedido(${pedido.id_pedido})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="cancelarPedido(${pedido.id_pedido})">Eliminar</button>
                    `;
                } else {
                    acciones = `<button class="btn btn-danger btn-sm" onclick="cancelarPedido(${pedido.id_pedido})">Cancelar</button>`;
                }

                tr.innerHTML = `
                    <td>${pedido.id_pedido}</td>
                    <td>${pedido.sabor}</td>
                    <td>${pedido.tamano}</td>
                    <td>${pedido.decoracion}</td>
                    <td>${pedido.estado}</td>
                    <td>$${pedido.total}</td>
                    <td>${acciones}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error cargando pedidos:", err));
}

function editarPedido(id_pedido){
    window.location.href = `editar_pedido.html?id=${id_pedido}`;
}

cargarSelect("http://localhost:3000/api/sabores", "sabor", "Seleccione un sabor", "sabor");
cargarSelect("http://localhost:3000/api/tamanos", "tamano", "Seleccione un tamaño", "tamano");
cargarSelect("http://localhost:3000/api/decoraciones", "decoracion", "Seleccione una decoración", "decoracion");

cargarMisPedidos();

document.getElementById("formPedido").addEventListener("submit", function (event) {
    event.preventDefault();
    const id_sabor = document.getElementById("sabor").value;
    const id_tamano = document.getElementById("tamano").value;
    const id_decoracion = document.getElementById("decoracion").value;
    const mensaje_torta = document.getElementById("mensaje").value;
    const total = document.getElementById("totalPedido").textContent;

    fetch("http://localhost:3000/api/pedidos/crear", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"      
        },
        body: JSON.stringify({                      
            id_usuario,
            id_sabor,
            id_tamano,
            id_decoracion,
            mensaje_torta,
            total
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert("No se pudo crear el pedido");
            return;
        }
        alert("Pedido creado correctamente");
        document.getElementById("formPedido").reset();
        document.getElementById("totalPedido").textContent = 0;
        cargarMisPedidos();
    })
    .catch(err => {
        console.error(err);
        alert("Error en el servidor");
    });
});

function cancelarPedido(id_pedido) {
    const fila = Array.from(document.querySelectorAll("#tablaPedidos tbody tr"))
        .find(tr => tr.children[0].textContent == id_pedido);
    
    const estado = fila ? fila.children[4].textContent : null;

    if (estado === "en proceso") {
        const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
        infoModal.show();
        return;
    }

    pedidoAEliminar = id_pedido;
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
}

document.getElementById('btnConfirmDelete').addEventListener('click', function () {
    if (!pedidoAEliminar) return;
    fetch(`http://localhost:3000/api/pedidos/${pedidoAEliminar}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
        if (data.success) alert("Pedido eliminado correctamente");
        else alert("No se pudo eliminar el pedido");
        pedidoAEliminar = null;
        const modalEl = document.getElementById('confirmModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        cargarMisPedidos();
    })
    .catch(err => { console.error(err); alert("Error en el servidor al eliminar el pedido"); });
});

