'use client'

import NewsList from '@/components/news-list'
import { useEffect, useState } from 'react'

export default function News() {
  const [error, setError] = useState()
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true)
      const response = await fetch('http://localhost:8080/news')

      if (!response.ok) {
        setError('Failed to fetch news')
      }
      const data = await response.json()
      setNews(data)
      setIsLoading(false)
    }
    fetchNews()
  }, [])

  if (isLoading) {
    return <p>Loading news...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  let newsContent

  if (news) {
    newsContent = <NewsList news={news} />
  }

  return (
    <>
      <h1> News Page</h1>
      {newsContent}
    </>
  )
}
