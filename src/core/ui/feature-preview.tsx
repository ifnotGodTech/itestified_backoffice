import { Card, CardDescription, CardTitle } from "@/core/ui/card";

export function FeaturePreview({
  eyebrow,
  title,
  description,
  highlights,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {highlights.map((highlight) => (
          <Card key={highlight} className="min-h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
            <CardTitle>{highlight}</CardTitle>
            <CardDescription>
              This module has been reserved in the new architecture so the remaining Figma states can be implemented
              without reworking the route structure again.
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
