/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/mockDb.ts
export type MasterProduct = {
  id: string
  name: string
  hscode: string
  groupId: string
}
export type DetailProduct = {
  id: string
  brand?: string
  packaging?: { size?: string; type?: string }
  attributes?: { key: string; value: string }[]
  lastUpdated?: string
}
export type ClassificationItem = { id: string; classification: string }

export const groups = [
  { id: '15', jobId: 'job1', name: 'Group 15' },
  { id: '16', jobId: 'job1', name: 'Group 16' },
]

export const productsMaster: MasterProduct[] = [
  { id: 'p1', name: 'Oil', hscode: '150100', groupId: '15' },
  { id: 'p2', name: 'Fat', hscode: '150200', groupId: '15' },
  { id: 'p3', name: 'Fish', hscode: '160100', groupId: '16' },
  // Add more items for pagination demo
]

export const productsDetail: DetailProduct[] = [
  {
    id: 'p1',
    brand: 'XZY',
    packaging: { size: '500ml', type: 'Bottle' },
    attributes: [{ key: 'color', value: 'golden' }],
    lastUpdated: '2025-02-01',
  },
  {
    id: 'p2',
    brand: 'FOO',
    packaging: { size: '1L', type: 'Can' },
    attributes: [{ key: 'state', value: 'solid' }],
    lastUpdated: '2025-02-02',
  },
]

export const classificationByGroup: Record<string, ClassificationItem[]> = {
  '15': [
    { id: 'p1', classification: 'Edible Oil' },
    { id: 'p2', classification: 'Animal Fat' },
  ],
  '16': [{ id: 'p3', classification: 'Seafood' }],
}

// Utility: server-side pagination/filter/sort simulation
export function queryProductsMaster(params: {
  page: number
  pageSize: number
  sortModel?: { colId: string; sort: 'asc' | 'desc' }[]
  filterModel?: Record<string, any>
}) {
  const { page, pageSize, sortModel, filterModel } = params
  let items = [...productsMaster]

  // filtering simple equality filters (demo)
  if (filterModel) {
    for (const key of Object.keys(filterModel)) {
      const val = filterModel[key]
      if (val && val.filter) {
        items = items.filter((it: any) =>
          String(it[key])
            .toLowerCase()
            .includes(String(val.filter).toLowerCase())
        )
      }
    }
  }

  // sorting
  if (Array.isArray(sortModel) && sortModel.length > 0) {
    const s = sortModel[0]
    items.sort((a: any, b: any) => {
      const aval = a[s.colId]
      const bval = b[s.colId]
      if (aval === bval) return 0
      if (s.sort === 'asc') return aval > bval ? 1 : -1
      return aval < bval ? 1 : -1
    })
  }

  const totalCount = items.length
  const start = page * pageSize
  const end = start + pageSize
  const pageItems = items.slice(start, end)

  return { items: pageItems, totalCount }
}
