import { getNewsForYear } from '@/lib/news'
import NewsList from '@/components/news-list'

export default function FilteredNewsPage({ params }) {
  const year = params.year
  const news = getNewsForYear(year)
  return <NewsList news={news} />
}
