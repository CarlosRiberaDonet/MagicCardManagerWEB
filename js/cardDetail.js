// cardDetail.js

import { updatePricesFromCardtrader } from "./api.js";
import { addCardToCollection } from "./userActions.js";
import { getToken } from "./auth.js";
import { showToast } from "./utils.js";
import * as userActions from "./userActions.js";

const BASE_URL = "http://localhost:8081";

const id = new URLSearchParams(location.search).get("scryfallId");

init();

async function init() {
    if (!id) return;

    const token = userActions.getToken();

    const res = await fetch(`${BASE_URL}/scryfall/scryfallId/${id}`, {
        headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
    });

    const card = await res.json();

    // ===========================
    // UI según login
    // ===========================
    if (!token) {
        document.getElementById("addToCollection").style.display = "none";
        document.getElementById("addToWatchlist").style.display = "none";
        document.getElementById("removeFromWatchlist").style.display = "none";
    }

    render(card);
    buttonListeners(card);
    await updateCardCounts(card);
    await updateWatchlistButtons(card);
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

    document.getElementById("cardLow").textContent = card.cardPrice.low ? `${card.cardPrice.low.toFixed(2)}€` : "N/A";
    document.getElementById("cardTrend").textContent = card.cardPrice.trend ? `${card.cardPrice.trend.toFixed(2)}€` : "N/A";
    document.getElementById("avg30").textContent = card.cardPrice.avg30 ? `${card.cardPrice.avg30.toFixed(2)}€` : "N/A";
    document.getElementById("avg7").textContent = card.cardPrice.avg7 ? `${card.cardPrice.avg7.toFixed(2)}€` : "N/A";
    document.getElementById("avg1").textContent = card.cardPrice.avg1 ? `${card.cardPrice.avg1.toFixed(2)}€` : "N/A";
}

function buttonListeners(card) {

    // Listener para añadir carta de la colección, abre modal para introducir precio y cantidad
    document.getElementById("addToCollection").addEventListener("click", () => 
        openPriceModal(card)
    );

    // Eliminar carta de la colección
    document.getElementById("removeFromCollection").addEventListener("click", async () => {
        await userActions.removeCardFromCollection(card);
        showToast(card.name + " eliminada de la colección.");
        await updateCardCounts(card);
    });

    // Añadir carta a la watchlist
    document.getElementById("addToWatchlist").addEventListener("click", async () => {
        await userActions.addCardToWatchlist(card);
        showToast(card.name + " añadida a la watchlist.");
        await updateWatchlistButtons(card);
    });

    // Eliminar carta de la watchlist
    document.getElementById("removeFromWatchlist").addEventListener("click", async () => {
        await userActions.removeCardFromWatchlist(card);
        showToast(card.name + " eliminada de la watchlist.");
        await updateWatchlistButtons(card);
    });


    // Si la carta no tiene precios, mostrar botón para actualizar precios desde Cardtrader
    if(card.cardPrice.low === null && card.cardPrice.trend === null){
        // Actualizar precios desde Cardtrader
        document.getElementById("updatePrices").addEventListener("click", async () => {
            await updatePricesFromCardtrader(card.scryfallId, card.lang);
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
        await updateCardCounts(card);
    };

    // Botón de cerrar modal
    closeBtn.onclick = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    };
}

// Contador de cartas en la colección
async function updateCardCounts(card) {
    const cardQuantityEl = document.getElementById("cardQuantity");
    const quantity = await userActions.isCardInCollection(card.id);
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
async function updateWatchlistButtons(card) {
    const addBtn = document.getElementById("addToWatchlist");
    const removeBtn = document.getElementById("removeFromWatchlist");
    const isInWatchlist = await userActions.isCardInWatchlist(card.id);

    if (!isInWatchlist) {
        addBtn.style.display = "inline-block";
        removeBtn.style.display = "none";
    } else {
        addBtn.style.display = "none";
        removeBtn.style.display = "inline-block";
    }
}