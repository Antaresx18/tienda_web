// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://jmzcozyoksiugeqbykbu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gSZnsXn-shQJ7nIK-gX16Q_GGtUsurZ';

const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

export const api = {
    // 1. Traer productos
    async getProducts() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?select=*`, {
                method: 'GET',
                headers: HEADERS
            });
            if (!response.ok) throw new Error('Error de red al cargar productos');
            return await response.json();
        } catch (error) {
            console.error("Error cargando productos:", error);
            return [];
        }
    },

    // 2. Guardar cliente
    async insertCustomer(customerData) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/cliente`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(customerData)
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data[0];
    },

    // 3. Guardar venta
    async insertSale(saleData) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/venta`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(saleData)
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data[0];
    },

    // 4. Guardar detalles de la venta
    async insertSaleDetail(detailsArray) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(detailsArray)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
};