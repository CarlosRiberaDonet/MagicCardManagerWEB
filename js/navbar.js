// navbar.js
// Carga el navbar en todas las páginas automáticamente

import { setupAuthListeners } from './auth.js';

fetch('/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);
        document.dispatchEvent(new Event('navbarLoaded'));
        setupAuthListeners();

        initScrollBehavior();
        initSearchRedirect();
        initMenuButtons();
    })
    .catch(err => console.error('Error al cargar el navbar:', err));


// Oculta el navbar al hacer scroll hacia abajo y lo muestra al subir
function initScrollBehavior() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        const navbar = document.querySelector('.navbar');
        navbar.style.transform = currentScroll > lastScroll && currentScroll > 60
            ? 'translateY(-100%)'
            : 'translateY(0)';
        lastScroll = currentScroll;
    });
}

// En páginas distintas a index, redirige la búsqueda guardando el término en localStorage
function initSearchRedirect() {
    if (window.location.pathname.includes('index')) return;

    const searchInput  = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    const redirect = () => {
        const name = searchInput.value.trim();
        if (name) {
            localStorage.setItem('pendingSearch', name);
            window.location.href = '/index.html';
        }
    };

    searchButton.addEventListener("click", redirect);
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") redirect();
    });
}

// Listeners de los botones del menú
function initMenuButtons() {
    // Navega a la página de colección del usuario
    document.getElementById("collectionBtn")?.addEventListener("click", () => {
        window.location.href = '/collection.html';
    });
}