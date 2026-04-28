// pagination.js

export function setupPagination(prevBtn, nextBtn, pageDisplay, totalPagesDisplay, getPageCallback) {
    prevBtn.addEventListener("click", () => {
        getPageCallback("prev");
    });

    nextBtn.addEventListener("click", () => {
        getPageCallback("next");
    });

    return function updatePagination(currentPage, totalCards, size) {
        const totalPages = Math.ceil(totalCards / size);

        pageDisplay.textContent = currentPage;
        totalPagesDisplay.textContent = `de ${totalPages}`;

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }
}