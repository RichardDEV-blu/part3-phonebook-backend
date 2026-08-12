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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}

