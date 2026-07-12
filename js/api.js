// api.js
import { getToken } from "./auth.js";

const BASE_URL = "http://localhost:8081";

const FILTER_URL = ""; // Filtro de cartas

//BUSCAR CARTAS
export async function fetchCards(name, set, rarity, lang, typeLine, orderBy, page, size) {
    let url = `${BASE_URL}/scryfall/search?page=${page}&size=${size}`;
    if (name)     url += `&name=${encodeURIComponent(name)}`;
    if (set)      url += `&setCode=${encodeURIComponent(set)}`;
    if (rarity)   url += `&rarity=${encodeURIComponent(rarity)}`;
    if (lang)     url += `&lang=${encodeURIComponent(lang)}`;
    if (typeLine) url += `&typeLine=${encodeURIComponent(typeLine)}`;
    if (orderBy) url += `&orderBy=${encodeURIComponent(orderBy)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener cartas");
    return await response.json();
}

// Obtener ediciones para llenar el filtro de ediciones
export async function fetchSets() {
    const response = await fetch("http://localhost:8081/scryfall/sets");
    if (!response.ok) throw new Error("Error al obtener sets");
    return await response.json();
}

//Obtener detelles de una carta mediante su ID
export async function fetchCardDetails(cardId) {
     const token = getToken();

     if (!token) {
        showToast("Debe de estar logueado.", "error");
        return;
    }

    const res = await fetch(`${BASE_URL}/scryfall/${cardId}`, {
        headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
    });

    return await res.json();
}

// Obtener precios desde cardmarket
export async function fetchCardMarketPrices(cardId) {
    const token = getToken();
    if (!token) {
        showToast("Debe de estar logueado para actualizar precios", "error");
        return;
    }

    const res = await fetch(
        `${BASE_URL}/cardmarket/${cardId}`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }    
        }
    );

    if (res.status === 204) {
        return null;
    }

     if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
    }

    return await res.json();
}

// Actualizar precios desde Cardtrader
export async function updatePricesFromCardtrader(card) {

    const token = getToken();
    if (!token) {
        showToast("Debe de estar logueado para actualizar precios", "error");
        return;
    }

    const params = new URLSearchParams({
        cardId: card.id,
        lang: card.lang,
        condition: card.condition,
        isFoil: card.foil ?? false
    });

    const response = await fetch(
        `${BASE_URL}/cardtrader/lastPrices?${params}`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}