import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BrandIntroScreen() {
  const [show, setShow] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const params = new URLSearchParams(window.location.search);
      if (params.get('nointro') === '1' || params.get('skip_intro') === '1') return false;
      if (params.get('intro') === '1') return true;
      // Skip for search crawlers & Lighthouse audits
      if (navigator.userAgent && /bot|googlebot|crawler|spider|lighthouse/i.test(navigator.userAgent)) {
        return false;
      }
      return !sessionStorage.getItem('bingooo_intro_seen');
    } catch (e) {
      return false;
    }
  });

  const [isDesktopOrTablet, setIsDesktopOrTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return false;
  });

  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Responsive device media query listener (tablets & desktops >= 640px)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 640px)');
    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktopOrTablet(e.matches);
    };
    setIsDesktopOrTablet(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    try {
      sessionStorage.setItem('bingooo_intro_seen', 'true');
    } catch (e) {}
  }, []);

  // Keyboard shortcut (Escape, Enter, Space to enter early)
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'Space') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [show, handleDismiss]);

  // Video playback & duration watcher
  useEffect(() => {
    if (!show) return;
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      // Transition out when video finishes or approaches end
      if (video.duration && !isNaN(video.duration) && video.currentTime >= video.duration - 0.1) {
        handleDismiss();
      } else if (video.currentTime >= 6.0) {
        handleDismiss();
      }
    };

    const onEnded = () => {
      handleDismiss();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    video.currentTime = 0;
    // Attempt playback with sound first
    video.muted = false;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If unmuted autoplay is blocked by browser policy, fallback to muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }

    // Safety fallback timer at 6.3s to guarantee entrance into store
    const timer = window.setTimeout(() => {
      handleDismiss();
    }, 6300);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      clearTimeout(timer);
    };
  }, [show, isDesktopOrTablet, handleDismiss]);

  // Tapping screen enables audio if muted, or enters store immediately
  const handleInteraction = () => {
    const video = videoRef.current;
    if (video && isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      handleDismiss();
    }
  };

  const currentVideoSrc = isDesktopOrTablet
    ? '/brand-intro-desktop.mp4?v=2'
    : '/brand-intro-mobile.mp4?v=2';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="brand-intro-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: 'easeInOut' },
          }}
          onClick={handleInteraction}
          className="fixed inset-0 z-[99999] bg-[#F7EEDB] flex items-center justify-center overflow-hidden cursor-pointer select-none"
          role="dialog"
          aria-label="Bingooo Brand Intro"
        >
          {/* Full-Screen Immersive Video Canvas:
              Adopts 100% full screen edge-to-edge on desktop, tablets & mobile without borders or letterboxing
          */}
          <div className="w-full h-full flex items-center justify-center bg-[#F7EEDB] p-0 m-0 overflow-hidden">
            <video
              ref={videoRef}
              key={isDesktopOrTablet ? 'desktop-video' : 'mobile-video'}
              src={currentVideoSrc}
              poster="/submark.png"
              playsInline
              autoPlay
              muted={isMuted}
              preload="auto"
              className="w-full h-full object-cover bg-[#F7EEDB]"
            >
              <source
                src="/brand-intro-desktop.mp4?v=2"
                media="(min-width: 640px)"
                type="video/mp4"
              />
              <source
                src="/brand-intro-mobile.mp4?v=2"
                type="video/mp4"
              />
            </video>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
