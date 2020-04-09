const nodeMailer = require('nodemailer')

const emailSender = (options) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOpitons = {
        from: 'Hakim Bencella <ozil.hakim@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html //TODO
    }

    transporter.sendMail(mailOpitons)
}

module.exports = emailSender;