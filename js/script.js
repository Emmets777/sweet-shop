const overlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItemsList = document.getElementById("cartItems");
const sendOrder = document.getElementById("sendOrder");
const ordersBtn = document.getElementById("orders");
const addButtons = document.querySelectorAll(".createOrder");

let cart = [];
let products = [];
let loaded = false;

fetch("./flavors.json")
  .then((r) => r.json())
  .then((data) => {
    products = Array.isArray(data.produtos) ? data.produtos : [];
    loaded = true;
  });

/* Contador */
if (!document.getElementById("ordersCounter")) {
  const counter = document.createElement("span");
  counter.id = "ordersCounter";
  counter.textContent = "0";
  ordersBtn.appendChild(counter);
}

/* Adicionar ao carrinho */
addButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!loaded) {
      alert("Carregando dados. Aguarde...");
      return;
    }

    const card = btn.closest(".cardProduct");
    const id = card.getAttribute("data-product-id");
    const name = card.querySelector(".productName").textContent.trim();

    const productData = products.find((p) => p.id === id);

    const isDonuts = id === "donuts";

    cart.push({
      id: Date.now(),
      productId: id,
      name,
      quantity: 1,
      flavor: "",
      selectedQty: isDonuts ? "4" : null
    });

    updateCounter();
    renderCart();
  });
});

function updateCounter() {
  document.getElementById("ordersCounter").textContent = cart.length;
}

/* Render do carrinho */
function renderCart() {
  cartItemsList.innerHTML = "";

  cart.forEach((item) => {
    const productData = products.find((p) => p.id === item.productId);

    const li = document.createElement("li");

    const title = document.createElement("p");
    title.textContent = item.name;

    li.appendChild(title);

    /* Quantidade geral */
    const quantityBox = document.createElement("div");
    quantityBox.className = "quantityControl";

    const minus = document.createElement("button");
    minus.textContent = "-";
    minus.onclick = () => {
      if (item.quantity > 1) item.quantity--;
      renderCart();
    };

    const qtyTxt = document.createElement("span");
    qtyTxt.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.onclick = () => {
      item.quantity++;
      renderCart();
    };

    quantityBox.appendChild(minus);
    quantityBox.appendChild(qtyTxt);
    quantityBox.appendChild(plus);
    li.appendChild(quantityBox);

    /* Somente donuts */
    if (item.productId === "donuts") {
      const qtySelect = document.createElement("select");
      qtySelect.className = "qtySelectDonuts";

      Object.entries(productData.precos_por_quantidade).forEach(([q, v]) => {
        const opt = document.createElement("option");
        opt.value = q;
        opt.textContent = `${q} unidades (R$ ${v})`;
        if (item.selectedQty === q) opt.selected = true;
        qtySelect.appendChild(opt);
      });

      qtySelect.onchange = (ev) => {
        item.selectedQty = ev.target.value;
        renderCart();
      };

      li.appendChild(qtySelect);
    }

    /* Sabores */
    if (productData.sabores) {
      const flavorBox = document.createElement("select");
      flavorBox.className = "flavorSelect";

      flavorBox.innerHTML = `<option value="">Selecione o sabor</option>`;

      productData.sabores.forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f;
        if (item.flavor === f) opt.selected = true;
        flavorBox.appendChild(opt);
      });

      flavorBox.onchange = (ev) => {
        item.flavor = ev.target.value;
      };

      li.appendChild(flavorBox);
    }

    /* Cálculo do preço */
    let unitPrice = 0;

    if (item.productId === "donuts") {
      unitPrice = productData.precos_por_quantidade[item.selectedQty];
    } else {
      unitPrice = productData.preco;
    }

    const priceEl = document.createElement("p");
    priceEl.textContent = `Preço: R$ ${(unitPrice * item.quantity).toFixed(2)}`;
    li.appendChild(priceEl);

    /* Remover */
    const removeBtn = document.createElement("button");
    removeBtn.className = "removeItemBtn";
    removeBtn.textContent = "Remover";
    removeBtn.onclick = () => {
      cart = cart.filter((c) => c.id !== item.id);
      updateCounter();
      renderCart();
    };

    li.appendChild(removeBtn);

    cartItemsList.appendChild(li);
  });
}

/* Abrir/fechar carrinho */
ordersBtn.addEventListener("click", () => overlay.classList.remove("hidden"));
closeCart.addEventListener("click", () => overlay.classList.add("hidden"));

/* Enviar pedido */
sendOrder.addEventListener("click", () => {
  if (cart.length === 0) return;

  let text = "Pedidos:%0A%0A";

  cart.forEach((item) => {
    const productData = products.find((p) => p.id === item.productId);

    let unitPrice =
      item.productId === "donuts"
        ? productData.precos_por_quantidade[item.selectedQty]
        : productData.preco;

    // Formatação vertical
    text += `Nome do pedido: ${item.name}%0A`;

    if (item.flavor) {
      text += `Sabor: ${item.flavor}%0A`;
    } else {
      text += `Sabor: Não informado%0A`;
    }

    text += `Quantidade: ${item.quantity}%0A`;

    if (item.productId === "donuts") {
      text += `Quantidade escolhida (kit): ${item.selectedQty}%0A`;
    }

    const total = (unitPrice * item.quantity).toFixed(2);
    text += `Preço: R$ ${total}%0A`;

    text += `%0A`; // Linha em branco entre pedidos
  });

  const url = `https://wa.me/5511960945833?text=${text}`;
  window.open(url, "_blank", "noopener");
});