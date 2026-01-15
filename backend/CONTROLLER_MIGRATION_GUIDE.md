# Controller Migration Guide: Mongoose → Sequelize

**Status**: 2 of 19 controllers migrated  
**Date**: January 15, 2026

---

## Migration Status

### ✅ Completed (2/19)
1. **authController.js** - Login, Register, Verify
2. **middlewares/auth.js** - Token verification

### ⏳ Pending (17/19)
1. adminController.js
2. bankController.js
3. chatController.js
4. courseController.js
5. depositController.js
6. membershipController.js
7. messageController.js
8. newsController.js
9. qnaController.js
10. referralController.js
11. slotTierController.js
12. spinController.js
13. systemSettingsController.js
14. taskController.js
15. userController.js
16. videoTaskController.js
17. wealthController.js
18. withdrawalController.js

---

## Common Mongoose → Sequelize Conversions

### 1. Finding Records

#### By ID
```javascript
// ❌ Mongoose
User.findById(id)
User.findById(id).select('-password')

// ✅ Sequelize
User.findByPk(id)
User.findByPk(id, { attributes: { exclude: ['password'] } })
```

#### By Criteria
```javascript
// ❌ Mongoose
User.findOne({ phone: '+251...' })
User.find({ role: 'user' })
User.find({ status: 'active' }).sort({ createdAt: -1 })

// ✅ Sequelize
User.findOne({ where: { phone: '+251...' } })
User.findAll({ where: { role: 'user' } })
User.findAll({ 
    where: { status: 'active' },
    order: [['createdAt', 'DESC']]
})
```

### 2. Field Selection

```javascript
// ❌ Mongoose
User.findById(id).select('phone role')
User.findById(id).select('-password -transactionPassword')
User.findById(id).select('+password') // Include hidden field

// ✅ Sequelize
User.findByPk(id, { attributes: ['phone', 'role'] })
User.findByPk(id, { attributes: { exclude: ['password', 'transactionPassword'] } })
User.findByPk(id) // All fields included by default
```

### 3. Populate (Joins)

```javascript
// ❌ Mongoose
User.findById(id).populate('referrerId', 'phone membershipLevel')
Deposit.find().populate('user', 'phone').populate('approvedBy', 'phone')

// ✅ Sequelize
User.findByPk(id, {
    include: [{
        model: User,
        as: 'referrer',
        attributes: ['phone', 'membershipLevel']
    }]
})

Deposit.findAll({
    include: [
        { model: User, as: 'user', attributes: ['phone'] },
        { model: User, as: 'approvedBy', attributes: ['phone'] }
    ]
})
```

### 4. Counting

```javascript
// ❌ Mongoose
User.countDocuments({ role: 'user' })

// ✅ Sequelize
User.count({ where: { role: 'user' } })
```

### 5. Operators

```javascript
// ❌ Mongoose
User.find({ referrerId: { $in: ids } })
User.find({ createdAt: { $gte: today, $lt: tomorrow } })
User.find({ $or: [{ status: 'active' }, { status: 'pending' }] })

// ✅ Sequelize
const { Op } = require('sequelize');

User.findAll({ where: { referrerId: { [Op.in]: ids } } })
User.findAll({ where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } } })
User.findAll({ where: { [Op.or]: [{ status: 'active' }, { status: 'pending' }] } })
```

### 6. Increment/Decrement

```javascript
// ❌ Mongoose
User.findByIdAndUpdate(id, { $inc: { incomeWallet: amount } })

// ✅ Sequelize
const user = await User.findByPk(id);
user.incomeWallet = parseFloat(user.incomeWallet) + amount;
await user.save();

// OR
await User.increment('incomeWallet', { by: amount, where: { id } });
```

### 7. Update Operations

```javascript
// ❌ Mongoose
User.findByIdAndUpdate(id, { name: 'New Name' }, { new: true })
User.updateMany({ role: 'user' }, { $set: { isActive: true } })

// ✅ Sequelize
const user = await User.findByPk(id);
user.name = 'New Name';
await user.save();
// OR
await User.update({ name: 'New Name' }, { where: { id } });

await User.update({ isActive: true }, { where: { role: 'user' } });
```

### 8. Delete Operations

```javascript
// ❌ Mongoose
User.findByIdAndDelete(id)
User.deleteMany({ role: 'user' })

// ✅ Sequelize
await User.destroy({ where: { id } });
await User.destroy({ where: { role: 'user' } });
```

### 9. Bulk Create

```javascript
// ❌ Mongoose
Commission.insertMany(commissions)

// ✅ Sequelize
Commission.bulkCreate(commissions)
```

### 10. Sorting

```javascript
// ❌ Mongoose
User.find().sort({ createdAt: -1 })
User.find().sort({ order: 1, createdAt: -1 })

// ✅ Sequelize
User.findAll({ order: [['createdAt', 'DESC']] })
User.findAll({ order: [['order', 'ASC'], ['createdAt', 'DESC']] })
```

### 11. Pagination

```javascript
// ❌ Mongoose
User.find().skip(skip).limit(limit)

// ✅ Sequelize
User.findAll({ offset: skip, limit: limit })
```

### 12. Distinct

```javascript
// ❌ Mongoose
TaskCompletion.find({ user: userId }).distinct('task')

// ✅ Sequelize
const completions = await TaskCompletion.findAll({
    where: { user: userId },
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('task')), 'task']],
    raw: true
});
const taskIds = completions.map(c => c.task);
```

### 13. Aggregation

```javascript
// ❌ Mongoose
Deposit.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
])

// ✅ Sequelize
const result = await Deposit.findOne({
    where: { status: 'approved' },
    attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
    raw: true
});
```

---

## ID Field Changes

**Important**: MongoDB uses `_id`, MySQL uses `id`

```javascript
// ❌ Mongoose
user._id
req.user._id
{ referrerId: user._id }

// ✅ Sequelize
user.id
req.user.id
{ referrerId: user.id }
```

---

## Model Instance Methods

Both Mongoose and Sequelize support instance methods, but access differs:

```javascript
// ❌ Mongoose (returns plain object with .lean())
const user = await User.findById(id).lean();
// user is plain object, no methods

// ✅ Sequelize (returns model instance)
const user = await User.findByPk(id);
// user has methods like .save(), .destroy()
// Convert to plain object: user.toJSON()
```

---

## Controllers Requiring Most Work

### High Priority (User-Facing)
1. **userController.js** - Profile, wallet, bank account
2. **taskController.js** - Daily tasks
3. **videoTaskController.js** - Video assignments
4. **depositController.js** - Deposits
5. **withdrawalController.js** - Withdrawals
6. **membershipController.js** - Membership upgrades
7. **wealthController.js** - Investments

### Medium Priority
8. **referralController.js** - Team/referrals
9. **messageController.js** - Messages
10. **newsController.js** - News
11. **courseController.js** - Courses
12. **spinController.js** - Slot machine

### Low Priority (Admin)
13. **adminController.js** - Admin dashboard
14. **chatController.js** - Chat system
15. **bankController.js** - Bank accounts
16. **qnaController.js** - Q&A
17. **slotTierController.js** - Slot tiers
18. **systemSettingsController.js** - Settings

---

## Testing Checklist

After migrating each controller:

- [ ] Test all endpoints with Postman/curl
- [ ] Check error handling
- [ ] Verify data is returned correctly
- [ ] Test with invalid data
- [ ] Check permissions/auth
- [ ] Verify database changes persist

---

## Common Pitfalls

### 1. Forgetting `where` clause
```javascript
// ❌ Wrong
User.findOne({ phone })

// ✅ Correct
User.findOne({ where: { phone } })
```

### 2. Using `_id` instead of `id`
```javascript
// ❌ Wrong
user._id

// ✅ Correct
user.id
```

### 3. Not converting Sequelize instances
```javascript
// ❌ May cause issues
const user = await User.findByPk(id);
res.json({ user }); // Sends Sequelize instance

// ✅ Better
const user = await User.findByPk(id);
res.json({ user: user.toJSON() });

// ✅ Or use raw
const user = await User.findByPk(id, { raw: true });
res.json({ user });
```

### 4. Populate without defining associations
```javascript
// ❌ Won't work without associations
Deposit.findAll({ include: [{ model: User }] })

// ✅ Need to define in models/index.js
Deposit.belongsTo(User, { foreignKey: 'user', as: 'user' });
```

---

## Next Steps

1. Start with high-priority user-facing controllers
2. Test each controller thoroughly after migration
3. Update one controller at a time
4. Keep this guide handy for reference

---

**Last Updated**: January 15, 2026  
**Maintained By**: Development Team
