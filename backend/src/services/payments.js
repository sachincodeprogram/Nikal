import Payment from "../models/Payment.js";

// TODO: integrate the real Razorpay refund API once payments go live.
// For now this just marks the Payment record refunded so booking
// cancellation flows have something real to call.
export async function refundPayment(paymentId) {
  if (!paymentId) return null;
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;

  payment.status = "refunded";
  payment.refundId = `stub_${Date.now()}`;
  await payment.save();
  return payment;
}
