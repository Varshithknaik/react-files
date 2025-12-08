/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api.ts
import type { MasterProduct, DetailProduct } from '../api/mockDb'

export type PageParams = {
  page: number
  pageSize: number
  sortModel?: { colId: string; sort: 'asc' | 'desc' }[]
  filterModel?: Record<string, any>
}

export async function fetchProductMasterPage(params: PageParams) {
  // encode params as JSON string q param (simple approach)
  const q = encodeURIComponent(JSON.stringify(params))
  const res = await fetch(`/api/products?q=${q}`)
  if (!res.ok) throw new Error('Failed to fetch products page')
  const json = await res.json()
  // expected shape: { items: MasterProduct[], totalCount: number }
  return json as { items: MasterProduct[]; totalCount: number }
}

export async function fetchProductMasterById(id: string) {
  const res = await fetch(`/api/products/${id}/master`)
  if (!res.ok) throw new Error('failed')
  return (await res.json()) as MasterProduct | null
}

export async function fetchProductDetailById(id: string) {
  const res = await fetch(`/api/products/${id}/detail`)
  if (!res.ok) throw new Error('failed')
  return (await res.json()) as DetailProduct | null
}

export async function patchProductMaster(
  payload: Partial<MasterProduct> & { id: string }
) {
  const res = await fetch(`/api/products/${payload.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('patch failed')
  return (await res.json()) as MasterProduct
}

export async function patchProductDetail(
  payload: Partial<DetailProduct> & { id: string }
) {
  const res = await fetch(`/api/products/${payload.id}/detail`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('patch failed')
  return (await res.json()) as DetailProduct
}
