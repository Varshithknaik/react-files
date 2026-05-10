import { prisma } from '../lib/prisma.js'
import { AddInventoryInput } from '../schema/inventory.schema.js'
import { handlePrismaError } from '../lib/errors.js'

export async function addInventory(product: AddInventoryInput) {
  try {
    return await prisma.products.create({
      data: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        offerPrice: product.offerPrice,
      },
    })
  } catch (error) {
    handlePrismaError(error)
  }
}
