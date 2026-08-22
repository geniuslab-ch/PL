/* ========================================
   PANNA LEAGUE — JAVASCRIPT
   Interactivity, Forms & Navigation
   ======================================== */

// ========================================
// 0. Club referral pre-fill
// ========================================
// A club's or school's recruitment poster/QR links here with ?club=<name>
// (see the CRM's Club/School Outreach features) so a player who scans it
// doesn't have to retype it — pre-filled, not locked, since they can
// still correct it if it's wrong. Also personalizes the page with a
// banner naming who they were referred by, so the link visibly means
// something instead of landing on a generic form. The banner element
// ships [hidden] in the HTML and is only revealed here, so a direct visit
// with no ?club= param shows nothing extra.
document.addEventListener('DOMContentLoaded', () => {
    const club = new URLSearchParams(window.location.search).get('club');
    const clubField = document.getElementById('club');
    if (club && clubField && !clubField.value) {
        clubField.value = club;
    }

    const banner = document.getElementById('referral-banner');
    if (club && banner) {
        const isEnglish = document.documentElement.lang === 'en';
        banner.textContent = '';
        const icon = document.createElement('span');
        icon.textContent = '🎓⚽';
        icon.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        const strong = document.createElement('strong');
        strong.textContent = club;
        text.appendChild(document.createTextNode(isEnglish ? 'Registering via ' : 'Inscription via '));
        text.appendChild(strong);
        banner.appendChild(icon);
        banner.appendChild(text);
        banner.hidden = false;
    }
});

// ========================================
// 0a. Real cities on the player/club signup forms
// ========================================
// Each city <select data-city-select> ships with just "Lausanne" as a
// working default (real, and functions with no JS/network). Any other
// real city from the CRM — including ones still in internal PRE_LAUNCH
// planning, since registering interest is exactly what this form is
// for — is added as an extra option, never a fabricated one.
document.addEventListener('DOMContentLoaded', () => {
    const selects = document.querySelectorAll('[data-city-select]');
    if (selects.length === 0) return;

    fetch('https://crm-five-snowy-11.vercel.app/api/public/events', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            const events = (data && data.events) || [];
            const cities = [...new Set(events.map((e) => e.city).filter(Boolean))];

            selects.forEach((select) => {
                const existing = new Set(Array.from(select.options).map((o) => o.value));
                cities.forEach((city) => {
                    if (existing.has(city)) return;
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    select.appendChild(option);
                });
            });
        })
        .catch(() => {
            // CRM unreachable — the static "Lausanne" option still works.
        });
});

// ========================================
// 0b. Live event info from the CRM
// ========================================
// Formats a CRM ISO date ("2026-05-16") into a localized display date, or
// returns the raw string if it doesn't parse. Shared by the primary-event
// sync below and the upcoming-cities list.
function formatEventDate(isoDate, isEnglish) {
    const parsed = new Date(`${isoDate}T00:00:00`);
    if (isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString(isEnglish ? 'en-GB' : 'fr-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// Pulls the real primary event (name, city, venue, date, player target)
// from the CRM's public API and swaps it into any [data-event-field]
// element on the page. Only overwrites a field when the CRM actually has
// a real value for it — a field the CRM doesn't know yet (e.g. no date
// set) keeps its existing "coming soon" placeholder rather than showing
// something blank or fake.
document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('[data-event-field]');
    if (targets.length === 0) return;

    const isEnglish = document.documentElement.lang === 'en';

    fetch('https://crm-five-snowy-11.vercel.app/api/public/event-info', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            const event = data && data.event;
            if (!event) return;

            const editionEl = document.querySelector('[data-event-field="edition"]');
            if (editionEl && event.edition) {
                editionEl.textContent = `N°${event.edition}`;
            }

            const locationEl = document.querySelector('[data-event-field="location"]');
            if (locationEl && event.city) {
                locationEl.textContent = event.venue ? `${event.venue}, ${event.city}` : event.city;
            }

            const dateEl = document.querySelector('[data-event-field="date"]');
            if (dateEl && event.date) {
                dateEl.textContent = formatEventDate(event.date, isEnglish);
            }

            const playersEl = document.querySelector('[data-event-field="players"]');
            if (playersEl && event.playerTarget) {
                playersEl.textContent = isEnglish
                    ? `${event.playerTarget} spots`
                    : `${event.playerTarget} places`;
            }
        })
        .catch(() => {
            // CRM unreachable or no primary event yet — leave the existing
            // placeholder copy in the HTML untouched.
        });
});

// ========================================
// 0c. Upcoming cities list from the CRM
// ========================================
// The event-info card above only ever shows the CRM's one "primary"
// event. Every other real event (e.g. a second city added in the Event
// Control Center) shows up here instead, in a plain list — hidden
// entirely if there are none, so no empty section or placeholder city
// ever appears. Each city gets the exact same FORMAT/LOCATION/DATE/PLACES
// card layout as the featured event above it — built from the same
// .event-info/.info-item (light pages) or .event-details/.event-detail-item
// (register.html's dark card) markup, just generated per event instead of
// hardcoded once.
//
// Visibility is tied to the CRM's real event status: PRE_LAUNCH means
// still-being-planned-internally, so those events stay CRM-only. Setting
// an event to ANNOUNCED (or later — REGISTRATION_OPEN/LIVE/COMPLETED) is
// what makes it appear here. The one featured event above (isPrimary) is
// the exception — it always shows, with honest "TBD" copy, since the
// whole point of this page is to register interest for it.
document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('upcoming-events');
    const list = document.getElementById('upcoming-events-list');
    if (!section || !list) return;

    const isEnglish = document.documentElement.lang === 'en';
    const isDarkCard = !!document.querySelector('.event-card');

    const STATUS_LABELS = {
        fr: {
            PRE_LAUNCH: 'Bientôt',
            ANNOUNCED: 'Annoncé',
            REGISTRATION_OPEN: 'Inscriptions ouvertes',
            LIVE: 'En cours',
            COMPLETED: 'Terminé',
        },
        en: {
            PRE_LAUNCH: 'Coming soon',
            ANNOUNCED: 'Announced',
            REGISTRATION_OPEN: 'Registration open',
            LIVE: 'Live',
            COMPLETED: 'Completed',
        },
    };
    const statusLabels = STATUS_LABELS[isEnglish ? 'en' : 'fr'];

    const copy = isEnglish
        ? {
              edition: 'EDITION N°',
              editionTbd: 'Coming soon',
              format: 'FORMAT',
              formatValue: isDarkCard ? '1v1' : '1v1 Tournament',
              location: isDarkCard ? 'LOCATION' : 'LOCATION',
              date: 'DATE',
              dateTbd: 'Coming soon',
              players: isDarkCard ? 'PLAYERS' : 'PLACES',
              playersSuffix: 'spots',
              entry: 'ENTRY',
              entryTbd: 'To be confirmed',
          }
        : {
              edition: 'EDITION N°',
              editionTbd: 'À venir',
              format: 'FORMAT',
              formatValue: isDarkCard ? '1v1' : 'Tournoi 1v1',
              location: 'LIEU',
              date: 'DATE',
              dateTbd: 'Bientôt communiquée',
              players: isDarkCard ? 'JOUEURS' : 'PLACES',
              playersSuffix: 'places',
              entry: 'TARIF',
              entryTbd: 'À confirmer',
          };

    fetch('https://crm-five-snowy-11.vercel.app/api/public/events', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            const events = (data && data.events) || [];
            const others = events.filter((e) => !e.isPrimary && e.status !== 'PRE_LAUNCH');
            if (others.length === 0) return;

            others.forEach((event) => {
                const card = document.createElement('div');
                card.className = 'upcoming-event-card';

                const heading = document.createElement('h3');
                heading.className = 'upcoming-event-heading';
                heading.textContent = event.city;
                card.appendChild(heading);

                const status = document.createElement('span');
                status.className = 'upcoming-event-status';
                status.textContent = statusLabels[event.status] || event.status;
                card.appendChild(status);

                const grid = document.createElement('div');
                grid.className = isDarkCard ? 'event-details' : 'event-info';

                const fields = [
                    [copy.edition, event.edition ? `N°${event.edition}` : copy.editionTbd],
                    [copy.format, copy.formatValue],
                    [copy.location, event.venue ? `${event.venue}, ${event.city}` : event.city],
                    [copy.date, event.date ? formatEventDate(event.date, isEnglish) : copy.dateTbd],
                    [copy.players, event.playerTarget ? `${event.playerTarget} ${copy.playersSuffix}` : copy.dateTbd],
                ];
                if (isDarkCard) {
                    fields.push([copy.entry, copy.entryTbd]);
                }

                fields.forEach(([label, value]) => {
                    const item = document.createElement('div');
                    item.className = isDarkCard ? 'event-detail-item' : 'info-item';

                    const labelEl = document.createElement('span');
                    labelEl.className = isDarkCard ? 'detail-label' : 'info-label';
                    labelEl.textContent = label;
                    item.appendChild(labelEl);

                    const valueEl = document.createElement('span');
                    valueEl.className = isDarkCard ? 'detail-value' : 'info-value';
                    valueEl.textContent = value;
                    item.appendChild(valueEl);

                    grid.appendChild(item);
                });

                card.appendChild(grid);
                list.appendChild(card);
            });

            section.style.display = '';
        })
        .catch(() => {
            // CRM unreachable — keep the section hidden rather than show
            // a broken or empty list.
        });
});

// ========================================
// 1. Mobile Navigation Handler
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // Close menu when a link is clicked
    if (navMenu) {
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburger && navMenu) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
    });
});

// ========================================
// 2. Player Registration Form
// ========================================

// Best-effort mirror into the Panna League CRM (a separate deployment)
// so real signups also land as real players there — Formspree above
// stays the audited record either way, this never blocks or affects
// the registration flow if the CRM is slow or unreachable.
const CRM_PLAYER_SIGNUP_ENDPOINT = 'https://crm-five-snowy-11.vercel.app/api/public/player-signup';

function mirrorPlayerSignupToCrm(formData) {
    const data = new FormData();
    formData.forEach((value, key) => data.append(key, value));
    data.set('crm_source', 'site-register');
    fetch(CRM_PLAYER_SIGNUP_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
    }).catch((error) => {
        console.warn('CRM mirror failed (registration still succeeded via Formspree):', error);
    });
}

const playerForm = document.getElementById('playerForm');
if (playerForm) {
    playerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validatePlayerForm(playerForm)) {
            return;
        }

        const submitBtn = playerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '...';
        }

        const formData = new FormData(playerForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(playerForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                console.log('Player Registration Submitted to Formspree:', data);
                mirrorPlayerSignupToCrm(formData);
                showPlayerSuccess(playerForm);
            } else {
                console.error('Formspree submission failed:', await response.text());
                showFormError(playerForm, 'Something went wrong. Please try again or contact us directly.');
            }
        } catch (error) {
            console.error('Network error submitting player form:', error);
            showFormError(playerForm, 'Network error. Please check your connection and try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
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

// Show a general (non-field-specific) form error banner
function showFormError(form, message) {
    let errorBanner = form.querySelector('.form-submit-error');
    if (!errorBanner) {
        errorBanner = document.createElement('p');
        errorBanner.className = 'form-submit-error';
        form.appendChild(errorBanner);
    }
    errorBanner.textContent = message;
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ========================================
// 3. Partnership Form
// ========================================

// Best-effort mirror into the Panna League CRM — same pattern as
// mirrorPlayerSignupToCrm above, just a different endpoint/table.
const CRM_CLUB_SIGNUP_ENDPOINT = 'https://crm-five-snowy-11.vercel.app/api/public/club-signup';

function mirrorPartnershipToCrm(formData) {
    const data = new FormData();
    formData.forEach((value, key) => data.append(key, value));
    data.set('crm_source', 'site-partnership');
    fetch(CRM_CLUB_SIGNUP_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
    }).catch((error) => {
        console.warn('CRM mirror failed (partnership request still succeeded via Formspree):', error);
    });
}

const partnershipForm = document.getElementById('partnershipForm');
if (partnershipForm) {
    partnershipForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validatePartnershipForm(partnershipForm)) {
            return;
        }

        const submitBtn = partnershipForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '...';
        }

        const formData = new FormData(partnershipForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(partnershipForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                console.log('Partnership Request Submitted to Formspree:', data);
                mirrorPartnershipToCrm(formData);
                showPartnershipSuccess(partnershipForm);
            } else {
                console.error('Formspree submission failed:', await response.text());
                showFormError(partnershipForm, 'Something went wrong. Please try again or contact us directly.');
            }
        } catch (error) {
            console.error('Network error submitting partnership form:', error);
            showFormError(partnershipForm, 'Network error. Please check your connection and try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
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
// 7. Startup Log
// ========================================

console.log('🚀 Panna League Website Loaded');
console.log('📝 Form submissions are sent live to Formspree (Player: xgawrovp, Partnership: xkjwkogy).');
console.log('👉 View submissions at https://formspree.io');

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
FORM BACKEND: Formspree (live)

Player registration form  → https://formspree.io/f/xgawrovp
Club partnership form     → https://formspree.io/f/xkjwkogy

Both forms POST via fetch() above and show a success/error state
based on the response. View/export submissions at formspree.io.
*/
