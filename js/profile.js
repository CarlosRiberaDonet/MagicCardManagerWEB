

// Cargar el perfil del usuario
async function loadProfile() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8081/user/profile", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const user = await res.json();

    document.getElementById("currentEmail").textContent = user.email;
}


// Actualizar el email del usuario
async function updateEmail() {
    const token = localStorage.getItem("token");
    const newEmail = document.getElementById("newEmail").value;

    await fetch("http://localhost:8081/user/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            newEmail: newEmail
        })
    });
}