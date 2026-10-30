import { readJson, writeJson } from "@/lib/browserStorage";
import { COURSE_UNLOCK_ALL, learnerCourse } from "@/lib/course/curriculum";

const STORAGE_KEY = "barron-learn-preview-v1";

export type LessonProgress = {
  read: boolean;
  watched: boolean;
  attempts: number;
  scorePercent: number | null;
  passed: boolean;
  lastAnswers: Record<string, string> | null;
};

/** The learner's name comes from their account (the enrolment), not from here. */
export type LearnProgress = {
  completedAt: string | null;
  lessons: Record<string, LessonProgress>;
};

function blankLesson(): LessonProgress {
  return {
    read: false,
    watched: false,
    attempts: 0,
    scorePercent: null,
    passed: false,
    lastAnswers: null,
  };
}

export function createProgress(): LearnProgress {
  const lessons: Record<string, LessonProgress> = {};
  for (const lesson of learnerCourse.lessons) {
    lessons[lesson.slug] = blankLesson();
  }
  return {
    completedAt: null,
    lessons,
  };
}

function readAnswers(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object") return null;
  const answers: Record<string, string> = {};
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === "string") answers[key] = answer;
  }
  return answers;
}

export function normalizeProgress(raw: unknown): LearnProgress {
  const base = createProgress();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<LearnProgress>;
  const lessons = { ...base.lessons };

  if (value.lessons && typeof value.lessons === "object") {
    for (const lesson of learnerCourse.lessons) {
      const saved = value.lessons[lesson.slug];
      if (!saved || typeof saved !== "object") continue;
      lessons[lesson.slug] = {
        read: Boolean(saved.read),
        watched: Boolean(saved.watched),
        attempts: typeof saved.attempts === "number" ? saved.attempts : 0,
        scorePercent: typeof saved.scorePercent === "number" ? saved.scorePercent : null,
        passed: Boolean(saved.passed),
        lastAnswers: readAnswers(saved.lastAnswers),
      };
    }
  }

  return {
    completedAt: typeof value.completedAt === "string" ? value.completedAt : null,
    lessons,
  };
}

/** Whether a lesson's film or quiz can be opened yet. */
export function isStepUnlocked(step: "read" | "watch" | "quiz", lesson: LessonProgress) {
  if (COURSE_UNLOCK_ALL || step === "read") return true;
  if (step === "watch") return lesson.read;
  return lesson.read && lesson.watched;
}

/**
 * Progress for a learner the server has recorded as finished: every lesson passed and
 * `completedAt` set to the server's date. Keeps any scores and answers saved on this device.
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

export function isLessonUnlocked(index: number, progress: LearnProgress) {
  if (COURSE_UNLOCK_ALL || index <= 0) return true;
  const previous = learnerCourse.lessons[index - 1];
  return Boolean(progress.lessons[previous.slug]?.passed);
}

export function withCompletion(progress: LearnProgress): LearnProgress {
  const finished = allLessonsPassed(progress);
  if (finished && !progress.completedAt) {
    return { ...progress, completedAt: new Date().toISOString() };
  }
  if (!finished && progress.completedAt) {
    return { ...progress, completedAt: null };
  }
  return progress;
}

export function loadProgress(): LearnProgress {
  return withCompletion(normalizeProgress(readJson(STORAGE_KEY)));
}

export function saveProgress(progress: LearnProgress) {
  const next = withCompletion(progress);
  writeJson(STORAGE_KEY, next);
  return next;
}
