import { auth, signOut } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  /* --------------------------- */
  /* AUTH & USER NAME DISPLAY    */
  /* --------------------------- */
  const userNameSpan = document.getElementById("userName");
  const signOutBtn = document.getElementById("signOutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userNameSpan.textContent = user.email;
    } else {
      window.location.href = "/index.html";
    }
  });

  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/index.html";
    });
  }

  /* --------------------------- */
  /* SIDEBAR MOBILE CONTROLS     */
  /* --------------------------- */
  const openSidebarBtn = document.getElementById("openSidebarBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const sidebar = document.querySelector(".sidebar");
  const navButtons = document.querySelectorAll(".nav-btn");

  openSidebarBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // Close sidebar when clicking outside (mobile only)
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !openSidebarBtn.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    }
  });

  // Handle nav button clicks: set active and close sidebar on mobile
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
      }
    });
  });

  /* --------------------------- */
  /* TRANSACTIONS LOGIC          */
  /* --------------------------- */
  const categories = ["Food", "Transport", "Utilities", "Entertainment"];
  const transactions = [];

  const categoryFilter = document.getElementById("categoryFilter");
  const transactionCategory = document.getElementById("transactionCategory");
  const transactionList = document.getElementById("transactionList");
  const transactionForm = document.getElementById("transactionForm");
  const transactionModal = document.getElementById("transactionModal");
  const addTransactionBtn = document.getElementById("addTransactionBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const searchInput = document.getElementById("searchInput");

  // Fill category dropdown in the modal form
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.toLowerCase();
    option.textContent = cat;
    transactionCategory.appendChild(option);
  });

  function renderTransactions(list) {
    transactionList.innerHTML = "";
    list.forEach((t) => {
      const li = document.createElement("li");
      li.className = "transaction-item";
      li.dataset.category = t.category.toLowerCase();

      li.innerHTML = `
        <div class="transaction-details">
          <div class="transaction-title">${t.title}</div>
          <div class="transaction-category">${t.category}</div>
        </div>
        <div class="transaction-meta">
          <div class="transaction-amount ${t.amount >= 0 ? "amount-positive" : "amount-negative"}">
            $${t.amount.toFixed(2)}
          </div>
          <div class="transaction-date">${t.date}</div>
        </div>
      `;
      transactionList.appendChild(li);
    });
  }

  function highlightTransactions() {
    const selected = categoryFilter.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    document.querySelectorAll(".transaction-item").forEach((item) => {
      const matchesCategory = selected === "all" || item.dataset.category === selected;
      const title = item.querySelector(".transaction-title").textContent.toLowerCase();
      const matchesSearch = title.includes(searchTerm);

      item.style.opacity = (matchesCategory && matchesSearch) ? "1" : "0.3";
    });
  }

  categoryFilter.addEventListener("change", highlightTransactions);
  searchInput.addEventListener("input", highlightTransactions);

  addTransactionBtn.addEventListener("click", () => {
    transactionModal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    transactionForm.reset();
    transactionModal.classList.add("hidden");
  });

  transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newTransaction = {
      title: document.getElementById("transactionTitle").value.trim(),
      category: document.getElementById("transactionCategory").value,
      amount: parseFloat(document.getElementById("transactionAmount").value),
      date: document.getElementById("transactionDate").value,
    };

    transactions.push(newTransaction);
    renderTransactions(transactions);
    highlightTransactions();

    transactionForm.reset();
    transactionModal.classList.add("hidden");
  });

  // Initial render
  renderTransactions(transactions);

});
