// cardDetail.js

import * as userActions from "./userActions.js";

const BASE_URL = "http://localhost:8081/cards";

// 1. Leer el parámetro "id" de la URL
//    Cuando se abre la página como cardDetail.html?id=123,
//    URLSearchParams nos permite extraer ese valor fácilmente.
const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");
let card;

// 2. Si no hay id en la URL, no hacemos nada
if (!cardId) {
    document.getElementById("cardName").textContent = "Nombre de carta no encontrada";
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
        await checkCardInCollection();
        await checkCardInWatchlist();

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

// 6. Comprueba si la carta ya está en la colección del usuario y muestra/oculta botones
async function checkCardInCollection() {
    const quantity = await userActions.isCardInCollection(card.id);
     console.log("Quantity:", quantity);
    document.getElementById("cardQuantity").textContent = quantity > 0 ? `x${quantity}` : "";
    document.getElementById("removeFromCollection").style.display = quantity > 0 ? "block" : "none";
}

// 6b. Comprueba watchlist
async function checkCardInWatchlist() {
    const inWatchlist = await userActions.isCardInWatchlist(card.id);
    document.getElementById("removeFromWatchlist").style.display = inWatchlist ? "block" : "none";
    document.getElementById("addToWatchlist").style.display = inWatchlist ? "none" : "block";
}

// Botón para añadir carta a la colección
document.getElementById("addToCollection").addEventListener("click", (event) => {
    const btn = event.target;
    userActions.addCardToCollection(card).then(() => {
        // Cambiar el texto del botón
        btn.textContent = "Carta añadida";
        // cambiar color del botón
        btn.style.backgroundColor = "#4CAF50";
        // Desactivar el botón para evitar múltiples clics
        btn.disabled = true;
        checkCardInCollection();
        // Volver al estado original después de 0.5 segundos
        setTimeout(() => {
            btn.textContent = "📦 Añadir a colección";
            btn.style.backgroundColor = "";
            btn.disabled = false;
        }, 500);

        

        }).catch(error => {
            console.error("Error al añadir carta a la colección:", error);
            alert("Error al añadir carta a la colección");
        });
    });

// Botón para eliminar carta de la colección
document.getElementById("removeFromCollection").addEventListener("click", (event) => {   
    const btn = event.target;
    userActions.removeCardFromCollection(card).then(() => {
        // Cambiar el texto del botón
        btn.textContent = "Carta eliminada";
        // cambiar color del botón
        btn.style.backgroundColor = "#f44336";
        // Desactivar el botón para evitar múltiples clics
        btn.disabled = true;

        // Volver al estado original después de 0.5 segundos
        setTimeout(() => {
        btn.textContent = "🗑️ Eliminar de colección";
        btn.style.backgroundColor = "";
        btn.disabled = false;
    }, 500);

    checkCardInCollection();

    }).catch(error => {
        console.error("Error al eliminar carta de la colección:", error);
        alert("Error al eliminar carta de la colección");
    });
});

// Botón para añadir carta a la lista de seguimiento (watchlist)
document.getElementById("addToWatchlist").addEventListener("click", (event) => {
    const btn = event.target;
    userActions.addCardToWatchlist(card).then(() => {
        // Cambiar el texto del botón
        btn.textContent = "Carta añadida a la lista de seguimiento";
        // cambiar color del botón
        btn.style.backgroundColor = "#4CAF50";
        // Desactivar el botón para evitar múltiples clics
        btn.disabled = true;

        // Volver al estado original después de 0.5 segundos
        setTimeout(() => {
            btn.textContent = "⭐ Añadir a watchlist";
            btn.style.backgroundColor = "";
            btn.disabled = false;
        }, 500);

        checkCardInWatchlist();

    }).catch(error => {
        console.error("Error al añadir carta a la lista de seguimiento:", error);
        alert("Error al añadir carta a la lista de seguimiento");
    });
});

// Botón para eliminar carta de la lista de seguimiento (watchlist)
document.getElementById("removeFromWatchlist").addEventListener("click", (event) => {
    const btn = event.target;
    userActions.removeCardFromWatchlist(card).then(() => {
        // Cambiar el texto del botón
        btn.textContent = "Carta eliminada de la lista de seguimiento";
        // cambiar color del botón
        btn.style.backgroundColor = "#f44336";
        // Desactivar el botón para evitar múltiples clics
        btn.disabled = true;

         // Volver al estado original después de 0.5 segundos
        setTimeout(() => {
            btn.textContent = "⭐ Eliminar de watchlist";
            btn.style.backgroundColor = "";
            btn.disabled = false;
        }, 500);

        checkCardInWatchlist();

    }).catch(error => {
        console.error("Error al eliminar carta de la lista de seguimiento:", error);
        alert("Error al eliminar carta de la lista de seguimiento");
    });
});

// Al buscar
searchButton.addEventListener("click", () => {
    const name = searchInput.value.trim();
    if (name) {
        localStorage.setItem('pendingSearch', name);
        window.location.href = '/index.html';
    }
});