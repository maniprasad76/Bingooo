import { useEffect, useRef } from 'react';

// A passive scroll listener writes one transform per frame; a short CSS
// transition smooths it. Keeps framer-motion's scroll and spring engine out of
// the first page load.
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div
      ref={barRef}
      style={{ transform: 'scaleX(0)' }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#E6321C] origin-left z-[55] shadow-xs transition-transform duration-100 ease-out"
      aria-hidden="true"
    />
  );
}
