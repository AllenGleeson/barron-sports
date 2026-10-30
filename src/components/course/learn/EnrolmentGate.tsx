"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireLearner } from "@/components/course/account/RequireLearner";
import { CourseLoading } from "@/components/course/CourseLoading";
import { LearnCourse } from "@/components/course/learn/LearnCourse";
import { useCourseEnrolment, type Learner } from "@/lib/course/account";
import { isPaid } from "@/lib/course/enrolment";

/** Opens the lessons for a signed-in learner who has paid; others go to their dashboard. */
export function EnrolmentGate() {
  return (
    <RequireLearner
      path="/course/learn"
      status={(message) => <CourseLoading>{message}</CourseLoading>}
    >
      {(learner) => <PaidCheck learner={learner} />}
    </RequireLearner>
  );
}

function PaidCheck({ learner }: { learner: Learner }) {
  const router = useRouter();
  const state = useCourseEnrolment(learner.id);
  const paid = !state.loading && isPaid(state.enrolment);

  useEffect(() => {
    if (!state.loading && !paid) router.replace("/course/dashboard");
  }, [paid, router, state.loading]);

  if (state.loading || !paid) return <CourseLoading>Checking your enrolment…</CourseLoading>;
  return (
    <LearnCourse
      learner={{ name: learner.name, email: learner.email }}
      enrolment={state.enrolment}
    />
  );
}
