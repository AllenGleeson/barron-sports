import type { Metadata } from "next";
import { CourseHeader } from "@/components/course/CourseHeader";
import { ResetPasswordForm } from "@/components/course/account/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a password",
  description: "Set a new password for your Barron Sports account.",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <CourseHeader eyebrow="Your account" title="Choose a password" />
      <ResetPasswordForm />
    </>
  );
}
