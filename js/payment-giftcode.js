document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('giftCodeForm');
    const giftCode = document.getElementById('giftCode');
    
    // Convert to uppercase and remove spaces
    if (giftCode) {
        giftCode.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase().replace(/\s/g, '');
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const code = giftCode.value;
            
            // Validate code format (simple validation)
            if (code.length < 10) {
                alert('Por favor, ingresa un código válido.');
                return;
            }
            
            // Save gift code
            saveUserData('giftCode', code);
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-primary');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Canjeando...';
            
            // Simulate code validation
            setTimeout(function() {
                alert('¡Código canjeado exitosamente!\n\nTu membresía de Netflix ha sido activada.');
                clearUserData();
                window.location.href = 'index.html';
            }, 2000);
        });
    }
});