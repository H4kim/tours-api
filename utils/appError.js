//to create a custom error 

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.messages = message
        this.statusCode = statusCode || 404;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor) // a recharcher
    }
}
module.exports = AppError