import { prisma } from "@/lib/prisma"
import { getCurrentUserOrNull } from "@/lib/auth"
import { nanoid } from "nanoid"

export type AuditAction =
  | "PATIENT_CREATED"
  | "PATIENT_UPDATED"
  | "PATIENT_LOCKED"
  | "PATIENT_OVERRIDE"
  | "PATIENT_DELETED"
  | "APPOINTMENT_BOOKED"
  | "APPOINTMENT_RESCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_STATUS_CHANGED"
  | "STOCK_IN"
  | "STOCK_OUT"
  | "STOCK_ADJUSTMENT"
  | "STOCK_RETURN"
  | "MEDICINE_CREATED"
  | "MEDICINE_UPDATED"
  | "MEDICINE_ARCHIVED"
  | "ALERT_CREATED"
  | "ALERT_UPDATED"
  | "ALERT_ACKNOWLEDGED"
  | "ALERT_RESOLVED"
  | "BILL_CREATED"
  | "BILL_FINALIZED"
  | "BILL_CANCELLED"
  | "PAYMENT_RECORDED"
  | "INVOICE_GENERATED"
  | "RECEIPT_GENERATED"
  | "REFUND_CREATED"
  | "USER_LOGIN"
  | "PERMISSION_OVERRIDE"
  | "PRESCRIPTION_CREATED"
  | "CAMPAIGN_CREATED"
  | "CAMPAIGN_PUBLISHED"
  | "PACKAGE_CREATED"
  | "PACKAGE_ASSIGNED"
  | "PACKAGE_SESSION_USED"
  | "PACKAGE_CANCELLED"
  | "PAYMENT_PLAN_CREATED"
  | "PAYMENT_PLAN_INSTALLMENT_PAID"
  | "PAYMENT_PLAN_CANCELLED"
  | "SUPPLIER_CREATED"
  | "PURCHASE_ORDER_CREATED"
  | "PURCHASE_ORDER_RECEIVED"
  | "PURCHASE_ORDER_CANCELLED"
  | "COMMISSION_CREATED"
  | "COMMISSION_APPROVED"
  | "COMMISSION_PAID"
  | "SALES_TARGET_CREATED"
  | "CONSENT_FORM_CREATED"
  | "CONSENT_FORM_SIGNED"
  | "CONSENT_FORM_DECLINED"
  | "TREATMENT_PHOTO_UPLOADED"
  | "TREATMENT_PHOTO_DELETED"

interface LogAuditParams {
  action: AuditAction
  entityType: "Patient" | "Appointment" | "InventoryItem" | "InventoryAlert" | "Bill" | "Payment" | "Refund" | "User" | "System" | "Prescription" | "Campaign" | "TreatmentPackage" | "PatientPackage" | "PaymentPlan" | "Supplier" | "PurchaseOrder" | "Commission" | "SalesTarget" | "ConsentForm" | "TreatmentPhoto"
  entityId?: string
  metadata?: Record<string, unknown> | null
  userId?: string
  userName?: string
  userRole?: string
  ipAddress?: string
  tx?: any
}

export async function logAudit(params: LogAuditParams) {
  try {
    const client = params.tx ?? prisma
    let userId = params.userId
    let userName = params.userName
    let userRole = params.userRole

    if (!userId) {
      const currentUser = await getCurrentUserOrNull()
      if (currentUser) {
        userId = currentUser.id
        userName = currentUser.name
        userRole = currentUser.role
      }
    }

    const data = await client.auditLog.create({
      data: {
        id: "aud_" + nanoid(20),
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: params.metadata || null,
        userId: userId || null,
        userName: userName || "System",
        userRole: userRole || "SYSTEM",
        ipAddress: params.ipAddress || null,
      },
    })

    return data
  } catch (err) {
    console.error("[AuditLog] Failed to record audit entry:", err)
    return null
  }
}
