const Client = require('../models/Client');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedFilter = require('../middleware/filter');
const bcrypt = require('bcryptjs');
const moment = require('moment');
//get all active clients
//route GET /api/v1/clients
//access private
exports.getClients = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedFilter);
});


//get all client details
//route GET /api/v1/clients/clientID
//access public
//create a new product
//route POST /api/v1/products/
//access private
exports.createClient = asyncHandler(async (req, res, next) => {
    console.log('Request Body', req.body);
    
    const data = await Client.create(req.body);
    
    res.status(200).json({
        success: true,
        msg: "SUCCESS",
        data: "Client Created Successfully"
    });
    
});

//delete a single client
//route DELETE /api/v1/clients/clientID
//access public
exports.deleteClient = asyncHandler(async (req, res, next) => {
    
    const data = await Client.findByIdAndDelete(req.params.clientId);
    if (!data) {
        return res.status(200).json({
            success: false,
            msg: `Records not found`,
            data: {}
        });
    } else {
        res.status(200).json({
            success: true,
            msg: `SUCCESS`,
            data: {}
        });
    }
});


//Authenticate user key
//route POST /api/v1/clients/key-auth
//access public
exports.verifyKey = asyncHandler(async (req, res, next) => {
    
    const { tin, deviceNumber, key } = req.body;

    ///const tin = req.body.tin;
    ///const deviceNumber = req.body.deviceNumber;
    ///const key = req.body.key;
    ///req.body.contact = phone.replace('[]', '').trim();
    
    console.log(req.body);
    
    if (!tin || !deviceNumber || !key) {
        return next(new errorResponse('Provide a device number, tin and key', 200));
    }

    //check if user exists
    let client = await Client.findOne({tin}).where({deviceNumber}).select('+key');

    if (!client) {
        return next(new errorResponse('Invalid TIN or Device Number. Records not found', 200));
    }
    
    const isMatch = await verifyKey(key, client.key);

    if (!isMatch) {
        return next(new errorResponse('Invalid key supplied', 200));
    }
    let currentDate = moment();
    let expDate = moment(client.validTo);
    
    let isValid = expDate.diff(currentDate, 'days');
    if (isValid < 0) {
        res.status(200).json({
            success: false,
            msg: "Key Expired",
            data: "Please renew your Licence key"
        });
    } else {
        res.status(200).json({
            success: true,
            msg: "SUCCESS",
            data: "Key Is Valid"
        });
    }
});


const verifyKey = async function (userKey,systemKey) {
    return await bcrypt.compare(
        userKey, systemKey
    );
};