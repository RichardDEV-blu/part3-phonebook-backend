const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

describe('login', () => {
    beforeEach(async () => {
        await helper.initializeUsers()
    })

    test('succeeds with correct credentials', async () => {
        const credentials = {
            username: 'testuser',
            password: 'password'
        }

        const response = await api
            .post('/api/login')
            .send(credentials)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert(response.body.token)
        assert.strictEqual(response.body.username, 'testuser')
        assert.strictEqual(response.body.name, 'Test User')
    })

    test('fails with status code 401 if password is incorrect', async () => {
        const credentials = {
            username: 'testuser',
            password: 'wrongpassword'
        }

        await api
            .post('/api/login')
            .send(credentials)
            .expect(401)
    })

    test('fails with status code 401 if username does not exist', async () => {
        const credentials = {
            username: 'doesnotexist',
            password: 'password'
        }

        await api
            .post('/api/login')
            .send(credentials)
            .expect(401)
    })
})

after(async () => {
    await mongoose.connection.close()
})