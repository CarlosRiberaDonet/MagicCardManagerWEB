// app.js

// Importamos en una sola línea todas las funciones necesarias de api.js
import { fetchCards, fetchSets } from "./api.js";
import { renderCards } from "./cardsRenderer.js";
import { setupPagination } from "./pagination.js";

// Referencias a elementos del DOM de la página principal
const cardsContainer   = document.getElementById("cardsContainer");
const prevBtn          = document.getElementById("prevPage");
const nextBtn          = document.getElementById("nextPage");
const pageDisplay      = document.getElementById("currentPage");
const totalPagesDisplay = document.getElementById("totalPages");

// Estado de la búsqueda
let page = 1;
const size = 30;
let lastSearch = "";

// Recoge el valor del buscador y lanza la búsqueda desde la página 1
// El nombre es opcional — se puede buscar solo con filtros
function search() {
    const searchInput = document.getElementById("searchInput");
    const name = searchInput.value.trim() || null; // null si está vacío
    lastSearch = name;
    page = 1;
    loadCards(name);
}

// Llama al backend con el nombre y los filtros activos, y renderiza las cartas
async function loadCards(name) {
    const set      = document.getElementById("filterSet")?.value      || null;
    const rarity   = document.getElementById("filterRarity")?.value   || null;
    const lang     = document.getElementById("filterLang")?.value     || null;
    const typeLine = document.getElementById("filterType")?.value     || null;

    // Si no hay ningún criterio de búsqueda, no hacemos nada
    if (!name && !set && !rarity && !lang && !typeLine) return;

    try {
        const data = await fetchCards(name, set, page, size, rarity, lang, typeLine);
        renderCards(data.cardDTOList, cardsContainer, abrirCarta);
        updatePagination(page, data.totalCards, size);
    } catch (error) {
        cardsContainer.innerHTML = "<p>Error al cargar cartas.</p>";
        console.error(error);
    }
}

// Configura los botones de paginación — devuelve la función updatePagination
const updatePagination = setupPagination(prevBtn, nextBtn, pageDisplay, totalPagesDisplay, (action) => {
    if (action === "prev" && page > 1) page--;
    if (action === "next") page++;
    loadCards(lastSearch);
});

// Enlaza los listeners del navbar — se llama cuando el navbar está cargado en el DOM
function initSearch() {
    const searchInput  = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const clearFilters = document.getElementById("clearFilters");

    // Si alguno de los elementos no existe aún, salimos
    if (!searchInput || !searchButton || !clearFilters) return;

    // Cargamos las ediciones en el combobox solo una vez
    loadSets();

    // Buscar al pulsar el botón o al presionar Enter
    searchButton.addEventListener("click", search);
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") search();
    });

    // Limpiar todos los filtros al pulsar el botón de limpiar
    clearFilters.addEventListener("click", () => {
        document.getElementById("filterSet").value    = "";
        document.getElementById("filterRarity").value = "";
        document.getElementById("filterLang").value   = "";
        document.getElementById("filterType").value   = "";
    });
}

// Intentamos enlazar los listeners ahora y también cuando el navbar termine de cargarse
initSearch();
document.addEventListener('navbarLoaded', initSearch);

// Abre la página de detalle de la carta en una nueva pestaña
function abrirCarta(cardId) {
    window.open(`cardDetail.html?id=${cardId}`, "_blank");
}

// Rellena el combobox de ediciones con los datos del backend
async function loadSets() {
    try {
        const sets = await fetchSets();
        const setFilter = document.getElementById("filterSet");

        // Vaciamos el select para evitar duplicados si se llama varias veces
        setFilter.innerHTML = '<option value="">Set</option>';

        // Añadimos una opción por cada edición
        sets.forEach(set => {
            const option = document.createElement("option");
            option.value = set;
            option.textContent = set;
            setFilter.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar sets:", error);
    }
}