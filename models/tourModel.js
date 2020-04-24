const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel')

const TourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a Tour must have a price'],
        unique: true,
        trim: true,
        minlength: [10, 'Name tour must equal or higher then 10 chars'],
        maxlength: [40, 'Name tour must equal or less then 40 chars']
    },
    price: {
        type: Number,
        required: [true, 'a Tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price // true ? ok , false ? error message
            },
            message: 'Discount price should be less then the original price'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must equal or higher then 1'],
        max: [5, 'Rating must equal or less then 5'],
        set: val => Math.round(val * 10) / 10 //trick to round to one number after the coma
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    duration: {
        type: Number,
        required: [true, 'a Tour must have a duration']
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    difficulty: {
        type: String,
        required: [true, 'a Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'difficulty must be : easy , medium or difficult'
        }
    },
    summary: {
        type: String,
        required: [true, 'a Tour must have a summary'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'a Tour must have a group size']
    },
    imageCover: {
        type: String,
        required: true
    },
    images: [String],
    startDates: [Date],
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


//add indexes
TourSchema.index({ price: 1, ratingsAverage: -1 })
TourSchema.index({ slug: 1 })
TourSchema.index({ startLocation: '2dsphere' })


//virtual fields
TourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

TourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})


//1) DOCUMENT MIDDLWARES
//middleware for mongodb (run only  before save() and create() )
TourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

//--- embeding tours guides into the tours (just a referance)
// TourSchema.pre('save', async function (next) {
//     const guidesProm = this.guides.map(async id => await User.findById(id))
//     console.log(this.guides)
//     this.guides = await Promise.all(guidesProm)
//     console.log(this.guides)
//     next()
// })

//2) QUERY MIDDLWARES
//get the query and update it to not display secretTour tours 
TourSchema.pre(/^find/, function (next) {
    // console.log('running query middlware')
    this.find({ secretTour: { $ne: true } })
    this.queryStart = Date.now()
    next();
})

TourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

TourSchema.post(/^find/, function (docs, next) {
    const time = Date.now() - this.queryStart;
    // console.log(`the query take ${time} milliseconde`)
    next();
})

//2) AGGREGATION MIDDLWARES

// TourSchema.pre('aggregate', function (next) {
//     // console.log(this.pipeline())
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     next();
// })

const Tour = mongoose.model('Tour', TourSchema)
module.exports = Tour;