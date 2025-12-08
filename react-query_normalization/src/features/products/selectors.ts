import type { RootState } from '../../store/store'

export const selectMasterById = (id: string) => (state: RootState) =>
  state.productMaster.byId[id]

export const selectDetailsById = (id: string) => (state: RootState) =>
  state.productDetails.byId[id]

export const selectClassificationForProduct =
  (groupId: string) => (state: RootState) =>
    state.productClassification.byGroup[groupId]
