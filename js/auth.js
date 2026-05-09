
import { loginUser } from './api.js';

export function setupAuthListeners() {

    // Listener para abrir modal del login
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Usuario logueado — mostrar menú de usuario o cerrar sesión
            const userMenu = document.getElementById('userMenu');
            userMenu.classList.toggle('active');
            usersMenuListeners();
            
        }else {
            // Usuario no logueado — mostrar modal de login
            const loginModal = document.getElementById('loginModal');
            loginModal.classList.add('active');
        }
    });

            
    // Listener para cerrar el modal del login
    document.addEventListener('click', (event) => {
        const loginModal = document.getElementById('loginModal');
        if (event.target === loginModal || event.target.classList.contains('close-btn')) {
            loginModal.classList.remove('active');
        }
    });

    // Botón de login dentro del modal
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        login();
    });

    // Comprobar si ya hay un token al cargar la página
    const token = localStorage.getItem('authToken');
    if (token) {
        // Usuario logueado — mostrar menú de usuario
        const loginButton = document.getElementById('loginButton');
        loginButton.textContent = 'Menú';
    }
}

    // Iniciar sesión
    export function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        loginUser(email, password)
            .then(token => {
                localStorage.setItem('authToken', token);
                const loginModal = document.getElementById('loginModal');
                loginModal.classList.remove('active');

                // Cambiar el botón
                const loginButton = document.getElementById('loginButton');
                loginButton.textContent = "Menú";
            })
            .catch(error => {
                console.error('Error al iniciar sesión:', error);
                alert('Error al iniciar sesión');
            });
    }

    // Cerrar sesión
    export function logout() {
        localStorage.removeItem('authToken');
        const loginButton = document.getElementById('loginButton');
        loginButton.textContent = 'Iniciar sesión';
        document.getElementById('userMenu').classList.remove('active');
    }

    // Menú de usuario logueado
    export function usersMenuListeners() {

        const goProfile = document.getElementById('goProfile');
        const goCollection = document.getElementById('goCollection');
        const goInvestor = document.getElementById('goInvestor');
        const goWatchlist = document.getElementById('goWatchlist');
        const logOut = document.getElementById('logOut');

        goProfile.addEventListener('click', () => {
            alert('Ir a Mi Perfil (pendiente de implementación)');
        });
        goCollection.addEventListener('click', () => {
            alert('Ir a Mi Colección (pendiente de implementación)');
        });
        goInvestor.addEventListener('click', () => {
            alert('Ir a Mi Inversión (pendiente de implementación)');
        });
        goWatchlist.addEventListener('click', () => {
            alert('Ir a Mi Watchlist (pendiente de implementación)');
        });
        logOut.addEventListener('click', () => {
            logout();
            userMenu.classList.remove('active');
        });
    }