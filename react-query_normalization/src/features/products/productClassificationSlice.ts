import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ClassificationGroup } from '../../data/schema'

interface State {
  byGroup: Record<string, ClassificationGroup[]>
}

const initialState: State = {
  byGroup: {},
}

export const slice = createSlice({
  name: 'productClassification',
  initialState,
  reducers: {
    importClassification(state, action: PayloadAction<ClassificationGroup[]>) {
      action.payload.forEach((group) => {
        state.byGroup[group.groupId] = action.payload
      })
    },
  },
})

export const { importClassification } = slice.actions
export default slice.reducer
