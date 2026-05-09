const BASE_URL = "http://localhost:8081/auth";

// Método para registrar un nuevo usuario
export async function registerUser(name, email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) throw new Error("Error al registrar usuario");
    return await response.text();
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