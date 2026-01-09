# Cloudinary Testing Guide

## Quick Start

### 1. Verify Environment Setup
```bash
cd backend
cat .env | grep CLOUDINARY
```

Expected output:
```
CLOUDINARY_CLOUD_NAME=dri04iflq
CLOUDINARY_API_KEY=265833691256595
CLOUDINARY_API_SECRET=_o-_u9uliTngb2CTqkfJssP_mU4
```

### 2. Start Backend Server
```bash
cd backend
npm start
```

Verify Cloudinary configuration loads without errors.

### 3. Test Upload Flow

#### Client Side Test
1. Navigate to deposit page
2. Select amount and payment method
3. Click "Continue to Payment"
4. Enter transaction ID: `TEST123456`
5. Upload a screenshot (any image file)
6. Click "Submit Payment"
7. Wait for success message

#### Expected Result
- Success message: "Transaction submitted! Awaiting approval."
- Redirect to home page
- No errors in console

### 4. Verify Cloudinary Upload

#### Check Cloudinary Dashboard
1. Go to: https://cloudinary.com/console
2. Login with credentials
3. Navigate to Media Library
4. Open `transactions` folder
5. Verify new image appears

#### Check Database
```javascript
// MongoDB query
db.deposits.findOne({ transactionFT: "TEST123456" })
```

Expected `transactionScreenshot` field:
```
"https://res.cloudinary.com/dri04iflq/image/upload/v1234567890/transactions/transaction-1234567890-user123.jpg"
```

### 5. Test Admin View

#### Admin Panel Test
1. Login to admin panel
2. Navigate to Deposits page
3. Filter by "Pending"
4. Find the test deposit
5. Click "View" button next to screenshot
6. Verify modal opens with image

#### Expected Result
- Modal displays full-size image
- Image loads from Cloudinary CDN
- Image is clear and properly sized
- Modal closes on outside click

## Detailed Test Cases

### Test Case 1: Valid Image Upload
**Steps:**
1. Upload PNG image (< 5MB)
2. Submit form

**Expected:**
- ✅ Upload succeeds
- ✅ Cloudinary URL saved to database
- ✅ Image visible in admin panel

### Test Case 2: Large File Rejection
**Steps:**
1. Upload image > 5MB
2. Submit form

**Expected:**
- ❌ Error: "File size must be less than 5MB"
- ❌ Upload rejected

### Test Case 3: Invalid File Type
**Steps:**
1. Upload PDF or text file
2. Submit form

**Expected:**
- ❌ Error: "Only image files are allowed"
- ❌ Upload rejected

### Test Case 4: Missing Screenshot
**Steps:**
1. Enter transaction ID
2. Don't upload screenshot
3. Submit form

**Expected:**
- ❌ Error: "Please upload transaction screenshot"
- ❌ Form not submitted

### Test Case 5: Multiple Uploads
**Steps:**
1. Upload first screenshot
2. Remove it
3. Upload different screenshot
4. Submit form

**Expected:**
- ✅ Second screenshot uploaded
- ✅ First screenshot not uploaded to Cloudinary
- ✅ Only final screenshot saved

### Test Case 6: Concurrent Uploads
**Steps:**
1. Open two browser tabs
2. Create two deposits simultaneously
3. Upload different screenshots
4. Submit both

**Expected:**
- ✅ Both uploads succeed
- ✅ Unique filenames (no conflicts)
- ✅ Both visible in admin panel

## API Testing

### Using cURL
```bash
# Get auth token first
TOKEN="your_jwt_token"

# Upload screenshot
curl -X POST http://localhost:5002/api/deposits/submit-ft \
  -H "Authorization: Bearer $TOKEN" \
  -F "depositId=DEPOSIT_ID_HERE" \
  -F "transactionFT=TEST123456" \
  -F "screenshot=@/path/to/image.jpg"
```

### Expected Response
```json
{
  "success": true,
  "message": "Transaction ID and screenshot submitted successfully. Awaiting admin approval.",
  "deposit": {
    "_id": "...",
    "transactionFT": "TEST123456",
    "transactionScreenshot": "https://res.cloudinary.com/dri04iflq/image/upload/v.../transactions/transaction-....jpg",
    "status": "ft_submitted"
  }
}
```

### Using Postman
1. Create POST request to `/api/deposits/submit-ft`
2. Set Authorization header with Bearer token
3. Set Body type to `form-data`
4. Add fields:
   - `depositId`: (text)
   - `transactionFT`: (text)
   - `screenshot`: (file)
5. Send request

## Performance Testing

### Upload Speed Test
```javascript
// Measure upload time
const start = Date.now();
// Upload image
const end = Date.now();
console.log(`Upload took: ${end - start}ms`);
```

**Expected:**
- Small images (< 1MB): 1-3 seconds
- Medium images (1-3MB): 3-5 seconds
- Large images (3-5MB): 5-10 seconds

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create test config
artillery quick --count 10 --num 5 http://localhost:5002/api/deposits/submit-ft
```

## Error Scenarios

### Scenario 1: Cloudinary Down
**Simulate:** Temporarily change API credentials
**Expected:** Error message, upload fails gracefully

### Scenario 2: Network Timeout
**Simulate:** Slow network connection
**Expected:** Loading indicator, eventual timeout error

### Scenario 3: Invalid Credentials
**Simulate:** Wrong CLOUDINARY_API_KEY
**Expected:** Server error, clear error message

### Scenario 4: Quota Exceeded
**Simulate:** Reach Cloudinary free tier limit
**Expected:** Error from Cloudinary, handled gracefully

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Security Testing

### Test 1: Unauthorized Upload
**Steps:**
1. Remove auth token
2. Try to upload

**Expected:**
- ❌ 401 Unauthorized error

### Test 2: Upload for Another User
**Steps:**
1. User A creates deposit
2. User B tries to submit screenshot for User A's deposit

**Expected:**
- ❌ 403 Forbidden error

### Test 3: SQL Injection
**Steps:**
1. Enter `'; DROP TABLE deposits; --` as transaction ID

**Expected:**
- ✅ Sanitized, no SQL injection

### Test 4: XSS Attack
**Steps:**
1. Enter `<script>alert('xss')</script>` as transaction ID

**Expected:**
- ✅ Escaped, no script execution

## Monitoring

### Check Cloudinary Usage
1. Login to Cloudinary dashboard
2. Navigate to Dashboard > Usage
3. Monitor:
   - Storage used
   - Bandwidth consumed
   - Transformations used
   - API calls

### Check Server Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Look for:
# - Upload success messages
# - Cloudinary errors
# - Performance metrics
```

### Database Monitoring
```javascript
// Count deposits with Cloudinary URLs
db.deposits.countDocuments({ 
    transactionScreenshot: { $regex: '^https://res.cloudinary.com' } 
})

// Count deposits with local URLs (legacy)
db.deposits.countDocuments({ 
    transactionScreenshot: { $regex: '^/uploads/' } 
})
```

## Rollback Plan

If Cloudinary integration fails:

### Step 1: Revert Code
```bash
git revert HEAD
```

### Step 2: Restore Local Storage
```javascript
// In depositController.js
const storage = multer.diskStorage({
    destination: 'uploads/transactions',
    filename: (req, file, cb) => {
        cb(null, `transaction-${Date.now()}${path.extname(file.originalname)}`);
    }
});
```

### Step 3: Update Admin Panel
```javascript
// In admin Deposits.jsx
<img src={`${API_URL}${viewScreenshot}`} />
```

### Step 4: Restart Services
```bash
npm restart
```

## Success Criteria

✅ Images upload to Cloudinary successfully
✅ Cloudinary URLs saved to database
✅ Images display in admin panel
✅ No local file storage used
✅ Error handling works correctly
✅ Performance is acceptable (< 10s uploads)
✅ Security validations pass
✅ Browser compatibility confirmed

## Troubleshooting

### Issue: "Invalid signature"
**Cause:** Wrong API secret
**Fix:** Verify CLOUDINARY_API_SECRET in .env

### Issue: "Upload failed"
**Cause:** Network issues or Cloudinary down
**Fix:** Check internet connection, verify Cloudinary status

### Issue: Image not displaying
**Cause:** CORS or URL issues
**Fix:** Verify URL format, check browser console

### Issue: Slow uploads
**Cause:** Large file size or slow connection
**Fix:** Compress images, check network speed

## Next Steps

After successful testing:
1. ✅ Deploy to staging environment
2. ✅ Test with real users
3. ✅ Monitor Cloudinary usage
4. ✅ Set up alerts for quota limits
5. ✅ Document for team
6. ✅ Deploy to production

## Support Contacts

- Cloudinary Support: https://support.cloudinary.com
- Documentation: https://cloudinary.com/documentation
- Status Page: https://status.cloudinary.com
