import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: 'Message received', description: 'Our support team will respond within 24 hours', variant: 'success' });
  };

  return (
    <div className="container-page py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-display-lg font-bold text-ink">Get in Touch</h1>
        <p className="mt-2 text-body text-muted">
          Have a question about custom prints, sizing, or bulk orders? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-white">
            <div className="p-3 rounded-lg bg-paper text-ink"><Mail size={20} /></div>
            <div>
              <h4 className="text-body font-bold text-ink">Email Support</h4>
              <p className="text-caption text-muted">support@bingooo.in</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-white">
            <div className="p-3 rounded-lg bg-paper text-ink"><Phone size={20} /></div>
            <div>
              <h4 className="text-body font-bold text-ink">Customer Helpline</h4>
              <p className="text-caption text-muted">+91 80 4567 8900 (Mon-Sat 10am - 7pm IST)</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-white">
            <div className="p-3 rounded-lg bg-paper text-ink"><MapPin size={20} /></div>
            <div>
              <h4 className="text-body font-bold text-ink">Design Studio & Workshop</h4>
              <p className="text-caption text-muted">Indiranagar, Bengaluru, Karnataka 560038</p>
            </div>
          </div>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="rounded-xl border border-success/30 bg-success-light/30 p-8 text-center space-y-3">
            <h3 className="text-heading font-bold text-success">Message Sent Successfully!</h3>
            <p className="text-body text-muted">
              Thank you for contacting Bingooo. Our team will get back to you shortly.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="mt-4">
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-heading font-bold text-ink">Send Us a Message</h3>
            <Input label="Your Name" required placeholder="Jane Doe" />
            <Input label="Email Address" type="email" required placeholder="jane@example.com" />
            <div>
              <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-1">
                Your Message
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tell us what you need..."
                className="w-full rounded-md border border-border bg-paper p-3 text-body text-ink focus:border-ink focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" fullWidth size="lg">
              <Send size={16} /> Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
