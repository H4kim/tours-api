const AppError = require('./../utils/appError');

//
const handleExpiredError = () => new AppError('Token expired , please login again', 401)
//handle jsonWebTokenError
const handleJwtError = () => new AppError('Invalid token , please login again', 401)

//handel  CastErros  (invalid id , ...)
const handleCastErrorDB = err => {
    /* create an instance of AppError , then the castError from mongoose will contain isOperational = true
       (will be considered as operational error to show it the user) , */
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400)
}

//handel duplicate tour name error
const handleMongoErrorDB = (err) => {
    const value = err.errmsg.match(/"(.*?)"/)[0];
    const message = `Duplicate field value :  ${value}. please choose anothor value`
    return new AppError(message, 400)
}

//handle Validation Errors 
const handleValidationErrorDB = (err) => {
    const { message } = err
    return new AppError(message, 400)
}


const sendErrorDevelopment = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        //API
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            err: err,
            stack: err.stack
        })
    } else {
        //Rendred 
        res.status(err.statusCode).render('error', {
            title : 'Something went wrong',
            message : err.message
        })
    }
}


const sendErrorProduction = (err, req, res) => {
    //A) API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            console.error('ERROR 💥', err)
            res.status(err.statusCode).json({
                status: err.status,
                message: err.messages
            })
        }
        //if not operational send a generic message without inforamation (third package libray errors , ....)
        else {
            //) log the error in the server log 💻 
            console.error('ERROR 💥', err)
            res.status(500).json({
                status: 'Error',
                message: 'Somthing went wrong',
            });
        }
    }
    //B) Rendred 
    else if (err.isOperational) {
        console.error('ERROR 💥', err)
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            message: err.messages
        })
    } else {
        //) log the error in the server log 💻 
        console.error('ERROR 💥', err)
        res.status(500).render('error', {
            title: 'Something went wrong',
            message: 'Please try again later'
        });
    }
}




module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDevelopment(err, req, res)
    }

    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        // if (error.code === 11000) handleMongoErrorDB(error)
        if (error.code === 11000) error = handleMongoErrorDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJwtError()
        if (error.name === 'TokenExpiredError') error = handleExpiredError()

        sendErrorProduction(error, req, res)
    }
}
