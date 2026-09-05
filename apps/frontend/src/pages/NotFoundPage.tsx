import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export function NotFoundPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <Logo variant="red" size="lg" withLink className="mb-6" />
      <motion.p
        animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-display-xl text-border mb-2 font-black select-none"
      >
        404
      </motion.p>
      <h1 className="text-heading text-ink mb-3 font-bold">Page Not Found</h1>
      <p className="text-body text-muted mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </motion.div>
  );
}
