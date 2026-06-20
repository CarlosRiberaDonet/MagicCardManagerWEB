import * as apiUser from "./apiUser.js";
import * as auth from "./auth.js";
   
    // Abre modal para añadir la carta a la colección
    export function addCardToCollection(card) {
        const token = auth.getToken();
        if(!token){
            return;
        }
        return apiUser.addToCollection(card, token);
    }

    // Llamada a la api para eliminar carta de la colección
    export function removeCardFromCollection(card) {
        const token = auth.getToken();
        if(token){
            return apiUser.removeFromCollection(card, token);
        }
    }

    // Llamada a la api para añadir a la lista de seguimiento (watchlist)
    export function addCardToWatchlist(card) {
        const token = auth.getToken();
        if(!token){
            return;
        }
        return apiUser.addToWatchlist(card, token);
    }

    // Llamada a la api para eliminar carta de la lista de seguimiento (watchlist)
    export function removeCardFromWatchlist(card) {
        const token = auth.getToken();
        if(token){
            return apiUser.removeFromWatchlist(card, token);
        }
    }

    // Llamada a la api para comprobar si una carta está en la colección del usuario
    export function isCardInCollection(cardId) {
        const token = auth.getToken();
        if(token){
            return apiUser.isInCollection(cardId, token);
        }
    }

    export function isCardInWatchlist(cardId) {
        const token = auth.getToken();
        if(token){
            return apiUser.isInWatchlist(cardId, token);
        }
    }

 

   export function closePriceModal() {
    const modal = document.getElementById("priceModal");
    if (!modal) return;

    modal.classList.remove("active");
    document.body.style.overflow = "";
    modal.dataset.card = "";
}