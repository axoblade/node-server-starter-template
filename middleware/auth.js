const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorHandler = require('../utils/errorResponse');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

//protect routes 
exports.protect = asyncHandler(async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    //else if(req.cookies.token){
      //  token = req.cookies.token;
    //}

    //confirm that token exists
    if(!token){
        return next(new ErrorResponse('Access Denied for this route', 401));
    }

    try {
        //verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.id);
        next()
    } catch (err) {
        return next(new ErrorResponse('Access Denied for this route', 401));
    }
})

//Grant Access to specific users
exports.authorize = ( ...roles ) => {
    return(req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse('Access denied for this route. Insufficient permissions', 403))
        }
        next();
    }
}