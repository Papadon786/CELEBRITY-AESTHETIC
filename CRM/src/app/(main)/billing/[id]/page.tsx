import { notFound } from "next/navigation"
import { getBill } from "@/actions/billing"
import { getPaymentPlanForBill } from "@/actions/payment-plans"
import { InvoiceView } from "@/components/billing/invoice-view"

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [bill, paymentPlan] = await Promise.all([getBill(id), getPaymentPlanForBill(id)])
  if (!bill) notFound()

  return <InvoiceView bill={bill} paymentPlan={paymentPlan} />
}
