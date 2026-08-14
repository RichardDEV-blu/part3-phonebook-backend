const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    },
    {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12
    },
    {
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10
    },
    {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0
    },
    {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2
    }
]

const initializeBlogs = async () => {
    await Blog.deleteMany({})

    const user = await User.findOne({ username: 'testuser' })

    const blogObjects = initialBlogs.map(blog =>
        new Blog({
            ...blog,
            user: user._id
        })
    )

    const promiseArray = blogObjects.map(blog => blog.save())

    await Promise.all(promiseArray)

    user.blogs = blogObjects.map(blog => blog._id)
    await user.save()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const initializeUsers = async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)

    const user = new User({
        username: 'testuser',
        name: 'Test User',
        passwordHash
    })

    await user.save()
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    initializeBlogs,
    blogsInDb,
    usersInDb,
    initializeUsers
}