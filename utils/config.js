require('dotenv').config()
const MONGODB_URI = process.env.NODE_ENV === 'test' ?
  process.env.TEST_MONGODB_URI : process.env.MONGODB_URI

console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Using test database:', process.env.NODE_ENV === 'test')


const PORT = process.env.PORT

module.exports = {
  MONGODB_URI,
  PORT
}