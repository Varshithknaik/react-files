import Link from 'next/link'
import { getAvailableNewsYears } from '@/lib/news'

export default function ArchivePage() {
  const links = getAvailableNewsYears()
  console.log('cakked here', links)
  return (
    <header id="archive-header">
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link}>
              <Link href={`/archive/${link}`}>{link}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
