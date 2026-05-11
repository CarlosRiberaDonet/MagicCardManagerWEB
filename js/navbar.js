// navbar.js
// Carga el navbar en todas las páginas automáticamente

import { setupAuthListeners } from './auth.js';

fetch('/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);
        document.dispatchEvent(new Event('navbarLoaded'));
        setupAuthListeners();

        // Ocultar navbar al hacer scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            const navbar = document.querySelector('.navbar');
            if (currentScroll > lastScroll && currentScroll > 60) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScroll = currentScroll;
        });

        // Búsqueda desde otras páginas → redirige a index con localStorage
        const searchInput  = document.getElementById("searchInput");
        const searchButton = document.getElementById("searchButton");

        if (!window.location.pathname.includes('index')) {
            searchButton.addEventListener("click", () => {
                const name = searchInput.value.trim();
                if (name) {
                    localStorage.setItem('pendingSearch', name);
                    window.location.href = '/index.html';
                }
            });
            searchInput.addEventListener("keypress", e => {
                if (e.key === "Enter") {
                    const name = searchInput.value.trim();
                    if (name) {
                        localStorage.setItem('pendingSearch', name);
                        window.location.href = '/index.html';
                    }
                }
            });
        }
    })
    .catch(err => console.error('Error al cargar el navbar:', err));