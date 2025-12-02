export async function fetchTasks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: 'Fix login',
          user: { id: 10, name: 'Alice' },
        },
        {
          id: 2,
          title: 'Refactor API',
          user: { id: 10, name: 'Alice' },
        },
        {
          id: 3,
          title: 'Create dashboard',
          user: { id: 11, name: 'Bob' },
        },
      ])
    }, 500)
  })
}
