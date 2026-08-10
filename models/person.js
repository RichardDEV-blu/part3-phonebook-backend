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
    name: {
        type: String,
        minLength: [3, 'Name must have at least 3 characters'],
        required: [true, 'Name is mandatory']
    
    },
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