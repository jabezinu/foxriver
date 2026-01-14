const express = require('express');
const router = express.Router();
const { getQnA, uploadQnA, deleteQnA } = require('../controllers/qnaController');
const { protect, adminOnly, checkPermission } = require('../middlewares/auth');

router.get('/', getQnA);
router.post('/upload', protect, adminOnly, checkPermission('manage_qna'), uploadQnA);
router.delete('/:id', protect, adminOnly, checkPermission('manage_qna'), deleteQnA);

module.exports = router;
