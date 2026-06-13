// navbar.js

import { fetchSets } from "./api.js";
import { setupAuthListeners } from "./auth.js";

/**
 * Detecta si estamos en página de búsqueda (index)
 */
const isIndex = window.location.pathname.includes("index");

/**
 * Carga del navbar en todas las páginas
 */
fetch("/navbar.html")
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML("afterbegin", html);

        // Mover modal si existe
        const modal = document.getElementById("loginModal");
        if (modal) document.body.appendChild(modal);

        setupAuthListeners();

        initNavbarUI();

        document.dispatchEvent(new Event("navbarReady"));
    });

/**
 * Inicialización del navbar (solo UI)
 */
function initNavbarUI() {
    initScroll();
    initSearch();
    initHideNA();
    loadSets();
}

/**
 * Ocultar navbar al hacer scroll hacia abajo
 */
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

/**
 * Carga de sets en el select del navbar
 */
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

/**
 * Ejecuta búsqueda (delegada a app.js o redirect)
 */
function triggerSearch() {
    const input = document.getElementById("searchInput");
    const name = input?.value?.trim() || null;

    // Si no estamos en index → guardamos y redirigimos
    if (!isIndex) {
        if (name) localStorage.setItem("pendingSearch", name);
        window.location.href = "/index.html";
        return;
    }

    // Si estamos en index → notificamos a app.js
    document.dispatchEvent(
        new CustomEvent("searchRequested", {
            detail: { name }
        })
    );
}

/**
 * Inicializa buscador del navbar
 */
function initSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchButton");
    const clear = document.getElementById("clearFilters");

    if (!input || !btn || !clear) return;

    btn.addEventListener("click", triggerSearch);

    input.addEventListener("keypress", e => {
        if (e.key === "Enter") triggerSearch();
    });

    clear.addEventListener("click", () => {

    const set = document.getElementById("filterSet");
    if (set) set.value = "";

    const rarity = document.getElementById("filterRarity");
    if (rarity) rarity.value = "";

    const lang = document.getElementById("filterLang");
    if (lang) lang.value = "";

    const type = document.getElementById("filterType");
    if (type) type.value = "";

    const sort = document.getElementById("filterSort");
    if (sort) sort.value = "";

});
}

/**
 * Botón hide NA
 */
function initHideNA() {
    const btn = document.getElementById("hideNAButton");
    if (!btn) return;

    btn.addEventListener("click", () => {
        btn.classList.toggle("active");

        document.dispatchEvent(
            new CustomEvent("searchRequested", {
                detail: {
                    name: document.getElementById("searchInput")?.value?.trim() || null
                }
            })
        );
    });
}