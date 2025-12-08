import { z } from 'zod'

// 1. Product Master
export const ProductMasterSchema = z.object({
  id: z.string(),
  name: z.string(),
  hscode: z.string(),
  groupId: z.string(),
})

export type ProductMaster = z.infer<typeof ProductMasterSchema>
export const ProductMasterListSchema = z.array(ProductMasterSchema)
export type ProductMasterList = z.infer<typeof ProductMasterListSchema>

// Details
export const ProductDetailsSchema = z.object({
  id: z.string(),
  brand: z.string(),
  packaging: z.object({
    size: z.string(),
    type: z.string(),
  }),
  attributes: z.array(z.string()),
  documents: z.array(z.string()),
})

export type ProductDetails = z.infer<typeof ProductDetailsSchema>

// 3) Classification
export const ProductClassificationSchema = z.object({
  id: z.string(),
  classification: z.string(),
})

export const ClassificationGroupSchema = z.object({
  groupId: z.string(),
  products: z.array(ProductClassificationSchema),
})

export type ProductClassification = z.infer<typeof ProductClassificationSchema>
export type ClassificationGroup = z.infer<typeof ClassificationGroupSchema>
