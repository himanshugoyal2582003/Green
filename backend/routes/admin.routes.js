const router = require('express').Router();
const controller = require('../controllers/admin.controller');
const { authenticate, allowRoles } = require('../middleware/auth.middleware');
router.use(authenticate, allowRoles('admin'));
router.get('/overview', controller.overview);
router.get('/users', controller.listUsers);
router.get('/listings', controller.listListings);
module.exports = router;
