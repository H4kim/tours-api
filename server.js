const mongoose = require('mongoose');
const dotenv = require('dotenv')
// const tourModel = require('./models/tourModel')

process.on('uncaughtException', (err) => {
    console.log('Uncaught EXCEPTION 💥')
    console.log(err);
    process.exit(1)
});


const app = require('./app')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('db connected')
}).catch(err => {
    console.log(err)
})

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log('server created')
})

process.on('unhandledRejection', (err) => {
    console.log(err);
    console.log('Unhandled REJECTION 💥')
    server.close(() => {
        process.exit(1)
    })
});

