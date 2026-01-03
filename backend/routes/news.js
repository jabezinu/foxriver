const express = require('express');
const router = express.Router();
const {
    getNews,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/', getNews);
router.post('/', protect, adminOnly, createNews);
router.put('/:id', protect, adminOnly, updateNews);
router.delete('/:id', protect, adminOnly, deleteNews);

module.exports = router;
