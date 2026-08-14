const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const users = await User.find({})  
  const myUser = users[0]


  const blog = new Blog({
    ...request.body,
    user: myUser._id
  })


  const result = await blog.save()
  myUser.blogs = myUser.blogs.concat(result._id)
  await myUser.save()
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