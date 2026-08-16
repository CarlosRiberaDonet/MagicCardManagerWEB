const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const BASE_URL = isLocal
    ? "http://localhost:8080"
    : `${window.location.origin}/api`;

// Cargar la colección completa del usuario
export async function loadCollection(token) {
    const response = await fetch(`${BASE_URL}/user/mycollection`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al cargar la colección");
    return await response.json();
}

// Cargar la watchlist del usuario
export async function loadWatchlist(token) {
    const response = await fetch(`${BASE_URL}/user/mywatchlist`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al cargar la watchlist");
    return await response.json();
}

// Comprobar si una carta está en la colección del usuario
export async function isInCollection(card, token) {
    const params = new URLSearchParams({
        cardId: card.id,
        condition: card.condition,
        lang: card.lang,
        foil: card.foil,
    });

    const response = await fetch(`${BASE_URL}/user/collection/contains?${params}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al comprobar si la carta está en la colección");
    return await response.json(); // 0 = no está, >0 = está
}

// Comprobar si una carta está en la watchlist del usuario
export async function isInWatchlist(card, token) {
    const params = new URLSearchParams({
        cardId: card.id,
        isFoil: card.foil,
        lang: card.lang,
        condition: card.condition,
    });

    const response = await fetch(`${BASE_URL}/user/watchlist/contains?${params}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al comprobar si la carta está en la lista de seguimiento");
    return await response.json(); // true / false
}

// Insertar carta en la colección
export async function addToCollection(card, token) {
    const params = new URLSearchParams({
        cardId: card.id,
        condition: card.condition,
        lang: card.lang,
        foil: card.foil,
    });

    const response = await fetch(`${BASE_URL}/user/collection/add?${params}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al añadir carta a la colección");
    return await response.text();
}

// Eliminar carta de la colección (backend espera body JSON)
export async function removeFromCollection(item, token) {
    const response = await fetch(`${BASE_URL}/user/collection/del`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            cardId: item.cardId,
            purchasePrice: item.purchasePrice,
            condition: item.condition,
            lang: item.lang,
            foil: item.foil,
            quantity: item.quantity
        })
    });
    if (!response.ok) throw new Error("Error al eliminar carta de la colección");
    return await response.json();
}

// Insertar carta en la watchlist
export async function addToWatchlist(card, token) {

    console.log("addToWatchlist", card);
    const params = new URLSearchParams({
        cardId: card.id,
        condition: card.condition,
        isFoil: card.foil,
        lang: card.lang,
        lastPrice: card.cardPrice?.avg
    });

    const response = await fetch(`${BASE_URL}/user/watchlist/add?${params}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al añadir carta a la lista de seguimiento");
    return await response.text();
}

// Eliminar carta de la watchlist (backend espera query params, igual que add/contains)
// FIX: antes no se enviaban los params en la URL y había un console.log con una
// variable "body" que no existía (ReferenceError, rompía la función siempre).
export async function removeFromWatchlist( cardId, condition, lang, foil, token) {
    const params = new URLSearchParams({
        cardId: cardId,
        condition: condition,
        lang: lang,
        isFoil: foil
    });


    const response = await fetch(`${BASE_URL}/user/watchlist/del?${params}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al eliminar carta de la lista de seguimiento");
    return await response.text();
}