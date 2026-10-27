import { learnerCourse } from "@/lib/course/curriculum";
import { isLessonUnlocked, type LearnProgress } from "@/lib/course/progress";

type ModuleNavProps = {
  progress: LearnProgress;
  activeSlug: string;
  onSelect: (slug: string) => void;
  resetArmed: boolean;
  onResetArm: () => void;
  onReset: () => void;
};

export function ModuleNav({
  progress,
  activeSlug,
  onSelect,
  resetArmed,
  onResetArm,
  onReset,
}: ModuleNavProps) {
  const passedCount = learnerCourse.lessons.filter(
    (lesson) => progress.lessons[lesson.slug]?.passed,
  ).length;

  return (
    <nav aria-label="Lessons" className="lg:sticky lg:top-6 lg:self-start">
      <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
        {passedCount} of {learnerCourse.lessons.length} passed
      </p>
      <div className="mt-3 h-px bg-line" aria-hidden="true">
        <div
          className="h-px bg-brass"
          style={{ width: `${(passedCount / learnerCourse.lessons.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {learnerCourse.lessons.map((lesson, index) => {
          const unlocked = isLessonUnlocked(index, progress);
          const state = progress.lessons[lesson.slug];
          const selected = lesson.slug === activeSlug;
          const status = !unlocked ? "Locked" : state?.passed ? "Passed" : "Open";

          return (
            <li key={lesson.slug} className="min-w-[14rem] lg:min-w-0">
              <button
                type="button"
                disabled={!unlocked}
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(lesson.slug)}
                className={`w-full border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:cursor-not-allowed ${
                  selected
                    ? "border-brass bg-moss"
                    : "border-line bg-moss/40 hover:border-brass/60 disabled:hover:border-line"
                } ${unlocked ? "" : "opacity-50"}`}
              >
                <span className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-brass">
                  <span>Lesson {index + 1}</span>
                  <span className={state?.passed ? "text-brass" : "text-stone"}>{status}</span>
                </span>
                <span className="mt-1 block font-display text-xl text-cream">{lesson.title}</span>
                <span className="mt-1 block text-xs text-stone">{lesson.minutes} min</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 hidden lg:block">
        {resetArmed ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
          >
            Clear this preview
          </button>
        ) : (
          <button
            type="button"
            onClick={onResetArm}
            className="text-[11px] uppercase tracking-[0.18em] text-stone hover:text-brass"
          >
            Reset this preview
          </button>
        )}
      </div>
    </nav>
  );
}
