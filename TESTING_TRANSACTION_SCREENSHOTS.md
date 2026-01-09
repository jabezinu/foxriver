# Testing Guide: Transaction Screenshot Feature

## Quick Test Steps

### 1. Backend Setup
```bash
# Ensure the uploads directory exists
cd backend
mkdir -p uploads/transactions

# Start the backend server
npm start
```

### 2. Client Testing

#### Test Deposit Flow
1. Navigate to the deposit page
2. Select an amount (e.g., 3300 ETB)
3. Select a payment method
4. Click "Continue to Payment"
5. Enter a transaction ID (e.g., "TEST123456")
6. **Upload a screenshot:**
   - Click the upload area
   - Select an image file (PNG, JPG, etc.)
   - Verify preview appears
   - Try removing and re-uploading
7. Click "Submit Payment"
8. Verify success message appears

#### Test Validation
1. Try submitting without screenshot → Should show error
2. Try uploading file > 5MB → Should show error
3. Try uploading non-image file → Should show error
4. Try submitting without transaction ID → Should show error

### 3. Admin Panel Testing

#### View Screenshots
1. Login to admin panel
2. Navigate to Deposits page
3. Filter by "Pending" status
4. Find a deposit with screenshot
5. Click "View" button next to screenshot
6. Verify modal opens with full-size image
7. Click outside modal to close

#### Approve/Reject Flow
1. Review transaction ID and screenshot
2. Verify they match
3. Approve or reject as needed
4. Verify deposit status updates

## Test Cases

### Positive Tests
- ✅ Upload valid image (PNG)
- ✅ Upload valid image (JPG)
- ✅ Upload valid image (GIF)
- ✅ Upload valid image (WEBP)
- ✅ Submit with both transaction ID and screenshot
- ✅ View screenshot in admin panel
- ✅ Approve deposit with screenshot
- ✅ Reject deposit with screenshot

### Negative Tests
- ✅ Submit without screenshot → Error
- ✅ Submit without transaction ID → Error
- ✅ Upload file > 5MB → Error
- ✅ Upload non-image file → Error
- ✅ Submit duplicate transaction ID → Error
- ✅ Submit for another user's deposit → Error

### Edge Cases
- ✅ Legacy deposits without screenshots display "Not uploaded"
- ✅ Screenshot preview updates when changing file
- ✅ Remove screenshot and re-upload works
- ✅ Modal closes on outside click
- ✅ Large images display correctly in modal

## API Testing with Postman/cURL

### Submit Transaction with Screenshot
```bash
curl -X POST http://localhost:5000/api/deposits/submit-ft \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "depositId=DEPOSIT_ID" \
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
    "transactionScreenshot": "/uploads/transactions/transaction-1234567890.jpg",
    "status": "ft_submitted"
  }
}
```

## Common Issues & Solutions

### Issue: "Transaction screenshot is required"
**Solution:** Ensure you're sending the file with field name "screenshot"

### Issue: "Only image files are allowed"
**Solution:** Upload PNG, JPG, GIF, or WEBP files only

### Issue: File size error
**Solution:** Compress image to under 5MB

### Issue: Screenshot not displaying in admin
**Solution:** 
- Check file was saved to `backend/uploads/transactions/`
- Verify `transactionScreenshot` field in database
- Ensure backend serves static files from `/uploads`

### Issue: Preview not showing
**Solution:** Check browser console for errors, verify file is valid image

## Database Verification

### Check Screenshot URL in Database
```javascript
// MongoDB query
db.deposits.find({ transactionScreenshot: { $exists: true } })

// Should return deposits with screenshot URLs like:
// "/uploads/transactions/transaction-1234567890.jpg"
```

## File System Verification

### Check Uploaded Files
```bash
# List uploaded screenshots
ls -la backend/uploads/transactions/

# Should show files like:
# transaction-1234567890.jpg
# transaction-1234567891.png
```

## Performance Testing

1. Upload multiple screenshots in quick succession
2. Verify all save correctly
3. Check file naming doesn't conflict (timestamp-based)
4. Verify database updates for each

## Security Testing

1. Try uploading executable files → Should reject
2. Try uploading very large files → Should reject
3. Try accessing another user's deposit → Should reject
4. Try SQL injection in transaction ID → Should sanitize
5. Try XSS in transaction ID → Should sanitize

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Testing

- ✅ File input is keyboard accessible
- ✅ Error messages are clear and visible
- ✅ Upload button has proper labels
- ✅ Modal can be closed with Escape key

## Success Criteria

✅ Users cannot submit transaction ID without screenshot
✅ Screenshots upload successfully to server
✅ Screenshots display in admin panel
✅ File validation works correctly
✅ Error messages are clear and helpful
✅ UI is intuitive and user-friendly
✅ No breaking changes to existing functionality

## Rollback Plan

If issues occur:
1. Revert changes to `backend/controllers/depositController.js`
2. Revert changes to `backend/models/Deposit.js`
3. Revert changes to `client/src/pages/Deposit.jsx`
4. Revert changes to `client/src/services/api.js`
5. Revert changes to `admin/src/pages/Deposits.jsx`
6. Restart backend and frontend servers
