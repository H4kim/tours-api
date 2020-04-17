const User = require('../models/userModel');
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowdFields) => {
    const allowedField = {}
    Object.keys(obj).forEach(el => {
        if (allowdFields.includes(el)) {
            allowedField[el] = obj[el]
        }
    })
    return allowedField
}


exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user.id
    next();
})

exports.updateMe = catchAsync(async (req, res, next) => {
    //1 Deny changing password
    if (req.password || req.passwordConfirm) return next(new AppError('You can not update the password from here , go to /updatepassword'))
    //filter the body from fields other than name,email..
    const filtredBody = filterObj(req.body, 'name', 'email')
    //2 find the user and update
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filtredBody, {
        runValidators: true,
        new: true
    })
    res.status(200).json({
        status: 'succes',
        message: 'Profil updated succesfully',
        data: {
            user: updatedUser
        }
    })
})


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'succes',
        data: null
    })
})



exports.getAllUsers = factory.getAll(User)

exports.getUser = factory.getOne(User)

exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'succes',
        message: 'this route is not defined , please use /signup instead'
    })
}