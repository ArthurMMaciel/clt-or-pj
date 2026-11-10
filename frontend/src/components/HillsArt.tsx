import { useId } from "react";

export function HillsArt({ className = "" }: { className?: string }) {
  // Paisagem desenhada em SVG (original do projeto): camadas de colinas do verde-floresta ao lima.
  // Ids unicos por instancia: a arte aparece no hero e no CTA final.
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  return (
    <svg className={className} viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <radialGradient id={id("sun")} cx="78%" cy="20%" r="45%">
          <stop offset="0%" stopColor="#d4f46a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4f46a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("back")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3f8f5f" />
          <stop offset="100%" stopColor="#1c5a3d" />
        </linearGradient>
        <linearGradient id={id("mid")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2f7a52" />
          <stop offset="100%" stopColor="#14452f" />
        </linearGradient>
        <linearGradient id={id("front")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#174d35" />
          <stop offset="100%" stopColor="#0a281d" />
        </linearGradient>
        <linearGradient id={id("fade")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a281d" stopOpacity="1" />
          <stop offset="35%" stopColor="#0a281d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1440" height="560" fill={`url(#${id("sun")})`} />
      <path
        d="M0 300 C 180 220 340 250 520 290 C 700 330 860 210 1060 200 C 1240 190 1340 250 1440 240 L1440 560 L0 560 Z"
        fill={`url(#${id("back")})`}
        opacity="0.75"
      />
      <path
        d="M0 380 C 220 320 380 330 600 370 C 820 410 980 300 1180 300 C 1300 300 1380 330 1440 340 L1440 560 L0 560 Z"
        fill={`url(#${id("mid")})`}
      />
      <path
        d="M0 460 C 260 400 480 420 700 450 C 920 480 1120 400 1440 420 L1440 560 L0 560 Z"
        fill={`url(#${id("front")})`}
      />
      <rect width="1440" height="560" fill={`url(#${id("fade")})`} />
    </svg>
  );
}
