// Main Application JavaScript
(function() {
    'use strict';

    // DOM Elements
    const backToTopBtn = document.getElementById('btn-back-to-top');
    const navbar = document.getElementById('navbar');

    // Initialize on DOM loaded
    document.addEventListener('DOMContentLoaded', function() {
        initBackToTop();
        initNavbar();
        initSmoothScroll();
        initMobileMenu();
    });

    // Back to Top Button
    function initBackToTop() {
        if (!backToTopBtn) return;

        // Show/hide button on scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Navbar Scroll Effect
    function initNavbar() {
        if (!navbar) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth Scroll for Anchor Links
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;

                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    // Use getBoundingClientRect for more accurate positioning
                    const navbarHeight = navbar ? navbar.offsetHeight : 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - navbarHeight - 20; // 20px extra padding
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const mobileMenu = document.querySelector('.navbar-menu');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        const toggle = document.querySelector('.menu-toggle');
                        if (toggle) toggle.classList.remove('active');
                    }
                }
            });
        });
    }

    // Mobile Menu Toggle
    function initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const menuClose = document.getElementById('menuClose');
        const navbarMenu = document.getElementById('navbarMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        const menuLinks = navbarMenu.querySelectorAll('a');

        if (!menuToggle || !menuClose || !navbarMenu || !menuOverlay) return;

        // Toggle menu on hamburger click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu on X button click
        menuClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMenu();
        });

        // Close menu on overlay click
        menuOverlay.addEventListener('click', function() {
            closeMenu();
        });

        // Close menu on link click
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        // Close menu on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navbarMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        function toggleMenu() {
            menuToggle.classList.toggle('active');
            menuClose.classList.toggle('active');
            navbarMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navbarMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        function closeMenu() {
            menuToggle.classList.remove('active');
            menuClose.classList.remove('active');
            navbarMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Close menu on window resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navbarMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Utility: Debounce function
    window.debounce = function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Utility: Throttle function
    window.throttle = function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

})();