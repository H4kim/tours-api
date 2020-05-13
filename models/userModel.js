const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const crypto = require('crypto')
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a user must have a name'],
        maxlength: 40,
        minlength: 3,
    },
    email: {
        type: String,
        required: [true, 'please provide your email !'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'please provide a valid email !']
    },
    photo: {
        type : String,
        default : 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'please a provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            //WORK ONLY WITH CREATE() and SAVE() , so we have to use save on update and and not findByIdAndUpdate()
            validator: function (passConfirm) {
                return passConfirm === this.password // true ? no error message
            },
            message: 'Passwords should be the same'
        }
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin', 'lead-guide', 'guide']
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String,
        default: undefined
    },
    passwordResetTokenEx: {
        type: Date,
        default: undefined
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }

});


// encrypte the password field at every new creation or password modification
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next()
})

//update passwordChangedAt if the password is changed
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt = Date.now() - 10000
    next()
})

//don't show user with active set false
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})
//a global function that will be owned by all the docs (user.correctPassword)
userSchema.methods.correctPassword = async (issuedPassword, dbPassword) => {
    return await bcrypt.compare(issuedPassword, dbPassword)
}

// CHECK IF THE PASSWORD IS CHANGED AFTER THE JWT IS ISSUED
userSchema.methods.isPasswordChanged = function (tokenIssuedAt) {
    if (this.passwordChangedAt) {
        const changedAtSecond = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return tokenIssuedAt < changedAtSecond
    }
    return false
}

//generate and encrypt a token and save it to the db (expire in 10mn) 
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    const encryptedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetToken = encryptedToken;
    this.passwordResetTokenEx = Date.now() + 10 * 60 * 1000

    return resetToken
}



const User = mongoose.model('User', userSchema)
module.exports = User


