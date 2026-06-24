import { fetchCards } from "./api.js";
import { getToken } from "./auth.js";
import { showToast } from "./utils.js";

const BASE_URL = "http://localhost:8081";


// Cargar el perfil
async function loadProfile() {
    const token = getToken();

    try {
        const res = await fetch(`${BASE_URL}/user/profile`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error("Error al cargar el perfil:", res.status);
            return;
        }

        const user = await res.json();
        document.getElementById("currentEmail").textContent = user.email;

    } catch (error) {
        console.error("Error de red al cargar el perfil:", error);
    }
}
// Actualizar email
async function updateEmail() {
    const token = getToken();
    const userEmail = document.getElementById("newEmail").value.trim();

    if (!userEmail) {
        showToast("Introduce un correo válido.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/user/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                newEmail: userEmail
            })
        });

        if (!res.ok) {
            console.error("Error al actualizar el email:", res.status);
            showToast("No se pudo actualizar el correo.");
            return;
        }

        // El backend devuelve el nuevo token como texto plano, no JSON
        const newToken = await res.text();
        localStorage.setItem("authToken", newToken);

        showToast("Correo actualizado correctamente.");
        loadProfile();

    } catch (error) {
        console.error("Error de red al actualizar el email:", error);
        showToast("Error de conexión. Inténtalo de nuevo.");
    }
}
// Actualizar contraseña
async function updatePassword() {
    const token = getToken();
    const oldPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!oldPassword) {
        showToast("Introduce tu contraseña actual.");
        return;
    }
    if(!newPassword || !confirmPassword){
        showToast("Introduce la nueva contraseña");
    }

    if (newPassword !== confirmPassword) {
        showToast("Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/user/password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword
            })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            console.error("Error al actualizar la contraseña:", res.status, errorMessage);
            showToast(errorMessage);
            return;
        }

        const newToken = await res.text();
        localStorage.setItem("authToken", newToken);

        showToast("Contraseña actualizada correctamente.");

    } catch (error) {
        console.error("Error de red al actualizar la contraseña:", error);
        showToast("Error al cambiar la contraseña");
    }
}

async function deleteAccount(){
    const confirmed = confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    const token = getToken();

    try {
        const res = await fetch(`${BASE_URL}/user/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
        });

        if (!res.ok) {
            console.error("Error al eliminar la cuenta:", res.status);
            showToast("No se pudo eliminar la cuenta.");
            return;
        }

        localStorage.removeItem("authToken");
        showToast("Cuenta eliminada correctamente.");
        window.location.href = "/index.html";

    } catch (error) {
        console.error("Error de red al eliminar la cuenta:", error);
        showToast("Error de conexión. Inténtalo de nuevo.");
    }
}

// LISTENER ACTUALIZAR CORREO
document.getElementById("updateEmailBtn").addEventListener("click", async() => {
    await updateEmail();
});

// LISTENER ACTUALIZAR CONTRASEÑA
document.getElementById("updatePasswordBtn").addEventListener("click", async() => {
    await updatePassword();
});

// LISTENER PARA ELIMINAR CUENTA
document.getElementById("deleteAccountBtn").addEventListener("click", async() => {
    await deleteAccount();
});


loadProfile();