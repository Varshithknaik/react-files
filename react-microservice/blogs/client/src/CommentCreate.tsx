import axios from "axios"
import { useState } from "react"

type CommentCreateProps = {
  postId: string
}

export default function CommentCreate({ postId }: CommentCreateProps) {
  const [content, setContent] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await axios.post(`http://localhost:4001/posts/${postId}/comments`, {
      content,
    })
    setContent('')
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3 form-group">
        <label className="form-label" htmlFor={`comment-${postId}`}>
          New Comment
        </label>
        <input
          className="form-control"
          id={`comment-${postId}`}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  )
}
