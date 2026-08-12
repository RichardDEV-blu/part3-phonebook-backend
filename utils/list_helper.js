const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}


const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  const maxIndex = blogs.reduce((accumulatorIndex, currentBlog, currentIndex, blogsArray) => {
    return currentBlog.likes > blogsArray[accumulatorIndex].likes ? currentIndex : accumulatorIndex
  }, 0)
  const favorite = blogs[maxIndex]
  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  const blogsByAuthor = _.countBy(blogs, 'author')
  const author = _.maxBy(Object.keys(blogsByAuthor),
    author => blogsByAuthor[author])
  return {
    author,
    blogs: blogsByAuthor[author]
  }

}

const mostLikes = (blogs) => {
  const blogsByAuthor = _.groupBy(blogs,'author')
  const authorsNames = Object.keys(blogsByAuthor)
  const likesByAuthor = {}

  authorsNames.forEach(a => {

    const blogs = blogsByAuthor[a]

    const likes = blogs.reduce((acc, blog)=>{
      return acc + blog.likes
    },0)

    likesByAuthor[a] = likes
  })

  const author = _.maxBy(
    Object.keys(likesByAuthor), (a)=>likesByAuthor[a]
  )

  return {
    author,
    likes: likesByAuthor[author]

  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

