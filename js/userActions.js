
    import {addToCollection, removeFromCollection} from "./api.js";
   

    // Llamada a la api para añadir carta de la colección
    export function addCardToCollection(card) {
        const token = localStorage.getItem('authToken');
        if(token){
            addToCollection(card, token);
        }
    }
    // Llamada a la api para eliminar carta de la colección
    export function removeCardFromCollection(card) {
        const token = localStorage.getItem('authToken');
        if(token){
            removeFromCollection(card, token);
        }
    }