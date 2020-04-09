const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel')

dotenv.config({ path: `${__dirname}/../../config.env` });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connected')
});


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted succesfuly')
    } catch (err) {
        console.log(err)
    }
    process.exit()
};

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data added succesfuly')
    } catch (err) {
        console.log(err)
    }
    process.exit()
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}