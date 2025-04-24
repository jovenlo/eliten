// Import Firebase auth
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";

// Make functions globally accessible
window.shownavbar = function() {
    const sideNav = document.querySelector('.side-nav');
    if (sideNav) {
        sideNav.style.display = 'block';
    }
};

window.closenavbar = function() {
    const sideNav = document.querySelector('.side-nav');
    if (sideNav) {
        sideNav.style.display = 'none';
    }
};

// Add event listener for window resize to handle mobile navigation
window.addEventListener('resize', () => {
    const sideNav = document.querySelector('.side-nav');
    if (window.innerWidth > 768 && sideNav) {
        sideNav.style.display = 'none';
    }
});

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

// Check if user is logged in
function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'loginpage.html';
                resolve(null);
            } else {
                resolve(user);
            }
        });
    });
}

// Load user profile data
async function loadProfile() {
    const user = await checkAuth();
    if (!user) return;

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem(`userData_${user.uid}`)) || {};
    
    document.getElementById('userName').textContent = user.displayName || 'User Name';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('fullName').textContent = userData.fullName || user.displayName || 'Not set';
    document.getElementById('phone').textContent = userData.phone || 'Not set';
    document.getElementById('address').textContent = userData.address || 'Not set';
    
    if (user.photoURL) {
        document.getElementById('profileAvatar').src = user.photoURL;
    }
}

// Handle profile edit
document.querySelector('.edit-profile-btn').addEventListener('click', () => {
    const modal = document.getElementById('editProfileModal');
    const user = auth.currentUser;
    
    if (user) {
        const userData = JSON.parse(localStorage.getItem(`userData_${user.uid}`)) || {};
        document.getElementById('editFullName').value = userData.fullName || user.displayName || '';
        document.getElementById('editPhone').value = userData.phone || '';
        document.getElementById('editAddress').value = userData.address || '';
    }
    
    modal.style.display = 'block';
});

// Close modal when clicking the X
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('editProfileModal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('editProfileModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle profile form submission
document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = await checkAuth();
    if (!user) return;
    
    const fullName = document.getElementById('editFullName').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    
    try {
        // Update Firebase profile
        await updateProfile(user, {
            displayName: fullName
        });
        
        // Save additional data to localStorage
        const userData = {
            fullName,
            phone,
            address
        };
        localStorage.setItem(`userData_${user.uid}`, JSON.stringify(userData));
        
        // Update UI
        document.getElementById('fullName').textContent = fullName;
        document.getElementById('phone').textContent = phone;
        document.getElementById('address').textContent = address;
        document.getElementById('userName').textContent = fullName;
        
        // Close modal
        document.getElementById('editProfileModal').style.display = 'none';
        
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
    }
});

// Handle avatar change
document.querySelector('.change-avatar-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Here you would typically upload the file to Firebase Storage
            // and update the user's photoURL
            alert('Avatar upload functionality coming soon!');
        }
    };
    
    input.click();
});

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
}); 