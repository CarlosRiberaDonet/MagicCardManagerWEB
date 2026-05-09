// api.js
const BASE_URL = "http://localhost:8081";
const AUTH_URL = "/auth/register"; // Registar nuevo usuario
const LOGIN_URL = "/auth/login"; // Iniciar sesión
const FILTER_URL = "/cards"; // Filtro de cartas

// Método para registrar un nuevo usuario
export async function registerUser(name, email, password) {
    const response = await fetch(`${BASE_URL}${AUTH_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) throw new Error("Error al registrar usuario");
    return await response.json();
}

// LOGIN
export async function loginUser(email, password) {
    const response = await fetch(`${BASE_URL}${LOGIN_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error("Error al iniciar sesión");
    return await response.text();
}

//BUSCAR CARTAS
export async function fetchCards(name, page, size, rarity, lang, typeLine) {
    let url = `${BASE_URL}/cards/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`;
    if (rarity)   url += `&rarity=${encodeURIComponent(rarity)}`;
    if (lang)     url += `&lang=${encodeURIComponent(lang)}`;
    if (typeLine) url += `&typeLine=${encodeURIComponent(typeLine)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener cartas");
    return await response.json();
}

// INSERTAR CARTA EN COLECCIÓN
export async function addToCollection(card, token) {
    const response = await fetch(`${BASE_URL}/user/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cardId: card.id, purchasePrice: card.cardPrice ? card.cardPrice.trend : null })
    });
    if (!response.ok) throw new Error("Error al añadir carta a la colección");
    return await response.json();
}

// ELIMINAR CARTA DE COLECCIÓN
export async function removeFromCollection(card, token) {
    const response = await fetch(`${BASE_URL}/user/del`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cardId: card.id })
    });
    if (!response.ok) throw new Error("Error al eliminar carta de la colección");
    return await response.json();
}
