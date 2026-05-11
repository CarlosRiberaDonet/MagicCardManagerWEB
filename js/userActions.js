import * as apiUser from "./apiUser.js";
   
// Token de autenticación
function getToken() {
    return localStorage.getItem('authToken');
}

    // Llamada a la api para añadir carta de la colección
    export function addCardToCollection(card) {
        const token = getToken();
        if(token){
            return apiUser.addToCollection(card, token);
        }
    }

    // Llamada a la api para eliminar carta de la colección
    export function removeCardFromCollection(card) {
        const token = getToken();
        if(token){
            return apiUser.removeFromCollection(card, token);
        }
    }

    // Llamada a la api para añadir a la lista de seguimiento (watchlist)
    export function addCardToWatchlist(card) {
        const token = getToken();
        if(token){
            return apiUser.addToWatchlist(card, token);
        }
    }

    // Llamada a la api para eliminar carta de la lista de seguimiento (watchlist)
    export function removeCardFromWatchlist(card) {
        const token = getToken();
        if(token){
            return apiUser.removeFromWatchlist(card, token);
        }
    }

    // Llamada a la api para comprobar si una carta está en la colección del usuario
    export function isCardInCollection(cardId) {
        const token = getToken();
        if(token){
            return apiUser.isInCollection(cardId, token);
        }
    }

    export function isCardInWatchlist(cardId) {
        const token = getToken();
        if(token){
            return apiUser.isInWatchlist(cardId, token);
        }
    }