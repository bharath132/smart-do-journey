import React, { useEffect, useMemo, useState } from "react";

type BlastVariant = "success" | "danger";

interface BlastEffectProps {
  variant: BlastVariant;
  durationMs?: number;
  particleCount?: number;
  onDone?: () => void;
}

export default function BlastEffect({
  variant,
  durationMs = 700,
  particleCount = 18,
  onDone,
}: BlastEffectProps) {
  const [animate, setAnimate] = useState(false);

  const colors = useMemo(() => {
    if (variant === "danger") {
      return { primary: "#ef4444", secondary: "#fca5a5", ring: "rgba(239,68,68,0.5)" };
    }
    return { primary: "#22c55e", secondary: "#86efac", ring: "rgba(34,197,94,0.45)" };
  }, [variant]);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, index) => {
      const angle = Math.random() * Math.PI * 2; // 0..2π
      const distance = 16 + Math.random() * 28; // px
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = 3 + Math.random() * 4; // px
      const delay = Math.random() * 80; // ms
      const bg = index % 2 === 0 ? colors.primary : colors.secondary;
      return { dx, dy, size, delay, bg };
    });
  }, [particleCount, colors.primary, colors.secondary]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));
    const doneTimer = setTimeout(() => onDone?.(), durationMs + 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(doneTimer);
    };
  }, [durationMs, onDone]);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{ transform: "translate(-50%, -50%)" }}
    >
      {/* Shockwave ring */}
      <span
        style={{
          position: "absolute",
          left: -2,
          top: -2,
          width: 4,
          height: 4,
          borderRadius: 9999,
          border: `2px solid ${colors.ring}`,
          opacity: animate ? 0 : 1,
          transform: animate ? "scale(7)" : "scale(1)",
          transition: `transform ${durationMs}ms cubic-bezier(0.2,0.7,0.3,1), opacity ${durationMs}ms ease-out`,
        }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: 9999,
            background: p.bg,
            opacity: animate ? 0 : 1,
            transform: animate ? `translate(${p.dx}px, ${p.dy}px) scale(0.8)` : "translate(0px, 0px) scale(1)",
            transition: `transform ${durationMs}ms cubic-bezier(0.16,1,0.3,1) ${p.delay}ms, opacity ${durationMs}ms ease-out ${p.delay}ms`,
          }}
        />)
      )}
    </div>
  );
}


