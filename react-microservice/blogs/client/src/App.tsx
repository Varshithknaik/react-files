
import './App.css'
import PostCreate from './PostCreate'
import PostList from './PostList'

function App() {
  return (
    <main className="container py-4">
      <h1>Create Post</h1>
      <PostCreate />
      <hr />
      <h1>Posts</h1>
      <PostList />
    </main>
  )
}

export default App
