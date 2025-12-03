document.addEventListener('DOMContentLoaded', function() {
    const email = getEmailFromUrl();
    if (email) {
        document.getElementById('emailDisplay').value = email;
        saveUserData('email', email);
    }
    
    const form = document.getElementById('passwordForm');
    const passwordInput = document.getElementById('passwordInput');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = passwordInput.value;
            if (password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            saveUserData('password', password);
            window.location.href = 'plan.html';
        });
    }
});