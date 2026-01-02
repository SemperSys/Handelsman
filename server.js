const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Email configuration
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify email configuration on startup
emailTransporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send confirmation email to customer
async function sendCustomerConfirmationEmail(quoteData) {
    const mailOptions = {
        from: `"Handelsman's Quality Mowing" <${process.env.EMAIL_USER}>`,
        to: quoteData.email,
        subject: 'Quote Request Received - Handelsman\'s Quality Mowing',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2d5a27; color: white; padding: 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .quote-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .quote-details h3 { color: #2d5a27; margin-top: 0; }
                    .quote-details p { margin: 8px 0; }
                    .label { font-weight: bold; color: #555; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .cta { background-color: #2d5a27; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Handelsman's Quality Mowing</h1>
                    </div>
                    <div class="content">
                        <h2>Thank You for Your Quote Request!</h2>
                        <p>Dear ${quoteData.name},</p>
                        <p>We have received your quote request and will get back to you within 24 hours. Below is a summary of your submission:</p>

                        <div class="quote-details">
                            <h3>Your Quote Request Details</h3>
                            <p><span class="label">Name:</span> ${quoteData.name}</p>
                            <p><span class="label">Phone:</span> ${quoteData.phone}</p>
                            <p><span class="label">Email:</span> ${quoteData.email}</p>
                            <p><span class="label">Property Address:</span> ${quoteData.address}</p>
                            ${quoteData.propertySize ? `<p><span class="label">Property Size:</span> ${quoteData.propertySize}</p>` : ''}
                            ${quoteData.services && quoteData.services.length > 0 ? `<p><span class="label">Services Requested:</span> ${Array.isArray(quoteData.services) ? quoteData.services.join(', ') : quoteData.services}</p>` : ''}
                            ${quoteData.message ? `<p><span class="label">Additional Details:</span> ${quoteData.message}</p>` : ''}
                        </div>

                        <p>If you have any urgent questions, please don't hesitate to contact us:</p>
                        <p><strong>Phone:</strong> 1-226-346-5520</p>
                        <p><strong>Email:</strong> info@handelsmanmowing.ca</p>

                        <p>We look forward to serving you!</p>
                        <p>Best regards,<br>The Handelsman's Quality Mowing Team</p>
                    </div>
                    <div class="footer">
                        <p>Handelsman's Quality Mowing | Windsor & Surrounding Areas</p>
                        <p>Mon-Sat: 7am - 7pm</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return emailTransporter.sendMail(mailOptions);
}

// Function to send notification email to business owner
async function sendOwnerNotificationEmail(quoteData) {
    const mailOptions = {
        from: `"Website Quote System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Quote Request from ${quoteData.name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2d5a27; color: white; padding: 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .quote-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2d5a27; }
                    .quote-details p { margin: 8px 0; }
                    .label { font-weight: bold; color: #555; }
                    .urgent { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Quote Request</h1>
                    </div>
                    <div class="content">
                        <p>A new quote request has been submitted through the website:</p>

                        <div class="quote-details">
                            <p><span class="label">Name:</span> ${quoteData.name}</p>
                            <p><span class="label">Phone:</span> <a href="tel:${quoteData.phone}">${quoteData.phone}</a></p>
                            <p><span class="label">Email:</span> <a href="mailto:${quoteData.email}">${quoteData.email}</a></p>
                            <p><span class="label">Property Address:</span> ${quoteData.address}</p>
                            ${quoteData.propertySize ? `<p><span class="label">Property Size:</span> ${quoteData.propertySize}</p>` : ''}
                            ${quoteData.services && quoteData.services.length > 0 ? `<p><span class="label">Services Requested:</span> ${Array.isArray(quoteData.services) ? quoteData.services.join(', ') : quoteData.services}</p>` : ''}
                            ${quoteData.message ? `<p><span class="label">Additional Details:</span> ${quoteData.message}</p>` : ''}
                            <p><span class="label">Submitted:</span> ${new Date(quoteData.timestamp).toLocaleString()}</p>
                        </div>

                        <div class="urgent">
                            <strong>Remember:</strong> Please respond to this customer within 24 hours!
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return emailTransporter.sendMail(mailOptions);
}

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

// Multer for before/after image pairs
const uploadBeforeAfter = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
}).fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 }
]);

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
    const category = req.query.category;

    if (category && category !== 'all') {
        const filteredImages = images.filter(img => img.category === category);
        return res.json({ success: true, images: filteredImages });
    }

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

        // Create image data
        const imageData = {
            id: Date.now().toString(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
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

// Upload before/after image pair
app.post('/api/gallery/upload-before-after', (req, res) => {
    uploadBeforeAfter(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Maximum size is 10MB.' : err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            if (req.fileValidationError) {
                return res.status(400).json({
                    success: false,
                    message: req.fileValidationError
                });
            }

            if (!req.files || !req.files.beforeImage || !req.files.afterImage) {
                // Clean up any uploaded files
                if (req.files) {
                    if (req.files.beforeImage) fs.unlinkSync(req.files.beforeImage[0].path);
                    if (req.files.afterImage) fs.unlinkSync(req.files.afterImage[0].path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Both before and after images are required'
                });
            }

            const beforeFile = req.files.beforeImage[0];
            const afterFile = req.files.afterImage[0];

            // Create image data for before/after pair
            const imageData = {
                id: Date.now().toString(),
                type: 'before-after',
                beforeImage: {
                    filename: beforeFile.filename,
                    originalName: beforeFile.originalname,
                    url: `/uploads/${beforeFile.filename}`,
                    size: beforeFile.size
                },
                afterImage: {
                    filename: afterFile.filename,
                    originalName: afterFile.originalname,
                    url: `/uploads/${afterFile.filename}`,
                    size: afterFile.size
                },
                uploadedAt: new Date().toISOString()
            };

            // Add to gallery data
            const images = readGalleryData();
            images.push(imageData);
            writeGalleryData(images);

            res.json({
                success: true,
                message: 'Before/After images uploaded successfully',
                image: imageData
            });

        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading files: ' + error.message
            });
        }
    });
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

        // Delete the physical file(s)
        if (image.type === 'before-after') {
            // Delete both before and after images
            const beforePath = path.join(__dirname, 'uploads', image.beforeImage.filename);
            const afterPath = path.join(__dirname, 'uploads', image.afterImage.filename);
            if (fs.existsSync(beforePath)) fs.unlinkSync(beforePath);
            if (fs.existsSync(afterPath)) fs.unlinkSync(afterPath);
        } else {
            // Delete single image
            const filePath = path.join(__dirname, 'uploads', image.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
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
app.post('/api/quotes', async (req, res) => {
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

        // Send confirmation emails
        let emailStatus = { customer: false, owner: false };

        try {
            // Send confirmation email to customer
            await sendCustomerConfirmationEmail(quoteData);
            emailStatus.customer = true;
            console.log('Customer confirmation email sent to:', quoteData.email);
        } catch (emailError) {
            console.error('Failed to send customer email:', emailError);
        }

        try {
            // Send notification email to business owner
            await sendOwnerNotificationEmail(quoteData);
            emailStatus.owner = true;
            console.log('Owner notification email sent');
        } catch (emailError) {
            console.error('Failed to send owner notification email:', emailError);
        }

        res.json({
            success: true,
            message: 'Quote request submitted successfully',
            quote: quoteData,
            emailSent: emailStatus
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
