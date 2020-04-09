const express = require('express');
const morgan = require('morgan')
const tourRoutes = require('./routes/tourRoutes')
const userRoutes = require('./routes/userRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();
app.use(express.json())
app.use(morgan('dev'));

app.use('/api/v1/tours', tourRoutes)
app.use('/api/v1/users', userRoutes)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server !`, 404))
})

// next(err) ? send it to errorController.js
app.use(globalErrorHandler)


module.exports = app; 
