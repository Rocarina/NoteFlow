const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

function showToast(message, type = "success") {

    toast.textContent = message;

    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}