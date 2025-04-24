document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});

function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    let subtotal = 0;
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <button class="continue-shopping" onclick="window.location.href='collection.html'">
                    Continue Shopping
                </button>
            </div>
        `;
        updateSummary(0);
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cartItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image || item.imageUrl}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-price">₹${parseFloat(item.price).toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           min="1" onchange="updateQuantityInput(${index}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemElement);
        subtotal += parseFloat(item.price) * item.quantity;
    });
    
    updateSummary(subtotal);
}

function updateQuantity(index, change) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const newQuantity = cartItems[index].quantity + change;
    
    if (newQuantity < 1) {
        removeItem(index);
        return;
    }
    
    cartItems[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    loadCart();
}

function updateQuantityInput(index, value) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const newQuantity = parseInt(value);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
        loadCart();
        return;
    }
    
    cartItems[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    loadCart();
}

function removeItem(index) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    loadCart();
}

function updateSummary(subtotal) {
    const tax = subtotal * 0.1;
    const shipping = 5.99;
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

function proceedToCheckout() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    window.location.href = 'checkout.html';
} 