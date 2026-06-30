import { getNewsItem } from '@/lib/news'
import { notFound } from 'next/navigation'

export default async function ImagePage({ params }) {
  const newsId = params.slug
  const newsItem = await getNewsItem(newsId)
  if (!newsItem) {
    notFound()
  }
  return (
    <div className="fullscreen-image">
      <img src={`/images/news/${newsItem.image}`} alt={newsItem.title} />
    </div>
  )
}
