'use client'
export default function Error({ error }) {
  return (
    <main className="error">
      <h1>An Error Occurred!</h1>
      <p>{error.message}</p>
    </main>
  )
}
