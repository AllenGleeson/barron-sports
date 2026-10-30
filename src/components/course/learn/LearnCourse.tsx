"use client";

import { useEffect, useState } from "react";
import { markCourseCompleted } from "@/lib/course/account";
import { formatRecordDate } from "@/lib/course/certificate";
import { lessonBySlug, learnerCourse, type QuizGrade } from "@/lib/course/curriculum";
import type { CourseEnrolment } from "@/lib/course/enrolment";
import {
  completedProgress,
  isLessonUnlocked,
  loadProgress,
  saveProgress,
  type LearnProgress,
} from "@/lib/course/progress";
import { Container } from "@/components/ui/Container";
import { CompletionRecord } from "@/components/course/learn/CompletionRecord";
import { Film, LessonStepper, Reading, type LessonStep } from "@/components/course/learn/LessonSteps";
import { ModuleNav } from "@/components/course/learn/ModuleNav";
import { QuizPanel } from "@/components/course/learn/QuizPanel";

function firstOpenStep(lesson: LearnProgress["lessons"][string]): LessonStep {
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
};

/** Must render client-side only (it is shown by `EnrolmentGate`). */
export function LearnCourse({ learner, enrolment }: LearnCourseProps) {
  // The server's completion date wins over this device's progress, so a finished
  // course stays finished everywhere and can't be taken again.
  const [completedAt, setCompletedAt] = useState(enrolment.completedAt);
  const [progress, setProgress] = useState(() => {
    const saved = loadProgress();
    return enrolment.completedAt ? completedProgress(saved, enrolment.completedAt) : saved;
  });
  const [slug, setSlug] = useState(() => firstUnfinishedLesson(progress).slug);
  const [step, setStep] = useState<LessonStep>(() =>
    firstOpenStep(progress.lessons[slug]),
  );
  const finished = Boolean(completedAt ?? progress.completedAt);

  /** Records the finish on the server (once) and keeps its date. */
  function reportFinished() {
    void markCourseCompleted().then((date) => {
      if (date) setCompletedAt(date);
    });
  }

  // Progress finished on this device before the server knew about it.
  useEffect(() => {
    if (!enrolment.completedAt && loadProgress().completedAt) reportFinished();
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(next: LearnProgress) {
    const saved = saveProgress(completedAt ? completedProgress(next, completedAt) : next);
    setProgress(saved);
    if (saved.completedAt && !completedAt) reportFinished();
  }

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

  function patchLesson(partial: Partial<LearnProgress["lessons"][string]>) {
    commit({
      ...progress,
      lessons: {
        ...progress.lessons,
        [lesson.slug]: { ...progress.lessons[lesson.slug], ...partial },
      },
    });
  }

  function onGraded(grade: QuizGrade, answers: Record<string, string>) {
    const current = progress.lessons[lesson.slug];
    const next: LearnProgress = {
      ...progress,
      lessons: {
        ...progress.lessons,
        [lesson.slug]: {
          ...current,
          attempts: current.attempts + 1,
          scorePercent:
            current.scorePercent === null
              ? grade.scorePercent
              : Math.max(current.scorePercent, grade.scorePercent),
          passed: current.passed || grade.passed,
          lastAnswers: answers,
        },
      },
    };
    commit(next);
    // A pass swaps the quiz for the result screen, so bring the top of it into view.
    if (grade.passed) scrollToId("lesson-panel");
  }

  const nextLesson = learnerCourse.lessons[lessonIndex + 1];
  const nextAction = lessonProgress.passed
    ? {
        label: nextLesson ? "Next lesson" : "View completion record",
        onClick: () => {
          if (nextLesson) {
            selectLesson(nextLesson.slug);
            scrollToId("lesson-panel");
          }
          else scrollToId("completion-record");
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
            lesson.
          </p>
        )}
        <div className="mt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <ModuleNav
            progress={progress}
            activeSlug={slug}
            onSelect={selectLesson}
          />

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
                  patchLesson({ read: true });
                  setStep("watch");
                }}
              />
            ) : null}
            {step === "watch" ? (
              <Film
                key={lesson.slug}
                lesson={lesson}
                watched={lessonProgress.watched}
                onWatch={() => patchLesson({ watched: true })}
                onContinue={() => setStep("quiz")}
              />
            ) : null}
            {step === "quiz" ? (
              <QuizPanel
                key={lesson.slug}
                lesson={lesson}
                saved={lessonProgress}
                nextAction={nextAction}
                onGraded={onGraded}
              />
            ) : null}
          </div>
        </div>

        <CompletionRecord
          completedAt={completedAt ?? progress.completedAt}
          learner={{ name: enrolment.certificateName ?? learner.name, email: learner.email }}
        />
      </Container>
    </section>
  );
}
