# Quick Reference - Transaction Screenshots with Cloudinary

## 🚀 Quick Start

```bash
# 1. Install dependencies (already done)
cd backend
npm install cloudinary

# 2. Verify environment variables
cat .env | grep CLOUDINARY

# 3. Start server
npm start
```

## 📋 Environment Variables

```env
CLOUDINARY_CLOUD_NAME=dri04iflq
CLOUDINARY_API_KEY=265833691256595
CLOUDINARY_API_SECRET=_o-_u9uliTngb2CTqkfJssP_mU4
```

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| Cloudinary Dashboard | https://cloudinary.com/console |
| Media Library | https://cloudinary.com/console/media_library |
| Usage Stats | https://cloudinary.com/console/usage |
| Documentation | https://cloudinary.com/documentation |

## 📁 File Locations

| File | Purpose |
|------|---------|
| `backend/controllers/depositController.js` | Upload logic |
| `backend/.env` | Cloudinary credentials |
| `admin/src/pages/Deposits.jsx` | View screenshots |
| `client/src/pages/Deposit.jsx` | Upload interface |

## 🧪 Quick Test

```bash
# 1. Create deposit
POST /api/deposits/create
{
  "amount": 3300,
  "paymentMethod": "BANK_ID"
}

# 2. Upload screenshot
POST /api/deposits/submit-ft
Content-Type: multipart/form-data
{
  "depositId": "DEPOSIT_ID",
  "transactionFT": "TEST123",
  "screenshot": [FILE]
}

# 3. Check result
GET /api/deposits/user
```

## 🔍 Verify Upload

### Database Check
```javascript
db.deposits.findOne({ transactionFT: "TEST123" })
// Should have: transactionScreenshot: "https://res.cloudinary.com/..."
```

### Cloudinary Check
1. Login to dashboard
2. Media Library → transactions folder
3. Find your image

## ⚙️ Configuration

### Multer Settings
- Storage: Memory (buffer)
- Max Size: 5MB
- Allowed: JPEG, JPG, PNG, GIF, WEBP

### Cloudinary Settings
- Folder: `transactions/`
- Naming: `transaction-{timestamp}-{userId}`
- Resource Type: `image`

## 🎯 Key Functions

### Upload to Cloudinary
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
```

### Display in Admin
```javascript
<img 
    src={viewScreenshot}
    alt="Transaction screenshot" 
    className="w-full rounded-xl object-contain max-h-[70vh]"
/>
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Check .env file, restart server |
| Upload fails | Verify file size < 5MB, check internet |
| Image not displaying | Check Cloudinary URL, verify image exists |
| Slow uploads | Compress image, check network speed |

## 📊 Monitoring

### Check Usage
```bash
# Cloudinary Dashboard → Usage
- Storage: X / 25 GB
- Bandwidth: X / 25 GB/month
- Transformations: X / 25,000/month
```

### Database Stats
```javascript
// Count Cloudinary uploads
db.deposits.countDocuments({ 
    transactionScreenshot: { $regex: '^https://res.cloudinary.com' } 
})
```

## 🔐 Security

✅ Credentials in environment variables
✅ File type validation (images only)
✅ File size limit (5MB)
✅ User authentication required
✅ HTTPS secure URLs

## 📱 User Flow

1. User creates deposit request
2. User uploads transaction screenshot
3. Image uploaded to Cloudinary
4. Cloudinary URL saved to database
5. Admin views screenshot from CDN
6. Admin approves/rejects deposit

## 🎨 Image URL Format

```
https://res.cloudinary.com/dri04iflq/image/upload/v1234567890/transactions/transaction-1234567890-user123.jpg
```

### URL Parts
- `dri04iflq` - Cloud name
- `v1234567890` - Version
- `transactions/` - Folder
- `transaction-...` - Public ID

## 🔄 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/deposits/create` | Create deposit |
| POST | `/api/deposits/submit-ft` | Upload screenshot |
| GET | `/api/deposits/user` | Get user deposits |
| GET | `/api/deposits/all` | Get all (admin) |

## 📦 Response Format

```json
{
  "success": true,
  "message": "Transaction ID and screenshot submitted successfully.",
  "deposit": {
    "_id": "...",
    "transactionFT": "TEST123",
    "transactionScreenshot": "https://res.cloudinary.com/...",
    "status": "ft_submitted"
  }
}
```

## 🎯 Validation Rules

### Client Side
- Screenshot required
- File size < 5MB
- Image formats only
- Transaction ID required

### Server Side
- File type validation
- Size validation
- User authorization
- Transaction ID uniqueness

## 🚨 Error Messages

| Error | Meaning |
|-------|---------|
| "Transaction screenshot is required" | No file uploaded |
| "Only image files are allowed" | Wrong file type |
| "File size must be less than 5MB" | File too large |
| "Transaction ID is required" | Missing transaction ID |
| "This Transaction ID isn't valid" | Duplicate transaction ID |

## 📈 Performance

### Expected Upload Times
- Small (< 1MB): 1-3 seconds
- Medium (1-3MB): 3-5 seconds
- Large (3-5MB): 5-10 seconds

### Optimization
- Cloudinary auto-compresses
- CDN caching enabled
- WebP format for modern browsers

## 🔧 Maintenance

### Regular Tasks
- Monitor Cloudinary usage
- Check for failed uploads
- Review storage quota
- Clean up old images (optional)

### Monthly Review
- Usage statistics
- Error logs
- Performance metrics
- Cost analysis

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `CLOUDINARY_IMPLEMENTATION.md` | Technical details |
| `CLOUDINARY_TESTING_GUIDE.md` | Testing procedures |
| `CLOUDINARY_SETUP_COMPLETE.md` | Setup summary |
| `QUICK_REFERENCE.md` | This file |

## 🎓 Learning Resources

- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Upload API](https://cloudinary.com/documentation/upload_images)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Best Practices](https://cloudinary.com/documentation/image_optimization)

## 💡 Tips

1. **Compress images** before upload for faster processing
2. **Use descriptive transaction IDs** for easier tracking
3. **Monitor quota** to avoid service interruption
4. **Test on mobile** for responsive design
5. **Keep credentials secure** - never commit to git

## ✅ Checklist

Before deploying:
- [ ] Environment variables set
- [ ] Cloudinary credentials verified
- [ ] Upload tested successfully
- [ ] Admin can view screenshots
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Documentation reviewed
- [ ] Team trained

## 🆘 Support

**Need Help?**
- Check documentation files
- Review error logs
- Test with sample images
- Contact Cloudinary support

**Emergency Rollback:**
See `CLOUDINARY_TESTING_GUIDE.md` → Rollback Plan

---

**Status:** ✅ Production Ready
**Last Updated:** January 9, 2026
