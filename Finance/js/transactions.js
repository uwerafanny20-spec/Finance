import {
  db,
  storage,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  ref,
  uploadBytes,
  getDownloadURL
} from "./firebase-init.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
     DOM ELEMENTS
  ============================================================ */
  const addBtn = document.getElementById("addTransactionBtn");
  const modal = document.getElementById("transactionModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  const expenseTab = document.getElementById("expenseTab");
  const incomeTab = document.getElementById("incomeTab");

  const amountInput = document.getElementById("amountInput");
  const categoryInput = document.getElementById("categoryInput");
  const dateInput = document.getElementById("dateInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const receiptInput = document.getElementById("receiptInput");
  const uploadBtn = document.getElementById("uploadBtn");

  const form = document.getElementById("transactionForm");
  const transactionList = document.getElementById("transactionList");

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortSelect = document.getElementById("sortSelect"); // optional dropdown for sorting

  // Mobile navbar & sidebar
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("overlay");
  const navButtons = document.querySelectorAll(".nav-btn");

  /* ============================================================
     STATE
  ============================================================ */
  let transactionType = "expense";
  let transactionsRef;
  let editTransactionId = null;
  let transactions = []; // store all transactions locally

  /* ============================================================
     AUTH + FIREBASE LOADING
  ============================================================ */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      transactionsRef = collection(db, "users", user.uid, "transactions");
      loadTransactions();
    } else {
      window.location.href = "/index.html";
    }
  });

  /* ============================================================
     MODAL HANDLING
  ============================================================ */
  function openModal() { modal.classList.remove("hidden"); }
  function closeModal() {
    modal.classList.add("hidden");
    form.reset();
    editTransactionId = null;
    transactionType = "expense";
    expenseTab.classList.add("active");
    incomeTab.classList.remove("active");
  }

  addBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ============================================================
     TYPE SWITCH (Expense / Income)
  ============================================================ */
  expenseTab.addEventListener("click", () => {
    transactionType = "expense";
    expenseTab.classList.add("active");
    incomeTab.classList.remove("active");
  });

  incomeTab.addEventListener("click", () => {
    transactionType = "income";
    incomeTab.classList.add("active");
    expenseTab.classList.remove("active");
  });

  /* ============================================================
     RECEIPT UPLOAD
  ============================================================ */
  uploadBtn.addEventListener("click", () => receiptInput.click());

  /* ============================================================
     SUBMIT TRANSACTION
  ============================================================ */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("You must be signed in!");

    try {
      let receiptURL = null;
      if (receiptInput.files.length > 0) {
        const file = receiptInput.files[0];
        const fileRef = ref(storage, `receipts/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        receiptURL = await getDownloadURL(fileRef);
      }

      const transactionData = {
        type: transactionType,
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value,
        description: descriptionInput.value,
        receipt: receiptURL,
        createdAt: Date.now()
      };

      if (editTransactionId) {
        await updateDoc(doc(transactionsRef, editTransactionId), transactionData);
        alert("Transaction updated successfully!");
        editTransactionId = null;
      } else {
        await addDoc(transactionsRef, transactionData);
        alert("Transaction saved successfully!");
      }

      closeModal();
      loadTransactions();
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction");
    }
  });

  /* ============================================================
     LOAD TRANSACTIONS
  ============================================================ */
  async function loadTransactions() {
    if (!transactionsRef) return;

    transactionList.innerHTML = "";

    try {
      const snapshot = await getDocs(transactionsRef);
      transactions = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
                                  .sort((a, b) => b.createdAt - a.createdAt); // default newest first

      filterAndRenderTransactions();
    } catch (err) {
      console.error(err);
      alert("Failed to load transactions");
    }
  }

  /* ============================================================
     FILTER & SORT TRANSACTIONS
  ============================================================ */
  function filterAndRenderTransactions() {
    let filtered = [...transactions];

    // Search filter
    const query = searchInput.value.toLowerCase();
    if (query) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    }

    // Category filter
    const category = categoryFilter.value;
    if (category && category !== "all") {
      filtered = filtered.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }

    // Sorting (by amount, date, type)
    if (sortSelect) {
      const sortBy = sortSelect.value;
      if (sortBy === "date_asc") filtered.sort((a,b) => a.createdAt - b.createdAt);
      else if (sortBy === "date_desc") filtered.sort((a,b) => b.createdAt - a.createdAt);
      else if (sortBy === "amount_asc") filtered.sort((a,b) => a.amount - b.amount);
      else if (sortBy === "amount_desc") filtered.sort((a,b) => b.amount - a.amount);
      else if (sortBy === "type") filtered.sort((a,b) => a.type.localeCompare(b.type));
    }

    renderTransactions(filtered);
  }

  /* ============================================================
     RENDER TRANSACTIONS
  ============================================================ */
  function renderTransactions(transactionsToShow) {
    transactionList.innerHTML = "";
    if (transactionsToShow.length === 0) {
      transactionList.innerHTML = `<p class="no-data">No transactions found.</p>`;
      return;
    }

    transactionsToShow.forEach(t => renderTransaction(t.id, t));
  }

  function renderTransaction(id, t) {
    const li = document.createElement("li");
    const isDashboard = window.location.pathname.toLowerCase().includes("dashboard.html");

    if (isDashboard) {
      li.className = `transaction-item dashboard ${t.type}`;
      li.innerHTML = `
        <div class="dashboard-transaction">
          <span class="dashboard-title">${t.description}</span>
          <span class="dashboard-date">${t.date}</span>
          <span class="dashboard-amount ${t.type}">
            ${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}
          </span>
        </div>
      `;
    } else {
      li.className = `transaction-item ${t.type}`;
      li.innerHTML = `
        <div class="transaction-left">
          <div class="transaction-icon">${t.type === "income" ? "💰" : "💸"}</div>
          <div class="transaction-info">
            <div class="transaction-title">${t.description}</div>
            <div class="transaction-meta">${t.category} • ${t.date}</div>
          </div>
        </div>
        <div class="transaction-right">
          <div class="transaction-amount ${t.type}">${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}</div>
          <div class="transaction-actions">
            ${t.receipt ? `<a href="${t.receipt}" target="_blank"><img src="/image/receipt.png"></a>` : ""}
            <button class="edit-btn" data-id="${id}"><img src="/image/edit.png"></button>
            <button class="delete-btn" data-id="${id}"><img src="/image/delete.png"></button>
          </div>
        </div>
      `;

      li.querySelector(".delete-btn").addEventListener("click", () => deleteTransaction(id));
      li.querySelector(".edit-btn").addEventListener("click", () => openEditModal(id, t));
    }

    transactionList.appendChild(li);
  }

  /* ============================================================
     DELETE TRANSACTION
  ============================================================ */
  async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteDoc(doc(transactionsRef, id));
      alert("Transaction deleted!");
      loadTransactions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction");
    }
  }

  /* ============================================================
     EDIT TRANSACTION
  ============================================================ */
  function openEditModal(id, t) {
    editTransactionId = id;
    transactionType = t.type;
    if (t.type === "expense") {
      expenseTab.classList.add("active");
      incomeTab.classList.remove("active");
    } else {
      incomeTab.classList.add("active");
      expenseTab.classList.remove("active");
    }

    amountInput.value = t.amount;
    categoryInput.value = t.category;
    dateInput.value = t.date;
    descriptionInput.value = t.description;

    openModal();
  }

  /* ============================================================
     SEARCH + FILTER LISTENERS
  ============================================================ */
  searchInput.addEventListener("input", filterAndRenderTransactions);
  categoryFilter.addEventListener("change", filterAndRenderTransactions);
  if (sortSelect) sortSelect.addEventListener("change", filterAndRenderTransactions);

  /* ============================================================
     MOBILE SIDEBAR LOGIC
  ============================================================ */
  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.remove("hidden");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", closeSidebar);
  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.add("hidden");
    overlay.classList.remove("active");
  }
  navButtons.forEach((btn) => btn.addEventListener("click", closeSidebar));

  console.log("Transactions Module Loaded with Search & Sorting");
});
