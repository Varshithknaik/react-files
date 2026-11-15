const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const posts = {}

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data
    const comments = posts[postId].comments || []
    comments.push({ id, content, status })
    posts[postId].comments = comments
  }

  if (type === 'CommentUpdated') {
    const { postId, id, status, content } = data

    const comments = posts[postId].comments
    const comment = comments.find((comment) => comment.id === id)
    comment.status = status
    comment.content = content
  }
}

app.get('/posts', (req, res) => {
  res.status(200).send(posts)
})

app.post('/events', (req, res) => {
  const { type, data } = req.body

  handleEvent(type, data)

  res.status(200).send({ status: 'OK' })
})

const loadEvents = async () => {
  let attempt = 0

  while (true) {
    try {
      const { data } = await axios.get('http://event-bus-srv:4005/events')
      const { events } = data

      for (const event of events) {
        handleEvent(event.type, event.data)
      }

      return
    } catch (error) {
      attempt += 1
      const delay = Math.min(1000 * 2 ** (attempt - 1), 10000)

      console.error(
        `Event bus unavailable (attempt ${attempt}). Retrying in ${delay}ms...`,
        error.code,
      )
      await sleep(delay)
    }
  }
}

app.listen(4002, () => {
  console.log('Listening on 4002')

  loadEvents()
})
