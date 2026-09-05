import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Headphones,
  ShieldCheck,
  Truck,
  Heart,
  ArrowRight,
  Shirt,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export function ContactPage() {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: 'Message sent successfully!',
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
        variant: 'success',
      });
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    }, 400);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast({
      title: 'Subscribed to Bingooo Loop!',
      description: 'You will receive our latest drop updates and exclusive member offers.',
      variant: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-14">
        {/* ─── Top Section: Contact Info & Form (Exact Image 3) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Information (5 cols) */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="relative inline-block">
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-[#171717] uppercase tracking-tight">
                CONTACT US
              </h1>
              <span className="absolute -bottom-2 left-0 w-16 h-[3px] bg-[#E6321C]" />
            </div>

            <h2 className="mt-4 font-script text-3xl sm:text-4xl text-[#E6321C]">
              We'd love to hear from you!
            </h2>

            <p className="text-xs sm:text-sm text-[#6F6A63] font-sans leading-relaxed">
              Have a question, suggestion, or just want to say hello? Fill out the form or reach
              out to us using the details below.
            </p>

            {/* 4 Contact Cards */}
            <div className="space-y-4 pt-4">
              {/* Phone Card */}
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-[#DDD3C5] bg-white shadow-xs transition-colors hover:border-[#E6321C]/40"
              >
                <div className="h-11 w-11 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center shrink-0">
                  <Phone size={20} className="stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                    PHONE
                  </h4>
                  <a
                    href="tel:+917981787317"
                    className="font-sans font-bold text-sm text-[#171717] hover:text-[#E6321C] transition-colors block mt-0.5"
                  >
                    +91 79817 87317
                  </a>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    Mon – Sat, 10:00 AM – 8:00 PM
                  </p>
                </div>
              </motion.div>

              {/* Email Card */}
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-[#DDD3C5] bg-white shadow-xs transition-colors hover:border-[#E6321C]/40"
              >
                <div className="h-11 w-11 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center shrink-0">
                  <Mail size={20} className="stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                    EMAIL
                  </h4>
                  <a
                    href="mailto:hello@bingooo.in"
                    className="font-sans font-bold text-sm text-[#171717] hover:text-[#E6321C] transition-colors block mt-0.5"
                  >
                    hello@bingooo.in
                  </a>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    We reply within 24 hours
                  </p>
                </div>
              </motion.div>

              {/* Store Address Card */}
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-[#DDD3C5] bg-white shadow-xs transition-colors hover:border-[#E6321C]/40"
              >
                <div className="h-11 w-11 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center shrink-0">
                  <MapPin size={20} className="stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                    STORE ADDRESS
                  </h4>
                  <p className="font-sans font-bold text-sm text-[#171717] mt-0.5">
                    Bingooo Mens Wear
                  </p>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5 leading-relaxed">
                    Bypass Junction, Srikakulam,<br />
                    Andhra Pradesh – 532001, India
                  </p>
                </div>
              </motion.div>

              {/* WhatsApp Card */}
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-[#DDD3C5] bg-white shadow-xs transition-colors hover:border-[#E6321C]/40"
              >
                <div className="h-11 w-11 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center shrink-0">
                  <Phone size={20} className="stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                    WHATSAPP
                  </h4>
                  <a
                    href="https://wa.me/917981787317"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans font-bold text-sm text-[#171717] hover:text-[#E6321C] transition-colors block mt-0.5"
                  >
                    +91 79817 87317
                  </a>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    Chat with us on WhatsApp
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-10 shadow-sm text-left">
              <h3 className="font-heading font-extrabold text-lg uppercase tracking-wider text-[#171717] mb-6">
                SEND US A MESSAGE
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full h-12 rounded-xl border border-[#DDD3C5] bg-white px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 rounded-xl border border-[#DDD3C5] bg-white px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 rounded-xl border border-[#DDD3C5] bg-white px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-12 rounded-xl border border-[#DDD3C5] bg-white px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={6}
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-[#DDD3C5] bg-white p-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Send size={15} />
                  <span>{submitting ? 'SENDING...' : 'SEND MESSAGE'}</span>
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* ─── 4 Support Pillars (Exact Image 3) ─── */}
        <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left shadow-xs">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            className="flex items-start gap-3.5 transition-transform"
          >
            <Headphones size={26} className="text-[#E6321C] shrink-0 stroke-[1.8] mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                QUICK SUPPORT
              </h4>
              <p className="mt-1 text-xs text-[#6F6A63] font-sans">
                We're here to help you anytime.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            className="flex items-start gap-3.5 transition-transform"
          >
            <ShieldCheck size={26} className="text-[#E6321C] shrink-0 stroke-[1.8] mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                RELIABLE SERVICE
              </h4>
              <p className="mt-1 text-xs text-[#6F6A63] font-sans">
                Your satisfaction is our priority.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            className="flex items-start gap-3.5 transition-transform"
          >
            <Truck size={26} className="text-[#E6321C] shrink-0 stroke-[1.8] mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                FAST RESPONSE
              </h4>
              <p className="mt-1 text-xs text-[#6F6A63] font-sans">
                We respond to all queries quickly.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            className="flex items-start gap-3.5 transition-transform"
          >
            <Heart size={26} className="text-[#E6321C] shrink-0 stroke-[1.8] mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                WE CARE
              </h4>
              <p className="mt-1 text-xs text-[#6F6A63] font-sans">
                Customer happiness drives everything we do.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── VISIT OUR STORE SECTION (Exact Image 3) ─── */}
        <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 text-left space-y-4">
            <div className="relative inline-block mb-1">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
                VISIT OUR STORE
              </h2>
              <span className="absolute -bottom-1.5 left-0 w-12 h-[2.5px] bg-[#E6321C]" />
            </div>

            <p className="text-xs sm:text-sm text-[#6F6A63] font-sans leading-relaxed">
              Come say hi! We love meeting our amazing customers in person.
            </p>

            <div className="pt-2 flex items-start gap-3">
              <MapPin size={22} className="text-[#E6321C] shrink-0 mt-0.5" />
              <div>
                <span className="font-sans font-bold text-sm text-[#171717] block">
                  Bingooo Mens Wear
                </span>
                <span className="text-xs text-[#6F6A63] font-sans leading-relaxed">
                  Bypass Junction, Srikakulam,<br />
                  Andhra Pradesh – 532001, India
                </span>
              </div>
            </div>

            <div className="pt-3">
              <motion.a
                href="https://maps.google.com/?q=Bypass+Junction+Srikakulam+Andhra+Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E6321C] text-[#E6321C] hover:bg-[#FDF0EE] font-sans font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>GET DIRECTIONS</span>
                <ArrowRight size={14} />
              </motion.a>
            </div>
          </div>

          {/* Right Column: Srikakulam Store Map Frame (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#DDD3C5] bg-[#EAE2D5] shadow-xs flex items-center justify-center p-4">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-[#F4EFE6] opacity-90">
                {/* Roads */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-[#E6DCCF] border-y border-[#DDD2C2]" />
                <div className="absolute inset-y-0 left-1/3 w-8 bg-[#E6DCCF] border-x border-[#DDD2C2]" />
                <div className="absolute inset-y-0 left-2/3 w-6 bg-[#F9EB9A] border-x border-[#E0D283]" />
              </div>

              {/* Map Marker Pin */}
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex flex-col items-center cursor-pointer"
              >
                <div className="px-3 py-1.5 rounded-lg bg-[#E6321C] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <MapPin size={14} className="fill-white" />
                  <span>Bingooo Mens Wear</span>
                </div>
                <div className="w-2.5 h-2.5 bg-[#E6321C] rotate-45 -mt-1 shadow-sm" />
              </motion.div>

              {/* Map Landmark Labels */}
              <div className="absolute top-4 left-6 text-[10px] font-sans text-[#6F6A63] bg-white/70 px-2 py-0.5 rounded border border-[#DDD3C5]">
                Bypass Rd
              </div>
              <div className="absolute bottom-4 right-6 text-[10px] font-sans text-[#6F6A63] bg-white/70 px-2 py-0.5 rounded border border-[#DDD3C5]">
                Srikakulam Bypass Junction
              </div>
            </div>
          </div>
        </div>

        {/* ─── STAY IN THE LOOP Newsletter Banner (Exact Image 3) ─── */}
        <div className="rounded-2xl bg-[#F7EEDB] border border-[#DDD3C5] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-full bg-white/80 border border-[#DDD3C5] flex items-center justify-center text-[#E6321C] shrink-0 shadow-xs">
              <Shirt size={28} className="stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#171717]">
                STAY IN THE LOOP
              </h3>
              <p className="mt-0.5 text-xs text-[#6F6A63] font-sans">
                Get updates on new drops, exclusive offers, and style inspiration.
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletter} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 sm:w-72 h-12 rounded-xl border border-[#DDD3C5] bg-white px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none shadow-xs"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className="h-12 px-6 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
            >
              SUBSCRIBE
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
