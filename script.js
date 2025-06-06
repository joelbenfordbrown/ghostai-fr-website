// ===== Accordion Functionality =====
function initAccordion() {
  const accordionButtons = document.querySelectorAll('.accordion-button');
  
  accordionButtons.forEach(button => {
    const content = button.nextElementSibling;
    button.setAttribute('aria-expanded', 'false');
    content.style.maxHeight = '0';
    
    // ===== CURRENT IMPLEMENTATION (multiple open) =====
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !expanded);
      content.style.maxHeight = expanded ? '0' : `${content.scrollHeight}px`;
    });

    // ===== ALTERNATIVE: Single-open mode (commented out) =====
    /*
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      
      // Close all other accordions first
      document.querySelectorAll('.accordion-button').forEach(otherBtn => {
        if (otherBtn !== button) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.style.maxHeight = '0';
        }
      });
      
      // Toggle current item
      button.setAttribute('aria-expanded', !expanded);
      content.style.maxHeight = expanded ? '0' : `${content.scrollHeight}px`;
    });
    */
   
  });
}

document.addEventListener('DOMContentLoaded', () => {
    initAccordion(); // Initialize accordion functionality

    // --- Theme Toggle Functionality ---
    const themeCheckbox = document.getElementById('theme-checkbox');
    const logoImage = document.getElementById('logo-img');
    const lightLogoSrc = '/assets/logos/ghost-logo.png';
    const lightLogoSrcset = '/assets/logos/ghost-logo-2.png 2x';
    const darkLogoSrc = '/assets/logos/dark mode logos/ghost-logo.png';
    const darkLogoSrcset = '/assets/logos/dark mode logos/ghost-logo-2.png 2x';
    const lightThemeColor = '#f8f9fa';
    const darkThemeColor = '#000000';

    function setTheme(isDarkMode, updateStorage = true) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            if (logoImage) {
                logoImage.src = darkLogoSrc;
                logoImage.srcset = darkLogoSrcset;
            }
            if (updateStorage) localStorage.setItem('theme', 'dark');
            if(themeCheckbox) themeCheckbox.checked = true;
            const darkMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
            if (darkMeta) darkMeta.setAttribute('content', darkThemeColor);
            const genericMeta = document.querySelector('meta[name="theme-color"]:not([media])');
            if(genericMeta) genericMeta.setAttribute('content', darkThemeColor);
        } else {
            document.body.classList.remove('dark-mode');
            if (logoImage) {
                logoImage.src = lightLogoSrc;
                logoImage.srcset = lightLogoSrcset;
            }
            if (updateStorage) localStorage.setItem('theme', 'light');
             if(themeCheckbox) themeCheckbox.checked = false;
            const lightMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
            if (lightMeta) lightMeta.setAttribute('content', lightThemeColor);
            const genericMeta = document.querySelector('meta[name="theme-color"]:not([media])');
            if(genericMeta) genericMeta.setAttribute('content', lightThemeColor);
        }
    }

// Strict Mobile Light Mode + Default Dark Mode for Desktop/Tablet
const savedTheme = localStorage.getItem('theme');

// Decision tree:
if (savedTheme) {
    // Respect saved preference
    setTheme(savedTheme === 'dark', false);
} else {
    // Default to dark mode for all devices
    setTheme(true, true);
}

    // Add listener for toggle change
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            setTheme(themeCheckbox.checked, true); // User toggle always updates storage
        });
    } else {
         console.warn('Theme toggle checkbox not found.');
    }

    // --- Hamburger Menu Functionality ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.classList.toggle('active');
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerHeightEstimate = 60;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerHeightEstimate;
                     window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.classList.remove('active');
                }
            });
        });

         document.addEventListener('click', (event) => {
            const isClickInsideNav = mainNav.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
            }
        });

    } else {
         console.warn('Menu toggle button or main nav element not found.');
    }

    // --- Email Copy Functionality ---
    const emailParts = { user: 'admin', domain: 'ghostai.fr' };
    const fullEmail = `${emailParts.user}@${emailParts.domain}`;
    const emailSpan = document.getElementById('safeEmailLink');
    const copyBtn = document.getElementById('copyBtn');
    const copyMsg = document.getElementById('copyMsg');
    if (emailSpan && copyBtn && copyMsg) {
        // MODIFIED: Add pointer-events control via JS for email text hover
        const emailRow = emailSpan.closest('.email-row');

        emailSpan.textContent = `Contact: ${fullEmail}`;
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(fullEmail).then(() => {
                copyMsg.textContent = 'Email Copied!';
                copyMsg.classList.add('visible');
                // Ensure row hover state is active if button is clicked fast
                 if (emailRow) emailRow.classList.add('copy-active');
                emailSpan.classList.add('email-copied');
                setTimeout(() => {
                    copyMsg.classList.remove('visible');
                    emailSpan.classList.remove('email-copied');
                     if (emailRow) emailRow.classList.remove('copy-active');
                    setTimeout(() => { if (!copyMsg.classList.contains('visible')) { copyMsg.textContent = ''; } }, 400);
                }, 2500);
            }).catch((err) => {
                console.error('Clipboard copy failed: ', err);
                copyMsg.textContent = 'Copy Failed';
                copyMsg.classList.add('visible');
                 setTimeout(() => {
                    copyMsg.classList.remove('visible');
                     setTimeout(() => { if (!copyMsg.classList.contains('visible')) { copyMsg.textContent = ''; } }, 400);
                }, 3000);
            });
        });

         // Add hover listeners to the BUTTON to toggle a class on the ROW
         if(emailRow && copyBtn && emailSpan) {
            copyBtn.addEventListener('mouseenter', () => {
                 emailRow.classList.add('button-hovered');
             });
             copyBtn.addEventListener('mouseleave', () => {
                 emailRow.classList.remove('button-hovered');
             });
              copyBtn.addEventListener('focus', () => {
                 emailRow.classList.add('button-hovered');
             });
             copyBtn.addEventListener('blur', () => {
                 emailRow.classList.remove('button-hovered');
             });
         }

    } else {
        console.warn('Required elements for email copy functionality not found:', { emailSpanExists: !!emailSpan, copyBtnExists: !!copyBtn, copyMsgExists: !!copyMsg });
    }

    // --- Back to Top Button Functionality (Static Version) ---
    const backToTopButton = document.getElementById("backToTopBtnStatic");
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.warn('Back to Top button element (#backToTopBtnStatic) not found.');
    }

    // --- Typing Animation with Memory Leak Prevention ---
    const changingText = document.querySelector('.changing-text');
    const words = ['unique identities', 'persistent personality', 'synthetic sentience', 'ethical agency'];
    let currentIndex = 0;
    let isDeleting = false;
    let text = '';
    let typingSpeed = 100;
    let wordDelay = 2000;
    let timeoutId; // Added for cleanup
    let animationActive = true; // Added for visibility tracking

    function handleVisibilityChange() {
      if (document.hidden) {
        clearTimeout(timeoutId);
        animationActive = false;
      } else if (!animationActive) {
        animationActive = true;
        type();
      }
    }

    function type() {
      const currentWord = words[currentIndex];
      
      if (isDeleting) {
        text = currentWord.substring(0, text.length - 1);
      } else {
        text = currentWord.substring(0, text.length + 1);
      }
      
      changingText.textContent = text;
      
      if (!isDeleting && text === currentWord) {
        isDeleting = true;
        typingSpeed = wordDelay;
      } else if (isDeleting && text === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % words.length;
        typingSpeed = 100;
      } else {
        typingSpeed = isDeleting ? 50 : 100;
      }
      
      timeoutId = setTimeout(type, typingSpeed);
    }

    // Start animation and set up visibility listener
    type();
    document.addEventListener('visibilitychange', handleVisibilityChange);
}); // End DOMContentLoaded