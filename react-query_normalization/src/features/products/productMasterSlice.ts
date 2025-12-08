import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ProductMaster } from '../../data/schema'

interface state {
  byId: Record<string, ProductMaster>
  allIds: string[]
}

const initialState: state = {
  byId: {},
  allIds: [],
}

const slice = createSlice({
  name: 'productMaster',
  initialState,
  reducers: {
    importMaster(state, action: PayloadAction<ProductMaster[]>) {
      action.payload.forEach((product) => {
        state.byId[product.id] = product
        if (!state.allIds.includes(product.id)) state.allIds.push(product.id)
      })
    },
    updateMaster(state, action: PayloadAction<ProductMaster>) {
      state.byId[action.payload.id] = action.payload
    },
  },
})

export const { importMaster, updateMaster } = slice.actions
export default slice.reducer
