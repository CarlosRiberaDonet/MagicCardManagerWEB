// cardDetail.js

import { updatePricesFromCardtrader } from "./api.js";
import { addCardToCollection } from "./userActions.js";
import { getToken } from "./auth.js";
import { showToast, getCondition } from "./utils.js";
import * as userActions from "./userActions.js";

const BASE_URL = "http://localhost:8081/scryfall";

const params = new URLSearchParams(location.search);
const cardId = params.get("cardId");
let condition = "NM";
let isFoil = false;

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
    card.condition = condition; // por defecto, condición NM
    
    // UI según login
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
    document.getElementById("cardCondition").value = "NM";
    document.getElementById("cardLow").textContent = formatPrice(card?.cardPrice?.low);
    document.getElementById("cardTrend").textContent = formatPrice(card?.cardPrice?.trend);
    document.getElementById("avg30").textContent = formatPrice(card?.cardPrice?.avg30);
    document.getElementById("avg7").textContent = formatPrice(card?.cardPrice?.avg7);
    document.getElementById("avg1").textContent = formatPrice(card?.cardPrice?.avg1);
}

function buttonListeners(card) {

    // Listener para añadir carta de la colección, abre modal para introducir precio y cantidad
   document.getElementById("addToCollection").addEventListener("click", () => {
        openPriceModal(card);
    });

    // Añadir carta a la watchlist
    document.getElementById("addToWatchlist").addEventListener("click", async () => {
        //card.purchasePrice = 
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
        isFoil = e.target.checked;
            card.foil = e.target.checked;
            await updateWatchlistButtons(card); // Comprobar si la carta está en la lista de seguimiento del user
            await updateCardCounts(card); // Conteo de la colección de cartas del user
        
    });

    // Selector estado de la carta
    document.getElementById("cardCondition").addEventListener("change", async (e) =>  {
        // Asignar la condición seleccionada
        condition = e.target.value;
        card.condition = condition;
        await updateWatchlistButtons(card); 
        await updateCardCounts(card);
        // Mostrar precios de la condición seleccionada
    });

    // Si la carta no tiene precios, mostrar botón para actualizar precios desde Cardtrader
    if(card?.cardPrice?.low == null && card?.cardPrice?.trend == null){

        // Actualizar precios desde Cardtrader
        document.getElementById("updatePrices").addEventListener("click", async () => {

            card.cardPrice = {};
            const updatedPrice = await updatePricesFromCardtrader(card);
            card.cardPrice.low = updatedPrice.low;
            card.cardPrice.avg = updatedPrice.avg;
            card.cardPrice.trend = updatedPrice.trend;
            card.cardPrice.avg1 = updatedPrice.avg1;
            card.cardPrice.avg7 = updatedPrice.avg7;
            card.cardPrice.avg30 = updatedPrice.avg30;8
            location.reload();
        });
    } else{
        // Ocultar botón de actualizar precios si ya tiene precios
        document.getElementById("updatePrices").style.display = "none";
    }
   
}

    // Abrir modal para añadir carta a la colección con precio
  function openPriceModal(card) {
    const conditionElement = document.getElementById("labelConditionValue");
    const modal = document.getElementById("priceModal");
    const el = document.getElementById("labelConditionValue");
    const priceInput = document.getElementById("priceInput");
    const quantityInput = document.getElementById("quantityInput");
    const confirmBtn = document.getElementById("confirmBtn");
    const closeBtn = document.getElementById("closePriceModal");
    conditionElement.textContent = condition;
    conditionElement.className = getCondition(condition);
    document.getElementById("labelFoilValue").textContent = isFoil ? "Sí" : "No";

    if (!modal || !priceInput || !quantityInput || !confirmBtn) return;

    priceInput.value =
        card?.cardPrice?.low ??
        card?.cardPrice?.trend ??
        card?.cardPrice?.avg ??
        0;

    quantityInput.value = 1;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    confirmBtn.onclick = async () => {

        card.purchasePrice = parseFloat(priceInput.value);
        card.quantity = parseInt(quantityInput.value);
        card.condition = condition;
        card.lang = card.lang;
        card.foil = isFoil;

        await addCardToCollection(card);

        modal.classList.remove("active");
        document.body.style.overflow = "";

        showToast(`${card.name} añadida a la colección`);

        await updateCardCounts(card);
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
    console.log("Cantidad de cartas en la colección:", quantity);
    cardQuantityEl.textContent = quantity + "x";
}

// Comprobar si la carta está en la watchlist y actualizar botones
async function updateWatchlistButtons(card) {
    const addBtn = document.getElementById("addToWatchlist");
    const removeBtn = document.getElementById("removeFromWatchlist");
    card.condition = condition;
    const isInWatchlist = await userActions.isCardInWatchlist(card);

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