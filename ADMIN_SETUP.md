# Admin Portal Setup Guide

## Overview
The admin portal now has a fully functional image upload system with a Node.js backend server that saves images to the `uploads` folder.

## Server Information

**Backend Server:** Node.js + Express
**Port:** 3001
**Admin Portal URL:** http://localhost:3001/admin.html
**Main Website URL:** http://localhost:3001/index.html

## Login Credentials

- **Username:** `admin`
- **Password:** `handelsman2024`

**⚠️ IMPORTANT:** Change these credentials before deploying to production!

## How to Start the Server

1. **Make sure you're in the project directory:**
   ```bash
   cd C:\repos\handelsmansmowing-redesign
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the admin portal:**
   Open your browser and go to: http://localhost:3001/admin.html

## Image Upload Features

### What Works Now:
✅ Upload images from your laptop (JPG, PNG, GIF, WebP)
✅ Images are saved to the `uploads` folder on the server
✅ Maximum file size: 10MB per image
✅ Add title and description to each image
✅ Delete images from the gallery
✅ Images persist between sessions (saved in `data/gallery.json`)
✅ Real-time gallery updates

### How to Upload Images:

1. Log in to the admin portal
2. Click on "Gallery Management" in the navigation
3. Click the "Upload Image" button
4. Fill in the form:
   - Select an image file from your computer
   - Enter a title (required)
   - Enter a description (optional)
5. Click "Upload"
6. The image will be uploaded and appear in the gallery immediately

### File Storage:

- **Images:** Stored in `C:\repos\handelsmansmowing-redesign\uploads\`
- **Gallery Data:** Stored in `C:\repos\handelsmansmowing-redesign\data\gallery.json`
- **Quote Requests:** Stored in `C:\repos\handelsmansmowing-redesign\data\quotes.json`

## API Endpoints

The server provides the following API endpoints:

### Gallery Management
- `GET /api/gallery` - Get all gallery images
- `POST /api/gallery/upload` - Upload a new image
- `DELETE /api/gallery/:id` - Delete an image

### Quote Management
- `GET /api/quotes` - Get all quote requests
- `POST /api/quotes` - Create a new quote request
- `PATCH /api/quotes/:id` - Update quote status/notes
- `DELETE /api/quotes/:id` - Delete a quote

## Troubleshooting

### Image upload fails
- ✅ Make sure the server is running (`npm start`)
- ✅ Check that you're accessing the site through http://localhost:3001 (not file://)
- ✅ Verify the file is a valid image format (JPG, PNG, GIF, WebP)
- ✅ Ensure the file is under 10MB
- ✅ Check browser console (F12) for error messages

### Server won't start
- If port 3001 is in use, you can change it in `server.js` (line 8)
- Make sure Node.js is installed: `node --version`
- Reinstall dependencies: `npm install`

### Images don't appear
- Check that the `uploads` folder exists and has proper permissions
- Verify images are in `data/gallery.json`
- Clear browser cache and refresh

## Production Deployment

Before deploying to production:

1. **Change admin credentials** in `js/admin.js` (lines 6-9)
2. **Set up proper authentication** with secure password hashing
3. **Use environment variables** for sensitive data
4. **Configure HTTPS** for secure file uploads
5. **Set up a production database** (MySQL, PostgreSQL, or MongoDB)
6. **Implement file size and type validation** on the server
7. **Add image optimization** (resize, compress)
8. **Set up backup system** for uploaded files
9. **Configure proper CORS** settings for your domain

## Development vs Production

**Current Setup (Development):**
- Uses localhost
- Stores data in JSON files
- Simple authentication
- Direct file uploads

**Recommended Production Setup:**
- Use a proper domain with SSL
- Store data in a database
- Implement JWT or session-based authentication
- Use cloud storage (AWS S3, Google Cloud Storage) for images
- Add CDN for faster image delivery
- Implement rate limiting and security measures

## File Structure

```
handelsmansmowing-redesign/
├── admin.html              # Admin portal interface
├── index.html              # Main website
├── server.js               # Backend server
├── package.json            # Node.js dependencies
├── css/
│   ├── admin.css          # Admin portal styles
│   └── styles.css         # Main website styles
├── js/
│   ├── admin.js           # Admin portal logic
│   └── main.js            # Main website logic
├── uploads/               # Uploaded images (created automatically)
├── data/
│   ├── gallery.json       # Gallery data (created automatically)
│   └── quotes.json        # Quote requests (created automatically)
└── images/                # Static images for website
```

## Support

For issues or questions, check:
- Browser console (F12 → Console tab)
- Server logs (terminal where you ran `npm start`)
- Network tab (F12 → Network tab) for API request failures
