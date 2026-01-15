# Controller Migration Guide - Mongoose to Sequelize

## Test Results Summary

**Total Routes Tested**: 38  
**Passed**: 7 (18%)  
**Failed**: 31 (82%)

---

## Common Errors Found

### 1. `User.findById is not a function`
**Files Affected**: userController, taskController, videoTaskController

**Fix**:
```javascript
// ❌ Mongoose
User.findById(id)

// ✅ Sequelize
User.findByPk(id)
```

### 2. `Model.find is not a function`
**Files Affected**: All controllers

**Fix**:
```javascript
// ❌ Mongoose
Model.find({ field: value })
Model.find({}).sort({ createdAt: -1 })

// ✅ Sequelize
Model.findAll({ where: { field: value } })
Model.findAll({ order: [['createdAt', 'DESC']] })
```

### 3. `.sort() is not a function`
**Files Affected**: newsController

**Fix**:
```javascript
// ❌ Mongoose
Model.findOne({ field: value }).sort({ createdAt: -1 })

// ✅ Sequelize
Model.findOne({ 
    where: { field: value },
    order: [['createdAt', 'DESC']]
})
```

### 4. `.populate() is not a function`
**Fix**:
```javascript
// ❌ Mongoose
Model.find().populate('user')

// ✅ Sequelize
Model.findAll({ include: [{ model: User, as: 'user' }] })
```

### 5. `.lean() is not a function`
**Fix**:
```javascript
// ❌ Mongoose
Model.find().lean()

// ✅ Sequelize
Model.findAll({ raw: true })
// OR
const result = await Model.findAll();
return result.map(r => r.toJSON());
```

---

## Controllers That Need Fixing

### ✅ Working (7)
1. authController.js - FIXED
2. auth middleware - FIXED
3. systemSettingsController.js (partial)
4. membershipController.js (getRestrictedRange only)
5. videoTaskController.js (getVideoTaskStats only)
6. referralController.js (getMonthlySalary only)
7. Health check endpoint

### ❌ Need Fixing (31 endpoints across 18 controllers)

1. **userController.js** - 5 endpoints
   - getProfile
   - getWalletBalance
   - getReferralLink
   - updateProfile
   - setBankAccount

2. **membershipController.js** - 6 endpoints
   - getTiers
   - getAllTiers
   - upgradeMembership
   - hideMembershipsByRange
   - updateMembershipPrice
   - bulkUpdatePrices

3. **depositController.js** - 4 endpoints
   - getUserDeposits
   - getAllDeposits
   - approveDeposit
   - rejectDeposit

4. **withdrawalController.js** - 4 endpoints
   - getUserWithdrawals
   - getAllWithdrawals
   - approveWithdrawal
   - rejectWithdrawal

5. **taskController.js** - 5 endpoints
   - getDailyTasks
   - getAllTasks
   - completeTask
   - getPlaylists
   - addPlaylist

6. **videoTaskController.js** - 2 endpoints
   - getDailyVideoTasks
   - completeVideoTask

7. **referralController.js** - 2 endpoints
   - getDownline
   - getCommissions

8. **messageController.js** - 1 endpoint
   - getUserMessages

9. **newsController.js** - 2 endpoints
   - getNews
   - getPopupNews

10. **wealthController.js** - 4 endpoints
    - getWealthFunds
    - getMyInvestments
    - getAllWealthFunds
    - getAllInvestments

11. **spinController.js** - 2 endpoints
    - getUserSpinHistory
    - getAllSpinResults

12. **slotTierController.js** - 2 endpoints
    - getSlotTiers
    - getAllSlotTiers

13. **qnaController.js** - 1 endpoint
    - getQnA

14. **courseController.js** - 1 endpoint
    - getCourseCategories

15. **bankController.js** - Routes not found (need to check)

16. **chatController.js** - Not tested yet

17. **adminController.js** - Not tested yet

---

## Quick Reference: Mongoose → Sequelize

| Mongoose | Sequelize |
|----------|-----------|
| `findById(id)` | `findByPk(id)` |
| `find()` | `findAll()` |
| `findOne()` | `findOne()` |
| `create()` | `create()` |
| `findByIdAndUpdate()` | `update()` or `instance.save()` |
| `findByIdAndDelete()` | `destroy()` |
| `countDocuments()` | `count()` |
| `insertMany()` | `bulkCreate()` |
| `.select('field')` | `{ attributes: ['field'] }` |
| `.select('-field')` | `{ attributes: { exclude: ['field'] } }` |
| `.populate('ref')` | `{ include: [Model] }` |
| `.sort({ field: -1 })` | `{ order: [['field', 'DESC']] }` |
| `.limit(10)` | `{ limit: 10 }` |
| `.skip(10)` | `{ offset: 10 }` |
| `.lean()` | `{ raw: true }` or `.toJSON()` |
| `{ $in: [1,2,3] }` | `{ [Op.in]: [1,2,3] }` |
| `{ $gt: 5 }` | `{ [Op.gt]: 5 }` |
| `{ $lt: 5 }` | `{ [Op.lt]: 5 }` |
| `{ $gte: 5 }` | `{ [Op.gte]: 5 }` |
| `{ $lte: 5 }` | `{ [Op.lte]: 5 }` |
| `{ $ne: 5 }` | `{ [Op.ne]: 5 }` |
| `{ $or: [...] }` | `{ [Op.or]: [...] }` |
| `{ $and: [...] }` | `{ [Op.and]: [...] }` |
| `_id` | `id` |

---

## Priority Order for Fixing

### High Priority (User-facing features)
1. userController.js
2. membershipController.js
3. depositController.js
4. withdrawalController.js
5. videoTaskController.js

### Medium Priority (Core features)
6. taskController.js
7. referralController.js
8. wealthController.js
9. newsController.js
10. messageController.js

### Low Priority (Admin/Extra features)
11. spinController.js
12. slotTierController.js
13. qnaController.js
14. courseController.js
15. bankController.js
16. chatController.js

---

## Next Steps

1. Fix controllers one by one starting with high priority
2. Test each controller after fixing
3. Update the test script to track progress
4. Document any special cases or complex migrations

---

**Created**: January 15, 2026  
**Status**: Migration in progress
