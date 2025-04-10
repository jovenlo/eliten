document.addEventListener('DOMContentLoaded', function() {
    // Load cart items and billing info from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const billingInfo = JSON.parse(localStorage.getItem('billingInfo')) || {};
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    // Check if cart is empty or billing info is missing
    if (cartItems.length === 0 || !billingInfo.fullName) {
        alert('Your cart is empty or billing information is missing. Redirecting to checkout...');
        window.location.href = 'checkout.html';
        return;
    }
    
    let subtotal = 0;
    
    // Display cart items
    cartItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.imageUrl || item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 5.99;
    const total = subtotal + tax + shipping;
    
    // Update display
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    
    // Payment method selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardForm = document.querySelector('.card-form');
    const paytmForm = document.querySelector('.paytm-form');
    const gpayForm = document.querySelector('.gpay-form');
    const upiForm = document.querySelector('.upi-form');
    
    // Set default payment method to card
    if (paymentOptions.length > 0) {
        paymentOptions[0].classList.add('active');
        cardForm.style.display = 'block';
        paytmForm.style.display = 'none';
        gpayForm.style.display = 'none';
        upiForm.style.display = 'none';
    }
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Show/hide appropriate form
            const method = this.dataset.method;
            cardForm.style.display = method === 'card' ? 'block' : 'none';
            paytmForm.style.display = method === 'paytm' ? 'block' : 'none';
            gpayForm.style.display = method === 'gpay' ? 'block' : 'none';
            upiForm.style.display = method === 'upi' ? 'block' : 'none';
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Add loading state to Pay Now button
    const payButton = document.querySelector('.pay-btn');
    if (payButton) {
        payButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Disable button and show loading state
            this.disabled = true;
            this.innerHTML = '<span class="spinner"></span> Processing...';
            
            // Process payment
            processPayment().finally(() => {
                // Re-enable button and restore original text
                this.disabled = false;
                this.innerHTML = 'Pay Now';
            });
        });
    }
});

function processPayment() {
    return new Promise((resolve, reject) => {
        console.log('Payment process started');
        const paymentMethod = document.querySelector('.payment-option.active');
        if (!paymentMethod) {
            alert('Please select a payment method');
            reject(new Error('No payment method selected'));
            return;
        }

        const method = paymentMethod.dataset.method;
        const total = parseFloat(document.getElementById('total').textContent.replace('₹', ''));
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const billingInfo = JSON.parse(localStorage.getItem('billingInfo')) || {};
        
        // Validate cart and billing info
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items to your cart before proceeding.');
            reject(new Error('Empty cart'));
            return;
        }

        if (!billingInfo.fullName || !billingInfo.email) {
            alert('Billing information is incomplete. Please complete your billing details.');
            reject(new Error('Incomplete billing info'));
            return;
        }

        if (method === 'card') {
            // Enhanced card validation
            const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry')?.value;
            const cvv = document.getElementById('cvv')?.value;
            const cardName = document.getElementById('cardName')?.value;
            
            const validationErrors = [];
            if (!cardNumber) validationErrors.push('Card number is required');
            if (!expiry) validationErrors.push('Expiry date is required');
            if (!cvv) validationErrors.push('CVV is required');
            if (!cardName) validationErrors.push('Cardholder name is required');
            
            if (validationErrors.length > 0) {
                alert(validationErrors.join('\n'));
                reject(new Error('Validation failed'));
                return;
            }
            
            // Luhn algorithm for card number validation
            if (!validateCardNumber(cardNumber)) {
                alert('Please enter a valid card number');
                reject(new Error('Invalid card number'));
                return;
            }
            
            // Validate expiry date format and future date
            if (!expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
                alert('Please enter a valid expiry date (MM/YY)');
                reject(new Error('Invalid expiry date'));
                return;
            }
            
            const [month, year] = expiry.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            
            if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                alert('Card has expired');
                reject(new Error('Card expired'));
                return;
            }
            
            // Validate CVV
            if (!cvv.match(/^[0-9]{3,4}$/)) {
                alert('Please enter a valid CVV (3 or 4 digits)');
                reject(new Error('Invalid CVV'));
                return;
            }
        } else if (method === 'upi') {
            const upiId = document.getElementById('upiId')?.value;
            if (!upiId || !upiId.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/)) {
                alert('Please enter a valid UPI ID');
                reject(new Error('Invalid UPI ID'));
                return;
            }
        }

        // Create order object
        const order = {
            items: cart,
            billingInfo: billingInfo,
            paymentMethod: method,
            total: total,
            date: new Date().toISOString(),
            status: 'pending'
        };

        // Save order to localStorage
        localStorage.setItem('latestOrder', JSON.stringify(order));

        // Redirect to appropriate payment portal
        switch(method) {
            case 'paytm':
                // Paytm integration with merchant ID
                const paytmUrl = `https://securegw.paytm.in/theia/processTransaction?ORDER_ID=${order.date.replace(/[^a-zA-Z0-9]/g, '')}&TXN_AMOUNT=${total}&CUST_ID=${billingInfo.email}&INDUSTRY_TYPE_ID=Retail&CHANNEL_ID=WEB&WEBSITE=WEBSTAGING&MID=8110038208@ptyes&CALLBACK_URL=${encodeURIComponent(window.location.origin + '/payment-success.html')}`;
                
                // Add loading state
                const payButton = document.querySelector('.pay-btn');
                if (payButton) {
                    payButton.disabled = true;
                    payButton.innerHTML = '<span class="spinner"></span> Redirecting to Paytm...';
                }
                
                try {
                    // Check if we're in a mobile environment
                    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                        window.location.href = paytmUrl;
                    } else {
                        // For desktop, open in new tab
                        const newWindow = window.open(paytmUrl, '_blank');
                        if (!newWindow) {
                            throw new Error('Popup blocked. Please allow popups for this site.');
                        }
                    }
                } catch (error) {
                    console.error('Paytm redirection error:', error);
                    alert('Error redirecting to Paytm. Please try again or use another payment method.');
                    if (payButton) {
                        payButton.disabled = false;
                        payButton.innerHTML = 'Pay Now';
                    }
                    reject(error);
                }
                break;
                
            case 'gpay':
                // Replace YOUR_UPI_ID with actual UPI ID
                const gpayUrl = `https://gpay.app.goo.gl/pay?pa=YOUR_UPI_ID&pn=${encodeURIComponent(billingInfo.fullName)}&am=${total}&cu=INR&tn=${encodeURIComponent('EITEN Order')}&tr=${order.date.replace(/[^a-zA-Z0-9]/g, '')}`;
                try {
                    if (navigator.userAgent.match(/Android/i)) {
                        window.location.href = gpayUrl;
                    } else {
                        window.open(gpayUrl, '_blank');
                    }
                } catch (error) {
                    console.error('Google Pay redirection error:', error);
                    alert('Error redirecting to Google Pay. Please try again or use another payment method.');
                    reject(error);
                }
                break;
                
            case 'upi':
                const upiId = document.getElementById('upiId').value;
                const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(billingInfo.fullName)}&am=${total}&cu=INR&tn=${encodeURIComponent('EITEN Order')}&tr=${order.date.replace(/[^a-zA-Z0-9]/g, '')}`;
                try {
                    if (navigator.userAgent.match(/Android/i)) {
                        window.location.href = upiUrl;
                    } else {
                        alert('Please open this page on an Android device with a UPI app installed, or use another payment method.');
                        reject(new Error('UPI not supported on this device'));
                    }
                } catch (error) {
                    console.error('UPI redirection error:', error);
                    alert('Error redirecting to UPI. Please try again or use another payment method.');
                    reject(error);
                }
                break;
                
            case 'card':
                try {
                    // Simulate card payment processing
                    setTimeout(() => {
                        // Update order status
                        order.status = 'completed';
                        localStorage.setItem('latestOrder', JSON.stringify(order));
                        
                        // Clear cart
                        localStorage.removeItem('cart');
                        
                        // Redirect to confirmation page
                        window.location.href = 'confirmation.html';
                        resolve();
                    }, 2000);
                } catch (error) {
                    console.error('Card payment error:', error);
                    alert('Error processing card payment. Please try again.');
                    reject(error);
                }
                break;
                
            default:
                alert('Invalid payment method selected');
                reject(new Error('Invalid payment method'));
                return;
        }
    });
}

// Luhn algorithm for card number validation
function validateCardNumber(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    // Remove any non-digit characters
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Check if the card number is empty or not a number
    if (!cardNumber || isNaN(cardNumber)) {
        return false;
    }
    
    // Check if the card number length is valid
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    // Luhn algorithm
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Add this function for Paytm checksum generation
function generateChecksum(orderId, amount, customerId) {
    // This is a placeholder for the actual checksum generation
    // In production, you should use Paytm's checksum generation API
    return 'CHECKSUMHASH';
} 