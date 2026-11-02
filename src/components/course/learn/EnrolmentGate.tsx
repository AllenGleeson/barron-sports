"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireLearner } from "@/components/course/account/RequireLearner";
import { CourseLoading } from "@/components/course/CourseLoading";
import { LearnCourse } from "@/components/course/learn/LearnCourse";
import { useCourseEnrolment, useCourseProgress, type Learner } from "@/lib/course/account";
import { hasAccess } from "@/lib/course/enrolment";

/** Opens the lessons for a signed-in learner who has access; others go to their dashboard. */
export function EnrolmentGate() {
  return (
    <RequireLearner
      path="/course/learn"
      status={(message) => <CourseLoading>{message}</CourseLoading>}
    >
      {(learner) => <AccessCheck learner={learner} />}
    </RequireLearner>
  );
}

function AccessCheck({ learner }: { learner: Learner }) {
  const router = useRouter();
  const state = useCourseEnrolment(learner.id);
  const allowed = !state.loading && hasAccess(state.enrolment);
  const progress = useCourseProgress(allowed);

  useEffect(() => {
    if (!state.loading && !allowed) router.replace("/course/dashboard");
  }, [allowed, router, state.loading]);

  if (state.loading || !allowed) return <CourseLoading>Checking your enrolment…</CourseLoading>;
  if (progress.status === "loading") return <CourseLoading>Loading your progress…</CourseLoading>;
  if (progress.status === "error") return <CourseLoading>{progress.message}</CourseLoading>;
  return (
    <LearnCourse
      learner={{ name: learner.name, email: learner.email }}
      enrolment={state.enrolment}
      initialProgress={progress.progress}
      prefill={progress.prefill}
    />
  );
}
