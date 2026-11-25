const router = require('express').Router();
const controller = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/mine', controller.myChats);
router.get('/listing/:listingId', controller.getListingChat);
router.post('/listing/:listingId/message', controller.sendMessage);
router.patch('/:chatId/decision', controller.decideRequest);

module.exports = router;
