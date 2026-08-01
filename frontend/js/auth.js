const API_URL = "https://noteflow-yuh2.onrender.com/api";

// ================================
// Login
// ================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {

            const response = await fetch(`${API_URL}/auth/login`, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email,
                    password

                })

            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("token", data.token);

                showToast("Login Successful!");

                setTimeout(() => {

                    window.location.href = "dashboard.html";

                }, 1200);

            }

            else {

                showToast(data.message || "Login Failed", "error");

            }

        }

        catch (error) {

            console.error(error);

            showToast("Server Error", "error");

        }

    });

}



// ================================
// Register
// ================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {

            const response = await fetch(`${API_URL}/auth/register`, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    name,
                    email,
                    password

                })

            });

            const data = await response.json();

            if (response.ok) {

                showToast("Registration Successful!");

                setTimeout(() => {

                    window.location.href = "login.html";

                }, 1200);

            }

            else {

                showToast(data.message || "Registration Failed", "error");

            }

        }

        catch (error) {

            console.error(error);

            showToast("Server Error", "error");

        }

    });

}



// ================================
// Password Visibility Toggle
// ================================

const passwordField = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (passwordField && togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordField.type === "password") {

            passwordField.type = "text";

            togglePassword.classList.remove("fa-eye");

            togglePassword.classList.add("fa-eye-slash");

        }

        else {

            passwordField.type = "password";

            togglePassword.classList.remove("fa-eye-slash");

            togglePassword.classList.add("fa-eye");

        }

    });

}