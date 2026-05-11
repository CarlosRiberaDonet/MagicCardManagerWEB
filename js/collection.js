// collection.js

import { loadCollection } from "./apiUser.js";

// ===========================
// ESTADO
// ===========================
let allCards = [];         // todas las cartas de la colección
let currentView = 'list';  // vista activa: 'list' o 'grid'

// ===========================
// TOKEN
// ===========================
function getToken() {
    const token = localStorage.getItem('authToken');
    if (!token) window.location.href = '/index.html'; // sin token, al inicio
    return token;
}

// ===========================
// INICIALIZACIÓN
// ===========================
async function init() {
    try {
        const token = getToken();
        allCards = await loadCollection(token);
        renderStats(allCards);
        renderList(allCards);
        setupFilters();
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
function renderStats(cards) {
    const totalCards   = cards.reduce((sum, c) => sum + (c.quantity || 1), 0);
    const totalValue   = cards.reduce((sum, c) => sum + (c.cardPrice?.trend || 0) * (c.quantity || 1), 0);
    const totalInvested = cards.reduce((sum, c) => sum + (c.purchasePrice || 0) * (c.quantity || 1), 0);
    const totalProfit  = totalValue - totalInvested;

    document.getElementById("totalCards").textContent    = totalCards;
    document.getElementById("totalValue").textContent    = formatPrice(totalValue);
    document.getElementById("totalInvested").textContent = formatPrice(totalInvested);

    const profitEl = document.getElementById("totalProfit");
    profitEl.textContent = formatPrice(totalProfit);
    profitEl.style.color = totalProfit >= 0 ? '#4caf50' : '#e88a8a';
}

// ===========================
// VISTA LISTA
// ===========================
function renderList(cards) {
    const container = document.getElementById("collectionContainer");
    container.className = 'collection-list';

    if (!cards || cards.length === 0) {
        container.innerHTML = "<p>No tienes cartas en tu colección.</p>";
        return;
    }

    // Cabecera de la tabla
    const header = document.createElement("div");
    header.className = "collection-list-header";
    header.innerHTML = `
        <span></span>
        <span>Carta</span>
        <span>Set</span>
        <span>Idioma</span>
        <span>Rareza</span>
        <span>Qty</span>
        <span>Compra</span>
        <span>Actual</span>
        <span>Ganancia</span>
    `;
    container.innerHTML = '';
    container.appendChild(header);

    // Filas de cartas
    cards.forEach(card => {
        const currentPrice  = card.cardPrice?.trend || 0;
        const purchasePrice = card.purchasePrice || 0;
        const quantity      = card.quantity || 1;
        const profit        = (currentPrice - purchasePrice) * quantity;
        const profitClass   = profit >= 0 ? 'positive' : 'negative';

        const row = document.createElement("div");
        row.className = "collection-list-item";
        row.innerHTML = `
            <img src="${card.iconSvgUri || ''}" alt="${card.setName}" class="set-icon">
            <span class="list-name">${card.name}</span>
            <span class="list-set">${card.setName || '—'}</span>
            <span class="list-lang">${card.lang || '—'}</span>
            <span class="list-rarity">${card.rarity || '—'}</span>
            <span class="list-qty">${quantity}</span>
            <span class="list-purchase">${purchasePrice > 0 ? formatPrice(purchasePrice) : '—'}</span>
            <span class="list-current">${currentPrice > 0 ? formatPrice(currentPrice) : 'N/A'}</span>
            <span class="list-profit ${profitClass}">${purchasePrice > 0 ? formatPrice(profit) : '—'}</span>
        `;

        // Abrir detalle al hacer clic
        row.addEventListener('click', () => {
            window.open(`/cardDetail.html?id=${card.id}`, '_blank');
        });

        container.appendChild(row);
    });
}

// ===========================
// VISTA CUADRÍCULA
// ===========================
function renderGrid(cards) {
    const container = document.getElementById("collectionContainer");
    container.className = 'collection-grid';
    container.innerHTML = '';

    if (!cards || cards.length === 0) {
        container.innerHTML = "<p>No tienes cartas en tu colección.</p>";
        return;
    }

    cards.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "card";
        cardEl.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}">
            <img src="${card.iconSvgUri || ''}" alt="${card.setName}" class="set-icon">
            <h3>${card.name}</h3>
            <p>${card.setName || '—'}</p>
            <p>${card.lang || '—'}</p>
            <p>${card.quantity || 1}x</p>
            <p>${card.cardPrice?.trend ? formatPrice(card.cardPrice.trend) : 'N/A'}</p>
        `;
        cardEl.addEventListener('click', () => {
            window.open(`/cardDetail.html?id=${card.id}`, '_blank');
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
        renderGrid(applyFilters());
    });

    document.getElementById("viewList").addEventListener("click", () => {
        currentView = 'list';
        document.getElementById("viewList").classList.add('active');
        document.getElementById("viewGrid").classList.remove('active');
        renderList(applyFilters());
    });
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
            currentView === 'list' ? renderList(filtered) : renderGrid(filtered);
        });
    });

    document.getElementById("colClearFilters").addEventListener("click", () => {
        document.getElementById("colFilterSet").value    = "";
        document.getElementById("colFilterRarity").value = "";
        document.getElementById("colFilterLang").value   = "";
        document.getElementById("colFilterSort").value   = "";
        document.getElementById("colSearch").value       = "";
        currentView === 'list' ? renderList(allCards) : renderGrid(allCards);
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