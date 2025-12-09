// =====================
// Tab switching
// =====================
const signinTab = document.getElementById('signinTab');
const createTab = document.getElementById('createTab');

const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');

// HIDE helper
function hide(el) {
    el.classList.add('hidden');
    el.classList.remove('active');
}

// SHOW helper
function show(el) {
    el.classList.remove('hidden');
    el.classList.add('active');
}

// --- Switch to Sign In ---
signinTab.addEventListener('click', () => {
    signinTab.classList.add('active');
    createTab.classList.remove('active');

    show(signinForm);
    hide(signupForm);

    console.log("Switched to Sign In");
});

// --- Switch to Create Account ---
createTab.addEventListener('click', () => {
    createTab.classList.add('active');
    signinTab.classList.remove('active');

    show(signupForm);
    hide(signinForm);

    console.log("Switched to Create Account");
});


// =====================
// SIGN UP FORM SUBMIT
// =====================
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!fullName || !email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    console.log("Signup Submitted:", { fullName, email, password });
    alert("Account created successfully!");
});


// =====================
// SIGN IN FORM SUBMIT
// =====================
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;

    if (!loginEmail || !loginPassword) {
        alert("Please enter both email and password.");
        return;
    }

    console.log("Login Submitted:", { loginEmail, loginPassword });
    alert("Logged in successfully!");
});


// =====================
// Input focus animation
// =====================
const inputs = document.querySelectorAll("input");

inputs.forEach(input => {
    input.addEventListener("focus", () => {
        input.parentElement.style.transform = "scale(1.01)";
    });

    input.addEventListener("blur", () => {
        input.parentElement.style.transform = "scale(1)";
    });
});
