# Gallery Category System Documentation

## Overview
The gallery now has a complete category system with 6 service categories. You can upload images to specific categories through the admin portal, and visitors can filter images by category on the main website.

---

## Categories

The system includes these 4 categories:

1. **Residential Lawn Mowing** - Images of residential mowing work
2. **Commercial Lawn Maintenance** - Commercial property maintenance
3. **Trimming** - Hedge and shrub trimming work
4. **Seasonal Cleanup** - Spring and fall cleanup projects

---

## How to Upload Images by Category

### Step 1: Access Admin Portal
Go to: **http://localhost:3001/admin.html**

Login:
- Username: `admin`
- Password: `handelsman2024`

### Step 2: Navigate to Gallery Management
Click on **"Gallery Management"** in the navigation menu

### Step 3: Upload Image
1. Click the **"Upload Image"** button
2. Fill in the upload form:
   - **Select Image**: Choose an image file from your laptop
   - **Category**: **SELECT A CATEGORY (REQUIRED)** from the dropdown:
     - Residential Lawn Mowing
     - Commercial Lawn Maintenance
     - Trimming
     - Seasonal Cleanup
   - **Image Title**: Enter a descriptive title
   - **Description**: Add optional description
3. Click **"Upload"**

### Important:
- **Category is REQUIRED** - You must select a category before uploading
- Each image must be assigned to one category
- The category cannot be changed after upload (you'll need to delete and re-upload)

---

## Viewing Categories on the Website

### Main Website Gallery

Visit: **http://localhost:3001/index.html**

The gallery section now has **category tabs** at the top:

```
[ All Work ] [ Residential Mowing ] [ Commercial Maintenance ]
[ Trimming ] [ Seasonal Cleanup ]
```

### How It Works:

1. **Default View**: Shows "All Work" (all images from all categories)
2. **Click a Tab**: Shows only images from that category
3. **Active Tab**: Highlighted in green to show current selection
4. **Empty Categories**: Shows "No gallery images yet..." if no images in that category

---

## Admin Portal Features

### Filter by Category
In the admin portal's Gallery Management section, you can filter uploaded images:

1. Use the **"All Categories"** dropdown at the top
2. Select a category to see only those images
3. Useful for managing large numbers of images

### Category Badge
Each uploaded image displays a colored badge showing its category, making it easy to identify which category an image belongs to.

---

## Technical Details

### Database Structure
Images are stored with category information in `data/gallery.json`:

```json
{
  "id": "1234567890",
  "filename": "1234567890-image.jpg",
  "url": "/uploads/1234567890-image.jpg",
  "title": "Beautiful Lawn",
  "description": "Freshly mowed lawn",
  "category": "residential-mowing",
  "size": 245678,
  "uploadedAt": "2024-11-18T19:30:00.000Z"
}
```

### Category Values (Backend)
- `residential-mowing`
- `commercial-maintenance`
- `trimming`
- `seasonal-cleanup`

### API Endpoints

**Get all images:**
```
GET /api/gallery
```

**Get images by category:**
```
GET /api/gallery?category=residential-mowing
```

---

## Example Workflow

### Scenario: Upload Images for Different Services

**1. Upload Residential Mowing Images**
- Select category: "Residential Lawn Mowing"
- Upload 3-5 photos of residential properties
- Title them descriptively (e.g., "Suburban Front Lawn", "Backyard Mowing")

**2. Upload Commercial Work**
- Select category: "Commercial Lawn Maintenance"
- Upload photos of commercial properties
- Title them (e.g., "Office Building Grounds", "Shopping Center Lawn")

**3. Upload Trimming Work**
- Select category: "Trimming"
- Upload photos of hedge and shrub work
- Title them (e.g., "Hedge Shaping", "Bush Trimming")

**4. View on Website**
- Go to http://localhost:3001/index.html
- Scroll to gallery section
- Click "Residential Mowing" tab → See only residential images
- Click "Commercial Maintenance" tab → See only commercial images
- Click "Trimming" tab → See only trimming images
- Click "All Work" tab → See all images together

---

## Best Practices

### 1. Categorization Tips
- **Be specific**: Use the most relevant category for each image
- **Residential vs Commercial**: Clearly differentiate between residential and commercial work
- **Seasonal work**: Use "Seasonal Cleanup" for spring/fall cleanups
- **Multiple services**: If an image shows multiple services, choose the primary one

### 2. Image Organization
- Upload at least 3-5 images per category for a good display
- Use descriptive titles that indicate the type of work shown
- Keep image quality high (but under 10MB)

### 3. Portfolio Building
- **Showcase variety**: Upload different types of work within each category
- **Before/After**: Consider organizing before/after shots in the same category
- **Quality over quantity**: Better to have fewer high-quality categorized images than many uncategorized ones

---

## Troubleshooting

### Category dropdown not showing
- **Check**: Make sure you're on the latest version of admin.html
- **Fix**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### "Category is required" error
- **Cause**: You tried to upload without selecting a category
- **Fix**: Select a category from the dropdown before uploading

### Category tabs not working on website
- **Check**: Make sure you're accessing via http://localhost:3001
- **Fix**: Restart the server with `npm start`

### Images don't appear when clicking category tab
- **Cause**: No images uploaded for that category yet
- **Fix**: Upload images for that specific category via admin portal

### Category filter in admin not working
- **Check**: Make sure galleryImages have category property
- **Fix**: Re-upload images with categories

---

## File Changes Summary

### Modified Files:
1. **admin.html**
   - Added category dropdown to upload form
   - Added category filter to gallery management

2. **js/admin.js**
   - Added category validation
   - Added category to FormData
   - Added filterGalleryByCategory() function
   - Added getCategoryLabel() helper
   - Display category badge on each image

3. **css/admin.css**
   - Added `.category-badge` styles

4. **server.js**
   - Added category validation in upload endpoint
   - Added category to imageData object
   - Added category filtering to GET /api/gallery endpoint

5. **index.html**
   - Added category tabs HTML structure

6. **css/styles.css**
   - Added `.gallery-tabs` styles
   - Added `.gallery-tab` button styles

7. **js/main.js**
   - Updated loadGalleryImages() to accept category parameter
   - Added initializeGalleryTabs() function
   - Added category-based API fetching

---

## Current Status

✅ Category system is fully functional
✅ Admin can upload images with categories
✅ Admin can filter images by category
✅ Website displays category tabs
✅ Visitors can filter gallery by category
✅ Server API supports category filtering
✅ All 4 categories available and working

---

## Next Steps

You can now:
1. **Upload images** for each of the 4 categories
2. **Organize your portfolio** by service type
3. **Let visitors browse** your work by category
4. **Build a comprehensive gallery** showcasing all your services

---

## Quick Reference

### Upload URLs:
- **Admin Portal**: http://localhost:3001/admin.html
- **Main Website**: http://localhost:3001/index.html

### Categories (in order):
1. Residential Lawn Mowing
2. Commercial Lawn Maintenance
3. Trimming
4. Seasonal Cleanup

### Required Fields:
- Image file ✓
- Category ✓
- Title ✓
- Description (optional)

**The category system is ready to use! Start uploading categorized images now!** 🎉
