import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-lime transition group-hover:rotate-[-8deg]">
        <Scale size={17} />
      </span>
      <span className={`font-display text-lg font-extrabold tracking-tight ${tone === "light" ? "text-white" : ""}`}>
        CLT <span className={tone === "light" ? "text-white/45" : "text-ink/40"}>ou</span> PJ
      </span>
    </Link>
  );
}
