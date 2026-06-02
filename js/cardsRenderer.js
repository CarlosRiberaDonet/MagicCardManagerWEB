// cardsRenderer.js
import { getFlag } from './utils.js';


    // Formatear precio a moneda local
    function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
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
            <p>${card.rarity}</p>
            <p>${card.collectorNumber}</p>
            <p>${getFlag(card.lang)}</p>
            <p>${card.price ? formatPrice(card.price) : "N/A"}</p>
        `;

        // Listener directo con acceso al id del objeto
        cardEl.addEventListener("click", () => {
            window.open(`cardDetail.html?id=${card.id}`, "_blank");
        });

        container.appendChild(cardEl);
    });
}