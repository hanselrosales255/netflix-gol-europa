document.addEventListener('DOMContentLoaded', function() {
    const paymentButtons = document.querySelectorAll('.payment-method-btn');
    
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const method = this.dataset.method;
            saveUserData('paymentMethod', method);
            
            // Redirect to corresponding payment page
            switch(method) {
                case 'card':
                    window.location.href = 'payment-card.html';
                    break;
                case 'efecty':
                    window.location.href = 'payment-efecty.html';
                    break;
                case 'pse':
                    window.location.href = 'payment-pse.html';
                    break;
                case 'gift':
                    window.location.href = 'payment-giftcode.html';
                    break;
                default:
                    console.error('Unknown payment method:', method);
            }
        });
    });
});