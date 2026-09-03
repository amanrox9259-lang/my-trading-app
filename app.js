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

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const message = document.getElementById("authMessage");

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
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  if (data.user && !data.session) {
    message.textContent = "Account created. Check your email to verify.";
    return;
  }

  message.textContent = "Account created!";
  showApp();
}


async function loginUser() {

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const message = document.getElementById("authMessage");

  if (!email || !password) {
    message.textContent = "Email and password required.";
    return;
  }

  message.textContent = "Logging in...";

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
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
    console.error(error);
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

  if (typeof go === "function") {
    go("home");
  }
}


// ============================
// AUTH STATE
// ============================

supabaseClient.auth.onAuthStateChange(
  function(event, session) {

    if (session) {
      showApp();
    } else {
      showLogin();
    }

  }
);


// ============================
// BASIC TRADING DATA
// ============================

function updateBalance() {

  const balanceElements =
    document.querySelectorAll(".balance");

  balanceElements.forEach(function(element) {
    element.textContent =
      "₹" + balance.toLocaleString("en-IN", {
        minimumFractionDigits: 2
      });
  });
}


function placeOrder(symbol, quantity, price) {

  quantity = Number(quantity);
  price = Number(price);

  if (!symbol || quantity <= 0 || price <= 0) {
    return;
  }

  const total = quantity * price;

  if (orderSide === "BUY" && total > balance) {
    alert("Insufficient balance.");
    return;
  }

  if (orderSide === "BUY") {
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
    time: new Date().toLocaleString()
  });

  updateBalance();

  alert(
    orderSide +
    " order placed for " +
    quantity +
    " × " +
    symbol
  );
}


function setOrderSide(side) {

  if (side !== "BUY" && side !== "SELL") {
    return;
  }

  orderSide = side;

  document
    .querySelectorAll("[data-order-side]")
    .forEach(function(button) {

      button.classList.toggle(
        "active",
        button.getAttribute("data-order-side") === side
      );

    });
}


// ============================
// PAGE NAVIGATION
// ============================

function go(page) {

  currentPage = page;

  document
    .querySelectorAll("[data-page]")
    .forEach(function(section) {

      section.style.display =
        section.getAttribute("data-page") === page
          ? "block"
          : "none";

    });

  document
    .querySelectorAll("[data-nav]")
    .forEach(function(button) {

      button.classList.toggle(
        "active",
        button.getAttribute("data-nav") === page
      );

    });
}


// ============================
// STARTUP
// ============================

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    console.log("TradeX JS loaded");

    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (session) {
      showApp();
    } else {
      showLogin();
    }

    updateBalance();

  }
);
