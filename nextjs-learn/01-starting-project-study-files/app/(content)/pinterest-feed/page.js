'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { MasonryComponent } from './component/Masonry.component'

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

const MIN_COL_COUNT = 3
const DEFAULT_COL_WIDTH = 300
const GAP = 12

export default function PinterestFeedPage() {
  const [paintedPins, setPainetedPins] = useState([])
  const [loading, setLoading] = useState(false)

  //
  const [colCount, setColCount] = useState(MIN_COL_COUNT)
  const [colWidth, setColWidth] = useState(DEFAULT_COL_WIDTH)

  const sentinelRef = useRef()
  const hasMoreRef = useRef(true)
  const pageRef = useRef(0)
  const columnHeights = useRef([])
  const loadedPinsRef = useRef([])
  const allPinsRef = useRef([])
  const paintPointerRef = useRef(0)
  const loadingRef = useRef(false)

  //
  const containerRef = useRef()
  const intersectionObserverRef = useRef()

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      const containerWidth = entry.contentRect.width

      const count = Math.max(
        1,
        Math.floor((containerWidth + GAP) / (DEFAULT_COL_WIDTH + GAP))
      )

      const width = (containerWidth - (count - 1) * GAP) / count

      console.log({ count, width }, 'cpl', containerWidth)

      setColCount(count)
      setColWidth(width)
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

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
    if (loadingRef.current || !hasMoreRef.current) return

    loadingRef.current = true
    setLoading(true)

    try {
      const response = await fetch(`/api/pins?page=${pageRef.current}`)
      const { pins } = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (pins.length === 0) {
        hasMoreRef.current = false
        if (intersectionObserverRef.current) {
          intersectionObserverRef.current.disconnect()
        }
        return
      }

      const layoutPins = calculateLayout(
        pins,
        colWidth,
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

        preloadImage(pin.url)
          .catch(() => console.log('fail to load the image'))
          .finally(() => {
            loadedPinsRef.current[globalIndex] = true
            schedulePaint()
          })
      })
      pageRef.current++
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [colCount, colWidth])

  const handleIntersection = useCallback(
    (entries) => {
      const entry = entries[0]
      console.log('inter')
      if (entry.isIntersecting) {
        loadBatch()
      }
    },
    [loadBatch]
  )

  useEffect(() => {
    columnHeights.current = new Array(colCount).fill(0)

    const recalculatedValue = calculateLayout(
      allPinsRef.current,
      colWidth,
      GAP,
      columnHeights.current
    )

    allPinsRef.current = recalculatedValue

    const visiblePins = recalculatedValue.filter(
      (_, idx) => loadedPinsRef.current[idx]
    )

    setPainetedPins(visiblePins)
  }, [colCount, colWidth])

  useEffect(() => {
    intersectionObserverRef.current = new IntersectionObserver(
      handleIntersection,
      {
        rootMargin: '400px',
      }
    )
    if (sentinelRef.current) {
      intersectionObserverRef.current.observe(sentinelRef.current)
    }

    return () => intersectionObserverRef.current.disconnect()
  }, [handleIntersection])

  const skeletonPins = useMemo(() => {
    if (!loading) return []

    const pins = Array.from({ length: 12 }).map((_, i) => ({
      id: `skeleton-${i}`,
      height: 250 + Math.random() * 200,
      isSkeleton: true,
    }))

    console.log('skeleton width', colWidth)

    const copyColumnHeights = [...columnHeights.current].slice(
      0,
      paintPointerRef.current ?? 0
    )

    const fakePinsColumnHeights =
      copyColumnHeights && copyColumnHeights.length
        ? [...copyColumnHeights]
        : new Array(colCount).fill(0)

    return calculateLayout(pins, colWidth, GAP, fakePinsColumnHeights)
  }, [loading, colCount, colWidth])

  const allVisiblePins = useMemo(() => {
    return [...paintedPins, ...skeletonPins]
  }, [skeletonPins, paintedPins])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          height: Math.max(...columnHeights.current),
        }}
      >
        {allVisiblePins.map((pin) => (
          <MasonryComponent key={pin.id} pin={pin} />
        ))}
        <div
          ref={sentinelRef}
          style={{
            position: 'absolute',
            bottom: 0,
            height: '1px',
            width: '100%',
            background: 'transparent',
          }}
        />
      </div>
    </>
  )
}
