"use client";

import { useRef, useState } from "react";
import { saveLessonStep, submitQuizAnswers } from "@/lib/course/account";
import { formatRecordDate } from "@/lib/course/certificate";
import { lessonBySlug, learnerCourse, type QuizGrade } from "@/lib/course/curriculum";
import type { CourseEnrolment } from "@/lib/course/enrolment";
import { isLessonUnlocked, type LearnProgress, type LessonProgress } from "@/lib/course/progress";
import { Container } from "@/components/ui/Container";
import { CompletionRecord } from "@/components/course/learn/CompletionRecord";
import { Film, LessonStepper, Reading, type LessonStep } from "@/components/course/learn/LessonSteps";
import { ModuleNav } from "@/components/course/learn/ModuleNav";
import { QuizPanel } from "@/components/course/learn/QuizPanel";

function firstOpenStep(lesson: LessonProgress): LessonStep {
  if (!lesson.read) return "read";
  if (!lesson.watched) return "watch";
  return "quiz";
}

function firstUnfinishedLesson(progress: LearnProgress) {
  return (
    learnerCourse.lessons.find(
      (lesson, index) =>
        isLessonUnlocked(index, progress) && !progress.lessons[lesson.slug]?.passed,
    ) ?? learnerCourse.lessons[0]
  );
}

type LearnCourseProps = {
  learner: { name: string; email: string };
  enrolment: CourseEnrolment;
  /** Progress loaded from the server by `EnrolmentGate`. */
  initialProgress: LearnProgress;
  /** Answers to prefill each quiz with while testing, or null. */
  prefill: Record<string, Record<string, string>> | null;
};

/**
 * The lessons. Progress is saved on the server: reading and films are marked done
 * straight away on screen and saved in the background; quizzes are graded by the server.
 */
export function LearnCourse({ learner, enrolment, initialProgress, prefill }: LearnCourseProps) {
  const [progress, setProgress] = useState(initialProgress);
  // The server's completion date; a finished course stays finished and can't be redone.
  const [completedAt, setCompletedAt] = useState(enrolment.completedAt ?? initialProgress.completedAt);
  const [slug, setSlug] = useState(() => firstUnfinishedLesson(initialProgress).slug);
  const [step, setStep] = useState<LessonStep>(() =>
    firstOpenStep(initialProgress.lessons[firstUnfinishedLesson(initialProgress).slug]),
  );
  const [saveError, setSaveError] = useState("");
  const saving = useRef<Promise<void>>(Promise.resolve());
  const finished = Boolean(completedAt);

  const lesson = lessonBySlug(slug);
  const lessonProgress = progress.lessons[lesson.slug];
  const lessonIndex = learnerCourse.lessons.findIndex((item) => item.slug === lesson.slug);

  function scrollToId(id: string) {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function selectLesson(nextSlug: string) {
    const index = learnerCourse.lessons.findIndex((item) => item.slug === nextSlug);
    if (!isLessonUnlocked(index, progress)) return;
    setSlug(nextSlug);
    setStep(firstOpenStep(progress.lessons[nextSlug]));
    if (window.matchMedia("(max-width: 1023px)").matches) scrollToId("lesson-panel");
  }

  /** Shows the step as done, then saves it. */
  function markStep(stepName: "read" | "watched") {
    const lessonSlug = lesson.slug;
    if (lessonProgress[stepName]) return;
    setProgress((current) => ({
      ...current,
      lessons: {
        ...current.lessons,
        [lessonSlug]: { ...current.lessons[lessonSlug], [stepName]: true },
      },
    }));
    setSaveError("");
    // Saved one after another, so "read" always reaches the server before "watched".
    saving.current = saving.current.then(() =>
      saveLessonStep(lessonSlug, stepName)
        .then(setProgress)
        .catch((error: Error) => setSaveError(error.message)),
    );
  }

  async function submitQuiz(answers: Record<string, string>): Promise<QuizGrade> {
    await saving.current;
    const result = await submitQuizAnswers(lesson.slug, answers);
    setProgress(result.progress);
    if (result.completedAt) setCompletedAt(result.completedAt);
    // A pass swaps the quiz for the result screen, so bring the top of it into view.
    if (result.grade.passed) scrollToId("lesson-panel");
    return result.grade;
  }

  const nextLesson = learnerCourse.lessons[lessonIndex + 1];
  const nextAction = lessonProgress.passed
    ? {
        label: nextLesson ? "Next lesson" : "View completion record",
        onClick: () => {
          if (nextLesson) {
            selectLesson(nextLesson.slug);
            scrollToId("lesson-panel");
          } else scrollToId("completion-record");
        },
      }
    : null;

  return (
    <section className="bg-ink py-8 lg:py-12">
      <Container>
        {finished ? (
          <p className="text-sm text-parchment">
            You completed the course
            {completedAt ? ` on ${formatRecordDate(completedAt)}` : ""}. You can look back over the
            lessons, but the course and its record can&apos;t be redone.
          </p>
        ) : (
          <p className="text-sm text-stone">
            Take it at your own pace. Pass each quiz at {learnerCourse.passPercent}% to open the next
            lesson. Your progress is saved to your account, so you can carry on from any device.
          </p>
        )}
        {saveError ? (
          <p className="mt-3 border border-danger px-4 py-3 text-sm text-parchment" role="alert">
            {saveError}
          </p>
        ) : null}
        <div className="mt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <ModuleNav progress={progress} activeSlug={slug} onSelect={selectLesson} />

          <div id="lesson-panel" className="scroll-mt-28">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
              Lesson {lessonIndex + 1} of {learnerCourse.lessons.length}
              {lessonProgress.passed ? " · Passed" : ""}
            </p>
            <h2 className="mt-2 font-display text-4xl text-cream">{lesson.title}</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-parchment">{lesson.summary}</p>
            <LessonStepper step={step} lessonProgress={lessonProgress} onStep={setStep} />

            {step === "read" ? (
              <Reading
                key={lesson.slug}
                lesson={lesson}
                onContinue={() => {
                  markStep("read");
                  setStep("watch");
                }}
              />
            ) : null}
            {step === "watch" ? (
              <Film
                key={lesson.slug}
                lesson={lesson}
                watched={lessonProgress.watched}
                onWatch={() => markStep("watched")}
                onContinue={() => setStep("quiz")}
              />
            ) : null}
            {step === "quiz" ? (
              <QuizPanel
                key={lesson.slug}
                lesson={lesson}
                saved={lessonProgress}
                prefill={prefill?.[lesson.slug] ?? null}
                nextAction={nextAction}
                onSubmit={submitQuiz}
              />
            ) : null}
          </div>
        </div>

        <CompletionRecord
          completedAt={completedAt}
          learner={{ name: enrolment.certificateName ?? learner.name, email: learner.email }}
        />
      </Container>
    </section>
  );
}
