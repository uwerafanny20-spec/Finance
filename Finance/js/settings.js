import { auth, db } from "./firebase-init.js";

import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* DOM Elements */
const messageBox = document.getElementById("messageBox");
const loadingSpinner = document.getElementById("loadingSpinner");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const currencySelect = document.getElementById("currency");
const notificationsToggle = document.getElementById("notifications");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const exportBtn = document.getElementById("exportBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const signOutBtn = document.getElementById("signOutBtn");

/* Modals */
const passwordModal = document.getElementById("passwordModal");
const deleteModal = document.getElementById("deleteModal");

/* Password Modal */
const changePasswordForm = document.getElementById("changePasswordForm");
const cancelPassword = document.getElementById("cancelPassword");

/* Delete Modal */
const confirmDeletePassword = document.getElementById("confirmDeletePassword");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

/* Hamburger */
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

/* Helper: show message */
function showMessage(msg, type = "error") {
    messageBox.textContent = msg;
    messageBox.className = `message-box ${type}`;
    messageBox.classList.remove("hidden");
    setTimeout(() => messageBox.classList.add("hidden"), 4000);
}

/* Auth Listener */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "/index.html";
        return;
    }

    emailInput.value = user.email;

    document.getElementById("createdAt").textContent =
        new Date(user.metadata.creationTime).toLocaleString();

    document.getElementById("lastSignIn").textContent =
        new Date(user.metadata.lastSignInTime).toLocaleString();

    const provider = user.providerData[0]?.providerId || "unknown";
    document.getElementById("provider").textContent =
        provider === "password" ? "Email / Password" :
        provider === "google.com" ? "Google" : provider;

    /* Load Firestore Settings */
    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
            const data = snap.data();
            fullNameInput.value = data.fullName || "";
            currencySelect.value = data.currency || "USD";
            notificationsToggle.checked = data.notifications ?? true;
        }
    } catch (err) {
        console.error(err);
        showMessage("Error loading settings");
    }

    loadingSpinner.style.display = "none";
});

/* Save Profile */
saveProfileBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullNameInput.value.trim(),
            currency: currencySelect.value,
            notifications: notificationsToggle.checked
        }, { merge: true });

        showMessage("Profile updated!", "success");
    } catch (err) {
        console.error(err);
        showMessage("Failed to save settings.");
    }
});

/* Change Password */
changePasswordBtn.addEventListener("click", () => passwordModal.classList.add("active"));
cancelPassword.addEventListener("click", () => passwordModal.classList.remove("active"));

changePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const currentPass = document.getElementById("currentPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmNewPassword").value;

    if (newPass !== confirmPass) {
        showMessage("Passwords do not match.");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPass);
        showMessage("Password updated!", "success");
        passwordModal.classList.remove("active");
        changePasswordForm.reset();
    } catch (err) {
        console.error(err);
        showMessage(err.message || "Failed to update password.");
    }
});

/* Export Data */
exportBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data() || {};

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage("Settings exported!", "success");
    } catch (err) {
        console.error(err);
        showMessage("Export failed.");
    }
});

/* Delete Account */
deleteAccountBtn.addEventListener("click", () => deleteModal.classList.add("active"));
cancelDelete.addEventListener("click", () => deleteModal.classList.remove("active"));

confirmDelete.addEventListener("click", async () => {
    const user = auth.currentUser;
    const password = confirmDeletePassword.value;

    if (!user || !password) {
        showMessage("Enter your password to delete.");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        showMessage("Account deleted.", "success");
        window.location.href = "/";
    } catch (err) {
        console.error(err);
        showMessage(err.message || "Failed to delete account.");
    }
});

/* Sign Out */
signOutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "/index.html";
    } catch (err) {
        console.error(err);
        showMessage("Failed to sign out.");
    }
});

/* Hamburger Sidebar Toggle */
menuToggle.addEventListener("click", () => sidebar.classList.toggle("active"));

/* Close sidebar on outside click (mobile) */
document.addEventListener("click", (e) => {
    if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuToggle.contains(e.target)
    ) {
        sidebar.classList.remove("active");
    }
});

/* Optional: Close modals on outside click */
window.addEventListener("click", (e) => {
    if (e.target === passwordModal) passwordModal.classList.remove("active");
    if (e.target === deleteModal) deleteModal.classList.remove("active");
});
