/* ============================================================
   THE SIGNAL — INTERACTIVE ENGINE
   Vanilla JS. No framework, no build step — matches the rest
   of the Panna League site. All editable values live in
   signal-config.js, not here.
   ============================================================ */

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 0. Source / campaign tracking (never shown to the visitor)
    // ------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const SOURCE = urlParams.get('source') || 'direct';

    // ------------------------------------------------------------
    // 1. Analytics helper — fires through gtag/fbq if present,
    //    always logs to console for now. Never throws.
    // ------------------------------------------------------------
    function track(eventKey, extra) {
        try {
            const eventName = (window.SIGNAL_CONFIG && window.SIGNAL_CONFIG.ANALYTICS_EVENTS[eventKey]) || eventKey;
            const payload = Object.assign({ source: SOURCE }, extra || {});

            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, payload);
            }
            if (typeof window.fbq === 'function') {
                window.fbq('trackCustom', eventName, payload);
            }
            console.log('[signal:track]', eventName, payload);
        } catch (err) {
            // analytics must never break the experience
        }
    }

    // ------------------------------------------------------------
    // 2. Step order (default linear narrative)
    // ------------------------------------------------------------
    const STEP_ORDER = [
        'screen-discovery',
        'screen-revelation',
        'screen-challenge',
        // branches (player-form / nomination-form) are not in the
        // linear progress count — they're side-quests off "challenge"
        'screen-what-is-panna',
        'screen-road',
        'screen-lausanne',
        'screen-future',
        'screen-final',
    ];

    let currentId = STEP_ORDER[0];
    let revealTimeouts = [];
    let revealComplete = false;

    const root = document.getElementById('signalRoot');
    const progressEl = document.getElementById('signalProgress');

    // ------------------------------------------------------------
    // 3. Progress dots
    // ------------------------------------------------------------
    function buildProgressDots() {
        progressEl.innerHTML = '';
        STEP_ORDER.forEach(() => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            progressEl.appendChild(dot);
        });
    }

    function updateProgressDots(id) {
        const idx = STEP_ORDER.indexOf(id);
        const dots = progressEl.querySelectorAll('.dot');
        if (idx === -1) {
            // on a branch screen (form, confirm) — dim all, no "current"
            dots.forEach((d) => d.classList.remove('dot-current'));
            return;
        }
        dots.forEach((d, i) => {
            d.classList.toggle('dot-done', i < idx);
            d.classList.toggle('dot-current', i === idx);
        });
    }

    // ------------------------------------------------------------
    // 4. Reveal engine — reads data-delay (ms) on .reveal-line /
    //    .reveal-cta children of the active screen and fades them
    //    in at that offset. Tapping the screen before it's done
    //    instantly completes the reveal (fast, not laggy).
    // ------------------------------------------------------------
    function clearRevealTimeouts() {
        revealTimeouts.forEach((t) => clearTimeout(t));
        revealTimeouts = [];
    }

    function runReveal(screenEl) {
        clearRevealTimeouts();
        revealComplete = false;

        const lines = screenEl.querySelectorAll('.reveal-line, .reveal-cta');
        lines.forEach((el) => el.classList.remove('visible'));

        const glitchEl = screenEl.querySelector('.glitch-text');
        if (glitchEl && !glitchEl.dataset.text) {
            glitchEl.dataset.text = glitchEl.textContent;
        }

        let maxDelay = 0;
        lines.forEach((el) => {
            const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            maxDelay = Math.max(maxDelay, delay);
            const t = setTimeout(() => {
                el.classList.add('visible');
                if (el.classList.contains('glitch-text') && !prefersReducedMotion()) {
                    el.classList.add('glitching');
                    setTimeout(() => el.classList.remove('glitching'), 350);
                }
            }, delay);
            revealTimeouts.push(t);
        });

        const doneT = setTimeout(() => {
            revealComplete = true;
        }, maxDelay + 50);
        revealTimeouts.push(doneT);
    }

    function completeRevealNow(screenEl) {
        clearRevealTimeouts();
        screenEl.querySelectorAll('.reveal-line, .reveal-cta').forEach((el) => {
            el.classList.add('visible');
        });
        revealComplete = true;
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ------------------------------------------------------------
    // 5. Screen transition
    // ------------------------------------------------------------
    function goTo(targetId, opts) {
        opts = opts || {};
        const current = document.getElementById(currentId);
        const target = document.getElementById(targetId);
        if (!target) return;

        track('nav_' + targetId);

        const doSwitch = () => {
            if (current && current !== target) {
                current.classList.remove('active', 'entering');
                current.classList.remove('leaving');
            }
            target.classList.add('active');
            if (!prefersReducedMotion()) {
                target.classList.add('entering');
                setTimeout(() => target.classList.remove('entering'), 600);
            }
            currentId = targetId;
            updateProgressDots(targetId);
            runReveal(target);

            // Populate hidden source fields on entry to any form screen
            const sourceField = target.querySelector('input[name="source"]');
            if (sourceField) sourceField.value = SOURCE;

            // Scroll form screens to top on entry
            if (target.classList.contains('signal-screen-form')) {
                target.scrollTop = 0;
            }
        };

        if (current && current !== target && !prefersReducedMotion()) {
            current.classList.add('leaving');
            setTimeout(doSwitch, 260);
        } else {
            doSwitch();
        }
    }

    // ------------------------------------------------------------
    // 6. Tap-anywhere-to-advance (for single-CTA narrative screens)
    // ------------------------------------------------------------
    document.querySelectorAll('.signal-screen[data-tap-advance]').forEach((screenEl) => {
        screenEl.addEventListener('click', (e) => {
            // Don't hijack taps on real interactive elements
            if (e.target.closest('button, a, input, textarea, select, label')) return;

            if (!revealComplete) {
                completeRevealNow(screenEl);
                return;
            }
            const ctaId = screenEl.getAttribute('data-tap-advance');
            const cta = document.getElementById(ctaId);
            if (cta) cta.click();
        });
    });

    // ------------------------------------------------------------
    // 7. Wire up every explicit button
    // ------------------------------------------------------------
    document.getElementById('cta-discovery').addEventListener('click', () => {
        track('enter');
        goTo('screen-revelation');
    });

    document.getElementById('cta-revelation').addEventListener('click', () => {
        goTo('screen-challenge');
    });

    document.getElementById('cta-i-want-in').addEventListener('click', () => {
        track('applicationStart');
        goTo('screen-player-form');
    });

    document.getElementById('cta-i-know-someone').addEventListener('click', () => {
        track('nominationStart');
        goTo('screen-nomination-form');
    });

    document.getElementById('cta-player-confirm').addEventListener('click', () => {
        openSocialAndAdvance('screen-what-is-panna');
    });

    document.getElementById('cta-nomination-confirm').addEventListener('click', () => {
        goTo('screen-what-is-panna');
    });

    document.getElementById('cta-what-is-panna').addEventListener('click', () => {
        goTo('screen-road');
    });

    document.getElementById('cta-road').addEventListener('click', () => {
        goTo('screen-lausanne');
    });

    document.getElementById('cta-lausanne').addEventListener('click', () => {
        goTo('screen-future');
    });

    document.getElementById('cta-future').addEventListener('click', () => {
        openSocialAndAdvance('screen-final');
    });

    document.getElementById('cta-final-become').addEventListener('click', () => {
        goTo('screen-challenge');
    });

    document.getElementById('cta-final-follow').addEventListener('click', () => {
        openPrimarySocial();
    });

    document.querySelectorAll('[data-back-to]').forEach((btn) => {
        btn.addEventListener('click', () => goTo(btn.getAttribute('data-back-to')));
    });

    function openPrimarySocial() {
        const cfg = window.SIGNAL_CONFIG;
        track('socialClick');
        const order = (cfg && cfg.SOCIAL_ORDER) || [];
        for (let i = 0; i < order.length; i++) {
            const url = cfg.SOCIAL[order[i]];
            if (url && url !== '#') {
                window.open(url, '_blank', 'noopener');
                return;
            }
        }
        // No social configured yet — no-op (silently), nothing to open
    }

    function openSocialAndAdvance(nextId) {
        openPrimarySocial();
        goTo(nextId);
    }

    // ------------------------------------------------------------
    // 8. Forms
    // ------------------------------------------------------------
    function wireForm(formEl, endpointKey, confirmScreenId, submitEventKey) {
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cfg = window.SIGNAL_CONFIG;
            const endpoint = cfg.FORM_ENDPOINTS[endpointKey];
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';

            if (!endpoint || endpoint.indexOf('REPLACE_WITH') !== -1) {
                console.warn('[signal] Form endpoint not configured for "' + endpointKey + '". Set it in signal-config.js.');
                goTo(confirmScreenId); // still advance the experience during dev/testing
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '...';
            }

            const formData = new FormData(formEl);

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' },
                });

                if (response.ok) {
                    track(submitEventKey);
                    goTo(confirmScreenId);
                } else {
                    showFormError(formEl, 'Something went wrong. Try again.');
                }
            } catch (err) {
                showFormError(formEl, 'Network error. Check your connection.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    function showFormError(formEl, message) {
        let banner = formEl.querySelector('.signal-form-error');
        if (!banner) {
            banner = document.createElement('p');
            banner.className = 'signal-form-error';
            banner.style.color = '#ff6b5b';
            banner.style.fontSize = '0.8rem';
            banner.style.textAlign = 'center';
            formEl.appendChild(banner);
        }
        banner.textContent = message;
    }

    wireForm(document.getElementById('playerForm'), 'player', 'screen-player-confirm', 'applicationSubmit');
    wireForm(document.getElementById('nominationForm'), 'nomination', 'screen-nomination-confirm', 'nominationSubmit');

    // ------------------------------------------------------------
    // 9. Video — lazy: only set the real src when the user taps play
    // ------------------------------------------------------------
    const videoEl = document.getElementById('signalVideo');
    const videoSourceEl = document.getElementById('signalVideoSource');
    const videoPlayBtn = document.getElementById('signalVideoPlay');

    if (window.SIGNAL_CONFIG && window.SIGNAL_CONFIG.VIDEO_POSTER) {
        videoEl.setAttribute('poster', window.SIGNAL_CONFIG.VIDEO_POSTER);
    }

    videoPlayBtn.addEventListener('click', () => {
        const cfg = window.SIGNAL_CONFIG;
        if (!videoSourceEl.getAttribute('src')) {
            videoSourceEl.setAttribute('src', cfg.VIDEO_PATH);
            videoEl.load();
        }
        videoEl.play().then(() => {
            videoPlayBtn.classList.add('hidden');
        }).catch(() => {
            // Autoplay/permission issue — leave the play button visible
        });
    });

    videoEl.addEventListener('pause', () => videoPlayBtn.classList.remove('hidden'));
    videoEl.addEventListener('ended', () => videoPlayBtn.classList.remove('hidden'));

    // ------------------------------------------------------------
    // 10. Social icons (final screen) — minimal inline SVGs,
    //     no icon font/library dependency
    // ------------------------------------------------------------
    const ICONS = {
        instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
        tiktok: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3v13.2a3 3 0 1 1-2.2-2.9V9.2A6 6 0 1 0 16.5 15V8.6a7.6 7.6 0 0 0 4 1.1V6.7a4.6 4.6 0 0 1-4-4.7z"/></svg>',
        whatsappChannel: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20z"/></svg>',
    };

    (function buildSocialIcons() {
        const cfg = window.SIGNAL_CONFIG;
        const wrap = document.getElementById('signalSocial');
        if (!cfg || !wrap) return;

        (cfg.SOCIAL_ORDER || []).forEach((key) => {
            const url = cfg.SOCIAL[key];
            if (!url) return; // omit entirely if not in config
            const a = document.createElement('a');
            a.href = url === '#' ? '#' : url;
            a.target = url === '#' ? '_self' : '_blank';
            a.rel = 'noopener';
            a.setAttribute('aria-label', key);
            a.innerHTML = ICONS[key] || key.slice(0, 2).toUpperCase();
            a.addEventListener('click', (e) => {
                if (url === '#') e.preventDefault();
                track('socialClick', { network: key });
            });
            wrap.appendChild(a);
        });
    })();

    // ------------------------------------------------------------
    // 11. Send the Signal (share)
    // ------------------------------------------------------------
    const shareSheet = document.getElementById('shareSheet');
    const shareSheetClose = document.getElementById('shareSheetClose');

    function getShareUrl() {
        const cfg = window.SIGNAL_CONFIG;
        if (cfg.SHARE_URL) return cfg.SHARE_URL;
        const base = cfg.SIGNAL_URL || window.location.href;
        return SOURCE !== 'direct' ? base + '?source=' + encodeURIComponent(SOURCE) : base;
    }

    document.getElementById('ctaSendSignal').addEventListener('click', async () => {
        track('shareClick');
        const cfg = window.SIGNAL_CONFIG;
        const text = cfg.SHARE_TEXT;
        const url = getShareUrl();

        if (navigator.share) {
            try {
                await navigator.share({ text, url });
                return;
            } catch (err) {
                // user cancelled native share — fall through to custom sheet
            }
        }
        shareSheet.hidden = false;
    });

    shareSheetClose.addEventListener('click', () => { shareSheet.hidden = true; });
    shareSheet.addEventListener('click', (e) => {
        if (e.target === shareSheet) shareSheet.hidden = true;
    });

    shareSheet.querySelectorAll('[data-share]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cfg = window.SIGNAL_CONFIG;
            const text = cfg.SHARE_TEXT;
            const url = getShareUrl();
            const type = btn.getAttribute('data-share');

            if (type === 'whatsapp') {
                window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
            } else if (type === 'facebook') {
                window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener');
            } else if (type === 'copy') {
                navigator.clipboard.writeText(text + ' ' + url).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy link'; }, 1500);
                }).catch(() => {});
            }
            if (type !== 'copy') shareSheet.hidden = true;
        });
    });

    // ------------------------------------------------------------
    // 12. Debug mode — ?debug=1 stacks every screen, fully
    //     revealed, no animation. Internal QA use only, not linked
    //     anywhere. Lets you review all copy/layout without waiting
    //     through the whole sequence.
    // ------------------------------------------------------------
    if (urlParams.get('debug') === '1') {
        document.querySelectorAll('.signal-screen').forEach((el) => {
            el.style.display = 'flex';
            el.style.position = 'relative';
            el.style.minHeight = '100vh';
            el.style.borderBottom = '2px dashed rgba(255,255,255,0.15)';
            el.querySelectorAll('.reveal-line, .reveal-cta').forEach((line) => line.classList.add('visible'));
        });
        progressEl.style.display = 'none';
        html_scroll_unlock();
    }

    function html_scroll_unlock() {
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
    }

    // ------------------------------------------------------------
    // 13. Boot
    // ------------------------------------------------------------
    buildProgressDots();

    if (urlParams.get('debug') !== '1') {
        goTo('screen-discovery');
    } else {
        updateProgressDots('screen-discovery');
    }

    track('pageView');
})();
