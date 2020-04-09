const { promisify } = require('util')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync')
const emailSender = require('../utils/emailSender')



//generate JWT token
const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
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

    //if everythink is ok send the token to the client 
    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token
    })
});

exports.protect = catchAsync(async (req, res, next) => {
    //1) check if the header contain a token 
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
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
    next()
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // check if the user is admin
        if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403))

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get email from the user
    //if the email doesn't exist => ERROR
    const currentUser = await User.findOne({ email: req.body.email })
    if (!currentUser) return next(new AppError('if it is a valid email , You will receive an link to reset your password', 200))

    //generate and encrypt a token and save it to the db (expire in 10mn)
    const token = currentUser.createPasswordResetToken()
    await currentUser.save({ validateBeforeSave: false })
    //3)send the non-encrypted token to the user
    const link = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${token}`
    const message = `Your forgot your password ? please click on the link to reset : 
                        ${link} if you did't forgot your password ignore this email`

    const emailOptions = {
        email: currentUser.email,
        subject: 'Your access token to change password (valid for 10mn)',
        message
    }

    try {
        await emailSender(emailOptions)

        res.status(200).json({
            status: 'Success',
            message: 'Token sent to the email'
        })
    } catch (err) {
        currentUser.passwordResetToken = undefined;
        currentUser.passwordResetTokenEx = undefined;
        await currentUser.save({ validateBeforeSave: false })

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
    const token = signToken(currentUser._id)

    res.status(200).json({
        status: 'succes',
        token
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1 get the current user
    const currentUser = await User.findById(req.user.id).select('+password')
    //check if the password mathes

    if (!await currentUser.correctPassword(req.body.currentPassword, currentUser.password)) {
        return next(new AppError('Please enter a valid password', 401))
    }
    //send a new jwt
    const token = signToken(currentUser._id)
    //save the password and changedAt field nam 
    currentUser.password = req.body.password
    currentUser.passwordConfirm = req.body.passwordConfirm
    await currentUser.save()

    res.status(200).json({
        status: 'succes',
        message: 'Password updated succefully',
        token
    })
})


