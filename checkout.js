document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    let subtotal = 0;
    
    // Display cart items
    cartItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="item-quantity">
                <span>Qty: ${item.quantity}</span>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    // Update totals
    const shipping = 5.99;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Form validation
    const shippingForm = document.getElementById('shippingForm');
    shippingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all required fields
        const requiredFields = shippingForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (isValid) {
            // Save shipping information to localStorage
            const shippingInfo = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                phone: document.getElementById('phone').value
            };
            
            localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
            
            // Redirect to payment page
            window.location.href = 'payment.html';
        }
    });
}); 