import { useState } from "react";
import { learnerCourse } from "@/lib/course/curriculum";
import {
  certificateSvg,
  downloadCertificate,
  formatRecordDate,
  recordCode,
} from "@/lib/course/certificate";
import type { LearnProgress } from "@/lib/course/progress";
import { ActionButton } from "@/components/ui/Button";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import { Eyebrow } from "@/components/ui/Eyebrow";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CompletionRecordProps = {
  progress: LearnProgress;
  onChange: (progress: LearnProgress) => void;
};

export function CompletionRecord({ progress, onChange }: CompletionRecordProps) {
  const [emailError, setEmailError] = useState("");
  const ready = Boolean(progress.completedAt);
  const name = progress.name.trim();
  const svg =
    ready && progress.completedAt && name
      ? certificateSvg(name, progress.completedAt)
      : null;
  const code = ready && progress.completedAt && name ? recordCode(name, progress.completedAt) : null;

  if (!ready || !progress.completedAt) {
    return (
      <section id="completion-record" className="mt-10 scroll-mt-28 border border-line bg-moss px-5 py-6 sm:px-8">
        <Eyebrow>Completion record</Eyebrow>
        <h2 className="mt-3 font-display text-3xl text-cream">Pass every quiz to open the record</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-parchment">
          Each lesson needs {learnerCourse.passPercent}%. The record can then be downloaded, and
          you can preview the email that will carry it.
        </p>
      </section>
    );
  }

  return (
    <section id="completion-record" className="mt-10 scroll-mt-28 border border-brass bg-moss px-5 py-6 sm:px-8">
      <Eyebrow>Completion record</Eyebrow>
      <h2 className="mt-3 font-display text-3xl text-cream">All four lessons passed</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-parchment">
        Completed {formatRecordDate(progress.completedAt)}. Add the name that should appear on the
        record. Download keeps a copy on this device. Email is a preview of the message the live
        course will send with the PDF.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={fieldLabelClass}>Name on the record</span>
          <input
            value={progress.name}
            autoComplete="name"
            onChange={(event) =>
              onChange({ ...progress, name: event.target.value, emailedAt: null })
            }
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className={fieldLabelClass}>Email</span>
          <input
            type="email"
            value={progress.email}
            autoComplete="email"
            onChange={(event) => {
              setEmailError("");
              onChange({ ...progress, email: event.target.value, emailedAt: null });
            }}
            className={fieldClass}
          />
        </label>
      </div>

      {svg ? (
        <div
          className="mt-6 overflow-hidden border border-line [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="mt-6 text-sm text-parchment">Add a name to preview the record.</p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ActionButton
          disabled={!svg || !code}
          onClick={() => {
            if (!svg || !code) return;
            downloadCertificate(svg, code);
          }}
        >
          Download record
        </ActionButton>
        <ActionButton variant="ghost"
          onClick={() => {
            const email = progress.email.trim();
            if (!name) {
              setEmailError("Add the name for the record first.");
              return;
            }
            if (!emailPattern.test(email)) {
              setEmailError("Enter an email address for the preview.");
              return;
            }
            setEmailError("");
            onChange({ ...progress, email, emailedAt: new Date().toISOString() });
          }}
        >
          Email this record
        </ActionButton>
      </div>

      {emailError ? (
        <p className="mt-4 text-sm text-parchment" role="alert">
          {emailError}
        </p>
      ) : null}

      {progress.emailedAt && code ? (
        <div className="mt-5 border border-line bg-ink px-4 py-4 text-sm leading-relaxed text-parchment" role="status">
          <p className="text-[11px] uppercase tracking-[0.18em] text-brass">Email preview</p>
          <p className="mt-2">To: {progress.email.trim()}</p>
          <p>Subject: Your Barron Sports course record</p>
          <p className="mt-2">
            A PDF of record {code} would be attached for {name}. The live course sends that file.
            This preview stores the address on this device.
          </p>
        </div>
      ) : null}
    </section>
  );
}
