require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
morgan.token('body', (req => JSON.stringify(req.body)))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(p => {
        response.json(p)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count => {
        const date = new Date()
        response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>`)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
    .then(saved => {
        response.json(saved)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request, response, next)=>{
    const {name, number} = request.body
    Person.findByIdAndUpdate(
        request.params.id,
        {name, number},
        {new: true, runValidators: true, context:'query'}  
    ).then (updatedPerson=>{
        if (updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next)=>{
    console.error(error.message)
    if(error.name === 'CastError'){
        return res.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError'){
        return res.status(400).json({error: error.message})
    }
    next (error)

}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


