'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

function calculateLayout(pins, columnWidth, gap, columnHeights) {
  return pins.map((pin) => {
    let shortestCol = columnHeights.indexOf(Math.min(...columnHeights))

    const left = shortestCol * columnWidth + Math.max(shortestCol, 0) * gap
    const top = columnHeights[shortestCol] + gap
    columnHeights[shortestCol] += pin.height + gap

    return {
      ...pin,
      left,
      top,
      width: columnWidth,
    }
  })
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

const COL_COUNT = 3
const COL_WIDTH = 250
const GAP = 12

export default function PinterestFeedPage() {
  const [paintedPins, setPainetedPins] = useState([])
  const [loading, setLoading] = useState(false)

  const sentinelRef = useRef()
  const hasMoreRef = useRef(true)
  const page = useRef(0)
  const columnHeights = useRef([])
  const loadedPinsRef = useRef([])
  const allPinsRef = useRef([])
  const paintPointerRef = useRef(0)

  const schedulePaint = useCallback(() => {
    const newlyPainted = []
    while (
      paintPointerRef.current < loadedPinsRef.current.length &&
      loadedPinsRef.current[paintPointerRef.current]
    ) {
      newlyPainted.push(allPinsRef.current[paintPointerRef.current])
      paintPointerRef.current++
    }

    if (newlyPainted.length > 0) {
      setPainetedPins((prev) => [...prev, ...newlyPainted])
    }
  })

  const loadBatch = useCallback(async () => {
    if (loading || !hasMoreRef.current) return

    setLoading(true)

    try {
      const response = await fetch(`/api/pins?page=${page.current}`)
      const { pins } = await response.json()

      if (pins.length === 0) {
        hasMoreRef.current = false
        return
      }

      if (columnHeights.current.length === 0) {
        columnHeights.current = new Array(COL_COUNT).fill(0)
      }

      const layoutPins = calculateLayout(
        pins,
        COL_WIDTH,
        GAP,
        columnHeights.current
      )

      const offset = allPinsRef.current.length

      loadedPinsRef.current = [
        ...loadedPinsRef.current,
        ...new Array(pins.length).fill(false),
      ]
      allPinsRef.current = [...allPinsRef.current, ...layoutPins]

      layoutPins.forEach((pin, index) => {
        const globalIndex = offset + index

        preloadImage(pin.url).then(() => {
          loadedPinsRef.current[globalIndex] = true
          schedulePaint()
        })
      })

      page.current++
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    loadBatch()
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        marginBlock: 'auto',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {paintedPins.map((pin) => (
        <div
          key={pin.id}
          style={{
            transition: 'opacity 0.3s ease',
            position: 'absolute',
            display: 'flex',
            flexShrink: 0,
            left: pin.left,
            top: pin.top,
            width: pin.width,
            height: pin.height,
            opacity: loadedPinsRef.current[pin.id] ? 1 : 0,
          }}
        >
          <img
            src={pin.url}
            alt={pin.alt}
            style={{ width: '100%', borderRadius: 16, display: 'block' }}
          />
        </div>
      ))}
      <div
        ref={sentinelRef}
        style={{ height: '1px', width: '100%', background: 'transparent' }}
      />
      {loading && <p>Loading more...</p>}
    </div>
  )
}
