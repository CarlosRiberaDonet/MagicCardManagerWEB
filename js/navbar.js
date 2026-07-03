// navbar.js

import { fetchSets } from "./api.js";
import { setupAuthListeners } from "./auth.js";
import { showToast } from "./utils.js";

// Navbar se inyecta dinámicamente en todas las páginas

fetch("/navbar.html")
    .then(res => res.text())
    .then(async (html) => {
        document.body.insertAdjacentHTML("afterbegin", html);

        const modal = document.getElementById("loginModal");
        if (modal) document.body.appendChild(modal);

        setupAuthListeners();

        // IMPORTANTE: ahora se espera a que termine initNavbarUI()
        // (que a su vez espera a loadSets()) antes de avisar de que
        // el navbar está listo. Antes, "navbarReady" se disparaba
        // mientras loadSets() todavía estaba en marcha (sin await),
        // así que si llegabas con ?set=algo en la URL, el <select>
        // de ediciones podía estar aún vacío y la preselección fallaba.
        await initNavbarUI();

        document.dispatchEvent(new Event("navbarReady"));
    });

// Inicializa toda la UI del navbar
async function initNavbarUI() {
    initScroll();
    initSearch();
    initHideNA();
    await loadSets();
    clearFilters();
}

// Ocultar navbar al hacer scroll
function initScroll() {
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        const nav = document.querySelector(".navbar");
        if (!nav) return;

        const current = window.scrollY;

        nav.style.transform =
            current > lastScroll && current > 60
                ? "translateY(-100%)"
                : "translateY(0)";

        lastScroll = current;
    });
}

// Cargar sets en el selector
async function loadSets() {
    const select = document.getElementById("filterSet");
    if (!select) return;

    try {
        const sets = await fetchSets();

        select.innerHTML = '<option value="">Edición</option>';

        sets.forEach(set => {
            const opt = document.createElement("option");
            opt.value = set.setCode;
            opt.textContent = set.name;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error sets:", err);
    }
}

// Limpia filtros y dispara una búsqueda en blanco
function clearFilters() {
    const clear = document.getElementById("clearFilters");
    if (!clear) return;

    clear.addEventListener("click", () => {

        document.getElementById("searchInput").value = "";
        document.getElementById("filterSet").value = "";
        document.getElementById("filterRarity").value = "";
        document.getElementById("filterLang").value = "";
        document.getElementById("filterType").value = "";
        document.getElementById("filterSort").value = "";

        const hideNA = document.getElementById("hideNAButton");
        hideNA?.classList.remove("active");

        document.dispatchEvent(new Event("filtersChanged"));
    });
}

// ===========================
// BÚSQUEDA + FILTROS
//
// COMPORTAMIENTO NUEVO: ningún select dispara nada por sí solo.
// Todos los filtros (set, rareza, idioma, tipo, orden) se acumulan
// en el DOM sin hacer ninguna llamada. Solo al pulsar "Buscar" o
// Enter en el campo de texto se recogen TODOS los valores actuales
// y se lanza una única búsqueda combinada.
// ===========================
function initSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchButton");

    if (!input || !btn) return;

    const filterIds = ["filterSet", "filterRarity", "filterLang", "filterType", "filterSort"];

    // Lee el valor actual de cada filtro, sin disparar nada
    function collectFilters() {
        const filters = {};
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value) filters[id] = el.value;
        });
        return filters;
    }

    function runSearch() {
        const name = input.value.trim();
        const filters = collectFilters();

        if (!name && Object.keys(filters).length === 0) {
            showToast("Debes introducir un nombre o seleccionar al menos un filtro");
            return;
        }

        const params = new URLSearchParams();
        if (name) params.set("search", name);
        if (filters.filterSet) params.set("set", filters.filterSet);
        if (filters.filterRarity) params.set("rarity", filters.filterRarity);
        if (filters.filterLang) params.set("lang", filters.filterLang);
        if (filters.filterType) params.set("type", filters.filterType);
        if (filters.filterSort) params.set("sort", filters.filterSort);

        const onIndex = location.pathname.endsWith("/index.html") || location.pathname === "/";

        if (onIndex) {
            // Ya estamos en el catálogo: evitamos recargar toda la
            // página. Solo avisamos a app.js, que relee los filtros
            // directamente del DOM (los selects ya tienen los valores
            // correctos) y lanza loadCards() una sola vez.
            document.dispatchEvent(new CustomEvent("runSearch", {
                detail: { name }
            }));
        } else {
            // Desde cualquier otra página (collection, watchlist...),
            // navegamos al catálogo con TODOS los filtros en la URL.
            window.location.href = `/index.html?${params.toString()}`;
        }
    }

    btn.addEventListener("click", runSearch);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            runSearch();
        }
    });

    // NOTA: ya no hay listeners de "change" en los <select>.
    // Antes, SOLO .filterSet disparaba "filtersChanged" al cambiar
    // de valor (búsqueda en vivo), pero rareza/idioma/tipo/orden no
    // tenían ningún listener — de ahí el comportamiento inconsistente.
    // Ahora todos los filtros se comportan igual: no pasa nada hasta
    // pulsar "Buscar" o Enter.
}

// Botón "Ocultar sin precio"
// Se mantiene como acción instantánea (toggle de un clic), distinta
// de los filtros de comparación de arriba. Si prefieres que también
// espere al botón "Buscar", dímelo y lo unificamos.
function initHideNA() {
    const btn = document.getElementById("hideNAButton");
    if (!btn) return;

    btn.addEventListener("click", () => {
        btn.classList.toggle("active");

        document.dispatchEvent(new Event("filtersChanged"));
    });
}