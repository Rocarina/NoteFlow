/* ==========================================
   NOTEFLOW
   GLOBAL CONFIGURATION
========================================== */

const API_URL = "http://localhost:5000/api";

let token = localStorage.getItem("token") || "";

let currentUser = null;

let notes = [];

let editingNoteId = null;


/* ==========================================
   COMMON ELEMENTS
========================================== */

const loadingOverlay = document.getElementById("loadingOverlay");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

const noteModal = document.getElementById("noteModal");

const deleteModal = document.getElementById("deleteModal");


/* ==========================================
   AXIOS CONFIGURATION
========================================== */

axios.defaults.baseURL = API_URL;

if (token) {

    axios.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;

}


/* ==========================================
   UPDATE TOKEN
========================================== */

function updateToken(newToken) {

    token = newToken;

    localStorage.setItem("token", token);

    axios.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;

}


/* ==========================================
   REMOVE TOKEN
========================================== */

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}


/* ==========================================
   PAGE DETECTION
========================================== */

const page = window.location.pathname
    .split("/")
    .pop();


console.log("Current Page:", page);

/* ==========================================
   LOGIN
========================================== */

async function loginUser(e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    if (!email || !password) {

        showToast("Please fill all fields", "error");
        return;

    }

    showLoading();

    try {

        const res = await axios.post("/auth/login", {

            email,
            password

        });

        updateToken(res.data.token);

        hideLoading();

        showToast("Login Successful!", "success");

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 1200);

    }

    catch (err) {

        hideLoading();

        showToast(

            err.response?.data?.message || "Login Failed",

            "error"

        );

    }

}


/* ==========================================
   LOGIN PAGE
========================================== */

if (page === "login.html") {

    const form = document.getElementById("loginForm");

    if (form) {

        form.addEventListener("submit", loginUser);

    }

}


/* ==========================================
   PASSWORD TOGGLE
========================================== */

const togglePassword = document.querySelector(".password-toggle");

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        const passwordInput = document.getElementById("password");

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.classList.remove("fa-eye");

            togglePassword.classList.add("fa-eye-slash");

        } else {

            passwordInput.type = "password";

            togglePassword.classList.remove("fa-eye-slash");

            togglePassword.classList.add("fa-eye");

        }

    });

}

/* ==========================================
   REGISTER
========================================== */

async function registerUser(e) {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    const confirmPassword = document.getElementById("confirmPassword").value.trim();


    if (!name || !email || !password || !confirmPassword) {

        showToast("Please fill all fields", "error");

        return;

    }


    if (password.length < 6) {

        showToast("Password must be at least 6 characters", "error");

        return;

    }


    if (password !== confirmPassword) {

        showToast("Passwords do not match", "error");

        return;

    }


    showLoading();

    try {

        const res = await axios.post("/auth/register", {

            name,
            email,
            password

        });

        updateToken(res.data.token);

        hideLoading();

        showToast("Registration Successful!", "success");

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 1200);

    }

    catch (err) {

        hideLoading();

        showToast(

            err.response?.data?.message ||

            "Registration Failed",

            "error"

        );

    }

}



/* ==========================================
   REGISTER PAGE
========================================== */

if (page === "register.html") {

    const form = document.getElementById("registerForm");

    if (form) {

        form.addEventListener("submit", registerUser);

    }

}



/* ==========================================
   PASSWORD STRENGTH
========================================== */

const passwordInput = document.getElementById("password");

const strengthFill = document.getElementById("strengthFill");

const strengthText = document.getElementById("strengthText");


if (passwordInput && strengthFill && strengthText) {

    passwordInput.addEventListener("input", () => {

        const value = passwordInput.value;

        let width = 0;

        let text = "Weak";

        if (value.length >= 6) {

            width = 40;

            text = "Weak";

        }

        if (

            value.length >= 8 &&

            /[A-Z]/.test(value)

        ) {

            width = 70;

            text = "Medium";

        }

        if (

            value.length >= 8 &&

            /[A-Z]/.test(value) &&

            /[0-9]/.test(value) &&

            /[^A-Za-z0-9]/.test(value)

        ) {

            width = 100;

            text = "Strong";

        }

        strengthFill.style.width = width + "%";

        strengthText.innerText = text;

    });

}



/* ==========================================
   CONFIRM PASSWORD
========================================== */

const confirmPasswordInput =
document.getElementById("confirmPassword");

if (confirmPasswordInput) {

    confirmPasswordInput.addEventListener("input", () => {

        if (

            confirmPasswordInput.value !==

            passwordInput.value

        ) {

            confirmPasswordInput.style.borderColor = "#EF4444";

        }

        else {

            confirmPasswordInput.style.borderColor = "#22C55E";

        }

    });

}

/* ==========================================
   AUTHENTICATION CHECK
========================================== */

function checkAuthentication() {

    const protectedPages = [
        "dashboard.html",
        "profile.html"
    ];

    if (protectedPages.includes(page) && !token) {

        window.location.href = "login.html";

    }

}


/* ==========================================
   LOAD USER PROFILE
========================================== */

async function loadUserProfile() {

    try {

        const res = await axios.get("/auth/profile");

        currentUser = res.data;

        updateProfileUI();

    }

    catch (err) {

        console.error(err);

        logout();

    }

}


/* ==========================================
   UPDATE PROFILE UI
========================================== */

function updateProfileUI() {

    const nameElements = document.querySelectorAll(".user-name");

    const emailElements = document.querySelectorAll(".user-email");

    nameElements.forEach(el => {

        el.textContent = currentUser.name;

    });

    emailElements.forEach(el => {

        el.textContent = currentUser.email;

    });

}



/* ==========================================
   LOAD NOTES
========================================== */

async function loadNotes() {

    try {

        const res = await axios.get("/notes");

        notes = res.data;

        renderNotes();

        updateDashboardStats();

    }

    catch (err) {

        console.error(err);

        showToast("Unable to load notes", "error");

    }

}



/* ==========================================
   RENDER NOTES
========================================== */

function renderNotes() {

    const container = document.getElementById("notesContainer");

    const emptyState = document.getElementById("emptyState");

    if (!container) return;

    container.innerHTML = "";

    if (notes.length === 0) {

        if (emptyState) {

            emptyState.classList.remove("hidden");

        }

        return;

    }

    if (emptyState) {

        emptyState.classList.add("hidden");

    }

    notes.forEach(note => {

        container.innerHTML += `

<div class="note-card note-${note.color || "yellow"}">

    ${note.isPinned
        ? '<div class="pin-badge"><i class="fa-solid fa-thumbtack"></i></div>'
        : ""
    }

    <h3>${note.title}</h3>

    <p>${note.description}</p>

    <div class="note-footer">

        <small>

            ${new Date(note.createdAt).toLocaleDateString()}

        </small>

        <div class="note-actions">

            <button onclick="editNote('${note._id}')">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button onclick="togglePin('${note._id}')">

                <i class="fa-solid fa-thumbtack"></i>

            </button>

            <button onclick="confirmDelete('${note._id}')">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    </div>

</div>

`;

    });

}



/* ==========================================
   DASHBOARD INITIALIZATION
========================================== */

async function initializeDashboard() {

    checkAuthentication();

    if (
        page === "dashboard.html" ||
        page === "profile.html"
    ) {

        showLoading();

        await loadUserProfile();

        await loadNotes();

        hideLoading();

    }

}


document.addEventListener(

    "DOMContentLoaded",

    initializeDashboard

);

/* ==========================================
   CREATE / UPDATE NOTE
========================================== */

async function saveNote(e) {

    e.preventDefault();

    const title = document.getElementById("noteTitle").value.trim();

    const description = document.getElementById("noteDescription").value.trim();

    const color =
        document.querySelector(
            'input[name="noteColor"]:checked'
        )?.value || "yellow";

    const isPinned =
        document.getElementById("pinNote")?.checked || false;

    if (!title || !description) {

        showToast("Please fill all fields", "error");

        return;

    }

    showLoading();

    try {

        if (editingNoteId) {

            await axios.put(`/notes/${editingNoteId}`, {

                title,
                description,
                color,
                isPinned

            });

            showToast("Note updated successfully", "success");

        } else {

            await axios.post("/notes", {

                title,
                description,
                color,
                isPinned

            });

            showToast("Note created successfully", "success");

        }

        closeNoteModal();

        await loadNotes();

    }

    catch (err) {

        console.error(err);

        showToast(

            err.response?.data?.message ||

            "Unable to save note",

            "error"

        );

    }

    finally {

        hideLoading();

    }

}



/* ==========================================
   EDIT NOTE
========================================== */

function editNote(id) {

    const note = notes.find(n => n._id === id);

    if (!note) return;

    editingNoteId = id;

    document.getElementById("noteTitle").value =
        note.title;

    document.getElementById("noteDescription").value =
        note.description;

    const colorInput = document.querySelector(
        `input[name="noteColor"][value="${note.color}"]`
    );

    if (colorInput) {

        colorInput.checked = true;

    }

    const pinCheck = document.getElementById("pinNote");

    if (pinCheck) {

        pinCheck.checked = note.isPinned;

    }

    openNoteModal();

}



/* ==========================================
   DELETE NOTE
========================================== */

let deletingNoteId = null;

function confirmDelete(id) {

    deletingNoteId = id;

    deleteModal.classList.add("active");

}



async function deleteNote() {

    if (!deletingNoteId) return;

    showLoading();

    try {

        await axios.delete(`/notes/${deletingNoteId}`);

        deleteModal.classList.remove("active");

        deletingNoteId = null;

        await loadNotes();

        showToast("Note deleted", "success");

    }

    catch (err) {

        console.error(err);

        showToast("Unable to delete note", "error");

    }

    finally {

        hideLoading();

    }

}



/* ==========================================
   PIN / UNPIN NOTE
========================================== */

async function togglePin(id) {

    const note = notes.find(n => n._id === id);

    if (!note) return;

    try {

        await axios.put(`/notes/${id}`, {

            ...note,

            isPinned: !note.isPinned

        });

        await loadNotes();

    }

    catch (err) {

        console.error(err);

        showToast("Unable to update note", "error");

    }

}



/* ==========================================
   NEW NOTE
========================================== */

function newNote() {

    editingNoteId = null;

    document.getElementById("noteForm").reset();

    openNoteModal();

}



/* ==========================================
   FORM SUBMIT
========================================== */

const noteForm =
document.getElementById("noteForm");

if (noteForm) {

    noteForm.addEventListener(

        "submit",

        saveNote

    );

}



/* ==========================================
   DELETE BUTTON
========================================== */

const deleteBtn =
document.getElementById("deleteConfirmBtn");

if (deleteBtn) {

    deleteBtn.addEventListener(

        "click",

        deleteNote

    );

}

/* ==========================================
   SEARCH NOTES
========================================== */

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const filtered = notes.filter(note =>

            note.title.toLowerCase().includes(keyword) ||

            note.description.toLowerCase().includes(keyword)

        );

        renderFilteredNotes(filtered);

    });

}



/* ==========================================
   FILTER NOTES
========================================== */

function filterNotes(color) {

    if (color === "all") {

        renderNotes();

        return;

    }

    const filtered = notes.filter(

        note => note.color === color

    );

    renderFilteredNotes(filtered);

}



/* ==========================================
   RENDER FILTERED NOTES
========================================== */

function renderFilteredNotes(list) {

    const container = document.getElementById("notesContainer");

    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <h2>No Notes Found</h2>

            <p>Try another search or create a new note.</p>

        </div>

        `;

        return;

    }

    list.forEach(note => {

        container.innerHTML += `

<div class="note-card note-${note.color || "yellow"}">

${note.isPinned
? '<div class="pin-badge"><i class="fa-solid fa-thumbtack"></i></div>'
: ""}

<h3>${note.title}</h3>

<p>${note.description}</p>

<div class="note-footer">

<small>

${new Date(note.createdAt).toLocaleDateString()}

</small>

<div class="note-actions">

<button onclick="editNote('${note._id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button onclick="togglePin('${note._id}')">

<i class="fa-solid fa-thumbtack"></i>

</button>

<button onclick="confirmDelete('${note._id}')">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</div>

</div>

`;

    });

}



/* ==========================================
   DASHBOARD STATS
========================================== */

function updateDashboardStats() {

    const total = notes.length;

    const pinned = notes.filter(

        note => note.isPinned

    ).length;

    const work = notes.filter(

        note => note.color === "blue"

    ).length;

    const personal = notes.filter(

        note => note.color === "green"

    ).length;


    document.getElementById("totalNotes").innerText = total;

    document.getElementById("pinnedNotes").innerText = pinned;

    document.getElementById("workNotes").innerText = work;

    document.getElementById("personalNotes").innerText = personal;

}



/* ==========================================
   DARK MODE
========================================== */

const darkModeToggle =
document.getElementById("darkModeToggle");

if (darkModeToggle) {

    if (

        localStorage.getItem("theme") === "dark"

    ) {

        document.body.classList.add("dark");

    }

    darkModeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (

            document.body.classList.contains("dark")

        ) {

            localStorage.setItem("theme", "dark");

        }

        else {

            localStorage.setItem("theme", "light");

        }

    });

}



/* ==========================================
   MODALS
========================================== */

function openNoteModal() {

    noteModal.classList.add("active");

}



function closeNoteModal() {

    noteModal.classList.remove("active");

    editingNoteId = null;

}



/* ==========================================
   LOADING
========================================== */

function showLoading() {

    if (loadingOverlay) {

        loadingOverlay.classList.remove("hidden");

    }

}



function hideLoading() {

    if (loadingOverlay) {

        loadingOverlay.classList.add("hidden");

    }

}



/* ==========================================
   TOAST
========================================== */

function showToast(message, type = "success") {

    if (!toast) return;

    toastMessage.innerText = message;

    const icon = toast.querySelector("i");

    if (icon) {

        if (type === "success") {

            icon.className =

            "fa-solid fa-circle-check";

        }

        else {

            icon.className =

            "fa-solid fa-circle-xmark";

        }

    }

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}



/* ==========================================
   SCROLL TOP
========================================== */

const scrollBtn =
document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    if (window.scrollY > 300) {

        scrollBtn.classList.add("show");

    }

    else {

        scrollBtn.classList.remove("show");

    }

});

if (scrollBtn) {

    scrollBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

