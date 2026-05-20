export default function BlogPostPage({ params }) {
  return (
    <main>
      <h1>Title of Blog Post</h1>
      <p>Content of Blog Post</p>
      <p>{params.slug}</p>
    </main>
  )
}
