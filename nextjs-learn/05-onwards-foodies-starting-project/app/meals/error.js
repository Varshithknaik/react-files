'use client'
export default function Error({ error }) {
  return (
    <main className="error">
      <h1>An Error Occurred!</h1>
      <p>Failed to fetch meal data. Please try again later</p>
    </main>
  )
}
