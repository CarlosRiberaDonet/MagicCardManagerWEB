// api.js
const BASE_URL = "http://localhost:8081/cards";

const FILTER_URL = ""; // Filtro de cartas

//BUSCAR CARTAS
export async function fetchCards(name, set, page, size, rarity, lang, typeLine) {
    let url = `${BASE_URL}/search?page=${page}&size=${size}`;
    if (name)     url += `&name=${encodeURIComponent(name)}`;
    if (set)      url += `&setName=${encodeURIComponent(set)}`;
    if (rarity)   url += `&rarity=${encodeURIComponent(rarity)}`;
    if (lang)     url += `&lang=${encodeURIComponent(lang)}`;
    if (typeLine) url += `&typeLine=${encodeURIComponent(typeLine)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener cartas");
    return await response.json();
}

// Obtener ediciones para llenar el filtro de ediciones
export async function fetchSets() {
    const response = await fetch("http://localhost:8081/sets/all");
    if (!response.ok) throw new Error("Error al obtener sets");
    return await response.json();
}