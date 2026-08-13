const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await helper.initializeBlogs()
  })

  test('blogs are returned as JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blogs have an id property', async () => {
    const response = await api.get('/api/blogs')
    assert(response.body.every(blog => blog.id))
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
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
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.title, newBlog.title)
      assert.strictEqual(response.body.author, newBlog.author)
      assert.strictEqual(response.body.url, newBlog.url)
      assert.strictEqual(response.body.likes, newBlog.likes)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Testing blog'))
    })

    test('if likes is missing, it defaults to 0', async () => {
      const newBlog = {
        title: 'Blog without likes',
        author: 'Richard',
        url: 'https://example.com'
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const newBlog = {
        author: 'Richard',
        url: 'https://example.com',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const newBlog = {
        title: 'Blog without URL',
        author: 'Richard',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})