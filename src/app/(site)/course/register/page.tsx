import type { Metadata } from "next";
import { RegisterForm } from "@/components/course/account/AuthForms";
import { CourseHeader } from "@/components/course/CourseHeader";
import { courseEnrolmentOffer } from "@/lib/course/enrolment";

export const metadata: Metadata = {
  title: "Create a course account",
  description: "Create an account to buy and take the Barron Sports online firearms safety course.",
};

export default function CourseRegisterPage() {
  return (
    <>
      <CourseHeader eyebrow="Online course" title="Create an account">
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-parchment">
          Register with your email and a password. You can then buy the course for{" "}
          {courseEnrolmentOffer.priceDisplay} from your course dashboard.
        </p>
      </CourseHeader>
      <RegisterForm />
    </>
  );
}
