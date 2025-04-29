// Load cart items and calculate totals
function loadCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemsContainer = document.getElementById('checkout-items');
    itemsContainer.innerHTML = '';

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>₹${item.price.toFixed(2)} x ${item.quantity || 1}</p>
            </div>
        `;
        itemsContainer.appendChild(itemElement);
        subtotal += item.price * (item.quantity || 1);
    });

    const tax = 1; // Fixed tax of 1 rupee
    const shipping = 0; // Free shipping
    const total = subtotal + tax + shipping;

    document.getElementById('checkout-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('checkout-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `₹${total.toFixed(2)}`;
}

// Proceed to payment page
function proceedToPayment() {
    const form = document.getElementById('billing-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Save billing information
    const billingInfo = {
        fullName: document.getElementById('full-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        state: document.getElementById('state').value.trim(),
        country: document.getElementById('country').value.trim()
    };

    // Validate required fields
    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.phone || 
        !billingInfo.address || !billingInfo.state || !billingInfo.country) {
        showError('Please fill in all required fields');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
        showError('Please enter a valid email address');
        return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(billingInfo.phone)) {
        showError('Please enter a valid phone number');
        return;
    }

    // Save billing info to localStorage
    localStorage.setItem('billingInfo', JSON.stringify(billingInfo));

    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('billing-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', loadCheckoutItems); 