// js/api.js
const SUPABASE_URL = 'https://jmzcozyoksiugeqbykbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gSZnsXn-shQJ7nIK-gX16Q_GGtUsurZ';

const HEADERS = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer': 'return=representation'
};

export const api = {
    async getProducts() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*`, {
                method: 'GET',
                headers: HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error("Error cargando productos:", error);
            return [];
        }
    },

    async insertCustomer(customerData) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error Supabase Cliente:", err);
            throw new Error(err.message);
        }

        const data = await response.json();
        return data[0];
    },

    async insertSale(saleData) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/ventas`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(saleData)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error Supabase Venta:", err);
            throw new Error(err.message);
        }

        const data = await response.json();
        return data[0];
    },

    async insertSaleDetail(detailsArray) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(detailsArray)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Error Supabase Detalles:", err);
            throw new Error(err.message);
        }
        return await response.json();
    }
};