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
            price: parseFloat(price),
            image: image,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart count
    updateCartCount();
    
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

// Function to display products
async function displayProducts() {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
    
    try {
        const products = await window.loadProducts();
        
        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<div class="no-products">No products available. Please check back later.</div>';
            return;
        }
        
        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price.toFixed(2)}</p>
                <p class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
                <p class="description">${product.description}</p>
                <div class="product-buttons">
                    <button onclick="viewProductDetails('${product.id || product._id}')" class="view-details-btn">View Details</button>
                    <button onclick="addToCart('${product.name}', ${product.price}, '${product.image_url}')" 
                            ${product.stock <= 0 ? 'disabled' : ''} class="add-to-cart-btn">
                        Add to Cart
                    </button>
                    <button onclick="buyNow('${product.name}', ${product.price}, '${product.image_url}')" 
                            ${product.stock <= 0 ? 'disabled' : ''} class="buy-now-btn">
                        Buy Now
                    </button>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<div class="error">Error loading products. Please try again later.</div>';
    }
}

// Function to view product details
function viewProductDetails(productId) {
    if (!productId) {
        console.error('Product ID is missing');
        return;
    }
    window.location.href = `product.html?id=${productId}`;
}

// Function to buy now
function buyNow(productName, price, imageUrl) {
    const cart = [{
        name: productName,
        price: price,
        imageUrl: imageUrl,
        quantity: 1
    }];
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

// Search functionality
async function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;
    
    try {
        const products = await window.loadProducts();
        
        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<div class="no-products">No products available.</div>';
            return;
        }
        
        productsContainer.innerHTML = '';
        
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        
        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = '<div class="no-products">No products found matching your search.</div>';
            return;
        }
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price.toFixed(2)}</p>
                <p class="stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
                <p class="description">${product.description}</p>
                <button onclick="addToCart('${product.name}', ${product.price}, '${product.image_url}')" 
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    Add to Cart
                </button>
            `;
            
            productsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error searching products:', error);
        productsContainer.innerHTML = '<div class="error">Error searching products. Please try again later.</div>';
    }
}

// Initialize products display when page loads
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateCartCount();
});

// Save product functionality
function saveProduct(button, product) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Please login to save products');
        window.location.href = 'loginpage.html';
        return;
    }

    let savedProducts = JSON.parse(localStorage.getItem(`savedProducts_${user.id}`)) || [];
    
    // Check if product is already saved
    const isSaved = savedProducts.some(p => p.id === product.id);
    
    if (isSaved) {
        // Remove from saved products
        savedProducts = savedProducts.filter(p => p.id !== product.id);
        button.classList.remove('saved');
        button.querySelector('i').classList.remove('fas');
        button.querySelector('i').classList.add('far');
    } else {
        // Add to saved products
        savedProducts.push(product);
        button.classList.add('saved');
        button.querySelector('i').classList.remove('far');
        button.querySelector('i').classList.add('fas');
    }
    
    localStorage.setItem(`savedProducts_${user.id}`, JSON.stringify(savedProducts));
}

// Check if products are saved when page loads
function checkSavedProducts() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const savedProducts = JSON.parse(localStorage.getItem(`savedProducts_${user.id}`)) || [];
    const saveButtons = document.querySelectorAll('.save-product-btn');
    
    saveButtons.forEach(button => {
        const productId = button.getAttribute('onclick').match(/id: '([^']+)'/)[1];
        if (savedProducts.some(p => p.id === productId)) {
            button.classList.add('saved');
            button.querySelector('i').classList.remove('far');
            button.querySelector('i').classList.add('fas');
        }
    });
}

// Initialize collection page
document.addEventListener('DOMContentLoaded', () => {
    checkSavedProducts();
}); 