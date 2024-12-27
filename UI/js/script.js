const btn = document.getElementById('menu-btn')
const menu = document.getElementById('menu')
const menuItems = menu.querySelectorAll('a')

// Toggle menu when hamburger button is clicked
btn.addEventListener('click', () => {
    btn.classList.toggle('open')
    menu.classList.toggle('hidden')
    menu.classList.toggle('flex')
})

// Close menu when a menu item is clicked
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        btn.classList.remove('open')
        menu.classList.add('hidden')
        menu.classList.remove('flex')
    })
})

function animateCounter(element, endValue, duration = 2000) {
  let startTimestamp = null;
  
  const animate = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * endValue);
    element.textContent = `${value}+`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}

/**
 * Initialize stats counters
 */
function initializeStats() {
  const stats = [
    { id: 'clientsCounter', value: 100 },
    { id: 'projectsCounter', value: 500 }
  ];

  stats.forEach(({ id, value }) => {
    const element = document.getElementById(id);
    if (element) {
      animateCounter(element, value);
    }
  });
}

function initializeTheme() {
    // Desktop elements
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Mobile elements
    const themeToggleDarkIconMobile = document.getElementById('theme-toggle-dark-icon-mobile');
    const themeToggleLightIconMobile = document.getElementById('theme-toggle-light-icon-mobile');
    const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');

    // Set initial theme
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggleLightIcon.classList.remove('hidden');
        themeToggleLightIconMobile.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleDarkIconMobile.classList.remove('hidden');
    }

    // Function to toggle theme
    function toggleTheme() {
        // Toggle icons for both desktop and mobile
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');
        themeToggleDarkIconMobile.classList.toggle('hidden');
        themeToggleLightIconMobile.classList.toggle('hidden');

        // If is set in localStorage
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    }

    // Add click handlers for both buttons
    themeToggleBtn.addEventListener('click', toggleTheme);
    themeToggleBtnMobile.addEventListener('click', toggleTheme);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeStats();
    initializeTheme();
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const loadingScreen = document.getElementById('chatbot-loading');
    const toggleIcon = document.getElementById('chatbot-toggle-icon');
    const closeIcon = document.getElementById('chatbot-close-icon');
    const notificationDot = document.getElementById('notification-dot');

    let isWindowOpen = false;
    let notificationInterval = null;
    let notificationSound = null;
    let isSoundInitialized = false;

    // Initialize sound only after user interaction
    function initializeSound() {
        if (!isSoundInitialized) {
            try {
                notificationSound = new Audio('sounds/notification.mp3');
                notificationSound.volume = 0.3;
                notificationSound.preload = 'auto';
                
                // Play and immediately pause to load the audio
                const playPromise = notificationSound.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        notificationSound.pause();
                        notificationSound.currentTime = 0;
                        isSoundInitialized = true;
                        console.log('Sound initialized successfully');
                        // Start notification after sound is initialized
                        startNotification();
                    }).catch(error => {
                        console.error('Sound initialization failed:', error);
                    });
                }
            } catch (error) {
                console.error('Error creating Audio object:', error);
            }
        }
    }

    // Function to play sound
    function playNotificationSound() {
        if (notificationSound && isSoundInitialized) {
            notificationSound.currentTime = 0;
            const playPromise = notificationSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing sound:', error);
                });
            }
        }
    }

    // Function to start notification
    function startNotification() {
        if (!isWindowOpen && !notificationInterval) {
            console.log('Starting notification...');
            
            // Add bounce animation
            chatbotToggle.classList.add('bounce-notification');
            
            // Show notification dot
            notificationDot.classList.remove('hidden');
            
            // Play sound if initialized
            if (isSoundInitialized) {
                playNotificationSound();
                
                notificationInterval = setInterval(() => {
                    playNotificationSound();
                }, 3000);
            }
        }
    }

    // Initialize sound on first user interaction
    document.addEventListener('click', function initSound() {
        initializeSound();
        document.removeEventListener('click', initSound);
    }, { once: true });

    // Function to stop notification
    function stopNotification() {
        console.log('Stopping notification...');
        
        // Remove bounce animation
        chatbotToggle.classList.remove('bounce-notification');
        
        // Hide notification dot
        notificationDot.classList.add('hidden');
        
        // Stop sound
        if (notificationSound) {
            notificationSound.pause();
            notificationSound.currentTime = 0;
        }
        
        // Clear interval
        if (notificationInterval) {
            clearInterval(notificationInterval);
            notificationInterval = null;
        }
    }

    // Toggle chatbot window
    chatbotToggle.addEventListener('click', () => {
        isWindowOpen = !isWindowOpen;
        chatbotWindow.classList.toggle('hidden');
        chatbotWindow.classList.toggle('chatbot-window-active');
        toggleIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        
        if (isWindowOpen) {
            stopNotification();
        } else {
            // Initialize sound if not already done
            if (!isSoundInitialized) {
                initializeSound();
            }
        }
    });

    // Start initial notification after 5 seconds (animation only if sound not ready)
    setTimeout(() => {
        if (isSoundInitialized) {
            startNotification();
        } else {
            // Start only animation if sound isn't ready
            chatbotToggle.classList.add('bounce-notification');
            notificationDot.classList.remove('hidden');
        }
    }, 5000);

    // Restart notification when window is closed
    chatbotWindow.addEventListener('transitionend', () => {
        if (!isWindowOpen) {
            setTimeout(startNotification, 10000);
        }
    });

    // Function to add message to chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-4 mb-4';
        
        // Format message by replacing ** with proper styling and | with table
        let formattedMessage = message;
        
        // Handle bold text formatting (**text**)
        formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
        
        // Handle table formatting - only if it looks like a proper table
        if (formattedMessage.includes('|')) {
            const lines = formattedMessage.split('\n');
            const tableLines = lines.filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
            
            if (tableLines.length >= 2) {
                const tableHTML = `
                    <div class="overflow-x-auto max-w-full">
                        <table class="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                            ${tableLines.map(line => {
                                const cells = line.split('|').filter(cell => cell.trim());
                                return `
                                    <tr>
                                        ${cells.map(cell => `
                                            <td class="border border-gray-300 dark:border-gray-600 px-2 py-1 whitespace-normal break-words">${cell.trim()}</td>
                                        `).join('')}
                                    </tr>
                                `;
                            }).join('')}
                        </table>
                    </div>
                `;
                formattedMessage = formattedMessage.replace(tableLines.join('\n'), tableHTML);
            }
        }
        
        const content = `
            <div class="flex-shrink-0">
                ${isUser ? `
                    <img src="img/light/User-Dark.svg" alt="User" class="w-10 h-10 dark:hidden">
                    <img src="img/dark/User-Light.svg" alt="User" class="w-10 h-10 hidden dark:block">
                ` : `
                    <img src="img/light/Logo-Dark.svg" alt="Assistant" class="w-10 h-10 dark:hidden">
                    <img src="img/dark/Logo-Light.svg" alt="Assistant" class="w-10 h-10 hidden dark:block">
                `}
            </div>
            <div class="${isUser ? 'bg-violet-100 dark:bg-violet-900' : 'bg-gray-100 dark:bg-gray-700'} rounded-lg p-4 max-w-[80%] overflow-hidden">
                <div class="text-gray-800 dark:text-gray-200 break-words">${formattedMessage}</div>
            </div>
        `;
        
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to send message to backend
    async function sendMessage(message) {
        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, I encountered an error. Please try again.';
        }
    }

    // Handle send message
    async function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Clear input
            chatInput.value = '';
            
            // Add user message to chat
            addMessage(message, true);
            
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'flex items-start space-x-2 mb-4 typing-indicator';
            typingDiv.innerHTML = `
                <div class="flex-shrink-0">
                    <img src="img/logo.svg" alt="Assistant" class="w-8 h-8">
                </div>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <p class="text-gray-800 dark:text-gray-200">Typing...</p>
                </div>
            `;
            chatMessages.appendChild(typingDiv);
            
            // Get response from backend
            const response = await sendMessage(message);
            
            // Remove typing indicator
            chatMessages.removeChild(typingDiv);
            
            // Add assistant response
            addMessage(response);
        }
    }

    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});