import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { findLesson, learnerCourse } from "@/lib/course/curriculum";
import { COURSE_ID } from "@/lib/course/enrolment";
import { gradeAnswers } from "@/lib/course/grading";
import {
  blankLesson,
  completedProgress,
  createProgress,
  isLessonUnlocked,
  isStepUnlocked,
  type LearnProgress,
  type LessonProgress,
} from "@/lib/course/progress";
import { getRequestUser, getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Server side of taking the course: loads and saves `course_progress`, grades quizzes,
 * and sets `completed_at` once every quiz is passed. Used by `/api/course/progress/`
 * and `/api/course/quiz/`.
 */

export class CourseError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function courseErrorResponse(error: unknown) {
  if (error instanceof CourseError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Course request failed", error);
  return Response.json({ error: "Your progress couldn't be saved. Please try again." }, { status: 500 });
}

type Learner = { user: User; supabase: SupabaseClient; completedAt: string | null };

/** The signed-in learner, if they have access to the course. */
export async function requireEnrolledLearner(): Promise<Learner> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new CourseError("The course isn't set up yet.", 503);
  const user = await getRequestUser();
  if (!user) throw new CourseError("Please sign in.", 401);
  const { data, error } = await supabase
    .from("course_enrolments")
    .select("status, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", COURSE_ID)
    .maybeSingle();
  if (error) throw error;
  if (data?.status !== "active") throw new CourseError("You're not enrolled in the course.", 403);
  return { user, supabase, completedAt: typeof data.completed_at === "string" ? data.completed_at : null };
}

type ProgressRow = {
  lesson_slug: string;
  read_at: string | null;
  watched_at: string | null;
  attempts: number;
  best_score: number | null;
  last_answers: Record<string, string> | null;
  passed_at: string | null;
};

const PROGRESS_COLUMNS = "lesson_slug, read_at, watched_at, attempts, best_score, last_answers, passed_at";

function lessonFromRow(row: ProgressRow | undefined): LessonProgress {
  if (!row) return blankLesson();
  const lesson = findLesson(row.lesson_slug);
  const answers = row.last_answers && typeof row.last_answers === "object" ? row.last_answers : null;
  return {
    read: Boolean(row.read_at),
    watched: Boolean(row.watched_at),
    attempts: row.attempts,
    scorePercent: row.best_score,
    passed: Boolean(row.passed_at),
    lastAnswers: answers,
    lastResults: lesson && answers ? gradeAnswers(lesson, answers).results : null,
  };
}

async function progressRows(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("course_progress")
    .select(PROGRESS_COLUMNS)
    .eq("user_id", userId)
    .eq("course_id", COURSE_ID);
  if (error) throw error;
  return (data ?? []) as ProgressRow[];
}

/** The learner's progress, with their last answers marked. */
export async function loadLearnerProgress(learner: Learner): Promise<LearnProgress> {
  const rows = await progressRows(learner.supabase, learner.user.id);
  const progress = createProgress();
  for (const lesson of learnerCourse.lessons) {
    progress.lessons[lesson.slug] = lessonFromRow(rows.find((row) => row.lesson_slug === lesson.slug));
  }
  // A course recorded as finished stays finished, whatever the lesson rows say.
  return learner.completedAt ? completedProgress(progress, learner.completedAt) : progress;
}

function requireLesson(slug: unknown) {
  const lesson = typeof slug === "string" ? findLesson(slug) : null;
  if (!lesson) throw new CourseError("That lesson doesn't exist.", 400);
  return lesson;
}

async function saveLessonRow(learner: Learner, slug: string, fields: Record<string, unknown>) {
  const { error } = await learner.supabase.from("course_progress").upsert(
    {
      user_id: learner.user.id,
      course_id: COURSE_ID,
      lesson_slug: slug,
      ...fields,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id,lesson_slug" },
  );
  if (error) throw error;
}

/** Marks a lesson's reading or film as done (the first time only). */
export async function markStep(learner: Learner, slug: unknown, step: unknown) {
  if (step !== "read" && step !== "watched") throw new CourseError("Unknown step.", 400);
  const lesson = requireLesson(slug);
  const progress = await loadLearnerProgress(learner);
  const index = learnerCourse.lessons.indexOf(lesson);
  const current = progress.lessons[lesson.slug];
  if (!isLessonUnlocked(index, progress)) throw new CourseError("Pass the lesson before this one first.", 403);
  if (step === "watched" && !isStepUnlocked("watch", current)) {
    throw new CourseError("Read the lesson first.", 403);
  }
  if ((step === "read" && current.read) || (step === "watched" && current.watched)) return;
  const now = new Date().toISOString();
  await saveLessonRow(learner, lesson.slug, step === "read" ? { read_at: now } : { watched_at: now });
}

/**
 * Grades a quiz attempt and saves it. Once every lesson is passed, sets the course's
 * completion date (once; later passes don't change it). After completion, attempts are
 * still marked but nothing is saved, so the record can't change.
 */
export async function submitQuiz(learner: Learner, slug: unknown, rawAnswers: unknown) {
  const lesson = requireLesson(slug);
  const answers: Record<string, string> = {};
  if (rawAnswers && typeof rawAnswers === "object") {
    for (const [key, value] of Object.entries(rawAnswers)) {
      if (typeof value === "string") answers[key] = value;
    }
  }
  if (lesson.quiz.questions.some((question) => !answers[question.id])) {
    throw new CourseError("Answer every question before you submit.", 400);
  }

  const progress = await loadLearnerProgress(learner);
  const index = learnerCourse.lessons.indexOf(lesson);
  const current = progress.lessons[lesson.slug];
  if (!isLessonUnlocked(index, progress)) throw new CourseError("Pass the lesson before this one first.", 403);
  if (!isStepUnlocked("quiz", current)) throw new CourseError("Read the lesson and watch the film first.", 403);

  const grade = gradeAnswers(lesson, answers);
  if (learner.completedAt) {
    return { grade, progress, completedAt: learner.completedAt };
  }

  const rows = await progressRows(learner.supabase, learner.user.id);
  const row = rows.find((item) => item.lesson_slug === lesson.slug);
  const now = new Date().toISOString();
  await saveLessonRow(learner, lesson.slug, {
    attempts: (row?.attempts ?? 0) + 1,
    best_score: Math.max(row?.best_score ?? 0, grade.scorePercent),
    last_score: grade.scorePercent,
    last_answers: answers,
    ...(grade.passed && !row?.passed_at ? { passed_at: now } : {}),
  });

  let completedAt: string | null = null;
  const passedSlugs = new Set(rows.filter((item) => item.passed_at).map((item) => item.lesson_slug));
  if (grade.passed) passedSlugs.add(lesson.slug);
  if (learnerCourse.lessons.every((item) => passedSlugs.has(item.slug))) {
    completedAt = await recordCompletion(learner);
  }

  const saved = await loadLearnerProgress({ ...learner, completedAt });
  return { grade, progress: saved, completedAt };
}

/** Sets `completed_at` once; returns the stored date. */
async function recordCompletion(learner: Learner) {
  const now = new Date().toISOString();
  // `is null` makes this safe if two requests race: only the first one sets the date.
  const { error } = await learner.supabase
    .from("course_enrolments")
    .update({ completed_at: now, updated_at: now })
    .eq("user_id", learner.user.id)
    .eq("course_id", COURSE_ID)
    .is("completed_at", null);
  if (error) throw error;
  const { data } = await learner.supabase
    .from("course_enrolments")
    .select("completed_at")
    .eq("user_id", learner.user.id)
    .eq("course_id", COURSE_ID)
    .maybeSingle();
  return typeof data?.completed_at === "string" ? data.completed_at : now;
}
