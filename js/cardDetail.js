// cardDetail.js

import { fetchCardDetails, fetchCardMarketPrices, updatePricesFromCardtrader, fetchCardTraderPrices } from "./api.js";
import { addCardToCollection } from "./userActions.js";
import { openModal, isAuthenticated } from './auth.js';
import { showToast, getCondition } from "./utils.js";
import * as userActions from "./userActions.js";

const cardId = new URLSearchParams(location.search).get("cardId");
let card;
let condition;

init();

async function init() {
    // Llamo a la API para obtener los detalles de la carta
    card = await fetchCardDetails(cardId);

    await render(card);
    await renderPrices(card);

    await buttonListeners(card);
    await updateCardCounts(card);
    await updateWatchlistButtons(card);

    await checkButtons();
}

async function checkButtons() {
    
    if (!isAuthenticated()) {

        document.getElementById("addToCollection").style.display = "none";
        document.getElementById("addToWatchlist").style.display = "none";
        document.getElementById("removeFromWatchlist").style.display = "none";
        document.getElementById("cardQuantity").style.display = "none";

        document.getElementById("cardCondition").disabled = true;
        document.getElementById("cardFoil").disabled = true;

        const updateBtn = document.getElementById("updatePrices");
        const marketBtn = document.getElementById("cardMarketURL");

        const loginRequired = (e) => {
            e.preventDefault();
            showToast("Debes iniciar sesión para utilizar esta función.", "warning");
        };

        updateBtn.addEventListener("click", loginRequired);

        marketBtn.addEventListener("click", loginRequired);
    }
}

async function render(card) {
    if (card.printedName) {
        document.getElementById("cardName").textContent = card.printedName;
    } else {
        document.getElementById("cardName").textContent = card.name;
    }
    document.getElementById("cardImage").src = card.imageUrl;
    document.getElementById("cardSet").textContent = card.setName;
    document.getElementById("cardLang").textContent = card.lang;
    document.getElementById("collectorNumber").textContent = card.collectorNumber;
    document.getElementById("cardRarity").textContent = card.rarity;
    document.getElementById("typeLine").textContent = card.typeLine;
    document.getElementById("released_at").textContent = card.releasedAt;
    document.getElementById("cardMarketURL").href = card.cardmarketURL;
    document.getElementById("cardCondition").value = card.condition; 

    console.log("Carta renderizada:", card);
}

async function renderPrices(card) {

    // Obtener precios
    await chekPrices(card);

    // Si la carta tiene precio
    if (card.cardPrice != null) {

        // Mostrar precios de la carta
        document.getElementById("cardLow").textContent = formatPrice(card?.cardPrice?.low);
        document.getElementById("cardTrend").textContent = formatPrice(card?.cardPrice?.trend);
        document.getElementById("avg30").textContent = formatPrice(card?.cardPrice?.avg30);
        document.getElementById("avg7").textContent = formatPrice(card?.cardPrice?.avg7);
        document.getElementById("avg1").textContent = formatPrice(card?.cardPrice?.avg1);
        document.getElementById("priceSource").textContent = card?.cardPrice?.priceSource || "N/A";

        // Mostrar fecha de actualización de precios
        const updatedAt = new Date(card.cardPrice.updatedAt);
        document.getElementById("lastUpdated").style.display = "block";
        document.getElementById("lastUpdated").textContent =
            `Precios actualizados: ${updatedAt.toLocaleString()}`;
    } else {
        document.getElementById("updatePrices").style.display = "block";
    }

    // Comprobar si CardTrader puede volver a actualizarse
    updatePrices.style.display = canUpdateCardTrader(card.cardPrice?.updatedAt)
    ? "block"
    : "none";
}

async function buttonListeners(card) {

    if(isAuthenticated()) {

        // Listener para añadir carta de la colección, abre modal para introducir precio y cantidad
        document.getElementById("addToCollection").addEventListener("click", () => {
            openPriceModal(card);
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
        document.getElementById("cardFoil").addEventListener("change", async (e) => {
            card.foil = e.target.checked;
            await updateWatchlistButtons(card);
            await updateCardCounts(card);
            await renderPrices(card);
        });

        // Selector estado de la carta
        document.getElementById("cardCondition").addEventListener("change", async (e) => {
            card.condition = e.target.value;
            await updateWatchlistButtons(card);
            await updateCardCounts(card);
            await renderPrices(card);
        });

        // Botón actualizar precios
        document.getElementById("updatePrices").addEventListener("click", async () => {
            try {
                const prices = await fetchCardTraderPrices(card);

                if (prices) {
                    // Actualizar la interfaz
                    document.getElementById("priceSource").textContent = "CardTrader";
                    await renderPrices(card);
                }
            } catch (e) {
                showToast(e.message);
            }
        });
        
    }    
}

function canUpdateCardTrader(lastUpdate) {
    if (!lastUpdate) {
        return true;
    }

    const now = new Date();
    const lastUpdated = new Date(lastUpdate);

    const diff = now - lastUpdated;

    return diff >= 24 * 60 * 60 * 1000;
}

export async function chekPrices(card) {

        // Obtener precios de la carta desde cardtrader
        card.cardPrice = await updatePricesFromCardtrader(card);

        // No tiene precios
        if (card?.cardPrice === null) {
            document.getElementById("lastUpdated").style.display = "none";
            document.getElementById("updatePrices").style.display = "inline-block";

            document.getElementById("cardLow").textContent = "N/A";
            document.getElementById("cardTrend").textContent = "N/A";
            document.getElementById("avg30").textContent = "N/A";
            document.getElementById("avg7").textContent = "N/A";
            document.getElementById("avg1").textContent = "N/A";
            return;
        }
        if (card.cardPrice === null) {
            showToast("No se han podido obtener los precios de la carta", "error");
        }
}

// Abrir modal para añadir carta a la colección con precio
function openPriceModal(card) {
    const conditionElement = document.getElementById("labelConditionValue");
    const modal = document.getElementById("priceModal");
    const priceInput = document.getElementById("priceInput");
    const confirmBtn = document.getElementById("confirmBtn");
    const closeBtn = document.getElementById("closePriceModal");
    conditionElement.textContent = card.condition;
    conditionElement.className = getCondition(card.condition);
    document.getElementById("labelFoilValue").textContent = card.foil ? "Sí" : "No";

    if (!modal || !priceInput || !confirmBtn) return;

    priceInput.value =
        card?.cardPrice?.low ??
        card?.cardPrice?.trend ??
        card?.cardPrice?.avg ??
        0;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    confirmBtn.onclick = async () => {

        card.purchasePrice = parseFloat(priceInput.value);

        await addCardToCollection(card);

        modal.classList.remove("active");
        document.body.style.overflow = "";

        await updateCardCounts(card);

        showToast(`${card.name} añadida a la colección`);
    };

    closeBtn.onclick = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    };
}

// Contador de cartas en la colección
async function updateCardCounts(card) {
    const cardQuantityEl = document.getElementById("cardQuantity");
    const quantity = await userActions.isCardInCollection(card);
    cardQuantityEl.textContent = quantity + "x";
}

// Comprobar si la carta está en la watchlist y actualizar botones
async function updateWatchlistButtons(card) {
    const addBtn = document.getElementById("addToWatchlist");
    const removeBtn = document.getElementById("removeFromWatchlist");
    const isInWatchlist = await userActions.isCardInWatchlist(card);

    if (!isInWatchlist) {
        addBtn.style.display = "inline-block";
        removeBtn.style.display = "none";
    } else {
        addBtn.style.display = "none";
        removeBtn.style.display = "inline-block";
    }
}

// Formatear precios de carta
function formatPrice(price) {
    if (price == null) return "N/A";
    return `${price.toFixed(2)}€`;
}