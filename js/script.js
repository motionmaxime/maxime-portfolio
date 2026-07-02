/**
 * ============================================================
 * 1. UTILS & GLOBALS
 * ============================================================
 */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

document.documentElement.style.scrollBehavior = 'auto';
document.documentElement.style.scrollSnapType = 'none';
document.body.style.scrollSnapType = 'none';
window.scrollTo(0, 0);

window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.style.scrollBehavior = '';
        document.documentElement.style.scrollSnapType = '';
        document.body.style.scrollSnapType = '';
    }, 50);
});

window.scrollToVideo = (index) => {
    const video = document.querySelectorAll('.video-item')[index];
    if (video) video.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.copierEmail = (email) => {
    navigator.clipboard.writeText(email)
        .then(() => alert("Email copié : " + email))
        .catch(err => console.error('Erreur copie :', err));
};

/**
 * ============================================================
 * 2. MAIN APPLICATION
 * ============================================================
 */
const App = {
    state: {
        isMobile: window.innerWidth <= CONFIG.MOBILE_BREAKPOINT,
        ticking: false
    },
    scrollHandlers: [],
    resizeHandlers: [],

    init() {
        this.cacheDOM();
        this.bindEvents();

        window.onpageshow = (event) => {
    if (event.persisted) {
        console.log("♻️ Retour arrière avec animation.");
        
        const el = document.querySelector('.page-transition');
        
        if (el) {
            el.style.transition = 'none';
            el.style.transform = 'translateY(0)'; 
            el.style.opacity = '1';
            
            void el.offsetWidth;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    el.style.transition = 'transform 0.6s cubic-bezier(0.83, 0, 0.17, 1)';
                    el.style.transform = 'translateY(100%)'; 
                }, 50); 
            });
        }
        document.body.classList.remove('is-loading');
        gsap.set('.intro-about', { display: "flex", opacity: 1, filter: "blur(0px)", y: 0, overwrite: true });
        const btn = document.querySelector('.hero-btn');
        if(btn) {
            btn.classList.add('is-visible');
            gsap.set(btn, { opacity: 1, filter: "blur(0px)", y: 0, overwrite: true });
        }
    }
};
        const hasSeenIntro = sessionStorage.getItem('introPlayed') === 'true';

    if (hasSeenIntro) {
        // CAS 1 : DÉJÀ VU (Refresh) -> On lance juste Texte + Bouton
        console.log("⏩ Intro déjà vue : Animation rapide.");
        this.modules.quickHeroReveal(); 
    } 
    else {
        // CAS 2 : PREMIÈRE FOIS -> On lance tout (Flash + Tunnel + Texte)
        console.log("🎬 Première visite : Séquence complète.");
        this.modules.introSequence();
    }
        
        // --- MODULES ESSENTIELS (TOUS LES APPAREILS) ---
        this.modules.darkMode();
        this.modules.pageTransitions();
        this.modules.customPlayer();
        this.modules.modal();
        this.modules.form();
        this.modules.copyright();
        this.modules.desktopVideos();
        this.modules.heroReelTakeover();
        
        // --- MODULES D'ANIMATION (DESKTOP SEULEMENT) ---
        if (!this.state.isMobile) {
            this.modules.textAnimation();
            this.modules.cursor();
            this.modules.hoverPreview();
            this.modules.scrollReveal();
            this.modules.summaryIndicators();
            this.modules.contactAnimation();
            this.modules.magneticButton();
            
            // Handlers Scroll (Desktop uniquement)
            this.scrollHandlers.push(this.modules.parallax);
            this.scrollHandlers.push(this.modules.scrollZoom);
            this.scrollHandlers.push(this.modules.genericZoomOut);
        }
        
        // Handlers redimensionnement
        this.resizeHandlers.push(() => {
            this.state.isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
        });

        this.handleScroll(); 
    },

    cacheDOM() {
        this.dom = {
            root: document.documentElement,
            transitionEl: document.querySelector('.page-transition')
        };
    },

    bindEvents() {
        window.addEventListener('scroll', () => {
            if (!this.state.ticking) {
                window.requestAnimationFrame(() => this.handleScroll());
                this.state.ticking = true;
            }
        }, { passive: true });

        // Debounce resize pour éviter les calculs répétés
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeHandlers.forEach(h => h());
            }, 150);
        }, { passive: true });
    },

    handleScroll() {
        this.scrollHandlers.forEach(h => h());
        this.state.ticking = false;
    },

    modules: {
                /* ------------------------------------------------------------------
         * MAGNETIC BUTTON — 100% Indépendant et Robuste
         * ------------------------------------------------------------------ */
        magneticButton() {
            if (App.state.isMobile) return;
            const magnet = document.querySelector('.hero-btn');
            
            // Sécurité : on vérifie que le bouton ET GSAP sont là
            if (!magnet || typeof gsap === 'undefined') return;

            const triggerDistance = 400; // Distance de détection
            const maxMovement = 30;      // Force de l'aimant

            // On écoute le mouvement de la souris directement ici
            window.addEventListener('mousemove', (e) => {
                // requestAnimationFrame garantit une fluidité à 60fps sans lag
                requestAnimationFrame(() => {
                    try {
                        const currentX = gsap.getProperty(magnet, "x") || 0;
                        const currentY = gsap.getProperty(magnet, "y") || 0;

                        const bounding = magnet.getBoundingClientRect();

                        const centerX = (bounding.left - currentX) + (bounding.width / 2);
                        const centerY = (bounding.top - currentY) + (bounding.height / 2);

                        const distX = e.clientX - centerX;
                        const distY = e.clientY - centerY;
                        const distance = Math.sqrt(distX * distX + distY * distY);

                        if (distance < triggerDistance) {
                            const moveX = (distX / triggerDistance) * maxMovement;
                            const moveY = (distY / triggerDistance) * maxMovement;
                            gsap.to(magnet, { x: moveX, y: moveY, duration: 0.4, ease: "power2.out", overwrite: "auto" });
                        } else {
                            gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
                        }
                    } catch (err) {
                        console.error('Magnetic button error:', err);
                    }
                });
            }, { passive: true }); // Optimisation des performances
        },
        // ------------------------------------------------------------
        // 1. INTRO SEQUENCE (OPTIMISÉE POUR STATIQUE + SEAMLESS)
        // ------------------------------------------------------------
        introSequence() {
            sessionStorage.setItem('introPlayed', 'true');

            const tunnel = document.getElementById('hyperspace-tunnel');
            const targetCard = document.querySelector('.video1 .video-item'); 
            const videoWrapper = document.querySelector('.videos-wrapper');
            const skipBtn = document.getElementById('skip-intro-btn');

            const firstVideo = document.querySelector('.video1 video');
            if(firstVideo) {
                firstVideo.pause();
                firstVideo.currentTime = 0;
            }

            if (!tunnel || !targetCard || !videoWrapper || typeof gsap === 'undefined') {
                if (this.headerAnimation) this.headerAnimation();
                document.body.classList.remove('is-loading');
                if(videoWrapper) gsap.set(videoWrapper, { autoAlpha: 1 });
                if(skipBtn) skipBtn.style.display = 'none';
                return;
            }

            if (skipBtn) skipBtn.style.display = 'block';
            document.body.classList.add('is-loading'); 
            
            const header = document.querySelector('header');
            if(header) gsap.set(header, { autoAlpha: 0 }); 
            gsap.set(videoWrapper, { autoAlpha: 0 });

            // --- PRÉPARATION DU TEXTE AVEC CONSERVATION DE LA CLASSE ---
            const aboutTxt = document.querySelector('.about-txt');
            let wordSpans = []; 

            if (aboutTxt && !aboutTxt.classList.contains('split-done')) {
                const textContent = aboutTxt.textContent.trim().replace(/\s+/g, ' ');
                aboutTxt.innerHTML = ''; 
                aboutTxt.style.opacity = 1; 
                
              const words = textContent.split(' ');

words.forEach((word, index) => {
    const span = document.createElement('span');
    
    // Si le mot fait partie des 4 premiers ("Explain", "less.", "Convert", "more.")
    if (index < 4) {
        span.className = 'text-accent';
    }
    
    span.textContent = word;
    span.style.opacity = '0'; 
    span.style.display = 'inline-block';
    
    aboutTxt.appendChild(span);
    wordSpans.push(span);

    if (index < words.length - 1) {
        aboutTxt.appendChild(document.createTextNode(' '));
    }
});
                aboutTxt.classList.add('split-done');
            } else if (aboutTxt) {
                wordSpans = Array.from(aboutTxt.querySelectorAll('span')).filter(el => !el.classList.contains('text-accent'));
                gsap.set(wordSpans, { opacity: 0, display: 'inline-block' });
            }

            const mainButton = document.querySelector('.hero-btn');
            if(mainButton) mainButton.classList.remove('is-visible'); 

            // --- IMAGES EN DUR (STATIQUE) ---
            const myImages = [
                "./project/parfum/drone.webp", "./project/insta/ui.webp", "./project/me-in-motion/thumbnail.webp",
                "./project/parfum/drone.webp", "./project/parfum/tear.webp", "./project/training-lab/thumbnail.webp",
                "./project/parfum/drone.webp", "./project/insta/ui.webp", "./project/me-in-motion/thumbnail.webp",
                "./project/parfum/drone.webp", "./project/parfum/tear.webp", "./project/skool/head-guy.webp"
            ];

            tunnel.innerHTML = '';
            const flashElements = [];
            const totalFlashs = 12;

            for (let i = 0; i < totalFlashs; i++) {
                const url = myImages[i % myImages.length];
                const img = document.createElement('img');
                img.src = url; img.classList.add('flash-img');
                Object.assign(img.style, {
                    display: 'none', zIndex: '20', transform: 'scale(1)',
                    width: '100vw', height: '100vh', left: 0, top: 0,
                    filter: 'brightness(1)', boxShadow: '0 0px 50px rgba(0, 0, 0, 0.419)'
                });
                tunnel.appendChild(img); flashElements.push(img);
            }

            const tl = gsap.timeline({
                onComplete: () => {
                    document.body.classList.remove('is-loading');
                    if(typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    tunnel.style.pointerEvents = "none";
                    if (skipBtn) skipBtn.style.display = 'none';
                }
            });

            // GESTION DU SKIP
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    tl.kill();
                    gsap.set(tunnel, { display: 'none' });
                    gsap.set(['.intro-name', '.intro-job', skipBtn], { display: 'none' });
                    document.body.classList.remove('is-loading');
                    gsap.set(videoWrapper, { autoAlpha: 1 });
                    gsap.set(targetCard, { boxShadow: '0 0px 50px rgba(0, 0, 0, 0.419)' });
                    const work = document.querySelector('#work');
                    if (work) work.style.pointerEvents = "auto";
                    const overlay = document.getElementById('intro-overlay');
                    if (overlay) { overlay.classList.add('is-scrollable'); App.modules.heroScrollParallax(); }
                    App.modules.quickHeroReveal();
                });
            }

            tl.to('.intro-name', { display: "block", opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: "power2.out" })
              .to('.intro-name', { opacity: 0, filter: 'blur(10px)', y: -10, duration: 0.4, ease: "power2.in", display: "none" }, "+=0.2")
              .to('.intro-job', { display: "block", opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: "power2.out" })
              .to('.intro-job', { opacity: 0, filter: 'blur(10px)', y: -10, duration: 0.4, ease: "power2.in", display: "none" }, "+=0.2");

            tl.addLabel("flashSequence");
            let accumulatedTime = 0;

            if(flashElements.length > 0) {
                const startDur = 0.12; const endDur = 0.06;
                for (let i = 0; i < flashElements.length - 1; i++) {
                    const img = flashElements[i];
                    const progress = i / (flashElements.length - 2); 
                    const currentImgDuration = startDur + (endDur - startDur) * progress;
                    const startTimeStr = "flashSequence+=" + accumulatedTime;
                    tl.set(img, { display: "block", scale: 1.15 }, startTimeStr);
                    tl.to(img, { scale: 1, duration: currentImgDuration, ease: "power2.out" }, startTimeStr);
                    accumulatedTime += currentImgDuration;
                    tl.set(img, { display: "none" }, "flashSequence+=" + accumulatedTime);
                }
            }

            const lastImg = flashElements[flashElements.length - 1];
            const finalStartTime = "flashSequence+=" + accumulatedTime;

            tl.set(lastImg, { display: "block", scale: 1.1, zIndex: 40 }, finalStartTime);
            
            if (skipBtn) {
                tl.to(skipBtn, { opacity: 0, duration: 0.3, onComplete: () => skipBtn.style.display = 'none' }, finalStartTime);
            }

            tl.set('.intro-about', { display: "flex", opacity: 1, filter: 'blur(0px)', y: 0 }, finalStartTime + "+=1.5");

            if (wordSpans.length > 0) {
                tl.fromTo(wordSpans, 
                    { opacity: 0, filter: 'blur(10px)', y: 15, scale: 1.05 },
                    { 
                        opacity: 1, filter: 'blur(0px)', y: 0, scale: 1,
                        stagger: 0.05, duration: 0.8, ease: "power2.out",
                        onComplete: () => { gsap.set(wordSpans, { clearProps: "display,transform,filter" }); }
                    }, 
                    "<" 
                );
            }

            const secondaryElementsStart = "<+=0.4";

            if (mainButton) { tl.add(() => { mainButton.classList.add('is-visible'); }, secondaryElementsStart); }

            tl.fromTo('.location-clock', 
                { opacity: 0, y: 20, filter: 'blur(5px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: "power2.out" },
                secondaryElementsStart 
            );

            // --- LE FIX DU SEAMLESS ---
            tl.add(() => {
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(true); 
                const rect = targetCard.getBoundingClientRect();
                gsap.set(targetCard, { boxShadow: 'none' }); 
                
                gsap.to(lastImg, {
                    top: rect.top, left: rect.left, width: rect.width, height: rect.height,
                    scale: 1, filter: "brightness(1)", duration: 1.5, ease: "expo.out",
                    onComplete: () => {
                        gsap.set(videoWrapper, { autoAlpha: 1 });
                        document.body.classList.remove('is-loading');
                        const overlay = document.getElementById('intro-overlay');
                        if(overlay) { overlay.classList.add('is-scrollable'); App.modules.heroScrollParallax(); }
                        const vid = targetCard.querySelector('video');
                        if(vid) { vid.currentTime = 0; vid.pause(); }

                        gsap.set(targetCard, { boxShadow: '0 0px 50px rgba(0, 0, 0, 0.419)' });
                        gsap.set(lastImg, { boxShadow: 'none' });

                        gsap.to(lastImg, { 
                            opacity: 0, duration: 0.5, ease: "power2.inOut",
                            onComplete: () => { gsap.set(lastImg, { display: "none" }); }
                        });
                        const work = document.querySelector('#work');
                        if (work) work.style.pointerEvents = "auto";
                    }
                });
            }, finalStartTime); 

            tl.call(() => { if (App.modules.headerAnimation) App.modules.headerAnimation(); }, null, "-=0.5");
        },

        quickHeroReveal() {
            const videoWrapper = document.querySelector('.videos-wrapper');
            const targetCard = document.querySelector('.video1 .video-item');

            if(videoWrapper && typeof gsap !== 'undefined') gsap.set(videoWrapper, { autoAlpha: 1 });
            if (targetCard && typeof gsap !== 'undefined') gsap.set(targetCard, { boxShadow: '0 0px 50px rgba(0, 0, 0, 0.419)' });

            document.body.classList.remove('is-loading');

            // ... [début de quickHeroReveal]
const aboutTxt = document.querySelector('.about-txt');
let wordSpans = []; 

if (aboutTxt && !aboutTxt.classList.contains('split-done')) {
    const textContent = aboutTxt.textContent.trim().replace(/\s+/g, ' ');
    aboutTxt.innerHTML = ''; 
    aboutTxt.style.opacity = 1; 
    
    const words = textContent.split(' ');
    words.forEach((word, index) => {
        const span = document.createElement('span');
        
        // LA CORRECTION EST ICI : On cible les 4 premiers mots
        if (index < 4) {
            span.className = 'text-accent';
        }
        
        // CORRECTION DE L'ESPACE : On ajoute un espace normal à la fin du mot
        // et on ajoute une propriété CSS temporaire pour forcer le rendu de l'espace
        span.textContent = word + (index < words.length - 1 ? ' ' : '');
        span.style.opacity = '0'; 
        span.style.display = 'inline-block';
        span.style.whiteSpace = 'pre-wrap'; // Force le navigateur à respecter l'espace final
        
        aboutTxt.appendChild(span);
        wordSpans.push(span);
        
        // On a supprimé le document.createTextNode(' ') qui causait le double espace
    });
    aboutTxt.classList.add('split-done');
} else if (aboutTxt) {
    wordSpans = Array.from(aboutTxt.querySelectorAll('span')).filter(el => !el.classList.contains('text-accent'));
    if(typeof gsap !== 'undefined') gsap.set(wordSpans, { opacity: 0, display: 'inline-block' });
}
// ... [suite du code]

            const mainButton = document.querySelector('.hero-btn');
            if(mainButton) mainButton.classList.remove('is-visible');

            if (typeof gsap === 'undefined') return;

            const tl = gsap.timeline({ delay: 0.1 }); 

            tl.set('.intro-about', { display: "flex", opacity: 1, filter: 'blur(0px)', y: 0 });

            if (wordSpans.length > 0) {
                tl.fromTo(wordSpans, 
                    { opacity: 0, filter: 'blur(10px)', y: 15, scale: 1.05 },
                    { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, stagger: 0.05, duration: 0.8, ease: "power2.out", onComplete: () => { gsap.set(wordSpans, { clearProps: "display,transform,filter" }); }}
                );
            }

            const secondaryStart = "<+=0.4";
            
            if (mainButton) tl.add(() => mainButton.classList.add('is-visible'), secondaryStart);
            
            tl.fromTo('.location-clock', 
                { opacity: 0, y: 20, filter: 'blur(5px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: "power2.out" },
                secondaryStart
            );

            tl.add(() => { if (App.modules.headerAnimation) App.modules.headerAnimation(); }, "-=0.5");
            
            const overlay = document.getElementById('intro-overlay');
            if(overlay) {
                overlay.classList.add('is-scrollable');
                if (App.modules.heroScrollParallax) App.modules.heroScrollParallax();
            }
        },
heroScrollParallax() {
    // Si on est sur mobile, on évite souvent le parallax lourd pour les perfs
    if (App.state.isMobile) return; 

    // On sélectionne l'overlay
    const overlay = document.querySelector('#intro-overlay');
    
    // On crée l'animation
    gsap.to(overlay, {
        yPercent: 60, // L'élément descend de 50% de sa hauteur pendant le scroll
        ease: "none", // Pas d'accélération, mouvement linéaire lié au scroll
        scrollTrigger: {
            trigger: "#hero", // La zone de déclenchement
            start: "top top", // Dès que le haut du hero est en haut de l'écran
            end: "bottom top", // Jusqu'à ce que le bas du hero soit en haut
            scrub: 0 // Le 0 rend l'effet instantané (sans latence "shampooing")
            // scrub: 1 // Si tu veux un effet un peu "flottant/smooth"
        }
    });
},
        // ------------------------------------------------------------
        // 2. HEADER ANIMATION
        // ------------------------------------------------------------
        headerAnimation() {
            const header = document.querySelector('header');
            const navbar = document.querySelector('.navbar');
            const btn = document.querySelector('.contact-btn');
            
            if (!header || !navbar || !btn) return;

            // On s'assure que le header n'est pas visible avant l'animation
            gsap.set(header, { autoAlpha: 0 });
            
            const logo = document.querySelector('.logo-text');
            const toggle = document.querySelector('.light_dark');
            const navLinks = navbar.querySelectorAll('.nav-link');
            
            // On prépare les éléments enfants
            gsap.set([btn, ...navLinks, logo, toggle], { opacity: 0 });

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            const btnIndex = Array.from(navbar.children).indexOf(btn);

            // Puis l'animation du header qui le rend visible d'abord
            tl.to(header, { autoAlpha: 1, duration: 0, ease: "power3.out" });

            tl.fromTo(btn, 
                { scale: 0, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" }
            );

            navLinks.forEach(link => {
                const linkIndex = Array.from(navbar.children).indexOf(link);
                const startX = linkIndex < btnIndex ? 30 : -30;
                tl.fromTo(link, 
                    { x: startX, opacity: 0 }, 
                    { x: 0, opacity: 1, duration: 0.8 }, 
                    "-=1"
                );
            });

            if(logo && toggle) {
                tl.fromTo([logo, toggle], 
                    { y: -20, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 
                    "-=0.6"
                );
            }
        },

        // ------------------------------------------------------------
        // 3. DARK MODE
        // ------------------------------------------------------------        
        darkMode() {
            const btn = document.getElementById('toggleBtn');
            const lottieContainer = document.getElementById('lottie-container');
            const bgImg = document.querySelector('.bg-logo-container img');
if (!btn || !lottieContainer || typeof lottie === 'undefined') return;
            const saved = localStorage.getItem('theme');
            const isInitialDark = saved === 'dark';
            if (isInitialDark) document.documentElement.setAttribute('data-theme', 'dark');

            const updateImage = (isDark) => {
                if (bgImg) bgImg.src = isDark ? './img/logo-bg-2.webp' : './img/logo-bg.webp';
            };
            updateImage(isInitialDark);

            const anim = lottie.loadAnimation({
                container: lottieContainer,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                path: './json/light&dark2.json'
            });

            anim.addEventListener('DOMLoaded', () => {
                if (isInitialDark) anim.goToAndStop(anim.totalFrames - 1, true);
                else anim.goToAndStop(0, true);
            });

            btn.addEventListener('click', () => {
                const currentIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const willBeDark = !currentIsDark;

                try {
                    anim.setSpeed(2);
                    anim.setDirection(willBeDark ? 1 : -1);
                    anim.play();
                } catch (e) { console.warn('Lottie error:', e); }

                if (willBeDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                }
                updateImage(willBeDark);
            });
        },

        // ------------------------------------------------------------
        // 4. TRANSITIONS & TEXTE
        // ------------------------------------------------------------
        pageTransitions() {
            const el = document.querySelector('.page-transition');
            if (!el) return;
            setTimeout(() => {
                el.style.setProperty('--bg-width', '50vw'); 
                el.style.transform = 'translateY(100%)';
            }, 50);

            document.body.addEventListener('click', (e) => {
                const anchor = e.target.closest('a');
                if (!anchor) return;
                const href = anchor.getAttribute('href');
                const target = anchor.getAttribute('target');

                if (!href || href.startsWith('#') || target === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.classList.contains('no-transition') || (anchor.pathname === window.location.pathname && anchor.hash)) {
                    return;
                }

                e.preventDefault();
                el.style.transition = 'none';
                el.style.setProperty('--bg-width', '50vw');
                el.style.transform = 'translateY(-100%)';
                void el.offsetWidth; 

                el.style.transition = 'transform 0.6s cubic-bezier(0.83, 0, 0.17, 1), width 0.6s ease';
                el.style.setProperty('--bg-width', '100vw');
                el.style.transform = 'translateY(0)';

                setTimeout(() => window.location.href = href, 600);
            });
        },

        textAnimation() {
            if (App.state.isMobile) return; // Désactivé sur mobile
            const buttonsText = document.querySelectorAll('.btn-txt');
            if (!buttonsText.length) return;

            buttonsText.forEach(container => {
                const text = container.textContent.trim();
                container.innerHTML = '';
                const createLine = (className) => {
                    const div = document.createElement('div');
                    div.classList.add(className);
                    const fragment = document.createDocumentFragment();
                    [...text].forEach((char, index) => {
                        const span = document.createElement('span');
                        span.textContent = char === ' ' ? '\u00A0' : char;
                        span.style.transitionDelay = `${index * 0.015}s`;
                        fragment.appendChild(span);
                    });
                    div.appendChild(fragment);
                    return div;
                };
                container.appendChild(createLine('txt-original'));
                container.appendChild(createLine('txt-hover'));
            });
        },

        // ------------------------------------------------------------
        // 5. SCROLL EFFECTS
        // ------------------------------------------------------------
        
        parallax() {
            const img = document.querySelector('.parallax-img');
            const container = document.querySelector('#about');
            if (!img || !container) return;

            const rect = container.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                img.style.transform = `scale(${CONFIG.PARALLAX_SCALE}) translateY(${rect.top * CONFIG.PARALLAX_MULTIPLIER}px)`;
            }
        },

        scrollZoom() {
            const wrapper = document.querySelector('.videos-wrapper');
            const mainContainer = document.getElementById('portfolio-container');
            
            if (!wrapper || (mainContainer?.classList.contains('view-grid'))) {
                if (wrapper) wrapper.style.transform = 'scale(1)';
                return;
            }

            const rect = wrapper.getBoundingClientRect();
            const wh = window.innerHeight;
            
            // IMPORTANT : Ajuster cet offset en fonction de ton margin-top CSS sur #work
            // Si margin-top: -25vh, alors offset = wh * 0.25
            const offset = wh * 0.25; 
            
            let scale = 1;

            if (rect.top > 0) {
                const progress = 1 - (rect.top / wh);
                scale = 0.9 + (Math.max(0, Math.min(1, progress)) * 0.1);
            } 
            
            wrapper.style.transform = `scale(${scale})`;
        },

        genericZoomOut() {
            document.querySelectorAll('.zoom-out').forEach(el => {
                const rect = el.getBoundingClientRect();
                const elCenter = rect.top + rect.height / 2;
                const wh = window.innerHeight;
                const center = wh / 2;
                let scale = 1;

                if (elCenter < center) {
                    const dist = center - elCenter;
                    const end = center + rect.height / 2;
                    const progress = Math.min(Math.max(dist / end, 0), 1);
                    scale = 1 - (progress * 0.15); 
                }
                el.style.transform = `scale(${scale})`;
            });
        },

        // ------------------------------------------------------------
        // 6. UI & VIDEO LOGIC
        // ------------------------------------------------------------
        cursor() {
            if (App.state.isMobile) return; // Désactivé sur mobile/tablette
            const customCursor = document.getElementById('custom-cursor');
            const cursorIcon = document.querySelector('.cursor-icon');
            if (!customCursor) return;

            let mouse = { x: -100, y: -100 };
            let pos = { x: -100, y: -100 };
            let currentVideoNode = null;
            
            const updateCursor = e => { 
                mouse.x = e.clientX; 
                mouse.y = e.clientY; 
            };

            const animate = () => {
                const dx = mouse.x - pos.x;
                const dy = mouse.y - pos.y;
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    pos.x += dx * CONFIG.CURSOR_EASE;
                    pos.y += dy * CONFIG.CURSOR_EASE;
                    customCursor.style.left = `${pos.x}px`;
                    customCursor.style.top = `${pos.y}px`;
                }

                const target = document.elementFromPoint(mouse.x, mouse.y)?.closest('.video1, .video2-3, .video4, .next-project-link');
                
                if (target) {
                    if (target !== currentVideoNode) {
                        currentVideoNode = target;
                        customCursor.classList.add('visible');
                        target.style.cursor = 'none';
                        if (cursorIcon) {
                            cursorIcon.classList.remove('anim-slot');
                            void cursorIcon.offsetWidth;
                            cursorIcon.classList.add('anim-slot');
                        }
                    }
                } else if (currentVideoNode) {
                    currentVideoNode.style.cursor = 'auto';
                    currentVideoNode = null;
                    customCursor.classList.remove('visible');
                }
                requestAnimationFrame(animate);
            };

            window.addEventListener('mousemove', updateCursor, { passive: true });
            animate();
        },

        hoverPreview() {
    if (App.state.isMobile) return;

    const previewBox = document.getElementById('video-cursor-preview');
    const previewVideo = previewBox?.querySelector('video');
    const previewImg = previewBox?.querySelector('img');
    const indicators = document.querySelectorAll('.indicator-click');

    if (!previewBox || !previewVideo || !previewImg) return;

    const movePreview = (e) => {
        gsap.to(previewBox, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1, 
            ease: "power2.out",
            overwrite: "auto"
        });
    };

    indicators.forEach(ind => {
        ind.addEventListener('mouseenter', (e) => {
            // 1. D'ABORD : On place la boite sous la souris INSTANTANÉMENT
            // Cela empêche qu'elle parte du bord de l'écran
            gsap.set(previewBox, { left: e.clientX, top: e.clientY });

            // 2. Ensuite on gère le contenu
            const vidSrc = ind.dataset.video;
            const posterSrc = ind.dataset.poster;
            
            if (vidSrc) {
                if (posterSrc) previewImg.src = posterSrc;
                
                previewVideo.src = vidSrc;
                previewVideo.classList.remove('is-playing');

                // 3. On déclenche l'animation CSS (le pop)
                // Le setTimeout(..., 10) est une sécurité pour que le navigateur 
                // ait bien enregistré la position gsap.set avant d'afficher
                requestAnimationFrame(() => {
                    previewBox.classList.add('active');
                });

                window.addEventListener('mousemove', movePreview);

                previewVideo.play().then(() => {
                    previewVideo.classList.add('is-playing');
                }).catch(() => {});
            }
        });

        ind.addEventListener('mouseleave', () => {
            previewBox.classList.remove('active');
            previewVideo.pause();
            previewVideo.currentTime = 0;
            previewVideo.classList.remove('is-playing');
            window.removeEventListener('mousemove', movePreview);
        });
    });
},

                        desktopVideos() {
            if (App.state.isMobile) return; // Désactivé sur mobile

            const wrapper = document.querySelector('.videos-wrapper');
            if (!wrapper) return;

            const videos = wrapper.querySelectorAll('video');
            if (!videos.length) return;

            // 1. GESTION DE LA LECTURE AU SCROLL/HOVER
            const observer = new IntersectionObserver((entries) => {
                const isGrid = wrapper.classList.contains('view-grid');
                entries.forEach(entry => {
                    if (!entry.target) return;
                    if (!isGrid) {
                        if (entry.isIntersecting) {
                            entry.target.play().catch(() => {});
                        } else {
                            entry.target.pause();
                            entry.target.load(); // <-- Modifié ici (remplace currentTime = 0)
                        }
                    } else {
                        entry.target.pause();
                    }
                });
            }, { threshold: 0.5 });

            videos.forEach(v => {
                observer.observe(v);
                const article = v.closest('.video');
                if (article) {
                    article.addEventListener('mouseenter', () => {
                        if (v && wrapper.classList.contains('view-grid')) {
                            v.play().catch(() => {});
                        }
                    });
                    article.addEventListener('mouseleave', () => {
                        if (v && wrapper.classList.contains('view-grid')) {
                            v.pause();
                            v.load(); // <-- Modifié ici (remplace currentTime = 0)
                        }
                    });
                }
            });

            // 2. GESTION DU BOUTON TOGGLE ET DE L'ANIMATION GSAP
            const toggleBtns = document.querySelectorAll('.header-toggle-btn');

            if (toggleBtns.length > 0 && typeof gsap !== 'undefined') {
                let isAnimating = false;

                const ANIM_DURATION = 0.8;
                const EASING = "expo.inOut";

                toggleBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();

                        // Empêcher de spammer le bouton
                        if (btn.classList.contains('active') || isAnimating) return;
                        isAnimating = true;

                        // Changer l'état visuel des boutons
                        toggleBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        const mode = btn.dataset.view;
                        const isGrid = mode === 'grid';

                        try {
                            const tl = gsap.timeline();
                            const vh = window.innerHeight;

                            // Étape 1 : Préparer le masque (clip-path)
                            gsap.set(wrapper, { clipPath: `inset(0px 0px calc(100% - ${vh}px) 0px)` });

                            // Étape 2 : Fermer le rideau vers le haut
                            tl.to(wrapper, {
                                clipPath: `inset(${vh}px 0px calc(100% - ${vh}px) 0px)`,
                                duration: ANIM_DURATION,
                                ease: EASING
                            })
                            // Étape 3 : Changement d'état (invisible pour l'utilisateur car masqué)
                            .call(() => {
                                wrapper.classList.toggle('view-grid', isGrid);
                                wrapper.classList.toggle('view-fullscreen', !isGrid);

                                if (isGrid) {
                                    videos.forEach(v => {
                                        if (v) { v.pause(); v.load(); } // <-- Modifié ici (remplace currentTime = 0)
                                    });
                                    gsap.set(wrapper, { clearProps: "transform" });
                                } else {
                                    window.dispatchEvent(new Event('scroll'));
                                }

                                window.scrollTo({ top: 0, behavior: 'instant' });
                                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                            })
                            // Étape 4 : Rouvrir le rideau avec le nouveau layout
                            .call(() => {
                                gsap.set(wrapper, { clipPath: "inset(0px 0px 100% 0px)" });

                                gsap.to(wrapper, {
                                    clipPath: `inset(0px 0px calc(100% - ${vh}px) 0px)`,
                                    duration: ANIM_DURATION,
                                    ease: EASING,
                                    onComplete: () => {
                                        gsap.set(wrapper, { clearProps: "clipPath" }); // Nettoyage final
                                        isAnimating = false;
                                    }
                                });
                            });
                        } catch (err) {
                            console.error('Toggle animation error:', err);
                            isAnimating = false;
                        }
                    });
                });
            }
        },

        summaryIndicators() {
            if (App.state.isMobile) return; // Désactivé sur mobile/tablette
            const videos = document.querySelectorAll('.video1, .video2-3, .video4');
            const inds = document.querySelectorAll('.indicator');
            if (!videos.length || !inds.length) return;

            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = Array.from(videos).indexOf(entry.target);
                        inds.forEach(i => i.classList.remove('active'));
                        if (inds[idx]) inds[idx].classList.add('active');
                    }
                });
            }, { threshold: 0.7 });
            videos.forEach(v => obs.observe(v));
        },

        customPlayer() {
            const TEMPLATE = `
            <button class="center-play-btn" aria-label="Play Video"><svg width="60" height="60" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7902 5.99832L5.13021 0.458317C4.6075 0.156477 4.01421 -0.00164499 3.41061 1.29041e-05C2.807 0.0016708 2.21459 0.163049 1.69354 0.467756C1.17249 0.772464 0.741368 1.20964 0.443959 1.73489C0.14655 2.26014 -0.00654797 2.85475 0.000214711 3.45832V14.5783C0.000214711 15.4854 0.360535 16.3552 1.00191 16.9966C1.64328 17.638 2.51317 17.9983 3.42021 17.9983C4.02065 17.9973 4.6103 17.8387 5.13021 17.5383L14.7902 11.9983C15.3093 11.6979 15.7402 11.2663 16.0398 10.7468C16.3394 10.2272 16.4971 9.63804 16.4971 9.03832C16.4971 8.43859 16.3394 7.84941 16.0398 7.32988C15.7402 6.81035 15.3093 6.37873 14.7902 6.07832V5.99832Z" fill="#FFF3EC"/></svg></button>
            <div class="custom-controls"><div class="left-pill"><button class="ctrl-btn play-pause-btn"><svg class="icon-play" width="10" height="10" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7902 5.99832L5.13021 0.458317C4.6075 0.156477 4.01421 -0.00164499 3.41061 1.29041e-05C2.807 0.0016708 2.21459 0.163049 1.69354 0.467756C1.17249 0.772464 0.741368 1.20964 0.443959 1.73489C0.14655 2.26014 -0.00654797 2.85475 0.000214711 3.45832V14.5783C0.000214711 15.4854 0.360535 16.3552 1.00191 16.9966C1.64328 17.638 2.51317 17.9983 3.42021 17.9983C4.02065 17.9973 4.6103 17.8387 5.13021 17.5383L14.7902 11.9983C15.3093 11.6979 15.7402 11.2663 16.0398 10.7468C16.3394 10.2272 16.4971 9.63804 16.4971 9.03832C16.4971 8.43859 16.3394 7.84941 16.0398 7.32988C15.7402 6.81035 15.3093 6.37873 14.7902 6.07832V5.99832Z" fill="#FFF3EC"/></svg><svg class="icon-pause hidden" width="10" height="10" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.75 7.58333C1.75 7.73804 1.68854 7.88642 1.57915 7.99581C1.46975 8.10521 1.32138 8.16667 1.16667 8.16667H0.583333C0.428624 8.16667 0.280251 8.10521 0.170855 7.99581C0.0614583 7.88642 0 7.73804 0 7.58333V0.583333C0 0.428624 0.0614583 0.280251 0.170855 0.170855C0.280251 0.0614583 0.428624 0 0.583333 0H1.16667C1.32138 0 1.46975 0.0614583 1.57915 0.170855C1.68854 0.280251 1.75 0.428624 1.75 0.583333V7.58333ZM5.83333 7.58333C5.83333 7.73804 5.77188 7.88642 5.66248 7.99581C5.55308 8.10521 5.40471 8.16667 5.25 8.16667H4.66667C4.51196 8.16667 4.36358 8.10521 4.25419 7.99581C4.14479 7.88642 4.08333 7.73804 4.08333 7.58333V0.583333C4.08333 0.428624 4.14479 0.280251 4.25419 0.170855C4.36358 0.0614583 4.51196 0 4.66667 0H5.25C5.40471 0 5.55308 0.0614583 5.66248 0.170855C5.77188 0.280251 5.83333 0.428624 5.83333 0.583333V7.58333Z" fill="#FFF3EC"/></svg></button></div><div class="time-display">00:00</div><div class="progress-container"><div class="progress-filled"></div></div><div class="right-pill"><button class="ctrl-btn volume-btn"><svg width="10" height="10" viewBox="0 0 13 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path  d="M8.9 3.3123C9.6998 4.42357 9.6998 6.5761 8.9 7.68736M10.7 1.12477C13.0928 3.5048 13.1072 7.51048 10.7 9.87489M0.5 7.34923V3.64981C0.5 3.29105 0.7688 2.9998 1.1 2.9998H3.2516C3.331 2.9995 3.40952 2.98246 3.48242 2.9497C3.55533 2.91694 3.62111 2.86913 3.6758 2.80917L5.4758 0.691642C5.8538 0.281636 6.5 0.572265 6.5 1.15165V9.84801C6.5 10.4318 5.846 10.7199 5.4704 10.3018L3.6764 8.19612C3.62155 8.13445 3.55511 8.08519 3.4812 8.05143C3.40729 8.01767 3.3275 8.00012 3.2468 7.99986H1.1C0.7688 7.99986 0.5 7.70861 0.5 7.34923Z" stroke="#FFF3EC" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" vector-effect="non-scaling-stroke"/></svg></button><button class="ctrl-btn fs-btn"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.714286 6.42857C0.321429 6.42857 0 6.75 0 7.14286V9.28571C0 9.67857 0.321429 10 0.714286 10H2.85714C3.25 10 3.57143 9.67857 3.57143 9.28571C3.57143 8.89286 3.25 8.57143 2.85714 8.57143H1.42857V7.14286C1.42857 6.75 1.10714 6.42857 0.714286 6.42857ZM0.714286 3.57143C1.10714 3.57143 1.42857 3.25 1.42857 2.85714V1.42857H2.85714C3.25 1.42857 3.57143 1.10714 3.57143 0.714286C3.57143 0.321429 3.25 0 2.85714 0H0.714286C0.321429 0 0 0.321429 0 0.714286V2.85714C0 3.25 0.321429 3.57143 0.714286 3.57143ZM8.57143 8.57143H7.14286C6.75 8.57143 6.42857 8.89286 6.42857 9.28571C6.42857 9.67857 6.75 10 7.14286 10H9.28571C9.67857 10 10 9.67857 10 9.28571V7.14286C10 6.75 9.67857 6.42857 9.28571 6.42857C8.89286 6.42857 8.57143 6.75 8.57143 7.14286V8.57143ZM6.42857 0.714286C6.42857 1.10714 6.75 1.42857 7.14286 1.42857H8.57143V2.85714C8.57143 3.25 8.89286 3.57143 9.28571 3.57143C9.67857 3.57143 10 3.25 10 2.85714V0.714286C10 0.321429 9.67857 0 9.28571 0H7.14286C6.75 0 6.42857 0.321429 6.42857 0.714286Z" fill="#FFF3EC" linecap="round"/></svg></button></div></div>`;
            
            const players = document.querySelectorAll('.custom-player');
            window.addEventListener('resize', () => {
                if (App.state.isMobile !== (window.innerWidth <= 1024)) location.reload();
            });

            const format = s => {
                const m = Math.floor(s / 60), sec = Math.floor(s % 60);
                return `${m}:${sec.toString().padStart(2, '0')}`;
            };

            players.forEach(wrapper => {
                const video = wrapper.querySelector('video');
                if (!video) return;
                const force = wrapper.classList.contains('force-custom-player');
                if (!App.state.isMobile && !wrapper.closest('#modal') && !force) return;

                wrapper.insertAdjacentHTML('beforeend', TEMPLATE);
                
                const els = {
                    center: wrapper.querySelector('.center-play-btn'),
                    ctrls: wrapper.querySelector('.custom-controls'),
                    ppBtn: wrapper.querySelector('.play-pause-btn'),
                    iPlay: wrapper.querySelector('.icon-play'),
                    iPause: wrapper.querySelector('.icon-pause'),
                    time: wrapper.querySelector('.time-display'),
                    prog: wrapper.querySelector('.progress-container'),
                    fill: wrapper.querySelector('.progress-filled'),
                    vol: wrapper.querySelector('.volume-btn'),
                    fs: wrapper.querySelector('.fs-btn')
                };

                let isDrag = false, timer = null;

                const toggle = () => (video.paused || video.ended) ? video.play() : video.pause();
                const resetTimer = () => {
                    wrapper.classList.add('user-active');
                    wrapper.style.cursor = 'default';
                    els.ctrls.style.opacity = '1';
                    els.ctrls.style.pointerEvents = 'auto';
                    if (timer) clearTimeout(timer);
                    if (!video.paused) timer = setTimeout(() => {
                        if (!video.paused && !isDrag) {
                            wrapper.classList.remove('user-active');
                            wrapper.style.cursor = 'none';
                            els.ctrls.style.opacity = '0';
                            els.ctrls.style.pointerEvents = 'none';
                        }
                    }, 2000);
                };

                const updateState = () => {
                    const paused = video.paused;
                    wrapper.classList.toggle('playing', !paused);
                    wrapper.classList.toggle('paused', paused);
                    els.iPlay.classList.toggle('hidden', !paused);
                    els.iPause.classList.toggle('hidden', paused);
                    if (paused) {
                        els.center.style.opacity = '1';
                        els.center.style.pointerEvents = 'auto';
                        resetTimer();
                    } else {
                        els.center.style.opacity = '0';
                        els.center.style.pointerEvents = 'none';
                        resetTimer();
                    }
                };

                const scrub = (e) => {
                    const rect = els.prog.getBoundingClientRect();
                    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                    const p = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
                    els.fill.style.width = `${p * 100}%`;
                    video.currentTime = p * video.duration;
                    els.time.textContent = format(video.currentTime);
                };

                [els.center, els.ppBtn, video].forEach(b => b.addEventListener('click', e => { e.stopPropagation(); toggle(); }));
                video.addEventListener('play', updateState);
                video.addEventListener('pause', updateState);
                video.addEventListener('timeupdate', () => {
                    if (!isDrag) {
                        els.fill.style.width = `${(video.currentTime / video.duration) * 100}%`;
                        els.time.textContent = format(video.currentTime);
                    }
                });

                const start = (e) => { isDrag = true; scrub(e); resetTimer(); if(e.type==='touchstart') e.preventDefault(); };
                const end = () => { if(isDrag) { isDrag = false; if(!video.paused) resetTimer(); }};
                
                els.prog.addEventListener('mousedown', start);
                els.prog.addEventListener('touchstart', start, {passive:false});
                document.addEventListener('mousemove', e => isDrag && scrub(e));
                document.addEventListener('touchmove', e => isDrag && scrub(e), {passive:false});
                document.addEventListener('mouseup', end);
                document.addEventListener('touchend', end);
                
                wrapper.addEventListener('mousemove', resetTimer);
                wrapper.addEventListener('touchstart', () => video.paused ? resetTimer() : (wrapper.classList.contains('user-active') ? null : resetTimer()));
                
                els.vol.addEventListener('click', e => { e.stopPropagation(); video.muted = !video.muted; els.vol.style.opacity = video.muted ? '0.5' : '1'; });
                
                els.fs.addEventListener('click', async e => {
                    e.stopPropagation();
                    if(!document.fullscreenElement) {
                        wrapper.requestFullscreen ? wrapper.requestFullscreen() : (video.webkitEnterFullscreen && video.webkitEnterFullscreen());
                    } else document.exitFullscreen();
                });

                wrapper.classList.add('paused');
                video.muted = false;
                resetTimer();
            });
        },

        modal() {
            const modal = document.getElementById('modal');
            const closeBtn = document.querySelector('.modal-close');
            if (!modal) return;

            const stop = () => { const v = modal.querySelector('video'); if (v) v.pause(); };
            
            document.querySelectorAll('a[href="#modal"]').forEach(btn => {
                btn.addEventListener('click', () => setTimeout(() => {
                    const v = modal.querySelector('video');
                    if (v) { v.currentTime = 0; v.play().catch(console.error); }
                }, 50));
            });

            const close = () => {
                stop();
                if (closeBtn && window.location.hash === '#modal') closeBtn.click();
            };

            if (closeBtn) closeBtn.addEventListener('click', stop);
            modal.addEventListener('click', e => { if (e.target === modal) close(); });
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && window.location.hash === '#modal') close(); });
        },

        form() {
            const form = document.getElementById("contact-form");
            if (!form) return;
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const els = {
                    t: document.getElementById("contact-title"),
                    s: document.getElementById("success-message"),
                    f: document.getElementById("footer"),
                    b: form.querySelector(".btn-submit"),
                    txt: form.querySelector(".btn-txt")
                };
                form.classList.add("hidden");
                if (els.t) els.t.classList.add("hidden");
                if (els.f) els.f.classList.add("hidden");
                if (els.s) els.s.classList.remove("hidden");
                if (els.b) els.b.disabled = true;
                if (els.txt) els.txt.textContent = "Sending...";

                fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { "Accept": "application/json" }
                }).then(res => { if (!res.ok) throw new Error(); })
                .catch(() => {
                    if (els.s) els.s.classList.add("hidden");
                    form.classList.remove("hidden");
                    if (els.t) els.t.classList.remove("hidden");
                    if (els.f) els.f.classList.remove("hidden");
                    if (els.b) els.b.disabled = false;
                    if (els.txt) els.txt.textContent = "Send";
                    alert("Une erreur est survenue.");
                });
            });
        },
     contactAnimation() {
    // 1. SÉCURITÉ MOBILE : Si mobile, on ne fait RIEN. 
    if (App.state.isMobile) return; 

    const form = document.querySelector('.contact-form');
    if (!form) return;

    // Sélection des éléments
    const inputs = form.querySelectorAll('.form-group input, .form-group textarea');
    const footer = form.querySelector('.form-footer');

    // 2. PRÉPARATION (Desktop seulement)
    gsap.set([...inputs, footer], { 
        opacity: 0,
        filter: "blur(10px)",
        x: -50, 
        clipPath: "inset(0 100% 0 0)" 
    });

    // 3. ANIMATION
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".form-wrapper",
            start: "top 60%", 
            toggleActions: "play none none reverse"
        }
    });

    // Animation des Inputs (Swipe de Gauche à Droite)
    tl.to(inputs, { 
        clipPath: "inset(0 0% 0 0)", 
        filter: "blur(0px)",
        opacity: 1,
        x: 0,
        
        duration: 1,
        stagger: 0.2, 
        ease: "power3.out" 
    });

    // Animation du Footer
    tl.to(footer, { 
        clipPath: "inset(0 0% 0 0)",
        opacity: 1, 
        y: 0, 
        x: 0,
        filter: "blur(0px)", 
        duration: 0.8, 
        ease: "power2.out" 
    }, "-=0.6");
},

        copyright() {
            const s = document.getElementById("year");
            if (s) s.innerText = new Date().getFullYear();
        },

        // ------------------------------------------------------------
        // SCROLL REVEAL (Adapté pour site statique avec SplitType)
        // ------------------------------------------------------------
        scrollReveal() {
            // Sécurité 1 : Désactivé sur mobile
            if (App.state.isMobile) return;
            
            // Sécurité 2 : On s'assure que GSAP et SplitType sont bien chargés
            if (typeof gsap === 'undefined' || typeof SplitType === 'undefined') return;

            const blurTargets = document.querySelectorAll('.blur-reveal');
            const slideTargets = document.querySelectorAll('.reveal-text');

            if (!blurTargets.length && !slideTargets.length) return;

            try {
                // 1. PRÉPARATION "SLIDE UP" (.reveal-text)
                if (slideTargets.length > 0) {
                    const splitSlide = new SplitType(slideTargets, { types: 'words', tagName: 'span' });

                    splitSlide.words.forEach(word => {
                        const wrapper = document.createElement('span');
                        wrapper.style.display = 'inline-block';
                        wrapper.style.overflow = 'hidden';
                        wrapper.style.verticalAlign = 'top';

                        word.parentNode.insertBefore(wrapper, word);
                        wrapper.appendChild(word);
                    });

                    slideTargets.forEach(el => {
                        try { gsap.set(el.querySelectorAll('.word'), { y: "110%" }); } catch (e) {}
                        el.classList.add('gsap-ready');
                    });
                }

                // 2. PRÉPARATION "BLUR" (.blur-reveal)
                if (blurTargets.length > 0) {
                    const splitBlur = new SplitType(blurTargets, { types: 'words', tagName: 'span' });
                    
                    blurTargets.forEach(el => {
                        try { 
                            gsap.set(el.querySelectorAll('.word'), { opacity: 0, filter: 'blur(10px)', y: 20, scale: 1.05 }); 
                        } catch(e){}
                        el.classList.add('gsap-ready');
                    });
                }

                // ====================================================================
                // 3. LE DÉCLENCHEUR (Intersection Observer natif)
                // ====================================================================
                const observerOptions = {
                    root: null,
                    // MODIFICATION ICI : -15% en bas force l'élément à bien entrer dans l'écran avant de s'animer
                    rootMargin: '0px 0px -5% 0px', 
                    threshold: 0.1 
                };

                const revealObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const el = entry.target;

                            // Animation Slide Up
                            if (el.classList.contains('reveal-text')) {
                                try {
                                    gsap.to(el.querySelectorAll('.word'), {
                                        y: "0%",
                                        duration: 0.85,
                                        stagger: 0.03,
                                        ease: "power3.out",
                                        overwrite: "auto"
                                    });
                                } catch (e) {}
                            }

                            // Animation Blur
                            if (el.classList.contains('blur-reveal')) {
                                try {
                                    gsap.to(el.querySelectorAll('.word'), {
                                        opacity: 1, 
                                        filter: 'blur(0px)', 
                                        y: 0, 
                                        scale: 1, 
                                        duration: 0.8, 
                                        stagger: 0.04, 
                                        ease: "power2.out", 
                                        overwrite: true
                                    });
                                } catch(e){}
                            }

                            // On arrête d'observer cet élément une fois animé
                            observer.unobserve(el);
                        }
                    });
                }, observerOptions);

                // FIX DU REFRESH : On attend 150ms que la page soit bien remontée à zéro
                // avant d'allumer le "radar" de l'Observer.
                setTimeout(() => {
                    slideTargets.forEach(el => revealObserver.observe(el));
                    blurTargets.forEach(el => revealObserver.observe(el));
                }, 150);

            } catch (e) { console.error('Scroll reveal error:', e); }
        },

                heroReelTakeover() {
            const playBtn = document.querySelector('.play-reel-trigger');
            const introTxt = document.querySelector('.intro-txt');
            const workSection = document.querySelector('#work');
            const header = document.querySelector('header');

            const navbar = document.querySelector('.navbar');
            const navBtn = document.querySelector('.contact-btn');
            const logo = document.querySelector('.logo-text');
            const toggle = document.querySelector('.light_dark');
            const navLinks = navbar ? Array.from(navbar.querySelectorAll('.nav-link')) : [];
            const navbarChildren = navbar ? Array.from(navbar.children) : [];
            const btnIndex = navbar && navBtn ? navbarChildren.indexOf(navBtn) : -1;
            const linkEndX = navLinks.map(link => navbarChildren.indexOf(link) < btnIndex ? 30 : -30);

            const reelBg = document.querySelector('.hero-reel-bg');
            const reelVideo = document.querySelector('.hero-reel-video');
            
            // --- FIX STATIQUE : On cible .video1 au lieu de .zoom-in ---
            const targetVideo = document.querySelector('.video1 .video-item');

            const muteBtn = document.querySelector('.reel-mute-btn');
            const closeBtn = document.querySelector('.reel-close-btn');

            // Sécurité : On vérifie que TOUT est là, y compris GSAP
            if (!playBtn || !reelBg || !reelVideo || !targetVideo || typeof gsap === 'undefined') return;

            let isPlaying = false;
            let openTl = null;

            const closeReel = () => {
                if (!isPlaying) return;
                isPlaying = false;

                window.removeEventListener('wheel', handleScrollClose);
                window.removeEventListener('touchmove', handleScrollClose);

                if (openTl) openTl.kill();

                const rect = targetVideo.getBoundingClientRect();

                reelBg.classList.remove('is-active'); 
                try {
                    const exitTl = gsap.timeline({
                        defaults: { ease: "power3.inOut" },
                        onComplete: () => {
                            try { gsap.set([introTxt, workSection], { clearProps: "all" }); } catch (e) {}
                            try { gsap.set(reelBg, { display: 'none' }); } catch (e) {}
                            document.body.style.overflow = '';
                            if (reelVideo) {
                                reelVideo.pause();
                                reelVideo.currentTime = 0;
                            }
                        }
                    });

                    if (muteBtn || closeBtn) {
                        exitTl.to([muteBtn, closeBtn].filter(b => b), { opacity: 0, scale: 0.9, duration: 0.6 }, 0);
                    }

                    exitTl.to(reelVideo, {
                        top: rect.top, left: rect.left,
                        width: rect.width, height: rect.height,
                        borderRadius: '10px', duration: 0.8
                    }, 0.1);

                    if (workSection) exitTl.to(workSection, { y: 0, duration: 0.8 }, 0.2);

                   if (window.innerWidth > 768) {
                        if (logo && toggle) exitTl.to([toggle, logo], { y: 0, opacity: 1, duration: 0.6 }, 0.3);
                        if (navBtn) exitTl.to(navBtn, { scale: 1, opacity: 1, duration: 0.6 }, 0.3);

                        navLinks.forEach(link => {
                            exitTl.to(link, { x: 0, opacity: 1, duration: 0.6 }, 0.3);
                        });
                    }

                    if (introTxt) exitTl.to(introTxt, { y: 0, opacity: 1, duration: 0.6 }, 0.3);
                } catch (e) { console.error('Close reel error:', e); }
            };

            let startY = 0;
            const handleScrollClose = (e) => {
                const delta = e.type === 'wheel' ? e.deltaY : (startY - (e.touches ? e.touches[0].clientY : 0));
                if (delta > 10) closeReel();
            };

            playBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isPlaying) return;
                isPlaying = true;

                try {
                    gsap.killTweensOf([header, navBtn, logo, toggle, ...navLinks, introTxt, workSection, reelVideo]);
                } catch (e) {}
                document.body.style.overflow = 'hidden';

                const rect = targetVideo.getBoundingClientRect();

                try {
                    gsap.set(reelBg, { display: 'block' });
                    } catch (e) {}
                        setTimeout(() => reelBg.classList.add('is-active'), 10);

                try {
                    gsap.set(reelVideo, {
                        top: rect.top, left: rect.left,
                        width: rect.width, height: rect.height,
                        borderRadius: '10px'
                    });
                } catch (e) {}

                if (muteBtn) {
                    try { gsap.set(muteBtn, { x: -100, autoAlpha: 0 }); } catch (e) {}
                }
                if (closeBtn) {
                    try { gsap.set(closeBtn, { x: 100, autoAlpha: 0 }); } catch (e) {}
                }

                reelVideo.muted = true;
                if (muteBtn) {
                    const icnMuted = muteBtn.querySelector('.icon-muted');
                    const icnUnmuted = muteBtn.querySelector('.icon-unmuted');
                    const txtUnmute = muteBtn.querySelector('.reel-txt-unmute');
                    const txtMute = muteBtn.querySelector('.reel-txt-mute');

                    if (icnMuted) icnMuted.classList.remove('hidden');
                    if (icnUnmuted) icnUnmuted.classList.add('hidden');
                    if (txtUnmute) txtUnmute.classList.remove('hidden');
                    if (txtMute) txtMute.classList.add('hidden');
                }

                try {
                    openTl = gsap.timeline({
                        defaults: { ease: "power3.inOut" },
                        onComplete: () => {
                            window.addEventListener('wheel', handleScrollClose, { passive: true });
                            window.addEventListener('touchstart', e => startY = e.touches ? e.touches[0].clientY : 0, { passive: true });
                            window.addEventListener('touchmove', handleScrollClose, { passive: true });
                        }
                    });

                   if (window.innerWidth > 768) {
                    if (logo && toggle) openTl.fromTo([toggle, logo], { y: 0, opacity: 1 }, { y: -20, opacity: 0, duration: 0.6 }, 0);
                    if (navBtn) openTl.fromTo(navBtn, { scale: 1, opacity: 1 }, { scale: 0, opacity: 0, duration: 0.6 }, 0);

                        navLinks.forEach((link, i) => {
                            openTl.fromTo(link, { x: 0, opacity: 1 }, { x: linkEndX[i], opacity: 0, duration: 0.6 }, 0);
                        });
                    }
                    if (introTxt) openTl.fromTo(introTxt, { y: 0, opacity: 1 }, { y: 50, opacity: 0, duration: 0.6 }, 0);

                    openTl.to(reelVideo, {
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        borderRadius: '0px', duration: 0.8
                    }, 0.1);

                    if (workSection) openTl.fromTo(workSection, { y: 0 }, { y: window.innerHeight, duration: 0.8 }, 0.4);

                    if (muteBtn) openTl.to(muteBtn, { x: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, 0.7);
                    if (closeBtn) openTl.to(closeBtn, { x: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, 0.7);

                    reelVideo.play().catch(() => {});
                } catch (e) { console.error('Open reel error:', e); }
            });

            if (closeBtn) closeBtn.addEventListener('click', closeReel);

            if (muteBtn) {
                const icnMuted = muteBtn.querySelector('.icon-muted');
                const icnUnmuted = muteBtn.querySelector('.icon-unmuted');
                const txtUnmute = muteBtn.querySelector('.reel-txt-unmute');
                const txtMute = muteBtn.querySelector('.reel-txt-mute');

                muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!reelVideo) return;
                    reelVideo.muted = !reelVideo.muted;
                    if (reelVideo.muted) {
                        if (txtUnmute) txtUnmute.classList.remove('hidden');
                        if (txtMute) txtMute.classList.add('hidden');
                        if (icnMuted) icnMuted.classList.remove('hidden');
                        if (icnUnmuted) icnUnmuted.classList.add('hidden');
                    } else {
                        if (txtUnmute) txtUnmute.classList.add('hidden');
                        if (txtMute) txtMute.classList.remove('hidden');
                        if (icnMuted) icnMuted.classList.add('hidden');
                        if (icnUnmuted) icnUnmuted.classList.remove('hidden');
                    }
                });
            }

            reelVideo.addEventListener('click', () => {
                if (!reelVideo) return;
                if (reelVideo.paused) {
                    reelVideo.play().catch(() => {});
                } else {
                    reelVideo.pause();
                }
            });
        },
        // ------------------------------------------------------------
        // HERO ANIMATIONS (Intro Load)
        // ------------------------------------------------------------
        heroAnimations() {
            if (typeof gsap === 'undefined') return;

            const spanLeft = document.querySelector('.hero-h1 span:first-child');
            const spanRight = document.querySelector('.hero-h1 span:last-child');
            const heroImg = document.querySelector('.heroimg');
            const aboutParagraph = document.querySelector('.about-p');
            const ctaBtn = document.querySelector('.open-modal-trigger');

            // 1. MOBILE CHECK
            if (App.state.isMobile) {
                if (spanLeft) gsap.set(spanLeft, { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" });
                if (spanRight) gsap.set(spanRight, { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" });
                if (heroImg) gsap.set(heroImg, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
                if (aboutParagraph) gsap.set(aboutParagraph, { opacity: 1, x: 0 });
                if (ctaBtn) {
                    ctaBtn.style.opacity = '1'; ctaBtn.style.transform = 'translateY(0)'; ctaBtn.style.pointerEvents = 'auto';
                    ctaBtn.classList.add('is-visible');
                }
                return;
            }

            const tl = gsap.timeline({ defaults: { duration: 1.8, ease: "expo.out" }, delay: 0.3 });

            // Titres
            if (spanLeft && spanRight) {
                tl.fromTo(spanLeft, 
                    { x: '-50vw', y: '10vh', scale: 0.1, filter: "blur(50px)", opacity: 0 },
                    { x: 0, y: 0, scale: 1, filter: "blur(0px)", opacity: 1, clearProps: "filter, transform, opacity" }, 0);
                tl.fromTo(spanRight, 
                    { x: '50vw', y: '10vh', scale: 0.1, filter: "blur(50px)", opacity: 0 },
                    { x: 0, y: 0, scale: 1, filter: "blur(0px)", opacity: 1, clearProps: "filter, transform, opacity" }, 0);
            }

            // IMAGE : SÉCURITÉ REFRESH
            // Si on est en haut (<50px), on joue l'intro.
            // Si on est en bas, scrollReveal l'a déjà cachée, donc on NE TOUCHE PAS.
            if (heroImg && window.scrollY < 50) {
                gsap.fromTo(heroImg, 
                    { y: '100vh', scale: 0.1, filter: "blur(50px)" },
                    { y: 0, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out", delay: 0.3, clearProps: "all" }
                );
            }

            // Texte
            if (aboutParagraph) {
                gsap.from(aboutParagraph, {
                    x: -100, duration: 2.2, ease: "expo.out", delay: 0.2, clearProps: "all"
                });
            }

            // Bouton (Delay CSS)
            if (ctaBtn) {
                setTimeout(() => ctaBtn.classList.add('is-visible'), 600);
            }
        }
    }
};


// Start App
document.addEventListener('DOMContentLoaded', () => App.init());

