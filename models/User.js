const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength:[75,'Name should not exceed 75 characters']
    },
    address: {
        type: String,
        maxlength: [200, 'Address should not exceed 200 characters'],
        default:'-'
    },
    contact: {
        type: String,
        required: [true, 'Please add a phone number'],
        maxlength: [15, 'Phone number should not exceed 15 characters'],
        unique: [true, 'Phone number already exists'],
    },
    email: {
        type: String,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email'
        ],
        unique: [true, 'Email already taken'],
        required:[true,'Please provide an email']
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: [6, "Password should be atleast 6 characters"],
        select: false
    },
    resetPasswordToken: String,
    restePasswordExpire: Date,
    photo: {
        type: String,
        default: 'no-photo.png',
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//encrypt password
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//generate access token
UserSchema.methods.getSignedJwtToken = function (next) {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

//match user password to hashed password
UserSchema.methods.verifyPassword = async function (userPassword) {
    return await bcrypt.compare(
        userPassword, this.password
    );
};

module.exports = mongoose.model('User', UserSchema);