
type CommentListProps = {
  comments: {
    id: string
    content: string
  }[]
}

export default function CommentList({ comments }: CommentListProps) {
  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{comment.content}</li>
  })

  return <ul>{renderedComments}</ul>
}
