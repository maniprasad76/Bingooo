import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Logo variant="red" size="lg" withLink className="mb-6" />
      <p className="text-display-xl text-border mb-2 font-black">404</p>
      <h1 className="text-heading text-ink mb-3 font-bold">Page Not Found</h1>
      <p className="text-body text-muted mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  );
}
