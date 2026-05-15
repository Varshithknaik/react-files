import { prisma } from '../lib/prisma.js'
import {
  AddInventoryInput,
  BulkAddInventoryInput,
  GetInventoryInput,
} from '../schema/inventory.schema.js'
import { DomainError, DOMAIN_ERROR_CODE } from '../lib/errors.js'

export async function addInventory(product: AddInventoryInput) {
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
}

export async function bulkAddInventory(products: BulkAddInventoryInput) {
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
}

export async function getInventory(product: GetInventoryInput) {
  const result = await prisma.products.findUnique({
    where: {
      sku: product.sku,
    },
    select: {
      sku: true,
      name: true,
      category: true,
      stock: true,
      price: true,
      offerPrice: true,
    },
  })
  if (!result) {
    throw new DomainError(
      DOMAIN_ERROR_CODE.NOT_FOUND,
      'Product not found',
      `No product found with SKU: ${product.sku}`
    )
  }
  return result
}
