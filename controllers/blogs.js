const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const token = request.token

    if (!token) {
        return response.status(401).json({
            error: 'token missing'
        })
    }

    let decodedToken

    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (error) {
        return response.status(401).json({
            error: 'token invalid'
        })
    }

    if (!decodedToken.id) {
        return response.status(401).json({
            error: 'token invalid'
        })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        ...request.body,
        user: user._id
    })

    const result = await blog.save()

    user.blogs = user.blogs.concat(result._id)
    await user.save()

    response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {

  const result = await Blog.findByIdAndDelete(request.params.id)

  response.status(204).end()

})


blogsRouter.put('/:id', async (request, response) => {
  const blog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  )

  response.json(blog)
})

module.exports = blogsRouter