// Products Display Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDbP9PEX-5FoI2IHLAbiJk9cL-80a-cgkM",
        authDomain: "eliten-admin.firebaseapp.com",
        projectId: "eliten-admin",
        storageBucket: "eliten-admin.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Initialize Firestore
    const db = firebase.firestore();

    // Function to load products from Firestore
    function loadProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        db.collection('products')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                productsGrid.innerHTML = '';
                snapshot.forEach((doc) => {
                    const product = doc.data();
                    product.id = doc.id;
                    addProductToGrid(product);
                });
            });
    }

    // Function to add product to grid
    function addProductToGrid(product) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>₹${product.price.toFixed(2)}</p>
            <p>Stock: ${product.stock}</p>
            <p>${product.description}</p>
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
        `;
        
        productsGrid.appendChild(productCard);
    }

    // Function to add product to cart
    window.addToCart = function(productId) {
        db.collection('products').doc(productId).get().then((doc) => {
            const product = doc.data();
            if (!product) return;

            // Get existing cart from localStorage or create new one
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Check if product already in cart
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: 1
                });
            }

            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Product added to cart!');
        }).catch((error) => {
            console.error('Error adding to cart:', error);
            alert('Error adding product to cart. Please try again.');
        });
    };

    // Load products when page loads
    loadProducts();
}); 