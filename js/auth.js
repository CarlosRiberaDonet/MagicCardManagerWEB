
import { loginUser, registerUser } from './apiLogin.js';
import { showToast } from './utils.js';

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


    // Botón de registro dentro del modal de login
    const registerForm = document.getElementById("openRegisterModal");
    const registerModal = document.getElementById("registerModal");
    registerForm.addEventListener("click", (event) => {
        event.preventDefault();
        register();
    });


    // Comprobar si ya hay un token al cargar la página
    const token = localStorage.getItem('authToken');
    if (token) {
        // Usuario logueado — mostrar menú de usuario
        const loginButton = document.getElementById('loginButton');
        loginButton.textContent = 'Menú';
    }
}


export function register() {
    const registerModal = document.getElementById("registerModal");
    const registerButton = document.getElementById("registerBtn");
    const closeRegisterButton = document.getElementById("closeRegisterModal");
    loginModal.classList.remove("active");
    registerModal.classList.add("active");

    registerButton.addEventListener("click", async (event) => {
        event.preventDefault();
        console.log(registerButton);
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();

        // Compruebo fotmato de email
        if (!checkEmailField(email)) return;
        // Compruebo que la contraseña tenga al menos 9 caracteres
        if (password.length < 9){
            showToast("La contraseña debe tener mínimo 9 caracteres");
            return;
        }

        try {
            await registerUser(email, password);

            showToast("Usuario registrado correctamente");

            registerModal.classList.remove("active");
            loginModal.classList.add("active");

        } catch (error) {
            if (error.message === "USER_EXISTS") {
                showToast("El usuario ya existe");
                return;
            }

            showToast("Error al registrar usuario");
        }
    });

    closeRegisterButton.addEventListener("click", (event) => {
        event.preventDefault();
        registerModal.classList.remove("active");
    });
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
            showToast('Email o contraseña incorrectos');
        });
}

// Cerrar sesión
export function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/index.html';
    
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
        window.location.href = 'profile.html'; // Redirige a la página de perfil
    });
    goCollection.addEventListener('click', () => {
        window.location.href = 'collection.html'; // Redirige a la página de colección
    });
    goInvestor.addEventListener('click', () => {
        window.location.href = 'investor.html'; // Redirige a la página de inversión
    });
    goWatchlist.addEventListener('click', () => {
        window.location.href = 'watchlist.html'; // Redirige a la página de watchlist
    });
    logOut.addEventListener('click', () => {
        logout();
    });
}

// Abre el modal de login y bloquea el scroll del body
export function openModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cierra el modal de login y restaura el scroll del body
export function closeModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===========================
// TOKEN
// ===========================
export function getToken() {
    return localStorage.getItem('authToken');
}

export function setToken(token) {
    localStorage.setItem('authToken', token);
}

// ===========================
// JWT EXPIRATION CHECK
// ===========================
export function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // segundos → ms
        return Date.now() > exp;
    } catch (e) {
        return true; // token corrupto
    }
}

// ===========================
// AUTH STATE
// ===========================
export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    if (isTokenExpired(token)) {
        removeToken();
        return false;
    }

    return true;
}

// Comprobar formato de email
function checkEmailField(email) {
    if (!email) {
        showToast('El email es obligatorio');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showToast('Formato de email inválido');
        return false;
    }

    return true;
}