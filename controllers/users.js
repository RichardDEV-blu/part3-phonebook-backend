const bcrypt = require('bcrypt')
const User = require('../models/user')
const usersRouter = require('express').Router()

usersRouter.get('/', async (request, response)=>{
    const users = await User.find({})
    response.json(users)
})

usersRouter.post('/', async(request, response)=>{
    const {username, name, password} = request.body
    const passwordHash = await bcrypt.hash(password,10)
    const user = new User({
        username,
        name,
        passwordHash
    })
    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter