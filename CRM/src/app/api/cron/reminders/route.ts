import { NextResponse } from "next/server"
import { sendPreVisitReminders, sendAftercareMessages, sendReviewRequests } from "@/actions/reminders"

/** Vercel Cron (or any scheduler) hits this hourly with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const [reminders, aftercare, reviewRequests] = await Promise.all([
    sendPreVisitReminders(),
    sendAftercareMessages(),
    sendReviewRequests(),
  ])
  return NextResponse.json({ reminders, aftercare, reviewRequests })
}
