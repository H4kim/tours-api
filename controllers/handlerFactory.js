const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

exports.deleteOne = (Modal) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Modal.findByIdAndDelete(req.params.id);

        if (!doc) {
            //create custom error and send it to errorController.js
            return next(new AppError('Invalid document id !', 404))
        }

        res.status(204).json({
            status: 'success',
            data: null
        })
    })
}

exports.updateOne = Modal => {
    return catchAsync(async (req, res, next) => {
        const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!doc) {
            //create custom error and send it to errorController.js
            return next(new AppError('Invalid document id !', 404))
        }

        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    })
}

exports.createOne = Modal => {
    return catchAsync(async (req, res, next) => {
        const newDoc = await Modal.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: newDoc
            }
        })
    })
}

exports.getOne = (Modal, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        let query = Modal.findById(req.params.id)
        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query

        if (!doc) {
            //create custom error and send it to errorController.js
            return next(new AppError('Invalid document id !', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
    })
}

exports.getAll = (Modal) => {
    return catchAsync(async (req, res, next) => {
        //to allow for nested GET reviews on tour/tourid/reviews
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }
        const features = new APIFeatures(Modal.find(filter), req.query).filter().sort().fields().paginate();
        const docs = await features.query

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                data: docs
            }
        })
    })
}

