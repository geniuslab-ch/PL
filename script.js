/* ========================================
   PANNA LEAGUE — JAVASCRIPT
   Interactivity, Forms & Navigation
   ======================================== */

// ========================================
// 1. Mobile Navigation Handler
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    if (navMenu) {
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburger && navMenu) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
});

// ========================================
// 2. Player Registration Form
// ========================================

const playerForm = document.getElementById('playerForm');
if (playerForm) {
    playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validatePlayerForm(playerForm)) {
            return;
        }

        // Collect form data
        const formData = new FormData(playerForm);
        const data = Object.fromEntries(formData);

        // Log to console (in production, this would be sent to a backend)
        console.log('Player Registration Submitted:', data);
        console.log('⚠️  Note: Form data not yet connected to database. See README for integration instructions.');

        // Store in localStorage for demonstration
        const registrations = JSON.parse(localStorage.getItem('pannaTempRegistrations') || '[]');
        registrations.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pannaTempRegistrations', JSON.stringify(registrations));

        // Show success message
        showPlayerSuccess(playerForm);
    });
}

// Validate player form
function validatePlayerForm(form) {
    const firstName = form.querySelector('#first-name');
    const lastName = form.querySelector('#last-name');
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const ageGroup = form.querySelector('#age-group');
    const contactAgree = form.querySelector('#contact-agree');

    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });

    // Validate first name
    if (!firstName.value.trim()) {
        showFieldError(firstName, 'First name is required');
        isValid = false;
    }

    // Validate last name
    if (!lastName.value.trim()) {
        showFieldError(lastName, 'Last name is required');
        isValid = false;
    }

    // Validate email
    if (!isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate phone (mandatory - used for WhatsApp rendez-vous details)
    if (!phone.value.trim()) {
        showFieldError(phone, 'Phone number is required so we can reach you on WhatsApp');
        isValid = false;
    }

    // Validate age group
    if (!ageGroup.value) {
        showFieldError(ageGroup, 'Please select an age group');
        isValid = false;
    }

    // Validate checkbox
    if (!contactAgree.checked) {
        showFieldError(contactAgree, 'Please agree to be contacted');
        isValid = false;
    }

    return isValid;
}

// Show player success message
function showPlayerSuccess(form) {
    const successDiv = document.getElementById('registrationSuccess');
    if (successDiv) {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        successDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// 3. Partnership Form
// ========================================

const partnershipForm = document.getElementById('partnershipForm');
if (partnershipForm) {
    partnershipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validatePartnershipForm(partnershipForm)) {
            return;
        }

        // Collect form data
        const formData = new FormData(partnershipForm);
        const data = Object.fromEntries(formData);

        // Log to console (in production, this would be sent to a backend)
        console.log('Partnership Request Submitted:', data);
        console.log('⚠️  Note: Form data not yet connected to database. See README for integration instructions.');

        // Store in localStorage for demonstration
        const partnerships = JSON.parse(localStorage.getItem('pannaTempPartnerships') || '[]');
        partnerships.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pannaTempPartnerships', JSON.stringify(partnerships));

        // Show success message
        showPartnershipSuccess(partnershipForm);
    });
}

// Validate partnership form
function validatePartnershipForm(form) {
    const name = form.querySelector('#partner-name');
    const organisation = form.querySelector('#partner-org');
    const orgType = form.querySelector('#partner-org-type');
    const email = form.querySelector('#partner-email');
    const phone = form.querySelector('#partner-phone');
    const message = form.querySelector('#partner-message');
    const agree = form.querySelector('#partner-agree');

    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });

    if (!name.value.trim()) {
        showFieldError(name, 'Name is required');
        isValid = false;
    }

    if (!organisation.value.trim()) {
        showFieldError(organisation, 'Organisation name is required');
        isValid = false;
    }

    if (!orgType.value) {
        showFieldError(orgType, 'Please select organisation type');
        isValid = false;
    }

    if (!isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email');
        isValid = false;
    }

    if (!phone.value.trim()) {
        showFieldError(phone, 'Phone number is required');
        isValid = false;
    }

    if (!message.value.trim()) {
        showFieldError(message, 'Message is required');
        isValid = false;
    }

    if (!agree.checked) {
        showFieldError(agree, 'Please agree to be contacted');
        isValid = false;
    }

    return isValid;
}

// Show partnership success message
function showPartnershipSuccess(form) {
    const successDiv = document.getElementById('partnershipSuccess');
    if (successDiv) {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        successDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// 4. Utility Functions
// ========================================

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        
        // Remove existing error message if any
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorEl = document.createElement('p');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        errorEl.style.color = '#ff4444';
        errorEl.style.fontSize = '0.85rem';
        errorEl.style.marginTop = '0.25rem';
        formGroup.appendChild(errorEl);
    }
}

// ========================================
// 5. Smooth Scrolling
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// 6. Form Styling Enhancement
// ========================================

// Add styling for form errors
const style = document.createElement('style');
style.textContent = `
    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
        border-color: #ff4444;
        background-color: rgba(255, 68, 68, 0.05);
    }
    
    .error-message {
        display: block;
        color: #ff4444;
        font-size: 0.85rem;
        margin-top: 0.25rem;
    }
`;
document.head.appendChild(style);

// ========================================
// 7. Local Storage Demo
// ========================================

// For development/testing: Display submitted data
console.log('🚀 Panna League Website Loaded');
console.log('📝 Form submissions are stored locally for now.');
console.log('💾 To view submissions: console.log(localStorage.getItem("pannaTempRegistrations"))');
console.log('💼 To view partnerships: console.log(localStorage.getItem("pannaTempPartnerships"))');

// Function to retrieve local data (for debugging)
window.getPannaRegistrations = () => {
    const registrations = JSON.parse(localStorage.getItem('pannaTempRegistrations') || '[]');
    console.table(registrations);
    return registrations;
};

window.getPannaPartnerships = () => {
    const partnerships = JSON.parse(localStorage.getItem('pannaTempPartnerships') || '[]');
    console.table(partnerships);
    return partnerships;
};

// ========================================
// 8. Analytics Event Tracking Setup
// ========================================

// Placeholder for analytics events
function trackEvent(eventName, eventData = {}) {
    // Google Analytics
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    
    // Meta Pixel
    if (window.fbq) {
        fbq('track', eventName, eventData);
    }
    
    // TikTok Pixel
    if (window.ttq) {
        ttq.track(eventName, eventData);
    }
    
    // Log to console for debugging
    console.log(`📊 Event: ${eventName}`, eventData);
}

// Track form submissions
if (playerForm) {
    playerForm.addEventListener('submit', () => {
        trackEvent('RegisterForEvent', {
            event_category: 'engagement',
            event_label: 'player_registration'
        });
    });
}

if (partnershipForm) {
    partnershipForm.addEventListener('submit', () => {
        trackEvent('ContactClub', {
            event_category: 'engagement',
            event_label: 'partnership_inquiry'
        });
    });
}

// Track CTA clicks
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.textContent;
        trackEvent('CTAClick', {
            event_category: 'engagement',
            event_label: text
        });
    });
});

// ========================================
// 9. Page Performance
// ========================================

// Log page load performance
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⏱️  Page Load Time: ${pageLoadTime}ms`);
        }, 0);
    });
}

// ========================================
// 10. Future Integration Placeholders
// ========================================

/*
FORM INTEGRATION OPTIONS (See README for details):

1. GOOGLE SHEETS (via Formspree or Apps Script)
   - Easiest free option
   - Integrate in 5 minutes

2. AIRTABLE
   - Powerful and visual
   - Good for managing data

3. SUPABASE
   - Open-source Firebase alternative
   - Real-time database

4. FORMSPREE.IO
   - Email-based form collection
   - Free tier available

5. FIREBASE
   - Google's backend platform
   - Built-in analytics

To integrate any of these, replace the localStorage code above with
an API call to your chosen backend service.
*/
