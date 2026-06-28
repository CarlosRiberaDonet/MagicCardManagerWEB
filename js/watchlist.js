// watchlist.js

import { getToken } from './auth.js';
import { loadWatchlist, addToCollection, removeFromWatchlist } from './apiUser.js';
import { getCondition, showToast } from './utils.js';

// ===========================
// ESTADO GLOBAL
// ===========================
let allItems = [];
let currentView = 'list';
let pendingMoveItem = null; // ítem en proceso de moverse a la colección (mientras el modal está abierto)

// ===========================
// INIT
// ===========================
async function init() {
    try {
        allItems = await loadWatchlist(getToken());
        renderStats();
        loadEditions();
        setupFilters();
        setupViewToggle();
        setupMoveModal();
        renderList(allItems);

    } catch (error) {
        console.error("Error al cargar watchlist:", error);
        document.getElementById("watchlistContainer").innerHTML =
            "<p>Error al cargar watchlist.</p>";
    }
}

// ===========================
// HELPERS
// ===========================

// IMPORTANTE: el backend devuelve los datos de la carta bajo
// "item.scryfallCardDTO" (no "item.card"). Además, scryfallCardDTO.id
// llega SIEMPRE null — el identificador real de la carta está en
// "item.cardId", a nivel raíz del objeto. Por eso, en todo el archivo,
// para el ID usamos item.cardId, y para nombre/imagen/set usamos
// item.scryfallCardDTO.

// Precio actual normalizado (trend > low > avg > 0)
function getCurrentPrice(item) {
    const price = item?.scryfallCardDTO?.cardPrice;
    return price?.trend ?? price?.low ?? price?.avg ?? 0;
}

// Diferencia contra el último precio guardado al añadir a la watchlist
function calcDelta(item) {
    const current = getCurrentPrice(item);
    const last = item?.lastPrice ?? 0;
    return current - last;
}

function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price ?? 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

// ===========================
// ESTADÍSTICAS
// ===========================
function renderStats() {

    const totalCards = allItems.length;

    const totalValue = allItems.reduce(
        (sum, i) => sum + getCurrentPrice(i),
        0
    );

    const totalProfit = allItems.reduce(
        (sum, i) => sum + calcDelta(i),
        0
    );

    const cardsEl = document.getElementById("totalCards");
    const valueEl = document.getElementById("totalValue");
    const profitEl = document.getElementById("totalProfit");

    if (cardsEl) cardsEl.textContent = totalCards;
    if (valueEl) valueEl.textContent = formatPrice(totalValue);

    if (profitEl) {
        profitEl.textContent = formatPrice(totalProfit);
        profitEl.style.color = totalProfit >= 0 ? '#4caf50' : '#e88a8a';
    }
}

// ===========================
// EDICIONES (filtro)
// ===========================
function loadEditions() {
    const select = document.getElementById("wlFilterSet");
    select.innerHTML = '<option value="">Set</option>';

    const sets = new Set(allItems.map(i => i?.scryfallCardDTO?.setName));

    sets.forEach(set => {
        if (!set) return;

        const opt = document.createElement("option");
        opt.value = set;
        opt.textContent = set;
        select.appendChild(opt);
    });
}

// ===========================
// RENDER LIST
// ===========================
function renderList(items = allItems) {

    const container = document.getElementById("watchlistContainer");
    container.className = 'watchlist-list';
    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = "<p>No hay cartas en seguimiento.</p>";
        return;
    }

    const header = document.createElement("div");
    header.className = "watchlist-list-header";
    header.innerHTML = `
        <span></span>
        <span class="list-name">Nombre</span>
        <span class="list-edition">Edición</span>
        <span class="list-condition">Cond.</span>
        <span class="list-foil">Foil</span>
        <span class="list-last">Últ. precio</span>
        <span class="list-current">Actual</span>
        <span class="list-delta">Diferencia</span>
        <span class="list-date">Fecha</span>
        <span></span>
    `;
    container.appendChild(header);

    items.forEach(item => {

        // "card" aquí es item.scryfallCardDTO (nombre, imagen, set, icono...)
        const card = item?.scryfallCardDTO;
        const current = getCurrentPrice(item);
        const delta = calcDelta(item);

        const row = document.createElement("div");
        row.className = "watchlist-list-item";

        row.innerHTML = `
            <div class="card-thumb">
                📷
                <img src="${card?.imageUrl ?? ''}" class="card-tooltip-img">
            </div>

            <span class="list-name">${card?.name ?? '—'}</span>

            <div class="list-edition">
                <img src="${card?.iconSvgUri ?? ''}" class="set-icon" title="${card?.setName ?? ''}">
            </div>

            <div class="list-condition">
                <span class="condition-badge ${getCondition(item?.condition)}">
                    ${(item?.condition ?? '—').toUpperCase()}
                </span>
            </div>

            <div class="list-foil">
                <span class="foil-badge ${item?.foil ? 'is-foil' : ''}">
                    ${item?.foil ? '✦ Foil' : 'Normal'}
                </span>
            </div>

            <span class="list-last">${formatPrice(item?.lastPrice ?? 0)}</span>

            <span class="list-current">${formatPrice(current)}</span>

            <span class="list-delta ${delta >= 0 ? 'positive' : 'negative'}">
                ${formatPrice(delta)}
            </span>

            <span class="list-date">${formatDate(item?.addedAt)}</span>

            <div class="watch-actions">
                <button class="action-move" title="Mover a colección">
                    ↦<span class="btn-label"> Mover</span>
                </button>
                <button class="action-remove danger" title="Quitar de watchlist">
                    ✕<span class="btn-label"> Quitar</span>
                </button>
            </div>
        `;

        row.querySelector('.action-move')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openMoveModal(item);
        });

        row.querySelector('.action-remove')?.addEventListener('click', (e) => {
            e.stopPropagation();
            removeItemFromWatchlist(item);
        });

        // El id real de la carta es item.cardId (NO card.id, que siempre es null)
        row.addEventListener('click', () => {
            window.open(`cardDetail.html?cardId=${item.cardId}`, "_blank");
        });

        container.appendChild(row);
    });
}

// ===========================
// RENDER GRID
// ===========================
function renderGrid(items = allItems) {

    const container = document.getElementById("watchlistContainer");
    container.className = 'watchlist-grid';
    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = "<p>No hay cartas en seguimiento.</p>";
        return;
    }

    items.forEach(item => {

        const card = item?.scryfallCardDTO;
        const current = getCurrentPrice(item);
        const delta = calcDelta(item);

        const el = document.createElement("div");
        el.className = "watchlist-card";

        el.innerHTML = `
            <img src="${card?.imageUrl ?? ''}" class="card-img">

            <h3>${card?.name ?? '—'}</h3>

            <div class="badges-row">
                <span class="condition-badge ${getCondition(item?.condition)}">
                    ${(item?.condition ?? '—').toUpperCase()}
                </span>
                <span class="foil-badge ${item?.foil ? 'is-foil' : ''}">
                    ${item?.foil ? '✦ Foil' : 'Normal'}
                </span>
            </div>

            <div class="prices-row">
                <span>Últ.: ${formatPrice(item?.lastPrice ?? 0)}</span>
                <span class="list-delta ${delta >= 0 ? 'positive' : 'negative'}">
                    ${formatPrice(delta)}
                </span>
            </div>

            <div class="prices-row">
                <span>Actual</span>
                <span class="list-current">${formatPrice(current)}</span>
            </div>

            <div class="watch-actions">
                <button class="action-move" title="Mover a colección">↦<span class="btn-label"> Mover</span></button>
                <button class="action-remove danger" title="Quitar de watchlist">✕<span class="btn-label"> Quitar</span></button>
            </div>
        `;

        el.querySelector('.action-move')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openMoveModal(item);
        });

        el.querySelector('.action-remove')?.addEventListener('click', (e) => {
            e.stopPropagation();
            removeItemFromWatchlist(item);
        });

        el.addEventListener('click', () => {
            window.open(`cardDetail.html?cardId=${item.cardId}`, "_blank");
        });

        container.appendChild(el);
    });
}

// ===========================
// FILTROS
// ===========================
function setupFilters() {

    const inputs = [
        "wlFilterSet",
        "wlFilterCondition",
        "wlFilterFoil",
        "wlFilterSort",
        "wlSearch"
    ];

    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener("input", () => {
            const filtered = applyFilters();
            currentView === 'list'
                ? renderList(filtered)
                : renderGrid(filtered);
        });
    });

    document.getElementById("wlClearFilters")?.addEventListener("click", () => {
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        currentView === 'list'
            ? renderList(allItems)
            : renderGrid(allItems);
    });
}

function applyFilters() {

    const set = document.getElementById("wlFilterSet")?.value;
    const condition = document.getElementById("wlFilterCondition")?.value;
    const foil = document.getElementById("wlFilterFoil")?.value;
    const sort = document.getElementById("wlFilterSort")?.value;
    const search = document.getElementById("wlSearch")?.value?.toLowerCase();

    let filtered = [...allItems];

    if (set) filtered = filtered.filter(i => i?.scryfallCardDTO?.setName === set);

    if (condition) {
        filtered = filtered.filter(i => (i?.condition ?? '').toUpperCase() === condition);
    }

    if (foil) {
        filtered = filtered.filter(i => String(i?.foil) === foil);
    }

    if (search) {
        filtered = filtered.filter(i =>
            i?.scryfallCardDTO?.name?.toLowerCase().includes(search)
        );
    }

    if (sort === 'price_desc')
        filtered.sort((a, b) => getCurrentPrice(b) - getCurrentPrice(a));

    if (sort === 'price_asc')
        filtered.sort((a, b) => getCurrentPrice(a) - getCurrentPrice(b));

    if (sort === 'profit_desc')
        filtered.sort((a, b) => calcDelta(b) - calcDelta(a));

    if (sort === 'profit_asc')
        filtered.sort((a, b) => calcDelta(a) - calcDelta(b));

    if (sort === 'name_asc')
        filtered.sort((a, b) =>
            (a?.scryfallCardDTO?.name ?? '').localeCompare(b?.scryfallCardDTO?.name ?? '')
        );

    return filtered;
}

// ===========================
// VIEW SWITCH
// ===========================
function setupViewToggle() {

    document.getElementById("viewList")?.addEventListener("click", () => {
        currentView = 'list';
        renderList(applyFilters());
        updateViewButtons();
    });

    document.getElementById("viewGrid")?.addEventListener("click", () => {
        currentView = 'grid';
        renderGrid(applyFilters());
        updateViewButtons();
    });
}

function updateViewButtons() {
    document.getElementById("viewGrid")?.classList.toggle("active", currentView === 'grid');
    document.getElementById("viewList")?.classList.toggle("active", currentView === 'list');
}

// ===========================
// MODAL — Mover a colección
// ===========================
function setupMoveModal() {

    document.getElementById("moveModalCancel")?.addEventListener("click", closeMoveModal);

    document.getElementById("moveModalConfirm")?.addEventListener("click", async () => {
        if (!pendingMoveItem) return;

        const purchasePrice = parseFloat(document.getElementById("movePurchasePrice").value);
        const quantity = parseInt(document.getElementById("moveQuantity").value, 10);

        if (isNaN(purchasePrice) || purchasePrice < 0) {
            showToast("Introduce un precio de compra válido.");
            return;
        }

        if (isNaN(quantity) || quantity < 1) {
            showToast("Introduce una cantidad válida.");
            return;
        }

        await moveToCollection(pendingMoveItem, purchasePrice, quantity);
    });
}

function openMoveModal(item) {
    pendingMoveItem = item;

    document.getElementById("moveModalCardName").textContent = item?.scryfallCardDTO?.name ?? '—';
    document.getElementById("movePurchasePrice").value = getCurrentPrice(item).toFixed(2);
    document.getElementById("moveQuantity").value = 1;

    document.getElementById("moveModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeMoveModal() {
    pendingMoveItem = null;
    document.getElementById("moveModal").classList.remove("active");
    document.body.style.overflow = "";
}

// ===========================
// ACCIONES: mover / quitar
// ===========================
async function moveToCollection(item, purchasePrice, quantity) {

    const token = getToken();
    const card = item?.scryfallCardDTO;

    try {
        // addToCollection (apiUser.js) espera card.id, card.purchasePrice,
        // card.quantity, card.condition, card.foil — usamos item.cardId
        // como id real, NO card.id (que siempre llega null del backend).
        await addToCollection({
            id: item.cardId,
            purchasePrice,
            quantity,
            condition: item.condition,
            foil: item.foil
        }, token);
    } catch (error) {
        console.error("Error al añadir la carta a la colección:", error);
        showToast("No se pudo añadir la carta a tu colección.");
        return;
    }

    try {
        // removeFromWatchlist (apiUser.js) espera card.cardPrice.low.
        // Como scryfallCardDTO.cardPrice puede llegar null (precio aún
        // no calculado), usamos item.lastPrice como respaldo para que
        // no explote al intentar leer ".low" de null.
        await removeFromWatchlist({
            id: item.cardId,
            cardPrice: card?.cardPrice ?? { low: item.lastPrice ?? 0 },
            condition: item.condition,
            foil: item.foil
        }, token);
    } catch (error) {
        // Caso límite: se añadió a la colección, pero no se pudo quitar de la watchlist.
        // Avisamos del estado real en vez de fingir que todo fue bien.
        console.error("La carta se añadió a la colección pero no se pudo quitar de la watchlist:", error);
        showToast("Carta añadida a tu colección, pero no se pudo quitar de la watchlist.");
        closeMoveModal();
        return;
    }

    allItems = allItems.filter(i => i !== item);
    renderStats();
    loadEditions();

    currentView === 'list'
        ? renderList(applyFilters())
        : renderGrid(applyFilters());

    closeMoveModal();
    showToast("Carta movida a tu colección correctamente.");
}

async function removeItemFromWatchlist(item) {

    const card = item?.scryfallCardDTO;

    const confirmed = confirm(`¿Quitar "${card?.name ?? 'esta carta'}" de tu watchlist?`);
    if (!confirmed) return;

    const token = getToken();

    try {
        await removeFromWatchlist({
            id: item.cardId,
            cardPrice: card?.cardPrice ?? { low: item.lastPrice ?? 0 },
            condition: item.condition,
            foil: item.foil
        }, token);

        allItems = allItems.filter(i => i !== item);
        renderStats();
        loadEditions();

        currentView === 'list'
            ? renderList(applyFilters())
            : renderGrid(applyFilters());

        showToast("Carta eliminada de tu watchlist.");

    } catch (error) {
        console.error("Error al eliminar de la watchlist:", error);
        showToast("No se pudo eliminar la carta de la watchlist.");
    }
}

// ===========================
// START
// ===========================
init();