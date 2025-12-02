import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
}

interface UsersState {
  entities: Record<string, User>
}

const initialState: UsersState = {
  entities: {},
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addMany(state, action: PayloadAction<User[]>) {
      action.payload.forEach((u) => {
        state.entities[u.id] = u
      })
    },
  },
})

export const { addMany } = usersSlice.actions
export default usersSlice.reducer
