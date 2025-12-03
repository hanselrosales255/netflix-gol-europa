let selectedPlan = 'premium';

const planData = {
    basic: {
        name: 'Básico',
        nameEn: 'Basic',
        resolution: '720p',
        price: '4,99',
        quality: 'Buena',
        qualityEn: 'Good',
        resolutionFull: '720p (HD)',
        spatialAudio: null,
        devices: 'TV, computadora, celular, tablet',
        watch: '1',
        download: '1'
    },
    standard: {
        name: 'Estándar',
        nameEn: 'Standard',
        resolution: '1080p',
        price: '7,99',
        quality: 'Excelente',
        qualityEn: 'Excellent',
        resolutionFull: '1080p (Full HD)',
        spatialAudio: null,
        devices: 'TV, computadora, celular, tablet',
        watch: '2',
        download: '2'
    },
    premium: {
        name: 'Premium',
        nameEn: 'Premium',
        resolution: '4K + HDR',
        price: '11,99',
        quality: 'Óptima',
        qualityEn: 'Optimal',
        resolutionFull: '4K (Ultra HD) + HDR',
        spatialAudio: 'Incluido',
        spatialAudioEn: 'Included',
        devices: 'TV, computadora, celular, tablet',
        watch: '4',
        download: '6'
    }
};

function showPlanSelect() {
    document.getElementById('planChoice').classList.add('hidden');
    document.getElementById('planSelect').classList.remove('hidden');
}

function updateMobilePlanInfo(plan) {
    const data = planData[plan];
    if (!data) return;
    
    // Get current language
    const currentLang = localStorage.getItem('netflix_lang') || 'es';
    
    // Update mobile view
    const mobilePlanHeader = document.querySelector('.mobile-plan-header');
    const mobilePlanName = document.getElementById('mobilePlanName');
    const mobilePlanResolution = document.getElementById('mobilePlanResolution');
    const mobilePrice = document.getElementById('mobilePrice');
    const mobileQuality = document.getElementById('mobileQuality');
    const mobileResolution = document.getElementById('mobileResolution');
    const mobileSpatial = document.getElementById('mobileSpatial');
    const mobileSpatialRow = document.getElementById('mobileSpatialRow');
    const mobileDevices = document.getElementById('mobileDevices');
    const mobileWatch = document.getElementById('mobileWatch');
    const mobileDownload = document.getElementById('mobileDownload');
    
    // Update header gradient based on plan
    if (mobilePlanHeader) {
        mobilePlanHeader.className = 'mobile-plan-header mobile-plan-' + plan;
    }
    
    if (mobilePlanName) mobilePlanName.textContent = currentLang === 'es' ? data.name : data.nameEn;
    if (mobilePlanResolution) mobilePlanResolution.textContent = data.resolution;
    if (mobilePrice) mobilePrice.textContent = data.price;
    if (mobileQuality) mobileQuality.textContent = currentLang === 'es' ? data.quality : data.qualityEn;
    if (mobileResolution) mobileResolution.textContent = data.resolutionFull;
    
    // Show/hide spatial audio row
    if (data.spatialAudio) {
        if (mobileSpatialRow) mobileSpatialRow.style.display = 'flex';
        if (mobileSpatial) mobileSpatial.textContent = currentLang === 'es' ? data.spatialAudio : data.spatialAudioEn;
    } else {
        if (mobileSpatialRow) mobileSpatialRow.style.display = 'none';
    }
    
    if (mobileDevices) mobileDevices.textContent = data.devices;
    if (mobileWatch) mobileWatch.textContent = data.watch;
    if (mobileDownload) mobileDownload.textContent = data.download;
}

function proceedToPayment() {
    localStorage.setItem('netflix_selected_plan', selectedPlan);
    console.log('📦 Plan saved to localStorage:', selectedPlan);
    window.location.href = 'payment.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const planCards = document.querySelectorAll('.plan-card');
    const mobilePlanBtns = document.querySelectorAll('.mobile-plan-btn');
    
    // Desktop cards click handler
    planCards.forEach(card => {
        card.addEventListener('click', function() {
            planCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedPlan = this.dataset.plan;
            console.log('📊 Plan selected (desktop):', selectedPlan);
            
            // Update mobile info when plan changes
            updateMobilePlanInfo(selectedPlan);
        });
    });
    
    // Mobile buttons click handler
    mobilePlanBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            mobilePlanBtns.forEach(b => b.classList.remove('mobile-plan-btn-active'));
            this.classList.add('mobile-plan-btn-active');
            selectedPlan = this.dataset.plan;
            console.log('📱 Plan selected (mobile):', selectedPlan);
            
            // Update mobile info when plan changes
            updateMobilePlanInfo(selectedPlan);
            
            // Also update desktop cards if they exist
            planCards.forEach(c => {
                if (c.dataset.plan === selectedPlan) {
                    planCards.forEach(card => card.classList.remove('selected'));
                    c.classList.add('selected');
                }
            });
        });
    });
    
    // Pre-select premium plan
    const premiumCard = document.querySelector('.plan-card[data-plan="premium"]');
    if (premiumCard) {
        premiumCard.classList.add('selected');
    }
    
    // Initialize mobile view with premium
    updateMobilePlanInfo('premium');
});
