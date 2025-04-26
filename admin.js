// Initialize Supabase client
const supabaseUrl = 'https://bjcwyyifoklzvtfcxjnz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqY3d5eWlmb2tsenZ0ZmN4am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjM3MTQsImV4cCI6MjA2MDE5OTcxNH0.S3TAzmjSqE9VZkoUEdRMCVivpKmA0DEmN1rH9RqofFQ';

// Wait for Supabase to be loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase not loaded');
        return;
    }
    
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    window.supabaseClient = supabase; // Make it globally available
    
    console.log('Supabase client initialized:', supabase);
    
    // Rest of your initialization code...
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
    
    // Allow body scrolling
    body.style.overflow = '';
    
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

    // Ensure Firebase is used for admin login
    const firebaseConfig = {
        apiKey: "AIzaSyDbP9PEX-5FoI2IHLAbiJk9cL-80a-cgkM",
        authDomain: "eliten-admin.firebaseapp.com",
        projectId: "eliten-admin",
        storageBucket: "eliten-admin.appspot.com",
        messagingSenderId: "1234567890",
        appId: "1:1234567890:web:abcdef1234567890"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

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
            
            // Force refresh inventory
            await initializeInventory();
            
            // Verify the product was added correctly
            const { data: addedProduct, error: fetchError } = await window.supabaseClient
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (fetchError) {
                throw new Error('Failed to verify product addition: ' + fetchError.message);
            }

            if (!addedProduct || addedProduct.stock !== stock) {
                throw new Error('Stock synchronization error: Product stock mismatch');
            }

            console.log('Product verified in database:', addedProduct);
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
        try {
            console.log('Loading products...');
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }

            productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

            const { data: products, error } = await window.supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            productsGrid.innerHTML = '';

            if (!products || products.length === 0) {
                productsGrid.innerHTML = '<div class="no-products">No products found. Add your first product!</div>';
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
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
            });
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification('Error loading products: ' + error.message, 'error');
        }
    }

    // Attach loadProducts to window for global access
    window.loadProducts = loadProducts;

    // Function to edit product
    window.editProduct = async function(productId) {
        try {
            console.log('Editing product:', productId);
            
            // Fetch the current product data
            const { data: product, error: fetchError } = await window.supabaseClient
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (fetchError) {
                console.error('Error fetching product:', fetchError);
                throw fetchError;
            }

            if (!product) {
                throw new Error('Product not found');
            }

            // Create edit form
            const editForm = document.createElement('div');
            editForm.className = 'edit-product-form';
            editForm.innerHTML = `
                <h3>Edit Product</h3>
                <form id="edit-product-form">
                    <div class="form-group">
                        <label for="edit-name">Product Name</label>
                        <input type="text" id="edit-name" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-price">Price</label>
                        <input type="number" id="edit-price" value="${product.price}" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-stock">Stock</label>
                        <input type="number" id="edit-stock" value="${product.stock || 0}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-description">Description</label>
                        <textarea id="edit-description" required>${product.description}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">Save Changes</button>
                        <button type="button" class="cancel-btn" onclick="closeEditForm()">Cancel</button>
                    </div>
                </form>
            `;

            // Add form to the page
            document.body.appendChild(editForm);

            // Handle form submission
            document.getElementById('edit-product-form').addEventListener('submit', async function(e) {
                e.preventDefault();

                try {
                    const updatedProduct = {
                        name: document.getElementById('edit-name').value,
                        price: parseFloat(document.getElementById('edit-price').value),
                        stock: parseInt(document.getElementById('edit-stock').value),
                        description: document.getElementById('edit-description').value,
                        updated_at: new Date().toISOString()
                    };

                    console.log('Updating product:', updatedProduct);

                    const { error: updateError } = await window.supabaseClient
                        .from('products')
                        .update(updatedProduct)
                        .eq('id', productId);

                    if (updateError) {
                        throw updateError;
                    }

            showNotification('Product updated successfully!', 'success');
                    closeEditForm();
                    
                    // Refresh both products list and inventory
                    await loadProducts();
                    await initializeInventory();
        } catch (error) {
            console.error('Error updating product:', error);
                    showNotification('Error updating product: ' + error.message, 'error');
                }
            });
        } catch (error) {
            console.error('Error in editProduct:', error);
            showNotification('Error editing product: ' + error.message, 'error');
        }
    };

    // Function to close edit form
    window.closeEditForm = function() {
        const editForm = document.querySelector('.edit-product-form');
        if (editForm) {
            editForm.remove();
        }
    };

    // Function to delete product
    window.deleteProduct = async function(productId) {
        try {
            if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                return;
            }

            console.log('Deleting product:', productId);

            const { error: deleteError } = await window.supabaseClient
                .from('products')
                .delete()
                .eq('id', productId);

            if (deleteError) {
                throw deleteError;
            }

            showNotification('Product deleted successfully!', 'success');
            initializeInventory(); // Refresh the inventory
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            showNotification('Error deleting product: ' + error.message, 'error');
        }
    };

    // Add styles for edit form
    const editFormStyle = document.createElement('style');
    editFormStyle.textContent = `
        .edit-product-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .edit-product-form h3 {
            margin-top: 0;
            color: #333;
        }

        .edit-product-form .form-group {
            margin-bottom: 1rem;
        }

        .edit-product-form label {
            display: block;
            margin-bottom: 0.5rem;
            color: #666;
        }

        .edit-product-form input,
        .edit-product-form textarea {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }

        .edit-product-form textarea {
            min-height: 100px;
            resize: vertical;
        }

        .edit-product-form .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .edit-product-form .submit-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        }

        .edit-product-form .cancel-btn {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        }

        .edit-product-form .submit-btn:hover {
            background-color: #45a049;
        }

        .edit-product-form .cancel-btn:hover {
            background-color: #d32f2f;
        }
    `;
    document.head.appendChild(editFormStyle);

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

    // Render inventory table
    function renderInventoryTable(data) {
    const inventoryTable = document.querySelector('.inventory-table tbody');
        if (!inventoryTable) {
            console.error('Inventory table element not found');
            return;
        }

        console.log('Rendering inventory table with data:', data);
        inventoryTable.innerHTML = '';

        if (data.length === 0) {
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="3" class="no-data">No products found</td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.stock}</td>
                <td>0</td>
            `;
            inventoryTable.appendChild(row);
        });
    }

    // Initialize inventory display
    async function initializeInventory() {
        try {
            console.log('Initializing inventory...');
            
            // Check if user is authenticated
            const user = firebase.auth().currentUser;
            if (!user) {
                console.error('User not authenticated');
                showNotification('Please login to access inventory', 'error');
                return;
            }

            // Get inventory table element
            const inventoryTable = document.querySelector('.inventory-table tbody');
            if (!inventoryTable) {
                console.error('Inventory table element not found');
                return;
            }

            // Load products from Supabase
            console.log('Loading products for inventory...');
            const { data: products, error } = await window.supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading products:', error);
                throw error;
            }

            console.log('Products loaded for inventory:', products);

            if (!products || products.length === 0) {
                console.log('No products found');
                renderInventoryTable([]);
                return;
            }

            // Transform products data for inventory display
            const inventoryData = products.map(product => ({
                id: product.id,
                name: product.name,
                stock: product.stock || 0
            }));

            console.log('Rendering inventory table...');
            renderInventoryTable(inventoryData);
        } catch (error) {
            console.error('Error in initializeInventory:', error);
            showNotification('Error loading inventory data', 'error');
        }
    }

    // Filter and sort inventory
    async function filterAndSortInventory() {
        try {
            console.log('Filtering and sorting inventory...');
            
            // Get filter values
            const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
            const stockFilter = document.getElementById('stock-filter').value;
            const sortBy = document.getElementById('sort-by').value;

            // Load products from Supabase
            const { data: products, error } = await window.supabaseClient
                .from('products')
                .select('*');

            if (error) {
                console.error('Error loading products for filtering:', error);
                throw error;
            }

            let filteredData = products.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                lowStockThreshold: product.low_stock_threshold || 5
            }));

            // Apply search filter
            if (searchTerm) {
                filteredData = filteredData.filter(item => 
                    item.name.toLowerCase().includes(searchTerm)
                );
            }

            // Apply stock status filter
            if (stockFilter !== 'all') {
                filteredData = filteredData.filter(item => {
                    const status = getStockStatus(item.stock, item.lowStockThreshold);
                    return status === stockFilter;
                });
            }

            // Apply sorting
            filteredData.sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'stock':
                        return a.stock - b.stock;
                    case 'sold':
                        return 0; // Add sold count logic if needed
                    default:
                        return 0;
                }
            });

            console.log('Filtered and sorted data:', filteredData);
            renderInventoryTable(filteredData);
        } catch (error) {
            console.error('Error in filterAndSortInventory:', error);
            showNotification('Error filtering inventory data', 'error');
        }
    }

    // Add event listeners for inventory controls
    document.getElementById('inventory-search').addEventListener('input', filterAndSortInventory);
    document.getElementById('stock-filter').addEventListener('change', filterAndSortInventory);
    document.getElementById('sort-by').addEventListener('change', filterAndSortInventory);

    // Initialize when user is authenticated
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            initializeInventory();
        }
    });

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

// Function to save a product to Supabase
window.saveProduct = async function(productData) {
    try {
        console.log('Saving product to Supabase:', productData);

        // Upload product image to Supabase Storage
        const { data: storageData, error: storageError } = await window.supabaseClient.storage
            .from('product-images')
            .upload(`images/${productData.image.name}`, productData.image, {
                cacheControl: '3600',
                upsert: true
            });

        if (storageError) {
            console.error('Error uploading product image:', storageError);
            throw storageError;
        }

        // Get the public URL of the uploaded image
        const imageUrl = window.supabaseClient.storage
            .from('product-images')
            .getPublicUrl(storageData.path).publicUrl;

        // Save product details to the Supabase `products` table
        const { data, error } = await window.supabaseClient.from('products').insert([
            {
                name: productData.name,
                price: productData.price,
                stock: productData.stock,
                low_stock_threshold: 5, // Default low stock threshold
                description: productData.description,
                image_url: imageUrl,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ]).select();

        if (error) {
            console.error('Error saving product to Supabase:', error);
            throw error;
        }

        console.log('Product saved successfully:', data);
        
        // Verify the product was saved correctly
        if (!data || data.length === 0) {
            throw new Error('Failed to save product: No data returned');
        }

        const savedProduct = data[0];
        if (savedProduct.stock !== productData.stock) {
            throw new Error('Stock synchronization error: Saved stock does not match input');
        }

        // Refresh inventory after adding new product
        await initializeInventory();
        
        return savedProduct.id;
    } catch (error) {
        console.error('Error in saveProduct function:', error);
        throw error;
    }
};