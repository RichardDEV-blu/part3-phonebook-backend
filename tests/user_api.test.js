const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

describe('user creation', () => {

    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
    })

    test('succeeds with valid data', async () => {
        const newUser = {
            username: 'testuser',
            name: 'Test User',
            password: 'password'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.username, newUser.username)
        assert.strictEqual(response.body.name, newUser.name)

        const usersAtEnd = await helper.usersInDb()

        assert.strictEqual(usersAtEnd.length, 1)

        const usernames = usersAtEnd.map(user => user.username)
        assert(usernames.includes('testuser'))
    })


    test('fails with status code 400 if username is missing', async () => {
        const newUser = {
            name: 'Test User',
            password: 'password'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(response.body.error)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, 0)
    })


    test('fails with status code 400 if username is too short', async () => {
        const newUser = {
            username: 'ab',
            name: 'Test User',
            password: 'password'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(response.body.error)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, 0)
    })


    test('fails with status code 400 if password is missing', async () => {
        const newUser = {
            username: 'testuser',
            name: 'Test User'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(response.body.error)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, 0)
    })


    test('fails with status code 400 if password is too short', async () => {
        const newUser = {
            username: 'testuser',
            name: 'Test User',
            password: 'ab'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        assert(response.body.error)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, 0)
    })


    test('fails with status code 400 if username is not unique', async () => {
        const newUser = {
            username: 'testuser',
            name: 'Test User',
            password: 'password'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        const duplicateUser = {
            username: 'testuser',
            name: 'Another User',
            password: 'anotherpassword'
        }

        const response = await api
            .post('/api/users')
            .send(duplicateUser)
            .expect(400)

        assert(response.body.error)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, 1)
    })

     test('the blogs created by the user are returned with the user', async () => {
                const newUser = {
                    username: 'testuser',
                    name: 'Test User',
                    password: 'password'
                }
    
                await api
                    .post('/api/users')
                    .send(newUser)
                    .expect(201)
    
                const newBlog = {
                    title: 'Blog created by user',
                    author: 'Richard',
                    url: 'https://example.com',
                    likes: 5
                }
    
                await api
                    .post('/api/blogs')
                    .send(newBlog)
                    .expect(201)
    
                const users = await api
                    .get('/api/users')
                    .expect(200)
    
                const user = users.body.find(
                    user => user.username === 'testuser'
                )
    
                assert.strictEqual(user.blogs.length, 1)
                assert.strictEqual(user.blogs[0].title, 'Blog created by user')
            })

})


after(async () => {
    await mongoose.connection.close()
})