import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Task {
  id: number
  title: string
  userId: string
}

interface TasksState {
  entites: Record<string, Task>
}

const initialState: TasksState = {
  entites: {},
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addMany(state, action: PayloadAction<Task[]>) {
      action.payload.forEach((task) => {
        state.entites[task.id] = task
      })
    },
  },
})

export const { addMany } = tasksSlice.actions

export default tasksSlice.reducer
