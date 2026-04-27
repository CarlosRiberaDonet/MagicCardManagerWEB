// api.js

const BASE_URL = "http://localhost:8081/cards";

export async function fetchCards(name, page, size) {
    const url = `${BASE_URL}/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`;
    const response = await fetch(url);
    console.log("Buscando:", name);
    console.log("URL:", url);
    if (!response.ok) throw new Error("Error al obtener cartas");
    return await response.json(); // devuelve CardPageDTO
}