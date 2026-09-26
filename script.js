// DOM Elements
const header = document.querySelector('header');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');
const navLinksItems = document.querySelectorAll('.nav-links li');
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = document.querySelector('.fa-moon');
const sunIcon = document.querySelector('.fa-sun');
const contactForm = document.getElementById('enquiry-form');

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('header-scroll');
    } else {
        header.classList.remove('header-scroll');
    }
});

// Keep the mobile menu state, keyboard access and scrolling in sync.
const mobileNavigation = window.matchMedia('(max-width: 992px)');
function setNavigation(open) {
    navLinks.classList.toggle('nav-active', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('no-scroll', open && mobileNavigation.matches);
    navLinks.inert = mobileNavigation.matches && !open;
}
hamburger.addEventListener('click', () => setNavigation(!navLinks.classList.contains('nav-active')));
navLinksItems.forEach(item => item.addEventListener('click', () => setNavigation(false)));
mobileNavigation.addEventListener('change', () => setNavigation(false));
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navLinks.classList.contains('nav-active')) {
        setNavigation(false);
        hamburger.focus();
    }
});
document.addEventListener('click', event => {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) setNavigation(false);
});
setNavigation(false);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');

    // Toggle icons
    if (document.body.classList.contains('light-theme')) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }

    // Save theme preference to localStorage
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    }

    // Add animations with delay for elements
    const animateElements = () => {
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('section-animate');
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(section);
        });
    };

    animateElements();
});

// Send the enquiry without discarding entered details on a connection error.
if (contactForm) {
    contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;
        const button = contactForm.querySelector('button[type="submit"]');
        const status = document.getElementById('enquiry-status');
        button.disabled = true;
        button.textContent = 'Sending…';
        status.textContent = 'Sending your enquiry…';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST', body: new FormData(contactForm),
                headers: { Accept: 'application/json' }, signal: controller.signal
            });
            if (!response.ok) throw new Error('Submission failed');
            status.textContent = 'Your enquiry has been sent. Thank you — we’ll reply using the contact details you provided.';
            contactForm.reset();
        } catch (error) {
            status.textContent = 'We couldn’t confirm delivery. Your details are still here. Try again, or email info@echokushu.com. If you already received a confirmation email, there is no need to resend.';
        } finally {
            clearTimeout(timeout);
            button.disabled = false;
            button.textContent = 'Send enquiry';
        }
    });
}

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Skip if href is just "#"

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for header height
                behavior: 'smooth'
            });
        }
    });
});

// Add typing effect to the binary in hero section
const binaryElement = document.querySelector('.binary');
if (binaryElement) {
    const originalText = binaryElement.innerText;
    binaryElement.innerText = '';

    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            binaryElement.innerText += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };

    // Start typing effect when page loads
    setTimeout(typeWriter, 1000);
}

// Buy Now dropdown toggle (navbar)
document.addEventListener('DOMContentLoaded', () => {
    const buyDropdown = document.querySelector('.buy-dropdown');
    const dropToggle = document.querySelector('.buy-dropdown .drop-toggle');

    if (!buyDropdown || !dropToggle) return;

    dropToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = buyDropdown.classList.toggle('open');
        dropToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && buyDropdown.classList.contains('open')) {
            buyDropdown.classList.remove('open');
            dropToggle.setAttribute('aria-expanded', 'false');
            dropToggle.focus();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!buyDropdown.contains(e.target)) {
            buyDropdown.classList.remove('open');
            dropToggle.setAttribute('aria-expanded', 'false');
        }
    });
});
