/**
 * --------------------------------------------------------------------------
 * Tailstart - Website v0.2.0: app.js
 * Licensed under MIT (https://github.com/mkfizi/tailstart-website/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

(function () {
    'use strict';

    const app = {};

    app.name = 'Tailstart - Website';
    app.version = '0.2.0';
    app.breakpointSize = 1024;

    app.element = {
        navbar: document.getElementById('navbar'),
        navbarMenu: document.getElementById('navbar-menu'),
        navbarMenuToggle: document.getElementById('navbar-menu-toggle'),
        navbarMenuClose: document.getElementById('navbar-menu-close'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        sections: document.querySelectorAll('section'),
        footerCurrentYear: document.getElementById('footer-year'),
        footerAppName: document.getElementById('footer-app-name'),
        footerAppVersion: document.getElementById('footer-app-version'),
    }

    app.view = {

        viewportHeight: {

            // Workaround fix to handle viewport height issue on mobile browsers
            // https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser
            toggle: () => {
                document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
            }
        },

        navbar: {

            // Toggle navbar appearance base on window scroll Y position
            toggle: () => {
                if (app.element.navbar) {
                    const isScrolled = window.scrollY > (app.element.navbar.offsetHeight - app.element.navbar.clientHeight);
                    app.element.navbar.classList[isScrolled ? 'add' : 'remove']('border-neutral-200', 'dark:border-neutral-800');
                    app.element.navbar.classList[isScrolled ? 'remove' : 'add']('border-transparent', 'dark:border-transparent');
                }
            },

            menu: {
            
                // Toggle menu
                toggle: (isOpen = null) => {
                    if (isOpen == null) {
                        isOpen = (app.element.navbarMenu.getAttribute('aria-hidden') === 'true');
                    }
                    app.element.navbarMenu.classList[isOpen ? 'remove' : 'add']('hidden', 'invisible');
                    app.element.navbarMenu.setAttribute('aria-hidden', !isOpen);

                    // Set toggle element `[aria-expanded]` attribute value
                    document.querySelectorAll(`[aria-controls="${app.element.navbarMenu.id}"]`).forEach((currentToggleElement) => {
                        currentToggleElement.setAttribute('aria-expanded', isOpen);
                    });

                    if (isOpen) {
                        app.view.navbar.menu.forceFocus();
                        app.view.navbar.menu.setupEventListeners();
                    } else {
                        app.view.navbar.menu.removeEventListeners();
                    }
                },

                // Toggle responsive attributes
                toggleResponsive: () => {
                    if (window.innerWidth >= app.breakpointSize) {

                        // Close navbar menu when switching view past breakpoint size
                        if (app.element.navbarMenu.getAttribute('aria-hidden') === 'true') {
                            app.view.navbar.menu.toggle(false);
                        }
                        
                        app.element.navbarMenu.removeAttribute("aria-hidden");
                    } else {
                        if (!app.element.navbarMenu.getAttribute("aria-hidden")) {
                            app.view.navbar.menu.toggle(false);
                        }
                    }
                },

                // Toggle active navigation link
                toggleActiveLink: () => {
                    const scrollPosition = window.scrollY;

                    // Calculate each sections height and offset from document top
                    app.element.sections.forEach((targetSection) => {
                        const sectionTop = targetSection.offsetTop - app.element.navbar.offsetHeight - parseFloat(getComputedStyle(targetSection).marginTop);
                        const sectionHeight = targetSection.offsetHeight + parseFloat(getComputedStyle(targetSection).marginTop);

                        // Check if current scroll postion is within section area
                        let isActive = false;
                        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                            isActive = true;
                        }

                        const targetLink = document.querySelector(`a[href="#${targetSection.id}"]`);
                        if (targetLink) {
                            targetLink.classList[isActive ? 'add' : 'remove']('text-black', 'dark:text-white');
                            targetLink.classList[isActive ? 'remove' : 'add']('text-neutral-600', 'dark:text-neutral-400');
                            if (!targetLink.classList.contains('font-semibold')) {
                                targetLink.classList[isActive ? 'add' : 'remove']('font-medium');
                            }
                        }
                    });
                },

                // Trigger force focus
                forceFocus: () => {
                    app.element.navbarMenu.setAttribute('tabindex', 1);
                    app.element.navbarMenu.focus();
                    setTimeout(() => {
                        app.element.navbarMenu.removeAttribute('tabindex');
                    }, 100);
                },

                // Add event listeners
                setupEventListeners: () => {
                    window.addEventListener('keydown', app.view.navbar.menu.escape);
                    window.addEventListener('keydown', app.view.navbar.menu.focusTrap);
                },

                // Remove event listeners
                removeEventListeners: () => {
                    window.removeEventListener('keydown', app.view.navbar.menu.escape);
                    window.removeEventListener('keydown', app.view.navbar.menu.focusTrap);
                },

                // Escape key handler
                escape: (event) => {
                    if (event.key === 'Escape') {
                        app.view.navbar.menu.toggle(false);
                    }
                },

                // Focus trap handler
                focusTrap: (event) => {
                    if (event.key === 'Tab') {
                        const focusableElements = Array.from(app.element.navbarMenu.querySelectorAll('a, button, input, textarea, select, details, [tabindex], [contenteditable="true"]')).filter(currentElement => {
                            return !currentElement.closest('[tabindex="-1"], .hidden, .invisible') || null;
                        });
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];

                        if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === document.body)) {
                            event.preventDefault();
                            lastElement.focus();
                        } else if (!event.shiftKey && document.activeElement === lastElement) {
                            event.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            }
        },

        darkMode: {

            // Toggle dark mode
            toggle: () => {
                const isDarkMode = localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches);
                localStorage.theme = isDarkMode ? 'dark' : 'light';
                document.documentElement.classList.toggle('dark', isDarkMode);
            }
        },

        footer: {

            // Initialize footer content with current year, app name and version
            init: () => {
                if (app.element.footerCurrentYear) {
                    app.element.footerCurrentYear.innerHTML = new Date().getFullYear();
                }

                if (app.element.footerAppName) {
                    app.element.footerAppName.innerHTML = app.name;
                }

                if (app.element.footerAppVersion) {
                    app.element.footerAppVersion.innerHTML = app.version;
                }
            }
        },

        // Initialize view
        init: () => {
            app.view.viewportHeight.toggle();
            app.view.navbar.menu.toggleResponsive();
            app.view.footer.init();
        }
    }

    app.event = {
        document: {

            // Handle document 'click' event by attaching a global click event listener instead of applying it on every clickable elements
            click: event => {
                const targetElement = event.target.closest('[id]');
                if (targetElement) {

                    // Delegate method calls using switch case on element id
                    switch (targetElement.id) {
                        case app.element.darkModeToggle?.id:
                            app.view.darkMode.toggle();
                            break;

                        case app.element.navbarMenuToggle?.id:
                            app.view.navbar.menu.toggle();
                            break;

                        case app.element.navbarMenuClose?.id:
                            app.view.navbar.menu.toggle(false);
                            break;
                    }
                }
            }
        },

        window: {
            
            // Handle window 'resize' event
            resize: () => {
                app.view.viewportHeight.toggle();
                app.view.navbar.menu.toggleResponsive();
            },

            // Handle window 'scroll' event
            scroll: () => {
                app.view.navbar.toggle();
                app.view.navbar.menu.toggleActiveLink();
            }
        },

        init: () => {
            document.addEventListener('click', app.event.document.click);
            window.addEventListener('resize', app.event.window.resize);
            window.addEventListener('scroll', app.event.window.scroll);
        }
    },

    app.init = () => {
        app.view.init();
        app.event.init();
    }

    app.init();
})();