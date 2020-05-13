const mongoose = require('mongoose')
 
const bookingSchema = mongoose.Schema({
    
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'a booking must belong to a user']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'a booking must belong to a tour']
    },
    price: {
        type: Number,
        required : [true, 'a booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid : {
        type : Boolean,
        default : true
    }
})


// populate tour and user whenever there is a query
bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({ path : 'tour', select : 'name' })
    next()
})

const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking