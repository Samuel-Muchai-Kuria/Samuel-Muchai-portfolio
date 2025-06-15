

// Portfolio  - Updated with Analytics & Form Handling
document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // CONFIGURATION - Update these values
    // ==========================================
    
    const CONFIG = {
        // Google Sheets Web App URL for form submissions
        FORM_SHEET_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_FOR_FORMS',
        
        // Google Sheets Web App URL for analytics tracking
        ANALYTICS_SHEET_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_FOR_ANALYTICS',
        
        // Your email for form submissions (fallback)
        EMAIL: 'smuchaikuria@example.com',
        
        // Enable/disable analytics tracking
        ENABLE_ANALYTICS: true,
        
        // Enable/disable form submission to sheets
        ENABLE_FORM_SHEETS: true
    };

    // ==========================================
    // THEME MANAGEMENT
    // ==========================================
    
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Track theme toggle
        trackEvent('Theme Toggle', newTheme);
    });
    
    function updateThemeIcon(theme) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // ==========================================
    // SMOOTH SCROLLING FOR NAVIGATION
    // ==========================================
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Track navigation clicks
                trackEvent('Navigation Click', targetId.substring(1));
            }
        });
    });

    // ==========================================
    // SCROLL REVEAL ANIMATIONS
    // ==========================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll reveal
    const revealElements = document.querySelectorAll('.skill-category, .project-card, .blog-post, .highlight-item, .stat-card, .repo-card');
    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // ==========================================
    // NAVBAR SCROLL EFFECT
    // ==========================================
    
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            navbar.style.boxShadow = 'var(--shadow-lg)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });

    // ==========================================
    // CONTACT FORM HANDLING
    // ==========================================
    
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const formObject = Object.fromEntries(formData.entries());
        
        // Add timestamp
        formObject.timestamp = new Date().toISOString();
        formObject.userAgent = navigator.userAgent;
        formObject.referrer = document.referrer;
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            let success = false;
            
            // Try to submit to Google Sheets first
            if (CONFIG.ENABLE_FORM_SHEETS && CONFIG.FORM_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_FOR_FORMS') {
                success = await submitToGoogleSheets(formObject);
            }
            
            // Fallback to mailto if sheets fails or is not configured
            if (!success) {
                submitViaEmail(formObject);
                success = true;
            }
            
            if (success) {
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                this.reset();
                
                // Track form submission
                trackEvent('Form Submission', 'Contact Form');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('There was an error sending your message. Please try again or contact me directly.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    async function submitToGoogleSheets(formData) {
        try {
            const response = await fetch(CONFIG.FORM_SHEET_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Google Sheets submission failed:', error);
            return false;
        }
    }
    
    function submitViaEmail(formData) {
        const subject = encodeURIComponent('Portfolio Contact Form Submission');
        const body = encodeURIComponent(
            `Name: ${formData.name}\n` +
            `Email: ${formData.email}\n` +
            `Message: ${formData.message}\n\n` +
            `Sent at: ${formData.timestamp}`
        );
        
        window.location.href = `mailto:${CONFIG.EMAIL}?subject=${subject}&body=${body}`;
    }

    // ==========================================
    // NOTIFICATION SYSTEM
    // ==========================================
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                    box-shadow: var(--shadow-lg);
                }
                .notification-success { background: var(--success-color); }
                .notification-error { background: #ef4444; }
                .notification-info { background: var(--primary-color); }
                .notification.show { transform: translateX(0); }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => removeNotification(notification), 5000);
        
        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            removeNotification(notification);
        });
    }
    
    function removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // ==========================================
    // ANALYTICS TRACKING
    // ==========================================
    
    async function trackEvent(eventType, eventData, additionalData = {}) {
        if (!CONFIG.ENABLE_ANALYTICS) return;

        // Prepare tracking data for elements to be sent to Google Sheets
        const trackingData = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            eventData: eventData,
            url: window.location.href,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            ...additionalData
        };
        
        // Send to Google Sheets if configured
        if (CONFIG.ANALYTICS_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_FOR_ANALYTICS') {
            try {
                await fetch(CONFIG.ANALYTICS_SHEET_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(trackingData)
                });
            } catch (error) {
                console.error('Analytics tracking failed:', error);
            }
        }
        
        // Also log to console in development
        console.log('Event tracked:', trackingData);
    }
    
    // Track page load
    trackEvent('Page Load', 'Portfolio Visit', {
        loadTime: performance.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Track all external links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Track external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            trackEvent('External Link Click', href, {
                linkText: link.textContent.trim(),
                linkPosition: getLinkPosition(link)
            });
        }
        
        // Track internal navigation
        if (href.startsWith('#')) {
            trackEvent('Internal Link Click', href, {
                linkText: link.textContent.trim(),
                section: href.substring(1)
            });
        }
        
        // Track project links specifically
        if (link.classList.contains('project-link')) {
            trackEvent('Project Link Click', href, {
                projectTitle: link.closest('.project-card').querySelector('h3').textContent,
                linkType: link.textContent.includes('Demo') ? 'Demo' : 'Code'
            });
        }
        
        // Track download resume
        if (link.id === 'downloadResume') {
            trackEvent('Resume Download', 'Download Button Click');
        }
        
        // Track contact method clicks
        if (link.classList.contains('contact-method')) {
            trackEvent('Contact Method Click', href, {
                contactType: link.querySelector('h4').textContent
            });
        }
    });
    
    // Get link position
    function getLinkPosition(link) {
        const rect = link.getBoundingClientRect();
        return {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            section: getClosestSection(link)
        };
    }
    
   
    // Track section visibility on scroll
    function getClosestSection(element) {
        const section = element.closest('section');
        return section ? section.id : 'unknown';
    }

    // ==========================================
    // SCROLL TRACKING
    // ==========================================
    
    let maxScrollPercent = 0;
    let scrollCheckpoints = [25, 50, 75, 90, 100];
    let reachedCheckpoints = new Set();
    
    window.addEventListener('scroll', throttle(function() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        maxScrollPercent = Math.max(maxScrollPercent, scrollPercent);
        
        // Track scroll checkpoints
        scrollCheckpoints.forEach(checkpoint => {
            if (scrollPercent >= checkpoint && !reachedCheckpoints.has(checkpoint)) {
                reachedCheckpoints.add(checkpoint);
                trackEvent('Scroll Milestone', `${checkpoint}% of page`);
            }
        });
    }, 1000));
    
    // Track time spent on page
    let startTime = Date.now();
    let isActive = true;
    
    // Track when user becomes inactive
    ['blur', 'visibilitychange'].forEach(event => {
        document.addEventListener(event, function() {
            if (document.hidden || document.visibilityState === 'hidden') {
                if (isActive) {
                    const timeSpent = Math.round((Date.now() - startTime) / 1000);
                    trackEvent('Page Blur', 'User left page', {
                        timeSpent: timeSpent,
                        maxScrollPercent: maxScrollPercent
                    });
                    isActive = false;
                }
            } else {
                if (!isActive) {
                    startTime = Date.now();
                    trackEvent('Page Focus', 'User returned to page');
                    isActive = true;
                }
            }
        });
    });
    
    // Track page unload
    window.addEventListener('beforeunload', function() {
        if (isActive) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            trackEvent('Page Unload', 'User leaving page', {
                timeSpent: timeSpent,
                maxScrollPercent: maxScrollPercent
            });
        }
    });

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==========================================
    // ADDITIONAL INTERACTIVE FEATURES
    // ==========================================
    
    // Typing effect for hero section (optional)
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start typing effect after page load
        setTimeout(typeWriter, 1000);
    }
    
    // Skill tag hover tracking
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            trackEvent('Skill Hover', this.textContent);
        });
    });
    
    // Project card hover tracking
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const title = this.querySelector('h3')?.textContent;
            if (title) {
                trackEvent('Project Card Hover', title);
            }
        });
    });

    // ==========================================
    // PERFORMANCE TRACKING
    // ==========================================
    
    // Track page performance
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                trackEvent('Performance Metrics', 'Page Load Complete', {
                    loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                    totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                });
            }
        }, 1000);
    });
    
    console.log('🚀 Portfolio website loaded successfully!');
    console.log('📊 Analytics tracking:', CONFIG.ENABLE_ANALYTICS ? 'enabled' : 'disabled');
    console.log('📝 Form submissions:', CONFIG.ENABLE_FORM_SHEETS ? 'enabled' : 'disabled');
});