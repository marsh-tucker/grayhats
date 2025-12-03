
// Show payment section when Pay is clicked
function showPaymentSection() {
    const payment = document.getElementById("payment-section");
    const payButton = document.getElementById("pay-button");

    payment.style.display = "block";
    payButton.style.display = "none"; // hide Pay button
}

// Load cart from localStorage and populate checkout + final receipt
document.addEventListener("DOMContentLoaded", () => {
    const savedCartJSON = localStorage.getItem("savedCart") || localStorage.getItem("cart");
    let cart = [];

    if (savedCartJSON) {
        try {
            cart = JSON.parse(savedCartJSON) || [];
        } catch (err) {
            console.error("Error parsing savedCart:", err);
            cart = [];
        }
    }

    populateReceiptFromCart(cart);
});

// Fill totals and item lines using the cart (from menu page)
function populateReceiptFromCart(cart) {
    const checkoutTotalEl = document.getElementById("checkout-total");
    const checkoutItemsDiv = document.getElementById("checkout-items");
    const finalItemsDiv = document.getElementById("final-items");
    const finalTaxEl = document.getElementById("final-tax");
    const finalTotalEl = document.getElementById("final-total");
    const finalDeliveryEl = document.getElementById("final-delivery");

    // Clear old content
    if (checkoutItemsDiv) checkoutItemsDiv.innerHTML = "";
    finalItemsDiv.innerHTML = "";

    // If cart is empty or invalid, show zeros and a message
    if (!Array.isArray(cart) || cart.length === 0) {
        if (checkoutTotalEl) checkoutTotalEl.textContent = "Total: $0.00";
        if (checkoutItemsDiv) checkoutItemsDiv.innerHTML = "<p>No items in cart.</p>";
        finalItemsDiv.innerHTML = "<p>No items in cart.</p>";
        finalTaxEl.textContent = "$0.00";
        finalTotalEl.textContent = "$0.00";
        finalDeliveryEl.textContent = "$0.00 (FREE)";
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        if (quantity <= 0) return; // skip zero qty

        const lineTotal = quantity * price;
        subtotal += lineTotal;

        // Row for checkout screen
        if (checkoutItemsDiv) {
            const checkoutRow = document.createElement("div");
            checkoutRow.className = "receipt-line";
            checkoutRow.innerHTML = `
    <span>${item.name} x${quantity}</span>
    <span>$${lineTotal.toFixed(2)}</span>
  `;
            checkoutItemsDiv.appendChild(checkoutRow);
        }

        // Row for final receipt
        const finalRow = document.createElement("div");
        finalRow.className = "receipt-line";
        finalRow.innerHTML = `
  <span>${item.name} x${quantity}</span>
  <span>$${lineTotal.toFixed(2)}</span>
`;
        finalItemsDiv.appendChild(finalRow);
    });

    const taxRate = 0.07;
    const deliveryFee = 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax + deliveryFee;

    if (checkoutTotalEl) {
        checkoutTotalEl.textContent = `Total: $${total.toFixed(2)}`;
    }
    finalTaxEl.textContent = `$${tax.toFixed(2)}`;
    finalTotalEl.textContent = `$${total.toFixed(2)}`;
    finalDeliveryEl.textContent = `$${deliveryFee.toFixed(2)} (FREE)`;

    // Set dynamic date/time
    const now = new Date();
    const dateTimeSpan = document.getElementById("final-date-time");
    if (dateTimeSpan) {
        dateTimeSpan.textContent = now.toLocaleString("en-US", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }
}

// Validate payment and then show final receipt
function validatePayment(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    const errorBox = document.getElementById("payment-errors");
    errorBox.innerHTML = "";
    const errors = [];

    const name = document.getElementById("card-name").value.trim();
    const numberRaw = document.getElementById("card-number").value.replace(/\s+/g, "");
    const exp = document.getElementById("card-exp").value.trim();
    const cvv = document.getElementById("card-cvv").value.trim();

    // Name check
    if (name.length === 0) {
        errors.push("Name on card is required.");
    }

    // Card number: 16 digits
    if (!/^\d{16}$/.test(numberRaw)) {
        errors.push("Card number must be exactly 16 digits (numbers only).");
    }

    // Expiry: MM/YY and valid month
    const expMatch = exp.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) {
        errors.push("Expiry must be in MM/YY format (MM/YY).");
    } else {
        const month = parseInt(expMatch[1], 10);
        if (month < 1 || month > 12) {
            errors.push("Expiry month must be between 01 and 12.");
        }
    }

    // CVV: 3–4 digits
    if (!/^\d{3,4}$/.test(cvv)) {
        errors.push("CVV must be 3 or 4 digits.");
    }

    if (errors.length > 0) {
        errorBox.innerHTML = errors.join("<br>");
        return;
    }

    // If all good: grab last 4 digits for receipt
    const last4 = numberRaw.slice(-4);
    const last4Span = document.getElementById("final-card-last4");
    if (last4Span) {
        last4Span.textContent = last4;
    }

    // Optional: use card name as "Customer"
    const customerSpan = document.getElementById("final-customer");
    if (customerSpan) {
        customerSpan.textContent = name;
    }

    alert("Payment successful! ✅");

    // Swap to final receipt
    document.getElementById("checkout-screen").style.display = "none";
    document.getElementById("final-receipt").style.display = "block";
}