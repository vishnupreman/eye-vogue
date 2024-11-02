const mongoose = require('mongoose')

const connectDb = async (URI) => {
    mongoose.connection.on('connected', () => {
        console.log('connected to the database');

    })
    mongoose.connection.on('disconnected', () => {
        console.log('disconnected from database');

    })
    try {
        await mongoose.connect(URI)
    } catch (error) {
        console.log(error);

    }
}

module.exports = connectDb

