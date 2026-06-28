// app.js

import { fetchCards } from "./api.js";
import { renderCards } from "./cardsRenderer.js";
import { setupPagination } from "./pagination.js";

 // Cache DOM
const dom = {
    container: document.getElementById("cardsContainer"),
    prev: document.getElementById("prevPage"),
    next: document.getElementById("nextPage"),
    page: document.getElementById("currentPage"),
    total: document.getElementById("totalPages")
};

 // Estado global
const state = {
    page: 1,
    size: 30,
    lastSearch: null
};

 // Carga principal
 // Aquí se aplica el filtro hideNA (FRONTEND)
async function loadCards() {

    const f = getFilters();

    try {
        const res = await fetchCards(
            state.lastSearch,
            f.set,
            f.rarity,
            f.lang,
            f.typeLine,
            f.orderBy,
            state.page,
            state.size
        );

        let cards = res.cardDTOList;

        // ocultar cartas sin precio
        if (f.hideNA) {
            cards = cards.filter(c => c.cardPrice?.trend != null);
        }

        renderCards(cards, dom.container);
        updatePagination(state.page, res.totalCards, state.size);

    } catch (err) {
        console.error("Error loading cards:", err);
        dom.container.innerHTML = "<p>Error al cargar cartas</p>";
    }
}


 // Lee filtros del DOM
function getFilters() {
    return {
        set: document.getElementById("filterSet")?.value || null,
        rarity: document.getElementById("filterRarity")?.value || null,
        lang: document.getElementById("filterLang")?.value || null,
        typeLine: document.getElementById("filterType")?.value || null,
        orderBy: document.getElementById("filterSort")?.value || null,
        hideNA: document.getElementById("hideNAButton")?.classList.contains("active") || false
    };
}

// PAGINACIÓN
const updatePagination = setupPagination(
    dom.prev,
    dom.next,
    dom.page,
    dom.total,
    action => {

        if (action === "prev" && state.page > 1) state.page--;
        if (action === "next") state.page++;

        loadCards();
    }
);

 // Búsqueda desde navbar
document.addEventListener("searchRequested", e => {
    state.lastSearch = e.detail.name || null;
    state.page = 1;

    loadCards();
});

 // Cambio de filtros (incluye hideNA)
document.addEventListener("filtersChanged", () => {
    state.page = 1;

    loadCards();
});

 // Carga inicial desde otras páginas
document.addEventListener("navbarReady", () => {
    const pending = localStorage.getItem("pendingSearch");

    if (!pending) return;

    localStorage.removeItem("pendingSearch");

    state.lastSearch = pending;
    state.page = 1;

    loadCards();
});