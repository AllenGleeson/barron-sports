import type { Metadata } from "next";
import { CourseCheckout } from "@/components/course/account/CourseCheckout";
import { CourseHeader } from "@/components/course/CourseHeader";
import { courseEnrolmentOffer } from "@/lib/course/enrolment";

export const metadata: Metadata = {
  title: "Buy the course",
  description: "Pay for the Barron Sports online firearms safety course securely with Stripe.",
  robots: { index: false },
};

export default function CourseCheckoutPage() {
  return (
    <>
      <CourseHeader eyebrow="Online course · Checkout" title="Buy the course">
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-parchment">
          {courseEnrolmentOffer.title}, {courseEnrolmentOffer.priceDisplay}. Enter your card and
          billing details below.
        </p>
      </CourseHeader>
      <CourseCheckout />
    </>
  );
}
