document.addEventListener('DOMContentLoaded', () => {
    // --- Email Copy Functionality ---
    const emailParts = {
        user: 'admin',
        domain: 'ghostai.fr'
    };
    const fullEmail = `${emailParts.user}@${emailParts.domain}`;

    const emailSpan = document.getElementById('safeEmailLink');
    const copyBtn = document.getElementById('copyBtn');
    const copyMsg = document.getElementById('copyMsg');

    if (emailSpan && copyBtn && copyMsg) {
        emailSpan.textContent = `Contact: ${fullEmail}`;
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(fullEmail).then(() => {
                // --- SUCCESS ---
                copyMsg.textContent = 'Email Copied!';
                copyMsg.classList.add('visible');
                emailSpan.classList.add('email-copied');
                setTimeout(() => {
                    copyMsg.classList.remove('visible');
                    emailSpan.classList.remove('email-copied');
                    setTimeout(() => {
                       if (!copyMsg.classList.contains('visible')) {
                           copyMsg.textContent = '';
                       }
                    }, 400);
                }, 2500);
            }).catch((err) => {
                // --- FAILURE ---
                console.error('Clipboard copy failed: ', err);
                copyMsg.textContent = 'Copy Failed';
                copyMsg.classList.add('visible');
                 setTimeout(() => {
                    copyMsg.classList.remove('visible');
                     setTimeout(() => {
                       if (!copyMsg.classList.contains('visible')) {
                           copyMsg.textContent = '';
                       }
                    }, 400);
                }, 3000);
            });
        });
    } else {
        console.warn('Required elements for email copy functionality not found:', {
            emailSpanExists: !!emailSpan,
            copyBtnExists: !!copyBtn,
            copyMsgExists: !!copyMsg
        });
    }

    // --- Back to Top Button Functionality (Static Version) ---
    // Get reference using the correct ID
    const backToTopButton = document.getElementById("backToTopBtnStatic");

    // REMOVED Scroll logic
    // window.addEventListener('scroll', () => { ... });

    if (backToTopButton) {
        // Add click listener for scrolling
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll animation
            });
        });
    } else {
        console.warn('Back to Top button element (#backToTopBtnStatic) not found.');
    }

}); // End DOMContentLoaded