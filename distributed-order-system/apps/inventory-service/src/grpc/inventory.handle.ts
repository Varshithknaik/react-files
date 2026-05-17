import { InventoryServiceServer } from 'packages/proto-pack/dist/index.js'
import {
  addInventory,
  bulkAddInventory,
  getInventory,
  listInventory,
} from '../reporitory/inventory.repository.js'
import {
  addInventoryDomainSchema,
  bulkAddInventoryDomainSchema,
  getInventoryDomainSchema,
  listInventoryDomainSchema,
} from '../schema/inventory.schema.js'
import { toGrpcError } from '../lib/grpc-error.js'

export const InventoryService: InventoryServiceServer = {
  async addInventory(call, callback) {
    try {
      const payload = addInventoryDomainSchema.safeParse(call.request)

      if (!payload.success) {
        return callback(payload.error, null)
      }
      const response = await addInventory(payload.data)

      callback(null, {
        sku: response.sku,
      })
    } catch (error) {
      const grpcError = toGrpcError(error)
      callback(grpcError, null as never)
    }
  },
  async bulkAddInventory(call, callback) {
    try {
      const payload = bulkAddInventoryDomainSchema.safeParse(call.request)
      if (!payload.success) {
        return callback(payload.error, null)
      }
      const response = await bulkAddInventory(payload.data)
      callback(null, {
        products: response.map((item) => ({
          sku: item.sku,
        })),
        totalAdded: response.length,
      })
    } catch (err) {
      const grpcError = toGrpcError(err)
      callback(grpcError, null as never)
    }
  },
  async getInventory(call, callback) {
    try {
      const payload = getInventoryDomainSchema.safeParse(call.request)
      if (!payload.success) {
        return callback(payload.error, null)
      }
      const response = await getInventory(payload.data)
      callback(null, {
        sku: response.sku,
        name: response.name,
        category: response.category,
        stock: response.stock,
        price: response.price,
        offerPrice: response.offerPrice || undefined,
      })
    } catch (error) {
      const grpcError = toGrpcError(error)
      callback(grpcError, null as never)
    }
  },
  // Ideally not cut-out for cursor-based pagination.
  // But we do what we can.
  async listInventory(call, callback) {
    try {
      const payload = listInventoryDomainSchema.safeParse(call.request)
      if (!payload.success) {
        return callback(payload.error, null)
      }
      const response = await listInventory(payload.data)

      const hasNext = response.length > payload.data.limit
      const products = hasNext ? response.slice(0, -1) : response

      callback(null, {
        products: products.map((item) => {
          return {
            sku: item.sku,
            name: item.name,
            category: item.category,
            stock: item.stock,
            price: item.price,
            offerPrice: item.offerPrice || undefined,
          }
        }),
        nextCursor: hasNext ? products[products.length - 1].sku : '',
        hasNext,
      })
    } catch (error) {
      const grpcError = toGrpcError(error)
      callback(grpcError, null as never)
    }
  },
  updateInventoryStock(call, callback) {},
}
