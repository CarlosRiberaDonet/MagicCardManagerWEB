// utils.js


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