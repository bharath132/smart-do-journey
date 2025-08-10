import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      el.style.setProperty("--parallax-x", `${x}px`);
      el.style.setProperty("--parallax-y", `${y}px`);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 size-[420px] rounded-full bg-primary/20 blur-3xl animate-[float_12s_ease-in-out_infinite] will-change-transform" style={{ transform: "translate(var(--parallax-x), var(--parallax-y))" }} />
      <div className="absolute top-1/2 -right-32 size-[520px] rounded-full bg-accent/20 blur-3xl animate-[float_16s_ease-in-out_infinite_reverse] will-change-transform" style={{ transform: "translate(calc(var(--parallax-x)*-1), calc(var(--parallax-y)*-1))" }} />
      <div className="absolute bottom-0 left-1/3 size-[360px] rounded-full bg-secondary/20 blur-3xl animate-[float_18s_ease-in-out_infinite] will-change-transform" style={{ transform: "translate(calc(var(--parallax-x)*0.5), calc(var(--parallax-y)*0.5))" }} />
    </div>
  );
}
