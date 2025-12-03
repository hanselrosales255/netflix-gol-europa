// ================================================
// NETFLIX CLONE - MAIN SCRIPT
// Script principal para index.html
// ================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== FAQ Accordion ==========
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
    
    // ========== Carousel Functionality ==========
    const carousel = document.querySelector('.carousel');
    const carouselContainer = document.querySelector('.carousel-container');
    const leftArrow = document.querySelector('.carousel-arrow-left');
    const rightArrow = document.querySelector('.carousel-arrow-right');
    
    if (carousel && leftArrow && rightArrow) {
        // Calculate scroll amount based on visible items
        function getScrollAmount() {
            const containerWidth = carouselContainer.offsetWidth;
            const itemWidth = carousel.querySelector('.carousel-item')?.offsetWidth || 0;
            const gap = 8;
            return (itemWidth + gap) * 3; // Scroll 3 items at a time
        }
        
        // Update arrow states
        function updateArrows() {
            const scrollLeft = carousel.scrollLeft;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            
            // Left arrow
            if (scrollLeft <= 0) {
                leftArrow.disabled = true;
            } else {
                leftArrow.disabled = false;
            }
            
            // Right arrow
            if (scrollLeft >= maxScroll - 1) {
                rightArrow.disabled = true;
            } else {
                rightArrow.disabled = false;
            }
        }
        
        // Initial arrow state
        updateArrows();
        
        // Left arrow click
        leftArrow.addEventListener('click', function() {
            const scrollAmount = getScrollAmount();
            carousel.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // Right arrow click
        rightArrow.addEventListener('click', function() {
            const scrollAmount = getScrollAmount();
            carousel.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // Update arrows on scroll
        carousel.addEventListener('scroll', updateArrows);
        
        // Update arrows on resize
        window.addEventListener('resize', updateArrows);
        
        // Touch Support
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        carousel.addEventListener('touchmove', function(e) {
            touchEndX = e.touches[0].clientX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', function() {
            const diff = touchStartX - touchEndX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                const scrollAmount = getScrollAmount();
                if (diff > 0) {
                    // Swipe left - scroll right
                    carousel.scrollBy({
                        left: scrollAmount,
                        behavior: 'smooth'
                    });
                } else {
                    // Swipe right - scroll left
                    carousel.scrollBy({
                        left: -scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
    
    // ========== Email Validation ==========
    function validateEmail(email) {
        // Validar formato básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }
        
        // Validar dominios comunes
        const validDomains = [
            'gmail.com', 'hotmail.com', 'outlook.com', 'outlook.es',
            'yahoo.com', 'yahoo.es', 'icloud.com', 'live.com',
            'msn.com', 'aol.com', 'protonmail.com', 'zoho.com',
            'mail.com', 'gmx.com', 'yandex.com'
        ];
        
        const domain = email.split('@')[1].toLowerCase();
        
        // Verificar si el dominio tiene al menos un punto después del @
        if (!domain || !domain.includes('.')) {
            return false;
        }
        
        // Aceptar dominios válidos comunes o dominios corporativos con formato válido
        return validDomains.includes(domain) || /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain);
    }
    
    function handleEmailValidation(input) {
        const email = input.value.trim();
        
        if (email.length > 0) {
            if (validateEmail(email)) {
                input.classList.remove('error');
                input.classList.add('success');
                return true;
            } else {
                input.classList.remove('success');
                input.classList.add('error');
                return false;
            }
        } else {
            input.classList.remove('error', 'success');
            return false;
        }
    }
    
    // ========== Form Submission Handler ==========
    function handleFormSubmit(form, emailInput, button) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            // Validate email
            if (!validateEmail(email)) {
                emailInput.classList.add('error');
                emailInput.focus();
                return;
            }
            
            // Show loading state
            button.classList.add('loading');
            button.disabled = true;
            
            // Simulate loading (in production, this would call an API)
            setTimeout(function() {
                // Redirect to signup page with email parameter
                window.location.href = `signup.html?email=${encodeURIComponent(email)}`;
            }, 1500);
        });
    }
    
    // ========== Setup Email Forms ==========
    
    // Hero email form
    const heroForm = document.getElementById('emailForm');
    const heroEmailInput = document.getElementById('emailInput');
    const heroButton = heroForm ? heroForm.querySelector('.btn-start') : null;
    
    if (heroForm && heroEmailInput && heroButton) {
        // Real-time validation on blur
        heroEmailInput.addEventListener('blur', function() {
            handleEmailValidation(this);
        });
        
        // Remove error on focus
        heroEmailInput.addEventListener('focus', function() {
            this.classList.remove('error');
        });
        
        // Clear validation on input
        heroEmailInput.addEventListener('input', function() {
            if (this.value.trim().length === 0) {
                this.classList.remove('error', 'success');
            }
        });
        
        // Handle form submission
        handleFormSubmit(heroForm, heroEmailInput, heroButton);
    }
    
    // Bottom email form (in FAQ section)
    const bottomForm = document.getElementById('emailFormBottom');
    const bottomEmailInput = document.getElementById('emailInputBottom');
    const bottomButton = bottomForm ? bottomForm.querySelector('.btn-start') : null;
    
    if (bottomForm && bottomEmailInput && bottomButton) {
        // Real-time validation on blur
        bottomEmailInput.addEventListener('blur', function() {
            handleEmailValidation(this);
        });
        
        // Remove error on focus
        bottomEmailInput.addEventListener('focus', function() {
            this.classList.remove('error');
        });
        
        // Clear validation on input
        bottomEmailInput.addEventListener('input', function() {
            if (this.value.trim().length === 0) {
                this.classList.remove('error', 'success');
            }
        });
        
        // Handle form submission
        handleFormSubmit(bottomForm, bottomEmailInput, bottomButton);
    }
    
    // ========== Smooth Scroll for Anchor Links ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========== Update Arrows on Resize ==========
    window.addEventListener('resize', function() {
        if (carousel && leftArrow && rightArrow) {
            updateArrows();
        }
    });
});

// ========== Prevent Form Resubmission on Refresh ==========
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}