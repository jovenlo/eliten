function addToCart(name, price, image) {
    // Get existing cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.name === name && item.image === image);
    
    if (existingItem) {
        // If item exists, increase quantity
        existingItem.quantity += 1;
    } else {
        // If item doesn't exist, add new item
        cartItems.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Show success message
    alert('Item added to cart!');
}

// Update cart count in the header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Add or update cart count badge
    let cartBadge = document.querySelector('.cart-badge');
    if (!cartBadge) {
        cartBadge = document.createElement('span');
        cartBadge.className = 'cart-badge';
        document.querySelector('.button-cart').appendChild(cartBadge);
    }
    
    if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = 'block';
    } else {
        cartBadge.style.display = 'none';
    }
}

// Initialize cart count when page loads
document.addEventListener('DOMContentLoaded', updateCartCount); 