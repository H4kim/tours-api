const { promisify } = require('util')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync')
const Email = require('../utils/emailSender')

//generate JWT token
const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}



const createSendToken = (res, user, statusCode) => {
    const token = signToken(user._id)
    res.cookie('jwt', token, {
        expiresIn: new Date(Date.now()) + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    })

    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}



exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        // passwordChangedAt: req.body.passwordChangedAt
    })
    
    //send welcome email
    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome()

    //create and send a new jwt
    createSendToken(res, newUser, 201)
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password')

    //check if the email and password are true
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }
    //check if the email exist in db and if the password is correct
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect Email or password', 401))
    }

    //create and send a new jwt
    createSendToken(res, user, 200)
});

//logout 
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expiresIn : new Date(Date.now() + 10 * 1000),
        httpOnly : true
    })
    
    res.status(200).json({
        status : 'success'
    })
}

//check if the user is logged in 
exports.protect = catchAsync(async (req, res, next) => {
    //1) check if the header contain a token 
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) return next(new AppError('You are not logged in , please login to get access', 401))

    //2) token validation
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //3) check if the user still exist
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) return next(new AppError('The user belonging to this token is no longer exist', 401))

    //4) check if the password wasn't changed after the token was issued
    if (currentUser.isPasswordChanged(decoded.iat)) {
        return next(new AppError('You recently changed your password , please login again', 401))
    }

    //ACCESS GARANTED TO PROTECTED ROUTE
    req.user = currentUser
    res.locals.user = currentUser
    next()
});


//check if the user is logged in (server side rendring only) all route in viewRoutes
exports.isLoggedin = async (req, res, next) => {
    //1) check if the header contain a token 
    if (req.cookies.jwt) {
        try {
            let token = req.cookies.jwt

            //2) token validation
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
            //3) check if the user still exist
            const currentUser = await User.findById(decoded.id)

            if (!currentUser) return next()

            //4) check if the password wasn't changed after the token was issued
            if (currentUser.isPasswordChanged(decoded.iat)) {
                return next()
            }

            //ACCESS GARANTED send local object to template (accedable in html) 
            res.locals.user = currentUser
            return next()
        }
        catch (err) {
            return next()
        }
    }
    next()
};

// user => ['admin']
//restrict 
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // check if the user is allowed 
        if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403))
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get email from the user
    //if the email doesn't exist => ERROR
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(new AppError('There is no email with this adress', 400))

    //generate and encrypt a token and save it to the db (expire in 10mn)
    const token = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })
    
    //3)send the non-encrypted token to the user
    try {  
        const link = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${token}`
        await new Email(user, link).sendReset()

        res.status(200).json({
            status : 'success',
            message : 'if it is a valid email , You will receive an link to reset your password'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenEx = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new AppError('Error with sending the email please try again later', 500))
    }
})


exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get the token from the user 
    const providedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const currentUser = await User.findOne({ passwordResetToken: providedToken, passwordResetTokenEx: { $gt: Date.now() } })

    //2) compare the provided token with the one on the db
    if (!currentUser) return next(new AppError('invalid token', 404))

    //4) set the old password with the new one 
    currentUser.password = req.body.password
    currentUser.passwordConfirm = req.body.passwordConfirm
    currentUser.passwordResetToken = undefined
    currentUser.passwordResetTokenEx = undefined

    await currentUser.save()

    //create and send a new jwt
    createSendToken(res, currentUser, 200)
})


exports.updatePassword = catchAsync(async (req, res, next) => {
    //1 get the current user
    const currentUser = await User.findById(req.user.id).select('+password')
    //check if the password mathes

    if (!await currentUser.correctPassword(req.body.currentPassword, currentUser.password)) {
        return next(new AppError('Please enter a valid password', 401))
    }
    //save the password and changedAt field nam 
    currentUser.password = req.body.password
    currentUser.passwordConfirm = req.body.passwordConfirm
    await currentUser.save()

    //create and send a new jwt
    createSendToken(res, currentUser, 200)
})


