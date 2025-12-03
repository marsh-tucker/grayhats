document.addEventListener("DOMContentLoaded", () => {
    const itemCards = document.querySelectorAll(".item-card");
    const cartCount = document.getElementById("cart-count");
  const cartIcon = document.querySelector(".cart-display");
  const cartPreview = document.getElementById("cart-preview");
  const cartItemsList = document.getElementById("cart-items");
  const cartTotalDisplay = document.getElementById("cart-total");
  const doneButton = document.querySelector(".done-button");
  const previewCheckout = document.getElementById("preview-checkout");

    const initFlag = "cartInit";

    if (!sessionStorage.getItem(initFlag)) {
        localStorage.removeItem("savedCart");
        localStorage.removeItem("cart");
        sessionStorage.setItem(initFlag, "1");
    }

    function loadSavedCart() {
        const saved = localStorage.getItem("savedCart") || localStorage.getItem("cart");
        if (!saved) return [];
        try {
            return JSON.parse(saved) || [];
        } catch (err) {
            console.error("Error parsing saved cart:", err);
            return [];
        }
    }

  let cart = loadSavedCart();

    function updateCartDisplay() {
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalQty;
    }

    function renderCartPreview() {
        cartItemsList.innerHTML = "";

        if (!cart.length) {
            const li = document.createElement("li");
            li.textContent = "Cart is empty";
            cartItemsList.appendChild(li);
            cartTotalDisplay.textContent = "0.00";
            return;
        }

        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;

            const li = document.createElement("li");
            li.textContent = `${item.name} x${item.quantity}`;
            const priceSpan = document.createElement("span");
            priceSpan.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

            li.appendChild(priceSpan);
            cartItemsList.appendChild(li);
        });

        cartTotalDisplay.textContent = total.toFixed(2);
    }

    function syncCartUI() {
        updateCartDisplay();
        renderCartPreview();
    }

    //renders the cart by clicking the emoji
    if (cartIcon && cartPreview) {
        cartIcon.addEventListener("click", () => {
            // 1. Update the cart contents first
            renderCartPreview();

            // 2. Then, toggle the visibility using the class
            cartPreview.classList.toggle("hidden");
        });
    }

    // Attach plus/minus handlers for each item card
    itemCards.forEach(card => {
        const name = card.querySelector("h3").textContent;
        const priceText = card.querySelector(".price").textContent;
        const price = parseFloat(priceText.replace("$", ""));

        const minusBtn = card.querySelector(".qty-minus");
        const plusBtn = card.querySelector(".qty-plus");
        const qtySpan = card.querySelector(".qty-value");

        const getQty = () => parseInt(qtySpan.textContent, 10) || 0;

        const existing = cart.find(item => item.name === name);
        if (existing) {
            qtySpan.textContent = existing.quantity;
        }

        function updateCartItem(quantity) {
            const existing = cart.find(item => item.name === name);
            if (existing) {
                existing.quantity = quantity;
                if (existing.quantity <= 0) {
                    cart = cart.filter(item => item.name !== name);
                }
            } else if (quantity > 0) {
                cart.push({ name, price, quantity });
            }
            syncCartUI();
        }

        plusBtn.addEventListener("click", () => {
            const newQty = getQty() + 1;
            qtySpan.textContent = newQty;
            updateCartItem(newQty);
        });

        minusBtn.addEventListener("click", () => {
            const current = getQty();
            if (current <= 0) return;
            const newQty = current - 1;
            qtySpan.textContent = newQty;
            updateCartItem(newQty);
        });
    });

  // On load, sync totals/preview with any saved cart
  syncCartUI();

  function saveCartAndGo() {
    const cartJSON = JSON.stringify(cart);
    localStorage.setItem("savedCart", cartJSON);
    localStorage.setItem("cart", cartJSON); // compatibility with earlier key
    window.location.href = "receipt.html";
  }

  if (doneButton) {
    doneButton.addEventListener("click", saveCartAndGo);
  }

  if (previewCheckout) {
    previewCheckout.addEventListener("click", saveCartAndGo);
  }

});

function togglePreview() {
    const previewElement = document.getElementById('cart-preview');

    if (previewElement) {
        // This handles the simple visibility toggle for the "Close" button
        previewElement.classList.toggle('hidden');
    } else {
        console.error('Element with ID "cart-preview" not found.');
    }
}

