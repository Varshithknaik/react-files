import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ProductDetails } from '../../data/schema'

interface State {
  byId: Record<string, ProductDetails>
}

const initialState: State = {
  byId: {},
}

export const slice = createSlice({
  name: 'productDetails',
  initialState,
  reducers: {
    importDetails(state, action: PayloadAction<ProductDetails>) {
      state.byId[action.payload.id] = action.payload
    },
  },
})

export const { importDetails } = slice.actions
export default slice.reducer
