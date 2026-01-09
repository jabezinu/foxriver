const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    level: {
        type: String,
        required: true,
        unique: true,
        enum: ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10']
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    canWithdraw: {
        type: Boolean,
        required: true,
        default: false
    },
    canUseTransactionPassword: {
        type: Boolean,
        required: true,
        default: false
    },
    order: {
        type: Number,
        required: true
    },
    hidden: {
        type: Boolean,
        default: false
    },
    // Rank progression restriction settings (stored in a single document, e.g., Intern)
    restrictedRangeStart: {
        type: Number,
        default: null
    },
    restrictedRangeEnd: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

// Calculate daily income: price / 30 (except Intern)
membershipSchema.methods.getDailyIncome = function () {
    if (this.level === 'Intern') return 50;
    return this.price / 30;
};

// Calculate per video income: daily income / 5
membershipSchema.methods.getPerVideoIncome = function () {
    if (this.level === 'Intern') return 10;
    return this.getDailyIncome() / 5;
};

// Calculate 4-day income
membershipSchema.methods.getFourDayIncome = function () {
    return this.getDailyIncome() * 4;
};

// Static method to get restricted rank range
membershipSchema.statics.getRestrictedRange = async function () {
    // Store the restriction in the Intern membership document
    const internMembership = await this.findOne({ level: 'Intern' });
    if (!internMembership || !internMembership.restrictedRangeStart || !internMembership.restrictedRangeEnd) {
        return null;
    }
    return {
        start: internMembership.restrictedRangeStart,
        end: internMembership.restrictedRangeEnd
    };
};

// Static method to check if rank progression is allowed
membershipSchema.statics.isProgressionAllowed = async function (currentLevel, targetLevel) {
    const restrictedRange = await this.getRestrictedRange();
    
    // Extract rank numbers from level strings
    const getCurrentRank = (level) => {
        if (level === 'Intern') return 0;
        const match = level.match(/Rank (\d+)/);
        return match ? parseInt(match[1]) : 0;
    };
    
    const currentRank = getCurrentRank(currentLevel);
    const targetRank = getCurrentRank(targetLevel);
    
    // Can't downgrade
    if (targetRank <= currentRank) {
        return { allowed: false, reason: 'Can only upgrade to a higher membership level' };
    }
    
    // If no restriction is set, allow any progression
    if (!restrictedRange) {
        return { allowed: true };
    }
    
    const { start, end } = restrictedRange;
    
    // Check if current rank is within or just before the restricted range
    // and target rank is within the restricted range
    if (currentRank >= start - 1 && currentRank < end && targetRank >= start && targetRank <= end) {
        // Within restricted range, must progress sequentially
        if (targetRank !== currentRank + 1) {
            return { 
                allowed: false, 
                reason: `Sequential progression is required from Rank ${start} to Rank ${end}. You must join Rank ${currentRank + 1} next.` 
            };
        }
    }
    
    // Check if trying to skip into the restricted range
    if (currentRank < start && targetRank >= start && targetRank <= end) {
        // Can only enter at the start of the restricted range
        if (targetRank !== start) {
            return { 
                allowed: false, 
                reason: `You can only enter the restricted range at Rank ${start}. Cannot skip to Rank ${targetRank}.` 
            };
        }
    }
    
    return { allowed: true };
};

module.exports = mongoose.model('Membership', membershipSchema);
