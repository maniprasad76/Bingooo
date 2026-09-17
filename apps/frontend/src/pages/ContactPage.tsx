import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PhoneCall, Mail } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useToast } from '../components/ui/Toast';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import {
  BINGOOO_EMAIL_SUPPORT,
  BINGOOO_PHONE_DISPLAY,
  BINGOOO_PHONE_RAW,
  BINGOOO_INSTAGRAM_URL,
  BINGOOO_INSTAGRAM_HANDLE,
  getWhatsAppUrl,
  WhatsAppIcon,
  InstagramIcon,
} from '../components/ui/SocialIcons';

export function ContactPage() {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    order: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'Please enter your name.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!formData.subject) {
      errs.subject = 'Please select a subject.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please enter your message.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerHaptic('warning');
      return;
    }

    setSubmitting(true);
    triggerHaptic('medium');

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast({
        title: 'Message dispatched successfully',
        description: "Thanks for reaching out — our team will get back to you within 24 hours.",
        variant: 'success',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        order: '',
        subject: '',
        message: '',
      });
      setErrors({});

      setTimeout(() => {
        setSubmitted(false);
      }, 6000);
    }, 800);
  };

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen">
      <SEO
        title="Contact Us | BINGOOO Men's Wear"
        description="Get in touch with Bingooo for orders, sizing, shipping, returns, and custom apparel design inquiries."
        canonical="https://bingooo.in/contact"
      />

      {/* =======================================================
           HERO
      ======================================================= */}
      <section className="py-[60px] sm:py-[90px] lg:pb-[100px]">
        <div className="container-bingooo grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[70px] items-center">
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#e6321c] mb-6 before:content-[''] before:w-7 before:h-[2px] before:bg-[#e6321c]">
              Get in touch
            </div>

            <h1 className="m-0 max-w-[700px] text-[clamp(48px,7vw,92px)] leading-[0.92] tracking-[-0.065em] font-extrabold uppercase">
              LET'S<br />
              <span className="text-[#e6321c]">TALK.</span>
            </h1>

            <p className="max-w-[540px] mt-[30px] mb-0 text-[#6f6a63] text-[15px] sm:text-[17px] leading-[1.8]">
              Have a question about your order, your fit, your delivery, or your next custom design? We're here to help.
            </p>

            <div className="flex items-center gap-[25px] mt-[35px] flex-wrap">
              <div className="flex items-center gap-[9px] text-[12px] font-bold">
                <span className="w-[7px] h-[7px] bg-[#e6321c] rounded-full" />
                Customer Support
              </div>

              <div className="flex items-center gap-[9px] text-[12px] font-bold">
                <span className="w-[7px] h-[7px] bg-[#e6321c] rounded-full" />
                Custom Design
              </div>
            </div>
          </div>

          <div className="h-[380px] sm:h-[480px] lg:h-[570px] overflow-hidden bg-[#ede0cc] relative">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85"
              alt="Bingooo fashion support editorial"
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute bottom-5 left-5 bg-white px-[15px] py-3 text-[10px] font-extrabold tracking-[0.1em] uppercase text-[#171717] shadow-sm">
              Bingooo / Support
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           CONTACT OPTIONS (4 CARDS)
      ======================================================= */}
      <section className="bg-[#171717] text-white py-[65px] sm:py-[75px]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <h2 className="m-0 text-[34px] sm:text-[42px] leading-none tracking-[-0.05em] uppercase text-white">
              HOW CAN WE<br />HELP?
            </h2>

            <p className="max-w-[400px] m-0 text-[#aaaaaa] text-[13px] sm:text-[14px] leading-[1.7]">
              Whether you're checking an order, choosing your size, or planning a custom piece, choose the quickest way to reach us.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#333333]">
            {/* Option 01 - Email */}
            <div className="min-h-[220px] p-7 border-r border-b border-[#333333] flex flex-col hover:bg-[#222222] transition-colors group">
              <div className="text-[10px] text-[#777777] font-mono font-bold mb-8">
                01
              </div>
              <div className="w-[38px] h-[38px] border border-[#555555] grid place-items-center mb-5 text-[#e6321c]">
                <Mail className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[17px] font-bold uppercase tracking-[-0.02em] mb-1 text-white">
                Official Email
              </h3>
              <div className="text-[11px] font-mono text-[#e6321c] mb-2 select-all">
                {BINGOOO_EMAIL_SUPPORT}
              </div>
              <p className="text-[#999999] text-[12px] leading-[1.7] mb-auto">
                Send us your questions, order feedback, or custom design queries.
              </p>
              <a
                href={`mailto:${BINGOOO_EMAIL_SUPPORT}?subject=Inquiry%20from%20Bingooo%20Store`}
                onClick={() => triggerHaptic('light')}
                className="mt-6 text-[#e6321c] text-[11px] font-extrabold tracking-[0.06em] uppercase group-hover:translate-x-1 transition-transform inline-block"
              >
                Send Email →
              </a>
            </div>

            {/* Option 02 - WhatsApp */}
            <div className="min-h-[220px] p-7 border-r border-b border-[#333333] flex flex-col hover:bg-[#222222] transition-colors group">
              <div className="text-[10px] text-[#777777] font-mono font-bold mb-8">
                02
              </div>
              <div className="w-[38px] h-[38px] border border-[#555555] grid place-items-center mb-5 text-[#25D366]">
                <WhatsAppIcon className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[17px] font-bold uppercase tracking-[-0.02em] mb-1 text-white">
                WhatsApp Chat
              </h3>
              <div className="text-[11px] font-mono text-[#25D366] mb-2 select-all">
                {BINGOOO_PHONE_DISPLAY}
              </div>
              <p className="text-[#999999] text-[12px] leading-[1.7] mb-auto">
                Direct WhatsApp assistance for orders, sizing recommendations, and custom design approvals.
              </p>
              <a
                href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about your apparel and custom designs.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="mt-6 text-[#25D366] text-[11px] font-extrabold tracking-[0.06em] uppercase group-hover:translate-x-1 transition-transform inline-block"
              >
                Chat on WhatsApp →
              </a>
            </div>

            {/* Option 03 - Phone Call */}
            <div className="min-h-[220px] p-7 border-r border-b border-[#333333] flex flex-col hover:bg-[#222222] transition-colors group">
              <div className="text-[10px] text-[#777777] font-mono font-bold mb-8">
                03
              </div>
              <div className="w-[38px] h-[38px] border border-[#555555] grid place-items-center mb-5 text-[#e6321c]">
                <PhoneCall className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[17px] font-bold uppercase tracking-[-0.02em] mb-1 text-white">
                Direct Call
              </h3>
              <div className="text-[11px] font-mono text-[#d4d1cc] mb-2 select-all">
                {BINGOOO_PHONE_DISPLAY}
              </div>
              <p className="text-[#999999] text-[12px] leading-[1.7] mb-auto">
                Speak directly with our atelier team in Srikakulam (Mon–Sat, 9 AM – 9 PM IST).
              </p>
              <a
                href={`tel:+${BINGOOO_PHONE_RAW}`}
                onClick={() => triggerHaptic('light')}
                className="mt-6 text-[#e6321c] text-[11px] font-extrabold tracking-[0.06em] uppercase group-hover:translate-x-1 transition-transform inline-block"
              >
                Call Concierge →
              </a>
            </div>

            {/* Option 04 - Instagram */}
            <div className="min-h-[220px] p-7 border-r border-b border-[#333333] flex flex-col hover:bg-[#222222] transition-colors group">
              <div className="text-[10px] text-[#777777] font-mono font-bold mb-8">
                04
              </div>
              <div className="w-[38px] h-[38px] border border-[#555555] grid place-items-center mb-5 text-[#E1306C]">
                <InstagramIcon className="w-[18px] h-[18px]" />
              </div>
              <h3 className="text-[17px] font-bold uppercase tracking-[-0.02em] mb-1 text-white">
                Instagram Community
              </h3>
              <div className="text-[11px] font-mono text-[#E1306C] mb-2 select-all">
                {BINGOOO_INSTAGRAM_HANDLE}
              </div>
              <p className="text-[#999999] text-[12px] leading-[1.7] mb-auto">
                Explore reel drops, style inspiration, and tag us to be featured on our community feed.
              </p>
              <a
                href={BINGOOO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="mt-6 text-[#E1306C] text-[11px] font-extrabold tracking-[0.06em] uppercase group-hover:translate-x-1 transition-transform inline-block"
              >
                Follow @bingooo.co →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           CONTACT FORM & INFO SECTION
      ======================================================= */}
      <section className="py-[65px] sm:py-[100px]">
        <div className="container-bingooo grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-20 items-start">
          {/* Info Column */}
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#e6321c] mb-6 before:content-[''] before:w-7 before:h-[2px] before:bg-[#e6321c]">
              Contact Bingooo
            </div>

            <h2 className="m-0 text-[34px] sm:text-[42px] leading-tight tracking-[-0.055em] font-extrabold uppercase">
              YOUR<br />
              QUESTION.<br />
              <span className="text-[#e6321c]">OUR PEOPLE.</span>
            </h2>

            <p className="mt-[22px] text-[#6f6a63] text-[14px] leading-[1.8] max-w-[420px]">
              Tell us what you need help with. Give us as much useful information as possible and our customer care specialists will take it from there.
            </p>

            <div className="mt-10 border-t border-[#ddd3c5]">
              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-extrabold text-[#e6321c] tracking-[0.12em] uppercase mb-1.5">
                  Email Desk
                </div>
                <a
                  href={`mailto:${BINGOOO_EMAIL_SUPPORT}`}
                  className="text-[14px] font-semibold text-[#171717] hover:text-[#e6321c] transition-colors block"
                >
                  {BINGOOO_EMAIL_SUPPORT}
                </a>
                <div className="text-[12px] text-[#6f6a63] mt-1">For orders, returns, sizing & general inquiries</div>
              </div>

              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-extrabold text-[#e6321c] tracking-[0.12em] uppercase mb-1.5">
                  Phone & WhatsApp Support
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:+${BINGOOO_PHONE_RAW}`}
                    className="text-[14px] font-semibold text-[#171717] hover:text-[#e6321c] transition-colors"
                  >
                    {BINGOOO_PHONE_DISPLAY}
                  </a>
                  <span className="text-[#6F6A63] text-xs">•</span>
                  <a
                    href={getWhatsAppUrl('Hi Bingooo, I would like to chat with support.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-bold text-[#25D366] hover:underline inline-flex items-center gap-1"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="text-[12px] text-[#6f6a63] mt-1">Active Mon–Sat, 9:00 AM – 9:00 PM IST</div>
              </div>

              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-extrabold text-[#e6321c] tracking-[0.12em] uppercase mb-1.5">
                  Instagram
                </div>
                <a
                  href={BINGOOO_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-[#171717] hover:text-[#e6321c] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{BINGOOO_INSTAGRAM_HANDLE}</span>
                  <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                </a>
                <div className="text-[12px] text-[#6f6a63] mt-1">Follow for daily drops, community fits & behind-the-scenes</div>
              </div>

              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-extrabold text-[#e6321c] tracking-[0.12em] uppercase mb-1.5">
                  Atelier Location
                </div>
                <div className="text-[14px] font-semibold">Srikakulam, Andhra Pradesh, India</div>
                <div className="text-[12px] text-[#6f6a63] mt-1">Bingooo Men's Wear Atelier & Custom Studio</div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="bg-white border border-[#ddd3c5] p-6 sm:p-[42px] shadow-xs">
            <h2 className="m-0 mb-8 text-[28px] sm:text-[36px] font-extrabold tracking-[-0.055em] uppercase">
              SEND A MESSAGE.
            </h2>

            {submitted && (
              <div className="mb-6 p-4 border border-[#238636]/30 bg-[#238636]/10 text-[#238636] text-[12px] font-bold rounded-[6px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0" />
                <span>MESSAGE SENT. Thanks for reaching out — our team will get back to you soon.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`h-12 w-full border bg-[#f7eedb] text-[#171717] rounded-[10px] outline-none px-4 text-[13px] transition-all focus:border-[#e6321c] focus:ring-2 focus:ring-[#e6321c]/15 ${
                    errors.name ? 'border-[#c62828]' : 'border-[#ddd3c5]'
                  }`}
                />
                {errors.name && (
                  <span className="text-[11px] text-[#c62828] font-semibold">{errors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`h-12 w-full border bg-[#f7eedb] text-[#171717] rounded-[10px] outline-none px-4 text-[13px] transition-all focus:border-[#e6321c] focus:ring-2 focus:ring-[#e6321c]/15 ${
                    errors.email ? 'border-[#c62828]' : 'border-[#ddd3c5]'
                  }`}
                />
                {errors.email && (
                  <span className="text-[11px] text-[#c62828] font-semibold">{errors.email}</span>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  className={`h-12 w-full border bg-[#f7eedb] text-[#171717] rounded-[10px] outline-none px-4 text-[13px] transition-all focus:border-[#e6321c] focus:ring-2 focus:ring-[#e6321c]/15 ${
                    errors.phone ? 'border-[#c62828]' : 'border-[#ddd3c5]'
                  }`}
                />
                {errors.phone && (
                  <span className="text-[11px] text-[#c62828] font-semibold">{errors.phone}</span>
                )}
              </div>

              {/* Order Number */}
              <div className="flex flex-col gap-2">
                <label htmlFor="order" className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  Order Number
                </label>
                <input
                  id="order"
                  type="text"
                  placeholder="Optional (e.g. BNG-1042)"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="h-12 w-full border border-[#ddd3c5] bg-[#f7eedb] text-[#171717] rounded-[10px] outline-none px-4 text-[13px] transition-all focus:border-[#e6321c] focus:ring-2 focus:ring-[#e6321c]/15"
                />
              </div>

              {/* Subject */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label htmlFor="subject" className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  Subject *
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (errors.subject) setErrors({ ...errors, subject: '' });
                  }}
                  className={`h-12 w-full border bg-[#f7eedb] text-[#171717] rounded-[10px] outline-none px-4 text-[13px] transition-all focus:border-[#e6321c] focus:ring-2 focus:ring-[#e6321c]/15 cursor-pointer ${
                    errors.subject ? 'border-[#c62828]' : 'border-[#ddd3c5]'
                  }`}
                >
                  <option value="">Select a subject</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Size & Fit">Size & Fit</option>
                  <option value="Shipping & Delivery">Shipping & Delivery</option>
                  <option value="Returns & Refunds">Returns & Refunds</option>
                  <option value="Custom Design">Custom Design</option>
                  <option value="Payment">Payment</option>
                  <option value="Other">Other</option>
                </select>
                {errors.subject && (
                  <span className="text-[11px] text-[#c62828] font-semibold">{errors.subject}</span>
                )}
              </div>

              {/* Message */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label htmlFor="message" className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  className={`w-full min-h-[140px] border bg-[#f7eedb] text-[#171717] rounded-[10px] outline-none p-4 text-[13px] transition-all focus:border-[#e6321c] focus:ring-2 focus:ring-[#e6321c]/15 ${
                    errors.message ? 'border-[#c62828]' : 'border-[#ddd3c5]'
                  }`}
                />
                {errors.message && (
                  <span className="text-[11px] text-[#c62828] font-semibold">{errors.message}</span>
                )}
              </div>

              {/* Submit Row */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="text-[#6f6a63] text-[11px] leading-relaxed max-w-[300px]">
                  Your information is used only to respond to your enquiry.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-12 px-7 bg-[#e6321c] text-white text-[12px] font-extrabold uppercase tracking-[0.04em] rounded-[10px] hover:bg-[#b91f12] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {submitting ? 'Sending...' : 'Send Message →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =======================================================
           FAQ SECTION
      ======================================================= */}
      <section className="py-20 bg-[#ede0cc]">
        <div className="container-bingooo flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#e6321c] mb-4 before:content-[''] before:w-7 before:h-[2px] before:bg-[#e6321c]">
              Need a quick answer?
            </div>

            <h2 className="m-0 text-[36px] sm:text-[44px] leading-[0.95] tracking-[-0.055em] font-extrabold uppercase">
              YOU MIGHT<br />FIND IT HERE.
            </h2>

            <p className="mt-3.5 mb-0 text-[#6f6a63] text-[14px]">
              Check our frequently asked questions for quick answers on orders, shipping, sizing, and custom printing.
            </p>
          </div>

          <Link
            to="/faq"
            onClick={() => triggerHaptic('light')}
            className="inline-flex items-center justify-center h-12 px-7 border border-[#171717] bg-transparent text-[#171717] rounded-[10px] text-[11px] font-extrabold uppercase tracking-[0.05em] hover:bg-[#171717] hover:text-white transition-all whitespace-nowrap"
          >
            View FAQ →
          </Link>
        </div>
      </section>

      {/* =======================================================
           CUSTOM DESIGN CTA
      ======================================================= */}
      <section className="py-[70px] sm:py-[100px]">
        <div className="container-bingooo">
          <div className="bg-[#171717] text-white p-8 sm:p-14 lg:p-[65px] grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8 lg:gap-12 relative overflow-hidden">
            {/* Subtle background monogram */}
            <div className="absolute right-[-40px] bottom-[-100px] text-[350px] font-extrabold leading-none text-white/[0.025] select-none pointer-events-none">
              B
            </div>

            <div className="relative z-10">
              <div className="text-[#e6321c] text-[10px] font-extrabold tracking-[0.15em] uppercase mb-4">
                Custom Design Studio
              </div>

              <h2 className="m-0 text-[clamp(36px,5vw,64px)] leading-[0.92] tracking-[-0.06em] font-extrabold uppercase text-white">
                YOUR IDEA.<br />YOUR GARMENT.
              </h2>

              <p className="mt-5 mb-0 text-[#999999] text-[14px] leading-[1.8] max-w-[560px]">
                Have something specific in mind? Upload your artwork, customize your garment and create something that feels completely yours.
              </p>
            </div>

            <Link
              to="/customize"
              onClick={() => triggerHaptic('medium')}
              className="relative z-10 inline-flex items-center justify-center h-[50px] px-[26px] bg-[#e6321c] text-white rounded-[10px] text-[11px] font-extrabold uppercase tracking-[0.05em] hover:bg-[#b91f12] transition-colors whitespace-nowrap"
            >
              Create Your Design →
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           FINAL CTA BANNER
      ======================================================= */}
      <section className="bg-[#e6321c] text-white py-[75px] sm:py-[100px] text-center px-5">
        <div className="container-bingooo">
          <div className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-white/80 mb-5">
            BINGOOO MEN'S WEAR
          </div>

          <h2 className="m-0 text-[clamp(46px,8vw,100px)] leading-[0.88] tracking-[-0.07em] font-extrabold uppercase text-white">
            WEAR WHAT<br />DEFINES YOU.
          </h2>

          <p className="max-w-[500px] mx-auto mt-6 mb-8 text-[14px] leading-[1.7] text-white/85">
            Premium fits. Your vibe. Your idea. Discover the collection or create something of your own.
          </p>

          <Link
            to="/shop"
            onClick={() => triggerHaptic('medium')}
            className="inline-flex items-center justify-center h-12 px-7 bg-white text-[#171717] rounded-[10px] text-[11px] font-extrabold uppercase tracking-[0.05em] hover:bg-[#171717] hover:text-white transition-all shadow-sm"
          >
            Shop Men's Wear →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
