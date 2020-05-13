const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'a review must belong to a user']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'a review must belong to a tour']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

//calculate the average rating / num of rating on a specific tour and set the fields on tour doc to these values on each add/delete/update review 
reviewSchema.statics.calculateAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                averageRatings: { $avg: '$rating' }
            }
        }
    ])
    if (stats[0]) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].averageRatings,
            ratingsQuantity: stats[0].nRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
}
//deny any duplicate comment from the same user on the same tour (set both user and tour to unique)
reviewSchema.index({ user: 1, tour: 1 }, {
    unique: true
})

//set the rating aver and rating num  on each add new review 
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.tour)
    // console.log(this)
})

//set the rating aver and rating num  on each delete/update a review 
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    //alternatevly we can use ths.model instead of this.r.constructor (model exist in query middleware)
    this.r.constructor.calculateAverageRating(this.r.tour)
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review