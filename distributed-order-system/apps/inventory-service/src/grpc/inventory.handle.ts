import { InventoryServiceServer } from 'packages/proto-pack/dist/index.js'
import {
  addInventory,
  bulkAddInventory,
  getInventory,
} from '../reporitory/inventory.repository.js'
import {
  addInventoryDomainSchema,
  bulkAddInventoryDomainSchema,
  getInventoryDomainSchema,
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
  listInventory(call, callback) {},
  updateInventoryStock(call, callback) {},
}
