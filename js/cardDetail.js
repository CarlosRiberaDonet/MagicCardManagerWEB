// cardDetail.js

import { updatePricesFromCardtrader } from "./api.js";
import { addCardToCollection } from "./userActions.js";
import { getToken } from "./auth.js";
import { showToast } from "./utils.js";
import * as userActions from "./userActions.js";

const BASE_URL = "http://localhost:8081/scryfall";

const params = new URLSearchParams(location.search);
const cardId = params.get("cardId");

init();

async function init() {
    if (!cardId) return;
    
    const token = getToken();

    const res = await fetch(`${BASE_URL}/${cardId}`, {
        headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
    });

    const card = await res.json();
    console.log(card);

    // UI según login
    if (!token) {
        document.getElementById("addToCollection").style.display = "none";
        document.getElementById("addToWatchlist").style.display = "none";
        document.getElementById("removeFromWatchlist").style.display = "none";
    }

    render(card);
    buttonListeners(card);
    await updateCardCounts(cardId);
    await updateWatchlistButtons(cardId);
}

function render(card) {
    document.getElementById("cardName").textContent = card.name;
    document.getElementById("cardImage").src = card.imageUrl
    document.getElementById("cardSet").textContent = card.setName;
    document.getElementById("cardLang").textContent = card.lang;
    document.getElementById("collectorNumber").textContent = card.collectorNumber;
    document.getElementById("cardRarity").textContent = card.rarity;
    document.getElementById("typeLine").textContent = card.typeLine;
    document.getElementById("released_at").textContent = card.releasedAt;
    document.getElementById("cardMarketURL").href = card.cardmarketURL;
    document.getElementById("cardCondition").value = card.condition ?? "NM";

    document.getElementById("cardLow").textContent = formatPrice(card?.cardPrice?.low);
    document.getElementById("cardTrend").textContent = formatPrice(card?.cardPrice?.trend);
    document.getElementById("avg30").textContent = formatPrice(card?.cardPrice?.avg30);
    document.getElementById("avg7").textContent = formatPrice(card?.cardPrice?.avg7);
    document.getElementById("avg1").textContent = formatPrice(card?.cardPrice?.avg1);
}

function buttonListeners(card) {

    // Estado de la carta 
    let condition = "NM";
    // Checkbox Foil
    let isFoil = false;

    // Listener para añadir carta de la colección, abre modal para introducir precio y cantidad
    document.getElementById("addToCollection").addEventListener("click", () => 
        openPriceModal(card)
    );

    // Eliminar carta de la colección
    document.getElementById("removeFromCollection").addEventListener("click", async () => {
        await userActions.removeCardFromCollection(card);
        await updateCardCounts(cardId);
        showToast(card.name + " eliminada de la colección.");
    });

    // Añadir carta a la watchlist
    document.getElementById("addToWatchlist").addEventListener("click", async () => {
        await userActions.addCardToWatchlist(card);
        document.getElementById("addToWatchlist").style.display = "none";
        document.getElementById("removeFromWatchlist").style.display = "inline-block";
        showToast(card.name + " añadida a la watchlist.");
    });

    // Eliminar carta de la watchlist
    document.getElementById("removeFromWatchlist").addEventListener("click", async () => {
        await userActions.removeCardFromWatchlist(card);
        document.getElementById("addToWatchlist").style.display = "inline-block";
        document.getElementById("removeFromWatchlist").style.display = "none";
        showToast(card.name + " eliminada de la watchlist.");
    });

    // Checkbox foil
    document.getElementById("cardFoil").addEventListener("change", (e) => {
        isFoil = e.target.checked;
    });

    // Selector estado de la carta
    document.getElementById("cardCondition").addEventListener("change", async (e) =>  {
        // Asignar la condición seleccionada
        condition = e.target.value;
        // Mostrar precios de la condición seleccionada
        console.log(condition);
    });


    // Si la carta no tiene precios, mostrar botón para actualizar precios desde Cardtrader
    if(card?.cardPrice?.low == null && card?.cardPrice?.trend == null){


        // Actualizar precios desde Cardtrader
        document.getElementById("updatePrices").addEventListener("click", async () => {
            await updatePricesFromCardtrader(cardId, card.lang, condition, isFoil);
            location.reload();
        });
    } else{
        // Ocultar botón de actualizar precios si ya tiene precios
        document.getElementById("updatePrices").style.display = "none";
    }
   
}

    // Abrir modal para añadir carta a la colección con precio
    function openPriceModal(card) {

    const modal = document.getElementById("priceModal");
    const priceInput = document.getElementById("priceInput");
    const quantityInput = document.getElementById("quantityInput");
    const confirmBtn = document.getElementById("confirmBtn");
    const closeBtn = document.getElementById("closePriceModal");

    if (!modal || !priceInput || !quantityInput || !confirmBtn) return;


    priceInput.value = card?.cardPrice?.low ?? card?.cardPrice?.trend ?? 0;
    quantityInput.value = 1;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // IMPORTANTE: evitar duplicar listeners
    confirmBtn.onclick =  async () => {
        card.purchasePrice = parseFloat(priceInput.value);
        card.quantity = parseInt(quantityInput.value);
        await addCardToCollection(card);
        document.getElementById("priceModal").classList.remove("active");
        document.body.style.overflow = "";
        showToast(card.name + " añadida a la colección.");
        await updateCardCounts(cardId);
    };

    // Botón de cerrar modal
    closeBtn.onclick = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    };
}

// Contador de cartas en la colección
async function updateCardCounts(cardId) {
    const cardQuantityEl = document.getElementById("cardQuantity");
    const quantity = await userActions.isCardInCollection(cardId);
    cardQuantityEl.textContent = quantity + "x";

    if(quantity < 1){
        // Ocultar botón de eliminar carta de la colección si no hay ninguna
        document.getElementById("removeFromCollection").style.display = "none";
    }
    else{
        // Mostrar botón de eliminar carta de la colección si hay alguna
        document.getElementById("removeFromCollection").style.display = "inline-block";
    }
}

// Comprobar si la carta está en la watchlist y actualizar botones
async function updateWatchlistButtons(cardId) {
    const addBtn = document.getElementById("addToWatchlist");
    const removeBtn = document.getElementById("removeFromWatchlist");
    const isInWatchlist = await userActions.isCardInWatchlist(cardId);

    if (!isInWatchlist) {
        addBtn.style.display = "inline-block";
        removeBtn.style.display = "none";
    } else {
        addBtn.style.display = "none";
        removeBtn.style.display = "inline-block";
    }
}

// Formalizar precios de carta
function formatPrice(price) {
    if (price == null) return "N/A";
    return `${price.toFixed(2)}€`;
}