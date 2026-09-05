const express = require('express')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors())
app.use(express.json())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex')

  const { content } = req.body

  const { id } = req.params
  const comments = commentsByPostId[id] || []

  comments.push({ id: commentId, content, status: 'pending' })

  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: id,
      status: 'pending',
    },
  })

  commentsByPostId[id] = comments

  res.status(201).send(comments)
})

app.post('/events', (req, res) => {
  const { type, data } = req.body
  console.log('Received Events', type, data)

  // if (type === 'PostCreated') {
  //   const { id, title } = data
  //   posts[id] = { id, title, comments: [] }
  // }

  res.send({ status: 'OK' })
})

app.listen(4001, () => {
  console.log('Listening on 4001')
})
