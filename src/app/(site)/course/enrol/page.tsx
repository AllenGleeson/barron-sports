import type { Metadata } from "next";
import Link from "next/link";
import { EnrolCheckout } from "@/components/course/enrol/EnrolCheckout";
import { Container } from "@/components/ui/Container";
import { courseEnrolmentOffer } from "@/lib/course/enrolment";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Enrol in the firearms safety course",
  description:
    "Register by email and complete a Stripe payment before starting the Barron Sports online firearms safety course.",
};

export default function CourseEnrolPage() {
  return (
    <>
      <section className="border-b border-line bg-forest">
        <Container className="py-8 lg:py-12">
          <Eyebrow wide>
            Online course · Enrolment preview
          </Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-tight text-cream sm:text-6xl">
            Enrol to start
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-parchment">
            Register with your email, then pay {courseEnrolmentOffer.priceDisplay} through Stripe.
            Live enrolment will store the user and payment on Supabase via Vercel. This preview
            keeps everything on this device and does not charge a card.
          </p>
          <p className="mt-5">
            <Link href="/course" className="text-sm text-brass hover:text-cream">
              Course information
            </Link>
          </p>
        </Container>
      </section>
      <EnrolCheckout />
    </>
  );
}
