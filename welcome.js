// Check if user is new (not logged in)
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has visited before using localStorage
    if (!localStorage.getItem('hasVisited')) {
        // Show welcome modal
        showWelcomeModal();
        // Mark user as visited
        localStorage.setItem('hasVisited', 'true');
    }
});

function showWelcomeModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'welcome-modal';
    modal.innerHTML = `
        <div class="welcome-modal-content">
            <h2>Welcome to ELITEN!</h2>
            <p>Discover our premium jewelry collection</p>
            <div class="welcome-buttons">
                <a href="loginpage.html" class="welcome-btn login-btn">Login</a>
                <a href="signuppage.html" class="welcome-btn signup-btn">Sign Up</a>
            </div>
            <button class="close-modal" aria-label="Close welcome modal">×</button>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .welcome-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .welcome-modal-content {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            position: relative;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .welcome-modal h2 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2rem;
        }

        .welcome-modal p {
            color: #666;
            margin-bottom: 2rem;
        }

        .welcome-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .welcome-btn {
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .login-btn {
            background-color: #007bff;
            color: white;
        }

        .signup-btn {
            background-color: #28a745;
            color: white;
        }

        .welcome-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .close-modal {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }

        .close-modal:hover {
            color: #333;
        }
    `;
    document.head.appendChild(style);

    // Add close functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
} 