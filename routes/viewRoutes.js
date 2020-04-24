const express = require('express');
const viewsController = require('./../controllers/viewsController')
const authController = require('./../controllers/authController')
const router = express.Router();

router.use(authController.isLoggedin)

router.get('/', viewsController.getOverview)
router.get('/login', viewsController.getLoginForm)
router.get('/tours/:slug', authController.protect, viewsController.getTours)


module.exports = router;