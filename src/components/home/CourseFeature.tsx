import { Button } from "@/components/ui/Button";
import { CoverImage } from "@/components/media/CoverImage";
import { firearmsCourse } from "@/lib/site";

export function CourseFeature() {
  return (
    <section className="bg-ink pb-8 pt-2 lg:pb-10" aria-labelledby="home-course-heading">
      <div className="sm:mx-auto sm:max-w-7xl sm:px-8 lg:px-10">
        <div className="relative isolate overflow-hidden">
          <div className="relative min-h-[18rem] sm:min-h-[16rem] lg:min-h-[20rem]">
            <CoverImage
              src="/course/course-hero.jpg"
              alt="Hunting rifle and shotgun on an outdoor shooting bench at dusk"
              sizes="100vw"
              className="object-[center_35%]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent sm:from-ink/50"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-2 border border-brass/35 sm:inset-3"
              aria-hidden="true"
            />
            <div className="relative flex min-h-[18rem] flex-col justify-end px-5 py-6 sm:min-h-[16rem] sm:justify-center sm:px-8 sm:py-8 lg:min-h-[20rem] lg:px-12">
              <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-brass">
                <span className="inline-block h-px w-8 bg-brass" aria-hidden="true" />
                Featured course
              </p>
              <h2
                id="home-course-heading"
                className="mt-3 max-w-xl font-display text-3xl leading-[1.05] text-cream sm:text-4xl lg:text-5xl"
              >
                {firearmsCourse.title}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-parchment sm:text-base">
                When Form FCA1 is in and the certificate has been granted, the
                next step is this course.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/course">View Course</Button>
                <Button href={firearmsCourse.href} variant="secondary">
                  {firearmsCourse.cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
