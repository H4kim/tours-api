const User = require('../models/userModel');
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

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find()

    //SEND THE QUERY

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
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

exports.addUser = (req, res) => {
    console.log('add User')
}

exports.getUser = (req, res) => {
    console.log('get User')
}

exports.updateUser = (req, res) => {
    console.log('update Userrrr')
}

exports.deleteUser = (req, res) => {
    console.log('delete User')
}

