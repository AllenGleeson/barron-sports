import type { Metadata } from "next";
import { CourseDashboard } from "@/components/course/account/CourseDashboard";
import { CourseHeader } from "@/components/course/CourseHeader";

export const metadata: Metadata = {
  title: "Course dashboard",
  description: "Your Barron Sports online course: buy the course, continue your lessons and manage your account.",
  robots: { index: false },
};

export default function CourseDashboardPage() {
  return (
    <>
      <CourseHeader eyebrow="Online course" title="Your dashboard" />
      <CourseDashboard />
    </>
  );
}
