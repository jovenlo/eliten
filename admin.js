// Password Toggle Function
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

    const adminCredentials = {
        username: 'joshva',
        password: 'joshvadj18'
    };

    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        if (username === adminCredentials.username && password === adminCredentials.password) {
            adminLoginSection.style.display = 'none';
            adminDashboard.style.display = 'flex';
        } else {
            loginError.style.display = 'block';
        }
    });

    // Initialize products array in localStorage if it doesn't exist
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
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
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productData = {
            id: Date.now(), // Unique ID for the product
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            description: document.getElementById('product-description').value,
            image: document.getElementById('product-image').files[0]
        };

        // Save product to localStorage
        saveProduct(productData);
        
        // Reset form
        productForm.reset();
    });

    // Function to save product to localStorage
    function saveProduct(product) {
        const products = JSON.parse(localStorage.getItem('products'));
        
        // Convert image to base64
        if (product.image) {
            const reader = new FileReader();
            reader.onload = function(e) {
                product.imageUrl = e.target.result;
                delete product.image; // Remove the File object
                
                // Add product to array and save
                products.push(product);
                localStorage.setItem('products', JSON.stringify(products));
                
                // Update the UI
                addProductToGrid(product);
                updateInventoryTable();
            };
            reader.readAsDataURL(product.image);
        }
    }

    // Function to add product to grid
    function addProductToGrid(product) {
        const productsGrid = document.getElementById('products-grid');
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <p>Stock: ${product.stock}</p>
            <p>${product.description}</p>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    }

    // Function to delete product
    window.deleteProduct = function(productId) {
        let products = JSON.parse(localStorage.getItem('products'));
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Refresh the UI
        document.getElementById('products-grid').innerHTML = '';
        products.forEach(product => addProductToGrid(product));
        updateInventoryTable();
    };

    // Function to edit product
    window.editProduct = function(productId) {
        const products = JSON.parse(localStorage.getItem('products'));
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        const newName = prompt('Enter new product name:', product.name);
        if (newName === null) return;
        
        const newPrice = prompt('Enter new price:', product.price);
        if (newPrice === null) return;

        const newstock = prompt('Enter current Stock:', product.stock);
        if (newPrice === null) return;
        
        // Update product
        product.name = newName;
        product.price = parseFloat(newPrice);
        product.stock = newstock;
        
        // Save changes
        localStorage.setItem('products', JSON.stringify(products));
        
        // Refresh the UI
        document.getElementById('products-grid').innerHTML = '';
        products.forEach(product => addProductToGrid(product));
    };

    // Load existing products
    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products'));
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            addProductToGrid(product);
        });
    }

    // Initialize products grid
    loadProducts();

    // Analytics Functions
    function updateAnalytics() {
        const products = JSON.parse(localStorage.getItem('products'));
        const totalSales = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
        const totalProductsSold = products.reduce((sum, product) => sum + product.stock, 0);
        const avgOrderValue = totalProductsSold > 0 ? totalSales / totalProductsSold : 0;

        // Update analytics cards
        document.getElementById('total-sales').textContent = `$${totalSales.toLocaleString()}`;
        document.getElementById('total-products-sold').textContent = totalProductsSold.toLocaleString();
        document.getElementById('avg-order-value').textContent = `$${avgOrderValue.toFixed(2)}`;

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
});