document.addEventListener('DOMContentLoaded', () => {
    const emailParts = {
        user: 'admin',
        domain: 'ghostai.fr'
    };

    const emailSpan = document.getElementById('safeEmailLink');
    const fullEmail = `${emailParts.user}@${emailParts.domain}`;
    emailSpan.textContent = `Contact: ${fullEmail}`;

    const copyBtn = document.getElementById('copyBtn');
    const copyMsg = document.getElementById('copyMsg');

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(fullEmail).then(() => {
            copyMsg.textContent = 'Copied!';
            copyMsg.classList.add('visible');

            setTimeout(() => {
                copyMsg.classList.remove('visible');
                copyMsg.textContent = '';
            }, 2000);
        }).catch(() => {
            alert('Copy failed. Please copy manually.');
        });
    });
});