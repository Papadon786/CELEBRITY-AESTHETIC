import { prisma } from "@/lib/prisma"

export async function nextValue(key: string, tx?: any) {
  const client = tx ?? prisma
  const existing = await client.counter.findUnique({
    where: { key },
  })

  const nextVal = (existing?.value ?? 0) + 1
  await client.counter.upsert({
    where: { key },
    create: { key, value: nextVal },
    update: { value: nextVal },
  })

  return nextVal
}

/** ZC-2026-000123 — sequential per calendar year, atomic via Counter table. */
export async function generateUHID(tx?: any) {
  const year = new Date().getFullYear()
  const value = await nextValue(`UHID-${year}`, tx)
  return `ZC-${year}-${String(value).padStart(6, "0")}`
}

/** INV-2026-000045 */
export async function generateBillNumber(tx?: any) {
  const year = new Date().getFullYear()
  const value = await nextValue(`BILL-${year}`, tx)
  return `INV-${year}-${String(value).padStart(6, "0")}`
}

/** RCPT-2026-000045 */
export async function generateReceiptNumber(tx?: any) {
  const year = new Date().getFullYear()
  const value = await nextValue(`RECEIPT-${year}`, tx)
  return `RCPT-${year}-${String(value).padStart(6, "0")}`
}

/** APT-2026-000045 — shown to patients as their appointment reference. */
export async function generateAppointmentCode(tx?: any) {
  const year = new Date().getFullYear()
  const value = await nextValue(`APPOINTMENT-${year}`, tx)
  return `APT-${year}-${String(value).padStart(6, "0")}`
}

/** RX-2026-000045 */
export async function generatePrescriptionNumber(tx?: any) {
  const year = new Date().getFullYear()
  const value = await nextValue(`PRESCRIPTION-${year}`, tx)
  return `RX-${year}-${String(value).padStart(6, "0")}`
}
