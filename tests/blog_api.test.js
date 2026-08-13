const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await helper.initializeBlogs()
})

test('blogs are returned as JSON', async () => {
    const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blogs have an id property',async ()=>{
    const response = await api
        .get('/api/blogs')

    assert(response.body.every(blog=>blog.id))

})

after(async () => {
    await mongoose.connection.close()
})