const BASE_URL = "http://localhost:8081/user";


// Comprobar si una carta está en la colección del usuario
export async function isInCollection(cardId, token) {
    const response = await fetch(`${BASE_URL}/collection/contains?cardId=${cardId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Error al comprobar si la carta está en la colección");
    return await response.json(); // Devuelve 0 si la carta no está en la colección, <1 si está en la colección
}

// Comprobar si una carta está en la lista de seguimiento del usuario
export async function isInWatchlist(cardId, token) {
    const response = await fetch(`${BASE_URL}/watchlist/contains?cardId=${cardId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Error al comprobar si la carta está en la lista de seguimiento");
    return await response.json(); // devuelve true o false directamente;
}

// Cargar la colección completa del usuario
export async function loadCollection(token) {
    const response = await fetch(`${BASE_URL}/mycollection`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al cargar la colección");
    else{
        return await response.json();
        showToast(card.name + " añadida a la colección.");
    }
}


// INSERTAR CARTA EN COLECCIÓN
export async function addToCollection(card, token) {
    const response = await fetch(`${BASE_URL}/collection/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(
            { cardId: card.id,
                purchasePrice: card.purchasePrice,
                quantity: card.quantity
            })
    });
    if (!response.ok) throw new Error("Error al añadir carta a la colección");
    return await response.text();
}

// ELIMINAR CARTA DE COLECCIÓN
export async function removeFromCollection(card, token) {
    const response = await fetch(`${BASE_URL}/collection/del`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
            cardId: card.id,
            purchasePrice: card.purchasePrice
        })
    });
    if (!response.ok) throw new Error("Error al eliminar carta de la colección");
    return await response.text();
}

// INSERTAR CARTA EN WATCHLIST (lista de seguimiento)
export async function addToWatchlist(card, token) {
    const response = await fetch(`${BASE_URL}/watchlist/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cardId: card.id })
    });
    if (!response.ok) throw new Error("Error al añadir carta a la lista de seguimiento");
    return await response.text();
}

// ELIMINAR CARTA DE WATCHLIST (lista de seguimiento)
export async function removeFromWatchlist(card, token) {
    const response = await fetch(`${BASE_URL}/watchlist/del`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cardId: card.id })
    });
    if (!response.ok) throw new Error("Error al eliminar carta de la lista de seguimiento");
    return await response.text();
}



