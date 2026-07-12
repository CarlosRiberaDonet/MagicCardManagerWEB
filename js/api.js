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

// Actualizar precios desde Cardtrader
export async function updatePricesFromCardtrader(card) {

    const token = getToken();
    if (!token) {
        showToast("Debe de estar logueado para actualizar precios", "error");
        return;
    }

    const params = new URLSearchParams({
        cardId: card.id,
        scryfallId: card.scryfallId,
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