const BASE_URL = "http://localhost:8081/auth";

import { getToken } from "./auth.js";

// Método para registrar un nuevo usuario
export async function registerUser(email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (response.status === 409) {
        throw new Error("USER_EXISTS");
    }

    if (!response.ok) {
        throw new Error("REGISTER_ERROR");
    }

    return true;
}

// LOGIN
export async function loginUser(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error("Error al iniciar sesión");
    return await response.text();
}

/**
 * Wrapper global de fetch con manejo automático de:
 * - Authorization header
 * - Expiración de token (401)
 */
export async function apiFetch(url, options = {}) {

    const token = getToken();

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // ===========================
    // 401 = token inválido o expirado
    // ===========================
    if (response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/index.html";
        return;
    }

    return response;
}