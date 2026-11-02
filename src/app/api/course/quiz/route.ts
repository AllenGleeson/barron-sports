import { courseErrorResponse, requireEnrolledLearner, submitQuiz } from "@/lib/course/learnerServer";

/**
 * Grades a quiz attempt on the server and saves it. Passing the last quiz completes the
 * course. Body: { lesson: slug, answers: { questionId: optionId } }.
 */
export async function POST(request: Request) {
  try {
    const learner = await requireEnrolledLearner();
    const body = (await request.json().catch(() => ({}))) as { lesson?: unknown; answers?: unknown };
    return Response.json(await submitQuiz(learner, body.lesson, body.answers));
  } catch (error) {
    return courseErrorResponse(error);
  }
}
