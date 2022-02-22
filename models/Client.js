const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const licence = require('uuid');
const mailer = require('nodemailer');


const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [75, 'Name should not exceed 75 characters']
    },
    address: {
        type: String,
        maxlength: [200, 'Address should not exceed 200 characters']
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
    tin: {
        type: String,
        required: [true, "Please add a client TIN"]
    },
    key: {
        type: String,
        unique: [true, 'Key already taken'],
        select: false
    },
    deviceNumber: {
        type: String,
        required: [true, "Please add a device Number"],
        unique: [true, 'Device number already taken'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    validTo: {
        type: Date,
        required: [true, "Enter Licence expiry"]
    }
});

//encrypt TIN
ClientSchema.pre('save', async function (next) {
    this.validTo = await new Date(+new Date() + this.validTo * 24 * 60 * 60 * 1000)
    console.log("ValidTo: ", this.validTo);
    const generateKey = licence();
    const salt = await bcrypt.genSalt(10);
    this.key = await bcrypt.hash(generateKey, salt);

    var transporter = await mailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'keys.efris.middleware@gmail.com',
            pass: 'Password?!'
        }
    });

    var mailOptions = await {
        from: 'keys.efris.middleware@gmail.com',
        to: this.email+',pnakaali@kumusoft.com,jkakuru@kumusoft.com,elagaba@kumusoft.com,baksham@kumusoft.com',
        subject: 'Kumusoft EFRIS Team',
        html: '<div style="margin:0;padding:0" bgcolor="#FFFFFF"><table width="100%" height="100%" style="min-width:348px" border="0" cellspacing="0" cellpadding="0" lang="en"><tbody><tr height="32" style="height:32px"><td></td></tr><tr align="center"><td><div><div></div></div><table border="0" cellspacing="0" cellpadding="0" style="padding-bottom:20px;max-width:516px;min-width:220px"><tbody><tr><td width="8" style="width:8px"></td><td><div style="border-style:solid;border-width:thin;border-color:#dadce0;border-radius:8px;padding:40px 20px" align="center" class="m_-8740517293921199866mdv2rw"><img src="https://i.postimg.cc/5yy4zYJC/kumusoft-dark-logo.png" width="50%" aria-hidden="true" style="margin-bottom:16px" alt="Kumusoft Logo" class="CToWUd"><div style="font-family:"Google Sans",Roboto,RobotoDraft,Helvetica,Arial,sans-serif;border-bottom:thin solid #dadce0;color:rgba(0,0,0,0.87);line-height:32px;padding-bottom:24px;text-align:center;word-break:break-word"><div style="font-size:24px">EFRIS Middleware Licence Key </div></div><div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color:rgba(0,0,0,0.87);line-height:20px;padding-top:20px;text-align:left">Kumusoft Solutions Ltd has received a request to use activate the <a style="font-weight:bold">URA EFRIS Middleware</a> as an Efris Integration Service for <a style="font-weight:bold">' + this.name + '</a>.<br><br>Use this key to finish setting up your system:<br><div style="text-align:center;font-size:36px;margin-top:20px;line-height:34px">' + generateKey + '</div><br>This code will expire at ' + this.validTo + '.<br><br>If you dont recognize this email or see any wrong information get in touch at <a href="mailto:info@kumusoft.com" target="_blank">info<wbr>kumusoft.com</a>.</div></div><div style="text-align:left"><div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center"><div>You received this email to let you know about activation of your EFRIS Middleware Licence.</div><div style="direction:ltr">Kumusoft Solutions Ltd, <a class="m_-8740517293921199866afal" style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center">Plot 28, Matyrsway, Ntinda - Ministers Village, Kampala (U)</a></div></div></div></td><td width="8" style="width:8px"></td></tr></tbody></table></td></tr><tr height="32" style="height:32px"><td></td></tr></tbody></table></div>'
    };

    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
});

//match user key to hashed key
ClientSchema.methods.verifyKey = async function (userKey) {
    return await bcrypt.compare(
        userKey, this.key
    );
};

module.exports = mongoose.model('Client', ClientSchema);