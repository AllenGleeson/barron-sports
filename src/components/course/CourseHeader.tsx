import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type CourseHeaderProps = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

/** The band at the top of the online course pages (account, checkout, lessons). */
export function CourseHeader({ eyebrow, title, children }: CourseHeaderProps) {
  return (
    <section className="border-b border-line bg-forest">
      <Container className="py-8 lg:py-12">
        <Eyebrow wide>{eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display text-5xl leading-tight text-cream sm:text-6xl">{title}</h1>
        {children}
      </Container>
    </section>
  );
}
