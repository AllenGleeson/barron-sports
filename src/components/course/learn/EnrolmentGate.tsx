"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseLoading } from "@/components/course/CourseLoading";
import { LearnCourse } from "@/components/course/learn/LearnCourse";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { hasCourseAccess } from "@/lib/course/enrolment";

const checking = <CourseLoading>Checking enrolment…</CourseLoading>;

export function EnrolmentGate() {
  return (
    <ClientOnly fallback={checking}>
      <EnrolmentCheck />
    </ClientOnly>
  );
}

function EnrolmentCheck() {
  const router = useRouter();
  // Rendered inside ClientOnly, so storage can be read on first render.
  const [allowed] = useState(hasCourseAccess);

  useEffect(() => {
    if (!allowed) router.replace("/course/enrol");
  }, [allowed, router]);

  return allowed ? <LearnCourse /> : checking;
}
