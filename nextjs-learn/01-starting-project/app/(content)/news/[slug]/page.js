import { DUMMY_NEWS } from '@/dummy-news'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default function NewsDetails({ params }) {
  const newsId = params.slug
  const newsItem = DUMMY_NEWS.find((news) => news.slug === newsId)

  if (!newsItem) {
    notFound()
  }
  return (
    <article className="news-article">
      <header>
        <Link href={`/news/${newsId}/image`}>
          <img
            src={`/images/news/${newsItem.image}`}
            alt={newsItem.title}
            width={1000}
          />
        </Link>

        <h1>{newsItem.title}</h1>
        <time dateTime={newsItem.date}>{newsItem.date}</time>
      </header>
      <p>{newsItem.content}</p>
    </article>
  )
}
