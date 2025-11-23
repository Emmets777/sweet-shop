const overlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItemsList = document.getElementById("cartItems");
const sendOrder = document.getElementById("sendOrder");
const ordersBtn = document.getElementById("orders");
const addButtons = document.querySelectorAll(".createOrder");

let cart = [];
let flavorsByProduct = [];

fetch("./flavors.json")
  .then((r) => r.json())
  .then((data) => {
    flavorsByProduct = Array.isArray(data.produtos) ? data.produtos : []
  });

if (!document.getElementById("ordersCounter")) {
  const counter = document.createElement("span");
  counter.id = "ordersCounter";
  counter.textContent = "0";
  ordersBtn.appendChild(counter);
}

addButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
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
      flavor: "",
    });

    updateCounter();
    renderCart();
  });
});

ordersBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
});

closeCart.addEventListener("click", () => {
  overlay.classList.add("hidden");
});

function updateCounter() {
  document.getElementById("ordersCounter").textContent = cart.length;
}

function renderCart() {
  cartItemsList.innerHTML = "";

  cart.forEach((item) => {
    const li = document.createElement("li");

    const title = document.createElement("p");
    title.textContent = item.name;

    const quantityBox = document.createElement("div");
    quantityBox.className = "quantityControl";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.onclick = () => {
      if (item.quantity > 1) {
        item.quantity--;
      }
      renderCart();
    };

    const qty = document.createElement("span");
    qty.textContent = item.quantity;

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.onclick = () => {
      item.quantity++;
      renderCart();
    };

    quantityBox.appendChild(minusBtn);
    quantityBox.appendChild(qty);
    quantityBox.appendChild(plusBtn);

    const flavorBox = document.createElement("select");
    flavorBox.className = "flavorSelect";
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
  window.open(url, "_blank");
});
