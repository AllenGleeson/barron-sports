"use client";

import { useState } from "react";
import { lessonBySlug, learnerCourse, type QuizGrade } from "@/lib/course/curriculum";
import { loadEnrolment } from "@/lib/course/enrolment";
import {
  createProgress,
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

/** Saved progress, with the enrolment name and email filled in if missing. */
function initialProgress(): LearnProgress {
  const saved = loadProgress();
  const enrolment = loadEnrolment();
  if (!enrolment) return saved;
  return {
    ...saved,
    name: saved.name || enrolment.name,
    email: saved.email || enrolment.email,
  };
}

function firstUnfinishedLesson(progress: LearnProgress) {
  return (
    learnerCourse.lessons.find(
      (lesson, index) =>
        isLessonUnlocked(index, progress) && !progress.lessons[lesson.slug]?.passed,
    ) ?? learnerCourse.lessons[0]
  );
}

/** Must render client-side only (it is shown by `EnrolmentGate`). */
export function LearnCourse() {
  const [progress, setProgress] = useState(initialProgress);
  const [slug, setSlug] = useState(() => firstUnfinishedLesson(progress).slug);
  const [step, setStep] = useState<LessonStep>(() =>
    firstOpenStep(progress.lessons[slug]),
  );
  const [resetArmed, setResetArmed] = useState(false);

  function commit(next: LearnProgress) {
    setProgress(saveProgress(next));
  }

  const lesson = lessonBySlug(slug);
  const lessonProgress = progress.lessons[lesson.slug];
  const lessonIndex = learnerCourse.lessons.findIndex((item) => item.slug === lesson.slug);

  function selectLesson(nextSlug: string) {
    const index = learnerCourse.lessons.findIndex((item) => item.slug === nextSlug);
    if (!isLessonUnlocked(index, progress)) return;
    setSlug(nextSlug);
    setStep(firstOpenStep(progress.lessons[nextSlug]));
    setResetArmed(false);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.requestAnimationFrame(() => {
        document.getElementById("lesson-panel")?.scrollIntoView({ behavior: "smooth" });
      });
    }
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
    commit({
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
    });
  }

  const nextLesson = learnerCourse.lessons[lessonIndex + 1];
  const nextAction = lessonProgress.passed
    ? {
        label: nextLesson ? "Next lesson" : "View completion record",
        onClick: () => {
          if (nextLesson) selectLesson(nextLesson.slug);
          else document.getElementById("completion-record")?.scrollIntoView({ behavior: "smooth" });
        },
      }
    : null;

  return (
    <section className="bg-ink py-8 lg:py-12">
      <Container>
        <p className="text-sm text-stone">
          Progress stays on this device. Pass each quiz at {learnerCourse.passPercent}% to open the
          next lesson.
        </p>
        <div className="mt-6 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <ModuleNav
            progress={progress}
            activeSlug={slug}
            onSelect={selectLesson}
            resetArmed={resetArmed}
            onResetArm={() => setResetArmed(true)}
            onReset={() => {
              const fresh = saveProgress(createProgress());
              setProgress(fresh);
              setSlug(learnerCourse.lessons[0].slug);
              setStep("read");
              setResetArmed(false);
            }}
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

        <CompletionRecord progress={progress} onChange={commit} />

        <div className="mt-6 lg:hidden">
          {resetArmed ? (
            <button
              type="button"
              onClick={() => {
                const fresh = saveProgress(createProgress());
                setProgress(fresh);
                setSlug(learnerCourse.lessons[0].slug);
                setStep("read");
                setResetArmed(false);
              }}
              className="text-[11px] uppercase tracking-[0.18em] text-brass"
            >
              Clear this preview
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setResetArmed(true)}
              className="text-[11px] uppercase tracking-[0.18em] text-stone"
            >
              Reset this preview
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}
