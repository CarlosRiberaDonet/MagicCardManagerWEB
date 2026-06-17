// collection.js

import { loadCollection } from "./apiUser.js";
import { getFlag, getToken } from './utils.js';


// ===========================
// ESTADO
// ===========================
let allCards = [];
let currentView = 'list';  // vista activa: 'list' o 'grid'



// ===========================
// INICIALIZACIÓN
// ===========================
async function init() {
    try {
        allCards = await loadCollection(getToken());
        renderStats();
        renderCollectionList();
        setupFilters();
        loadEditions();
        setupViewToggle();
    } catch (error) {
        console.error("Error al cargar la colección:", error);
        document.getElementById("collectionContainer").innerHTML =
            "<p>Error al cargar la colección.</p>";
    }
}

// ===========================
// ESTADÍSTICAS
// ===========================
function renderStats() {
    const totalCards = allCards.reduce((sum, c) => sum + (c.quantity || 1), 0); // Total de cartas (sumando cantidades)
    const totalValue   = allCards.reduce((sum, c) => sum + (c.scryfallCard.cardPrice?.low || 0) * (c.quantity || 1), 0);
    const totalInvested = allCards.reduce((sum, c) => sum + (c.purchasePrice || 0) * (c.quantity || 1), 0);
    const totalProfit  = totalValue - totalInvested;

    document.getElementById("totalCards").textContent    = totalCards;
    document.getElementById("totalValue").textContent    = formatPrice(totalValue);
    document.getElementById("totalInvested").textContent = formatPrice(totalInvested);

    const profitEl = document.getElementById("totalProfit");
    profitEl.textContent = formatPrice(totalProfit);
    profitEl.style.color = totalProfit >= 0 ? '#4caf50' : '#e88a8a';
}

/////////////////////////////// REVISAR ////////////////////////////////////////////////////////////
// Cargar lista de ediciones de las cartas del usuario
function loadEditions() {
    const selectElement = document.getElementById("colFilterSet");
    selectElement.innerHTML = '<option value="">Set</option>'; // opción por defecto

    const setsUnicos = new Set(allCards.map(card => card.scryfallCard.setName)); // sets únicos

    setsUnicos.forEach(set => {
        const option = document.createElement("option");
        option.value = set;
        option.textContent = set;
        selectElement.appendChild(option);
    });
}

// ===========================
// VISTA LISTA
// ===========================
function renderCollectionList() {
    const container = document.getElementById("collectionContainer");
    container.className = 'collection-list';

    if (allCards.length === 0) {
        container.innerHTML = "<p>No tienes cartas en tu colección.</p>";
        return;
    }

    // Cabecera de la tabla
    const header = document.createElement("div");
    header.className = "collection-list-header";
    header.innerHTML = `
        <span></span>
        <span>Nombre</span>
        <span>Edición</span>
        <span>Rareza</span>
        <span>#</span>
        <span>Idioma</span>
        <span>Cant.</span>
        <span>Compra</span>
        <span>V.Actual</span>
        <span>Ganancia</span>
    `;
    container.innerHTML = '';
    container.appendChild(header);

    // Filas de cartas
    allCards.forEach(card => {
        const currentPrice  = card.scryfallCard.cardPrice?.low || card.scryfallCard.cardPrice?.trend|| 0; // Precio actual
        const purchasePrice = card.purchasePrice || 0; // Precio de compra
        const quantity      = card.quantity || 1; // Cantidad de esa carta en la colección
        const profit        = (currentPrice - purchasePrice) * quantity; // Ganancia total por esa carta
        const profitClass   = profit >= 0 ? 'positive' : 'negative';    // Clase para color de ganancia
        const row = document.createElement("div");
        row.className = "collection-list-item";
        row.innerHTML = `
            <div class="card-thumb">
                📷
                <img src="${card.scryfallCard.imageUrl}" class="card-tooltip-img">
            </div>
            <span class="list-name">${card.scryfallCard.name}</span>
            <div class="set-name">
                <img src="${card.scryfallCard.iconSvgUri}" alt="${card.scryfallCard.setName}" title="${card.scryfallCard.setName}" class="set-icon">
            </div>
            <span class="list-rarity">${card.scryfallCard.rarity || '—'}</span>
            <span class="collector-number">${card.scryfallCard.collectorNumber}</span>
            <span class="list-lang">${getFlag(card.scryfallCard.lang) || '—'}</span>
            <span class="list-qty">${quantity}</span>
            <span class="list-purchase">${formatPrice(purchasePrice)}</span>
            <span class="list-current">${currentPrice >= 0 ? formatPrice(currentPrice) : 'N/A'}</span>
            
            <span class="list-profit ${profitClass}">${formatPrice(profit)}</span>
        `;

        // Abrir detalle al hacer clic
        row.addEventListener('click', () => {
           window.open(`cardDetail.html?scryfallId=${card.scryfallCard.scryfallId}`, "_blank");
        });

        container.appendChild(row);
    });
}

// ===========================
// CARGAR INFORMACIÓN DE CARTAS EN VISTA CUADRÍCULA
// ===========================
function renderCollectionGrid() {
    const container = document.getElementById("collectionContainer");
    container.className = 'collection-grid';
    container.innerHTML = '';

    if (allCards.length === 0) {
        container.innerHTML = "<p>No tienes cartas en tu colección.</p>";
        return;
    }

    allCards.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "card";
        cardEl.innerHTML = `
            <img src="${card.scryfallCard.imageUrl}" alt="${card.scryfallCard.name}">
            <h3>${card.scryfallCard.name}</h3>
            <img src="${card.scryfallCard.iconSvgUri || ''}" alt="${card.scryfallCard.setName}" class="set-icon">
            <p>${getFlag(card.scryfallCard.lang) || '—'}</p>

            <p>${card.scryfallCard.cardPrice?.trend ? formatPrice(card.scryfallCard.cardPrice.trend) : 'N/A'}</p>
            <p>${card.quantity || 1}x</p>
        `;
        cardEl.addEventListener('click', () => {
           window.open(`cardDetail.html?scryfallId=${card.scryfallCard.scryfallId}`, "_blank");
        });
        container.appendChild(cardEl);
    });
}

// ===========================
// TOGGLE LISTA / CUADRÍCULA
// ===========================
function setupViewToggle() {
    document.getElementById("viewGrid").addEventListener("click", () => {
        currentView = 'grid';
        document.getElementById("viewGrid").classList.add('active');
        document.getElementById("viewList").classList.remove('active');
        renderCollectionGrid(applyFilters());
    });

    document.getElementById("viewList").addEventListener("click", () => {
        currentView = 'list';
        document.getElementById("viewList").classList.add('active');
        document.getElementById("viewGrid").classList.remove('active');
        renderCollectionList(applyFilters());
    });
    // Vista lista por defecto
    document.getElementById("viewList").classList.add('active');
    document.getElementById("viewGrid").classList.remove('active');
}

// ===========================
// FILTROS
// ===========================
function setupFilters() {
    const inputs = ["colFilterSet", "colFilterRarity", "colFilterLang", "colFilterSort", "colSearch"];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => {
            const filtered = applyFilters();
            currentView === 'list' ? renderCollectionList(filtered) : renderCollectionGrid(filtered);

        });
    });

    document.getElementById("colClearFilters").addEventListener("click", () => {
        document.getElementById("colFilterSet").value    = "";
        document.getElementById("colFilterRarity").value = "";
        document.getElementById("colFilterLang").value   = "";
        document.getElementById("colFilterSort").value   = "";
        document.getElementById("colSearch").value       = "";
        currentView === 'list' ? renderCollectionList(allCards) : renderCollectionGrid(allCards);
    });
}

function applyFilters() {
    const set    = document.getElementById("colFilterSet")?.value    || null;
    const rarity = document.getElementById("colFilterRarity")?.value || null;
    const lang   = document.getElementById("colFilterLang")?.value   || null;
    const sort   = document.getElementById("colFilterSort")?.value   || null;
    const search = document.getElementById("colSearch")?.value?.toLowerCase() || null;

    let filtered = [...allCards];

    if (set)    filtered = filtered.filter(c => c.setName === set);
    if (rarity) filtered = filtered.filter(c => c.rarity  === rarity);
    if (lang)   filtered = filtered.filter(c => c.lang    === lang);
    if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search));

    if (sort === 'name_asc')    filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name_desc')   filtered.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'price_asc')   filtered.sort((a, b) => (a.cardPrice?.trend || 0) - (b.cardPrice?.trend || 0));
    if (sort === 'price_desc')  filtered.sort((a, b) => (b.cardPrice?.trend || 0) - (a.cardPrice?.trend || 0));
    if (sort === 'profit_desc') filtered.sort((a, b) => profit(b) - profit(a));
    if (sort === 'profit_asc')  filtered.sort((a, b) => profit(a) - profit(b));

    return filtered;
}

// Calcula la ganancia de una carta
function profit(card) {
    return ((card.cardPrice?.trend || 0) - (card.purchasePrice || 0)) * (card.quantity || 1);
}

// ===========================
// FORMATO DE PRECIO
// ===========================
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// ===========================
// ARRANQUE
// ===========================
init();