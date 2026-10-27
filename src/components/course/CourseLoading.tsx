import { Container } from "@/components/ui/Container";

/** Placeholder shown while a course page reads this browser's saved state. */
export function CourseLoading({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-ink py-10 lg:py-14">
      <Container>
        <p className="text-sm text-stone" role="status">
          {children}
        </p>
      </Container>
    </section>
  );
}
