export type StaffRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "BILLING"

export type Gender = "MALE" | "FEMALE" | "OTHER"

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"

export type AppointmentType = "NEW" | "FOLLOW_UP" | "PROCEDURE" | "REVIEW"

export type BillStatus = "DRAFT" | "PENDING" | "PAID" | "PARTIAL" | "CANCELLED" | "REFUNDED"

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "NETBANKING" | "ADVANCE" | "INSURANCE"

export type EncounterStatus = "DRAFT" | "FINALIZED" | "AMENDED"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  passwordHash: string
  role: StaffRole
  specialization: string | null
  consultationFee: number | null
  active: boolean
  permissions: any
  createdAt: Date | string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string | Date
  createdAt: string | Date
  user?: User
}

export interface Patient {
  id: string
  uhid: string
  name: string
  phone: string
  email?: string | null
  dob?: string | Date | null
  gender: Gender
  bloodGroup?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  registeredById?: string | null
  registeredBy?: User | null
  active: boolean
  createdAt: string | Date
  updatedAt: string | Date
  [key: string]: any
}

export interface Appointment {
  id: string
  appointmentNumber: string
  patientId: string
  doctorId: string
  createdById?: string | null
  slot: string | Date
  status: AppointmentStatus
  type: AppointmentType
  notes?: string | null
  patient?: Patient
  doctor?: User
  createdBy?: User | null
  [key: string]: any
}

export interface Service {
  id: string
  code: string
  name: string
  description?: string | null
  category: string
  price: number | string
  durationMinutes: number
  active: boolean
  taxRate?: number | string | null
  [key: string]: any
}

export interface DoctorAvailability {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMinutes: number
  active: boolean
  doctor?: User
  [key: string]: any
}

export interface DoctorLeave {
  id: string
  doctorId: string
  startDate: string | Date
  endDate: string | Date
  reason?: string | null
  approved: boolean
  [key: string]: any
}

export interface Bill {
  id: string
  billNumber: string
  patientId: string
  encounterId?: string | null
  totalAmount: number | string
  discountAmount?: number | string
  taxAmount?: number | string
  netAmount: number | string
  paidAmount: number | string
  balanceAmount: number | string
  status: BillStatus
  createdAt: string | Date
  patient?: Patient
  items?: BillItem[]
  payments?: Payment[]
  [key: string]: any
}

export interface BillItem {
  id: string
  billId: string
  serviceId?: string | null
  name: string
  quantity: number
  unitPrice: number | string
  totalPrice: number | string
  [key: string]: any
}

export interface Payment {
  id: string
  paymentNumber: string
  billId?: string | null
  patientId: string
  amount: number | string
  method: PaymentMethod
  receivedById: string
  receivedAt: string | Date
  notes?: string | null
  [key: string]: any
}

export interface AuditLog {
  id: string
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  details?: any
  ipAddress?: string | null
  createdAt: string | Date
  user?: User | null
}
