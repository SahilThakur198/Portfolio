/**
 * Portfolio — Main JavaScript
 * Handles: dynamic projects, filtering, modal, scroll reveal,
 * typing effect, particles, custom cursor, nav scroll spy
 */

(function () {
    'use strict';

    // ─── DOM Ready ──────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        // Prevent auto-scroll on refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        setupLoader();
        setupNavigation();
        setupMobileMenu();
        setupScrollProgress();
        setupCustomCursor();
        setupTypingEffect();
        setupParticles();
        setupScrollReveal();
        setupScrollSpy();
        loadProjects();
        setupCurrentYear();
        loadResume();
    }

    // ─── Loader ─────────────────────────────────────────────────
    function setupLoader() {
        const loader = document.getElementById('page-loader');
        const textEl = document.getElementById('loader-text');
        if (!loader || !textEl) return;

        const greetings = [
            { text: 'नमस्ते', font: "'Noto Sans Devanagari', sans-serif" },
            { text: 'Hello', font: "'Inter', sans-serif" },
            { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', font: "'Noto Sans Gurmukhi', sans-serif" },
            { text: 'नमस्कार', font: "'Noto Sans Devanagari', sans-serif" },
            { text: 'こんにちは', font: "'Noto Sans JP', sans-serif" },
            { text: '你好', font: "'Noto Sans SC', sans-serif" },
        ];

        let idx = 0;
        function showNext() {
            const g = greetings[idx % greetings.length];
            textEl.style.fontFamily = g.font;
            textEl.textContent = g.text;
            idx++;
        }
        showNext();
        const cycle = setInterval(showNext, 550);

        let dismissed = false;
        function dismiss() {
            if (dismissed) return;
            dismissed = true;
            clearInterval(cycle);
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 600);
        }

        window.addEventListener('load', () => setTimeout(dismiss, 500));
        setTimeout(dismiss, 3000); // hard timeout fallback
    }

    // ─── Navigation ─────────────────────────────────────────────
    function setupNavigation() {
        const nav = document.querySelector('.navbar');
        if (!nav) return;

        // Scroll shadow
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    closeMobileMenu();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ─── Mobile Menu ────────────────────────────────────────────
    function setupMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const closeBtn = document.getElementById('close-menu');
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-overlay');

        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => openMobileMenu());
        if (closeBtn) closeBtn.addEventListener('click', () => closeMobileMenu());
        if (overlay) overlay.addEventListener('click', () => closeMobileMenu());

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => closeMobileMenu());
        });
    }

    function openMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-overlay');
        if (menu) menu.classList.add('open');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-overlay');
        if (menu) menu.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ─── Scroll Progress Bar ────────────────────────────────────
    function setupScrollProgress() {
        const bar = document.querySelector('.progress-bar');
        if (!bar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            bar.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) + '%' : '0%';
        }, { passive: true });
    }

    // ─── Custom Cursor ──────────────────────────────────────────
    function setupCustomCursor() {
        const ring = document.querySelector('.cursor-ring');
        const dot = document.querySelector('.cursor-dot');
        if (!ring || !dot || !window.matchMedia('(hover: hover)').matches) return;

        let mx = 0, my = 0;
        let rx = 0, ry = 0;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        });

        function animateRing() {
            rx += (mx - rx) * 0.15;
            ry += (my - ry) * 0.15;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Grow cursor on interactive elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, .project-card, .glass-card, .filter-btn, .social-icon')) {
                ring.style.width = '40px';
                ring.style.height = '40px';
                ring.style.borderColor = 'var(--neon-pink)';
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, .project-card, .glass-card, .filter-btn, .social-icon')) {
                ring.style.width = '24px';
                ring.style.height = '24px';
                ring.style.borderColor = 'var(--accent)';
            }
        });
    }

    // ─── Typing Effect ──────────────────────────────────────────
    function setupTypingEffect() {
        const el = document.getElementById('hero-name');
        if (!el) return;

        const name = el.dataset.name || 'Sahil Arakh';
        const roles = ['a Developer', 'a Tech Enthusiast', 'a Designer', 'a Problem Solver'];
        const allTexts = [name, ...roles];
        let textIdx = 0;
        let charIdx = 0;
        let deleting = false;

        el.textContent = name;

        function tick() {
            const current = allTexts[textIdx];

            if (deleting) {
                charIdx--;
                el.textContent = current.substring(0, charIdx);
            } else {
                charIdx++;
                el.textContent = current.substring(0, charIdx);
            }

            let speed = deleting ? 50 : 110;

            if (!deleting && charIdx === current.length) {
                speed = current === name ? 3000 : 1800;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                textIdx = (textIdx + 1) % allTexts.length;
                speed = current === name ? 200 : 400;
            }

            setTimeout(tick, speed);
        }

        // Start after initial display
        setTimeout(() => {
            deleting = true;
            charIdx = name.length;
            tick();
        }, 3000);
    }

    // ─── Particles ──────────────────────────────────────────────
    function setupParticles() {
        const container = document.querySelector('.hero-particles');
        if (!container) return;

        const colors = [
            'var(--accent)', 'var(--neon-blue)', 'var(--neon-purple)',
            'var(--neon-pink)', 'var(--neon-green)',
        ];

        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 3 + 1;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 18) + 's';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.setProperty('--drift', (Math.random() - 0.5) * 40 + 'px');
            container.appendChild(p);
        }
    }

    // ─── Scroll Reveal ──────────────────────────────────────────
    function setupScrollReveal() {
        const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .section-heading h2');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        reveals.forEach(el => observer.observe(el));
    }

    // ─── Scroll Spy ─────────────────────────────────────────────
    function setupScrollSpy() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        const sections = document.querySelectorAll('section[id]');
        if (!navLinks.length || !sections.length) return;

        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;

        function updateActive() {
            let current = '';
            const scrollY = window.scrollY;

            if (scrollY < 100) {
                current = 'home';
            } else {
                sections.forEach(section => {
                    const top = section.offsetTop - navHeight - 100;
                    if (scrollY >= top) {
                        current = section.id;
                    }
                });
            }

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => { updateActive(); ticking = false; });
                ticking = true;
            }
        }, { passive: true });

        updateActive();
    }

    // ─── Projects Loader ────────────────────────────────────────
    let projectsData = [];
    let currentFilter = 'All';

    async function loadProjects() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        try {
            const res = await fetch('data/projects.json');
            const data = await res.json();
            projectsData = data.projects || [];
        } catch (e) {
            console.warn('Could not load projects.json:', e);
            projectsData = [];
        }

        buildFilterBar();
        renderProjects();
    }

    function buildFilterBar() {
        const bar = document.getElementById('filter-bar');
        if (!bar || !projectsData.length) return;

        const categories = ['All', ...new Set(projectsData.map(p => p.category))];

        bar.innerHTML = categories.map(cat =>
            `<button class="filter-btn${cat === currentFilter ? ' active' : ''}" data-filter="${cat}">${cat}</button>`
        ).join('');

        bar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            currentFilter = btn.dataset.filter;
            bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects();
        });
    }

    function renderProjects() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        const filtered = currentFilter === 'All'
            ? projectsData
            : projectsData.filter(p => p.category === currentFilter);

        if (!filtered.length) {
            grid.innerHTML = '<p style="text-align:center; color: var(--text-secondary); grid-column: 1/-1;">No projects in this category yet.</p>';
            return;
        }

        grid.innerHTML = filtered.map((project, i) => `
      <div class="project-card reveal" style="transition-delay: ${i * 80}ms" data-project-id="${project.id}">
        <div class="project-card-preview">
          ${project.liveUrl
                ? `<div class="iframe-preview-wrapper">
             <iframe src="${project.liveUrl}" title="${project.name} preview" loading="lazy"
                     sandbox="allow-scripts allow-same-origin" tabindex="-1"></iframe>
             <div class="iframe-overlay"></div>
           </div>`
                : (project.imageUrl
                    ? `<img src="${project.imageUrl}" alt="${project.name}" loading="lazy">`
                    : `<i class="fas fa-code placeholder-icon"></i>`)
            }
        </div>
        <div class="project-card-body">
          <span class="project-card-category">${project.category}</span>
          <h3 class="project-card-title">${project.name}</h3>
          <p class="project-card-desc">${project.description}</p>
          <div class="tech-badges">
            ${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
          </div>
          <span class="project-card-link">
            View Details <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
    `).join('');

        // Re-observe new cards for scroll reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        grid.querySelectorAll('.project-card').forEach(card => {
            observer.observe(card);
            card.addEventListener('click', () => {
                const project = projectsData.find(p => p.id === card.dataset.projectId);
                if (project) openProjectModal(project);
            });
        });
    }

    // ─── Project Modal ──────────────────────────────────────────
    function openProjectModal(project) {
        const overlay = document.getElementById('project-modal-overlay');
        if (!overlay) return;

        const modal = overlay.querySelector('.project-modal');

        modal.querySelector('.project-modal-header h2').textContent = project.name;

        const iframe = modal.querySelector('.project-modal-iframe');
        if (project.liveUrl) {
            iframe.src = project.liveUrl;
            iframe.style.display = '';
        } else {
            iframe.style.display = 'none';
            iframe.src = '';
        }

        modal.querySelector('.project-modal-desc').textContent = project.description;

        const techContainer = modal.querySelector('.modal-tech-badges');
        techContainer.innerHTML = project.technologies.map(t =>
            `<span class="tech-badge">${t}</span>`
        ).join('');

        const featuresList = modal.querySelector('.project-modal-features');
        if (project.features && project.features.length) {
            featuresList.innerHTML = project.features.map(f =>
                `<li><i class="fas fa-check-circle"></i> ${f}</li>`
            ).join('');
            featuresList.style.display = '';
        } else {
            featuresList.style.display = 'none';
        }

        const liveBtn = modal.querySelector('.modal-live-btn');
        const repoBtn = modal.querySelector('.modal-repo-btn');
        if (project.liveUrl) {
            liveBtn.href = project.liveUrl;
            liveBtn.style.display = '';
        } else {
            liveBtn.style.display = 'none';
        }
        if (project.repoUrl) {
            repoBtn.href = project.repoUrl;
            repoBtn.style.display = '';
        } else {
            repoBtn.style.display = 'none';
        }

        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        const overlay = document.getElementById('project-modal-overlay');
        if (!overlay) return;

        overlay.classList.remove('open');
        document.body.style.overflow = '';

        // Stop iframe loading
        const iframe = overlay.querySelector('.project-modal-iframe');
        if (iframe) iframe.src = '';
    }

    // Make modal close accessible globally
    window.closeProjectModal = closeProjectModal;

    // Close on overlay click
    document.addEventListener('click', (e) => {
        if (e.target.id === 'project-modal-overlay') closeProjectModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
            closeMobileMenu();
        }
    });

    // ─── Current Year ───────────────────────────────────────────
    function setupCurrentYear() {
        document.querySelectorAll('[data-year]').forEach(el => {
            el.textContent = new Date().getFullYear();
        });
    }

    // ─── Resume Button ──────────────────────────────────────
    async function loadResume() {
        const btn = document.getElementById('resume-btn');
        if (!btn) return;

        try {
            // Check for resumeUrl in projects.json metadata
            const res = await fetch('data/projects.json');
            const data = await res.json();
            const resumeUrl = data.resumeUrl || '';

            if (resumeUrl) {
                btn.href = resumeUrl;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer';
                btn.style.display = '';
            }
        } catch (e) {
            // No resume URL found, button stays hidden
        }
    }

})();
