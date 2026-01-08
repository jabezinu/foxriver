const SpinResult = require('../models/SpinResult');
const User = require('../models/User');

// @desc    Spin the wheel
// @route   POST /api/spin
// @access  Private
exports.spinWheel = async (req, res) => {
    try {
        const userId = req.user._id;
        const spinCost = 10;

        // Get user with current balance
        const use