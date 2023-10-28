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
                    app.element.navbar.classList[isScrolled ? 'add' : 'remove']('border-neutral-200', 'dark:border-neutral-800', 'shadow-sm');
                    app.element.navbar.classList[isScrolled ? 'remove' : 'add']('border-transparent', 'dark:border-transparent');
                }
            },

            menu: {

                // Open navbar menu
                open: () => app.view.navbar.menu.toggle(true),

                // Close navbar menu
                close: () => app.view.navbar.menu.toggle(false),
            
                // Toggle navbar menu
                toggle: (isOpen) => {
                    app.element.navbarMenu.classList[isOpen ? 'remove' : 'add']('hidden', 'invisible');
                    app.element.navbarMenu.setAttribute('aria-hidden', !isOpen);

                    // Set toggle element `[aria-expanded]` attribute value
                    document.querySelectorAll(`[aria-controls='${app.element.navbarMenu.id}']`).forEach((currentToggleElement) => {
                        currentToggleElement.setAttribute('aria-expanded', isOpen);
                    });

                    if (isOpen) {

                        // Force focus for focus trap
                        app.element.navbarMenu.setAttribute('tabindex', 1);
                        app.element.navbarMenu.focus();
                        setTimeout(() => {
                            app.element.navbarMenu.removeAttribute('tabindex');
                        }, 100);

                        window.addEventListener('keydown', app.view.navbar.menu.escape);
                        window.addEventListener('keydown', app.view.navbar.menu.focusTrap);
                    } else {
                        window.removeEventListener('keydown', app.view.navbar.menu.escape);
                        window.removeEventListener('keydown', app.view.navbar.menu.focusTrap);
                    }
                },

                // This is to handle when switching view between breakpoint size
                toggleResponsive: () => {


                    // If window width past breakpoint size, close navbar menu and remove `[aria-hidden]` attribute from it
                    if (window.innerWidth >= app.breakpointSize) {
                        if (app.element.navbarMenu.getAttribute('aria-hidden') === 'false') {
                            app.view.navbar.menu.close();
                        }
                        app.element.navbarMenu.removeAttribute('aria-hidden');
                    } else {
                        if (!app.element.navbarMenu.getAttribute('aria-hidden')) {
                            app.element.navbarMenu.setAttribute('aria-hidden', true);
                        }
                    }
                },

                // Toggle active navbar menu link
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

                        const targetLink = app.element.navbarMenu.querySelector(`a[href='#${targetSection.id}']`);
                        if (targetLink) {
                            targetLink.classList[isActive ? 'add' : 'remove']('text-black', 'dark:text-white');
                            targetLink.classList[isActive ? 'remove' : 'add']('text-neutral-600', 'dark:text-neutral-400');
                        }
                    });
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
                            app.view.navbar.menu.open();
                            break;

                        case app.element.navbarMenuClose?.id:
                            app.view.navbar.menu.close();
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