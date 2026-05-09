import {addToCollection, removeFromCollection, addToWatchlist, removeFromWatchlist, isInCollection} from "./apiUser.js";
   
// Token de autenticación
function getToken() {
    return localStorage.getItem('authToken');
}

    // Llamada a la api para añadir carta de la colección
    export function addCardToCollection(card) {
        const token = getToken();
        if(token){
            return addToCollection(card, token);
        }
    }

    // Llamada a la api para eliminar carta de la colección
    export function removeCardFromCollection(card) {
        const token = getToken();
        if(token){
            return removeFromCollection(card, token);
        }
    }

    // Llamada a la api para añadir a la lista de seguimiento (watchlist)
    export function addCardToWatchlist(card) {
        const token = getToken();
        if(token){
            return addToWatchlist(card, token);
        }
    }

    // Llamada a la api para eliminar carta de la lista de seguimiento (watchlist)
    export function removeCardFromWatchlist(card) {
        const token = getToken();
        if(token){
            return removeFromWatchlist(card, token);
        }
    }

    // Llamada a la api para comprobar si una carta está en la colección del usuario
    export function isCardInCollection(cardId) {
        const token = getToken();
        if(token){
            return isInCollection(cardId, token);
        }
    }