import PostForm from '@/components/post-form'
import { createPost } from '@/actions/posts'

export default function NewPostPage() {
  return <PostForm createPost={createPost} />
}
