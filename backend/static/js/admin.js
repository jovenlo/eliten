// Modal functionality
const modal = document.getElementById('addProductModal');
const closeBtn = document.querySelector('.close');

function showAddProductModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

closeBtn.onclick = closeModal;
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Form submission
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            closeModal();
            location.reload();
        } else {
            alert('Error adding product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding product');
    }
});

// Product actions
async function editProduct(id) {
    // Implement edit functionality
    console.log('Edit product:', id);
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                location.reload();
            } else {
                alert('Error deleting product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting product');
        }
    }
}

// Sales chart
const ctx = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Sales',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: 'bisque',
            tension: 0.1
        }]
    },
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
        }
    }
}); 