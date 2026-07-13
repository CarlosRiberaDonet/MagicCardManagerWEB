// cardDetail.js

import { fetchCardDetails, fetchCardMarketPrices, updatePricesFromCardtrader } from "./api.js";
import { addCardToCollection } from "./userActions.js";
import { getToken } from "./auth.js";
import { showToast, getCondition } from "./utils.js";
import * as userActions from "./userActions.js";

const BASE_URL = "http://localhost:8081/scryfall";

const cardId = new URLSearchParams(location.search).get("cardId");
let card;
let condition;

init();

async function init() {

    const token = getToken();

    if (!cardId) return;
    
    if (!token) {
        showToast("Debe de estar logueado.", "error");
        return;
    }

    // UI según login
    if (!token) {
        document.getElementById("addToCollection").style.display = "none";
        document.getElementById("addToWatchlist").style.display = "none";
        document.getElementById("removeFromWatchlist").style.display = "none";
    }
    
    // Llamo a la API para obtener los detalles de la carta
    card = await fetchCardDetails(cardId);

    await render(card);
    await renderPrices(card);
    await buttonListeners(card);
    await updateCardCounts(card);
    await updateWatchlistButtons(card);
}

async function render(card) {
    if(card.printedName){
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
}

async function renderPrices(card) {

    // Obtener precios
    await chekPrices(card);
    // Mostrar precios de la carta
    if(!card.isFoil){
        document.getElementById("cardLow").textContent = formatPrice(card?.cardPrice?.low);
        document.getElementById("cardTrend").textContent = formatPrice(card?.cardPrice?.trend);
        document.getElementById("avg30").textContent = formatPrice(card?.cardPrice?.avg30);
        document.getElementById("avg7").textContent = formatPrice(card?.cardPrice?.avg7);
        document.getElementById("avg1").textContent = formatPrice(card?.cardPrice?.avg1);
    } 
    if(card.isFoil){
        showToast("Carta Foil, mostrando precios de carta foil");
        document.getElementById("cardLow").textContent = formatPrice(card?.cardPrice?.lowFoil);
        document.getElementById("cardTrend").textContent = formatPrice(card?.cardPrice?.trendFoil);
        document.getElementById("avg30").textContent = formatPrice(card?.cardPrice?.avg1Foil);
        document.getElementById("avg7").textContent = formatPrice(card?.cardPrice?.foilAvg7);
        document.getElementById("avg1").textContent = formatPrice(card?.cardPrice?.foilAvg1);
    }
}

async function buttonListeners(card) {

    if(card.cardPrice != null){
         document.getElementById("updatePrices").style.display = "none"; // Desactivar botón de actualizar precios
            // Mostrar fecha de actualización de precios
            const updatedAt = new Date(card.cardPrice.fetchedAt);
            document.getElementById("lastUpdated").style.display = "block";
            document.getElementById("lastUpdated").textContent =
                `Precios actualizados: ${updatedAt.toLocaleString()}`;
    }

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
        card.foil = e.target.checked;
        await updateWatchlistButtons(card); // Comprobar si la carta está en la lista de seguimiento del user
        await updateCardCounts(card); // Conteo de la colección de cartas del user
        await render(card);
        await renderPrices(card)
        console.log(card.cardPrice);
    });

    // Selector estado de la carta
    document.getElementById("cardCondition").addEventListener("change", async (e) =>  {
        // Asignar la condición seleccionada
        card.condition =  e.target.value;;
        await updateWatchlistButtons(card); 
        await updateCardCounts(card);
        await render(card);
        await renderPrices(card);
    });   
}


async function chekPrices(card) {

    // Obtener los precios desde Cardmarket
    if(card.condition === "NM"){
        card.cardPrice = await fetchCardMarketPrices(card.id);

        console.log(card.cardPrice);
        // Si carmarket no devuelve precios, obtener de cardtrader
        if(card.cardPrice === null){
            showToast("No se han podido obtener los precios de la carta desde Cardmarket, obteniendo desde Cardtrader", "error"); 
            console.log(card.id);
            card.cardPrice = await updatePricesFromCardtrader(card);
            console.log("Precios obtenidos" + card.cardPrice);
        }

       /* else{
             document.getElementById("updatePrices").style.display = "none"; // Desactivar botón de actualizar precios
            // Mostrar fecha de actualización de precios
            const updatedAt = new Date(card.cardPrice.updatedAt);
            document.getElementById("lastUpdated").style.display = "block";
            document.getElementById("lastUpdated").textContent =
                `Precios actualizados: ${updatedAt.toLocaleString()}`;
        }
    }

    // Si la carta no está en "NM" o no es foil, actualizar precios desde Cardtrader
    if(card.condition != "NM" || card.foil != false){
        showToast("Cambiando parametros de la carta");

        // Obtener precios de la carta según si es foil o no
        card.cardPrice = await updatePricesFromCardtrader(card);

        // No tiene precios
        if (card?.cardPrice === null) {
            // Activar botón de actualizar precios
            document.getElementById("lastUpdated").style.display = "none";
            document.getElementById("updatePrices").style.display = "inline-block";
            return;
        }
        if(card.cardPrice === null){
            showToast("No se han podido obtener los precios de la carta", "error");
        } */
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
    conditionElement.textContent = card.condition;
    conditionElement.className = getCondition(card.condition);
    document.getElementById("labelFoilValue").textContent = card.foil ? "Sí" : "No";

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

// Formalizar precios de carta
function formatPrice(price) {
    if (price == null) return "N/A";
    return `${price.toFixed(2)}€`;
}