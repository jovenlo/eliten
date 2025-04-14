// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('admin-password');
    const toggleIcon = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Admin Login
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminLoginSection = document.getElementById('admin-login-section');
    const loginError = document.getElementById('login-error');

    // Firebase configuration for authentication only
    const firebaseConfig = {
        apiKey: "AIzaSyDbP9PEX-5FoI2IHLAbiJk9cL-80a-cgkM",
        authDomain: "eliten-admin.firebaseapp.com",
        projectId: "eliten-admin",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase for authentication only
    let app;
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }

    // Initialize Firebase Auth
    const auth = firebase.auth();

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is signed in:', user.uid);
            adminLoginSection.style.display = 'none';
            adminDashboard.style.display = 'flex';
            // Load products when admin is logged in
            loadProducts();
        } else {
            console.log('No user is signed in');
            adminLoginSection.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    });

    // Admin Login Form Submission
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('User signed in successfully:', userCredential.user.uid);
            adminLoginSection.style.display = 'none';
            adminDashboard.style.display = 'flex';
            loginError.style.display = 'none';
            // Load products after successful login
            loadProducts();
        } catch (error) {
            console.error('Login error:', error);
            loginError.style.display = 'block';
            loginError.textContent = error.message;
        }
    });

    // Add logout functionality
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = function() {
        auth.signOut().then(() => {
            // Sign-out successful
            adminLoginSection.style.display = 'block';
            adminDashboard.style.display = 'none';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    };

    // Add logout button to admin sidebar
    const adminSidebar = document.querySelector('.admin-sidebar');
    if (adminSidebar) {
        adminSidebar.appendChild(logoutBtn);
    }

    // Tab Switching
    const menuItems = document.querySelectorAll('.admin-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}-section`).style.display = 'block';
            
            // If analytics tab is selected, update the chart
            if (tabName === 'analytics') {
                updateAnalytics();
            }
        });
    });

    // Product Form Submission
    const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            console.log('Form submitted, validating inputs...');
            // Validate form inputs
            const name = document.getElementById('product-name').value.trim();
            const price = parseFloat(document.getElementById('product-price').value);
            const stock = parseInt(document.getElementById('product-stock').value);
            const description = document.getElementById('product-description').value.trim();
            const imageFile = document.getElementById('product-image').files[0];

            console.log('Form inputs:', { name, price, stock, description, imageFile });

            // Validate inputs
            if (!name || name.length < 3) {
                throw new Error('Product name must be at least 3 characters long');
            }
            if (isNaN(price) || price <= 0) {
                throw new Error('Please enter a valid price greater than 0');
            }
            if (isNaN(stock) || stock < 0) {
                throw new Error('Please enter a valid stock quantity');
            }
            if (!description || description.length < 10) {
                throw new Error('Description must be at least 10 characters long');
            }
            if (!imageFile) {
                throw new Error('Please select a product image');
            }
            if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
                throw new Error('Image size should be less than 5MB');
            }

            const productData = {
                name: name,
                price: price,
                stock: stock,
                description: description,
                image: imageFile
            };

            // Show loading state
            const submitBtn = productForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Adding Product...';
            submitBtn.disabled = true;

            console.log('Attempting to save product...');
            // Save product using Supabase
            const productId = await window.saveProduct(productData);
            console.log('Product saved successfully with ID:', productId);
            
            // Reset form and button state
            productForm.reset();
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            // Show success message
            showNotification('Product added successfully!', 'success');
            
            // Reload products list
            await loadProducts();
        } catch (error) {
            console.error('Error in form submission:', error);
            showNotification(error.message, 'error');
            
            // Reset button state
            const submitBtn = productForm.querySelector('.submit-btn');
            submitBtn.textContent = 'Add Product';
            submitBtn.disabled = false;
        }
    });

    // Function to load products from Supabase
    async function loadProducts() {
        console.log('Loading products...');
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }

        try {
            productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
            
            const products = await window.loadProducts();
            
            productsGrid.innerHTML = '';
            
            if (!products || products.length === 0) {
                productsGrid.innerHTML = '<div class="no-products">No products found. Add your first product!</div>';
                return;
            }

            products.forEach(product => {
                addProductToGrid(product);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '<div class="error">Error loading products. Please try again.</div>';
            showNotification('Error loading products. Please try again.', 'error');
        }
    }

    // Function to add product to grid
    function addProductToGrid(product) {
        console.log('Creating product card for:', product);
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
            <h3>${product.name}</h3>
            <p>₹${product.price.toFixed(2)}</p>
            <p>Stock: ${product.stock}</p>
            <p>${product.description}</p>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
        console.log('Product card added to grid');
    }

    // Function to delete product
    window.deleteProduct = async function(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await window.deleteProduct(productId);
                showNotification('Product deleted successfully!', 'success');
                loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Error deleting product. Please try again.', 'error');
            }
        }
    };

    // Function to edit product
    window.editProduct = async function(productId) {
        try {
            const products = await window.loadProducts();
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const newName = prompt('Enter new product name:', product.name);
            if (newName === null) return;
            
            const newPrice = prompt('Enter new price:', product.price);
            if (newPrice === null) return;

            const newStock = prompt('Enter current Stock:', product.stock);
            if (newStock === null) return;

            // Update product in Supabase
            await window.updateProduct(productId, {
                name: newName,
                price: parseFloat(newPrice),
                stock: parseInt(newStock)
            });

            showNotification('Product updated successfully!', 'success');
            loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Error updating product. Please try again.', 'error');
        }
    };

    // Analytics Functions
    function updateAnalytics() {
        const products = JSON.parse(localStorage.getItem('products'));
        const totalSales = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
        const totalProductsSold = products.reduce((sum, product) => sum + product.stock, 0);
        const avgOrderValue = totalProductsSold > 0 ? totalSales / totalProductsSold : 0;

        document.getElementById('total-sales').textContent = `₹${totalSales.toFixed(2)}`;
        document.getElementById('total-products-sold').textContent = totalProductsSold;
        document.getElementById('avg-order-value').textContent = `₹${avgOrderValue.toFixed(2)}`;

        // Update chart
        updateSalesChart();
    }

    function updateSalesChart() {
        const ctx = document.getElementById('sales-chart').getContext('2d');
        const products = JSON.parse(localStorage.getItem('products'));
        
        // Create monthly sales data
        const monthlySales = Array(12).fill(0);
        products.forEach(product => {
            const month = new Date().getMonth();
            monthlySales[month] += product.price * product.stock;
        });

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Sales',
                data: monthlySales,
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Sales'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        new Chart(ctx, config);
    }

    // Inventory Management
    function updateInventoryTable() {
        const inventoryBody = document.getElementById('inventory-body');
        const products = JSON.parse(localStorage.getItem('products'));

        inventoryBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td>0</td>
                <td>${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>
                <td>
                    <button onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Initialize inventory table
    updateInventoryTable();

    // Initialize products when page loads
    loadProducts();

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add notification to the page
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        
        .notification.success {
            background-color: #28a745;
        }
        
        .notification.error {
            background-color: #dc3545;
        }
        
        .notification.info {
            background-color: #17a2b8;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});

// Mobile Navigation Functions
function shownavbar() {
    const sideNav = document.querySelector('.side-nav');
    const body = document.body;
    
    // Show the side navigation
    sideNav.style.display = 'block';
    
    // Add animation class
    sideNav.classList.add('slide-in');
    
    // Prevent body scrolling when menu is open
    body.style.overflow = 'hidden';
}

function closenavbar() {
    const sideNav = document.querySelector('.side-nav');
    const body = document.body;
    
    // Remove animation class
    sideNav.classList.remove('slide-in');
    sideNav.classList.add('slide-out');
    
    // Allow body scrolling again
    body.style.overflow = 'auto';
    
    // Hide the side navigation after animation
    setTimeout(() => {
        sideNav.style.display = 'none';
        sideNav.classList.remove('slide-out');
    }, 300);
}

// Add styles for mobile navigation
const style = document.createElement('style');
style.textContent = `
    .side-nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 250px;
        height: 100vh;
        background-color: #fff;
        z-index: 1000;
        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
    }

    .side-nav.slide-in {
        transform: translateX(0);
    }

    .side-nav.slide-out {
        transform: translateX(-100%);
    }

    .side-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .side-nav-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
    }

    .side-navbar-links {
        padding: 1rem;
    }

    .tog-navbar-link {
        display: block;
        padding: 0.75rem 1rem;
        color: #333;
        text-decoration: none;
        border-bottom: 1px solid #eee;
        transition: background-color 0.3s;
    }

    .tog-navbar-link:hover {
        background-color: #f5f5f5;
    }

    @media (max-width: 768px) {
        .nav-toggle {
            display: block;
        }
        
        .nav-links {
            display: none;
        }
    }
`;
document.head.appendChild(style);