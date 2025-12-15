let preciosSabores = {};
let preciosTamanos = {};
let preciosDecoraciones = {};


document.addEventListener('DOMContentLoaded', function () {
    let pedidoEditar = null;
    const data = sessionStorage.getItem('pedidoEditar'); 

    if (data) {
        try {
            pedidoEditar = JSON.parse(data);
        } catch (e) {
            console.error("Error parseando pedidoEditar:", e);
        }
    }

    if (!pedidoEditar || typeof pedidoEditar !== "object") {
        alert("No se encontró información del pedido a editar.");
        window.location.href = "admin_pedido.html"; 
        return;
    }
    const titleSpan = document.getElementById('editPedidoTitleId');
    if (titleSpan) titleSpan.textContent = `#${pedidoEditar.id_pedido}`;
    cargarOpcionesSelects(function () {
        cargarFormulario(pedidoEditar);
    });
    const form = document.getElementById('formEditarPedido');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        actualizarPedido(pedidoEditar.id_pedido);
    });
});

function cargarOpcionesSelects(callback) {

    Promise.all([
        fetch("http://localhost:3000/api/sabores").then(r => r.json()),
        fetch("http://localhost:3000/api/tamanos").then(r => r.json()),
        fetch("http://localhost:3000/api/decoraciones").then(r => r.json())
    ])
    .then(([sabores, tamanos, decoraciones]) => {
        llenarSelect("id_sabor", sabores, "id_sabor", "nombre", "sabor"); 
        llenarSelect("id_tamano", tamanos, "id_tamano", "nombre", "tamano");
        llenarSelect("id_decoracion", decoraciones, "id_decoracion", "nombre", "decoracion");
        
        callback(); 
    })
    .catch(error => {
        console.error("Error cargando selects:", error);
        alert("Error cargando información de sabores, tamaños o decoraciones.");
    });
}

function llenarSelect(idSelect, data, idKey, textKey, tipo) {

    const select = document.getElementById(idSelect);
    select.addEventListener('change', calcularTotal); // Agregar listener de cambio

    data.forEach(item => {
        const option = document.createElement("option");
        const precio = item.precio ?? item.precio_extra ?? 0;
        
        if (tipo === "sabor") {
            preciosSabores[item[idKey]] = Number(precio);
        } else if (tipo === "tamano") {
            preciosTamanos[item[idKey]] = Number(precio);
        } else if (tipo === "decoracion") {
            preciosDecoraciones[item[idKey]] = Number(precio);
        }
        
        option.value = item[idKey];
        option.textContent = `${item[textKey]} - $${precio}`;
        select.appendChild(option);
    });
}

function cargarFormulario(pedido) {
    document.getElementById('id_pedido').value = pedido.id_pedido;
    document.getElementById('id_sabor').value = pedido.id_sabor;
    document.getElementById('id_tamano').value = pedido.id_tamano;
    document.getElementById('id_decoracion').value = pedido.id_decoracion;
    document.getElementById('mensaje_torta').value = pedido.mensaje_torta || "";
    document.getElementById('estado').value = pedido.estado.toLowerCase(); 
    calcularTotal();
}

function calcularTotal() {
    const saborId = document.getElementById("id_sabor").value;
    const tamanoId = document.getElementById("id_tamano").value;
    const decoracionId = document.getElementById("id_decoracion").value;

    const precioSabor = preciosSabores[saborId] || 0;
    const precioTamano = preciosTamanos[tamanoId] || 0;
    const precioDecoracion = preciosDecoraciones[decoracionId] || 0;

    const total = precioSabor + precioTamano + precioDecoracion;

    document.getElementById("total").value = total.toFixed(2); // Muestra el total con dos decimales
}

function actualizarPedido(id_pedido) {

    const datosActualizados = {
        id_pedido: id_pedido,
        id_sabor: document.getElementById('id_sabor').value,
        id_tamano: document.getElementById('id_tamano').value,
        id_decoracion: document.getElementById('id_decoracion').value,
        mensaje_torta: document.getElementById('mensaje_torta').value.trim(),
        estado: document.getElementById('estado').value,
        total: Number(document.getElementById('total').value) // Usamos el valor calculado
    };

    fetch("http://localhost:3000/api/pedidos/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizados)
    })
    .then(response => response.json())
    .then(data => {

        if (!data.success) {
            throw new Error("Error actualizando pedido");
        }

        alert("Pedido actualizado correctamente");
        window.location.href = "admin_pedido.html"; // Redirigir a la lista de administración

    })
    .catch(error => {
        console.error("Error:", error);
        alert("No se pudo actualizar el pedido.");
    });
}