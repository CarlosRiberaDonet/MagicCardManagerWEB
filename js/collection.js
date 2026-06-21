// collection.js

import { getToken } from './auth.js';
import { loadCollection } from "./apiUser.js";
import { getFlag, getCondition } from './utils.js';


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

// Precio actual normalizado (trend > low > avg > 0)
function getCurrentPrice(item) {
    const price = item?.card?.cardPrice;

    return price?.trend
        ?? price?.low
        ?? price?.avg
        ?? 0;
}

// Ganancia total por carta (precio actual - precio compra) * cantidad
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

    // Cabecera de la lista.
    // IMPORTANTE: cada <span> lleva la misma clase que su celda
    // correspondiente en las filas (list-name, list-rarity, etc.)
    // para que el CSS pueda alinear cabecera y filas de forma idéntica.
    const header = document.createElement("div");
    header.className = "collection-list-header";
    header.innerHTML = `
        <span></span>
        <span class="list-name">Nombre</span>
        <span class="list-edition">Edición</span>
        <span class="list-rarity">Rareza</span>
        <span class="list-number">#</span>
        <span class="list-lang">Idioma</span>
        <span class="list-condition">Cond.</span>
        <span class="list-qty">Cant.</span>
        <span class="list-purchase">Compra</span>
        <span class="list-current">V.Actual</span>
        <span class="list-profit">Ganancia</span>
    `;
    container.appendChild(header);

    cards.forEach(item => {

        const card = item?.card;
        const price = getCurrentPrice(item);
        const profit = calcProfit(item);

        const row = document.createElement("div");
        row.className = "collection-list-item";

        // Cada celda lleva su clase para alinearse exactamente
        // bajo su columna del header (10 columnas en total).
        row.innerHTML = `
            <div class="card-thumb">
                📷
                <img src="${card?.imageUrl ?? ''}" class="card-tooltip-img">
            </div>

            <span class="list-name">${card?.name ?? '—'}</span>

            <div class="list-edition">
                <img src="${card?.iconSvgUri ?? ''}" class="set-icon" title="${card?.setName ?? ''}">
            </div>

            <span class="list-rarity">${card?.rarity ?? '—'}</span>

            <span class="list-number">${card?.collectorNumber ?? '—'}</span>

            <span class="list-lang">${getFlag(card?.lang) ?? '—'}</span>

            <span class="list-condition condition-badge ${getCondition(item?.cardCondition)}">${item?.cardCondition ?? '—'}</span>

            <span class="list-qty">${item?.quantity ?? 1}</span>

            <span class="list-purchase">${formatPrice(item?.purchasePrice ?? 0)}</span>

            <span class="list-current">${price ? formatPrice(price) : 'N/A'}</span>

            <span class="list-profit ${profit >= 0 ? 'positive' : 'negative'}">
                ${formatPrice(profit)}
            </span>
        `;

        row.addEventListener('click', () => {
            window.open(
                `cardDetail.html?cardId=${card.id}`,
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

            <span class="list-condition condition-badge ${getCondition(item?.cardCondition)}">${item?.cardCondition ?? '—'}</span>

            <p>${getFlag(card?.lang) ?? '—'}</p>

            <p>${price ? formatPrice(price) : 'N/A'}</p>

            <p>${item?.quantity ?? 1}x</p>
        `;

        el.addEventListener('click', () => {
            window.open(`cardDetail.html?cardId=${card.id}`, "_blank");
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