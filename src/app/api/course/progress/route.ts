import { prefillAnswers } from "@/lib/course/grading";
import {
  courseErrorResponse,
  loadLearnerProgress,
  markStep,
  requireEnrolledLearner,
} from "@/lib/course/learnerServer";

/**
 * The signed-in learner's progress (with their last quiz answers marked). While the
 * testing switch is on, also the answers to prefill each quiz with.
 */
export async function GET() {
  try {
    const learner = await requireEnrolledLearner();
    return Response.json({
      progress: await loadLearnerProgress(learner),
      prefill: prefillAnswers(),
    });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

/** Marks a step done. Body: { lesson: slug, step: "read" | "watched" }. */
export async function POST(request: Request) {
  try {
    const learner = await requireEnrolledLearner();
    const body = (await request.json().catch(() => ({}))) as { lesson?: unknown; step?: unknown };
    await markStep(learner, body.lesson, body.step);
    return Response.json({ progress: await loadLearnerProgress(learner) });
  } catch (error) {
    return courseErrorResponse(error);
  }
}
