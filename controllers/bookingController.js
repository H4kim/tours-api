const stripe = require('stripe')('sk_test_KILjNQmGA7vigFyTFHBzEEEK00wkMfqeEa');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    //2) create checkout session  
    const session = await stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        success_url : `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url : `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email : req.user.email,
        client_reference_id : req.params.tourId,
        line_items : [
            {
                name : `${tour.name} Tour`,
                description : tour.summary,
                images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount : tour.price * 100, // in cent
                currency : 'usd',
                quantity : 1 
            }
        ]
    })
    //3) send the session to the client
    res.status(200).json({
        status : 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next() 
    await Booking.create({ tour, user, price })

    res.redirect(req.originalUrl.split('?')[0])
})   

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)