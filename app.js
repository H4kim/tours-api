const express = require('express');
const path = require('path')
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')
const xssClean = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRoutes = require('./routes/tourRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const viewRoutes = require('./routes/viewRoutes')
const bookingRoute = require('./routes/bookingRoutes')


const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'));
//serve static file from the server
app.use(express.static(path.join(__dirname, 'public')))


//use hemlet to sets some header for security puropses
app.use(helmet())

//body parser , read data from the body (req.body) -- and limit the amount of data coming from the body , > 10kb ? not accepted
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

//prevent xss and sql attaque (haha its a joke)
app.use(xssClean())
app.use(mongoSanitize())
 
app.use(hpp({
    whitelist: ['ratingsAverage', 'ratingsQuantity', 'duration', 'maxGroupSize', 'difficulty', 'price']
})) 
//morgan middlware
app.use(morgan('dev'));

//set the limit of how many request per (1h in this example)
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request in a short time :( '
})
app.use('/api', limiter)

//compress responses
app.use(compression())



//ROUTES
app.use('/', viewRoutes)
app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/bookings', bookingRoute)

//unfounded path error
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404))
})

// next(err) ? send it to errorController.js
app.use(globalErrorHandler)


module.exports = app; 
