
// =====================================
// MERIT NOVA AI - LOGIN FUNCTIONALITY
// =====================================

// Show / Hide Password

const passwordInput = document.getElementById("password");
const showPassword = document.getElementById("showPassword");

showPassword.addEventListener("change", function () {
    passwordInput.type = this.checked ? "text" : "password";
});


// Email Login Form

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    alert("Login interface is working! Real account authentication will be connected later.");
});


// Google Login Button

document.getElementById("googleLogin").addEventListener("click", function () {
    alert("Google Sign-In will be connected after authentication setup.");
});


// Apple Login Button

document.getElementById("appleLogin").addEventListener("click", function () {
    alert("Apple Sign-In will be connected after authentication setup.");
});
