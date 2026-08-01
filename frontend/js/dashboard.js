const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const notesContainer = document.getElementById("notesContainer");
const emptyState = document.getElementById("emptyState");

const noteModal = document.getElementById("noteModal");
const deleteModal = document.getElementById("deleteModal");

const noteForm = document.getElementById("noteForm");

const newNoteBtn = document.getElementById("newNoteBtn");
const floatingAddBtn = document.getElementById("floatingAddBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const closeModal = document.getElementById("closeModal");

const logoutBtn = document.getElementById("logoutBtn");

const searchInput = document.getElementById("searchInput");

let notes = [];
let deleteId = null;
let editingId = null;


// ================================
// Toast
// ================================

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.className = `toast show ${type}`;

    setTimeout(() => {

        toast.className = "toast";

    }, 3000);

}


// ================================
// Note Modal
// ================================

function openModal() {

    noteModal.classList.add("active");

}

function closeNoteModal() {

    noteModal.classList.remove("active");

    noteForm.reset();

    editingId = null;

}


// ================================
// Delete Modal
// ================================

function openDeleteModal(id) {

    deleteId = id;

    deleteModal.classList.add("active");

}

function closeDeleteModal() {

    deleteModal.classList.remove("active");

    deleteId = null;

}


// ================================
// Buttons
// ================================

newNoteBtn.onclick = openModal;

floatingAddBtn.onclick = openModal;

if (emptyAddBtn) {

    emptyAddBtn.onclick = openModal;

}

closeModal.onclick = closeNoteModal;

document.getElementById("cancelDelete").onclick = closeDeleteModal;


// ================================
// Logout
// ================================

logoutBtn.onclick = () => {

    localStorage.removeItem("token");

    showToast("Logged out successfully!");

    setTimeout(() => {

        window.location.href = "login.html";

    }, 800);

};


// ================================
// Load Profile
// ================================

async function loadProfile() {

    try {

        const res = await fetch(API_URL + "/auth/profile", {

            headers: {

                Authorization: "Bearer " + token

            }

        });

        const data = await res.json();

        if (!res.ok) {

            showToast(data.message || "Unable to load profile.", "error");

            return;

        }

        document.getElementById("userName").textContent = data.name;

        document.getElementById("welcomeName").textContent = data.name;

    }

    catch (err) {

        console.error(err);

        showToast("Server Error", "error");

    }

}

// ================================
// Fetch Notes
// ================================

async function fetchNotes() {

    try {

        const res = await fetch(API_URL + "/notes", {

            headers: {

                Authorization: "Bearer " + token

            }

        });

        const data = await res.json();

        if (!res.ok) {

            showToast(data.message || "Unable to load notes.", "error");

            return;

        }

        notes = data;

        renderNotes(notes);

        updateStats();

    }

    catch (err) {

        console.error(err);

        showToast("Unable to load notes.", "error");

    }

}


// ================================
// Render Notes
// ================================

function renderNotes(data) {

    notesContainer.innerHTML = "";

    if (!data.length) {

        emptyState.style.display = "flex";

        notesContainer.style.display = "none";

        return;

    }

    emptyState.style.display = "none";

    notesContainer.style.display = "grid";

    data.forEach(note => {

        const card = document.createElement("div");

        card.className = "note-card";

        card.style.setProperty("--note-color", note.color || "#6C63FF");

        card.innerHTML = `

            <div class="note-top">

                <span class="note-category">

                    ${note.category}

                </span>

                <button
                    class="pin-btn"
                    onclick="togglePin('${note._id}')">

                    <i class="fa-solid fa-thumbtack"></i>

                </button>

            </div>

            <h3 class="note-title">

                ${note.title}

            </h3>

            <p class="note-content">

                ${note.content}

            </p>

            <div class="note-footer">

                <small>

                    ${new Date(note.createdAt).toLocaleDateString()}

                </small>

                <div class="note-actions">

                    <button
                        class="edit-btn"
                        onclick="editNote('${note._id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="delete-btn"
                        onclick="openDeleteModal('${note._id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

        `;

        notesContainer.appendChild(card);

    });

}


// ================================
// Dashboard Statistics
// ================================

function updateStats() {

    document.getElementById("totalNotes").textContent = notes.length;

    document.getElementById("pinnedNotes").textContent =
        notes.filter(note => note.pinned).length;

    document.getElementById("categoryCount").textContent =
        [...new Set(notes.map(note => note.category))].length;

    document.getElementById("recentNotes").textContent =
        notes.slice(0, 5).length;

}


// ================================
// Search Notes
// ================================

searchInput.addEventListener("input", function () {

    const keyword = this.value.trim().toLowerCase();

    if (!keyword) {

        renderNotes(notes);

        return;

    }

    const filtered = notes.filter(note =>

        note.title.toLowerCase().includes(keyword) ||

        note.content.toLowerCase().includes(keyword) ||

        note.category.toLowerCase().includes(keyword)

    );

    renderNotes(filtered);

});

// ================================
// Create / Update Note
// ================================

noteForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const noteData = {

        title: document.getElementById("title").value.trim(),

        content: document.getElementById("content").value.trim(),

        category: document.getElementById("category").value,

        color: document.getElementById("color").value

    };

    if (!noteData.title || !noteData.content) {

        showToast("Please fill all required fields.", "error");

        return;

    }

    try {

        let url = API_URL + "/notes";
        let method = "POST";

        if (editingId) {

            url = API_URL + "/notes/" + editingId;
            method = "PUT";

        }

        const res = await fetch(url, {

            method,

            headers: {

                "Content-Type": "application/json",

                Authorization: "Bearer " + token

            },

            body: JSON.stringify(noteData)

        });

        const data = await res.json();

        if (!res.ok) {

            showToast(data.message || "Unable to save note.", "error");

            return;

        }

        showToast(

            editingId

                ? "Note updated successfully!"

                : "Note created successfully!"

        );

        closeNoteModal();

        fetchNotes();

    }

    catch (err) {

        console.error(err);

        showToast("Server Error", "error");

    }

});


// ================================
// Edit Note
// ================================

function editNote(id) {

    const note = notes.find(n => n._id === id);

    if (!note) return;

    editingId = id;

    document.getElementById("modalTitle").textContent = "Edit Note";

    document.getElementById("title").value = note.title;

    document.getElementById("content").value = note.content;

    document.getElementById("category").value = note.category;

    document.getElementById("color").value = note.color || "#6C63FF";

    openModal();

}


// ================================
// Delete Note
// ================================

document

    .getElementById("confirmDelete")

    .addEventListener("click", async () => {

        if (!deleteId) return;

        try {

            const res = await fetch(

                API_URL + "/notes/" + deleteId,

                {

                    method: "DELETE",

                    headers: {

                        Authorization: "Bearer " + token

                    }

                }

            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {

                showToast(data.message || "Delete failed.", "error");

                return;

            }

            showToast("Note deleted successfully!");

            closeDeleteModal();

            fetchNotes();

        }

        catch (err) {

            console.error(err);

            showToast("Server Error", "error");

        }

    });


// ================================
// Pin / Unpin Note
// ================================

async function togglePin(id) {

    try {

        const res = await fetch(

            API_URL + "/notes/pin/" + id,

            {

                method: "PATCH",

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {

            showToast(data.message || "Unable to update note.", "error");

            return;

        }

        showToast("Note updated successfully!");

        fetchNotes();

    }

    catch (err) {

        console.error(err);

        showToast("Server Error", "error");

    }

}

// ================================
// Category Filter
// ================================

document.querySelectorAll(".category-chip").forEach(chip => {

    chip.addEventListener("click", () => {

        document.querySelectorAll(".category-chip").forEach(c =>

            c.classList.remove("active")

        );

        chip.classList.add("active");

        const category = chip.dataset.category;

        if (category === "All") {

            renderNotes(notes);

            return;

        }

        const filtered = notes.filter(note =>

            note.category === category

        );

        renderNotes(filtered);

    });

});


// ================================
// Sort Notes
// ================================

document.getElementById("sortNotes").addEventListener("change", function () {

    const value = this.value;

    let sorted = [...notes];

    switch (value) {

        case "newest":

            sorted.sort((a, b) =>

                new Date(b.createdAt) - new Date(a.createdAt)

            );

            break;

        case "oldest":

            sorted.sort((a, b) =>

                new Date(a.createdAt) - new Date(b.createdAt)

            );

            break;

        case "title":

            sorted.sort((a, b) =>

                a.title.localeCompare(b.title)

            );

            break;

    }

    renderNotes(sorted);

});


// ================================
// Close Modals
// ================================

window.addEventListener("click", (e) => {

    if (e.target === noteModal) {

        closeNoteModal();

    }

    if (e.target === deleteModal) {

        closeDeleteModal();

    }

});


document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeNoteModal();

        closeDeleteModal();

    }

});


// ================================
// Prepare New Note
// ================================

function prepareNewNote() {

    editingId = null;

    document.getElementById("modalTitle").textContent = "Add New Note";

    noteForm.reset();

    document.getElementById("color").value = "#6C63FF";

}


newNoteBtn.addEventListener("click", prepareNewNote);

floatingAddBtn.addEventListener("click", prepareNewNote);

if (emptyAddBtn) {

    emptyAddBtn.addEventListener("click", prepareNewNote);

}


// ================================
// Sidebar Active Menu
// ================================

document.querySelectorAll(".sidebar nav a").forEach(link => {

    link.addEventListener("click", () => {

        document.querySelectorAll(".sidebar nav a")

            .forEach(item => item.classList.remove("active"));

        link.classList.add("active");

    });

});


// ================================
// Quick Action Cards
// ================================

const actionCards = document.querySelectorAll(".action-card");

if (actionCards.length >= 4) {

    actionCards[0].onclick = () => {

        prepareNewNote();

        openModal();

    };

    actionCards[1].onclick = () => {

        renderNotes(notes.filter(note => note.pinned));

        showToast("Showing pinned notes");

    };

    actionCards[2].onclick = () => {

        searchInput.focus();

        showToast("Search your notes");

    };

    actionCards[3].onclick = () => {

        showToast("Export feature coming soon!", "warning");

    };

}


// ================================
// Dashboard Initialization
// ================================

async function initializeDashboard() {

    await loadProfile();

    await fetchNotes();

}


// ================================
// Start Application
// ================================

initializeDashboard();

console.log("NoteFlow Dashboard Loaded Successfully");