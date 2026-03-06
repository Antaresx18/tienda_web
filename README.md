# Documentación de StellarTech - E-commerce Cyberpunk

Este archivo documenta los detalles técnicos fundamentales de **StellarTech**, una plataforma de comercio electrónico orientada a la venta de componentes y equipos de tecnología de vanguardia.

A continuación, se detalla la arquitectura del proyecto y el ciclo de vida del proceso de compra.

---

## 1. Explicación de la arquitectura

El proyecto ha sido desarrollado utilizando un enfoque de **Vanilla JavaScript modular** en el Frontend, junto con un Backend como Servicio (BaaS) brindado por **Supabase**. La aplicación no requiere un servidor intermediario de Node.js, ya que el cliente se autentica y conecta directamente con la API REST de Supabase.

### 🛡️ Tecnologías utilizadas
* **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules).
* **Estilos:** Tailwind CSS (cargado vía CDN) combinado con un archivo de estilos personalizado (`css/styles.css`). El diseño se rige bajo una estética **Cyberpunk** y **Glassmorphism**, priorizando la temática de componentes brillantes, modo oscuro, paneles semitransparentes y neones.
* **Backend y Base de Datos:** Supabase (PostgreSQL), la cual proporciona endpoints REST automáticos.

### 🧩 Estructura Modular de JavaScript
La lógica de la aplicación se encuentra encapsulada en la carpeta `js/` a través del patrón de módulos de JavaScript:

1. **`api.js` (Capa de Datos):** 
   * Se encarga exclusivamente de las peticiones HTTP (mediante `fetch()`) hacia los endpoints REST de Supabase. 
   * Encapsula la URL base, la clave de acceso (`apikey`) y los `Headers` requeridos (incluyendo el token Bearer).
   * Presenta métodos agnósticos a la vista: `getProducts()`, `insertCustomer()`, `insertSale()` e `insertSaleDetail()`.

2. **`carrito.js` (Lógica de Negocio y Estado):**
   * Contiene la clase `ShoppingCart` encargada de centralizar la gestión del carrito de compras.
   * Utiliza **`localStorage`** para persistir el estado del carrito. Gracias a esto, si el usuario recarga la página o navega hacia otra sección, los productos seleccionados no se pierden.
   * Maneja el formulario final de pago (`checkout-form`) y gestiona las notificaciones visuales (Toasts) que informan el estatus de las acciones (ej: producto añadido).

3. **`app.js` (Controlador de la Interfaz Principal):**
   * Actúa como el puente principal (Controller) en la landing page (`index.html`).
   * Al ejecutarse, solicita la lista de productos predeterminada a `api.js`, construye de forma dinámica la cuadrícula de tarjetas de productos (DOM) y les aplica los eventos correspondientes (apertura de Modales y agregar productos al carrito).

---

## 2. Explicación del flujo de compra

El patrón de compra del e-commerce fue diseñado para ser lineal, fluido y estar protegido frente a caídas temporales de red gracias al uso de memoria persistente en el navegador.

El flujo consta de las siguientes etapas principales:

### Paso 1: Navegación y Sincronización
El usuario ingresa al portal principal (`index.html`). `app.js` detecta la carga de la página (DOM) y realiza un consumo o "get" hacia la base de datos de productos de Supabase a través de `api.getProducts()`. Los productos se muestran al usuario dinámicamente en el "Grid" principal.

### Paso 2: Selección y Adición al Carrito
El usuario interactúa explorando el catálogo. Al hacer clic en un producto o en el botón "Agregar al Carrito" (ya sea desde la Grid directa o a través del Modal de detalles), se activa el método `cart.addItem()`.
* El producto se registra en un arreglo en memoria.
* Si el producto ya existía previamente, se suma `+1` a su cantidad; si no, se agrega con cantidad `1`.
* El carrito serializa el listado a formato de texto JSON y lo guarda en la memoria del navegador (`localStorage`).
* Se actualiza la "burbuja" del contador de productos en el header y se arroja en pantalla una notificación visual (Toast) comunicando la adición correcta.

### Paso 3: Revisión de la Transacción (`carrito.html`)
Una vez listos los productos elegidos, el usuario hace clic en el ícono del carrito para dirigirse a la vista de "Checkout".
* Aquí, `carrito.js` lee los datos previos de `localStorage` y usa el método `renderCart()` para generar la vista previa de la compra, exhibiendo cantidad, precio unitario de cada tecnología, subtotal matemático, envío orbital y el precio total final.
* En esta zona, el usuario también puede eliminar elementos del carrito.

### Paso 4: Finalización del Pedido (Checkout-Form)
Tras validar la lista, el cliente rellena el formulario lateral con su Información y Datos Base (Nombres, Apellidos, Correo, Teléfono, y Dirección del envío). Al hacer "Submit", se gatilla el evento final `cart.handleCheckout()`.

### Paso 5: Persistencia en la Base de Datos (Transacción API)
Para mantener la integridad de la información en el modelo de base de datos relacional de Supabase, la compra se divide y ejecuta de manera secuencial a través de la API en `api.js`:
1. **Creación del Cliente (`insertCustomer`):** Registra los datos biográficos ingresados y el backend de Supabase contesta devolviendo el identificador único virtual (ej. `id_cliente`).
2. **Generación de la Venta (`insertSale`):** Con el `id_cliente` obtenido, se estampa un nuevo recibo global conteniendo el "Total" monetario y el estado "PAGADA", recuperando la base de datos el respectivo `id_venta`.
3. **Registro de los Detalles de la Venta (`insertSaleDetail`):** Valiéndose del `id_venta` general, el sistema cicla entre todos los artículos actuales del carrito de compras local y ejecuta una inserción en masa en la tabla de detalles, atando temporalmente cantidades y sub-totales al evento de venta.

### Paso 6: Cierre del Ciclo
Tras culminar los ingresos en base de datos satisfactoriamente:
* El almacenamiento local (`localStorage`) que memorizaba el carrito se vacía y purga por completo.
* Se emite una aleta en pantalla anunciando el éxito de la transacción: "¡Compra exitosa! Por favor, pide tu factura.".
* El aplicativo redirecciona inmediatamente al usuario nuevamente a `index.html`, dejándolo listo para una nueva ronda de compra.
