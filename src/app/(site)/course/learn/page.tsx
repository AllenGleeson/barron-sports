import type { Metadata } from "next";
import Link from "next/link";
import { EnrolmentGate } from "@/components/course/learn/EnrolmentGate";
import { CourseHeader } from "@/components/course/CourseHeader";
import { COURSE_PASS_PERCENT, learnerCourse } from "@/lib/course/curriculum";

export const metadata: Metadata = {
  title: "Online firearms safety course",
  description:
    `Placeholder firearms safety lessons, films and quizzes from Barron Sports. Each quiz needs ${COURSE_PASS_PERCENT}% before the next lesson opens.`,
};

export default function LearnCoursePage() {
  return (
    <>
      <CourseHeader eyebrow="Online course" title="Firearms safety">
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-parchment">
          {learnerCourse.lessons.length} lessons. Read the notes, play the film, then pass the quiz
          at {COURSE_PASS_PERCENT}% to open the next one. Films are placeholders for now.
        </p>
        <p className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/course/dashboard" className="text-sm text-brass hover:text-cream">
            Your dashboard
          </Link>
          <Link href="/course" className="text-sm text-brass hover:text-cream">
            Course information
          </Link>
        </p>
      </CourseHeader>
      <EnrolmentGate />
    </>
  );
}
