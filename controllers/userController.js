const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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
