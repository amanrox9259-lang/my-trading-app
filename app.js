// ============================
// TradeX - Supabase + App
// ============================

const supabaseClient = window.supabase.createClient(
  "https://ialhcvbmauefotujspag.supabase.co",
  "sb_publishable_NT_JybG43uFNvw-Kh-IW9A_QD8g9lcO"
);

// ============================
// APP DATA
// ============================

let currentPage = "home";
let orderSide = "BUY";

let balance = 100000;
let orders = [];

const stocks = [
  { name: "Suzlon Energy", symbol: "SUZLON", price: 45.46, change: -1.04 },
  { name: "Yes Bank", symbol: "YESBANK", price: 22.15, change: 0.05 },
  { name: "Rama Steel Tubes", symbol: "RAMASTEEL", price: 4.17, change: -0.08 },
  { name: "Bajaj Finance", symbol: "BAJFINANCE", price: 1055.90, change: 2.00 },
  { name: "Maruti Suzuki", symbol: "MARUTI", price: 12849.00, change: -101.00 },
  { name: "Tata Motors", symbol: "TATAMOTORS", price: 310.40, change: 2.75 },
  { name: "NIFTY 50", symbol: "NIFTY", price: 24986.40, change: 126.20 }
];

// ============================
// AUTH
// ============================

async function signupUser() {
  const emailEl = document.getElementById("authEmail");
  const passwordEl = document.getElementById("authPassword");
  const message = document.getElementById("authMessage");

  const email = emailEl ? emailEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value : "";

  if (!email || !password) {
    message.textContent = "Email and password required.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password must be at least 6 characters.";
    return;
  }

  message.textContent = "Creating account...";

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  if (data.user && !data.session) {
    message.textContent =
      "Account created. Check your email to verify.";
    return;
  }

  message.textContent = "Account created!";
  showApp();
}

async function loginUser() {
  const emailEl = document.getElementById("authEmail");
  const passwordEl = document.getElementById("authPassword");
  const message = document.getElementById("authMessage");

  const email = emailEl ? emailEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value : "";

  if (!email || !password) {
    message.textContent = "Email and password required.";
    return;
  }

  message.textContent = "Logging in...";

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    message.textContent = error.message;
    return;
  }

  message.textContent = "Login successful!";
  showApp();
}

async function logoutUser() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showMessage(error.message);
    return;
  }

  showLogin();
}

function showLogin() {
  const authScreen = document.getElementById("authScreen");
  const app = document.getElementById("app");

  if (authScreen) {
    authScreen.style.display = "flex";
  }

  if (app) {
    app.style.display = "none";
  }
}

function showApp() {
  const authScreen = document.getElementById("authScreen");
  const app = document.getElementById("app");

  if (authScreen) {
    authScreen.style.display = "none";
  }

  if (app) {
    app.style.display = "block";
  }

  go("home");
}

// ============================
// AUTH STATE
// ============================

supabaseClient.auth.onAuthStateChange(function(event, session) {
  if (session) {
    showApp();
  } else {
    showLogin();
  }
});

// ============================
// PAGE NAVIGATION
// ============================

function go(page) {
  currentPage = page;

  const pages = {
    home: "homePage",
    watchlist: "watchlistPage",
    portfolio: "portfolioPage",
    orders: "ordersPage",
    money: "moneyPage"
  };

  Object.keys(pages).forEach(function(key) {
    const section = document.getElementById(pages[key]);

    if (section) {
      section.style.display = key === page ? "block" : "none";
      section.classList.toggle("active", key === page);
    }
  });

  document.querySelectorAll(".bottom-nav .nav").forEach(function(button) {
    button.classList.remove("active");

    const text = button.textContent.trim().toLowerCase();

    if (
      (page === "home" && text.includes("home")) ||
      (page === "watchlist" && text.includes("watchlist")) ||
      (page === "portfolio" && text.includes("portfolio")) ||
      (page === "orders" && text.includes("orders")) ||
      (page === "money" && text.includes("money"))
    ) {
      button.classList.add("active");
    }
  });

  if (page === "watchlist") {
    renderWatchlist();
  }

  if (page === "orders") {
    renderOrders();
  }

  updateBalance();
}

// ============================
// BALANCE
// ============================

function formatMoney(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateBalance() {
  const balanceIds = [
    "balance",
    "moneyBalance",
    "netWorth",
    "stockValue"
  ];

  balanceIds.forEach(function(id) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = formatMoney(balance);
    }
  });
}

// ============================
// WATCHLIST
// ============================

function renderWatchlist(list) {
  const container = document.getElementById("watchlist");

  if (!container) {
    return;
  }

  const data = list || stocks;

  container.innerHTML = "";

  data.forEach(function(stock) {
    const card = document.createElement("div");

    card.className = "index-card";

    card.innerHTML = `
      <div>
        <b>${stock.name}</b>
        <small>${stock.symbol}</small>
      </div>

      <div class="right">
        <b>${formatMoney(stock.price)}</b>
        <span class="${stock.change >= 0 ? "profit" : "loss"}">
          ${stock.change >= 0 ? "+" : ""}${stock.change}
        </span>
      </div>
    `;

    card.style.cursor = "pointer";

    card.addEventListener("click", function() {
      openOrder(stock.symbol);
    });

    container.appendChild(card);
  });
}

function searchStocks() {
  const input = document.getElementById("searchInput");

  if (!input) {
    return;
  }

  const query = input.value.trim().toLowerCase();

  const filtered = stocks.filter(function(stock) {
    return (
      stock.name.toLowerCase().includes(query) ||
      stock.symbol.toLowerCase().includes(query)
    );
  });

  renderWatchlist(filtered);
}

// ============================
// ORDER MODAL
// ============================

function openOrder(symbol) {
  const modal = document.getElementById("orderModal");
  const symbolElement = document.getElementById("orderSymbol");
  const priceElement = document.getElementById("orderPrice");

  const stock = stocks.find(function(item) {
    return item.symbol === symbol || item.name === symbol;
  });

  if (symbolElement) {
    symbolElement.textContent = stock
      ? stock.name
      : symbol;
  }

  if (priceElement && stock) {
    priceElement.value = stock.price;
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeOrder() {
  const modal = document.getElementById("orderModal");

  if (modal) {
    modal.style.display = "none";
  }
}

function setSide(side) {
  if (side !== "BUY" && side !== "SELL") {
    return;
  }

  orderSide = side;

  const buyButton = document.getElementById("buyButton");
  const sellButton = document.getElementById("sellButton");

  if (buyButton) {
    buyButton.classList.toggle("active", side === "BUY");
  }

  if (sellButton) {
    sellButton.classList.toggle("active", side === "SELL");
  }
}

// Compatibility with old function name
function setOrderSide(side) {
  setSide(side);
}

// ============================
// PLACE ORDER
// ============================

function placeOrder() {
  const symbolElement = document.getElementById("orderSymbol");
  const quantityElement = document.getElementById("quantity");
  const priceElement = document.getElementById("orderPrice");

  const symbolText = symbolElement
    ? symbolElement.textContent.trim()
    : "";

  const quantity = Number(
    quantityElement ? quantityElement.value : 0
  );

  const price = Number(
    priceElement ? priceElement.value : 0
  );

  if (!symbolText || quantity <= 0 || price <= 0) {
    showMessage("Enter valid order details.");
    return;
  }

  const stock = stocks.find(function(item) {
    return (
      item.name === symbolText ||
      item.symbol === symbolText
    );
  });

  const symbol = stock ? stock.symbol : symbolText;

  const total = quantity * price;

  if (orderSide === "BUY") {
    if (total > balance) {
      showMessage("Insufficient balance.");
      return;
    }

    balance -= total;
  } else {
    balance += total;
  }

  orders.push({
    id: Date.now(),
    symbol: symbol,
    side: orderSide,
    quantity: quantity,
    price: price,
    total: total,
    time: new Date().toLocaleString("en-IN")
  });

  updateBalance();
  renderOrders();
  closeOrder();

  showMessage(
    orderSide +
    " order placed: " +
    quantity +
    " × " +
    symbol
  );
}

// ============================
// ORDERS
// ============================

function renderOrders() {
  const container = document.getElementById("ordersList");

  if (!container) {
    return;
  }

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div>▤</div>
        <h3>No orders yet</h3>
        <p>Your orders will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  orders.slice().reverse().forEach(function(order) {
    const item = document.createElement("div");

    item.className = "index-card";

    item.innerHTML = `
      <div>
        <b>${order.side} · ${order.symbol}</b>
        <small>
          ${order.quantity} × ${formatMoney(order.price)}
        </small>
        <small>${order.time}</small>
      </div>

      <div class="right">
        <b>${formatMoney(order.total)}</b>
        <span class="${order.side === "BUY" ? "profit" : "loss"}">
          ${order.side}
        </span>
      </div>
    `;

    container.appendChild(item);
  });
}

// ============================
// MESSAGES
// ============================

function showMessage(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(function() {
    toast.style.display = "none";
  }, 2500);
}

// ============================
// MONEY
// ============================

function depositreal() {
  showMessage("Real-money deposits are not enabled yet.");
}

function withdrawreal() {
  showMessage("Real-money withdrawals are not enabled yet.");
}

// ============================
// STARTUP
// ============================

document.addEventListener("DOMContentLoaded", async function() {
  console.log("TradeX JS loaded");

  const result = await supabaseClient.auth.getSession();

  if (result.error) {
    console.error(result.error);
    showLogin();
    return;
  }

  const session = result.data.session;

  if (session) {
    showApp();
  } else {
    showLogin();
  }

  updateBalance();
  renderWatchlist();
  renderOrders();

  const modal = document.getElementById("orderModal");

  if (modal) {
    modal.style.display = "none";
  }
});
