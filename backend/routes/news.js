const express = require('express');
const router = express.Router();
const {
    getNews,
    getPopupNews,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');
const { protect, adminOnly, checkPermission, optionalProtect } = require('../middlewares/auth');

router.get('/', optionalProtect, getNews);
router.get('/popup', optionalProtect, getPopupNews);
router.post('/', protect, adminOnly, checkPermission('manage_news'), createNews);
router.put('/:id', protect, adminOnly, checkPermission('manage_news'), updateNews);
router.delete('/:id', protect, adminOnly, checkPermission('manage_news'), deleteNews);

module.exports = router;
