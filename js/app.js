// app.js

import { fetchCards } from "./api.js";
import { renderCards } from "./cardsRenderer.js";
import { setupPagination } from "./pagination.js";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const cardsContainer = document.getElementById("cardsContainer");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageDisplay = document.getElementById("currentPage");

let page = 1;
const size = 20;
let lastSearch = "";

// Función principal de carga
async function loadCards(name) {
    try {
        const data = await fetchCards(name, page, size);
        renderCards(data.cardDTOList, cardsContainer, abrirCarta);
        updatePagination(data.totalCards);
    } catch (error) {
        cardsContainer.innerHTML = "<p>Error al cargar cartas.</p>";
        console.error(error);
    }
}

// Callback para botones de paginación
const updatePagination = setupPagination(prevBtn, nextBtn, pageDisplay, (action) => {
    if (action === "prev" && page > 1) page--;
    if (action === "next") page++;
    loadCards(lastSearch);
});

// Búsqueda
function search() {
    const name = searchInput.value.trim();
    if (!name) return;
    lastSearch = name;
    page = 1;
    loadCards(name);
}

// Eventos
searchButton.addEventListener("click", search);
searchInput.addEventListener("keypress", e => { if (e.key === "Enter") search(); });

function abrirCarta(cardId) {
    // Aquí llamas al backend o renderizas detalles
    window.open(`cardDetail.html?id=${cardId}`, "_blank");
}

// Inicializar con algo si quieres
// loadCards("Forest");