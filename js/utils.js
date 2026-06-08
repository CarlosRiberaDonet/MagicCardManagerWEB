// utils.js
import { fetchCards, fetchSets } from "./api.js";

export function getFlag(lang) {
    const langToCountry = {
        'en': 'gb',
        'es': 'es',
        'fr': 'fr',
        'de': 'de',
        'it': 'it',
        'pt': 'pt',
        'ja': 'jp',
        'ko': 'kr',
        'ru': 'ru',
        'zhs': 'cn',
        'zht': 'tw'
    };
    const code = langToCountry[lang] || lang;
   return `<img src="https://flagcdn.com/20x15/${code}.png" alt="${lang}" class="flag-icon">`;
}

// Cierra modal
export function closePriceModal(modal) {
    const loginModal = document.getElementById('modal');
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===========================
// TOKEN
// ===========================
export function getToken() {
    const token = localStorage.getItem('authToken');
    if (!token) window.location.href = '/index.html'; // sin token, al inicio
    return token;
}

// Rellena el combobox de ediciones con los datos del backend
export async function loadSets() {
    try {
        const sets = await fetchSets();
        const setFilter = document.getElementById("filterSet");
        console.log("Sets recibidos:", sets.length, sets[0]);
        // Vaciamos el select para evitar duplicados si se llama varias veces
        setFilter.innerHTML = '<option value="">Edición</option>';

        // Añadimos una opción por cada edición
        sets.forEach(set => {
            const option = document.createElement("option");
            option.value = set.setCode; // Usamos el código interno como valor
            option.textContent = set.name; // Mostramos el nombre de la edición
            setFilter.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar sets:", error);
    } 
}