// app.js

import { fetchCards } from "./api.js";
import { renderCards } from "./cardsRenderer.js";
import { setupPagination } from "./pagination.js";

const dom = {
    container: document.getElementById("cardsContainer"),
    prev: document.getElementById("prevPage"),
    next: document.getElementById("nextPage"),
    page: document.getElementById("currentPage"),
    total: document.getElementById("totalPages")
};

const state = {
    page: 1,
    size: 30,
    lastSearch: null
};

/**
 * Obtiene filtros del navbar
 */
function getFilters() {
    const slider = document.getElementById("priceSlider");
    const values = slider?.noUiSlider?.get();

    return {
        set: document.getElementById("filterSet")?.value || null,
        rarity: document.getElementById("filterRarity")?.value || null,
        lang: document.getElementById("filterLang")?.value || null,
        typeLine: document.getElementById("filterType")?.value || null,
        minPrice: values ? values[0] : null,
        maxPrice: values ? values[1] : null,
        orderBy: document.getElementById("filterSort")?.value || null,
        hideNA: document.getElementById("hideNAButton")?.classList.contains("active") || false
    };
}

/**
 * Carga cartas
 */
async function loadCards(name) {
    const f = getFilters();

    if (!name && !f.set && !f.rarity && !f.lang && !f.typeLine && !f.minPrice && !f.maxPrice) {
        return;
    }

    try {
        const res = await fetchCards(
            name,
            f.set,
            f.rarity,
            f.lang,
            f.typeLine,
            f.minPrice,
            f.maxPrice,
            f.orderBy,
            f.hideNA,
            state.page,
            state.size
        );

        renderCards(res.cardDTOList, dom.container);
        updatePagination(state.page, res.totalCards, state.size);

    } catch (err) {
        console.error(err);
        dom.container.innerHTML = "<p>Error</p>";
    }
}

/**
 * Paginación
 */
const updatePagination = setupPagination(
    dom.prev,
    dom.next,
    dom.page,
    dom.total,
    action => {
        if (action === "prev" && state.page > 1) state.page--;
        if (action === "next") state.page++;

        loadCards(state.lastSearch);
    }
);

/**
 * Búsqueda desde navbar
 */
document.addEventListener("searchRequested", e => {
    state.lastSearch = e.detail.name || null;
    state.page = 1;

    loadCards(state.lastSearch);
});

/**
 * Búsqueda pendiente desde otras páginas
 */
document.addEventListener("navbarReady", () => {
    const pending = localStorage.getItem("pendingSearch");

    if (!pending) return;

    localStorage.removeItem("pendingSearch");

    state.lastSearch = pending;
    state.page = 1;

    loadCards(pending);
});