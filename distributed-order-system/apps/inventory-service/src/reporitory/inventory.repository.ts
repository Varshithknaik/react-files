import { prisma } from '../lib/prisma.js'
import {
  AddInventoryInput,
  BulkAddInventoryInput,
} from '../schema/inventory.schema.js'
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
      select: {
        sku: true,
      },
    })
  } catch (error) {
    handlePrismaError(error)
  }
}

export async function bulkAddInventory(products: BulkAddInventoryInput) {
  try {
    return await prisma.products.createManyAndReturn({
      data: products.products.map((product) => ({
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        offerPrice: product.offerPrice,
      })),
      skipDuplicates: true,
      select: {
        sku: true,
      },
    })
  } catch (error) {
    handlePrismaError(error)
  }
}
