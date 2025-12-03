// Email service simulation
function sendEmail(to, subject, body) {
    console.log('Email sent to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    // In production, this would call a backend API
    return Promise.resolve({ success: true });
}

// Get email from URL
function getEmailFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email') || '';
}

// Save user data
function saveUserData(key, value) {
    localStorage.setItem(`netflix_${key}`, value);
}

// Get user data
function getUserData(key) {
    return localStorage.getItem(`netflix_${key}`);
}

// Clear user data
function clearUserData() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('netflix_'));
    keys.forEach(key => localStorage.removeItem(key));
}