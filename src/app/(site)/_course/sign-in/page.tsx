import type { Metadata } from "next";
import { SignInForm } from "@/components/course/account/AuthForms";
import { CourseHeader } from "@/components/course/CourseHeader";

export const metadata: Metadata = {
  title: "Sign in to the course",
  description: "Sign in to your Barron Sports online firearms safety course account.",
};

export default function CourseSignInPage() {
  return (
    <>
      <CourseHeader eyebrow="Online course" title="Welcome back" />
      <SignInForm />
    </>
  );
}
