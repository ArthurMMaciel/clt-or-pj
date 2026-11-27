import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

// Movimento sem dependencia externa. Tudo respeita prefers-reduced-motion.

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function useInView<T extends Element>(options: { once?: boolean; rootMargin?: string } = {}) {
  const { once = true, rootMargin = "0px 0px -10% 0px" } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin]);

  return { ref, inView };
}

// Reveal ficou estatico: a entrada no scroll foi removida (atrasava a leitura e animava tudo).
// Mantido so porque o AdminDashboard (fora das rotas) ainda o importa.
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <Tag ref={ref} style={style} className={`reveal ${inView ? "is-visible" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

// Anima do valor anterior ate `to` quando ele muda. Na montagem mostra o valor final direto:
// numero financeiro "contando" a partir do zero exibe, por um instante, valores que nao existem.
export function useCountUp(to: number, { start = true, duration = 450 }: { start?: boolean; duration?: number } = {}) {
  const [value, setValue] = useState(to);
  const fromRef = useRef(to);

  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setValue(to);
      fromRef.current = to;
      return;
    }

    const from = fromRef.current;
    const begin = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - begin) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      // Guarda o ponto atual: se `to` mudar no meio, a proxima animacao parte daqui.
      fromRef.current = current;
      setValue(current);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, start, duration]);

  return value;
}
