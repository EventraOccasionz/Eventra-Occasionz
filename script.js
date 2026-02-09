// Loading Spinner
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1000);
});

// Menu Functionality
const menuButton = document.getElementById('menuButton');
const menuOverlay = document.getElementById('menuOverlay');
const sideMenu = document.getElementById('sideMenu');
const menuClose = document.getElementById('menuClose');
const menuLinks = document.querySelectorAll('.menu-link');

function openMenu() {
    sideMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.classList.add('menu-open');
}

function closeMenu() {
    sideMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
}

if (menuButton) menuButton.addEventListener('click', openMenu);
if (menuClose) menuClose.addEventListener('click', closeMenu);
if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth Scrolling
const links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Scroll Animations
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100 && elementBottom > 0) {
            element.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Parallax Effect
const parallax = () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
};

window.addEventListener('scroll', parallax);

// Lightbox Gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

if (lightboxTriggers.length > 0) {
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const img = trigger.querySelector('img');
            const src = img.getAttribute('data-src') || img.src;
            const alt = img.alt;

            lightboxImg.src = src;
            lightboxCaption.textContent = alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Auto-Playing Testimonials Slider
const testimonialsSlider = document.getElementById('testimonialsSlider');
let currentSlide = 0;
let slideInterval;

if (testimonialsSlider) {
    const testimonials = testimonialsSlider.querySelectorAll('.testimonial');
    const totalSlides = testimonials.length;

    function getSlideWidth() {
        return testimonials[0].offsetWidth + parseInt(getComputedStyle(testimonialsSlider).gap) || 32;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    function updateSlider() {
        const offset = currentSlide * getSlideWidth();
        testimonialsSlider.scrollTo({
            left: offset,
            behavior: 'smooth'
        });
    }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    testimonialsSlider.addEventListener('mouseenter', stopAutoSlide);
    testimonialsSlider.addEventListener('mouseleave', startAutoSlide);
    startAutoSlide();

    // Touch support for slider
    let touchStartX = 0;
    let touchEndX = 0;

    testimonialsSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    testimonialsSlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

// Preferred Location Handler
const preferredLocationSelect = document.getElementById('preferred-location');
const customLocationRow = document.getElementById('custom-location-row');
const customLocationInput = document.getElementById('custom-location');

if (preferredLocationSelect) {
    preferredLocationSelect.addEventListener('change', (e) => {
        if (e.target.value === 'others') {
            customLocationRow.style.display = 'flex';
            customLocationInput.setAttribute('required', 'required');
        } else {
            customLocationRow.style.display = 'none';
            customLocationInput.removeAttribute('required');
            customLocationInput.value = '';
        }
    });
}

// Unified Form Validation and Submission
const unifiedForm = document.getElementById('unified-form');
const formMessage = document.getElementById('form-message');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone.replace(/\D/g, ''));
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = type;
    formMessage.style.display = 'block';
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

if (unifiedForm) {
    unifiedForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const eventType = document.getElementById('event-type').value;
        const eventDate = document.getElementById('event-date').value;
        const preferredLocation = document.getElementById('preferred-location').value;
        const customLocation = document.getElementById('custom-location').value.trim();
        const venue = document.getElementById('venue').value.trim();
        const guests = document.getElementById('guests').value;
        const eventTime = document.getElementById('event-time').value;
        const details = document.getElementById('details').value.trim();

        // Validation
        if (name.length < 2) {
            showFormMessage('Please enter a valid name.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (!validatePhone(phone)) {
            showFormMessage('Please enter a valid phone number.', 'error');
            return;
        }

        if (!eventType) {
            showFormMessage('Please select an event type.', 'error');
            return;
        }

        if (!eventDate) {
            showFormMessage('Please select an event date.', 'error');
            return;
        }

        if (!preferredLocation) {
            showFormMessage('Please select a preferred location.', 'error');
            return;
        }

        if (preferredLocation === 'others' && !customLocation) {
            showFormMessage('Please enter your preferred location.', 'error');
            return;
        }

        if (!venue) {
            showFormMessage('Please enter a venue.', 'error');
            return;
        }

        if (!guests || guests < 1) {
            showFormMessage('Please enter a valid number of guests.', 'error');
            return;
        }

        if (!eventTime) {
            showFormMessage('Please select an event time.', 'error');
            return;
        }

        if (details.length < 10) {
            showFormMessage('Please provide more details about your event.', 'error');
            return;
        }

        // Submit to Formspree
        try {
            const formData = new FormData(unifiedForm);
            const response = await fetch(unifiedForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showFormMessage('Thank you! Your inquiry has been submitted successfully. We will contact you soon.', 'success');
                unifiedForm.reset();
                // Hide custom location row after reset
                if (customLocationRow) {
                    customLocationRow.style.display = 'none';
                }
            } else {
                showFormMessage('Oops! There was a problem submitting your form. Please try again.', 'error');
            }
        } catch (error) {
            showFormMessage('Oops! There was a problem submitting your form. Please try again.', 'error');
        }
    });
}

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close other FAQs
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle current FAQ
        item.classList.toggle('active');
    });
});

// Active Navigation on Scroll (Menu Links)
const sections = document.querySelectorAll('section');
const menuNavItems = document.querySelectorAll('.menu-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id') || section.className;
        }
    });
    
    menuNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}` ||
            item.getAttribute('href') === `#${current.split(' ')[0]}`) {
            item.classList.add('active');
        }
    });
});

// Enhance category cards with click effects
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.05)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Enhance service cards with click effects
const serviceItems = document.querySelectorAll('.service-item');
serviceItems.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Package card hover effects
const packageCards = document.querySelectorAll('.package-card');
packageCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('featured')) {
            card.style.transform = 'translateY(0)';
        }
    });
});

// Sticky buttons hover effects
const stickyButtons = document.querySelectorAll('.sticky-buttons a');
stickyButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
});

// Destination Cards Video on Hover and Scroll
document.addEventListener('DOMContentLoaded', () => {
    const destinationCards = document.querySelectorAll('.destination-card');

    // Function to play video
    function playVideo(card) {
        const video = card.querySelector('video');
        if (video) {
            video.play().catch(() => {}); // Ignore play errors
        }
    }

    // Function to pause video
    function pauseVideo(card) {
        const video = card.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }

    // Hover effects for destination cards
    destinationCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            playVideo(card);
        });

        card.addEventListener('mouseleave', () => {
            pauseVideo(card);
        });
    });

    // Scroll-triggered video playback using Intersection Observer
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            const video = card.querySelector('video');
            
            if (entry.isIntersecting) {
                // Card is in view - add class for scroll trigger
                card.classList.add('in-view');
                playVideo(card);
            } else {
                // Card is out of view - remove class and pause
                card.classList.remove('in-view');
                pauseVideo(card);
            }
        });
    }, {
        rootMargin: '-50px 0px',
        threshold: 0.5
    });

    destinationCards.forEach(card => {
        videoObserver.observe(card);
    });
});
// Social media icons animation
const socialIcons = document.querySelectorAll('.social-icon');
socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'translateY(-5px) rotate(360deg)';
    });

    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'translateY(0) rotate(0)';
    });
});

// Lazy Loading Images (enhanced version)
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(image => {
        imageObserver.observe(image);
    });
});

// Add loaded class animation for lazy-loaded images
const style = document.createElement('style');
style.textContent = `
    img[data-src] {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    img[data-src].loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Add loaded class to non-lazy images immediately
document.addEventListener('DOMContentLoaded', () => {
    const regularImages = document.querySelectorAll('img:not([data-src])');
    regularImages.forEach(img => {
        img.onload = () => {
            img.classList.add('loaded');
        };
        // If image is already loaded (from cache)
        if (img.complete) {
            img.classList.add('loaded');
        }
    });
});

// Video Control Buttons functionality
const videoControlBtns = document.querySelectorAll('.video-control-btn');
videoControlBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = btn.querySelector('i');
        const title = btn.getAttribute('title');
        
        if (title === 'Add to My List') {
            if (icon.classList.contains('fa-plus')) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-check');
                btn.style.background = '#46d369';
                btn.style.color = '#000';
            } else {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.style.background = '';
                btn.style.color = '';
            }
        } else if (title === 'Like') {
            if (icon.classList.contains('fa-thumbs-up')) {
                icon.classList.remove('fa-thumbs-up');
                icon.classList.add('fa-heart');
                btn.style.color = '#e91e63';
            } else {
                icon.classList.remove('fa-heart');
                icon.classList.add('fa-thumbs-up');
                btn.style.color = '';
            }
        } else if (title === 'Share') {
            // Copy current page URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                icon.classList.remove('fa-share');
                icon.classList.add('fa-check');
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-share');
                }, 2000);
            });
        }
    });
});

// Initialize animations on page load
window.addEventListener('load', () => {
    animateOnScroll();
    console.log('Eventra Occasionz - All enhancements loaded successfully!');
});
