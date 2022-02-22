const express = require('express');

const { protect } = require('../middleware/auth');
//include the controller
const {
    createClient,
    getClients,
    deleteClient,
    verifyKey
} = require('../controllers/client');

const advancedFilter = require('../middleware/filter');
const client = require('../models/Client');

const router = express.Router();

router.route('/')
    .post(createClient);
router.route('/key-auth').post(verifyKey);

/**router.route('/update')
    .put(protect, updateMe);

router.route('/login')
    .post(loginUser);

router.route('/me')
    .get(protect, getMe);
router.route('/details/:Id').get(getUserDetails);**/
router.route('/:clientId').delete(deleteClient);
router.route('/system-all-clients').get(advancedFilter(client) ,getClients);

module.exports = router;
