import { api } from './api.js';
import { cart } from './carrito.js';

async function initApp() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '<div class="text-center w-full col-span-full py-20"><p class="text-primary animate-pulse text-xl">Sincronizando con el Grid...</p></div>';

    const products = await api.getProducts();

    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="text-center text-red-500 w-full col-span-full"><p>No hay productos disponibles en este momento.</p></div>';
        return;
    }

    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        // Utilizamos las clases de Tailwind que dan el efecto Glassmorphism y alineación
        productCard.className = 'glass-card flex flex-col overflow-hidden group cursor-pointer h-full';
        
        const imgUrl = product.imagen_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80';

        productCard.innerHTML = `
            <div class="aspect-square bg-center bg-cover bg-no-repeat w-full relative" 
                 style="background-image: url('${imgUrl}')">
                <div class="absolute inset-0 bg-background-dark/20 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div class="p-5 flex flex-col gap-3 flex-grow text-left">
                <h4 class="text-lg font-bold text-white">${product.nombre}</h4>
                <p class="text-primary font-black text-xl mt-auto">$${Number(product.precio).toFixed(2)}</p>
                <button class="btn-add w-full bg-white/5 hover:bg-gradient-btn border border-white/10 hover:border-transparent rounded-lg py-2.5 text-sm font-bold text-white transition-all duration-300">
                    Agregar al Carrito
                </button>
            </div>
        `;

        // Añadir evento del carrito directo desde JS (metodología más segura que onclick="")
        const btnAdd = productCard.querySelector('.btn-add');
        btnAdd.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que se abra el modal al dar clic en el botón
            cart.addItem({
                id_producto: product.id_producto, 
                nombre: product.nombre, 
                precio: product.precio,
                imagen_url: product.imagen_url
            });
        });

        // Abrir el modal si hace clic en cualquier parte de la tarjeta
        productCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-add')) {
                openProductModal(product);
            }
        });

        productsGrid.appendChild(productCard);
    });
}

// Control del Modal
function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const imgUrl = product.imagen_url || 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80';
    document.getElementById('modal-image').style.backgroundImage = `url('${imgUrl}')`;
    document.getElementById('modal-title').textContent = product.nombre;
    document.getElementById('modal-price').textContent = `$${Number(product.precio).toFixed(2)}`;
    
    document.getElementById('modal-btn-add').onclick = () => {
        cart.addItem({
            id_producto: product.id_producto, 
            nombre: product.nombre, 
            precio: product.precio,
            imagen_url: product.imagen_url
        });
        closeProductModal();
    };
    
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }
});