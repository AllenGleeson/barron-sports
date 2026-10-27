import { readJson, writeJson } from "@/lib/browserStorage";
import { learnerCourse } from "@/lib/course/curriculum";

const STORAGE_KEY = "barron-learn-preview-v1";

export type LessonProgress = {
  read: boolean;
  watched: boolean;
  attempts: number;
  scorePercent: number | null;
  passed: boolean;
  lastAnswers: Record<string, string> | null;
};

export type LearnProgress = {
  name: string;
  email: string;
  emailedAt: string | null;
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
    name: "",
    email: "",
    emailedAt: null,
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
    name: typeof value.name === "string" ? value.name : "",
    email: typeof value.email === "string" ? value.email : "",
    emailedAt: typeof value.emailedAt === "string" ? value.emailedAt : null,
    completedAt: typeof value.completedAt === "string" ? value.completedAt : null,
    lessons,
  };
}

export function allLessonsPassed(progress: LearnProgress) {
  return learnerCourse.lessons.every((lesson) => progress.lessons[lesson.slug]?.passed);
}

export function isLessonUnlocked(index: number, progress: LearnProgress) {
  if (index <= 0) return true;
  const previous = learnerCourse.lessons[index - 1];
  return Boolean(progress.lessons[previous.slug]?.passed);
}

export function withCompletion(progress: LearnProgress): LearnProgress {
  const finished = allLessonsPassed(progress);
  if (finished && !progress.completedAt) {
    return { ...progress, completedAt: new Date().toISOString() };
  }
  if (!finished && (progress.completedAt || progress.emailedAt)) {
    return { ...progress, completedAt: null, emailedAt: null };
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
