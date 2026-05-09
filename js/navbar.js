// navbar.js
// Carga el navbar en todas las páginas automáticamente

import { setupAuthListeners } from './auth.js';

fetch('/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);

        // para que app.js sepa que puede enlazar sus listeners
        document.dispatchEvent(new Event('navbarLoaded'));

        // Configura los listeners de autenticación después de cargar el navbar
        setupAuthListeners();

    })
    .catch(err => console.error('Error al cargar el navbar:', err));
