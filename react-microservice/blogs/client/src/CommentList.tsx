import axios from "axios"
import { useEffect, useState } from "react"

type Comment = {
  id: string
  content: string
}

type CommentListProps = {
  postId: string
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get<Comment[]>(
        `http://localhost:4001/posts/${postId}/comments`,
      )

      setComments(response.data)
    }

    void fetchComments()
  }, [postId])

  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{comment.content}</li>
  })

  return <ul>{renderedComments}</ul>
}
