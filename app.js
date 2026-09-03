const supabaseClient = window.supabase.createClient(
  "https://ialhcvbmauefotujspag.supabase.co",
  "sb_publishable_JMrXOvoxVqoE5KGe6imi6Q_Cfr6i0Vh"
);

console.log("TradeX JS loaded");
let currentPage = "home";
let orderSide = "BUY";

let balance = 100000;

let orders = [];

const stocks = [
  {
    name: "Suzlon Energy",
    symbol: "SUZLON",
    price: 45.46,
    change: -1.04
  },
  {
    name: "Yes Bank",
    symbol: "YESBANK",
    price: 22.15,
    change: 0.05
  },
  {
    name: "Rama Steel Tubes",
    symbol: "RAMASTEEL",
    price: 4.17,
    change: -0.08
  },
  {
    name: "Bajaj Finance",
    symbol: "BAJFINANCE",
    price: 1055.90,
    change: 2.00
  },
  {
    name: "Maruti Suzuki",
    symbol: "MARUTI",
    price: 12849.00,
    change: -101.00
  },
  {
    name: "Tata Motors",
    symbol: "TATAMOTORS",
    price: 310.40,
    change: 2.75
  },
  {
    name: "NIFTY 50",
    symbol: "NIFTY",
    price: 24986.40,
    change: 126.20
  },
  {
    name: "NIFTY BANK",
    symbol: "BANKNIFTY",
    price: 57210.20,
    change: -237.60
  }
];


// ============================
// PAGE NAVIGATION
// ============================

function go(page){

  currentPage = page;

  document.querySelectorAll(".page").forEach(function(section){
    section.classList.remove("active");
  });

  const pageElement =
    document.getElementById(page + "Page");

  if(pageElement){
    pageElement.classList.add("active");
  }

  document.querySelectorAll(".nav").forEach(function(button){
    button.classList.remove("active");
  });

  const navButtons =
    document.querySelectorAll(".nav");

  if(page === "home") navButtons[0]?.classList.add("active");
  if(page === "watchlist") navButtons[1]?.classList.add("active");
  if(page === "portfolio") navButtons[2]?.classList.add("active");
  if(page === "orders") navButtons[3]?.classList.add("active");
  if(page === "money") navButtons[4]?.classList.add("active");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

  if(page === "watchlist"){
    renderWatchlist();
  }

  if(page === "orders"){
    renderOrders();
  }

  if(page === "portfolio"){
    updatePortfolio();
  }

  updateBalances();
}


// ============================
// WATCHLIST
// ============================

function renderWatchlist(){

  const container =
    document.getElementById("watchlist");

  if(!container) return;

  const search =
    document.getElementById("searchInput")
      ?.value
      .toLowerCase() || "";

  const filtered =
    stocks.filter(function(stock){

      return (
        stock.name.toLowerCase().includes(search) ||
        stock.symbol.toLowerCase().includes(search)
      );

    });

  container.innerHTML = "";

  if(filtered.length === 0){

    container.innerHTML = `
      <div class="empty">
        <div>⌕</div>
        <h3>No results</h3>
        <p>Try another company or symbol.</p>
      </div>
    `;

    return;
  }

  filtered.forEach(function(stock){

    const card =
      document.createElement("div");

    card.className = "watch-card";

    const changeClass =
      stock.change >= 0
      ? "profit"
      : "loss";

    const sign =
      stock.change >= 0
      ? "+"
      : "";

    card.innerHTML = `

      <div class="watch-top">

        <div>

          <div class="watch-name">
            ${stock.name}
          </div>

          <div class="watch-symbol">
            ${stock.symbol}
          </div>

        </div>

        <div class="watch-price">

          ₹${stock.price.toLocaleString("en-IN",{
            minimumFractionDigits:2,
            maximumFractionDigits:2
          })}

          <div class="watch-change ${changeClass}">
            ${sign}${stock.change.toFixed(2)}%
          </div>

        </div>

      </div>


      <div class="watch-actions">

        <button
          class="watch-buy"
          onclick="openOrder('${stock.name}')">

          BUY

        </button>

        <button
          class="watch-sell"
          onclick="openOrder('${stock.name}','SELL')">

          SELL

        </button>

      </div>

    `;

    container.appendChild(card);

  });

}


// ============================
// SEARCH
// ============================

function searchStocks(){
  renderWatchlist();
}


// ============================
// ORDER MODAL
// ============================

function openOrder(symbol, side = "BUY"){

  orderSide = side;

  const modal =
    document.getElementById("orderModal");

  const title =
    document.getElementById("orderSymbol");

  const price =
    document.getElementById("orderPrice");

  const stock =
    stocks.find(function(item){
      return item.name === symbol ||
             item.symbol === symbol;
    });

  title.textContent = symbol;

  if(stock){
    price.value = stock.price;
  }

  setSide(side);

  modal.classList.add("show");
}


// ============================
// CLOSE ORDER
// ============================

function closeOrder(){

  document
    .getElementById("orderModal")
    .classList.remove("show");

}


// ============================
// BUY / SELL
// ============================

function setSide(side){

  orderSide = side;

  const buy =
    document.getElementById("buyButton");

  const sell =
    document.getElementById("sellButton");

  buy.classList.remove("active");
  sell.classList.remove("active");

  if(side === "BUY"){
    buy.classList.add("active");
  }

  if(side === "SELL"){
    sell.classList.add("active");
  }

}


// ============================
// PLACE REAL ORDER
// ============================

function placeOrder(){

  const symbol =
    document.getElementById("orderSymbol")
      .textContent;

  const quantity =
    Number(
      document.getElementById("quantity")
        .value
    );

  const price =
    Number(
      document.getElementById("orderPrice")
        .value
    );

  const type =
    document.getElementById("orderType")
      .value;


  if(!quantity || quantity <= 0){

    showMessage("Enter a valid quantity");

    return;
  }


  if(!price || price <= 0){

    showMessage("Enter a valid price");

    return;
  }


  const amount =
    quantity * price;


  const order = {

    id:
      "TX" +
      Date.now(),

    symbol:symbol,

    side:orderSide,

    quantity:quantity,

    price:price,

    type:type,

    status:"Executed",

    time:
      new Date().toLocaleTimeString(
        "en-IN",
        {
          hour:"2-digit",
          minute:"2-digit"
        }
      )

  };


  orders.unshift(order);


  if(orderSide === "BUY"){

    if(amount > balance){

      showMessage(
        "Insufficient real balance"
      );

      orders.shift();

      return;
    }

    balance -= amount;

  }


  if(orderSide === "SELL"){

    balance += amount;

  }


  updateBalances();

  closeOrder();

  renderOrders();

  showMessage(
    orderSide +
    " order executed in real"
  );

}


// ============================
// ORDERS PAGE
// ============================

function renderOrders(){

  const container =
    document.getElementById("ordersList");

  if(!container) return;


  if(orders.length === 0){

    container.innerHTML = `

      <div class="empty">

        <div>▤</div>

        <h3>No orders yet</h3>

        <p>
          Your real orders will appear here.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML = "";


  orders.forEach(function(order){

    const card =
      document.createElement("div");

    card.className = "watch-card";


    const sideClass =
      order.side === "BUY"
      ? "profit"
      : "loss";


    card.innerHTML = `

      <div class="watch-top">

        <div>

          <div class="watch-name">

            ${order.symbol}

          </div>

          <div class="watch-symbol">

            ${order.type}
            •
            ${order.time}

          </div>

        </div>


        <div class="${sideClass}">

          ${order.side}

        </div>

      </div>


      <div class="sub">

        <span>
          Qty: ${order.quantity}
        </span>

        <span>
          ₹${order.price.toLocaleString("en-IN",{
            minimumFractionDigits:2
          })}
        </span>

      </div>


      <div class="sub">

        <span>
          Order ID
        </span>

        <b>
          ${order.id}
        </b>

      </div>


      <div class="sub">

        <span>
          Status
        </span>

        <b class="profit">
          ${order.status}
        </b>

      </div>

    `;

    container.appendChild(card);

  });

}


// ============================
// BALANCE
// ============================

function updateBalances(){

  const formatted =
    "₹" +
    balance.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    );


  const balanceElement =
    document.getElementById("balance");

  const moneyBalance =
    document.getElementById("moneyBalance");


  if(balanceElement){
    balanceElement.textContent =
      formatted;
  }

  if(moneyBalance){
    moneyBalance.textContent =
      formatted;
  }

}


// ============================
// PORTFOLIO
// ============================

function updatePortfolio(){

  const netWorth =
    document.getElementById("netWorth");

  const stockValue =
    document.getElementById("stockValue");


  if(!netWorth) return;


  let invested = 0;


  orders.forEach(function(order){

    if(order.side === "BUY"){

      invested +=
        order.quantity *
        order.price;

    }

  });


  netWorth.textContent =
    "₹" +
    invested.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:2
      }
    );


  if(stockValue){

    stockValue.textContent =
      "₹" +
      invested.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits:2
        }
      );

  }

}


// ============================
// REAL ADD MONEY
// ============================

function depositReal(){

  const amount =
    prompt(
      "Enter Real amount to add:"
    );


  const value =
    Number(amount);


  if(!value || value <= 0){

    showMessage(
      "Enter a valid amount"
    );

    return;
  }


  balance += value;

  updateBalances();

  showMessage(
    "Real money added: ₹" +
    value.toLocaleString("en-IN")
  );

}


// ============================
// REAL WITHDRAW
// ============================

function withdrawReal(){

  const amount =
    prompt(
      "Enter Real withdrawal amount:"
    );


  const value =
    Number(amount);


  if(!value || value <= 0){

    showMessage(
      "Enter a valid amount"
    );

    return;
  }


  if(value > balance){

    showMessage(
      "Insufficient Real balance"
    );

    return;
  }


  balance -= value;

  updateBalances();

  showMessage(
    "Live withdrawal recorded"
  );

}


// ============================
// TOP TABS
// ============================

function showMessage(message){

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(function(){

    toast.classList.remove("show");

  },2000);

}


// ============================
// INITIAL LOAD
// ============================

document.addEventListener(
  "DOMContentLoaded",
  function(){

    updateBalances();

    renderWatchlist();

  }
);


// ============================
// SIMULATED MARKET MOVEMENT
// ============================

setInterval(function(){

  const nifty =
    stocks.find(
      item => item.symbol === "NIFTY"
    );


  if(!nifty) return;


  const movement =
    (Math.random() - 0.5) * 8;


  nifty.price += movement;

  nifty.change =
    (Math.random() - 0.5) * 1.2;


  const niftyElement =
    document.getElementById("nifty");

  const indexElement =
    document.getElementById("indexPrice");


  const formatted =
    nifty.price.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    );


  if(niftyElement){
    niftyElement.textContent =
      formatted;
  }

  if(indexElement){
    indexElement.textContent =
      formatted;
  }


  if(currentPage === "watchlist"){
    renderWatchlist();
  }


},3000);
// ============================
// AUTHENTICATION
// ============================

async function signupUser(){

  const email =
    document.getElementById("authEmail").value.trim();

  const password =
    document.getElementById("authPassword").value;

  const message =
    document.getElementById("authMessage");

  if(!email || !password){
    message.textContent =
      "Email and password required.";
    return;
  }

  if(password.length < 6){
    message.textContent =
      "Password must be at least 6 characters.";
    return;
  }

  message.textContent = "Creating account...";

  const { data, error } =
    await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

  if(error){
    message.textContent = error.message;
    return;
  }

  if(data.user && !data.session){
    message.textContent =
      "Account created. Check your email to verify.";
    return;
  }

  message.textContent = "Account created!";
  showApp();
}


async function loginUser(){

  const email =
    document.getElementById("authEmail").value.trim();

  const password =
    document.getElementById("authPassword").value;

  const message =
    document.getElementById("authMessage");

  if(!email || !password){
    message.textContent =
      "Email and password required.";
    return;
  }

  message.textContent = "Logging in...";

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if(error){
    message.textContent = error.message;
    return;
  }

  message.textContent = "Login successful!";
  showApp();
}


function showApp(){

  const authScreen =
    document.getElementById("authScreen");

  if(authScreen){
    authScreen.style.display = "none";
  }

  document.getElementById("app")
    .style.display = "block";

  go("home");
}


function showLogin(){

  const authScreen =
    document.getElementById("authScreen");

  if(authScreen){
    authScreen.style.display = "flex";
  }

  document.getElementById("app")
    .style.display = "none";
}


supabaseClient.auth.onAuthStateChange(
  document.addEventListener("DOMContentLoaded", function () {

  const signupButton = document.querySelector(
    '#authScreen button[onclick="signupUser()"]'
  );

  const loginButton = document.querySelector(
    '#authScreen button[onclick="loginUser()"]'
  );

  if (signupButton) {
    signupButton.addEventListener("click", signupUser);
  }

  if (loginButton) {
    loginButton.addEventListener("click", loginUser);
  }

});function(event, session){

    if(session){
      showApp();
    }else{
      showLogin();
    }

  }
);
