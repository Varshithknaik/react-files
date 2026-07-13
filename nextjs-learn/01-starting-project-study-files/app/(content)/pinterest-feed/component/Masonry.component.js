'use client'
import { useState } from 'react'
export const MasonryComponent = ({ pin }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  return (
    <div
      key={pin.id}
      style={{
        position: 'absolute',
        display: 'flex',
        flexShrink: 0,
        left: pin.left,
        top: pin.top,
        width: pin.width,
        height: pin.height,
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* {pin.isSkeleton ? (
        <div
          style={{
            backgroundColor: '#e2e8f0',
            width: '100%',
            height: '100%',
            borderRadius: '1rem',

          }}
        />
      ) : (
        <img
          src={pin.url}
          alt={pin.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: isLoaded || hasError ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={(e) => setIsLoaded(true)}
          onError={(e) => {
            setHasError(true)
            // prevent infinite loop if fallback image also fails
            if (!e.currentTarget.dataset.fallbackApplied) {
              e.currentTarget.dataset.fallbackApplied = true
              ;((e.currentTarget.src =
                'https://images.unsplash.com/photo-1517457374969-3d960c1b358d?w=500&h=500&fit=crop'),
                (e.currentTarget.alt = 'Image Unavailable'),
                (e.currentTarget.style.opacity = 1))
            }
          }}
        />
      )} */}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#cbd5e1',
          opacity: isLoaded ? 0 : 1, // Fades out when image loads!
          transition: 'opacity 0.5s ease',
        }}
      />
      <img
        src={pin.url}
        alt={pin.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoaded || hasError ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onLoad={(e) => setIsLoaded(true)}
        onError={(e) => {
          setHasError(true)
          // prevent infinite loop if fallback image also fails
          if (!e.currentTarget.dataset.fallbackApplied) {
            e.currentTarget.dataset.fallbackApplied = true
            ;((e.currentTarget.src =
              'https://images.unsplash.com/photo-1517457374969-3d960c1b358d?w=500&h=500&fit=crop'),
              (e.currentTarget.alt = 'Image Unavailable'),
              (e.currentTarget.style.opacity = 1))
          }
        }}
      />
    </div>
  )
}
