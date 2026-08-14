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
        await helper.initializeUsers()
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
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                title: 'Testing blog',
                author: 'Richard',
                url: 'https://testingblog.com',
                likes: 5
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.title, newBlog.title)
            assert.strictEqual(response.body.author, newBlog.author)
            assert.strictEqual(response.body.url, newBlog.url)
            assert.strictEqual(response.body.likes, newBlog.likes)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(
                blogsAtEnd.length,
                helper.initialBlogs.length + 1
            )

            const titles = blogsAtEnd.map(b => b.title)
            assert(titles.includes('Testing blog'))
        })

        test('if likes is missing, it defaults to 0', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                title: 'Blog without likes',
                author: 'Richard',
                url: 'https://example.com'
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)

            assert.strictEqual(response.body.likes, 0)
        })

        test('fails with status code 400 if title is missing', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                author: 'Richard',
                url: 'https://example.com',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(
                blogsAtEnd.length,
                helper.initialBlogs.length
            )
        })

        test('fails with status code 400 if url is missing', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                title: 'Blog without URL',
                author: 'Richard',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(
                blogsAtEnd.length,
                helper.initialBlogs.length
            )
        })

        test('the creator of the blog is returned with the blog', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                title: 'Blog with creator',
                author: 'Richard',
                url: 'https://example.com',
                likes: 5
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)

            const blogs = await api
                .get('/api/blogs')
                .expect(200)

            const createdBlog = blogs.body.find(
                blog => blog.id === response.body.id
            )

            assert.strictEqual(createdBlog.user.username, 'testuser')
            assert.strictEqual(createdBlog.user.name, 'Test User')
        })

        test('fails with status code 401 if token is not provided', async () => {
            const newBlog = {
                title: 'Blog without token',
                author: 'Richard',
                url: 'https://example.com',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(
                blogsAtEnd.length,
                helper.initialBlogs.length
            )
        })

    })

    describe('deletion of a blog', () => {

        test('succeeds with status 204 if id is valid and user is the owner', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                title: 'Blog to delete',
                author: 'Richard',
                url: 'https://example.com',
                likes: 5
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)

            await api
                .delete(`/api/blogs/${response.body.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(
                blogsAtEnd.length,
                helper.initialBlogs.length
            )

            const titles = blogsAtEnd.map(b => b.title)
            assert(!titles.includes('Blog to delete'))
        })


        test('fails with status 401 if user is not the owner', async () => {
            const firstLogin = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const firstToken = firstLogin.body.token

            const newUser = {
                username: 'seconduser',
                name: 'Second User',
                password: 'password'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)

            const secondLogin = await api
                .post('/api/login')
                .send({
                    username: 'seconduser',
                    password: 'password'
                })
                .expect(200)

            const secondToken = secondLogin.body.token

            const newBlog = {
                title: 'Blog owned by testuser',
                author: 'Richard',
                url: 'https://example.com',
                likes: 5
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${firstToken}`)
                .send(newBlog)
                .expect(201)

            await api
                .delete(`/api/blogs/${response.body.id}`)
                .set('Authorization', `Bearer ${secondToken}`)
                .expect(401)

            const blogsAtEnd = await helper.blogsInDb()

            assert(
                blogsAtEnd.some(blog => blog.id === response.body.id)
            )
        })


        test('fails with status 401 if token is not provided', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const newBlog = {
                title: 'Blog without delete token',
                author: 'Richard',
                url: 'https://example.com',
                likes: 5
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)

            await api
                .delete(`/api/blogs/${response.body.id}`)
                .expect(401)

            const blogsAtEnd = await helper.blogsInDb()

            assert(
                blogsAtEnd.some(blog => blog.id === response.body.id)
            )
        })


        test('fails with status code 400 if id is invalid', async () => {
            const loginResponse = await api
                .post('/api/login')
                .send({
                    username: 'testuser',
                    password: 'password'
                })
                .expect(200)

            const token = loginResponse.body.token

            const invalidID = '123invalid65FG32'

            await api
                .delete(`/api/blogs/${invalidID}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)
        })

    })


    describe('updating a blog', () => {

        test('succeeds with valid data', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const toUpdate = blogsAtStart[0]

            const updated = {
                title: toUpdate.title,
                author: toUpdate.author,
                url: toUpdate.url,
                likes: toUpdate.likes + 1
            }

            const response = await api
                .put(`/api/blogs/${toUpdate.id}`)
                .send(updated)
                .expect(200)

            assert.strictEqual(response.body.likes, toUpdate.likes + 1)
        })

        test('the updated blog is saved in the database', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const toUpdate = blogsAtStart[0]

            const updated = {
                title: toUpdate.title,
                author: toUpdate.author,
                url: toUpdate.url,
                likes: toUpdate.likes + 1
            }

            await api
                .put(`/api/blogs/${toUpdate.id}`)
                .send(updated)
                .expect(200)

            const blogsAtEnd = await helper.blogsInDb()

            const updatedInMongo = blogsAtEnd.find(
                blog => blog.id === toUpdate.id
            )

            assert.strictEqual(
                updatedInMongo.likes,
                toUpdate.likes + 1
            )
        })

    })

})

after(async () => {
    await mongoose.connection.close()
})