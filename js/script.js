const overlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItemsList = document.getElementById("cartItems");
const sendOrder = document.getElementById("sendOrder");
const ordersBtn = document.getElementById("orders");
const addButtons = document.querySelectorAll(".createOrder");

let cart = [];
let flavorsByProduct = [];
let flavorsLoaded = false;

fetch("./flavors.json")
  .then((r) => r.json())
  .then((data) => {
    flavorsByProduct = Array.isArray(data.produtos) ? data.produtos : [];
    flavorsLoaded = true;
  });

if (!document.getElementById("ordersCounter")) {
  const counter = document.createElement("span");
  counter.id = "ordersCounter";
  counter.textContent = "0";
  counter.setAttribute("aria-live", "polite");
  counter.setAttribute("role", "status");
  ordersBtn.appendChild(counter);
}

addButtons.forEach((btn) => {
  btn.setAttribute("aria-label", "Adicionar produto ao carrinho");

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!flavorsLoaded) {
      alert("Carregando sabores. Aguarde...");
      return;
    }

    const card = btn.closest(".cardProduct");
    const name = card.querySelector("#productName").textContent.trim();

    const productId = name.toLowerCase().includes("panetone")
      ? "panetone"
      : name.toLowerCase().includes("cone")
      ? "cone"
      : "doces";

    cart.push({
      id: Date.now(),
      productId,
      name,
      quantity: 1,
      flavor: ""
    });

    updateCounter();
    renderCart();
  });
});

let lastFocusedElement = null;

function openCart() {
  lastFocusedElement = document.activeElement;
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  ordersBtn.setAttribute("aria-expanded", "true");
  closeCart.focus();
  trapFocus(overlay);
}

function closeCartModal() {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  ordersBtn.setAttribute("aria-expanded", "false");
  if (lastFocusedElement) lastFocusedElement.focus();
}

ordersBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
    closeCartModal();
  }
});

function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstEl = focusable[0];
  const lastEl = focusable[focusable.length - 1];

  container.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });
}

function updateCounter() {
  const c = document.getElementById("ordersCounter");
  c.textContent = cart.length;
}

function renderCart() {
  cartItemsList.innerHTML = "";
  cartItemsList.setAttribute("aria-live", "polite");

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.setAttribute("role", "group");
    li.setAttribute("aria-label", item.name);

    const title = document.createElement("p");
    title.textContent = item.name;

    const quantityBox = document.createElement("div");
    quantityBox.className = "quantityControl";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.setAttribute("aria-label", "Diminuir quantidade");
    minusBtn.onclick = () => {
      if (item.quantity > 1) item.quantity--;
      renderCart();
    };

    const qty = document.createElement("span");
    qty.textContent = item.quantity;
    qty.setAttribute("aria-label", `Quantidade atual: ${item.quantity}`);

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.setAttribute("aria-label", "Aumentar quantidade");
    plusBtn.onclick = () => {
      item.quantity++;
      renderCart();
    };

    quantityBox.appendChild(minusBtn);
    quantityBox.appendChild(qty);
    quantityBox.appendChild(plusBtn);

    const flavorBox = document.createElement("select");
    flavorBox.className = "flavorSelect";
    flavorBox.setAttribute("aria-label", "Selecionar sabor");

    flavorBox.innerHTML = '<option value="">Selecione o sabor</option>';

    const productFlavors =
      flavorsByProduct.find((p) => p.id === item.productId)?.sabores || [];

    productFlavors.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      if (item.flavor === f) opt.selected = true;
      flavorBox.appendChild(opt);
    });

    flavorBox.onchange = (e) => {
      item.flavor = e.target.value;
    };

    const removeBtn = document.createElement("button");
    removeBtn.className = "removeItemBtn";
    removeBtn.textContent = "Remover";
    removeBtn.setAttribute("aria-label", "Remover item");
    removeBtn.onclick = () => {
      cart = cart.filter((c) => c.id !== item.id);
      updateCounter();
      renderCart();
    };

    li.appendChild(title);
    li.appendChild(quantityBox);
    li.appendChild(flavorBox);
    li.appendChild(removeBtn);

    cartItemsList.appendChild(li);
  });
}

sendOrder.addEventListener("click", () => {
  if (cart.length === 0) return;

  let text = "Pedido:%0A";
  cart.forEach((item) => {
    text += `• ${item.name} | Qtd: ${item.quantity} | Sabor: ${
      item.flavor || "Não selecionado"
    }%0A`;
  });

  const url = `https://wa.me/5599999999999?text=${text}`;
  window.open(url, "_blank", "noopener");
});
