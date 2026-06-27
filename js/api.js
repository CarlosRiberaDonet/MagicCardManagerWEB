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

// Actualizar precios desde cardtrader
export async function updatePricesFromCardtrader(cardId, lang, condition, isFoil) {
    //const token = getToken();
    //if (!token) throw new Error("Usuario no autenticado");
        const url = `http://localhost:8081/pricecache/${cardId}?lang=${lang}&condition=${condition}&isFoil=${isFoil}`;
        console.log("URL:", url);

    const response = await fetch(`http://localhost:8081/pricecache/${cardId}?lang=${lang}`, {
        
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) throw new Error("Error al actualizar precios");
    return await response.json();
}