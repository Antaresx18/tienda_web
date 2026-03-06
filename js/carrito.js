// js/carrito.js
import { cart } from './app.js';
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    window.addEventListener('cartUpdated', renderCart);

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('total');
    if (!cartContainer) return;

    if (cart.items.length === 0) {
        cartContainer.innerHTML = '<p class="text-center p-4">Tu arsenal está vacío.</p>';
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }

    cartContainer.innerHTML = cart.items.map(item => `
        <div class="glass-card cart-item">
            <div class="cart-item-details">
                <h4>${item.nombre}</h4>
                <p>$${Number(item.precio).toFixed(2)} x ${item.cantidad}</p>
            </div>
            <button class="btn-remove" data-id="${item.id}">Eliminar</button>
        </div>
    `).join('');

    if (totalEl) totalEl.textContent = `$${cart.getSubtotal().toFixed(2)}`;

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => cart.removeItem(parseInt(e.target.dataset.id)));
    });
}

async function handleCheckout(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    try {
        // 1. Cliente (Asegúrate que los IDs coincidan con tu HTML)
        const cliente = await api.insertCustomer({
            nombres: document.getElementById('nombres').value,
            apellidos: document.getElementById('apellidos').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            direccion: document.getElementById('direccion').value || document.getElementById('direccion-base').value
        });

        // 2. Venta
        const venta = await api.insertSale({
            id_cliente: cliente.id,
            total: cart.getSubtotal()
        });

        // 3. Detalles
        const detalles = cart.items.map(item => ({
            id_venta: venta.id,
            id_producto: item.id,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        }));

        await api.insertSaleDetail(detalles);

        cart.clearCart();
        cart.showToast("¡Transacción confirmada en la Red!");
        setTimeout(() => window.location.href = 'index.html', 2000);

    } catch (error) {
        console.error("Error en el checkout:", error);
        cart.showToast("Error al procesar la compra. Revisa la consola.");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar Transacción';
    }
}