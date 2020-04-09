const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel')

dotenv.config({ path: `${__dirname}/../../config.env` })

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connected')
});

const updateToDate = () => {
    Tour.find({ startDates: { $not: { $type: 9 } } }).then(arr => {
        arr.forEach(doc => {
            doc.startDates.forEach(date => {
                date = new Date(date)
            })
        })
        console.log('success')
    }).catch(err => console.log(err))
}
updateToDate();
