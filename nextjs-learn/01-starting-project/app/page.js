import Link from 'next/link'
import Header from './Header'

export default function Home() {
  console.log('Executing .....')
  return (
    <main>
      <Header />
      <p>🔥 Let&apos;s get started! 🔥</p>
      {/* <a href="/about">About US</a> */}
      <Link href="/about">About US</Link>
    </main>
  )
}
