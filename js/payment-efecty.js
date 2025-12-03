document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('efectyForm');
    const phoneNumber = document.getElementById('phoneNumber');
    const idNumber = document.getElementById('idNumber');
    
    // Only allow numbers in phone
    if (phoneNumber) {
        phoneNumber.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Only allow numbers in ID
    if (idNumber) {
        idNumber.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const efectyData = {
                phoneNumber: phoneNumber.value,
                fullName: document.getElementById('fullName').value,
                idNumber: idNumber.value
            };
            
            // Save payment data
            saveUserData('efectyData', JSON.stringify(efectyData));
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-primary');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
            
            // Simulate payment processing
            setTimeout(function() {
                alert('¡Código de referencia enviado!\n\nRevisa tu mensaje de texto para obtener el código de referencia de Efecty.');
                clearUserData();
                window.location.href = 'index.html';
            }, 2000);
        });
    }
});