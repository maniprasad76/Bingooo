import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  HelpCircle,
  Phone,
  Mail,
  Truck,
  Scissors,
  RotateCcw,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'orders', label: 'Orders & Shipping', icon: Truck },
  { id: 'custom', label: 'Custom Studio', icon: Scissors },
  { id: 'sizing', label: 'Sizing & Fabrics', icon: Sparkles },
  { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'payment', label: 'Payments & COD', icon: CreditCard },
];

const FAQ_DATA: FaqItem[] = [
  // Orders & Shipping
  {
    id: 'ship-1',
    category: 'orders',
    question: 'How long does delivery take across India?',
    answer:
      'Standard orders dispatch within 24 to 48 hours directly from our Srikakulam atelier facility. Transit typically takes 3 to 5 business days depending on your metro or tier-2/3 city location. Real-time courier tracking is provided via SMS and WhatsApp.',
  },
  {
    id: 'ship-2',
    category: 'orders',
    question: 'Is shipping free?',
    answer:
      'Yes, all orders above ₹999 qualify for 100% free express delivery anywhere in India. For orders under ₹999, a nominal flat shipping fee of ₹79 applies at checkout.',
  },
  {
    id: 'ship-3',
    category: 'orders',
    question: 'How do I track my active order?',
    answer:
      'You can track your package anytime by visiting our Track Order page or logging into your Account > Orders. Once your parcel ships, you will also receive an automated WhatsApp and SMS notification with a direct live tracking link.',
  },

  // Custom Studio
  {
    id: 'cust-1',
    category: 'custom',
    question: 'How does the 3D Customizer Studio work?',
    answer:
      'Our interactive 3D studio lets you select any Bingooo blank garment (oversized tees, hoodies, shirts), upload your graphics or enter typography, position/scale on the front or back, and inspect a realistic preview before adding to cart.',
  },
  {
    id: 'cust-2',
    category: 'custom',
    question: 'What printing technology do you use for custom garments?',
    answer:
      'We utilize industrial Direct-to-Film (DTF) and high-density puff printing machines. This guarantees vivid color saturation, razor-sharp detail, flexible stretch with no cracking, and durability across 50+ machine washes.',
  },
  {
    id: 'cust-3',
    category: 'custom',
    question: 'Can I place bulk orders for my brand, college, or team?',
    answer:
      'Absolutely. For bulk orders of 10 pieces or more, we offer tiered wholesale pricing, free physical sample proofs, and dedicated design assistance. Reach out through our Contact page or WhatsApp Concierge for a quote.',
  },

  // Sizing & Fabrics
  {
    id: 'size-1',
    category: 'sizing',
    question: 'What fabric quality and GSM does Bingooo use?',
    answer:
      'All our T-shirts are crafted from 240 GSM 100% super-combed cotton with a bio-washed, silicon-softened finish. Our winter hoodies and sweatshirts use dense 280 to 320 GSM French terry fleece that holds structure without feeling stiff.',
  },
  {
    id: 'size-2',
    category: 'sizing',
    question: 'How do I choose the right size?',
    answer:
      'Our Oversized collection features an intentionally relaxed streetwear silhouette with dropped shoulders. If you prefer a loose, boxy look, order your usual size. For a regular standard fit, size down by one. Detailed chest, length, and sleeve measurements are available on our Size Guide page.',
  },
  {
    id: 'size-3',
    category: 'sizing',
    question: 'Do your garments shrink after washing?',
    answer:
      'No. Every roll of cotton fabric undergoes pre-shrunk treatment and enzyme washing during garment construction. When washed inside-out in cold water and line-dried, shrinkage is under 1.5%.',
  },

  // Returns & Exchanges
  {
    id: 'ret-1',
    category: 'returns',
    question: 'What is your return and exchange policy?',
    answer:
      'We offer a 7-day hassle-free doorstep size exchange policy on all standard catalog garments. If the fit is not ideal, initiate an exchange from your Account, and our courier partner will pick up the item from your address.',
  },
  {
    id: 'ret-2',
    category: 'returns',
    question: 'Can customized on-demand apparel be returned?',
    answer:
      'Because customized items are printed exclusively for you with your uploaded artwork, they cannot be restocked or returned for a change of mind. However, if your custom piece arrives with any manufacturing defect, printing error, or fabric flaw, we will immediately reprint and dispatch a replacement free of charge.',
  },
  {
    id: 'ret-3',
    category: 'returns',
    question: 'How long do refunds take to reflect in my bank account?',
    answer:
      'Once an approved return reaches our warehouse and passes quality check, refunds are initiated within 24 hours. Credit card, debit card, UPI, and netbanking refunds take 3 to 5 business days to reflect in your original payment method.',
  },

  // Payments & COD
  {
    id: 'pay-1',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major Indian payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, CRED), Credit and Debit Cards (Visa, Mastercard, RuPay), Netbanking across 50+ banks, and Cash on Delivery (COD).',
  },
  {
    id: 'pay-2',
    category: 'payment',
    question: 'Is Cash on Delivery available for customized orders?',
    answer:
      'For custom on-demand prints, we offer Partial COD: a small advance token of ₹199 or 30% via UPI/cards to confirm genuine print commitment, with the remaining balance payable in cash at your doorstep upon delivery.',
  },
];

export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('ship-1');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Breadcrumb & Hero Header ─── */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Help & FAQ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed">
            Everything you need to know about our heavyweight menswear, 3D customizer, shipping timelines, and doorstep exchanges.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-lg mx-auto relative">
            <label htmlFor="faq-search" className="sr-only">Search help articles</label>
            <div className="relative">
              <input
                id="faq-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. shipping, sizing, custom print)…"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-[#DDD3C5] focus:border-[#E6321C] focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none text-sm text-[#171717] placeholder-[#6F6A63]/60 shadow-xs transition-colors font-sans"
              />
              <Search className="w-5 h-5 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ─── Category Filter Tabs ─── */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-heading transition-colors focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none ${
                  isSelected
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-white hover:bg-[#EDE0CC] text-[#6F6A63] hover:text-[#171717] border border-[#DDD3C5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ─── FAQ Accordion List ─── */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-[#DDD3C5] bg-white overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none group"
                  >
                    <span className="font-heading font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#E6321C] transition-colors">
                      {faq.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-[#DDD3C5] transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#E6321C] text-white border-[#E6321C] rotate-180'
                          : 'bg-[#FAF8F5] text-[#6F6A63] group-hover:text-[#171717]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#6F6A63] leading-relaxed border-t border-[#DDD3C5]/40 font-sans">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 p-8 rounded-2xl bg-white border border-[#DDD3C5] space-y-3">
              <HelpCircle className="w-8 h-8 text-[#6F6A63] mx-auto" aria-hidden="true" />
              <h3 className="font-heading font-bold text-base text-[#171717]">No questions matched your search</h3>
              <p className="text-xs text-[#6F6A63] max-w-sm mx-auto">
                Try different keywords or browse our categories above. You can also chat directly with our team below.
              </p>
            </div>
          )}
        </div>

        {/* ─── Still Have Questions? Help Desk Cards ─── */}
        <div className="pt-8 border-t border-[#DDD3C5] max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <motion.a
              href="https://wa.me/917981787317"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
              className="p-6 rounded-2xl bg-[#EDE0CC]/70 hover:bg-[#EDE0CC] border border-[#DDD3C5] transition-colors flex items-start gap-4 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-heading text-[#171717] group-hover:text-[#E6321C] transition-colors">
                  WhatsApp Concierge
                </h3>
                <p className="text-xs text-[#6F6A63] leading-relaxed">
                  Chat directly with our styling and orders team. Instant replies Mon-Sat, 9AM-8PM.
                </p>
                <span className="text-xs font-semibold text-[#171717] underline inline-block pt-1">
                  +91 79817 87317 &rarr;
                </span>
              </div>
            </motion.a>

            <motion.div whileHover={{ y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}>
              <Link
                to="/contact"
                className="p-6 rounded-2xl bg-[#EDE0CC]/70 hover:bg-[#EDE0CC] border border-[#DDD3C5] transition-colors flex items-start gap-4 group shadow-2xs h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-heading text-[#171717] group-hover:text-[#E6321C] transition-colors">
                    Submit a Ticket
                  </h3>
                  <p className="text-xs text-[#6F6A63] leading-relaxed">
                    Have a specific inquiry regarding custom designs, sizing, or bulk orders? Send us an inquiry.
                  </p>
                  <span className="text-xs font-semibold text-[#171717] underline inline-block pt-1">
                    Open Contact Form &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
