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

// ===========================
// LOADING VISUAL
// Añade/quita una clase sobre el contenedor de cartas mientras
// hay una petición en marcha, y deshabilita el botón "Buscar" del
// navbar para evitar doble envío mientras carga.
// ===========================
function setLoading(isLoading) {
    if (dom.container) {
        dom.container.classList.toggle("is-loading", isLoading);
    }

    const searchBtn = document.getElementById("searchButton");
    if (searchBtn) {
        searchBtn.disabled = isLoading;
        searchBtn.classList.toggle("is-loading", isLoading);
    }
}

// Carga principal
async function loadCards() {

    const f = getFilters();

    setLoading(true);

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
    } finally {
        setLoading(false);
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

// ===========================
// CARGA INICIAL DESDE URL
// Ahora lee TODOS los filtros de la query string (antes solo leía
// "search" y "set"), y los aplica a los <select> correspondientes
// para que la UI refleje exactamente lo que se buscó desde otra
// página. Se hace dentro de "navbarReady" porque hasta ese punto
// no hay garantía de que el <select> de ediciones ya tenga sus
// opciones cargadas (ver fix de await en navbar.js).
// ===========================
document.addEventListener("navbarReady", () => {

    const params = new URLSearchParams(location.search);

    const search = params.get("search");
    const set = params.get("set");
    const rarity = params.get("rarity");
    const lang = params.get("lang");
    const type = params.get("type");
    const sort = params.get("sort");

    // Si no hay ningún parámetro en la URL, no lanzamos ninguna
    // búsqueda automática — el usuario verá la página limpia y
    // decidirá qué buscar. Antes se cargaba siempre, lo que
    // activaba el spinner y bloqueaba el botón desde el inicio.
    const hasParams = search || set || rarity || lang || type || sort;

    if (!hasParams) return;

    if (search) {
        state.lastSearch = search;
        const input = document.getElementById("searchInput");
        if (input) input.value = search;
    }

    if (set) setSelectValue("filterSet", set);
    if (rarity) setSelectValue("filterRarity", rarity);
    if (lang) setSelectValue("filterLang", lang);
    if (type) setSelectValue("filterType", type);
    if (sort) setSelectValue("filterSort", sort);

    const pending = localStorage.getItem("pendingSearch");
    if (pending) {
        localStorage.removeItem("pendingSearch");
        state.lastSearch = pending;
    }

    state.page = 1;
    loadCards();
});

function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

// ===========================
// EVENTOS
// ===========================

// Disparado por navbar.js al pulsar "Buscar"/Enter ESTANDO ya en
// index.html (sin recargar la página). Lee los filtros directamente
// del DOM, igual que loadCards() ya hace en getFilters().
document.addEventListener("runSearch", (e) => {
    state.lastSearch = e.detail?.name || null;
    state.page = 1;
    loadCards();
});

// Disparado únicamente por el toggle "Ocultar sin precio" (acción
// instantánea de un clic). El resto de filtros ya NO disparan este
// evento — esperan a "runSearch".
document.addEventListener("filtersChanged", () => {
    state.page = 1;
    loadCards();
});