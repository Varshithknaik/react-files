import styles from './styles.module.css'

const pins = [
  { height: 160, id: 1 },
  { height: 70, id: 2 },
  { height: 130, id: 3 },
  { height: 160, id: 4 },
  { height: 70, id: 5 },
  { height: 130, id: 6 },
  { height: 70, id: 7 },
  { height: 80, id: 8 },
  { height: 100, id: 9 },
  { height: 130, id: 10 },
  { height: 140, id: 11 },
  { height: 160, id: 12 },
  { height: 100, id: 13 },
  { height: 60, id: 14 },
]

const NUM_COLS = 3
const GAP = 10
const COL_WIDTH = 70

const arrangeRoundRobin = (pins) => {
  const columnsHeights = Array(NUM_COLS).fill(0)

  return pins.map((pin, index) => {
    let currCol = index % NUM_COLS

    const top = columnsHeights[currCol]
    columnsHeights[currCol] += pin.height + GAP

    return {
      ...pin,
      left: currCol * COL_WIDTH + Math.max(currCol, 0) * GAP,
      top,
      width: COL_WIDTH,
    }
  })
}

export default function RoundRobinPage() {
  return (
    <div>
      <h1>Round Robin Placement</h1>
      <div className={styles.container}>
        {arrangeRoundRobin(pins).map(({ left, top, height, id, width }) => {
          return (
            <div
              key={id}
              className={styles.item}
              style={{ top, left, height, width }}
            >
              {id}
            </div>
          )
        })}
      </div>
    </div>
  )
}
