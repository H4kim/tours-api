/* eslint-disable arrow-body-style */
const multer = require('multer'); 
const sharp = require('sharp')
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory')
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')


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

exports.uploadTourImages = upload.fields([
    { name : 'imageCover', maxCount :1 },
    { name : 'images', maxCount :3 }
])


exports.resizeTourImages = async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next()

    //IMAGE COVER
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality : 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)


    //IMAGES 
    req.body.images = []
    await Promise.all(req.files.images.map(async (file, i) => {
        const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
        
        await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality : 90 })
        .toFile(`public/img/tours/${fileName}`)

        req.body.images.push(fileName)
    }))

    next()
    console.log(req.files)
}


exports.getAllTours = factory.getAll(Tour)

exports.createTour = factory.createOne(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' })

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour);

exports.topFiveCheap = async (req, res, next) => {
    req.query.limit = '5';
    req.query.fields = 'name,price,summary,ratingsAverage,difficulty';
    req.query.sort = '-ratingsAverage,price';
    next();
}

// /tour-within route (get tours within certain distance provided by the user)
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3958.8 : distance / 6371

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and langitude in format of lat,lng'))
    }
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    }).select('name address')

    res.status(200).json({
        status: 'success',
        tours: tours.length,
        data: {
            tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => { //BUG
    const { latlng, unit } = req.params
    let [lat, lng] = latlng.split(',')

    if (!lat || !lng) {
        return next(new AppError('Please provide latitude and langitude in format of lat,lng'))
    }

    const multiplier = unit === 'km' ? 0.001 : 0.000621371
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                name: 1,
                address: 1,
                distance: 1
            }
        }
    ])


    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})


exports.getToursStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgPrice: { $avg: '$price' },
                avgRatings: { $avg: '$ratingsAverage' },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }

    ])

    res.status(200).json({
        status: 'success',
        stats
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                sumToursStart: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { month: 1 }
        },
        // {
        //     $limit: 1
        // }


    ])
    res.status(200).json({
        status: 'success',
        length: plan.length,
        plan
    })
}) 