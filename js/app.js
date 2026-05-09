// app.js

import { fetchCards } from "./api.js";
import { renderCards } from "./cardsRenderer.js";
import { setupPagination } from "./pagination.js";

const cardsContainer = document.getElementById("cardsContainer");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageDisplay = document.getElementById("currentPage");
const totalPagesDisplay = document.getElementById("totalPages");

let page = 1;
const size = 30;
let lastSearch = "";

// Búsqueda
function search() {
    const searchInput = document.getElementById("searchInput");
    const name = searchInput.value.trim();
    if (!name) return;
    lastSearch = name;
    page = 1;
    loadCards(name);
}

// Función principal de carga
async function loadCards(name) {
    const rarity   = document.getElementById("filterRarity")?.value || null;
    const lang     = document.getElementById("filterLang")?.value || null;
    const typeLine = document.getElementById("filterType")?.value || null;

    try {
        const data = await fetchCards(name, page, size, rarity, lang, typeLine);
        renderCards(data.cardDTOList, cardsContainer, abrirCarta);
        updatePagination(page, data.totalCards, size);
    } catch (error) {
        cardsContainer.innerHTML = "<p>Error al cargar cartas.</p>";
        console.error(error);
    }
}

// Paginación
const updatePagination = setupPagination(prevBtn, nextBtn, pageDisplay, totalPagesDisplay, (action) => {
    if (action === "prev" && page > 1) page--;
    if (action === "next") page++;
    loadCards(lastSearch);
});


function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    if (!searchInput || !searchButton) return;
    searchButton.addEventListener("click", search);
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") search();
    });
    clearFilters.addEventListener("click", () => {
        document.getElementById("filterRarity").value = "";
        document.getElementById("filterLang").value = "";
        document.getElementById("filterType").value = "";
    });
}

// Cubrir ambos casos de timing
initSearch();
document.addEventListener('navbarLoaded', initSearch);

function abrirCarta(cardId) {
    window.open(`cardDetail.html?id=${cardId}`, "_blank");
}