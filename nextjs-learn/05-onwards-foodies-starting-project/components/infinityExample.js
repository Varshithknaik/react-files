//https://dummyjson.com/RESOURCE/?limit=10&skip=5&select=key1,key2,key3
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
const limit = 10

export function InfinityList() {
  const [page, setPage] = useState(0)
  const [items, setItems] = useState([])
  const [isloading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const observerRef = useRef(null)

  const lastPageRef = useCallback((node) => {
    if (isloading) return

    // prev observer disconnect
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entry) => {
        console.log('entry', entry[0].isIntersecting, hasMore)
        if (entry[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      },
      { rootMargin: '400px' }
    )
    if (node) observerRef.current.observe(node)
  })

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      const res = await fetch(
        `https://dummyjson.com/products?limit=${limit}&skip=${page * limit}`
      )
      const data = await res.json()
      setItems((prev) => [...prev, ...data.products])
      setHasMore(data.products.length === limit)
      setIsLoading(false)
    }
    fetchItems()
  }, [page])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div
            ref={isLast ? lastPageRef : null}
            key={item.id}
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '0.5rem',
              color: 'beige',
            }}
          >
            {item.title}
          </div>
        )
      })}
    </div>
  )
}
