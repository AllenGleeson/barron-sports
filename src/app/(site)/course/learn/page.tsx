import type { Metadata } from "next";
import Link from "next/link";
import { EnrolmentGate } from "@/components/course/learn/EnrolmentGate";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { COURSE_PASS_PERCENT } from "@/lib/course/curriculum";

export const metadata: Metadata = {
  title: "Online firearms safety course",
  description:
    `Placeholder firearms safety lessons, films and quizzes from Barron Sports. Each quiz needs ${COURSE_PASS_PERCENT}% before the next lesson opens.`,
};

export default function LearnCoursePage() {
  return (
    <>
      <section className="border-b border-line bg-forest">
        <Container className="py-8 lg:py-12">
          <Eyebrow wide>Online course · Preview</Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-tight text-cream sm:text-6xl">
            Firearms safety
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-parchment">
            Four sample lessons. Read the notes, play the film, then pass the quiz at {COURSE_PASS_PERCENT}% to open
            the next one. The completion record at the end is a preview you can download.
          </p>
          <p className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/course" className="text-sm text-brass hover:text-cream">
              Course information
            </Link>
            <Link href="/course/enrol" className="text-sm text-brass hover:text-cream">
              Enrolment
            </Link>
          </p>
        </Container>
      </section>
      <EnrolmentGate />
    </>
  );
}
