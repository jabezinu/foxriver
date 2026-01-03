const express = require('express');
const router = express.Router();
const { getQnA, uploadQnA, deleteQnA } = require('../controllers/qnaController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/', getQnA);
router.post('/upload', protect, adminOnly, uploadQnA);
router.delete('/:id', protect, adminOnly, deleteQnA);

module.exports = router;
