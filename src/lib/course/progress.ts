import { COURSE_UNLOCK_ALL, learnerCourse, type QuizResult } from "@/lib/course/curriculum";

/**
 * A learner's progress, as loaded from the server (`course_progress`, through
 * `/api/course/progress/`). The server writes it; the browser only shows it.
 */
export type LessonProgress = {
  read: boolean;
  watched: boolean;
  attempts: number;
  /** Best score so far, or null before the first attempt. */
  scorePercent: number | null;
  passed: boolean;
  lastAnswers: Record<string, string> | null;
  /** The last attempt, marked by the server. */
  lastResults: QuizResult[] | null;
};

/** The learner's name comes from their account (the enrolment), not from here. */
export type LearnProgress = {
  completedAt: string | null;
  lessons: Record<string, LessonProgress>;
};

export function blankLesson(): LessonProgress {
  return {
    read: false,
    watched: false,
    attempts: 0,
    scorePercent: null,
    passed: false,
    lastAnswers: null,
    lastResults: null,
  };
}

export function createProgress(): LearnProgress {
  const lessons: Record<string, LessonProgress> = {};
  for (const lesson of learnerCourse.lessons) {
    lessons[lesson.slug] = blankLesson();
  }
  return { completedAt: null, lessons };
}

/** Whether a lesson's film or quiz can be opened yet. */
export function isStepUnlocked(step: "read" | "watch" | "quiz", lesson: LessonProgress) {
  if (COURSE_UNLOCK_ALL || step === "read") return true;
  if (step === "watch") return lesson.read;
  return lesson.read && lesson.watched;
}

/**
 * Progress for a learner the server has recorded as finished: every lesson passed and
 * `completedAt` set to the server's date (e.g. a course finished before progress was
 * saved per lesson). Keeps any scores and answers.
 */
export function completedProgress(progress: LearnProgress, completedAt: string): LearnProgress {
  const lessons = { ...progress.lessons };
  for (const lesson of learnerCourse.lessons) {
    lessons[lesson.slug] = { ...lessons[lesson.slug], read: true, watched: true, passed: true };
  }
  return { ...progress, lessons, completedAt };
}

export function allLessonsPassed(progress: LearnProgress) {
  return learnerCourse.lessons.every((lesson) => progress.lessons[lesson.slug]?.passed);
}

export function passedLessonCount(progress: LearnProgress) {
  return learnerCourse.lessons.filter((lesson) => progress.lessons[lesson.slug]?.passed).length;
}

export function isLessonUnlocked(index: number, progress: LearnProgress) {
  if (COURSE_UNLOCK_ALL || index <= 0) return true;
  const previous = learnerCourse.lessons[index - 1];
  return Boolean(progress.lessons[previous.slug]?.passed);
}
