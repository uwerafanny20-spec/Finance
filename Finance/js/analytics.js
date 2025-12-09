import {
  db,
  collection,
  getDocs
} from "./firebase-init.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth();

let transactionsRef;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/index.html";
    return;
  }

  transactionsRef = collection(db, "users", user.uid, "transactions");
  loadAnalytics();
});


async function loadAnalytics() {
  const snapshot = await getDocs(transactionsRef);

  const transactions = [];
  snapshot.forEach((doc) => transactions.push(doc.data()));

  if (transactions.length === 0) return;

  buildAnalytics(transactions);
}


function buildAnalytics(data) {
  let totalIncome = 0;
  let totalExpense = 0;

  const monthlyIncome = {};
  const monthlyExpense = {};
  const categories = {};

  data.forEach((t) => {
    const month = t.date.slice(0, 7); // YYYY-MM


    if (t.type === "income") {
      totalIncome += t.amount;
      monthlyIncome[month] = (monthlyIncome[month] || 0) + t.amount;
    } else {
      totalExpense += t.amount;
      monthlyExpense[month] = (monthlyExpense[month] || 0) + t.amount;
    }

    // Category totals
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  /* Update Top Cards */
  document.getElementById("totalIncome").textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById("totalExpense").textContent = `$${totalExpense.toFixed(2)}`;

  // Find top spending category
  const sortedCats = Object.entries(categories).sort((a,b) => b[1] - a[1]);
  document.getElementById("topCategory").textContent =
    sortedCats.length ? `$${sortedCats[0][1].toFixed(2)}` : "$0.00";

  // Summary
  const savingsRate = (totalIncome - totalExpense) / totalIncome * 100;
  document.getElementById("savingsRate").textContent =
    `${Math.round(savingsRate)}%`;

  const avgIncome = totalIncome / 12;
  const avgExpense = totalExpense / 12;

  document.getElementById("avgIncome").textContent = `$${avgIncome.toFixed(2)}`;
  document.getElementById("avgExpense").textContent = `$${avgExpense.toFixed(2)}`;

  buildIncomeExpenseChart(monthlyIncome, monthlyExpense);
  buildCategoryChart(categories);
}


/* =============================================================
   CHART: INCOME VS EXPENSE
============================================================= */
function buildIncomeExpenseChart(income, expense) {
  const months = [...new Set([...Object.keys(income), ...Object.keys(expense)])];

  new Chart(document.getElementById("incomeExpenseChart"), {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: months.map(m => income[m] || 0),
          backgroundColor: "#00c36a"
        },
        {
          label: "Expense",
          data: months.map(m => expense[m] || 0),
          backgroundColor: "#ff4d4d"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}



function buildCategoryChart(categories) {
  new Chart(document.getElementById("categoryChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ["#2ecc71", "#3498db", "#f1c40f", "#9b59b6", "#e74c3c", "#1abc9c"]
      }]
    },
    options: { responsive: true }
  });
}
