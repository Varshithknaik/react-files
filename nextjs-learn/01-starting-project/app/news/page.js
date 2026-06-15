import Link from 'next/link'
import Image from 'next/image'

import { DUMMY_NEWS } from '@/dummy-news'

export default function News() {
  return (
    <>
      <h1> News Page</h1>
      <ul className="news-list">
        {DUMMY_NEWS.map((news) => (
          <li key={news.id}>
            <Link href={`/news/${news.slug}`}>
              <Image
                src={`/images/news/${news.image}`}
                alt={news.title}
                width={500}
                height={500}
              />
              <h3>{news.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
