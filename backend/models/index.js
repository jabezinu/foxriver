const { sequelize } = require('../config/database');
const { addMongoCompatibility } = require('../utils/modelHelpers');

// Import all models
const User = require('./User');
const Membership = require('./Membership');
const Task = require('./Task');
const TaskCompletion = require('./TaskCompletion');
const Course = require('./Course');
const CourseCategory = require('./CourseCategory');
const DailyVideoAssignment = require('./DailyVideoAssignment');
const VideoPool = require('./VideoPool');
const Playlist = require('./Playlist');
const SystemSetting = require('./SystemSetting');
const Commission = require('./Commission');
const Salary = require('./Salary');
const Deposit = require('./Deposit');
const Withdrawal = require('./Withdrawal');
const BankAccount = require('./BankAccount');
const WealthFund = require('./WealthFund');
const WealthInvestment = require('./WealthInvestment');
const SpinResult = require('./SpinResult');
const SlotTier = require('./SlotTier');
const News = require('./News');
const Chat = require('./Chat');
const ChatMessage = require('./ChatMessage');
const RankUpgradeRequest = require('./RankUpgradeRequest');

// Define associations
// User associations
User.hasMany(TaskCompletion, { foreignKey: 'user', as: 'taskCompletions' });
User.hasMany(Commission, { foreignKey: 'user', as: 'commissions' });
User.hasMany(Salary, { foreignKey: 'user', as: 'salaries' });
User.hasMany(Deposit, { foreignKey: 'user', as: 'deposits' });
User.hasMany(Withdrawal, { foreignKey: 'user', as: 'withdrawals' });
User.hasMany(WealthInvestment, { foreignKey: 'user', as: 'investments' });
User.hasMany(SpinResult, { foreignKey: 'user', as: 'spinResults' });
User.hasMany(DailyVideoAssignment, { foreignKey: 'user', as: 'videoAssignments' });
User.hasMany(RankUpgradeRequest, { foreignKey: 'user', as: 'rankUpgradeRequests' });
User.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
User.hasMany(User, { foreignKey: 'referrerId', as: 'referrals' });
User.hasOne(Chat, { foreignKey: 'user', as: 'chat' });

// Task associations
Task.hasMany(TaskCompletion, { foreignKey: 'task', as: 'completions' });
Task.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// TaskCompletion associations
TaskCompletion.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });
TaskCompletion.belongsTo(Task, { foreignKey: 'task', as: 'taskDetails' });
TaskCompletion.hasMany(Commission, { foreignKey: 'sourceTask', as: 'commissions' });

// Course associations
Course.belongsTo(CourseCategory, { foreignKey: 'category', as: 'categoryDetails' });
CourseCategory.hasMany(Course, { foreignKey: 'category', as: 'courses' });

// Playlist and VideoPool associations
Playlist.hasMany(VideoPool, { foreignKey: 'playlist', as: 'videos' });
Playlist.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });
VideoPool.belongsTo(Playlist, { foreignKey: 'playlist', as: 'playlistDetails' });

// Commission associations
Commission.belongsTo(User, { foreignKey: 'user', as: 'earner' });
Commission.belongsTo(User, { foreignKey: 'downlineUser', as: 'downline' });
Commission.belongsTo(TaskCompletion, { foreignKey: 'sourceTask', as: 'taskSource' });

// Salary associations
Salary.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });

// Deposit associations
Deposit.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });
Deposit.belongsTo(BankAccount, { foreignKey: 'paymentMethod', as: 'paymentMethodDetails' });
Deposit.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Deposit.hasOne(RankUpgradeRequest, { foreignKey: 'depositId', as: 'rankUpgradeRequest' });

// RankUpgradeRequest associations
RankUpgradeRequest.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });
RankUpgradeRequest.belongsTo(Deposit, { foreignKey: 'depositId', as: 'deposit' });
RankUpgradeRequest.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Withdrawal associations
Withdrawal.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });
Withdrawal.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// WealthInvestment associations
WealthInvestment.belongsTo(User, { foreignKey: 'user', as: 'investor' });
WealthInvestment.belongsTo(WealthFund, { foreignKey: 'wealthFund', as: 'fund' });
WealthFund.hasMany(WealthInvestment, { foreignKey: 'wealthFund', as: 'investments' });

// SpinResult associations
SpinResult.belongsTo(User, { foreignKey: 'user', as: 'player' });
SpinResult.belongsTo(SlotTier, { foreignKey: 'tier', as: 'tierDetails' });
SlotTier.hasMany(SpinResult, { foreignKey: 'tier', as: 'results' });

// News associations
News.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Chat associations
ChatMessage.belongsTo(Chat, { foreignKey: 'chat', as: 'chatDetails' });
ChatMessage.belongsTo(User, { foreignKey: 'sender', as: 'senderDetails' });
Chat.hasMany(ChatMessage, { foreignKey: 'chat', as: 'messages' });
Chat.belongsTo(User, { foreignKey: 'user', as: 'customer' });

// DailyVideoAssignment associations
DailyVideoAssignment.belongsTo(User, { foreignKey: 'user', as: 'userDetails' });

// Add MongoDB compatibility (_id alias) to all models
const models = [
    User, Membership, Task, TaskCompletion, Course, CourseCategory,
    DailyVideoAssignment, VideoPool, Playlist, SystemSetting, Commission,
    Salary, Deposit, Withdrawal, BankAccount, WealthFund, WealthInvestment,
    SpinResult, SlotTier, News, Chat, ChatMessage, RankUpgradeRequest
];

models.forEach(model => addMongoCompatibility(model));

module.exports = {
    sequelize,
    User,
    Membership,
    Task,
    TaskCompletion,
    Course,
    CourseCategory,
    DailyVideoAssignment,
    VideoPool,
    Playlist,
    SystemSetting,
    Commission,
    Salary,
    Deposit,
    Withdrawal,
    BankAccount,
    WealthFund,
    WealthInvestment,
    SpinResult,
    SlotTier,
    News,
    Chat,
    ChatMessage,
    RankUpgradeRequest
};
