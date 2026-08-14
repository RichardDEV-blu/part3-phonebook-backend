const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const middleware = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
        .populate('user', { username: 1, name: 1 })

    response.json(blogs)
})


blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const user = request.user

    const blog = new Blog({
        ...request.body,
        user: user._id
    })

    const result = await blog.save()

    user.blogs = user.blogs.concat(result._id)
    await user.save()

    response.status(201).json(result)
})


blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).end()
    }

    if (blog.user.toString() !== user._id.toString()) {
        return response.status(401).json({
            error: 'user not authorized to delete this blog'
        })
    }

    await Blog.findByIdAndDelete(request.params.id)

    response.status(204).end()
})


blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).end()
    }

    if (blog.user.toString() !== user._id.toString()) {
        return response.status(401).json({
            error: 'user not authorized to update this blog'
        })
    }

    const body = request.body

    const updatedBlog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const result = await Blog.findByIdAndUpdate(
        request.params.id,
        updatedBlog,
        { new: true }
    )

    response.json(result)
})


module.exports = blogsRouter