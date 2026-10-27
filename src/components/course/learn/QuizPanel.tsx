import { useState } from "react";
import {
  gradeQuiz,
  requiredCorrectCount,
  type CourseLesson,
  type QuizGrade,
} from "@/lib/course/curriculum";
import type { LessonProgress } from "@/lib/course/progress";
import { ActionButton } from "@/components/ui/Button";

type QuizPanelProps = {
  lesson: CourseLesson;
  saved: LessonProgress;
  nextAction: { label: string; onClick: () => void } | null;
  onGraded: (grade: QuizGrade, answers: Record<string, string>) => void;
};

export function QuizPanel({ lesson, saved, nextAction, onGraded }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(saved.lastAnswers ?? {});
  const [submitted, setSubmitted] = useState(Boolean(saved.lastAnswers) || saved.passed);
  const [error, setError] = useState("");
  const grade = submitted ? gradeQuiz(lesson.quiz, answers) : null;
  const needed = requiredCorrectCount(lesson.quiz.questions.length, lesson.quiz.passPercent);

  if (saved.passed && !saved.lastAnswers) {
    return (
      <div className="mt-6 border border-line bg-moss px-5 py-6 sm:px-8">
        <p className="text-base text-cream" role="status">
          Passed{saved.scorePercent !== null ? ` at ${saved.scorePercent}%` : ""}.
        </p>
        {nextAction ? (
          <ActionButton className="mt-6" onClick={nextAction.onClick}>
            {nextAction.label}
          </ActionButton>
        ) : null}
      </div>
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
              setAnswers({});
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
