import { motion } from 'framer-motion';

interface BrandPageLoaderProps {
  /** Optional custom message */
  message?: string;
  /** Fullscreen fixed overlay vs container height */
  fullScreen?: boolean;
}

export function BrandPageLoader({
  message = 'Crafting your menswear edit...',
  fullScreen = true,
}: BrandPageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#F7EEDB] z-50 select-none ${
        fullScreen ? 'fixed inset-0 min-h-screen w-screen' : 'min-h-[400px] w-full py-16'
      }`}
      role="status"
      aria-label="Loading content"
    >
      {/* Brand Monogram with Luxury Pulse Effect */}
      <div className="relative flex items-center justify-center">
        {/* Glowing Aura Ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.35, 0.08, 0.35],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute h-24 w-24 rounded-full bg-[#E6321C]/20 blur-xl"
        />

        {/* Outer Rotating Border Accent */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute h-20 w-20 rounded-full border border-dashed border-[#E6321C]/40"
        />

        {/* Inner Solid Badge */}
        <motion.div
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white shadow-xl border border-white/10"
        >
          <span className="text-2xl font-black tracking-tighter text-[#E6321C]">B</span>
        </motion.div>
      </div>

      {/* Brand Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-6 text-center"
      >
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#171717]">
          BINGOOO <span className="text-[#E6321C]">MEN'S WEAR</span>
        </span>
        <p className="mt-2 text-sm font-medium text-[#6F6A63] tracking-wide">
          {message}
        </p>
      </motion.div>

      {/* Elegant Indeterminate Progress Line */}
      <div className="mt-5 h-[3px] w-44 overflow-hidden rounded-full bg-[#DDD3C5]">
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-full w-1/2 rounded-full bg-[#E6321C]"
        />
      </div>

      <span className="sr-only">Loading, please wait...</span>
    </div>
  );
}
