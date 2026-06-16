import Image from 'next/image'
import Link from 'next/link'

export default function NewsList({ news }) {
  return (
    <ul className="news-list">
      {news.map((singleNewsItem) => (
        <li key={singleNewsItem.id}>
          <Link href={`/news/${singleNewsItem.slug}`}>
            <Image
              src={`/images/news/${singleNewsItem.image}`}
              alt={singleNewsItem.title}
              width={500}
              height={500}
            />
            <h3>{singleNewsItem.title}</h3>
          </Link>
        </li>
      ))}
    </ul>
  )
}
