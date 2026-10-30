import { useState } from "react";
import {
  gradeQuiz,
  requiredCorrectCount,
  startingAnswers,
  type CourseLesson,
  type QuizGrade,
} from "@/lib/course/curriculum";
import type { LessonProgress } from "@/lib/course/progress";
import { ActionButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

type QuizPanelProps = {
  lesson: CourseLesson;
  saved: LessonProgress;
  nextAction: { label: string; onClick: () => void } | null;
  onGraded: (grade: QuizGrade, answers: Record<string, string>) => void;
};

export function QuizPanel({ lesson, saved, nextAction, onGraded }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => saved.lastAnswers ?? startingAnswers(lesson.quiz),
  );
  const [submitted, setSubmitted] = useState(Boolean(saved.lastAnswers) || saved.passed);
  const [error, setError] = useState("");
  // After a pass, the result screen shows first; "Review questions" opens the marked quiz.
  const [reviewing, setReviewing] = useState(false);
  const grade = submitted ? gradeQuiz(lesson.quiz, answers) : null;
  const needed = requiredCorrectCount(lesson.quiz.questions.length, lesson.quiz.passPercent);

  // Older saved passes may have no answers to review, only a score.
  const passedWithoutAnswers = saved.passed && !saved.lastAnswers;
  if (passedWithoutAnswers || (grade?.passed && !reviewing)) {
    return (
      <QuizResult
        scorePercent={grade?.scorePercent ?? saved.scorePercent}
        correct={grade?.correct ?? null}
        total={lesson.quiz.questions.length}
        passPercent={lesson.quiz.passPercent}
        nextAction={nextAction}
        onReview={passedWithoutAnswers ? null : () => setReviewing(true)}
      />
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const missing = lesson.quiz.questions.some((question) => !answers[question.id]);
    if (missing) {
      setError("Answer every question before you submit.");
      return;
    }
    setError("");
    setSubmitted(true);
    onGraded(gradeQuiz(lesson.quiz, answers), answers);
  }

  return (
    <form className="mt-6 border border-line bg-moss px-5 py-6 sm:px-8" onSubmit={submit}>
      <p className="text-sm leading-relaxed text-parchment">
        Pass mark {lesson.quiz.passPercent}% ({needed} of {lesson.quiz.questions.length}). This
        preview checks the answers in the browser.
      </p>
      {saved.attempts > 0 ? (
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone">
          {saved.attempts} {saved.attempts === 1 ? "attempt" : "attempts"}
          {saved.scorePercent !== null ? ` · best ${saved.scorePercent}%` : ""}
        </p>
      ) : null}

      <ol className="mt-6 space-y-6">
        {lesson.quiz.questions.map((question, index) => {
          const result = grade?.results.find((item) => item.id === question.id);
          const correctOption = question.options.find(
            (option) => option.id === question.correctOptionId,
          );

          return (
            <li key={question.id}>
              <fieldset>
                <legend className="text-base text-cream">
                  <span className="mr-2 text-brass">{index + 1}.</span>
                  {question.prompt}
                </legend>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option) => {
                    const chosen = (result?.chosenId ?? answers[question.id]) === option.id;
                    const showCorrect = Boolean(result) && option.id === question.correctOptionId;
                    const showWrong = Boolean(result) && chosen && !result?.isCorrect;
                    return (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 border px-4 py-3 text-sm leading-relaxed ${
                          showCorrect
                            ? "border-brass bg-ink text-cream"
                            : showWrong
                              ? "border-danger bg-ink text-parchment"
                              : chosen
                                ? "border-brass bg-ink text-cream"
                                : "border-line bg-ink/40 text-parchment"
                        } ${submitted ? "" : "cursor-pointer hover:border-brass/60"}`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          disabled={submitted}
                          onChange={() => {
                            setAnswers((current) => ({ ...current, [question.id]: option.id }));
                            setError("");
                          }}
                          className="mt-1 accent-brass"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {result ? (
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    {result.isCorrect ? "Correct. " : `Correct answer: ${correctOption?.label}. `}
                    {question.explanation}
                  </p>
                ) : null}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mt-4 text-sm text-parchment" role="alert">
          {error}
        </p>
      ) : null}

      {grade ? (
        <p className="mt-6 text-base text-cream" role="status">
          {grade.passed
            ? `Passed at ${grade.scorePercent}%.`
            : `${grade.scorePercent}%. The pass mark is ${lesson.quiz.passPercent}%.`}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!submitted ? <ActionButton type="submit">Submit quiz</ActionButton> : null}
        {submitted && !grade?.passed ? (
          <ActionButton
            onClick={() => {
              setAnswers(startingAnswers(lesson.quiz));
              setSubmitted(false);
              setError("");
            }}
          >
            Try again
          </ActionButton>
        ) : null}
        {grade?.passed && nextAction ? (
          <ActionButton onClick={nextAction.onClick}>{nextAction.label}</ActionButton>
        ) : null}
      </div>
    </form>
  );
}

type QuizResultProps = {
  scorePercent: number | null;
  correct: number | null;
  total: number;
  passPercent: number;
  nextAction: { label: string; onClick: () => void } | null;
  onReview: (() => void) | null;
};

/** Shown after a passed quiz: the score, then continue or review. */
function QuizResult({ scorePercent, correct, total, passPercent, nextAction, onReview }: QuizResultProps) {
  return (
    <div className="mt-6 border border-brass bg-moss px-5 py-8 text-center sm:px-8 sm:py-10" role="status">
      <Eyebrow>Quiz passed</Eyebrow>
      {scorePercent !== null ? (
        <p className="mt-4 font-display text-6xl text-cream sm:text-7xl">{scorePercent}%</p>
      ) : null}
      <p className="mt-3 text-sm text-parchment">
        {correct !== null ? `${correct} of ${total} correct. ` : ""}The pass mark is {passPercent}%.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {nextAction ? (
          <ActionButton onClick={nextAction.onClick}>{nextAction.label}</ActionButton>
        ) : null}
        {onReview ? (
          <ActionButton variant="secondary" onClick={onReview}>
            Review questions
          </ActionButton>
        ) : null}
      </div>
    </div>
  );
}
