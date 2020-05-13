const multer = require('multer'); 
const sharp = require('sharp')
const User = require('../models/userModel');
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync');

//STORE The image into the storage (without processing img)
// const multerStorage = multer.diskStorage({
//     destination : (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename : (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

//STORE the image in the buffer (memory)
const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Please upload a valid image', 400), false)
    }
}


const upload = multer({
    storage : multerStorage,
    fileFilter: multerFilter 
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUploadPhoto = async (req, res, next) => {
    if (!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality : 90 })
        .toFile(`public/img/users/${req.file.filename}`)


    next()
}

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
    if (req.body.password || req.body.passwordConfirm) return next(new AppError('You can not update the password from here , go to /updatepassword'))
    //filter the body from fields other than name,email..
    const filtredBody = filterObj(req.body, 'name', 'email')
    if (req.file) filtredBody.photo = req.file.filename
    //2 find the user and update
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filtredBody, {
        runValidators: true,
        new: true
    })
    res.status(200).json({
        status: 'success',
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