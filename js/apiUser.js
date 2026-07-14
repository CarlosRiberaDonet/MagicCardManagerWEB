const BASE_URL = "http://localhost:8081/user";

// Cargar la colección completa del usuario
export async function loadCollection(token) {
    const response = await fetch(`${BASE_URL}/mycollection`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al cargar la colección");
    else{
        return await response.json();
    }
}

// CARGAR WATCHLIST DEL USUARIO
export async function loadWatchlist(token){
    const response = await fetch(`${BASE_URL}/mywatchlist`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al cargar la watchlist");
    else{
        return await response.json();
    }
}

// Comprobar si una carta está en la colección del usuario
export async function isInCollection(card, token) {
   const params = new URLSearchParams({
        cardId: card.id,
        condition: card.condition,
        lang: card.lang,
        foil: card.foil
    });

    const response = await fetch(
        `${BASE_URL}/collection/contains?${params}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );
    if (!response.ok) throw new Error("Error al comprobar si la carta está en la colección");
    return await response.json(); // Devuelve 0 si la carta no está en la colección, >0 si está en la colección
}

// Comprobar si una carta está en la lista de seguimiento del usuario
export async function isInWatchlist(card, token) {
    const response = await fetch(`${BASE_URL}/watchlist/contains?cardId=${card.id}&condition=${card.condition}&lastPrice=${card.cardPrice?.low ?? 0}&isFoil=${card.foil}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });
    if (!response.ok) throw new Error("Error al comprobar si la carta está en la lista de seguimiento");
    return await response.json(); // devuelve true o false directamente;
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
                quantity: card.quantity,
                condition: card.condition,
                lang: card.lang,
                foil: card.foil
            })
    });
    if (!response.ok) throw new Error("Error al añadir carta a la colección");
    return await response.text();
}

// ELIMINAR CARTA DE COLECCIÓN
export async function removeFromCollection(item, token) {
            console.log("quitando card", item);

    const response = await fetch(`${BASE_URL}/collection/del`, {
        
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(
            { cardId: item.cardId,
                purchasePrice: item.purchasePrice,
                condition: item.condition,
                lang: item.lang,
                foil: item.foil
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
        body: JSON.stringify(
            {
                cardId: card.id,
                lastPrice: card.cardPrice?.low ?? null,
                condition: card.condition,
                isFoil: card.foil
            })
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
        body: JSON.stringify(
            { 
                cardId: card.id,
                lastPrice: card.cardPrice.low,
                condition: card.condition,
                isFoil: card.foil })
    });
    if (!response.ok) throw new Error("Error al eliminar carta de la lista de seguimiento");
    return await response.text();
}
