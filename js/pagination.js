// pagination.js

export function setupPagination(prevBtn, nextBtn, pageDisplay, getPageCallback) {
    prevBtn.addEventListener("click", () => {
        getPageCallback("prev");
    });

    nextBtn.addEventListener("click", () => {
        getPageCallback("next");
    });

    return function updatePagination(currentPage, totalCards, size) {
        pageDisplay.textContent = currentPage;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage * size >= totalCards;
    }
}