import { Schema } from 'mongoose'

const OrderItemSubSchema = new Schema(
  {
    id: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    OfferPrice: { type: Number },
    effectiveUnitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    productName: { type: String },
  },
  { _id: false }
)
