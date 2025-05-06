document.addEventListener('DOMContentLoaded', () => {

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

// V.3 Strict Mobile Light Mode + Default Dark Mode for Desktop/Tablet
const savedTheme = localStorage.getItem('theme');
const isMobile = window.matchMedia('(max-width: 767px) and (max-height: 900px)').matches;

// Decision tree:
if (savedTheme) {
    // 1. Respect saved preference above all
    setTheme(savedTheme === 'dark', false);
} else if (isMobile) {
    // 2. Force light mode if mobile (regardless of OS preference)
    setTheme(false, true);
} else {
    // 3. DEFAULT: Force dark mode for all non-mobile devices
    setTheme(true, true);
}


/*
// V.2 Dark Mode default while respecting preferences (recommended approach)
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    setTheme(false, true); // Apply light only if explicitly set or prefers light
} else {
    setTheme(true, true); // Default to dark in all other cases
}
*/

/*
// V.1 Light Mode default while respecting preferences (alternative)
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setTheme(true, true);  // Apply dark only if:
                          // - User explicitly chose dark mode, OR
                          // - No choice saved AND OS prefers dark
} else {
    setTheme(false, true); // DEFAULT: Light mode for:
                          // - First visits (no saved preference)
                          // - Explicit light mode choice
                          // - OS prefers light
}
*/


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

}); // End DOMContentLoaded