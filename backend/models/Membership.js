const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Membership extends Model {
    // Calculate daily income: price / 30 (except Intern)
    getDailyIncome() {
        if (this.level === 'Intern') return 50;
        return this.price / 30;
    }

    // Calculate per video income: daily income / 4
    getPerVideoIncome() {
        if (this.level === 'Intern') return 12.5;
        return this.getDailyIncome() / 4;
    }

    // Calculate 4-day income
    getFourDayIncome() {
        return this.getDailyIncome() * 4;
    }

    // Static method to get restricted rank range
    static async getRestrictedRange() {
        const internMembership = await this.findOne({ where: { level: 'Intern' } });
        if (!internMembership || !internMembership.restrictedRangeStart || !internMembership.restrictedRangeEnd) {
            return null;
        }
        return {
            start: internMembership.restrictedRangeStart,
            end: internMembership.restrictedRangeEnd
        };
    }

    // Static method to check if rank progression is allowed
    static async isProgressionAllowed(currentLevel, targetLevel) {
        const restrictedRange = await this.getRestrictedRange();

        const getCurrentRank = (level) => {
            if (level === 'Intern') return 0;
            const match = level.match(/Rank (\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const currentRank = getCurrentRank(currentLevel);
        const targetRank = getCurrentRank(targetLevel);

        if (targetRank <= currentRank) {
            return { allowed: false, reason: 'Can only upgrade to a higher membership level' };
        }

        if (!restrictedRange) {
            return { allowed: true };
        }

        const { start, end } = restrictedRange;

        if (currentRank >= start - 1 && currentRank < end && targetRank >= start && targetRank <= end) {
            if (targetRank !== currentRank + 1) {
                return {
                    allowed: false,
                    reason: `Sequential progression is required from Rank ${start} to Rank ${end}. You must join Rank ${currentRank + 1} next.`
                };
            }
        }

        if (currentRank < start && targetRank >= start && targetRank <= end) {
            if (targetRank !== start) {
                return {
                    allowed: false,
                    reason: `You can only enter the restricted range at Rank ${start}. Cannot skip to Rank ${targetRank}.`
                };
            }
        }

        return { allowed: true };
    }
}

Membership.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    level: {
        type: DataTypes.ENUM('Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'),
        allowNull: false,
        unique: true
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    canWithdraw: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    canUseTransactionPassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    restrictedRangeStart: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    restrictedRangeEnd: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Membership',
    tableName: 'memberships'
});

module.exports = Membership;
