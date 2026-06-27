// cardsRenderer.js
import { getFlag } from './utils.js';


// Formatear precio a moneda local
function formatPrice(price) {
    if (price == null) return "N/A";

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

function getCurrentPrice(priceObj) {
    return priceObj?.low ?? priceObj?.trend ?? priceObj?.avg ?? null;
}

// cardClickCallback: función que recibe el id de la carta cuando se hace click
export function renderCards(cards, container) {
    container.innerHTML = "";

    if (!cards || cards.length === 0) {
        container.innerHTML = "<p>No se encontraron cartas.</p>";
        return;
    }

    cards.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "card";

        // Renderizado visual de la carta
        cardEl.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}">
            <h3>${card.name}</h3>
            <img src="${card.iconSvgUri}" alt="${card.setName}" title="${card.setName}" class="set-icon">
            <p>${getFlag(card.lang)}</p>
            <p>${formatPrice(getCurrentPrice(card.cardPrice))}</p>
        `;

        // Listener directo con acceso al id del objeto
        cardEl.addEventListener("click", () => {

            window.open(`cardDetail.html?cardId=${card.id}`, "_blank");
        });

        container.appendChild(cardEl);
    });
}