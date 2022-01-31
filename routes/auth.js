const express = require('express');

const { protect } = require('../middleware/auth');
//include the controller
const {
    createUser,
    loginUser,
    getMe,
    updateMe,
    getUserDetails,
    getAllSystemUsers
} = require('../controllers/auth');
const advancedFilter = require('../middleware/filter');
const users = require('../models/User');

const router = express.Router();

router.route('/')
    .post(createUser);

router.route('/update')
    .put(protect, updateMe);

router.route('/login')
    .post(loginUser);

router.route('/me')
    .get(protect, getMe);
router.route('/details/:Id').get(getUserDetails);

router.route('/system-all-users').get(advancedFilter(users) ,getAllSystemUsers);

module.exports = router;