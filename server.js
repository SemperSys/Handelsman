const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
});

// Gallery data file
const galleryDataFile = path.join(__dirname, 'data', 'gallery.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize gallery data file if it doesn't exist
if (!fs.existsSync(galleryDataFile)) {
    fs.writeFileSync(galleryDataFile, JSON.stringify([]), 'utf8');
}

// Helper function to read gallery data
function readGalleryData() {
    try {
        const data = fs.readFileSync(galleryDataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading gallery data:', error);
        return [];
    }
}

// Helper function to write gallery data
function writeGalleryData(data) {
    try {
        fs.writeFileSync(galleryDataFile, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing gallery data:', error);
        return false;
    }
}

// Routes

// Get all gallery images
app.get('/api/gallery', (req, res) => {
    const images = readGalleryData();
    res.json({ success: true, images });
});

// Upload image
app.post('/api/gallery/upload', upload.single('image'), (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({
                success: false,
                message: req.fileValidationError
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { title, description } = req.body;

        if (!title) {
            // Delete the uploaded file if title is missing
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Create image data
        const imageData = {
            id: Date.now().toString(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            title: title,
            description: description || '',
            size: req.file.size,
            uploadedAt: new Date().toISOString()
        };

        // Add to gallery data
        const images = readGalleryData();
        images.push(imageData);
        writeGalleryData(images);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            image: imageData
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file: ' + error.message
        });
    }
});

// Delete image
app.delete('/api/gallery/:id', (req, res) => {
    try {
        const imageId = req.params.id;
        const images = readGalleryData();
        const imageIndex = images.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const image = images[imageIndex];

        // Delete the physical file
        const filePath = path.join(__dirname, 'uploads', image.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from data
        images.splice(imageIndex, 1);
        writeGalleryData(images);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image: ' + error.message
        });
    }
});

// Quote requests routes
const quotesDataFile = path.join(__dirname, 'data', 'quotes.json');

// Initialize quotes data file if it doesn't exist
if (!fs.existsSync(quotesDataFile)) {
    fs.writeFileSync(quotesDataFile, JSON.stringify([]), 'utf8');
}

function readQuotesData() {
    try {
        const data = fs.readFileSync(quotesDataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading quotes data:', error);
        return [];
    }
}

function writeQuotesData(data) {
    try {
        fs.writeFileSync(quotesDataFile, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing quotes data:', error);
        return false;
    }
}

// Get all quotes
app.get('/api/quotes', (req, res) => {
    const quotes = readQuotesData();
    res.json({ success: true, quotes });
});

// Create new quote
app.post('/api/quotes', (req, res) => {
    try {
        const quoteData = {
            id: Date.now().toString(),
            ...req.body,
            status: 'new',
            timestamp: new Date().toISOString()
        };

        const quotes = readQuotesData();
        quotes.push(quoteData);
        writeQuotesData(quotes);

        res.json({
            success: true,
            message: 'Quote request submitted successfully',
            quote: quoteData
        });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting quote: ' + error.message
        });
    }
});

// Update quote status
app.patch('/api/quotes/:id', (req, res) => {
    try {
        const quoteId = req.params.id;
        const { status, notes } = req.body;

        const quotes = readQuotesData();
        const quoteIndex = quotes.findIndex(q => q.id === quoteId);

        if (quoteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (status) quotes[quoteIndex].status = status;
        if (notes !== undefined) quotes[quoteIndex].notes = notes;

        writeQuotesData(quotes);

        res.json({
            success: true,
            message: 'Quote updated successfully',
            quote: quotes[quoteIndex]
        });
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating quote: ' + error.message
        });
    }
});

// Delete quote
app.delete('/api/quotes/:id', (req, res) => {
    try {
        const quoteId = req.params.id;
        const quotes = readQuotesData();
        const quoteIndex = quotes.findIndex(q => q.id === quoteId);

        if (quoteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        quotes.splice(quoteIndex, 1);
        writeQuotesData(quotes);

        res.json({
            success: true,
            message: 'Quote deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting quote: ' + error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 10MB.'
            });
        }
    }
    res.status(500).json({
        success: false,
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Admin portal: http://localhost:${PORT}/admin.html`);
    console.log(`🌐 Main website: http://localhost:${PORT}/index.html`);
    console.log(`📸 Uploads folder: ${uploadsDir}\n`);
});
