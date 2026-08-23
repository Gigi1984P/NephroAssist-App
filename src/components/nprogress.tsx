"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let raf: number;
    let current = 0;
    let target = 30;
    
    setVisible(true);
    setProgress(0);
    current = 0;

    const step = () => {
      current += (target - current) * 0.1;
      if (current > target - 1) target = Math.min(target + 20, 90);
      setProgress(current);
      if (current < 99) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);

    const complete = setTimeout(() => {
      cancelAnimationFrame(raf);
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(complete);
    };
  }, [pathname, searchParams]);

  if (!visible && progress >= 100) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${Math.min(progress, 100)}%`,
        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
        zIndex: 9999,
        transition: progress >= 100 ? "width 0.3s ease" : "none",
        opacity: visible || progress < 100 ? 1 : 0,
        boxShadow: "0 0 8px rgba(59,130,246,0.4)",
      }}
    />
  );
}
