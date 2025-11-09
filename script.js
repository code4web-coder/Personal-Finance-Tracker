// Transaction data structure
let transactions = [];

// Categories
const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
};

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const transactionsList = document.getElementById('transactionsList');
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryChart = document.getElementById('categoryChart');

let currentFilter = 'all';

// Initialize app
function init() {
    // Set today's date as default
    dateInput.valueAsDate = new Date();
    
    // Load transactions from localStorage
    loadTransactions();
    
    // Update category options based on type
    updateCategoryOptions();
    
    // Event listeners
    transactionForm.addEventListener('submit', handleSubmit);
    typeSelect.addEventListener('change', updateCategoryOptions);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // Initial render
    updateUI();
}

// Update category dropdown based on transaction type
function updateCategoryOptions() {
    const type = typeSelect.value;
    categorySelect.innerHTML = '';
    
    categories[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const transaction = {
        id: generateId(),
        type: typeSelect.value,
        category: categorySelect.value,
        amount: parseFloat(amountInput.value),
        description: descriptionInput.value,
        date: dateInput.value
    };
    
    transactions.push(transaction);
    saveTransactions();
    updateUI();
    
    // Reset form
    transactionForm.reset();
    dateInput.valueAsDate = new Date();
    updateCategoryOptions();
    
    // Show success animation
    showNotification('Transaction added successfully!');
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
    showNotification('Transaction deleted!');
}

// Handle filter buttons
function handleFilter(e) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    updateUI();
}

// Update UI
function updateUI() {
    updateBalance();
    renderTransactions();
    renderCategoryChart();
}

// Calculate and update balance
function updateBalance() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
    totalBalanceEl.textContent = formatCurrency(balance);
}

// Render transactions list
function renderTransactions() {
    let filteredTransactions = transactions;
    
    if (currentFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === currentFilter);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-transactions">No transactions found.</p>';
        return;
    }
    
    transactionsList.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-details">
                <div class="transaction-header">
                    <span class="transaction-category">${transaction.category}</span>
                    <span class="transaction-description">${transaction.description}</span>
                </div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
            <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">Delete</button>
        </div>
    `).join('');
}

// Render category chart
function renderCategoryChart() {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
        categoryChart.innerHTML = '<p class="no-data">No expense data to display</p>';
        return;
    }
    
    // Calculate total by category
    const categoryTotals = {};
    expenseTransactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const totalExpense = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    // Sort categories by amount
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    categoryChart.innerHTML = sortedCategories.map(([category, amount]) => {
        const percentage = ((amount / totalExpense) * 100).toFixed(1);
        return `
            <div class="category-item">
                <div class="category-name">${category}</div>
                <div class="category-bar-container">
                    <div class="category-bar" style="width: ${percentage}%">
                        <span class="category-percentage">${percentage}%</span>
                    </div>
                </div>
                <div class="category-amount">${formatCurrency(amount)}</div>
            </div>
        `;
    }).join('');
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
}

// Load transactions from localStorage
function loadTransactions() {
    const saved = localStorage.getItem('expenseTrackerTransactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
}

// Show notification
function showNotification(message) {
    // Simple console notification (can be enhanced with toast notifications)
    console.log(message);
}

// Make deleteTransaction available globally
window.deleteTransaction = deleteTransaction;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);