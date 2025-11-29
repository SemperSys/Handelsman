// Admin Portal JavaScript

// Configuration
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'handelsman2024' // Change this in production!
};

// Local Storage Keys
const STORAGE_KEYS = {
    AUTH: 'admin_authenticated',
    QUOTES: 'quote_requests',
    GALLERY: 'gallery_images'
};

// State Management
let currentUser = null;
let quotes = [];
let galleryImages = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check authentication
    checkAuth();

    // Setup event listeners
    setupEventListeners();

    // Load data
    loadQuotes();
    loadGalleryImages();
}

// Authentication Functions
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem(STORAGE_KEYS.AUTH);

    if (isAuthenticated === 'true') {
        showAdminPanel();
    } else {
        showLoginPanel();
    }
}

function showLoginPanel() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'flex';
    updateQuoteCount();
}

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        currentUser = username;
        errorElement.textContent = '';
        showAdminPanel();
    } else {
        errorElement.textContent = 'Invalid username or password';
    }
}

function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    currentUser = null;
    showLoginPanel();
}

// Event Listeners Setup
function setupEventListeners() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => handleNavigation(btn));
    });

    // Quote filters
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterQuotes);
    }

    const refreshQuotes = document.getElementById('refreshQuotes');
    if (refreshQuotes) {
        refreshQuotes.addEventListener('click', () => {
            loadQuotes();
            showNotification('Quotes refreshed', 'success');
        });
    }

    // Gallery upload
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', toggleUploadForm);
    }

    const cancelUpload = document.getElementById('cancelUpload');
    if (cancelUpload) {
        cancelUpload.addEventListener('click', toggleUploadForm);
    }

    const imageUploadForm = document.getElementById('imageUploadForm');
    if (imageUploadForm) {
        imageUploadForm.addEventListener('submit', handleImageUpload);
    }

    // Before/After upload form
    const beforeAfterUploadForm = document.getElementById('beforeAfterUploadForm');
    if (beforeAfterUploadForm) {
        beforeAfterUploadForm.addEventListener('submit', handleBeforeAfterUpload);
    }

    // Cancel Before/After upload
    const cancelBeforeAfterUpload = document.getElementById('cancelBeforeAfterUpload');
    if (cancelBeforeAfterUpload) {
        cancelBeforeAfterUpload.addEventListener('click', toggleUploadForm);
    }

    // Setup image previews for before/after uploads
    setupImagePreviews();

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterGalleryByCategory);
    }

    // Settings forms
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactUpdate);
    }

    // Listen for form submissions from main site
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.QUOTES) {
            loadQuotes();
        }
    });
}

// Navigation
function handleNavigation(button) {
    const section = button.dataset.section;

    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Show corresponding section
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section + 'Section').classList.add('active');
}

// Quote Management
function loadQuotes() {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    quotes = storedQuotes ? JSON.parse(storedQuotes) : [];

    renderQuotes(quotes);
    updateQuoteCount();
}

function renderQuotes(quotesToRender) {
    const container = document.getElementById('quotesContainer');

    if (!quotesToRender || quotesToRender.length === 0) {
        container.innerHTML = '<p class="empty-state">No quote requests yet. Submissions from the website will appear here.</p>';
        return;
    }

    container.innerHTML = quotesToRender.map((quote, index) => `
        <div class="quote-card" data-quote-id="${quote.id || index}">
            <div class="quote-header">
                <div class="quote-info">
                    <h3>${escapeHtml(quote.name)}</h3>
                    <span class="quote-date">${formatDate(quote.timestamp)}</span>
                </div>
                <select class="status-select" data-quote-id="${quote.id || index}" onchange="updateQuoteStatus(this)">
                    <option value="new" ${quote.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${quote.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="quoted" ${quote.status === 'quoted' ? 'selected' : ''}>Quoted</option>
                    <option value="completed" ${quote.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="quote-details">
                <div class="detail-row">
                    <span class="label">Phone:</span>
                    <a href="tel:${quote.phone}">${escapeHtml(quote.phone)}</a>
                </div>
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <a href="mailto:${quote.email}">${escapeHtml(quote.email)}</a>
                </div>
                <div class="detail-row">
                    <span class="label">Address:</span>
                    <span>${escapeHtml(quote.address)}</span>
                </div>
                ${quote.propertySize ? `
                <div class="detail-row">
                    <span class="label">Property Size:</span>
                    <span>${getPropertySizeLabel(quote.propertySize)}</span>
                </div>
                ` : ''}
                ${quote.services && quote.services.length > 0 ? `
                <div class="detail-row">
                    <span class="label">Services:</span>
                    <span class="services-list">${quote.services.map(s => getServiceLabel(s)).join(', ')}</span>
                </div>
                ` : ''}
                ${quote.message ? `
                <div class="detail-row full">
                    <span class="label">Message:</span>
                    <p class="message-text">${escapeHtml(quote.message)}</p>
                </div>
                ` : ''}
            </div>
            <div class="quote-actions">
                <button class="btn btn-sm btn-secondary" onclick="addQuoteNotes('${quote.id || index}')">Add Notes</button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuote('${quote.id || index}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function filterQuotes() {
    const filterValue = document.getElementById('statusFilter').value;

    if (filterValue === 'all') {
        renderQuotes(quotes);
    } else {
        const filtered = quotes.filter(q => q.status === filterValue);
        renderQuotes(filtered);
    }
}

function updateQuoteStatus(selectElement) {
    const quoteId = selectElement.dataset.quoteId;
    const newStatus = selectElement.value;

    const quoteIndex = quotes.findIndex((q, idx) => (q.id || idx.toString()) === quoteId);
    if (quoteIndex !== -1) {
        quotes[quoteIndex].status = newStatus;
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        showNotification('Status updated successfully', 'success');
    }
}

function deleteQuote(quoteId) {
    if (!confirm('Are you sure you want to delete this quote request?')) {
        return;
    }

    quotes = quotes.filter((q, idx) => (q.id || idx.toString()) !== quoteId);
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    loadQuotes();
    showNotification('Quote deleted successfully', 'success');
}

function addQuoteNotes(quoteId) {
    const notes = prompt('Enter notes for this quote:');
    if (notes) {
        const quoteIndex = quotes.findIndex((q, idx) => (q.id || idx.toString()) === quoteId);
        if (quoteIndex !== -1) {
            quotes[quoteIndex].notes = notes;
            localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
            showNotification('Notes added successfully', 'success');
        }
    }
}

function updateQuoteCount() {
    const newQuotes = quotes.filter(q => q.status === 'new' || !q.status);
    const badge = document.getElementById('quoteBadge');
    if (badge) {
        badge.textContent = newQuotes.length;
    }
}

// Upload type management
let currentUploadType = 'single';

function setUploadType(type) {
    currentUploadType = type;
    const singleBtn = document.getElementById('singleUploadBtn');
    const beforeAfterBtn = document.getElementById('beforeAfterUploadBtn');
    const singleForm = document.getElementById('imageUploadForm');
    const beforeAfterForm = document.getElementById('beforeAfterUploadForm');

    if (type === 'single') {
        singleBtn.classList.add('active');
        beforeAfterBtn.classList.remove('active');
        singleForm.style.display = 'block';
        beforeAfterForm.style.display = 'none';
    } else {
        singleBtn.classList.remove('active');
        beforeAfterBtn.classList.add('active');
        singleForm.style.display = 'none';
        beforeAfterForm.style.display = 'block';
    }
}

// Make setUploadType globally available
window.setUploadType = setUploadType;

// Gallery Management
async function loadGalleryImages() {
    try {
        const response = await fetch('http://localhost:3001/api/gallery');
        const data = await response.json();

        if (data.success) {
            galleryImages = data.images;
        } else {
            galleryImages = [];
        }
    } catch (error) {
        console.error('Error loading gallery images:', error);
        // Fallback to localStorage
        const storedImages = localStorage.getItem(STORAGE_KEYS.GALLERY);
        galleryImages = storedImages ? JSON.parse(storedImages) : [];
    }
    renderGallery();
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');

    if (!galleryImages || galleryImages.length === 0) {
        container.innerHTML = '<p class="empty-state">No images uploaded yet. Click "Upload Image" to add your first image.</p>';
        return;
    }

    container.innerHTML = galleryImages.map((img, index) => {
        if (img.type === 'before-after') {
            return `
                <div class="gallery-item-admin before-after-item" data-category="${img.category || 'uncategorized'}">
                    <div class="before-after-badge">Before & After</div>
                    <div class="before-after-preview">
                        <div class="before-preview-img">
                            <span class="preview-label">Before</span>
                            <img src="${img.beforeImage.url}" alt="Before">
                        </div>
                        <div class="after-preview-img">
                            <span class="preview-label">After</span>
                            <img src="${img.afterImage.url}" alt="After">
                        </div>
                    </div>
                    <div class="gallery-item-info">
                        ${img.category ? `<span class="category-badge">${getCategoryLabel(img.category)}</span>` : ''}
                        <div class="gallery-item-actions">
                            <button class="btn btn-sm btn-danger" onclick="deleteGalleryImage(${index})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="gallery-item-admin" data-category="${img.category || 'uncategorized'}">
                    <img src="${img.url}" alt="Gallery image">
                    <div class="gallery-item-info">
                        ${img.category ? `<span class="category-badge">${getCategoryLabel(img.category)}</span>` : ''}
                        <div class="gallery-item-actions">
                            <button class="btn btn-sm btn-danger" onclick="deleteGalleryImage(${index})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
}

function filterGalleryByCategory() {
    const filterValue = document.getElementById('categoryFilter').value;
    const galleryItems = document.querySelectorAll('.gallery-item-admin');

    galleryItems.forEach(item => {
        if (filterValue === 'all' || item.dataset.category === filterValue) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function getCategoryLabel(category) {
    return category || 'Uncategorized';
}

function toggleUploadForm() {
    const form = document.getElementById('uploadForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function handleImageUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById('imageFile');
    const category = document.getElementById('imageCategory').value;

    if (!fileInput.files || !fileInput.files[0]) {
        showNotification('Please select an image', 'error');
        return;
    }

    if (!category) {
        showNotification('Please select a category', 'error');
        return;
    }

    const file = fileInput.files[0];

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File is too large. Maximum size is 10MB.', 'error');
        return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPG, PNG, GIF, or WebP)', 'error');
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    try {
        showNotification('Uploading image...', 'info');

        const response = await fetch('http://localhost:3001/api/gallery/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Image uploaded successfully!', 'success');
            await loadGalleryImages(); // Reload gallery
            toggleUploadForm();
            document.getElementById('imageUploadForm').reset();
        } else {
            showNotification(data.message || 'Failed to upload image', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error uploading image. Make sure the server is running.', 'error');
    }
}

async function deleteGalleryImage(index) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    const image = galleryImages[index];

    if (!image || !image.id) {
        // Fallback to localStorage delete for old data
        galleryImages.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(galleryImages));
        renderGallery();
        showNotification('Image deleted successfully', 'success');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/gallery/${image.id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Image deleted successfully', 'success');
            await loadGalleryImages(); // Reload gallery
        } else {
            showNotification(data.message || 'Failed to delete image', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting image. Make sure the server is running.', 'error');
    }
}

// Handle Before/After Image Upload
async function handleBeforeAfterUpload(e) {
    e.preventDefault();

    const beforeFileInput = document.getElementById('beforeImageFile');
    const afterFileInput = document.getElementById('afterImageFile');
    const category = document.getElementById('beforeAfterCategory').value;

    if (!beforeFileInput.files || !beforeFileInput.files[0]) {
        showNotification('Please select a before image', 'error');
        return;
    }

    if (!afterFileInput.files || !afterFileInput.files[0]) {
        showNotification('Please select an after image', 'error');
        return;
    }

    if (!category) {
        showNotification('Please select a category', 'error');
        return;
    }

    const beforeFile = beforeFileInput.files[0];
    const afterFile = afterFileInput.files[0];

    // Validate file sizes (10MB)
    if (beforeFile.size > 10 * 1024 * 1024 || afterFile.size > 10 * 1024 * 1024) {
        showNotification('Files are too large. Maximum size is 10MB each.', 'error');
        return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(beforeFile.type) || !validTypes.includes(afterFile.type)) {
        showNotification('Please select valid image files (JPG, PNG, GIF, or WebP)', 'error');
        return;
    }

    // Validate that both images have equal dimensions
    try {
        showNotification('Validating image dimensions...', 'info');
        const [beforeDimensions, afterDimensions] = await Promise.all([
            getImageDimensions(beforeFile),
            getImageDimensions(afterFile)
        ]);

        if (beforeDimensions.width !== afterDimensions.width || beforeDimensions.height !== afterDimensions.height) {
            showNotification(
                `Image dimensions must match. Before image: ${beforeDimensions.width}x${beforeDimensions.height}, After image: ${afterDimensions.width}x${afterDimensions.height}`,
                'error'
            );
            return;
        }
    } catch (error) {
        console.error('Error validating image dimensions:', error);
        showNotification('Error validating image dimensions. Please try again.', 'error');
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('beforeImage', beforeFile);
    formData.append('afterImage', afterFile);
    formData.append('category', category);

    try {
        showNotification('Uploading before/after images...', 'info');

        const response = await fetch('http://localhost:3001/api/gallery/upload-before-after', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Before/After images uploaded successfully!', 'success');
            await loadGalleryImages(); // Reload gallery
            toggleUploadForm();
            document.getElementById('beforeAfterUploadForm').reset();
            // Clear previews
            document.getElementById('beforePreview').innerHTML = '';
            document.getElementById('afterPreview').innerHTML = '';
        } else {
            showNotification(data.message || 'Failed to upload images', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error uploading images. Make sure the server is running.', 'error');
    }
}

// Helper function to get image dimensions from a file
function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

// Image preview for before/after uploads
function setupImagePreviews() {
    const beforeInput = document.getElementById('beforeImageFile');
    const afterInput = document.getElementById('afterImageFile');
    const beforePreview = document.getElementById('beforePreview');
    const afterPreview = document.getElementById('afterPreview');

    if (beforeInput) {
        beforeInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    beforePreview.innerHTML = `<img src="${event.target.result}" alt="Before Preview">`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    if (afterInput) {
        afterInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    afterPreview.innerHTML = `<img src="${event.target.result}" alt="After Preview">`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
}

// Settings Functions
function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    // In production, this would call a backend API
    showNotification('Password change functionality requires backend integration', 'info');
    e.target.reset();
}

function handleContactUpdate(e) {
    e.preventDefault();

    const phone = document.getElementById('businessPhone').value;
    const email = document.getElementById('businessEmail').value;
    const area = document.getElementById('serviceArea').value;

    // In production, this would update the database
    showNotification('Contact information update requires backend integration', 'info');
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';

    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function getPropertySizeLabel(size) {
    const labels = {
        'small': 'Small (under 5,000 sq ft)',
        'medium': 'Medium (5,000 - 10,000 sq ft)',
        'large': 'Large (10,000 - 20,000 sq ft)',
        'xlarge': 'Extra Large (20,000+ sq ft)'
    };
    return labels[size] || size;
}

function getServiceLabel(service) {
    return service || 'Unknown';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Make functions available globally for inline event handlers
window.updateQuoteStatus = updateQuoteStatus;
window.deleteQuote = deleteQuote;
window.addQuoteNotes = addQuoteNotes;
window.deleteGalleryImage = deleteGalleryImage;
