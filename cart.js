document.addEventListener('DOMContentLoaded', function() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
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
        return;
    }
    
    cartItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-price">₹${item.price.toFixed(2)}</span>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       min="1" onchange="updateQuantityInput(${index}, this.value)">
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    // Update totals
    const shipping = 5.99;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
});

function updateQuantity(index, change) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const newQuantity = cartItems[index].quantity + change;
    
    if (newQuantity < 1) return;
    
    cartItems[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    location.reload();
}

function updateQuantityInput(index, value) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const newQuantity = parseInt(value);
    
    if (newQuantity < 1) return;
    
    cartItems[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cartItems));
    location.reload();
}

function removeItem(index) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    location.reload();
} 