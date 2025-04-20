document.addEventListener('DOMContentLoaded', () => {
    const emailParts = {
        user: 'admin',
        domain: 'ghostai.fr'
    };
    const fullEmail = `${emailParts.user}@${emailParts.domain}`;

    // Get references to the elements
    const emailSpan = document.getElementById('safeEmailLink');
    const copyBtn = document.getElementById('copyBtn');
    const copyMsg = document.getElementById('copyMsg');

    // Check if all elements exist
    if (emailSpan && copyBtn && copyMsg) {
        // Update the visible email span text
        emailSpan.textContent = `Contact: ${fullEmail}`; 

        // Add click listener to the button
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(fullEmail).then(() => {
                // --- SUCCESS ---
                copyMsg.textContent = 'Email Copied!'; 
                copyMsg.classList.add('visible');
                
                // MODIFIED: Add class to emailSpan for color change
                emailSpan.classList.add('email-copied');

                // Set timeout to hide message and revert color
                setTimeout(() => {
                    copyMsg.classList.remove('visible');
                    // MODIFIED: Remove class from emailSpan
                    emailSpan.classList.remove('email-copied'); 

                    // Reset message text after fade out
                    setTimeout(() => { 
                       if (!copyMsg.classList.contains('visible')) {
                           copyMsg.textContent = ''; 
                       }
                    }, 400); // Match CSS transition duration
                }, 2500); // Message visible duration

            }).catch((err) => {
                // --- FAILURE ---
                console.error('Clipboard copy failed: ', err);
                copyMsg.textContent = 'Copy Failed'; 
                copyMsg.classList.add('visible');

                 // Set timeout to hide failure message
                 setTimeout(() => {
                    copyMsg.classList.remove('visible');
                    // Reset message text after fade out
                     setTimeout(() => { 
                       if (!copyMsg.classList.contains('visible')) {
                           copyMsg.textContent = ''; 
                       }
                    }, 400);
                }, 3000); 
            });
        });
    } else {
        // Log warning if any element is missing
        console.warn('Required elements for email copy functionality not found:', {
            emailSpanExists: !!emailSpan,
            copyBtnExists: !!copyBtn,
            copyMsgExists: !!copyMsg
        });
    }
});