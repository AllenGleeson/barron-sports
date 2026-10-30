"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireLearner } from "@/components/course/account/RequireLearner";
import { ActionButton, Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import {
  changeLearnerPassword,
  MIN_PASSWORD_LENGTH,
  signOutLearner,
  updateLearnerName,
  useCourseEnrolment,
  type EnrolmentState,
  type Learner,
} from "@/lib/course/account";
import { formatRecordDate } from "@/lib/course/certificate";
import { learnerCourse } from "@/lib/course/curriculum";
import { courseEnrolmentOffer, isPaid } from "@/lib/course/enrolment";
import { loadProgress } from "@/lib/course/progress";
import { site } from "@/lib/site";

const card = "border border-line bg-moss px-5 py-6 sm:px-8";

export function CourseDashboard() {
  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>
        <RequireLearner path="/course/dashboard">
          {(learner) => <Dashboard learner={learner} />}
        </RequireLearner>
      </Container>
    </section>
  );
}

function Dashboard({ learner }: { learner: Learner }) {
  const state = useCourseEnrolment(learner.id);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <CourseCard learner={learner} state={state} />
      <AccountCard learner={learner} state={state} />
    </div>
  );
}

function CourseCard({ learner, state }: { learner: Learner; state: EnrolmentState }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  // Only rendered after sign-in is known, so the browser's saved progress can be read here.
  const [progress] = useState(loadProgress);
  const total = learnerCourse.lessons.length;
  const passed = learnerCourse.lessons.filter((lesson) => progress.lessons[lesson.slug]?.passed).length;
  const name = learner.name.trim();

  return (
    <section className={card} aria-labelledby="dashboard-course-heading">
      <Eyebrow>Your course</Eyebrow>
      <h2 id="dashboard-course-heading" className="mt-3 font-display text-3xl text-cream sm:text-4xl">
        {courseEnrolmentOffer.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-parchment">
        {total} lessons, each with notes, a short film and a quiz. Pass every quiz at{" "}
        {learnerCourse.passPercent}% to get your completion record.
      </p>

      {state.loading ? (
        <p className="mt-6 text-sm text-stone" role="status">
          Checking your enrolment…
        </p>
      ) : isPaid(state.enrolment) ? (
        <PaidCourse
          paidAt={state.enrolment.paidAt}
          completedAt={state.enrolment.completedAt ?? progress.completedAt}
          passed={passed}
          total={total}
        />
      ) : (
        <div className="mt-6">
          <p className="font-display text-4xl text-cream">{courseEnrolmentOffer.priceDisplay}</p>
          <p className="mt-1 text-sm text-stone">One-off payment. Take the course at your own pace.</p>
          {state.enrolment.status === "checkout_created" ? (
            <p className="mt-3 text-sm text-parchment">
              You started a payment but didn&apos;t finish it. You haven&apos;t been charged.
            </p>
          ) : null}
          <ActionButton className="mt-5" disabled={!name} onClick={() => setConfirming(true)}>
            Purchase
          </ActionButton>
          {name ? null : (
            <p className="mt-2 text-sm text-parchment">
              Add your name under Your account first. It&apos;s printed on your completion record.
            </p>
          )}
        </div>
      )}

      {confirming ? (
        <ConfirmDialog
          eyebrow="Before you pay"
          title="Is this the right name?"
          confirmLabel="Continue to payment"
          cancelLabel="Go back"
          onCancel={() => setConfirming(false)}
          onConfirm={() => router.push("/course/checkout")}
        >
          <p>Your completion record will be issued to:</p>
          <p className="font-display text-3xl text-cream">{name}</p>
          <p>
            This name can&apos;t be changed once you continue to payment. If it isn&apos;t exactly
            right, go back and change it under Your account first.
          </p>
        </ConfirmDialog>
      ) : null}
    </section>
  );
}

function PaidCourse({
  paidAt,
  completedAt,
  passed,
  total,
}: {
  paidAt: string | null;
  completedAt: string | null;
  passed: number;
  total: number;
}) {
  return (
    <div className="mt-6">
      <p className="text-sm text-brass">Purchased{paidAt ? ` on ${formatRecordDate(paidAt)}` : ""}.</p>
      <p className="mt-2 text-sm text-parchment">
        {completedAt
          ? `Completed on ${formatRecordDate(completedAt)}. The course can't be taken again, but your record and the lessons stay available.`
          : passed > 0
            ? `${passed} of ${total} lessons passed. Carry on whenever you like.`
            : "You haven't started yet. Take it at your own pace."}
      </p>
      <Button href="/course/learn" className="mt-5">
        {completedAt ? "View your record" : passed > 0 ? "Continue the course" : "Start the course"}
      </Button>
    </div>
  );
}

function AccountCard({ learner, state }: { learner: Learner; state: EnrolmentState }) {
  const router = useRouter();
  return (
    <section className={card} aria-labelledby="dashboard-account-heading">
      <Eyebrow>Your account</Eyebrow>
      <h2 id="dashboard-account-heading" className="sr-only">
        Your account
      </h2>
      <NameRow learner={learner} state={state} />
      <div className="mt-5">
        <p className={fieldLabelClass}>Email</p>
        <p className="mt-1 break-all text-base text-cream">{learner.email}</p>
        <p className="mt-1 text-xs text-stone">
          To change your email, contact the shop on {site.phone.display}.
        </p>
      </div>
      <PasswordRow email={learner.email} />
      <ActionButton
        variant="ghost"
        size="sm"
        className="mt-8"
        onClick={async () => {
          await signOutLearner();
          router.replace("/course/sign-in");
        }}
      >
        Sign out
      </ActionButton>
    </section>
  );
}

function NameRow({ learner, state }: { learner: Learner; state: EnrolmentState }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(learner.name);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // After payment the record's name is fixed; the server keeps its own copy of it.
  if (!state.loading && isPaid(state.enrolment)) {
    return (
      <div className="mt-5">
        <p className={fieldLabelClass}>Name on your record</p>
        <p className="mt-1 text-base text-cream">{state.enrolment.certificateName ?? learner.name}</p>
        <p className="mt-1 text-xs text-stone">
          Fixed when you bought the course, because it&apos;s printed on your completion record.
        </p>
      </div>
    );
  }

  if (!editing || state.loading) {
    return (
      <div className="mt-5">
        <p className={fieldLabelClass}>Name</p>
        <p className="mt-1 text-base text-cream">{learner.name || "—"}</p>
        {state.loading ? null : (
          <>
            <button
              type="button"
              className="mt-1 cursor-pointer text-xs text-brass hover:text-cream"
              onClick={() => {
                setName(learner.name);
                setEditing(true);
              }}
            >
              Change name
            </button>
            <p className="mt-1 text-xs text-stone">
              Printed on your completion record. It can&apos;t be changed after you buy the course.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <form
      className="mt-5"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim()) {
          setError("Enter your name.");
          return;
        }
        setBusy(true);
        const result = await updateLearnerName(name);
        setBusy(false);
        if (result) setError(result);
        else setEditing(false);
      }}
    >
      <label className="block">
        <span className={fieldLabelClass}>Name</span>
        <input
          className={fieldClass}
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />
      </label>
      <p className="mt-1 text-xs text-stone">
        Use your full name as it should appear on your completion record.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-parchment" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-3">
        <ActionButton type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </ActionButton>
        <ActionButton variant="secondary" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </ActionButton>
      </div>
    </form>
  );
}

function PasswordRow({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  }

  if (!open) {
    return (
      <div className="mt-5">
        <p className={fieldLabelClass}>Password</p>
        <p className="mt-1 text-base text-cream">••••••••</p>
        {done ? (
          <p className="mt-1 text-xs text-brass" role="status">
            Password changed.
          </p>
        ) : null}
        <button
          type="button"
          className="mt-1 cursor-pointer text-xs text-brass hover:text-cream"
          onClick={() => {
            setDone(false);
            setOpen(true);
          }}
        >
          Change password
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-5 space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const problem = !current
          ? "Enter your current password."
          : next.length < MIN_PASSWORD_LENGTH
            ? `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.`
            : next !== confirm
              ? "The new passwords don't match."
              : "";
        if (problem) {
          setError(problem);
          return;
        }
        setBusy(true);
        const result = await changeLearnerPassword(email, current, next);
        setBusy(false);
        if (result) {
          setError(result);
          return;
        }
        close();
        setDone(true);
      }}
    >
      {[
        { label: "Current password", value: current, set: setCurrent, auto: "current-password" },
        { label: "New password", value: next, set: setNext, auto: "new-password" },
        { label: "Repeat new password", value: confirm, set: setConfirm, auto: "new-password" },
      ].map((field) => (
        <label key={field.label} className="block">
          <span className={fieldLabelClass}>{field.label}</span>
          <input
            type="password"
            className={fieldClass}
            autoComplete={field.auto}
            value={field.value}
            onChange={(event) => {
              field.set(event.target.value);
              setError("");
            }}
          />
        </label>
      ))}
      {error ? (
        <p className="text-sm text-parchment" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <ActionButton type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Change password"}
        </ActionButton>
        <ActionButton variant="secondary" size="sm" onClick={close}>
          Cancel
        </ActionButton>
      </div>
    </form>
  );
}
