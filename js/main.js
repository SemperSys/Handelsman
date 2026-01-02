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
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get the submit button and disable it
        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

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

        try {
            // Submit to backend API
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                // Also save to localStorage for admin panel (backup)
                try {
                    const existingQuotes = JSON.parse(localStorage.getItem('quote_requests') || '[]');
                    existingQuotes.push(result.quote);
                    localStorage.setItem('quote_requests', JSON.stringify(existingQuotes));
                } catch (error) {
                    console.error('Error saving quote to localStorage:', error);
                }

                // Show success message
                alert('Thank you for your quote request! A confirmation email has been sent to your email address. We\'ll get back to you within 24 hours.');

                // Reset form
                quoteForm.reset();
            } else {
                throw new Error(result.message || 'Failed to submit quote');
            }
        } catch (error) {
            console.error('Error submitting quote:', error);

            // Fallback: Save to localStorage if server is unavailable
            try {
                data.id = Date.now().toString();
                data.timestamp = new Date().toISOString();
                data.status = 'new';
                const existingQuotes = JSON.parse(localStorage.getItem('quote_requests') || '[]');
                existingQuotes.push(data);
                localStorage.setItem('quote_requests', JSON.stringify(existingQuotes));

                alert('Thank you for your quote request! We\'ll get back to you within 24 hours. (Note: Please check your email for confirmation)');
                quoteForm.reset();
            } catch (localError) {
                alert('There was an error submitting your request. Please try again or call us directly at 1-226-346-5520.');
            }
        } finally {
            // Re-enable the submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
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
let galleryImagesData = [];

async function loadGalleryImages() {
    const galleryGrid = document.getElementById('galleryGrid');

    if (!galleryGrid) return;

    // Show loading state
    galleryGrid.innerHTML = '<div class="gallery-loading"><p>Loading gallery...</p></div>';

    try {
        // Fetch all images from the server
        const response = await fetch('/api/gallery');
        const data = await response.json();

        if (data.success && data.images && data.images.length > 0) {
            // Show one image from each category (max 4 images)
            const categories = ['residential-mowing', 'commercial-maintenance', 'trimming', 'seasonal-cleanup'];
            let imagesToDisplay = [];

            categories.forEach(cat => {
                const categoryImage = data.images.find(img => img.category === cat);
                if (categoryImage) {
                    imagesToDisplay.push(categoryImage);
                }
            });

            // Check if there are images to display after filtering
            if (imagesToDisplay.length === 0) {
                galleryGrid.innerHTML = `
                    <div class="gallery-empty">
                        <p>No images found yet.</p>
                    </div>
                `;
                return;
            }

            // Store images data for lightbox
            galleryImagesData = imagesToDisplay;

            // Clear loading message
            galleryGrid.innerHTML = '';

            // Render gallery items
            imagesToDisplay.forEach((image, index) => {
                const galleryItem = document.createElement('div');

                if (image.type === 'before-after') {
                    // Before/After comparison item
                    galleryItem.className = 'gallery-item gallery-item-before-after';
                    galleryItem.dataset.index = index;
                    galleryItem.dataset.category = image.category || 'uncategorized';
                    galleryItem.innerHTML = `
                        <div class="before-after-container" data-index="${index}">
                            <div class="before-after-slider">
                                <div class="before-image-wrapper">
                                    <img src="${image.beforeImage.url}"
                                         alt="Before"
                                         class="gallery-image before-img"
                                         onerror="this.src='images/placeholder.jpg'">
                                    <span class="image-label before-label">Before</span>
                                </div>
                                <div class="after-image-wrapper">
                                    <img src="${image.afterImage.url}"
                                         alt="After"
                                         class="gallery-image after-img"
                                         onerror="this.src='images/placeholder.jpg'">
                                    <span class="image-label after-label">After</span>
                                </div>
                                <div class="slider-handle">
                                    <div class="slider-line"></div>
                                    <div class="slider-button">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M18 8L22 12L18 16"></path>
                                            <path d="M6 8L2 12L6 16"></path>
                                        </svg>
                                    </div>
                                    <div class="slider-line"></div>
                                </div>
                            </div>
                        </div>
                        <div class="gallery-overlay">
                            <span class="overlay-badge">Before & After</span>
                        </div>
                    `;
                } else {
                    // Single image item
                    galleryItem.className = 'gallery-item';
                    galleryItem.dataset.index = index;
                    galleryItem.dataset.category = image.category || 'uncategorized';
                    galleryItem.innerHTML = `
                        <img src="${image.url}"
                             alt="Gallery image"
                             class="gallery-image"
                             onerror="this.src='images/placeholder.jpg'">
                        <div class="gallery-overlay">
                        </div>
                    `;
                }

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

            // Initialize before/after sliders
            initializeBeforeAfterSliders();

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
        item.addEventListener('click', (e) => {
            // Don't open lightbox if clicking on slider handle
            if (e.target.closest('.slider-handle') || e.target.closest('.slider-button')) {
                return;
            }
            const index = parseInt(item.dataset.index);
            if (!isNaN(index)) {
                openLightbox(index);
            }
        });
    });
}

// ===================================
// Before/After Slider Functionality
// ===================================
function initializeBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');

    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const beforeWrapper = slider.querySelector('.before-image-wrapper');

        if (!handle || !beforeWrapper) return;

        let isDragging = false;

        const updateSliderPosition = (x) => {
            const rect = slider.getBoundingClientRect();
            let percentage = ((x - rect.left) / rect.width) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            beforeWrapper.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            handle.style.left = `${percentage}%`;
        };

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSliderPosition(e.clientX);
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSliderPosition(e.touches[0].clientX);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Initialize at 50%
        beforeWrapper.style.clipPath = 'inset(0 50% 0 0)';
        handle.style.left = '50%';
    });
}

// ===================================
// Lightbox / Modal Functionality
// ===================================
let currentLightboxIndex = 0;
let zoomLevel = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

function createLightbox() {
    // Check if lightbox already exists
    if (document.getElementById('galleryLightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.id = 'galleryLightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-container">
            <div class="lightbox-header">
                <div class="lightbox-controls lightbox-controls-left">
                    <button class="lightbox-btn fullscreen-btn" title="Fullscreen">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button class="lightbox-btn zoom-in-btn" title="Zoom In">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                            <path d="M11 8v6"></path>
                            <path d="M8 11h6"></path>
                        </svg>
                    </button>
                    <button class="lightbox-btn zoom-out-btn" title="Zoom Out">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                            <path d="M8 11h6"></path>
                        </svg>
                    </button>
                    <button class="lightbox-btn close-btn" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="lightbox-content">
                <button class="lightbox-nav prev-btn">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                </button>
                <div class="lightbox-image-container">
                    <div class="lightbox-image-wrapper">
                        <!-- Image content will be inserted here -->
                    </div>
                </div>
                <button class="lightbox-nav next-btn">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                </button>
            </div>
            <div class="lightbox-footer">
                <span class="lightbox-counter"></span>
            </div>
        </div>
    `;

    document.body.appendChild(lightbox);

    // Add event listeners
    const overlay = lightbox.querySelector('.lightbox-overlay');
    const closeBtn = lightbox.querySelector('.close-btn');
    const prevBtn = lightbox.querySelector('.prev-btn');
    const nextBtn = lightbox.querySelector('.next-btn');
    const zoomInBtn = lightbox.querySelector('.zoom-in-btn');
    const zoomOutBtn = lightbox.querySelector('.zoom-out-btn');
    const fullscreenBtn = lightbox.querySelector('.fullscreen-btn');
    const imageWrapper = lightbox.querySelector('.lightbox-image-wrapper');

    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigateLightbox(-1));
    nextBtn.addEventListener('click', () => navigateLightbox(1));
    zoomInBtn.addEventListener('click', () => zoom(0.25));
    zoomOutBtn.addEventListener('click', () => zoom(-0.25));
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard navigation
    document.addEventListener('keydown', handleLightboxKeydown);

    // Mouse drag for panning when zoomed
    imageWrapper.addEventListener('mousedown', startDrag);
    imageWrapper.addEventListener('mousemove', drag);
    imageWrapper.addEventListener('mouseup', endDrag);
    imageWrapper.addEventListener('mouseleave', endDrag);

    // Mouse wheel zoom
    imageWrapper.addEventListener('wheel', handleWheel);
}

function openLightbox(index) {
    createLightbox();
    currentLightboxIndex = index;
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    updateLightboxContent();

    const lightbox = document.getElementById('galleryLightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';

        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
}

function updateLightboxContent() {
    const lightbox = document.getElementById('galleryLightbox');
    if (!lightbox || !galleryImagesData[currentLightboxIndex]) return;

    const image = galleryImagesData[currentLightboxIndex];
    const imageWrapper = lightbox.querySelector('.lightbox-image-wrapper');
    const counter = lightbox.querySelector('.lightbox-counter');

    counter.textContent = `${currentLightboxIndex + 1} / ${galleryImagesData.length}`;

    if (image.type === 'before-after') {
        imageWrapper.innerHTML = `
            <div class="lightbox-before-after">
                <div class="lightbox-before-after-slider">
                    <div class="lightbox-before-wrapper">
                        <img src="${image.beforeImage.url}" alt="Before">
                        <span class="lightbox-image-label before">Before</span>
                    </div>
                    <div class="lightbox-after-wrapper">
                        <img src="${image.afterImage.url}" alt="After">
                        <span class="lightbox-image-label after">After</span>
                    </div>
                    <div class="lightbox-slider-handle">
                        <div class="slider-line"></div>
                        <div class="slider-button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8L22 12L18 16"></path>
                                <path d="M6 8L2 12L6 16"></path>
                            </svg>
                        </div>
                        <div class="slider-line"></div>
                    </div>
                </div>
            </div>
        `;
        initializeLightboxSlider();
    } else {
        imageWrapper.innerHTML = `
            <img src="${image.url}" alt="Gallery image" class="lightbox-main-image">
        `;
    }

    // Reset zoom
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
}

function initializeLightboxSlider() {
    const slider = document.querySelector('.lightbox-before-after-slider');
    if (!slider) return;

    const handle = slider.querySelector('.lightbox-slider-handle');
    const beforeWrapper = slider.querySelector('.lightbox-before-wrapper');

    let isDragging = false;

    const updatePosition = (x) => {
        const rect = slider.getBoundingClientRect();
        let percentage = ((x - rect.left) / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        beforeWrapper.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        handle.style.left = `${percentage}%`;
    };

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
        e.stopPropagation();
    });

    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updatePosition(e.clientX);
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updatePosition(e.touches[0].clientX);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Initialize at 50%
    beforeWrapper.style.clipPath = 'inset(0 50% 0 0)';
    handle.style.left = '50%';
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;

    if (currentLightboxIndex < 0) {
        currentLightboxIndex = galleryImagesData.length - 1;
    } else if (currentLightboxIndex >= galleryImagesData.length) {
        currentLightboxIndex = 0;
    }

    updateLightboxContent();
}

function zoom(delta) {
    zoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
    applyTransform();
}

function applyTransform() {
    const imageWrapper = document.querySelector('.lightbox-image-wrapper');
    if (imageWrapper) {
        const content = imageWrapper.querySelector('img, .lightbox-before-after');
        if (content) {
            content.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
        }
    }
}

function startDrag(e) {
    if (zoomLevel > 1) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        e.target.style.cursor = 'grabbing';
    }
}

function drag(e) {
    if (!isDragging || zoomLevel <= 1) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
}

function endDrag(e) {
    isDragging = false;
    if (e.target) {
        e.target.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
    }
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom(delta);
}

function toggleFullscreen() {
    const lightbox = document.getElementById('galleryLightbox');
    if (!lightbox) return;

    if (!document.fullscreenElement) {
        lightbox.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function handleLightboxKeydown(e) {
    const lightbox = document.getElementById('galleryLightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;

    switch (e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            navigateLightbox(-1);
            break;
        case 'ArrowRight':
            navigateLightbox(1);
            break;
        case '+':
        case '=':
            zoom(0.25);
            break;
        case '-':
            zoom(-0.25);
            break;
        case 'f':
        case 'F':
            toggleFullscreen();
            break;
    }
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

    // Load gallery images from server (4 images, one from each category)
    loadGalleryImages();

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
