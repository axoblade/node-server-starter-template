const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedFilter = require('../middleware/filter');

//create a new user
//route POST /api/v1/auth/
//access public
exports.createUser = asyncHandler(async (req, res, next) => {
    
    const { name, contact, email, password, role, address } = req.body;
    
    const user = await User.create({
        name,
        contact,
        email,
        password,
        role,
        address
    });

    const token = user.getSignedJwtToken();
    
    ///const data = await User.create(req.body);
    res.status(200).json({
        success: true,
        msg: "SUCCESS",
        data: {
            token
        }
    });
    
});

//login user
//route POST /api/v1/auth/login
//access public
exports.loginUser = asyncHandler(async (req, res, next) => {
    
    const { contact, email, password } = req.body;

    const phone = req.body.contact;
    ///req.body.contact = phone.replace('[]', '').trim();
    
    console.log(req.body);
    
    if (!contact) {
        if (!email) {
            return next(new errorResponse('Provide a phone number or email', 200));
        }
    }
    if (!password) {
        return next(new errorResponse('Password is required', 200));
    }

    //check if user exists
    let user = await User.findOne({contact}).select('+password');

    if(!user){
        user = await User.findOne({email}).select('+password');
        
        if (!user) {
            return next(new errorResponse('Invalid username or phone number', 200));
        }
    }

    ///check passwords
    const isMatch = await user.verifyPassword(password);

    console.log("check match", isMatch);

    if (!isMatch) {
        return next(new errorResponse('Wrong password supplied', 200));
    }
    
    const token = user.getSignedJwtToken();
    
    ///const data = await User.create(req.body);
    sendTokenResponse(user,200,res);
    
});


///function to get token from model and create cookie then send response to user
const sendTokenResponse = (user, statusCode, res)=> {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),//cookie expires in 30days from creation
        httpOnly : true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success : true,
        msg : "success",
        data: {
            token
        }
    })
}

//@desc   Get the current loggedin User
//@route  POST /api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async(req,res,next) =>{
    
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success : true,
        data : user
    })
})

//@desc   Get the current loggedin User
//@route  POST /api/v1/auth/id
//@access Private
exports.updateMe = asyncHandler(async(req,res,next) =>{
    
    const { name, contact, email, address } = req.body;

    console.log(req.body);
    const user = await User.findByIdAndUpdate(req.user.id,req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success : true,
        data : user
    })
})

//get all user details
//route GET /api/v1/auth
//access public
exports.getUserDetails = asyncHandler(async (req, res, next) => {
    
    const user = await User.findById(req.params.Id);
    res.status(200).json({
        success : true,
        data : user
    })
});

//get all user details
//route GET /api/v1/auth
//access public
exports.getAllSystemUsers = asyncHandler(async (req, res, next) => {
    
    res.status(200).json(res.advancedFilter);
});