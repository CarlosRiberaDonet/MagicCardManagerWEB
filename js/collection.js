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

// Precio actual normalizado (trend > low > 0)
function getCurrentPrice(item) {
    const price = item?.card?.cardPrice;

    return price?.trend
        ?? price?.low
        ?? price?.avg
        ?? 0;
}

// Ganancia total por carta
function calcProfit(item) {
    const price = getCurrentPrice(item);
    const purchase = item?.purchasePrice ?? 0;
    const qty = item?.quantity ?? 1;

    return (price - purchase) * qty;
}


// ===========================
// ESTADÍSTICAS
// ===========================
function renderStats() {

    const totalCards = allCards.reduce(
        (sum, i) => sum + (i.quantity ?? 1),
        0
    );

    const totalValue = allCards.reduce(
        (sum, i) => sum + getCurrentPrice(i) * (i.quantity ?? 1),
        0
    );

    const totalInvested = allCards.reduce(
        (sum, i) => sum + (i.purchasePrice ?? 0) * (i.quantity ?? 1),
        0
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

    const sets = new Set(allCards.map(i => i?.card?.setName));

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

    cards.forEach(item => {

        const card = item?.card;
        const price = getCurrentPrice(item);
        const profit = calcProfit(item);

        const row = document.createElement("div");
        row.className = "collection-list-item";

        row.innerHTML = `
            <div class="card-thumb">
                📷
                <img src="${card?.imageUrl ?? ''}" class="card-tooltip-img">
            </div>

            <span>${card?.name ?? '—'}</span>

            <div>
                <img src="${card?.iconSvgUri ?? ''}" class="set-icon"  title="${card?.setName ?? ''}">
            </div>

            <span>${card?.rarity ?? '—'}</span>

            <span>${card?.collectorNumber ?? '—'}</span>

            <span>${getFlag(card?.lang) ?? '—'}</span>

            <span>${item?.quantity ?? 1}</span>

            <span>${formatPrice(item?.purchasePrice ?? 0)}</span>

            <span>${price ? formatPrice(price) : 'N/A'}</span>

            <span style="color:${profit >= 0 ? 'green' : 'red'}">
                ${formatPrice(profit)}
            </span>
        `;

        row.addEventListener('click', () => {
            window.open(
                `cardDetail.html?scryfallId=${card?.scryfallId}`,
                "_blank"
            );
        });

        container.appendChild(row);
    });
}


function renderCollectionGrid(cards = allCards) {

    const container = document.getElementById("collectionContainer");
    container.className = 'collection-grid';
    container.innerHTML = '';

    cards.forEach(item => {

        const card = item?.card;
        const price = getCurrentPrice(item);

        const el = document.createElement("div");
        el.className = "card";

        el.innerHTML = `
            <div class="card-thumb">
                <img src="${card?.imageUrl ?? ''}">
            </div>

            <h3>${card?.name ?? '—'}</h3>

            <img src="${card?.iconSvgUri ?? ''}" class="set-icon">

            <p>${getFlag(card?.lang) ?? '—'}</p>

            <p>${price ? formatPrice(price) : 'N/A'}</p>

            <p>${item?.quantity ?? 1}x</p>
        `;

        el.addEventListener('click', () => {
            window.open(
                `cardDetail.html?scryfallId=${card?.scryfallId}`,
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
        updateViewButtons();
    });

    document.getElementById("viewList").addEventListener("click", () => {
        currentView = 'list';
        renderCollectionList(applyFilters());
        updateViewButtons();
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
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

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

    if (set) filtered = filtered.filter(i => i?.card?.setName === set);
    if (rarity) filtered = filtered.filter(i => i?.card?.rarity === rarity);
    if (lang) filtered = filtered.filter(i => i?.card?.lang === lang);

    if (search) {
        filtered = filtered.filter(i =>
            i?.card?.name?.toLowerCase().includes(search)
        );
    }

    if (sort === 'name_asc')
        filtered.sort((a, b) => a.card?.name.localeCompare(b.card?.name));

    if (sort === 'name_desc')
        filtered.sort((a, b) => b.card?.name.localeCompare(a.card?.name));

    if (sort === 'price_desc')
        filtered.sort((a, b) => getCurrentPrice(b) - getCurrentPrice(a));

    if (sort === 'price_asc')
        filtered.sort((a, b) => getCurrentPrice(a) - getCurrentPrice(b));

    if (sort === 'profit_desc')
        filtered.sort((a, b) => calcProfit(b) - calcProfit(a));

    if (sort === 'profit_asc')
        filtered.sort((a, b) => calcProfit(a) - calcProfit(b));

    return filtered;
}


// ===========================
// FORMAT
// ===========================
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price ?? 0);
}

function updateViewButtons() {

    const gridBtn = document.getElementById("viewGrid");
    const listBtn = document.getElementById("viewList");

    gridBtn.classList.toggle("active", currentView === 'grid');
    listBtn.classList.toggle("active", currentView === 'list');
}


// ===========================
// START
// ===========================
init();