const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const URL = process.env.MONGODB_URI
mongoose.connect(URL)
    .then(res => {
        console.log('connected')
    })
    .catch(error => {
        console.log('error connecting to MongoDB: ', error.message)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

personSchema.set('toJSON', {
    transform: (document, retObject) => {
        retObject.id = retObject._id.toString()
        delete retObject._id
        delete retObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)