// collection.js

import { getToken } from './auth.js';
import { loadCollection } from "./apiUser.js";
import { getFlag } from './utils.js';


// ===========================
// ESTADO GLOBAL
// ===========================
let allCards = [];
let currentView = 'list';


// ===========================
// INIT
// ===========================
async function init() {
    try {
        allCards = await loadCollection(getToken());

        renderStats();
        loadEditions();
        setupFilters();
        setupViewToggle();

        renderCollectionList(allCards);
    } catch (error) {
        console.error("Error al cargar la colección:", error);
        document.getElementById("collectionContainer").innerHTML =
            "<p>Error al cargar la colección.</p>";
    }
}


// ===========================
// HELPERS
// ===========================

// Normaliza precio: trend > low > 0
function getCurrentPrice(card) {
    const price = card.scryfallCard?.cardPrice;
    return price?.trend ?? price?.low ?? 0;
}

// Ganancia por carta
function calcProfit(card) {
    const price = getCurrentPrice(card);
    const purchase = card.purchasePrice || 0;
    const qty = card.quantity || 1;

    return (price - purchase) * qty;
}


// ===========================
// ESTADÍSTICAS
// ===========================
function renderStats() {

    const totalCards = allCards.reduce((sum, c) =>
        sum + (c.quantity || 1), 0
    );

    const totalValue = allCards.reduce((sum, c) =>
        sum + getCurrentPrice(c) * (c.quantity || 1), 0
    );

    const totalInvested = allCards.reduce((sum, c) =>
        sum + (c.purchasePrice || 0) * (c.quantity || 1), 0
    );

    const totalProfit = totalValue - totalInvested;

    document.getElementById("totalCards").textContent = totalCards;
    document.getElementById("totalValue").textContent = formatPrice(totalValue);
    document.getElementById("totalInvested").textContent = formatPrice(totalInvested);

    const profitEl = document.getElementById("totalProfit");
    profitEl.textContent = formatPrice(totalProfit);
    profitEl.style.color = totalProfit >= 0 ? '#4caf50' : '#e88a8a';
}


// ===========================
// EDITIONS FILTER
// ===========================
function loadEditions() {
    const select = document.getElementById("colFilterSet");
    select.innerHTML = '<option value="">Set</option>';

    const sets = new Set(allCards.map(c => c.scryfallCard?.setName));

    sets.forEach(set => {
        const opt = document.createElement("option");
        opt.value = set;
        opt.textContent = set;
        select.appendChild(opt);
    });
}


// ===========================
// RENDER LIST
// ===========================
function renderCollectionList(cards = allCards) {

    const container = document.getElementById("collectionContainer");
    container.className = 'collection-list';
    container.innerHTML = '';

    if (!cards.length) {
        container.innerHTML = "<p>No tienes cartas en tu colección.</p>";
        return;
    }

    // header
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
    container.appendChild(header);

    cards.forEach(card => {

        const price = getCurrentPrice(card);
        const profit = calcProfit(card);

        const row = document.createElement("div");
        row.className = "collection-list-item";

        row.innerHTML = `
            <div class="card-thumb">
                📷
                <img src="${card.scryfallCard.imageUrl}" class="card-tooltip-img">
            </div>

            <span>${card.scryfallCard.name}</span>

            <div>
                <img src="${card.scryfallCard.iconSvgUri}" class="set-icon">
            </div>

            <span>${card.scryfallCard.rarity || '—'}</span>

            <span>${card.scryfallCard.collectorNumber}</span>

            <span>${getFlag(card.scryfallCard.lang) || '—'}</span>

            <span>${card.quantity || 1}</span>

            <span>${formatPrice(card.purchasePrice || 0)}</span>

            <span>${price ? formatPrice(price) : 'N/A'}</span>

            <span style="color:${profit >= 0 ? 'green' : 'red'}">
                ${formatPrice(profit)}
            </span>
        `;

        row.addEventListener('click', () => {
            window.open(
                `cardDetail.html?scryfallId=${card.scryfallCard.scryfallId}`,
                "_blank"
            );
        });

        container.appendChild(row);
    });
}


// ===========================
// RENDER GRID
// ===========================
function renderCollectionGrid(cards = allCards) {

    const container = document.getElementById("collectionContainer");
    container.className = 'collection-grid';
    container.innerHTML = '';

    cards.forEach(card => {

        const price = getCurrentPrice(card);

        const el = document.createElement("div");
        el.className = "card";

        el.innerHTML = `
            <img src="${card.scryfallCard.imageUrl}">
            <h3>${card.scryfallCard.name}</h3>
            <img src="${card.scryfallCard.iconSvgUri}" class="set-icon">
            <p>${getFlag(card.scryfallCard.lang) || '—'}</p>
            <p>${price ? formatPrice(price) : 'N/A'}</p>
            <p>${card.quantity || 1}x</p>
        `;

        el.addEventListener('click', () => {
            window.open(
                `cardDetail.html?scryfallId=${card.scryfallCard.scryfallId}`,
                "_blank"
            );
        });

        container.appendChild(el);
    });
}


// ===========================
// VIEW SWITCH
// ===========================
function setupViewToggle() {

    document.getElementById("viewGrid").addEventListener("click", () => {
        currentView = 'grid';
        renderCollectionGrid(applyFilters());
    });

    document.getElementById("viewList").addEventListener("click", () => {
        currentView = 'list';
        renderCollectionList(applyFilters());
    });
}


// ===========================
// FILTERS
// ===========================
function setupFilters() {

    const inputs = [
        "colFilterSet",
        "colFilterRarity",
        "colFilterLang",
        "colFilterSort",
        "colSearch"
    ];

    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener("input", () => {
            const filtered = applyFilters();
            currentView === 'list'
                ? renderCollectionList(filtered)
                : renderCollectionGrid(filtered);
        });
    });

    document.getElementById("colClearFilters").addEventListener("click", () => {
        inputs.forEach(id => document.getElementById(id).value = "");

        currentView === 'list'
            ? renderCollectionList(allCards)
            : renderCollectionGrid(allCards);
    });
}


// ===========================
// APPLY FILTERS
// ===========================
function applyFilters() {

    const set = document.getElementById("colFilterSet")?.value;
    const rarity = document.getElementById("colFilterRarity")?.value;
    const lang = document.getElementById("colFilterLang")?.value;
    const search = document.getElementById("colSearch")?.value?.toLowerCase();
    const sort = document.getElementById("colFilterSort")?.value;

    let filtered = [...allCards];

    if (set) filtered = filtered.filter(c => c.scryfallCard?.setName === set);
    if (rarity) filtered = filtered.filter(c => c.scryfallCard?.rarity === rarity);
    if (lang) filtered = filtered.filter(c => c.scryfallCard?.lang === lang);
    if (search) filtered = filtered.filter(c =>
        c.scryfallCard?.name?.toLowerCase().includes(search)
    );

    if (sort === 'name_asc') filtered.sort((a, b) =>
        a.scryfallCard.name.localeCompare(b.scryfallCard.name)
    );

    if (sort === 'name_desc') filtered.sort((a, b) =>
        b.scryfallCard.name.localeCompare(a.scryfallCard.name)
    );

    if (sort === 'price_desc') filtered.sort((a, b) =>
        getCurrentPrice(b) - getCurrentPrice(a)
    );

    if (sort === 'price_asc') filtered.sort((a, b) =>
        getCurrentPrice(a) - getCurrentPrice(b)
    );

    if (sort === 'profit_desc') filtered.sort((a, b) =>
        calcProfit(b) - calcProfit(a)
    );

    if (sort === 'profit_asc') filtered.sort((a, b) =>
        calcProfit(a) - calcProfit(b)
    );

    return filtered;
}


// ===========================
// FORMAT
// ===========================
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price || 0);
}


// ===========================
// START
// ===========================
init();