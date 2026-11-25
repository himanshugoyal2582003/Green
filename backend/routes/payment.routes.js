const router = require('express').Router();
const controller = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/checkout', authenticate, controller.createCheckoutSession);
router.post('/verify', authenticate, controller.verifyCheckoutSession);
router.get('/purchases', authenticate, controller.myPurchases);

module.exports = router;
