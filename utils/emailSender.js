const pug = require('pug')
const nodeMailer = require('nodemailer')
const htmlToText = require('html-to-text')


module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]   
        this.url = url
        this.from = `Hakim Bencella <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // return nodeMailer.createTransport({
            //     service : 'SendGrid',
            //     auth : {
            //         user : from sengrid ,
            //         pass : from sengrid ,
            //     }
            // })
            //TODO
        } else {
            return nodeMailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            })
        }
    }

    async send(template, subject) {
        //1) Render Html base on pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName : this.firstName,
            url : this.url,
            subject
        })
        
        //2) define email options
        const mailOpitons = {
            from: process.env.EMAIL_FROM,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        //3) create a transporter and send email
        await this.newTransport().sendMail(mailOpitons)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours application')
    }

    async sendReset() {
        await this.send('passwordReset', 'Natours password reset')
    }
}

//REFERENCE WITHOUT CLASS
// const emailSender = (options) => {
//     const transporter = nodeMailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     })

//     const mailOpitons = {
//         from: 'Hakim Bencella <ozil.hakim@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         // html //TODO
//     }

//     transporter.sendMail(mailOpitons)
// }

// module.exports = emailSender;