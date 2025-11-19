// ===================================
// Navigation & Header
// ===================================

// Get elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Close menu when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Header scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===================================
// Smooth Scrolling
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Testimonials Carousel
// ===================================
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialBtns = document.querySelectorAll('.testimonial-btn');
let currentTestimonial = 0;
let testimonialInterval;

function showTestimonial(index) {
    // Remove active class from all cards and buttons
    testimonialCards.forEach(card => card.classList.remove('active'));
    testimonialBtns.forEach(btn => btn.classList.remove('active'));

    // Add active class to current card and button
    if (testimonialCards[index]) {
        testimonialCards[index].classList.add('active');
    }
    if (testimonialBtns[index]) {
        testimonialBtns[index].classList.add('active');
    }

    currentTestimonial = index;
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
    showTestimonial(currentTestimonial);
}

function startTestimonialCarousel() {
    testimonialInterval = setInterval(nextTestimonial, 5000);
}

function stopTestimonialCarousel() {
    clearInterval(testimonialInterval);
}

// Initialize testimonials
if (testimonialCards.length > 0) {
    showTestimonial(0);
    startTestimonialCarousel();

    // Manual navigation
    testimonialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            showTestimonial(index);
            stopTestimonialCarousel();
            startTestimonialCarousel();
        });
    });

    // Pause on hover
    const testimonialsSection = document.querySelector('.testimonials-container');
    if (testimonialsSection) {
        testimonialsSection.addEventListener('mouseenter', stopTestimonialCarousel);
        testimonialsSection.addEventListener('mouseleave', startTestimonialCarousel);
    }
}

// ===================================
// Form Handling
// ===================================
const quoteForm = document.getElementById('quoteForm');

if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(quoteForm);
        const data = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // If key already exists, convert to array
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Get all checked services
        const services = [];
        document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
            services.push(checkbox.value);
        });
        data.services = services;

        // Add metadata
        data.id = Date.now().toString();
        data.timestamp = new Date().toISOString();
        data.status = 'new';

        // Save to localStorage for admin panel
        try {
            const existingQuotes = JSON.parse(localStorage.getItem('quote_requests') || '[]');
            existingQuotes.push(data);
            localStorage.setItem('quote_requests', JSON.stringify(existingQuotes));
        } catch (error) {
            console.error('Error saving quote:', error);
        }

        // Log data (in production, this would send to a server)
        console.log('Quote Request:', data);

        // Show success message
        alert('Thank you for your quote request! We\'ll get back to you within 24 hours.');

        // Reset form
        quoteForm.reset();

        // In production, you would send this data to your server:
        /*
        fetch('/api/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            alert('Thank you for your quote request! We\'ll get back to you within 24 hours.');
            quoteForm.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was an error submitting your request. Please try again or call us directly.');
        });
        */
    });
}

// ===================================
// Scroll Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
const animateOnScroll = document.querySelectorAll('.service-card, .feature, .gallery-item');
animateOnScroll.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===================================
// Gallery - Load Images from Server
// ===================================
let currentCategory = 'all';

async function loadGalleryImages(category = 'all') {
    const galleryGrid = document.getElementById('galleryGrid');

    if (!galleryGrid) return;

    currentCategory = category;

    // Show loading state
    galleryGrid.innerHTML = '<div class="gallery-loading"><p>Loading gallery...</p></div>';

    try {
        const url = category === 'all'
            ? 'http://localhost:3001/api/gallery'
            : `http://localhost:3001/api/gallery?category=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.images && data.images.length > 0) {
            // Clear loading message
            galleryGrid.innerHTML = '';

            // Render gallery items
            data.images.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                galleryItem.innerHTML = `
                    <img src="http://localhost:3001${image.url}"
                         alt="${escapeHtml(image.title)}"
                         class="gallery-image"
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="gallery-overlay">
                        <span>${escapeHtml(image.title)}</span>
                    </div>
                `;

                galleryGrid.appendChild(galleryItem);
            });

            // Apply scroll animations to new gallery items
            const newGalleryItems = document.querySelectorAll('.gallery-item');
            newGalleryItems.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });

            // Add click handlers for gallery items
            addGalleryClickHandlers();
        } else {
            // No images uploaded yet - show placeholder message
            galleryGrid.innerHTML = `
                <div class="gallery-empty">
                    <p>No gallery images yet. Images will appear here once uploaded through the admin portal.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading gallery images:', error);
        // Fallback: Show error message
        galleryGrid.innerHTML = `
            <div class="gallery-error">
                <p>Unable to load gallery images. Please ensure the server is running.</p>
            </div>
        `;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add click handlers to gallery items
function addGalleryClickHandlers() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // In production, you could add a lightbox/modal here
            console.log('Gallery item clicked');
            // Example: Open image in modal or full-screen view
        });
    });
}

// Gallery tab handlers
function initializeGalleryTabs() {
    const tabs = document.querySelectorAll('.gallery-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Load images for selected category
            const category = tab.dataset.category;
            loadGalleryImages(category);
        });
    });
}

// ===================================
// Active Navigation Link on Scroll
// ===================================
const sections = document.querySelectorAll('section[id]');

function setActiveNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', setActiveNavLink);

// ===================================
// Phone Number Click Tracking (Analytics)
// ===================================
const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

phoneLinks.forEach(link => {
    link.addEventListener('click', () => {
        console.log('Phone link clicked:', link.href);
        // In production, track this with your analytics tool:
        // gtag('event', 'phone_click', { 'phone_number': link.href });
    });
});

// ===================================
// Service Card Click Tracking
// ===================================
const serviceLinks = document.querySelectorAll('.service-link');

serviceLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const serviceName = link.closest('.service-card').querySelector('.service-title').textContent;
        console.log('Service interest:', serviceName);
        // In production, track with analytics:
        // gtag('event', 'service_interest', { 'service_name': serviceName });
    });
});

// ===================================
// Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Handelsman\'s Mowing website loaded successfully');

    // Add any initialization code here
    setActiveNavLink();

    // Initialize gallery tabs
    initializeGalleryTabs();

    // Load gallery images from server
    loadGalleryImages('all');

    // Add loading animation complete
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===================================
// Performance: Lazy Loading Images
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
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
}

// Use throttle for scroll events
const throttledScroll = throttle(() => {
    setActiveNavLink();
}, 100);

window.addEventListener('scroll', throttledScroll);
