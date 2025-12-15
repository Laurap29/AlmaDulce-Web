let currentAction = { id: null, type: null, newState: null };

const confirmModalEl = document.getElementById("confirmModal");
const confirmModal = new bootstrap.Modal(confirmModalEl);
const confirmModalTitle = document.getElementById("confirmModalLabel");
const confirmModalBody = document.querySelector("#confirmModal .modal-body");
const btnConfirmAction = document.getElementById("btnConfirmAction");


const editModalEl = document.getElementById("editModal");
const editModal = new bootstrap.Modal(editModalEl);
const editPedidoIdEl = document.getElementById("editPedidoId");
const editEstadoSelectEl = document.getElementById("editEstadoSelect");
const btnSaveEdit = document.getElementById("btnSaveEdit");

const ADMIN_API_URL = "http://localhost:3000/api/pedidos/admin/all";

const usuario = JSON.parse(sessionStorage.getItem("usuario"));

if (!usuario || usuario.rol !== "admin") {
    alert("Acceso denegado. Solo administradores.");
    window.location.href = "../pages/login.html";
}

document.addEventListener("DOMContentLoaded", () => {

    if (btnConfirmAction) {
        btnConfirmAction.addEventListener("click", handleConfirmAction); 
    }
    if (btnSaveEdit) {
        btnSaveEdit.addEventListener("click", handleSaveEdit);
    }

    cargarTodosLosPedidos();
});

function cargarTodosLosPedidos() {
    fetch(ADMIN_API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`Error al cargar pedidos: ${res.status}`);
            return res.json();
        })
        .then(response => renderTablaPedidos(response.data))
        .catch(err => {
            console.error("Error cargando pedidos:", err);
            alert("No se pudieron cargar los pedidos.");
        });
}

function renderTablaPedidos(data) {
    const tbody = document.querySelector("#tablaPedidos tbody");
    tbody.innerHTML = "";

    data.forEach(pedido => {

        const estadoReal = pedido.estado || "Pendiente";

        const estadoClass = {
            Pendiente: "bg-danger",
            Procesando: "bg-warning text-dark",
            Completado: "bg-success",
            Entregado: "bg-info text-dark"
        }[estadoReal] || "bg-secondary";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${pedido.id_pedido}</td>
            <td>${pedido.sabor || "—"}</td>
            <td>${pedido.tamano || "—"}</td>
            <td>${pedido.decoracion || "—"}</td>
            <td><span class="badge ${estadoClass}">${estadoReal}</span></td>
            <td>$${pedido.total || 0}</td>
            <td>${botonesAccion(pedido, estadoReal)}</td>
        `;

        tbody.appendChild(tr);
    });
}

function botonesAccion(pedido, estadoActual) {

    const btnEdit = `
        <button class="btn btn-primary btn-sm p-1"
            onclick='editarPedido(${JSON.stringify(pedido)})'>
            <i class="bi bi-pencil-square"></i>
        </button>`;

    const btnDelete = `
        <button class="btn btn-danger btn-sm ms-1 p-1"
            onclick="mostrarModalAccion(${pedido.id_pedido}, 'eliminar')">
            <i class="bi bi-trash"></i>
        </button>`;

    return btnEdit + btnDelete;
}

function editarPedido(pedido) {
    sessionStorage.setItem("pedidoEditar", JSON.stringify(pedido));
    window.location.href = "editar_pedido.html";
}

function mostrarModalEditar(idPedido, estadoActual) {
    currentAction = { id: idPedido, type: 'editar', newState: null };
    editPedidoIdEl.textContent = idPedido;
    editEstadoSelectEl.value = estadoActual;
    editModal.show();
}

function mostrarModalAccion(idPedido, actionType) {
    currentAction = { id: idPedido, type: actionType, newState: null };

    confirmModalTitle.textContent = "Confirmar Eliminación";
    confirmModalBody.textContent = `¿Estás seguro de ELIMINAR el pedido ${idPedido}? Esta acción es irreversible.`;

    btnConfirmAction.textContent = "Eliminar";
    btnConfirmAction.className = "btn btn-danger";

    confirmModal.show();
}

function handleConfirmAction() {
    if (!currentAction.id || currentAction.type !== 'eliminar') return;

    confirmModal.hide();
    ejecutarEliminar(currentAction.id);

    currentAction = { id: null, type: null, newState: null };
}

function handleSaveEdit() {
    if (!currentAction.id || currentAction.type !== 'editar') return;

    const nuevoEstado = editEstadoSelectEl.value;

    editModal.hide();
    ejecutarCambioEstado(currentAction.id, nuevoEstado);

    currentAction = { id: null, type: null, newState: null };
}

function ejecutarCambioEstado(idPedido, nuevoEstado) {
    fetch(`http://localhost:3000/api/pedidos/estado/${idPedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            alert(`Estado del pedido ${idPedido} actualizado a ${nuevoEstado}`);
            cargarTodosLosPedidos();
        })
        .catch(() => alert("Error al actualizar estado"));
}

function ejecutarEliminar(idPedido) {
    fetch(`http://localhost:3000/api/admin/pedidos/delete/${idPedido}`, {
        method: "DELETE"
    })
        .then(res => {
            if (!res.ok) throw new Error();
            alert(`Pedido ${idPedido} eliminado.`);
            cargarTodosLosPedidos();
        })
        .catch(() => alert("Error al eliminar pedido"));
}
