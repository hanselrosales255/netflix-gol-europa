document.addEventListener('DOMContentLoaded', function() {
    const email = getEmailFromUrl();
    if (email) {
        document.getElementById('userEmailDisplay').textContent = email;
        saveUserData('email', email);
    }
    
    // Resend email button
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', function() {
            const userEmail = getUserData('email');
            this.disabled = true;
            this.textContent = 'Reenviando...';
            
            sendEmail(userEmail, 'Vamos a crear tu cuenta', 'Email content...').then(() => {
                this.textContent = 'Enlace reenviado';
                setTimeout(() => {
                    this.disabled = false;
                    this.textContent = 'Reenviar enlace';
                }, 3000);
            });
        });
    }
    
    // Create password button
    const createPasswordBtn = document.getElementById('createPasswordBtn');
    if (createPasswordBtn) {
        createPasswordBtn.addEventListener('click', function() {
            const userEmail = getUserData('email');
            window.location.href = `password.html?email=${encodeURIComponent(userEmail)}`;
        });
    }
});