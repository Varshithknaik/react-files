const MOCK_PINS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400', alt: 'Landscape valley with river', height: 320 },
  { id: 2, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', alt: 'Starry mountain night', height: 400 },
  { id: 3, url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400', alt: 'Mountain lake at sunset', height: 280 },
  { id: 4, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', alt: 'Foggy forest path', height: 350 },
  { id: 5, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400', alt: 'Autumn forest trail', height: 300 },
  { id: 6, url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400', alt: 'Green hills and sky', height: 260 },
  { id: 7, url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400', alt: 'Waterfall in jungle', height: 420 },
  { id: 8, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', alt: 'Tropical beach', height: 280 },
  { id: 9, url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400', alt: 'Ocean waves aerial', height: 340 },
  { id: 10, url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400', alt: 'Northern lights', height: 380 },
  { id: 11, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', alt: 'Sunlit mountain meadow', height: 300 },
  { id: 12, url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400', alt: 'Calm lake reflection', height: 350 },
  { id: 13, url: 'https://images.unsplash.com/photo-1500534314263-a3d2f76498f7?w=400', alt: 'Desert sand dunes', height: 290 },
  { id: 14, url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400', alt: 'Golden wheat field', height: 310 },
  { id: 15, url: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=400', alt: 'Rocky cliff coast', height: 370 },
  { id: 16, url: 'https://images.unsplash.com/photo-1465056836900-8f1e940b3925?w=400', alt: 'Pink sunset sky', height: 260 },
  { id: 17, url: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400', alt: 'River through mountains', height: 400 },
  { id: 18, url: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=400', alt: 'Tropical island aerial', height: 320 },
  { id: 19, url: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400', alt: 'Turquoise ocean water', height: 280 },
  { id: 20, url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400', alt: 'Person on cliff at sunset', height: 360 },
  { id: 21, url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400', alt: 'Misty green mountains', height: 340 },
  { id: 22, url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400', alt: 'Autumn lake reflection', height: 300 },
  { id: 23, url: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400', alt: 'Snowy mountain peak', height: 420 },
  { id: 24, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', alt: 'Dramatic mountain ridges', height: 380 },
  { id: 25, url: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400', alt: 'Lake with mountain backdrop', height: 310 },
  { id: 26, url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400', alt: 'Pine trees and sky', height: 350 },
  { id: 27, url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400', alt: 'Boat on mountain lake', height: 290 },
  { id: 28, url: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=400', alt: 'Colorful sunset hills', height: 270 },
  { id: 29, url: 'https://images.unsplash.com/photo-1431631927486-6603c22bf401?w=400', alt: 'Wildflower field', height: 330 },
  { id: 30, url: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400', alt: 'Starry night over lake', height: 400 },
  { id: 31, url: 'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=400', alt: 'Cherry blossom trees', height: 320 },
  { id: 32, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', alt: 'Sunlight through forest', height: 360 },
  { id: 33, url: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=400', alt: 'Calm ocean horizon', height: 250 },
  { id: 34, url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400', alt: 'Mountain above clouds', height: 390 },
  { id: 35, url: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=400', alt: 'Country road sunset', height: 300 },
  { id: 36, url: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=400', alt: 'Dark moody forest', height: 370 },
  { id: 37, url: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=400', alt: 'Lavender field rows', height: 280 },
  { id: 38, url: 'https://images.unsplash.com/photo-1485470733090-0aae1788d668?w=400', alt: 'Aerial coastline view', height: 340 },
  { id: 39, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', alt: 'Green valley aerial', height: 310 },
  { id: 40, url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400', alt: 'Beach sunset silhouette', height: 350 },
  { id: 41, url: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400', alt: 'Alpine lake reflection', height: 400 },
  { id: 42, url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400', alt: 'Misty mountain sunrise', height: 330 },
  { id: 43, url: 'https://images.unsplash.com/photo-1528184039930-bd03972bd974?w=400', alt: 'Tropical palm trees', height: 290 },
  { id: 44, url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=400', alt: 'Winding mountain road', height: 360 },
  { id: 45, url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400', alt: 'Hot air balloon landscape', height: 380 },
  { id: 46, url: 'https://images.unsplash.com/photo-1500049242364-5f500807cdd7?w=400', alt: 'Rainy city street', height: 300 },
  { id: 47, url: 'https://images.unsplash.com/photo-1520262494112-9fe481d36ec3?w=400', alt: 'Japanese garden bridge', height: 340 },
  { id: 48, url: 'https://images.unsplash.com/photo-1516298773066-dec23247de14?w=400', alt: 'Frozen lake winter', height: 270 },
  { id: 49, url: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400', alt: 'Sunbeams through trees', height: 410 },
  { id: 50, url: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400', alt: 'Purple sky mountains', height: 320 },
]

const PAGE_SIZE = 10

export function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0', 10)

  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pins = MOCK_PINS.slice(start, end)

  return Response.json({ pins })
}
