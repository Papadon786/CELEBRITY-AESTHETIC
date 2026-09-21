import { z } from "zod"

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required"),
  contactName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  address: z.string().trim().optional(),
})
export type SupplierInput = z.infer<typeof supplierSchema>

export const purchaseOrderItemSchema = z.object({
  inventoryItemId: z.string().min(1),
  quantityOrdered: z.coerce.number().int().positive(),
  unitCost: z.coerce.number().nonnegative().optional(),
})
export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  expectedAt: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, "Add at least one item"),
})
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>

export const receivePurchaseOrderSchema = z.object({
  purchaseOrderId: z.string().min(1),
  items: z.array(
    z.object({
      purchaseOrderItemId: z.string().min(1),
      quantityReceived: z.coerce.number().int().nonnegative(),
      batchNumber: z.string().trim().optional(),
      expiryDate: z.coerce.date().optional(),
    })
  ),
})
export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>
