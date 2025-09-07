(function() {
    async function loadComponent(selector, url) {
        const placeholder = document.querySelector(selector);
        if (!placeholder) return null;
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) return null;
            const html = await res.text();
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            // Replace placeholder with loaded nodes
            const parent = placeholder.parentNode;
            while (tmp.firstChild) {
                parent.insertBefore(tmp.firstChild, placeholder);
            }
            parent.removeChild(placeholder);
            return parent;
        } catch (e) { return null; }
    }

    function initCommonBehaviors(root) {
        // Mobile menu behavior
        const menuToggle = document.getElementById('menu-toggle');
        const closeMenu = document.getElementById('close-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileNavLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

        if (menuToggle && mobileMenu && closeMenu) {
            menuToggle.addEventListener('click', function() {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            closeMenu.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }

        // Current year
        document.querySelectorAll('[data-component-current-year]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    // Auto-insert components if placeholders exist
    document.addEventListener('DOMContentLoaded', async function() {
        await loadComponent('[data-component="navbar"]', 'components/navbar.html');
        await loadComponent('[data-component="footer"]', 'components/footer.html');
        initCommonBehaviors(document);
    });
})();


