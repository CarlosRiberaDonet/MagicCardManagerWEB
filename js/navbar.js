// navbar.js

import { fetchSets } from "./api.js";
import { setupAuthListeners } from "./auth.js";
import { showToast } from "./utils.js";


// Navbar se inyecta dinámicamente en todas las páginas

fetch("/navbar.html")
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML("afterbegin", html);

        const modal = document.getElementById("loginModal");
        if (modal) document.body.appendChild(modal);

        setupAuthListeners();

        initNavbarUI();

        document.dispatchEvent(new Event("navbarReady"));
    });

 // Inicializa toda la UI del navbar
function initNavbarUI() {
    initScroll();
    initSearch();
    initHideNA();
    loadSets();
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

 // Limpia filtros y notifica a app
function clearFilters() {
    const clear = document.getElementById("clearFilters");
    if (!clear) return;

    clear.addEventListener("click", () => {

        document.getElementById("filterSet").value = "";
        document.getElementById("filterRarity").value = "";
        document.getElementById("filterLang").value = "";
        document.getElementById("filterType").value = "";
        document.getElementById("filterSort").value = "";

        document.dispatchEvent(new Event("filtersChanged"));
    });
}

 // Búsqueda principal
 // Solo emite evento, NO llama API
function initSearch() {
    const input = document.getElementById("searchInput");
    const set = document.getElementById("filterSet");
    const btn = document.getElementById("searchButton");

    if (!input || !set || !btn) return;
    function search() {
        const name = input.value.trim();
        const setValue = set.value;

        if (!name && !setValue) {
            showToast("Debes introducir nombre o edición");
            return;
        }

        document.dispatchEvent(
            new CustomEvent("searchRequested", {
                detail: { name }
            })
        );
    }

    btn.addEventListener("click", search);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            search();
        }
    });

    set.addEventListener("change", () => {
        document.dispatchEvent(new Event("filtersChanged"));
    });
}

 // Botón hide NA
 //SOLO cambia estado visual + notifica cambio
function initHideNA() {
    const btn = document.getElementById("hideNAButton");
    if (!btn) return;

    btn.addEventListener("click", () => {
        btn.classList.toggle("active");

        document.dispatchEvent(new Event("filtersChanged"));
    });
}