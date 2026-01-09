# Cloudinary Implementation for Transaction Screenshots

## Overview
Transaction screenshots are now stored on Cloudinary instead of local file storage. This provides better scalability, automatic image optimization, and CDN delivery.

## Configuration

### Environment Variables
Added to `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=dri04iflq
CLOUDINARY_API_KEY=265833691256595
CLOUDINARY_API_SECRET=_o-_u9uliTngb2CTqkfJssP_mU4
```

### Dependencies
```bash
npm install cloudinary
```
Already installed in the backend.

## Implementation Details

### Backend Changes

#### 1. Deposit Controller (`backend/controllers/depositController.js`)

**Cloudinary Configuration:**
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
```

**Multer Configuration:**
- Changed from `diskStorage` to `memoryStorage`
- Files are now stored in memory buffer before uploading to Cloudinary
- No local file system storage needed

**Upload Process:**
```javascript
const uploadStream = () => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'transactions',
                resource_type: 'image',
                public_id: `transaction-${Date.now()}-${req.user.id}`
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(req.file.buffer);
    });
};

const cloudinaryResult = await uploadStream();
deposit.transactionScreenshot = cloudinaryResult.secure_url;
```

**Key Features:**
- Images stored in `transactions` folder on Cloudinary
- Unique public_id with timestamp and user ID
- Returns secure HTTPS URL
- Automatic image optimization by Cloudinary

### Frontend Changes

#### Admin Panel (`admin/src/pages/Deposits.jsx`)

**Image Display:**
```javascript
<img 
    src={viewScreenshot}
    alt="Transaction screenshot" 
    className="w-full rounded-xl object-contain max-h-[70vh]"
/>
```

**Changes:**
- Removed API_URL prefix (Cloudinary URLs are absolute)
- Added `object-contain` for better image scaling
- Added `max-h-[70vh]` to prevent oversized images

## Cloudinary Features

### Automatic Optimizations
- Image compression
- Format conversion (WebP for supported browsers)
- Responsive image delivery
- CDN caching worldwide

### Storage Structure
```
Cloudinary Account (dri04iflq)
└── transactions/
    ├── transaction-1234567890-user123.jpg
    ├── transaction-1234567891-user456.png
    └── ...
```

### URL Format
```
https://res.cloudinary.com/dri04iflq/image/upload/v1234567890/transactions/transaction-1234567890-user123.jpg
```

## Benefits Over Local Storage

1. **Scalability**: No server disk space concerns
2. **Performance**: CDN delivery for faster loading
3. **Optimization**: Automatic image compression and format conversion
4. **Reliability**: Cloud backup and redundancy
5. **Bandwidth**: Offloads image serving from your server
6. **Transformations**: Can apply on-the-fly image transformations

## Image Transformations (Optional)

You can add transformations to Cloudinary URLs:

### Thumbnail Generation
```javascript
// In upload configuration
{
    folder: 'transactions',
    resource_type: 'image',
    public_id: `transaction-${Date.now()}-${req.user.id}`,
    transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
    ]
}
```

### URL-based Transformations
```javascript
// Original
https://res.cloudinary.com/dri04iflq/image/upload/transactions/image.jpg

// Thumbnail (300x300)
https://res.cloudinary.com/dri04iflq/image/upload/w_300,h_300,c_fill/transactions/image.jpg

// Optimized quality
https://res.cloudinary.com/dri04iflq/image/upload/q_auto,f_auto/transactions/image.jpg
```

## Security Considerations

1. **API Credentials**: Stored in environment variables (never commit to git)
2. **Upload Restrictions**: 
   - File size limit: 5MB
   - File types: Images only (JPEG, PNG, GIF, WEBP)
   - User authentication required
3. **Folder Organization**: All transactions in dedicated folder
4. **Unique Naming**: Timestamp + User ID prevents conflicts

## Testing

### Upload Test
1. Create a deposit request
2. Upload a transaction screenshot
3. Verify image appears on Cloudinary dashboard
4. Check database for Cloudinary URL
5. View screenshot in admin panel

### Cloudinary Dashboard
- Login: https://cloudinary.com/console
- Navigate to Media Library
- Check `transactions` folder for uploaded images

## Monitoring

### Cloudinary Dashboard Metrics
- Total storage used
- Bandwidth consumption
- Number of transformations
- API usage

### Free Tier Limits
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

## Troubleshooting

### Issue: Upload fails with "Invalid credentials"
**Solution:** Verify environment variables are set correctly

### Issue: Image not displaying
**Solution:** 
- Check Cloudinary URL in database
- Verify image exists in Cloudinary dashboard
- Check browser console for CORS errors

### Issue: Slow uploads
**Solution:** 
- Check internet connection
- Verify file size is under 5MB
- Consider image compression before upload

### Issue: "Quota exceeded"
**Solution:** 
- Check Cloudinary dashboard for usage
- Upgrade plan if needed
- Delete old/unused images

## Migration from Local Storage

If you have existing local images:

1. **Keep existing URLs**: Old deposits with local URLs will still work
2. **New uploads**: All new uploads go to Cloudinary
3. **Optional migration script**: Create a script to upload existing images to Cloudinary

### Migration Script Example
```javascript
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Deposit = require('./models/Deposit');

async function migrateImages() {
    const deposits = await Deposit.find({ 
        transactionScreenshot: { $regex: '^/uploads/' } 
    });

    for (const deposit of deposits) {
        const localPath = path.join(__dirname, deposit.transactionScreenshot);
        
        if (fs.existsSync(localPath)) {
            const result = await cloudinary.uploader.upload(localPath, {
                folder: 'transactions',
                public_id: `transaction-${deposit._id}`
            });
            
            deposit.transactionScreenshot = result.secure_url;
            await deposit.save();
            
            console.log(`Migrated: ${deposit._id}`);
        }
    }
}
```

## Backup Strategy

### Cloudinary Backup
- Cloudinary provides automatic backups
- Images are stored redundantly across multiple servers

### Database Backup
- URLs are stored in MongoDB
- Regular database backups include image URLs

### Manual Backup (Optional)
```javascript
// Download all images from Cloudinary
const cloudinary = require('cloudinary').v2;

cloudinary.api.resources({
    type: 'upload',
    prefix: 'transactions/',
    max_results: 500
}, (error, result) => {
    result.resources.forEach(resource => {
        // Download each image
        console.log(resource.secure_url);
    });
});
```

## Cost Optimization

1. **Image Compression**: Enable automatic quality optimization
2. **Format Selection**: Use WebP for modern browsers
3. **Lazy Loading**: Load images only when needed
4. **Thumbnail Generation**: Create smaller versions for lists
5. **Cache Control**: Set appropriate cache headers

## Future Enhancements

1. **Image Analysis**: Use Cloudinary AI for automatic tagging
2. **OCR**: Extract transaction ID from screenshot automatically
3. **Duplicate Detection**: Detect duplicate screenshots
4. **Watermarking**: Add watermarks for security
5. **Video Support**: Support video transaction proofs

## API Reference

### Upload Image
```javascript
cloudinary.uploader.upload_stream(options, callback)
```

### Get Image Info
```javascript
cloudinary.api.resource(public_id, callback)
```

### Delete Image
```javascript
cloudinary.uploader.destroy(public_id, callback)
```

### List Images
```javascript
cloudinary.api.resources(options, callback)
```

## Support

- Cloudinary Documentation: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration
- Support: https://support.cloudinary.com

## Conclusion

Transaction screenshots are now stored on Cloudinary, providing a scalable, reliable, and performant solution for image storage. The implementation is complete and ready for production use.
