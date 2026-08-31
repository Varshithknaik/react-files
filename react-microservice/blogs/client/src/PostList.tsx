import axios from "axios"
import { useEffect, useState } from "react"
import CommentCreate from "./CommentCreate"
import CommentList from "./CommentList"

type Comment = {
  id: string
  content: string
}

type Post = {
  id: string
  title: string
  comments: Comment[]
}

export default function PostList() {
  const [posts, setPosts] = useState<Record<string, Post>>({})

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get<Record<string, Post>>(
        'http://localhost:4002/posts',
      )
      console.log(response)

      setPosts(response.data)
    }

    void fetchPosts()
  }, [])

  const renderedPosts = Object.values(posts).map((post) => {
    return (
      <div className="card" style={{ width: '30%', marginBottom: '20px' }} key={post.id}>
        <div className="card-body">
          <h3>{post.title}</h3>
          <CommentList comments={post.comments} />
          <CommentCreate postId={post.id} />
        </div>
      </div>
    )
  })

  return (
    <div className="d-flex flex-row flex-wrap justify-content-between">
      {renderedPosts}
    </div>
  )
}
