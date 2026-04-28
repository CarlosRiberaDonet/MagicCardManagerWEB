// navbar.js
// Carga el navbar en todas las páginas automáticamente

fetch('/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);

        // para que app.js sepa que puede enlazar sus listeners
        document.dispatchEvent(new Event('navbarLoaded'));
    })
    .catch(err => console.error('Error al cargar el navbar:', err));
