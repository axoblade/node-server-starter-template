const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    //log to console for debugging

    let error = { ...err };

    error.message = err.message;

    console.log(`❌ ${err.message}`);

    //cast error, missing records
    if (err.name === 'CastError') {
        const msg = 'Records not found';
        error = new ErrorResponse(msg, 404);
    }

    //duplicate key error
    if (err.code === 11000) {
        const msg = 'Duplicate recoreds or field value submitted';
        error = new ErrorResponse(msg, 500);
    }

    //validation error
    if (err.name === 'ValidationError') {
        const msg = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(msg, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        msg: error.message || 'Server Error',
        data:{}
    });
};

module.exports = errorHandler;