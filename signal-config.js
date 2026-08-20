/* ============================================================
   THE SIGNAL — CAMPAIGN CONFIGURATION
   ============================================================
   This is the ONLY file you should need to edit to configure
   the campaign. Nothing below is hard-coded elsewhere.

   After editing, no other file needs to change.
   ============================================================ */

const SIGNAL_CONFIG = {
    // ----------------------------------------------------------
    // 1. QR CODE / BASE URL
    // ----------------------------------------------------------
    // The base URL the QR code points to (French, the default page).
    // No custom domain yet, so this is the Vercel URL. Update this the
    // day you buy a domain — the QR generator (/signal/qr-generator.html)
    // reads from here automatically. An English mirror exists at
    // /en/signal — the language switcher on both pages links between
    // them automatically and preserves any ?source= tag.
    SIGNAL_URL: "https://panna-league.vercel.app/signal",


    // ----------------------------------------------------------
    // 2. SOCIAL MEDIA
    // ----------------------------------------------------------
    // Used by every "FOLLOW THE SIGNAL" button and the final
    // screen's social icons. An icon/button only becomes active
    // once its URL here is real AND its key is added to
    // SOCIAL_ORDER below.
    SOCIAL: {
        instagram: "#",   // e.g. "https://instagram.com/pannaleague"
        tiktok: "#",      // e.g. "https://tiktok.com/@pannaleague"
        whatsappChannel: "#", // optional WhatsApp channel/community link
    },

    // Controls which icons render on the final screen, and in
    // what order. An icon only appears here once you've both
    // (a) set its real URL above in SOCIAL, and (b) added its key
    // below. Since no accounts exist yet, this starts EMPTY —
    // add "instagram" / "tiktok" here the day those profiles go live.
    SOCIAL_ORDER: [],


    // ----------------------------------------------------------
    // 3. FORM ENDPOINTS (Formspree, or any POST endpoint)
    // ----------------------------------------------------------
    // Player applications use their own dedicated form ("Player-Signal"),
    // separate from the main site's player-registration form — so Signal
    // applicants land in their own Formspree inbox. Nominations still
    // share the club-partnership form's endpoint (no dedicated nomination
    // form exists yet); create one on Formspree and swap the ID below
    // whenever you want nominations split out too.
    FORM_ENDPOINTS: {
        player: "https://formspree.io/f/xeajnoay",
        nomination: "https://formspree.io/f/xkjwkogy",
    },


    // ----------------------------------------------------------
    // 4. VIDEO
    // ----------------------------------------------------------
    // Drop the panna/football clip into /signal/videos/ and point
    // to it here. Keep it short (~10-15s) and compressed (H.264 MP4,
    // ideally under 3-4MB) since this loads on mobile data.
    VIDEO_PATH: "/signal/videos/pannafootvideo.mp4",
    VIDEO_POSTER: "/signal/assets/video-poster.jpg", // static frame shown before play


    // ----------------------------------------------------------
    // 5. SHARE ("SEND THE SIGNAL")
    // ----------------------------------------------------------
    SHARE_TEXT: "I found the Panna League Signal in Lausanne. Think you can become the first champion?",
    // The URL appended after the share text. Leave as SIGNAL_URL
    // unless you want shares to carry a specific source tag.
    SHARE_URL: null, // null = falls back to SIGNAL_URL + current ?source= if present


    // ----------------------------------------------------------
    // 6. ANALYTICS
    // ----------------------------------------------------------
    // If you add Google Analytics / Meta Pixel to the main site,
    // this page will automatically fire events through them too
    // (gtag / fbq), IF they're present on window. No extra script
    // is loaded here — this just wires up event names.
    //
    // Every event automatically includes the "source" campaign tag
    // read from the URL, e.g. /signal?source=lausanne01
    // The visitor never sees this value — it's just recorded.
    ANALYTICS_EVENTS: {
        pageView: "signal_view",
        enter: "signal_enter",
        applicationStart: "signal_application_start",
        applicationSubmit: "signal_application_submit",
        nominationStart: "signal_nomination_start",
        nominationSubmit: "signal_nomination_submit",
        socialClick: "signal_social_click",
        shareClick: "signal_share_click",
    },

    // Known/expected campaign sources, purely for your own reference
    // when reading analytics later — NOT enforced or validated.
    // Add new physical installations here as they go up.
    KNOWN_SOURCES: [
        "lausanne01",
        "lausanne02",
        "lausanne03",
        "flon01",
        "epfl01",
        "geneva01",
        "neuchatel01",
        "fribourg01",
        "zurich01",
    ],


    // ----------------------------------------------------------
    // 7. LOGO
    // ----------------------------------------------------------
    // Currently reuses the main site's /logo.png. Change this path
    // if the Signal campaign should use a different logo treatment.
    LOGO_PATH: "/logo.png",

};

// Expose globally — required because signal.js reads window.SIGNAL_CONFIG,
// and a top-level `const` in a plain <script> does NOT attach to window.
window.SIGNAL_CONFIG = SIGNAL_CONFIG;
