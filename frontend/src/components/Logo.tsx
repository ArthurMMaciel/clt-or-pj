import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 rounded-md" aria-label="CLT ou PJ, página inicial">
      <span className={`grid h-8 w-8 place-items-center rounded-md ${light ? "bg-lime text-forest-deep" : "bg-forest text-lime"}`}>
        <Scale size={16} aria-hidden />
      </span>
      <span className={`font-display text-[1.2rem] font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        CLT <em className={`font-normal ${light ? "text-white/60" : "text-subtle"}`}>ou</em> PJ
      </span>
    </Link>
  );
}
