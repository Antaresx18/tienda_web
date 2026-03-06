// js/app.js
import { api } from './api.js';

class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartBadge();
    }

    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.cantidad += 1;
        } else {
            this.items.push({ ...product, cantidad: 1 });
        }
        this.save();
        this.showToast(`${product.nombre} añadido al carrito`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
    }

    updateQuantity(productId, cantidad) {
        const item = this.items.find(i => i.id === productId);
        if (item) {
            item.cantidad = Math.max(1, cantidad);
            this.save();
        }
    }

    clearCart() {
        this.items = [];
        this.save();
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartBadge();
        // Disparar evento para que otras vistas se actualicen si es necesario
        window.dispatchEvent(new Event('cartUpdated'));
    }

    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.items.reduce((sum, item) => sum + item.cantidad, 0);
        badges.forEach(badge => {
            badge.textContent = count;
        });
    }

    showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ${message}`;
        container.appendChild(toast);

        // Remover después de la animación
        setTimeout(() => toast.remove(), 3000);
    }
}

export const cart = new CartManager();

// Si estamos en la página de inicio, cargar los productos
document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = '<div class="text-center w-full col-span-full"><p>Cargando arsenal...</p></div>';
        try {
            const products = await api.getProducts();
            renderProducts(products);
        } catch (error) {
            productsGrid.innerHTML = '<div class="text-center text-red-500 w-full col-span-full"><p>Error al sincronizar con el Grid.</p></div>';
        }
    }
});

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'glass-card product-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="product-img" style="background-image: url('${product.imagen || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80'}')"></div>
            <div class="product-info">
                <h4 class="product-title">${product.nombre}</h4>
                <p class="product-price">$${Number(product.precio).toFixed(2)}</p>
                <button class="btn-add" data-id="${product.id}">Agregar al Carrito</button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            // Evitar abrir modal si clickeó directamente en el botón
            if (e.target.classList.contains('btn-add')) return;
            openProductModal(product);
        });

        grid.appendChild(card);
    });

    // Agregar listeners a los botones
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(e.target.dataset.id);
            const product = products.find(p => p.id === id);
            cart.addItem(product);
        });
    });
}

function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const imgEl = document.getElementById('modal-image');
    const titleEl = document.getElementById('modal-title');
    const priceEl = document.getElementById('modal-price');
    const btnAddEl = document.getElementById('modal-btn-add');
    
    imgEl.style.backgroundImage = `url('${product.imagen || ''}')`;
    titleEl.textContent = product.nombre;
    priceEl.textContent = `$${Number(product.precio).toFixed(2)}`;
    
    btnAddEl.onclick = () => {
        cart.addItem(product);
        closeProductModal();
    };
    
    // Bloquear scroll
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }
}

// Configurar cierre del modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
    
    if (modal) {
        // Cerrar al clickear afuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }
});
