// ============================================
// CONFIGURATION - Update this with your n8n webhook URL
// ============================================
const N8N_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
// Example: 'https://your-n8n-instance.com/webhook/your-webhook-id'

// ============================================
// DOM Elements
// ============================================
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const statusElement = document.getElementById('status');
const statusText = statusElement.querySelector('.status-text');

// ============================================
// Matrix Rain Background
// ============================================
function initMatrixRain() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// Utility Functions
// ============================================
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setStatus(status, text) {
    statusElement.className = 'status ' + status;
    statusText.textContent = text;
}

// ============================================
// Message Functions
// ============================================
function addMessage(type, prefix, text, withTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'prefix';
    prefixSpan.textContent = prefix;

    const textSpan = document.createElement('span');
    textSpan.className = 'text';

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = getTimestamp();

    messageDiv.appendChild(prefixSpan);
    messageDiv.appendChild(textSpan);
    messageDiv.appendChild(timestampSpan);
    messagesContainer.appendChild(messageDiv);

    if (withTyping) {
        typeText(textSpan, text);
    } else {
        textSpan.textContent = text;
    }

    scrollToBottom();
    return messageDiv;
}

function typeText(element, text, speed = 20) {
    let index = 0;
    element.innerHTML = '<span class="typing-cursor">█</span>';

    function type() {
        if (index < text.length) {
            element.innerHTML = text.substring(0, index + 1) + '<span class="typing-cursor">█</span>';
            index++;
            scrollToBottom();
            setTimeout(type, speed);
        } else {
            element.textContent = text;
        }
    }

    type();
}

// ============================================
// Chat Functions
// ============================================
async function sendMessage(message) {
    if (!message.trim()) return;

    // Add user message
    addMessage('user', '[YOU]', message);

    // Clear input
    userInput.value = '';
    userInput.disabled = true;

    // Set loading status
    setStatus('loading', 'TRANSMITTING...');

    // Check if webhook URL is configured
    if (N8N_WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL_HERE') {
        setTimeout(() => {
            addMessage('error', '[ERROR]', 'n8n webhook URL not configured. Edit script.js and set N8N_WEBHOOK_URL.', true);
            setStatus('error', 'NOT CONFIGURED');
            userInput.disabled = false;
            userInput.focus();
        }, 500);
        return;
    }

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Handle response - adjust based on your n8n workflow output
        const botResponse = data.response || data.message || data.output || JSON.stringify(data);
        addMessage('bot', '[MATRIX]', botResponse, true);
        setStatus('', 'READY');

    } catch (error) {
        console.error('Error:', error);
        addMessage('error', '[ERROR]', `Connection failed: ${error.message}`, true);
        setStatus('error', 'ERROR');
    } finally {
        userInput.disabled = false;
        userInput.focus();
    }
}

// ============================================
// Event Listeners
// ============================================
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !userInput.disabled) {
        sendMessage(userInput.value);
    }
});

// Focus input on click anywhere in terminal
document.querySelector('.terminal').addEventListener('click', () => {
    userInput.focus();
});

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    userInput.focus();

    // Add initial timestamps to system messages
    document.querySelectorAll('.message.system .timestamp').forEach(ts => {
        ts.textContent = getTimestamp();
    });
});
