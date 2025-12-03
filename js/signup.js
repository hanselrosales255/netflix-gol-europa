document.addEventListener('DOMContentLoaded', function() {
    const email = getEmailFromUrl();
    if (email) {
        document.getElementById('userEmail').textContent = email;
        saveUserData('email', email);
    }
    
    // Send email button
    const sendBtn = document.querySelector('.btn-primary');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            const userEmail = getUserData('email');
            
            // Show loading
            this.disabled = true;
            this.textContent = 'Enviando...';
            
            // Simulate sending email
            sendEmail(userEmail, 'Vamos a crear tu cuenta', `
                ¡Hola!
                
                Nos encanta que estés aquí. Toca el enlace para crear tu cuenta y empezar a ver las series y películas de las que todo el mundo habla. Planes desde $18.900 al mes.
                
                [Crear tu cuenta]
                
                El enlace vence en 15 minutos.
                
                No te preocupes
                Usa esta dirección de email para iniciar sesión de manera segura desde donde quieras.
                
                Cancela cuando quieras
                Puedes cambiar o cancelar tu plan en cualquier momento.
                
                Entretenimiento ilimitado
                Ve todo el contenido que quieras, en todos tus dispositivos, a un precio accesible.
                
                ¿No solicitaste crear una cuenta de Netflix? Infórmalo.
                
                El equipo de Netflix
            `).then(() => {
                // Redirect to check email page
                window.location.href = `check-email.html?email=${encodeURIComponent(userEmail)}`;
            });
        });
    }
});