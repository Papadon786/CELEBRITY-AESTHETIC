export type StaffRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "BILLING" | "NURSE" | "TECHNICIAN" | "SALES"

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

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "DEMO"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST"

export type LeadSource =
  | "LINKEDIN"
  | "WEBSITE"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "GOOGLE"
  | "REFERRAL"
  | "WALK_IN"
  | "PHONE"
  | "OTHER"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  passwordHash: string
  supabaseUserId: string | null
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

export type ProspectStage =
  | "QUALIFIED"
  | "DEMO_BOOKED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST"

export interface Prospect {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  stage: ProspectStage
  value: number | string | null
  icpScore: number | null
  engagement: number | null
  dueDate: string | Date | null
  assignedToId: string | null
  assignedTo?: User | null
  notes: string | null
  source: string | null
  treatmentCategory?: "HAIR_RESTORATION" | "HAIR_TRANSPLANT" | "SKIN_AESTHETICS" | "ANTI_AGING" | "ACNE_SCARS" | "BRIDAL" | "PMU" | string | null
  treatmentInterest?: string | null
  candidateConcern?: string | null
  doctorPreference?: string | null
  leadId?: string | null
  convertedClientId?: string | null
  convertedPatientId?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  activities?: any[]
}

export type ClientStatus = "ACTIVE" | "AT_RISK" | "CHURNED" | "PAUSED"
export type RenewalStage = "NOT_STARTED" | "IN_DISCUSSION" | "PROPOSAL_SENT" | "CONFIRMED" | "COMPLETED"

export interface ClientAccount {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: ClientStatus
  healthScore: number
  accountManagerId: string | null
  accountManagerName: string | null
  accountManager?: User | null
  contractValue: number | string
  renewalDate: string | Date | null
  renewalStage: RenewalStage
  notes: string | null
  membershipTier?: string | null
  treatmentFocus?: string | null
  boosterFrequency?: string | null
  patientId?: string | null
  patient?: any | null
  createdAt: string | Date
  updatedAt: string | Date
  activities?: any[]
}
