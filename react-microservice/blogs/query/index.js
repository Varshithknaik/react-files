const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const posts = {}

app.get('/posts', (req, res) => {
  res.status(200).send(posts)
})

app.post('/events', (req, res) => {
  const { type, data } = req.body

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

  res.status(200).send({ status: 'OK' })
})

app.listen(4002, () => {
  console.log('Listening on 4002')
})
