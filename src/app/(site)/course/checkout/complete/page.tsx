import type { Metadata } from "next";
import { CheckoutComplete } from "@/components/course/account/CheckoutComplete";
import { CourseHeader } from "@/components/course/CourseHeader";

export const metadata: Metadata = {
  title: "Payment",
  description: "Confirming your payment for the Barron Sports online firearms safety course.",
  robots: { index: false },
};

export default function CheckoutCompletePage() {
  return (
    <>
      <CourseHeader eyebrow="Online course · Checkout" title="Thank you" />
      <CheckoutComplete />
    </>
  );
}
