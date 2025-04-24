// Import Firebase auth
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7_cd0Y8ovsJpcveLg83ryTX60xCDNrSk",
    authDomain: "eliten-login.firebaseapp.com",
    projectId: "eliten-login",
    storageBucket: "eliten-login.firebasestorage.app",
    messagingSenderId: "761510615961",
    appId: "1:761510615961:web:e07ea84538d9beb0c25108"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to update profile icon visibility
function updateProfileIconVisibility() {
    const profileIcon = document.getElementById('profileIcon');
    const loginLink = document.querySelector('.navbar-link a[href="loginpage.html"]');
    
    if (!profileIcon) {
        console.error('Profile icon element not found');
        return;
    }
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in
            profileIcon.style.display = 'flex';
            if (loginLink) {
                loginLink.textContent = 'Logout';
                loginLink.href = '#';
                loginLink.onclick = async (e) => {
                    e.preventDefault();
                    await auth.signOut();
                    window.location.reload();
                };
            }
        } else {
            // User is not logged in
            profileIcon.style.display = 'none';
            if (loginLink) {
                loginLink.textContent = 'Login';
                loginLink.href = 'loginpage.html';
                loginLink.onclick = null;
            }
        }
    });
}

// Update profile icon visibility when the page loads
document.addEventListener('DOMContentLoaded', updateProfileIconVisibility); 