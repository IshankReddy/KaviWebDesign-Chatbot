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