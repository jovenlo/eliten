// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Your web app's Firebase configuration
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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing signup form...');
    
    const submit = document.getElementById('submit');
    const signupForm = document.getElementById('signupForm');
    
    if (!submit) {
        console.error('Submit button not found');
        return;
    }
    
    if (!signupForm) {
        console.error('Signup form not found');
        return;
    }

    // Handle form submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Form submitted');

        // Get input values
        const email = document.getElementById('signemail').value;
        const password = document.getElementById('signpass').value;

        console.log('Attempting to sign up with:', email);

        // Validate inputs
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        // Create user
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up successfully
                const user = userCredential.user;
                console.log('User created successfully:', user);
                alert("Account created successfully!");
                window.location.href = "loginpage.html";
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Signup error:', errorCode, errorMessage);
                
                // More user-friendly error messages
                let displayMessage = errorMessage;
                if (errorCode === 'auth/email-already-in-use') {
                    displayMessage = 'This email is already registered. Please use a different email or login.';
                } else if (errorCode === 'auth/invalid-email') {
                    displayMessage = 'Please enter a valid email address.';
                } else if (errorCode === 'auth/weak-password') {
                    displayMessage = 'Password should be at least 6 characters long.';
                } else if (errorCode === 'auth/network-request-failed') {
                    displayMessage = 'Network error. Please check your internet connection.';
                }
                
                alert(displayMessage);
            });
    });
}); 