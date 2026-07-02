/**
 * CONFIG.js - Centralized Configuration
 * Manage all constants and configuration in one place
 * Include this file before script.js
 */

const CONFIG = {
  // === PERFORMANCE ===
  MOBILE_BREAKPOINT: 1024,
  ANIMATION_DELAY: 2500,
  PARALLAX_MULTIPLIER: 0.55,
  CURSOR_EASE: 0.06,
  PARALLAX_SCALE: 1.1,

  // === SELECTORS ===
  SELECTORS: {
    HERO: '#hero',
    INTRO_OVERLAY: '#intro-overlay',
    HEADER: 'header',
    NAV: 'nav',
    THEME_TOGGLE: '#toggleBtn',
    LOTTIE_CONTAINER: '#lottie-container',
    CUSTOM_CURSOR: '#custom-cursor',
    VIDEO_ITEMS: '.video-item',
    MODAL_TRIGGER: '.open-modal-trigger',
    MODAL: '#modal',
    CONTACT_FORM: 'form',
    PAGE_TRANSITION: '.page-transition',
  },

  // === ANIMATION TIMINGS ===
  TIMINGS: {
    PAGE_TRANSITION: 600,
    TEXT_REVEAL: 400,
    HERO_REVEAL: 800,
    MODAL_OPEN: 300,
    MODAL_CLOSE: 300,
  },

  // === STORAGE KEYS ===
  STORAGE: {
    INTRO_PLAYED: 'introPlayed',
    THEME: 'theme',
  },

  // === FEATURES (toggle) ===
  FEATURES: {
    PARALLAX: true,
    TEXT_ANIMATION: true,
    CUSTOM_CURSOR: true,
    DARK_MODE: true,
    PAGE_TRANSITIONS: true,
    HOVER_PREVIEW: true,
  },

  // === ENDPOINTS ===
  ENDPOINTS: {
    CONTACT: './contact.html',
    PROJECTS: {
      SKOOL: './skool.html',
      PARFUM: './parfum.html',
      CHAT_GPT: './chat-gpt.html',
      INSTA: './insta.html',
      TRAINING_LAB: './training-lab.html',
    },
  },

  // === VIDEOS ===
  VIDEOS: {
    PREVIEW_CONTAINER: '#video-cursor-preview',
    VIGNETTES: [
      {
        video: './project/skool/skool-vignette.mp4',
        poster: './project/skool/vignette-skool.webp',
        title: 'Skool'
      },
      {
        video: './project/parfum/parfum-vignette.mp4',
        poster: './project/parfum/vignette-parfum.webp',
        title: 'Parfum'
      },
      {
        video: './project/chat-gpt/gpt-vignette.mp4',
        poster: './project/chat-gpt/vignette-chatgpt.webp',
        title: 'ChatGPT'
      },
      {
        video: './project/insta/insta-vignette.mp4',
        poster: './project/insta/vignette-insta.webp',
        title: 'Instagram'
      },
      {
        video: './project/training-lab/training-lab-vignette.mp4',
        poster: './project/training-lab/vignette-training-lab.webp',
        title: 'Training Lab'
      },
    ],
  },

  // === SOCIAL LINKS ===
  SOCIAL: {
    INSTAGRAM: 'https://www.instagram.com/pmr_maxime',
    LINKEDIN: 'https://www.linkedin.com/in/motion-maxime',
    EMAIL: 'motion.maxime@gmail.com',
  },

  // === DARK MODE CONFIG ===
  DARK_MODE: {
    ANIMATION_URL: './json/light&dark.json',
    ATTRIBUTE: 'data-theme',
    DARK_VALUE: 'dark',
    LIGHT_VALUE: 'light',
  },

  // === HELPER METHODS ===
  isMobile() {
    return window.innerWidth <= this.MOBILE_BREAKPOINT;
  },

  isDesktop() {
    return window.innerWidth > this.MOBILE_BREAKPOINT;
  },

  copyToClipboard(text) {
    return navigator.clipboard.writeText(text)
      .then(() => ({ success: true, message: `Copied: ${text}` }))
      .catch(err => ({ success: false, error: err }));
  },

  getStorageValue(key, defaultValue = null) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  },

  setStorageValue(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};

// Export for modules (if using ES6 imports)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
