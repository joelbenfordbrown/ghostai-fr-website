document.addEventListener('DOMContentLoaded', () => {
    const contactBtn = document.getElementById('contactBtn');
    
    // Protected email construction
    const emailParts = {
        user: 'admin',
        domain: 'ghostai.fr',
        subject: 'GHOST Framework Inquiry'
    };

    const handleContact = () => {
        try {
            // Create visible link element for better browser compatibility
            const mailLink = document.createElement('a');
            const mailto = `mailto:${emailParts.user}@${emailParts.domain}?subject=${encodeURIComponent(emailParts.subject)}`;
            
            mailLink.href = mailto;
            mailLink.style.display = 'none';
            document.body.appendChild(mailLink);
            
            // Simulate natural click
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            
            mailLink.dispatchEvent(event);
            document.body.removeChild(mailLink);
            
            // Fallback for mobile browsers
            setTimeout(() => {
                if(!document.hidden) {
                    window.location.href = mailto;
                }
            }, 100);
            
        } catch (e) {
            // Ultimate fallback
            alert('Please contact us at ' + emailParts.user + '@' + emailParts.domain);
        }
    };

    // Event listeners
    contactBtn.addEventListener('click', handleContact);
    contactBtn.addEventListener('touchstart', handleContact);

    // Anti-inspection protection
    contactBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
});