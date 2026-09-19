import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  return digits.length > 10 ? digits.slice(-10) : digits
}

function cuidLike(prefix = ""): string {
  return `${prefix}c${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`
}

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const rawName = (body.name || body.patientName || body.firstName || "").trim()
  const rawPhone = (body.phone || body.patientPhone || body.mobile || "").trim()
  const email = (body.email || body.patientEmail || "").trim() || null
  const treatment = (body.treatment || body.service || "").trim()
  const dateStr = (body.date || body.preferredDate || "").trim()
  const timeStr = (body.time || body.startTime || body.preferredTime || "").trim()
  const message = (body.message || body.notes || body.chiefComplaint || "").trim()

  if (!rawName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  const phone = normalisePhone(rawPhone)
  if (!phone || phone.length < 7) {
    return NextResponse.json({ error: "A valid mobile phone number is required" }, { status: 400 })
  }

  const crmApiUrl = process.env.NEXT_PUBLIC_CRM_API_URL || "http://localhost:3000/api/public"
  const supabaseUrl = process.env.SUPABASE_URL || "https://ewagpvjsimhsxykqsddo.supabase.co"
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""

  const payload = {
    name: rawName,
    phone,
    email,
    treatment,
    date: dateStr,
    time: timeStr,
    message,
    source: "WEBSITE",
  }

  // 1. Try sending to CRM server first (with 3-second timeout)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const crmRes = await fetch(`${crmApiUrl}/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (crmRes.ok) {
      const data = await crmRes.json()
      return NextResponse.json({
        success: true,
        channel: "crm_api",
        ...data,
      })
    }
  } catch {
    // CRM server not running or network unreachable — proceed to direct Supabase sync
  }

  // 2. Direct Supabase sync (fail-safe CRM database insertion)
  try {
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }

    // Check existing patient
    let patientId: string | null = null
    let patientUhid: string | null = null

    try {
      const patientRes = await fetch(
        `${supabaseUrl}/rest/v1/Patient?phone=eq.${phone}&select=id,uhid&limit=1`,
        { headers }
      )
      if (patientRes.ok) {
        const patients = await patientRes.json()
        if (patients && patients.length > 0) {
          patientId = patients[0].id
          patientUhid = patients[0].uhid
        }
      }
    } catch (e) {
      console.warn("[enquiries] Patient lookup failed:", e)
    }

    const year = new Date().getFullYear()

    if (!patientId) {
      patientId = cuidLike("usr_")
      patientUhid = `ZC-${year}-${Math.floor(100000 + Math.random() * 900000)}`
      const nameParts = rawName.split(/\s+/)
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ") || null

      await fetch(`${supabaseUrl}/rest/v1/Patient`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: patientId,
          uhid: patientUhid,
          firstName,
          lastName,
          phone,
          email,
          source: "WEBSITE",
          status: "ACTIVE",
          registrationStatus: "SUBMITTED",
          updatedAt: new Date().toISOString(),
        }),
      })
    }

    // Find Doctor ID for assignment
    let doctorId: string | null = null
    try {
      const docRes = await fetch(
        `${supabaseUrl}/rest/v1/User?role=eq.DOCTOR&active=eq.true&select=id&limit=1`,
        { headers }
      )
      if (docRes.ok) {
        const docs = await docRes.json()
        if (docs && docs.length > 0) doctorId = docs[0].id
      }
    } catch {
      // fallback
    }

    // Create Lead in CRM Sales Pipeline
    const leadId = cuidLike("lead_")
    const leadNotes = [
      treatment ? `Concern: ${treatment}` : null,
      dateStr ? `Preferred Date: ${dateStr}` : null,
      timeStr ? `Preferred Time: ${timeStr}` : null,
      message ? `Message: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    await fetch(`${supabaseUrl}/rest/v1/Lead`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: leadId,
        name: rawName,
        phone,
        email,
        status: "NEW",
        source: "WEBSITE",
        sourceDetail: treatment ? `Website: ${treatment}` : "Website Enquiry",
        notes: leadNotes,
        value: 1500,
        icpScore: 8,
        assignedToId: doctorId,
        convertedPatientId: patientId,
        updatedAt: new Date().toISOString(),
      }),
    })

    // Log Activity
    const actId = cuidLike("act_")
    await fetch(`${supabaseUrl}/rest/v1/LeadActivity`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: actId,
        leadId,
        type: "NOTE",
        title: "Website Enquiry Received",
        details: `Enquiry from website for ${treatment || "Aesthetic Care"}.\nDate: ${dateStr || "Flexible"} ${timeStr || ""}\nMessage: ${message || "None"}`,
      }),
    })

    // If date provided, create pending Appointment in CRM
    let appointmentCode: string | null = null
    if (dateStr && doctorId && patientId) {
      try {
        const timePart = timeStr && timeStr.includes(":") ? timeStr : "11:00"
        const scheduledAt = new Date(`${dateStr}T${timePart}:00`).toISOString()
        appointmentCode = `APT-${year}-${Math.floor(100000 + Math.random() * 900000)}`
        const aptId = cuidLike("apt_")

        await fetch(`${supabaseUrl}/rest/v1/Appointment`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: aptId,
            appointmentCode,
            patientId,
            doctorId,
            scheduledAt,
            durationMinutes: 30,
            type: "IN_PERSON",
            status: "PENDING",
            source: "WEBSITE",
            reason: `Website enquiry: ${treatment || "Consultation"}${message ? ` - ${message}` : ""}`,
          }),
        })
      } catch (aptErr) {
        console.warn("[enquiries] Direct appointment creation error:", aptErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry successfully recorded into Crown Celebrity Aesthetic CRM",
      channel: "supabase_direct",
      leadId,
      patientUhid,
      appointmentCode,
    })
  } catch (err: any) {
    console.error("[enquiries] Direct sync error:", err)
    return NextResponse.json(
      { error: "Could not submit enquiry. Please try again or WhatsApp us." },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
