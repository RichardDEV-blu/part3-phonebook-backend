const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)
const helper = require('./test_helper')


describe('user creation', () => {

    beforeEach(async () => {
        await User.deleteMany({})
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

})


after(async () => {
    await mongoose.connection.close()
})