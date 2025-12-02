import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from './taskSlice'
import usersReducer from './userSlice'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
