// auth.js
import { auth } from './firebase-init.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Get forms and buttons
const signupForm = document.getElementById('signupForm');
const signinForm = document.getElementById('signinForm');
const googleBtn = document.querySelector('.google-btn');

// Get message box
const messageBox = document.getElementById('messageBox');

// Helper to show messages
function showMessage(message, type = 'error') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.classList.remove('hidden');
    setTimeout(() => messageBox.classList.add('hidden'), 5000);
}

// ===== SIGN UP =====
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('Please fill in all fields.');
        return;
    }

    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long.');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed up:', user);
        // Display email instead of name
        showMessage(`Welcome, ${user.email}! Your account has been created.`, 'success');
        signupForm.reset();
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 'auth/email-already-in-use') {
            showMessage('This email is already registered.');
        } else if (error.code === 'auth/invalid-email') {
            showMessage('Invalid email address.');
        } else {
            showMessage(error.message);
        }
    }
});

// ===== SIGN IN =====
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Please enter email and password.');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed in:', user);
        // Display email instead of name
        showMessage(`Welcome back, ${user.email}! Redirecting...`, 'success');

        setTimeout(() => {
            window.location.href = '/Dashboard.html';
        }, 1000);

        signinForm.reset();
    } catch (error) {
        console.error('Signin error:', error);
        if (error.code === 'auth/user-not-found') {
            showMessage('No account found with this email.');
        } else if (error.code === 'auth/wrong-password') {
            showMessage('Incorrect password. Please try again.');
        } else {
            showMessage(error.message);
        }
    }
});

// ===== GOOGLE LOGIN =====
googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('Google user signed in:', user);
        // Show email instead of display name
        showMessage(`Welcome, ${user.email}! Redirecting...`, 'success');

        setTimeout(() => {
            window.location.href = '/Dashboard.html';
        }, 1000);
    } catch (error) {
        console.error('Google Sign-In error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            showMessage('Sign-in popup closed before completing login.');
        } else if (error.code === 'auth/cancelled-popup-request') {
            showMessage('Another sign-in attempt is already in progress.');
        } else {
            showMessage('Google sign-in failed. Please try again.');
        }
    }
});
