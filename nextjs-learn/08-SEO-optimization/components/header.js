import logo from '@/assets/logo.png'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header id="main-header">
      <Link href="/">
        <Image
          src={logo.src}
          alt="Mobile phone with posts feed on it"
          width={40}
          height={40}
          priority
          // sizes="10vw"
        />
      </Link>
      <nav>
        <ul>
          <li>
            <Link href="/feed">Feed</Link>
          </li>
          <li>
            <Link className="cta-link" href="/new-post">
              New Post
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
