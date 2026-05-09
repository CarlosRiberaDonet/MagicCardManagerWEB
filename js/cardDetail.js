// cardDetail.js

import { addCardToCollection , removeCardFromCollection} from "./userActions.js";

const BASE_URL = "http://localhost:8081/cards";

// 1. Leer el parámetro "id" de la URL
//    Cuando se abre la página como cardDetail.html?id=123,
//    URLSearchParams nos permite extraer ese valor fácilmente.
const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");
let card;

// 2. Si no hay id en la URL, no hacemos nada
if (!cardId) {
    document.getElementById("cardName").textContent = "Nombre de cºarta no encontrada";
} else {
    loadCardDetail(cardId);
}

// 3. Función principal: llama al backend y rellena el HTML
async function loadCardDetail(id) {
    try {
        const response = await fetch(`${BASE_URL}/id?cardId=${id}`);

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        card = await response.json();
        fillCardDetail(card);

    } catch (error) {
        console.error("Error al cargar la carta:", error);
        document.getElementById("cardName").textContent = "Error al cargar la carta";
    }
}

// 4. Rellena el HTML con los datos de la carta
function fillCardDetail(card) {
    document.getElementById("cardName").textContent = card.name;
    document.getElementById("cardImage").src = card.imageUrl;
    document.getElementById("cardImage").alt = card.name;
    document.getElementById("cardSet").textContent = card.setName;
    document.getElementById("cardLang").textContent = card.lang;
    document.getElementById("cardCollector").textContent = card.collectorNumber;
    document.getElementById("cardRarity").textContent = card.rarity;
    document.getElementById("typeLine").textContent = card.typeLine;
    document.getElementById("released_at").textContent = card.releasedAt
    ? new Date(card.releasedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : "N/A";

    // Precio bajo (campo "low" dentro del objeto cardPrice)
    document.getElementById("cardLow").textContent =
        card.cardPrice && card.cardPrice.low
            ? formatPrice(card.cardPrice.low)
            : "N/A";

    // Precio de tendencia (campo "trend" dentro del objeto cardPrice)
    document.getElementById("cardTrend").textContent =
        card.cardPrice && card.cardPrice.trend
            ? formatPrice(card.cardPrice.trend)
            : "N/A";

    document.getElementById("avg30").textContent =
        card.cardPrice && card.cardPrice.avg30
            ? formatPrice(card.cardPrice.avg30)
            : "N/A";
    
    document.getElementById("avg7").textContent =
        card.cardPrice && card.cardPrice.avg7
            ? formatPrice(card.cardPrice.avg7)
            : "N/A";

    document.getElementById("avg1").textContent =
        card.cardPrice && card.cardPrice.avg1
            ? formatPrice(card.cardPrice.avg1)
            : "N/A";

    // Enlace a Cardmarket
    const link = document.getElementById("cardMarketURL");
    if (card.cardmarketURL) {
        link.href = card.cardmarketURL;
    } else {
        link.textContent = "No disponible";
        link.removeAttribute("href");
    }
}

// 5. Formatea un número como precio en euros
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Botón para añadir carta a la colección
document.getElementById("addToCollection").addEventListener("click", () => {
    addCardToCollection(card);
});

// Botón para eliminar carta de la colección
document.getElementById("removeFromCollection").addEventListener("click", () => {   
    removeCardFromCollection(card);
});

