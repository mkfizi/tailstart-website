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

        footer: {

            // Toggle footer content with current year, app name and version
            toggle: () => {
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

        darkMode: {

            // Toggle dark mode
            toggle: () => {
                const isDarkMode = localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches);
                localStorage.theme = isDarkMode ? 'dark' : 'light';
                document.documentElement.classList.toggle('dark', isDarkMode);
            }
        },

        navbar: {

            // Update navbar appearance base on window scroll Y position
            toggle: () => {
                if (app.element.navbar) {
                    const isScrolled = window.scrollY > (app.element.navbar.offsetHeight - app.element.navbar.clientHeight);
                    app.element.navbar.classList[isScrolled ? 'add' : 'remove']('border-neutral-200', 'dark:border-neutral-800');
                    app.element.navbar.classList[isScrolled ? 'remove' : 'add']('border-transparent', 'dark:border-transparent');
                }
            },

            menu: {
            
                // Toggle menu
                toggle: (targetElement, isOpen = null) => {
                    if (isOpen == null) isOpen = (targetElement.getAttribute('aria-hidden') === 'true');
                    targetElement.classList[isOpen ? 'remove' : 'add']('hidden', 'invisible');
                    targetElement.setAttribute('aria-hidden', !isOpen);

                    // Set toggle element `[aria-expanded]` attribute value
                    document.querySelectorAll(`[aria-controls="${targetElement.id}"]`).forEach((currentToggleElement) => {
                        currentToggleElement.setAttribute('aria-expanded', isOpen);
                    });

                    if (isOpen) {

                        // Force focus for focus trap
                        targetElement.setAttribute('tabindex', 1);
                        targetElement.focus();
                        setTimeout(() => {
                            targetElement.removeAttribute('tabindex');
                        }, 100);

                        if (!app.view.navbar.menu[targetElement.id]) {

                            // Create new menu object instance
                            app.view.navbar.menu[targetElement.id] = {
                                clickOutside: (event) => app.view.navbar.menu.clickOutsideHandler(targetElement, event),
                                escape: (event) => app.view.navbar.menu.escapeHandler(targetElement, event),
                                focusTrap: (event) => app.view.navbar.menu.focusTrapHandler(targetElement, event),
                            };

                            // Add event listeners to menu object instance
                            document.addEventListener('click', app.view.navbar.menu[targetElement.id].clickOutside);
                            window.addEventListener('keydown', app.view.navbar.menu[targetElement.id].escape);
                            window.addEventListener('keydown', app.view.navbar.menu[targetElement.id].focusTrap);
                        }
                    } else if (app.view.navbar.menu[targetElement.id]) {

                        // Remove event listeners to menu object instance
                        document.removeEventListener('click', app.view.navbar.menu[targetElement.id].clickOutside);
                        window.removeEventListener('keydown', app.view.navbar.menu[targetElement.id].escape);
                        window.removeEventListener('keydown', app.view.navbar.menu[targetElement.id].focusTrap);

                        // Delete menu object instance
                        delete app.view.navbar.menu[targetElement.id];
                    }
                },

                // Toggle active navigation link
                toggleActiveLink: () => {
                    const scrollPosition = window.scrollY;
                    app.element.sections.forEach((targetSection) => {
                        const sectionTop = targetSection.offsetTop - app.element.navbar.offsetHeight - parseFloat(getComputedStyle(targetSection).marginTop);
                        const sectionHeight = targetSection.offsetHeight + parseFloat(getComputedStyle(targetSection).marginTop);

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

                // Click outside handler
                clickOutsideHandler: (targetElement, event) => {
                    if (!event.target.closest(`[aria-labelledby="${targetElement.id}"]`) && !event.target.closest(`[aria-controls="${targetElement.id}"]`)) {
                        app.view.navbar.menu.toggle(targetElement, false);
                    }
                },

                // Escape key handler
                escapeHandler: (targetElement, event) => {
                    if (event.key === 'Escape') {
                        app.view.navbar.menu.toggle(targetElement, false);
                    }
                },

                // Focus trap handler
                focusTrapHandler: (targetElement, event) => {
                    if (event.key === 'Tab') {
                        const focusableElements = Array.from(targetElement.querySelectorAll('a, button, input, textarea, select, details, [tabindex], [contenteditable="true"]')).filter(currentElement => {
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

        // Initialize view
        init: () => {
            app.view.viewportHeight.toggle();
            app.view.footer.toggle();
        }
    }

    app.event = {
        document: {

            /**
             * Handle 'click' event
             * 
             * Attach global 'click' event on document instead of attaching multiple 'click' event
             * listener on every target elements to reduce multiple event listeners.
             */
            click: event => {
                const targetElement = event.target.closest('[id]');
                if (targetElement) {

                    // Switch case on `app.element` objects.
                    switch (targetElement.id) {
                        case app.element.darkModeToggle?.id:
                            app.view.darkMode.toggle();
                            break;
                        case app.element.navbarMenuToggle?.id:
                            app.view.navbar.menu.toggle(app.element.navbarMenu);
                            break;
                        case app.element.navbarMenuClose?.id:
                            app.view.navbar.menu.toggle(app.element.navbarMenu, false);
                            break;
                    }
                }
            }
        },

        window: {
            
            // Handle window 'resize' event
            resize: () => {
                app.view.viewportHeight.toggle();
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