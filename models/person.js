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
    number: {
        type: String,
        minLength: [8, 'Number must have at least 8 characters'],
        validate: {
            validator: function (v) {
                return /^\d{2,3}-\d+$/.test(v)
            },
            message: props => `${props.value} does not have a valid format (ej: 09-1234556)`
        },
        required: [true, 'Number is mandatory']
    }
})

personSchema.set('toJSON', {
    transform: (document, retObject) => {
        retObject.id = retObject._id.toString()
        delete retObject._id
        delete retObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)