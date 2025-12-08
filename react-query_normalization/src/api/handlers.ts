/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from 'msw'
import {
  groups,
  productsMaster,
  productsDetail,
  classificationByGroup,
  queryProductsMaster,
} from './mockDb'

function parseQ(q?: string | null) {
  if (!q) return { page: 0, pageSize: 50 }
  try {
    return JSON.parse(q)
  } catch {
    return { page: 0, pageSize: 50 }
  }
}

export const handlers = [
  // Groups for a job
  http.get('/api/jobs/:jobId/groups', ({ params }) => {
    const { jobId } = params as any
    return HttpResponse.json(groups.filter((g) => g.jobId === jobId))
  }),

  // Products (paged)
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const params = parseQ(q)
    const result = queryProductsMaster(params as any)
    return HttpResponse.json({
      items: result.items,
      totalCount: result.totalCount,
    })
  }),

  // Master by id
  http.get('/api/products/:id/master', ({ params }) => {
    const { id } = params as any
    const p = productsMaster.find((x) => x.id === id)
    return HttpResponse.json(p ?? null)
  }),

  // Detail by id
  http.get('/api/products/:id/detail', ({ params }) => {
    const { id } = params as any
    const d = productsDetail.find((x) => x.id === id)
    return HttpResponse.json(d ?? null)
  }),

  // Classification by group
  http.get('/api/groups/:groupId/classification', ({ params }) => {
    const { groupId } = params as any
    return HttpResponse.json(classificationByGroup[groupId] ?? [])
  }),

  // Update master
  http.patch('/api/products/:id', async ({ request, params }) => {
    const { id } = params as any
    const body = (await request.json()) as Record<string, any>
    const idx = productsMaster.findIndex((p) => p.id === id)

    if (idx === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    productsMaster[idx] = { ...productsMaster[idx], ...body }

    if (body.groupId) {
      Object.keys(classificationByGroup).forEach((gid) => {
        classificationByGroup[gid] = classificationByGroup[gid].filter(
          (item) => item.id !== id
        )
      })
      classificationByGroup[body.groupId] ??= []
      classificationByGroup[body.groupId].push({
        id,
        classification: 'Unclassified',
      })
    }

    return HttpResponse.json(productsMaster[idx])
  }),

  // Update detail
  http.patch('/api/products/:id/detail', async ({ request, params }) => {
    const { id } = params as any
    const body = (await request.json()) as Record<string, any>
    const idx = productsDetail.findIndex((d) => d.id === id)

    if (idx === -1) {
      const created = { id, ...body }
      productsDetail.push(created)
      return HttpResponse.json(created)
    }

    productsDetail[idx] = { ...productsDetail[idx], ...body }
    return HttpResponse.json(productsDetail[idx])
  }),
]
