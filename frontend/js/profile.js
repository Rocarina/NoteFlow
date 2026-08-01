const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// Elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const profileForm = document.getElementById("profileForm");
const logoutBtn = document.getElementById("logoutBtn");

async function loadProfile() {

    try {

        const response = await fetch(`${API_URL}/auth/profile`, {

            method: "GET",

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        const data = await response.json();

        if (!response.ok) {

            showToast(data.message || "Failed to load profile", "error");

            return;

        }

        nameInput.value = data.name;
        emailInput.value = data.email;

    }

    catch (error) {

        console.error(error);

        showToast("Server Error", "error");

    }

}

if (profileForm) {

    profileForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = nameInput.value.trim();

        try {

            const response = await fetch(`${API_URL}/auth/profile`, {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    name

                })

            });

            const data = await response.json();

            if (response.ok) {

                showToast("Profile Updated Successfully");

            }

            else {

                showToast(data.message || "Update Failed", "error");

            }

        }

        catch (error) {

            console.error(error);

            showToast("Server Error", "error");

        }

    });

}


if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");

        showToast("Logged Out");

        setTimeout(() => {

            window.location.href = "login.html";

        }, 800);

    });

}

loadProfile();