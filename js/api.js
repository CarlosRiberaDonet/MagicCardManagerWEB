// api.js
import { getToken } from "./auth.js";
import { showToast } from "./utils.js";

const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const BASE_URL = isLocal
    ? "http://localhost:8080"
    : `${window.location.origin}/api`;

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
    const response = await fetch(`${BASE_URL}/scryfall/sets`);
    if (!response.ok) throw new Error("Error al obtener sets");
    return await response.json();
}

//Obtener detelles de una carta mediante su ID
export async function fetchCardDetails(cardId) {
    const res = await fetch(`${BASE_URL}/scryfall/${cardId}`);
    return await res.json();
}

// Obtener precios desde cardmarket
export async function fetchCardMarketPrices(cardId) {
    const res = await fetch(`${BASE_URL}/cardmarket/${cardId}`);

    if (res.status === 204) {
        return null;
    }

     if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
    }

    res.priceSource = "CardMarket"; // Set the price source to CardMarket
    return await res.json();
}

// Actualizar precios desde Cardtrader_price
export async function updatePricesFromCardtrader(card) {

    const params = new URLSearchParams({
        cardId: card.id,
        scryfallId: card.scryfallId,
        lang: card.lang,
        condition: card.condition,
        isFoil: card.foil ?? false
    });

    const response = await fetch(`${BASE_URL}/cardtrader/lastPrices?${params}`);

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}

// Obtener precios desde la API de cardtrader
export async function fetchCardTraderPrices(card) {
    const params = new URLSearchParams({
        cardId: card.id,
        scryfallId: card.scryfallId,
        lang: card.lang,
        condition: card.condition,
        isFoil: card.foil
    });

    const response = await fetch(`${BASE_URL}/pricecache/getPrices?${params}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}