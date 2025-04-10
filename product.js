// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Initialize products if not exists
if (!localStorage.getItem('products')) {
    const initialProducts = [
        {
            id: 1,
            name: "Classic Diamond Ring",
            price: 999.99,
            description: "A timeless diamond ring featuring a brilliant cut center stone.",
            imageUrl: "images/ring1.jpg",
            stock: 10
        },
        {
            id: 2,
            name: "Pearl Necklace",
            price: 499.99,
            description: "Elegant pearl necklace with 18k gold chain.",
            imageUrl: "images/necklace1.jpg",
            stock: 15
        },
        {
            id: 3,
            name: "Sapphire Earrings",
            price: 799.99,
            description: "Stunning sapphire earrings with diamond accents.",
            imageUrl: "images/earrings1.jpg",
            stock: 8
        }
    ];
    localStorage.setItem('products', JSON.stringify(initialProducts));
}

// Cart functionality
function addToCart(productName, price, imageUrl) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            imageUrl: imageUrl,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${productName} added to cart!`);
}

// Buy Now functionality
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

// Product display functionality
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        const productDetails = document.getElementById('product-details');
        productDetails.innerHTML = `
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="description">${product.description}</p>
                <p class="stock">Stock: ${product.stock}</p>
                <div class="product-buttons">
                    <button onclick="addToCart('${product.name}', ${product.price}, '${product.imageUrl}')">Add to Cart</button>
                    <button onclick="buyNow('${product.name}', ${product.price}, '${product.imageUrl}')" class="buy-now-btn">Buy Now</button>
                    <button onclick="window.location.href='collection.html'">Back to Collection</button>
                </div>
            </div>
        `;
    } else {
        document.getElementById('product-details').innerHTML = `
            <div class="error-message">
                <h2>Product not found</h2>
                <button onclick="window.location.href='collection.html'">Back to Collection</button>
            </div>
        `;
    }
});

// Review functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize reviews from localStorage or create empty array
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
    // Get the current product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Display existing reviews
    displayReviews(productId);
    
    // Handle star rating selection
    const stars = document.querySelectorAll('.rating-input i');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            selectedRating = rating;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Handle review form submission
    const reviewForm = document.getElementById('review-form');
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }
        
        const reviewTitle = document.getElementById('review-title').value;
        const reviewText = document.getElementById('review-text').value;
        
        // Create new review object
        const newReview = {
            id: Date.now(), // Unique ID for the review
            productId: productId,
            rating: selectedRating,
            title: reviewTitle,
            text: reviewText,
            date: new Date().toISOString()
        };
        
        // Add review to the array
        reviews.push(newReview);
        
        // Save to localStorage
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // Clear form
        reviewForm.reset();
        stars.forEach(star => star.classList.remove('active'));
        selectedRating = 0;
        
        // Display updated reviews
        displayReviews(productId);
        
        // Show success message
        alert('Thank you for your review!');
    });
});

// Function to display reviews
function displayReviews(productId) {
    const reviewsContainer = document.getElementById('reviews-container');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
    // Filter reviews for current product
    const productReviews = reviews.filter(review => review.productId === productId);
    
    if (productReviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
        return;
    }
    
    // Sort reviews by date (newest first)
    productReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate average rating
    const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
    
    // Update rating display
    document.querySelector('.rating-value').textContent = averageRating.toFixed(1);
    document.querySelector('.review-count').textContent = `(${productReviews.length} reviews)`;
    
    // Update rating distribution
    updateRatingDistribution(productReviews);
    
    // Display reviews
    reviewsContainer.innerHTML = productReviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <h4>${review.title}</h4>
                <div class="review-rating">
                    ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                    ${Array(5 - review.rating).fill('<i class="far fa-star"></i>').join('')}
                </div>
            </div>
            <p class="review-text">${review.text}</p>
            <p class="review-date">${new Date(review.date).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// Function to update rating distribution
function updateRatingDistribution(reviews) {
    const totalReviews = reviews.length;
    const ratingCounts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };
    
    reviews.forEach(review => {
        ratingCounts[review.rating]++;
    });
    
    // Update each rating bar
    for (let i = 5; i >= 1; i--) {
        const percentage = (ratingCounts[i] / totalReviews) * 100;
        const bar = document.querySelector(`.rating-bar:nth-child(${6 - i}) .bar`);
        const percentageSpan = document.querySelector(`.rating-bar:nth-child(${6 - i}) span:last-child`);
        
        if (bar && percentageSpan) {
            bar.style.width = `${percentage}%`;
            percentageSpan.textContent = `${Math.round(percentage)}%`;
        }
    }
} 