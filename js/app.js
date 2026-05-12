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

    // Obtener valores del slider de precio
    const priceSlider = document.getElementById("priceSlider");
    const priceValues = priceSlider?.noUiSlider?.get();
    const minPrice = priceValues ? priceValues[0] : null;
    const maxPrice = priceValues ? priceValues[1] : null;
    // Ordenar precios ASC/DESC
    const orderBy = document.getElementById("filterSort")?.value || null;

    // 
    const hideNA = hideNAButton?.classList.contains("active") || false; 
    

    // Si no hay ningún criterio de búsqueda, no hacemos nada
    if (!name && !set && !rarity && !lang && !typeLine && !minPrice && !maxPrice) return;

    try {
        const data = await fetchCards(name, set, page, size, rarity, lang, typeLine, minPrice, maxPrice, orderBy, hideNA);
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
    initPriceSlider();
    initHideNAButton(true);
    
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
        document.getElementById("priceSlider").noUiSlider.set(["", ""]);
        document.getElementById("minPrice").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("filterSort").value = "";
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
        setFilter.innerHTML = '<option value="">Edición</option>';

        // Añadimos una opción por cada edición
        sets.forEach(set => {
            const option = document.createElement("option");
            option.value = set.code; // Usamos el código interno como valor
            option.textContent = set.name; // Mostramos el nombre de la edición
            setFilter.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar sets:", error);
    } 
}

// Cargar slider de precio
function initPriceSlider() {
    const priceSlider = document.getElementById("priceSlider");
    noUiSlider.create(priceSlider, {
        start: [0, 57750],
        connect: true,
        range: { min: 0, max: 57750 },
        step: 1,
        format: {
            to: value => Math.round(value),
            from: value => Number(value)
        }
    });

    // Slider → inputs
    priceSlider.noUiSlider.on("update", (values) => {
        document.getElementById("minPrice").value = values[0];
        document.getElementById("maxPrice").value = values[1];
    });

    // Inputs → slider
    document.getElementById("minPrice").addEventListener("change", (e) => {
        priceSlider.noUiSlider.set([e.target.value, null]);
    });

    document.getElementById("maxPrice").addEventListener("change", (e) => {
        priceSlider.noUiSlider.set([null, e.target.value]);
    });

    // Si hay una búsqueda pendiente desde otra página, ejecutarla
    const pendingSearch = localStorage.getItem('pendingSearch');
    if (pendingSearch) {
        localStorage.removeItem('pendingSearch');
        lastSearch = pendingSearch;
        loadCards(pendingSearch);
    }
}

// initHideNAButton simplemente relanza la búsqueda
function initHideNAButton(init = false) {
    if (init) {
        hideNAButton?.addEventListener("click", () => {
            hideNAButton.classList.toggle("active");
            page = 1;
            loadCards(lastSearch); // 👈 relanza con hideNA actualizado
        });
        return;
    }
}