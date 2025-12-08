import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from './taskSlice'
import usersReducer from './userSlice'
import productMasterReducer from '../features/products/productMasterSlice.ts'
import productDetailsReducer from '../features/products/productDetailsSlice.ts'
import productClassificationReducer from '../features/products/productClassificationSlice.ts'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    users: usersReducer,
    productMaster: productMasterReducer,
    productDetails: productDetailsReducer,
    productClassification: productClassificationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
