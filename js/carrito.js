import { api } from './api.js';

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
        }
        
        // Cargar el número de la burbuja al inicio
        this.updateBadge();
        
        // Si estamos en la página del carrito, renderizar la lista
        if (document.getElementById('cart-items')) {
            this.renderCart();
        }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id_producto === product.id_producto);
        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            this.items.push({ ...product, cantidad: 1 });
        }
        this.saveCart();
        this.showToast(`¡${product.nombre} agregado al arsenal!`);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateBadge();
        
        // Actualizar la lista en tiempo real si estamos en carrito.html
        if (document.getElementById('cart-items')) {
            this.renderCart();
        }
    }

    updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.items.reduce((sum, item) => sum + item.cantidad, 0);
        badges.forEach(badge => badge.textContent = count);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }
    
    removeItem(id_producto) {
        this.items = this.items.filter(i => i.id_producto !== id_producto);
        this.saveCart();
    }

    // Funcionalidad de notificaciones futuristas (en lugar de alerts intrusivos)
    showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container fixed bottom-5 right-5 z-[100] flex flex-col gap-2';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'glass px-6 py-3 rounded-full flex items-center gap-2 text-white animate-bounce shadow-lg border border-primary/20';
        toast.innerHTML = `<span class="material-symbols-outlined text-primary">check_circle</span> ${message}`;
        container.appendChild(toast);
        
        // Desaparece en 3s
        setTimeout(() => toast.remove(), 3000);
    }

    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const totalEl = document.getElementById('total');
        const subtotalEl = document.getElementById('subtotal');
        
        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center p-10 glass-card">
                    <p class="text-slate-400">Tu arsenal está vacío de tecnología.</p>
                    <a href="index.html" class="text-primary hover:underline mt-4 inline-block">Volver al Grid</a>
                </div>
            `;
            if (totalEl) totalEl.textContent = '$0.00';
            if (subtotalEl) subtotalEl.textContent = '$0.00';
            return;
        }

        cartContainer.innerHTML = this.items.map(item => `
            <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1rem; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
                <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                    <h4 style="margin: 0; color: #fff; font-size: 1.1rem; font-weight: 700;">${item.nombre}</h4>
                    <span style="font-size: 1rem; color: #a8b2c1;">$${Number(item.precio).toFixed(2)}x${item.cantidad}</span>
                </div>
                <button onclick="cart.removeItem(${item.id_producto})" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; border-radius: 8px; padding: 10px 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'; this.style.color='#ef4444';">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `).join('');

        const total = this.getSubtotal();
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
    }

    async handleCheckout(e) {
        e.preventDefault();

        if (this.items.length === 0) {
            this.showToast("Tu carrito está vacío.");
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando pago...';

        try {
            // 1. Guardar Cliente
            const documentoInput = document.getElementById('documento');
            const clienteData = {
                nombres: document.getElementById('nombres').value,
                apellidos: document.getElementById('apellidos').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                direccion: document.getElementById('direccion').value,
                documento: documentoInput ? documentoInput.value : Date.now().toString()
            };

            const cliente = await api.insertCustomer(clienteData);

            // 2. Guardar Venta
            const ventaData = {
                id_cliente: cliente.id_cliente,
                total: this.getSubtotal(),
                estado: 'PAGADA',
                metodo_pago: 'TARJETA'
            };
            const venta = await api.insertSale(ventaData);

            // 3. Guardar Detalles de la Venta
            const detallesData = this.items.map(item => ({
                id_venta: venta.id_venta,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.precio * item.cantidad
            }));

            await api.insertSaleDetail(detallesData);

            this.clearCart();
            alert("¡Compra exitosa! Por favor, pide tu factura.");
            window.location.href = 'index.html';

        } catch (error) {
            console.error("Error en el checkout:", error);
            this.showToast("Falló la transacción. Revisa la consola.");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Compra';
        }
    }
}

export const cart = new ShoppingCart();
window.cart = cart;