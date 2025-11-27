// Gallery Category Page JavaScript

// Category labels mapping
const categoryLabels = {
    'all': 'All Work',
    'residential-mowing': 'Residential Mowing',
    'commercial-maintenance': 'Commercial Maintenance',
    'trimming': 'Trimming',
    'seasonal-cleanup': 'Seasonal Cleanup'
};

const categoryDescriptions = {
    'all': 'Browse all our professional lawn care work',
    'residential-mowing': 'Professional residential lawn mowing services',
    'commercial-maintenance': 'Commercial property lawn maintenance',
    'trimming': 'Expert hedge and shrub trimming services',
    'seasonal-cleanup': 'Spring and fall cleanup projects'
};

// Gallery images data for lightbox
let galleryImagesData = [];
let currentLightboxIndex = 0;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeGalleryPage();
    setupMobileNav();
});

function initializeGalleryPage() {
    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'all';

    // Update page title and header
    updatePageHeader(category);

    // Load images for this category
    loadCategoryImages(category);
}

function updatePageHeader(category) {
    const title = categoryLabels[category] || 'Gallery';
    const subtitle = categoryDescriptions[category] || 'Browse our work';

    document.getElementById('categoryTitle').textContent = title;
    document.getElementById('categorySubtitle').textContent = subtitle;
    document.getElementById('categoryBreadcrumb').textContent = title;
    document.title = `${title} | Handelsman's Quality Mowing`;
}

async function loadCategoryImages(category) {
    const galleryGrid = document.getElementById('categoryGalleryGrid');
    const emptyState = document.getElementById('galleryEmpty');

    try {
        // Build API URL
        let apiUrl = 'http://localhost:3001/api/gallery';
        if (category && category !== 'all') {
            apiUrl += `?category=${category}`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success && data.images && data.images.length > 0) {
            galleryImagesData = data.images;
            renderGalleryImages(data.images);
            emptyState.style.display = 'none';
        } else {
            galleryGrid.innerHTML = '';
            emptyState.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading gallery images:', error);
        galleryGrid.innerHTML = '<p class="gallery-error">Error loading images. Please try again later.</p>';
    }
}

function renderGalleryImages(images) {
    const galleryGrid = document.getElementById('categoryGalleryGrid');
    galleryGrid.innerHTML = '';

    images.forEach((image, index) => {
        const galleryItem = document.createElement('div');

        if (image.type === 'before-after') {
            galleryItem.className = 'gallery-page-item gallery-item-before-after';
            galleryItem.dataset.index = index;
            galleryItem.innerHTML = `
                <div class="before-after-container" data-index="${index}">
                    <div class="before-after-slider">
                        <div class="before-image-wrapper">
                            <img src="http://localhost:3001${image.beforeImage.url}"
                                 alt="Before"
                                 class="gallery-image before-img"
                                 onerror="this.src='images/placeholder.jpg'">
                            <span class="image-label before-label">Before</span>
                        </div>
                        <div class="after-image-wrapper">
                            <img src="http://localhost:3001${image.afterImage.url}"
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
            galleryItem.className = 'gallery-page-item';
            galleryItem.dataset.index = index;
            galleryItem.innerHTML = `
                <img src="http://localhost:3001${image.url}"
                     alt="Gallery image"
                     class="gallery-image"
                     onerror="this.src='images/placeholder.jpg'">
                <div class="gallery-overlay">
                </div>
            `;
        }

        galleryGrid.appendChild(galleryItem);
    });

    // Initialize before/after sliders
    initializeBeforeAfterSliders();

    // Add click handlers for lightbox
    addGalleryClickHandlers();

    // Create lightbox if not exists
    createLightbox();
}

// Before/After Slider functionality
function initializeBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');

    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const beforeWrapper = slider.querySelector('.before-image-wrapper');
        let isDragging = false;

        const updateSlider = (x) => {
            const rect = slider.getBoundingClientRect();
            let percentage = ((x - rect.left) / rect.width) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            beforeWrapper.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            handle.style.left = `${percentage}%`;
        };

        // Mouse events
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSlider(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                updateSlider(e.touches[0].clientX);
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Click on slider to move handle
        slider.addEventListener('click', (e) => {
            if (e.target !== handle && !handle.contains(e.target)) {
                updateSlider(e.clientX);
            }
        });

        // Initialize at 50%
        beforeWrapper.style.clipPath = 'inset(0 50% 0 0)';
        handle.style.left = '50%';
    });
}

// Gallery click handlers for lightbox
function addGalleryClickHandlers() {
    const galleryItems = document.querySelectorAll('.gallery-page-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't open lightbox if clicking on slider handle
            if (e.target.closest('.slider-handle')) return;

            const index = parseInt(item.dataset.index);
            openLightbox(index);
        });
    });
}

// Lightbox functionality
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;

function createLightbox() {
    if (document.getElementById('galleryLightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.id = 'galleryLightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-container">
            <div class="lightbox-header">
                <div class="lightbox-controls">
                    <button class="lightbox-btn zoom-out-btn" title="Zoom Out">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="M21 21l-4.35-4.35"></path>
                            <path d="M8 11h6"></path>
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
                    <button class="lightbox-btn fullscreen-btn" title="Fullscreen">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
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

    // Event listeners
    const overlay = lightbox.querySelector('.lightbox-overlay');
    const closeBtn = lightbox.querySelector('.close-btn');
    const prevBtn = lightbox.querySelector('.prev-btn');
    const nextBtn = lightbox.querySelector('.next-btn');
    const zoomInBtn = lightbox.querySelector('.zoom-in-btn');
    const zoomOutBtn = lightbox.querySelector('.zoom-out-btn');
    const fullscreenBtn = lightbox.querySelector('.fullscreen-btn');

    overlay.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigateLightbox(-1));
    nextBtn.addEventListener('click', () => navigateLightbox(1));
    zoomInBtn.addEventListener('click', () => zoomImage(0.25));
    zoomOutBtn.addEventListener('click', () => zoomImage(-0.25));
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard navigation
    document.addEventListener('keydown', handleLightboxKeyboard);
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('galleryLightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightboxContent();
}

function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = galleryImagesData.length - 1;
    if (currentLightboxIndex >= galleryImagesData.length) currentLightboxIndex = 0;
    updateLightboxContent();
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
                        <img src="http://localhost:3001${image.beforeImage.url}" alt="Before">
                        <span class="lightbox-image-label before">Before</span>
                    </div>
                    <div class="lightbox-after-wrapper">
                        <img src="http://localhost:3001${image.afterImage.url}" alt="After">
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
            <img src="http://localhost:3001${image.url}" alt="Gallery image" class="lightbox-main-image">
        `;
    }

    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
}

function initializeLightboxSlider() {
    const slider = document.querySelector('.lightbox-before-after-slider');
    if (!slider) return;

    const handle = slider.querySelector('.lightbox-slider-handle');
    const beforeWrapper = slider.querySelector('.lightbox-before-wrapper');
    let isDragging = false;

    const updateSlider = (x) => {
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

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSlider(e.clientX);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.stopPropagation();
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) {
            updateSlider(e.touches[0].clientX);
        }
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    slider.addEventListener('click', (e) => {
        if (e.target !== handle && !handle.contains(e.target)) {
            updateSlider(e.clientX);
        }
    });

    beforeWrapper.style.clipPath = 'inset(0 50% 0 0)';
    handle.style.left = '50%';
}

function zoomImage(delta) {
    zoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
    updateImageTransform();
}

function updateImageTransform() {
    const mainImage = document.querySelector('.lightbox-main-image');
    if (mainImage) {
        mainImage.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    }
}

function toggleFullscreen() {
    const lightbox = document.getElementById('galleryLightbox');
    if (!document.fullscreenElement) {
        lightbox.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function handleLightboxKeyboard(e) {
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
            zoomImage(0.25);
            break;
        case '-':
            zoomImage(-0.25);
            break;
    }
}

// Mobile navigation
function setupMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Utility function
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
