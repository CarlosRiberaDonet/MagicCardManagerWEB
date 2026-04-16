// cardsRenderer.js

// cardClickCallback: función que recibe el id de la carta cuando se hace click
export function renderCards(cards, container, cardClickCallback) {
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
            <p>${card.setName}</p>
            <p>${card.lang}</p>
            <p>${card.collectorNumber}</p>
            <p>${card.low ?? "N/A"}€</p>
            <p>${card.avg ?? "N/A"}€</p>
        `;

        // Listener directo con acceso al id del objeto
        cardEl.addEventListener("click", () => {
            cardClickCallback(card.id);
        });

        container.appendChild(cardEl);
    });
}