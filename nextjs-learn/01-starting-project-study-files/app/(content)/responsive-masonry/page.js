'use client'

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

export default function ResponsiveMasonryPage() {
  return <>Responsive</>
}
