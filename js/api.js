// api.js
const BASE_URL = "http://localhost:8081/cards";

const FILTER_URL = ""; // Filtro de cartas

//BUSCAR CARTAS
export async function fetchCards(name, set, page, size, rarity, lang, typeLine, minPrice, maxPrice, orderBy, hideNA) {
    let url = `${BASE_URL}/search?page=${page}&size=${size}`;
    if (name)     url += `&name=${encodeURIComponent(name)}`;
    if (set)      url += `&setCode=${encodeURIComponent(set)}`;
    if (rarity)   url += `&rarity=${encodeURIComponent(rarity)}`;
    if (lang)     url += `&lang=${encodeURIComponent(lang)}`;
    if (typeLine) url += `&typeLine=${encodeURIComponent(typeLine)}`;
    if (minPrice !== null) url += `&minPrice=${minPrice}`;
    if (maxPrice !== null) url += `&maxPrice=${maxPrice}`;
    if (orderBy) url += `&orderBy=${encodeURIComponent(orderBy)}`;
    if (hideNA) url += `&hideNA=true`;

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
export async function updatePricesFromCardtrader() {
    const response = await fetch("http://localhost:8081/cardtrader/card", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) throw new Error("Error al actualizar precios");
    return await response.json();
}