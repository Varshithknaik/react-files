// Dynamically generate an additional 100 pins for testing
const PINS = Array.from({ length: 500 }).map((_, i) => {
  const height = 250 + Math.floor(Math.random() * 200)
  return {
    id: i,
    url: `https://picsum.photos/400/${height}?random=${i}`,
    alt: `Random image ${i}`,
    height,
  }
})

const PAGE_SIZE = 20

export function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0', 10)

  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pins = PINS.slice(start, end)

  return Response.json({ pins })
}
