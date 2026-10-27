import { CoverImage } from "@/components/media/CoverImage";
import { learnerCourse, type CourseLesson } from "@/lib/course/curriculum";
import type { LessonProgress } from "@/lib/course/progress";
import { ActionButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export type LessonStep = "read" | "watch" | "quiz";

const steps: { id: LessonStep; label: string }[] = [
  { id: "read", label: "Reading" },
  { id: "watch", label: "Film" },
  { id: "quiz", label: "Quiz" },
];

type LessonStepperProps = {
  step: LessonStep;
  lessonProgress: LessonProgress;
  onStep: (step: LessonStep) => void;
};

export function LessonStepper({ step, lessonProgress, onStep }: LessonStepperProps) {
  return (
    <div className="mt-6 grid grid-cols-3 border border-line" role="tablist" aria-label="Lesson steps">
      {steps.map((item, index) => {
        const locked =
          (item.id === "watch" && !lessonProgress.read) ||
          (item.id === "quiz" && (!lessonProgress.read || !lessonProgress.watched));
        const done =
          (item.id === "read" && lessonProgress.read) ||
          (item.id === "watch" && lessonProgress.watched) ||
          (item.id === "quiz" && lessonProgress.passed);
        const selected = step === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={locked}
            onClick={() => onStep(item.id)}
            className={`px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? "bg-moss" : "bg-transparent hover:bg-moss/50"
            } ${index > 0 ? "border-l border-line" : ""}`}
          >
            <span className="block text-[11px] uppercase tracking-[0.18em] text-brass">
              {index + 1}
              {done ? " · Done" : ""}
            </span>
            <span className="mt-1 block text-sm text-cream">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Reading({
  lesson,
  onContinue,
}: {
  lesson: CourseLesson;
  onContinue: () => void;
}) {
  return (
    <article className="mt-6 border border-line bg-moss px-5 py-6 sm:px-8">
      {lesson.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className="text-base leading-relaxed text-parchment">
          {paragraph}
        </p>
      ))}
      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-parchment">
        {lesson.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-stone">
        Handout: {lesson.handout}. The file will be attached with the live course.
      </p>
      <ActionButton className="mt-6" onClick={onContinue}>
        Continue to the film
      </ActionButton>
    </article>
  );
}

export function Film({
  lesson,
  watched,
  onWatch,
  onContinue,
}: {
  lesson: CourseLesson;
  watched: boolean;
  onWatch: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mt-6 border border-line bg-moss">
      <div className="relative aspect-video overflow-hidden bg-ink">
        <CoverImage
          src={learnerCourse.poster.src}
          alt=""
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
        <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {watched ? (
            <>
              <Eyebrow>Preview film</Eyebrow>
              <p className="mt-3 font-display text-3xl text-cream">{lesson.video.title}</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-parchment">
                {lesson.video.caption}
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-stone">
                {lesson.video.minutes} min
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={onWatch}
              className="flex flex-col items-center gap-4 text-cream"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brass bg-ink/70 text-brass">
                <svg viewBox="0 0 20 20" className="ml-1 h-6 w-6" aria-hidden="true">
                  <path d="M6 4l10 6-10 6V4z" fill="currentColor" />
                </svg>
              </span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-brass">
                Play {lesson.video.minutes} min film
              </span>
            </button>
          )}
        </div>
      </div>
      {watched ? (
        <div className="px-5 py-5 sm:px-8">
          <ActionButton onClick={onContinue}>Continue to the quiz</ActionButton>
        </div>
      ) : null}
    </div>
  );
}
