import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-md py-4 sm:py-8">
      <div className="mb-6 text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-ink/60">{description}</p>
      </div>
      <div className="card p-6 sm:p-7">{children}</div>
    </section>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const style = tone === "error" ? "border-clay/25 bg-clay/5 text-clay" : "border-mint/25 bg-mint-soft text-mint-dark";
  return <p className={`rounded-lg border px-3 py-2.5 text-sm ${style}`}>{children}</p>;
}
