import "server-only";
import { COURSE_PREFILL_ANSWERS, learnerCourse, type CourseLesson, type QuizGrade } from "@/lib/course/curriculum";
import { quizAnswers } from "@/lib/course/quizAnswers";

/** Marks a learner's answers against the server-only answer list. */
export function gradeAnswers(lesson: CourseLesson, answers: Record<string, string>): QuizGrade {
  const key = quizAnswers[lesson.slug] ?? {};
  let correct = 0;
  const results = lesson.quiz.questions.map((question) => {
    const answer = key[question.id];
    if (!answer) throw new Error(`No answer for ${lesson.slug}/${question.id} in quizAnswers.ts.`);
    const chosenId = answers[question.id] ?? null;
    const isCorrect = chosenId === answer.correctOptionId;
    if (isCorrect) correct += 1;
    return {
      id: question.id,
      chosenId,
      isCorrect,
      correctOptionId: answer.correctOptionId,
      explanation: answer.explanation,
    };
  });
  const total = lesson.quiz.questions.length;
  const scorePercent = Math.round((correct / total) * 100);
  return { correct, total, scorePercent, passed: scorePercent >= lesson.quiz.passPercent, results };
}

/** The correct answers for every quiz while the testing switch is on, otherwise null. */
export function prefillAnswers(): Record<string, Record<string, string>> | null {
  if (!COURSE_PREFILL_ANSWERS) return null;
  return Object.fromEntries(
    learnerCourse.lessons.map((lesson) => [
      lesson.slug,
      Object.fromEntries(
        Object.entries(quizAnswers[lesson.slug] ?? {}).map(([id, answer]) => [id, answer.correctOptionId]),
      ),
    ]),
  );
}
