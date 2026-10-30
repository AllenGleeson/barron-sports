import Link from "next/link";
import { learnerCourse } from "@/lib/course/curriculum";
import {
  certificateSvg,
  downloadCertificate,
  formatRecordDate,
  recordCode,
} from "@/lib/course/certificate";
import { ActionButton } from "@/components/ui/Button";
import { fieldLabelClass } from "@/components/ui/styles";
import { Eyebrow } from "@/components/ui/Eyebrow";

type CompletionRecordProps = {
  /** When the course was finished (the server's date once it has one), or null. */
  completedAt: string | null;
  /** The name fixed at payment, and the account email. */
  learner: { name: string; email: string };
};

export function CompletionRecord({ completedAt, learner }: CompletionRecordProps) {
  const name = learner.name.trim();
  const email = learner.email.trim();
  const svg = completedAt && name ? certificateSvg(name, completedAt) : null;
  const code = completedAt && name ? recordCode(name, completedAt) : null;

  if (!completedAt) {
    return (
      <section id="completion-record" className="mt-10 scroll-mt-28 border border-line bg-moss px-5 py-6 sm:px-8">
        <Eyebrow>Completion record</Eyebrow>
        <h2 className="mt-3 font-display text-3xl text-cream">Pass every quiz to open the record</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-parchment">
          Each lesson needs {learnerCourse.passPercent}%. The record can then be downloaded.
        </p>
        <GardaReviewNote />
      </section>
    );
  }

  return (
    <section id="completion-record" className="mt-10 scroll-mt-28 border border-brass bg-moss px-5 py-6 sm:px-8">
      <Eyebrow>Completion record</Eyebrow>
      <h2 className="mt-3 font-display text-3xl text-cream">All lessons passed</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-parchment">
        Completed {formatRecordDate(completedAt)}. The record is issued to the name you
        confirmed when you bought the course. Download keeps a copy on this device.
      </p>
      <GardaReviewNote />

      {name ? (
        <dl className="mt-6">
          <dt className={fieldLabelClass}>Name on the record</dt>
          <dd className="mt-2 text-base text-cream">{name}</dd>
        </dl>
      ) : null}

      {svg ? (
        <div
          className="mt-6 overflow-hidden border border-line [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="mt-6 text-sm text-parchment">
          Your account has no name yet, so the record can&apos;t be issued. Add your name on{" "}
          <Link href="/course/dashboard" className="text-brass hover:text-cream">
            your dashboard
          </Link>
          .
        </p>
      )}

      {code && email ? (
        <p className="mt-6 border border-line bg-ink px-4 py-3 text-sm leading-relaxed text-parchment" role="status">
          A copy of your certificate has been emailed to{" "}
          <span className="break-all text-cream">{email}</span>.{" "}
          <span className="text-stone">(Preview: emails aren&apos;t sent yet.)</span>
        </p>
      ) : null}

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
      </div>
    </section>
  );
}

function GardaReviewNote() {
  return (
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone">
      All course records are kept on file and may be reviewed by An Garda Síochána, for example
      when you apply for or renew a firearm certificate.
    </p>
  );
}
