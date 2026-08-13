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

test('blogs have an id property', async () => {
    const response = await api
        .get('/api/blogs')

    assert(response.body.every(blog => blog.id))

})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'Testing blog',
        author: 'Richard',
        url: 'https://testingblog.com',
        likes: 5
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.title, newBlog.title)
    assert.strictEqual(response.body.author, newBlog.author)
    assert.strictEqual(response.body.url, newBlog.url)
    assert.strictEqual(response.body.likes, newBlog.likes)

    const blogs = await api.get('/api/blogs')

    assert.strictEqual(blogs.body.length, helper.initialBlogs.length + 1)
})

test('if likes is missing, it defaults to 0', async ()=>{
    const newBlog = {
        title: 'Blog without likes',
        author: 'Richard',
        url: 'https://example.com'
    } 

    const response = await api.post('/api/blogs')
    .send(newBlog).expect(201)

    assert.strictEqual(response.body.likes,0)


})

after(async () => {
    await mongoose.connection.close()
})