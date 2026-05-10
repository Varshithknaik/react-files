import { InventoryServiceServer } from 'packages/proto-pack/dist/index.js'
import { addInventory } from '../reporitory/inventory.repository.js'
import { addInventoryDomainSchema } from '../schema/inventory.schema.js'
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
        message: 'Inventory added successfully',
      })
    } catch (error) {
      const grpcError = toGrpcError(error)
      callback(grpcError, null as never)
    }
  },
  bulkAddInventory(call, callback) {},
  getInventory(call, callback) {},
  listInventory(call, callback) {},
  updateInventoryStock(call, callback) {},
}
