import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '../components/common/SEO';
import { generateFaqSchema } from '../lib/seo/schema';
import { triggerHaptic } from '../lib/native/capacitorBridge';

interface FaqItem {
  id: string;
  category: 'orders' | 'returns' | 'products' | 'payments' | 'custom' | 'account' | 'technical';
  question: string;
  answer: string;
  searchKeywords?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'orders', label: 'Orders & Shipping' },
  { id: 'returns', label: 'Returns & Refunds' },
  { id: 'products', label: 'Products & Sizing' },
  { id: 'payments', label: 'Payments & Offers' },
  { id: 'custom', label: 'Custom Orders' },
  { id: 'account', label: 'Account & Login' },
  { id: 'technical', label: 'Website & Technical' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

const FAQ_ITEMS: FaqItem[] = [
  // Orders & Shipping
  {
    id: 'orders-1',
    category: 'orders',
    question: 'How long does delivery take?',
    answer:
      'Orders are usually delivered within 3–7 business days depending on your location across India. Metro cities often receive parcels within 3–4 days, while tier-2 and tier-3 locations take 4–7 days. You will receive real-time tracking information via WhatsApp and SMS as soon as your shipment departs our Srikakulam fulfillment hub.',
    searchKeywords: 'delivery shipping dispatch how long transit days time timeframe courier',
  },
  {
    id: 'orders-2',
    category: 'orders',
    question: 'How can I track my order?',
    answer:
      "Once your order ships, we will send an instant SMS and WhatsApp alert containing your live courier tracking link. You can also visit our Track Order page at any time or log into your BINGOOO account to monitor real-time shipment milestones from dispatch to doorstep delivery.",
    searchKeywords: 'track order shipment tracking awb courier status link where is my package',
  },
  {
    id: 'orders-3',
    category: 'orders',
    question: 'Can I cancel or modify my order?',
    answer:
      'Please contact our support concierge as soon as possible. Standard catalog orders can be cancelled or updated (such as changing size or delivery address) within 4 hours of placing the order, provided the parcel has not entered dispatch sorting. Customized apparel cannot be modified once DTF printing production has begun.',
    searchKeywords: 'cancel modify change address order cancellation edit mistake wrong size',
  },
  {
    id: 'orders-4',
    category: 'orders',
    question: 'Do you offer international shipping?',
    answer:
      'We currently ship across all 28 states and 8 union territories in India. Selective international delivery to the UAE, Singapore, UK, and US is available on bulk and custom bespoke orders via our support team. International courier tariffs and customs duties apply based on destination.',
    searchKeywords: 'international shipping worldwide abroad global export delivery foreign countries',
  },

  // Returns & Refunds
  {
    id: 'returns-1',
    category: 'returns',
    question: 'What is your return and exchange policy?',
    answer:
      'Eligible standard catalog products can be exchanged or returned within 7 days of doorstep delivery. Items must be unworn, unwashed, and returned in their original packaging with all brand tags intact. Doorstep reverse pickup is arranged directly by our courier partners at zero extra charge.',
    searchKeywords: 'return exchange policy refund doorstep pickup timeline condition 7 days',
  },
  {
    id: 'returns-2',
    category: 'returns',
    question: 'I received a damaged or wrong item. What should I do?',
    answer:
      'Contact BINGOOO support within 48 hours of delivery at support@bingooo.in or via WhatsApp (+91 79817 87317) with your Order ID and clear photos of the damaged garment and outer parcel. Our team will verify and immediately dispatch a brand-new replacement at no charge.',
    searchKeywords: 'damaged wrong item defective tear flaw received broken replacement issue claim',
  },
  {
    id: 'returns-3',
    category: 'returns',
    question: 'How long do refunds take to reflect in my account?',
    answer:
      'Once our quality team inspects the returned package at our facility, refunds are initiated within 24–48 hours. For UPI and debit/credit card payments, the credit takes 3–5 working days to appear in your bank statement. For COD orders, we transfer refunds directly to your verified UPI ID or bank account.',
    searchKeywords: 'refund time processing bank account crediting cod refund money back',
  },

  // Products & Sizing
  {
    id: 'products-1',
    category: 'products',
    question: 'How do I know my size?',
    answer:
      'Every product page features our dedicated Size Guide with exact garment measurements in inches and centimeters. For our signature Oversized fits, choose your usual chest size for an intentional boxy streetwear drape, or size down by one size if you prefer a classic regular silhouette.',
    searchKeywords: 'size sizing guide measurements fit chart large medium small chest oversized',
  },
  {
    id: 'products-2',
    category: 'products',
    question: 'What fabric quality and GSM does BINGOOO use?',
    answer:
      'We use 240 to 280 GSM heavyweight 100% super-combed cotton for our t-shirts, bio-washed and silicon-softened to prevent pilling. Our hoodies and sweatshirts feature 380 to 420 GSM French terry fleece that maintains its structural drape through multiple seasons of wear.',
    searchKeywords: 'fabric gsm quality material cotton heavyweight shrinkage fleece soft wash',
  },
  {
    id: 'products-3',
    category: 'products',
    question: 'Do your garments shrink or fade after washing?',
    answer:
      'All Bingooo fabrics undergo pre-shrinking and reactive dyeing during knitting. When washed inside out with mild detergent in cold water and air-dried away from direct scorching sun, shrinkage is kept under 1.5% and colors remain rich and vibrant for 50+ wash cycles.',
    searchKeywords: 'shrink wash care fading laundry iron cold water dry clean instruction',
  },

  // Payments & Offers
  {
    id: 'payments-1',
    category: 'payments',
    question: 'Is Cash on Delivery (COD) available?',
    answer:
      'Cash on Delivery (COD) is supported for eligible serviceable pin codes across India on all standard catalog orders. For custom on-demand studio pieces, a nominal advance token (or full prepayment) is requested to verify custom print commitment before fabric pressing begins.',
    searchKeywords: 'cash on delivery cod payment pay on doorstep cash method eligible pincode',
  },
  {
    id: 'payments-2',
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major secure payment channels powered by Razorpay: UPI (Google Pay, PhonePe, Paytm, CRED, BHIM), Credit & Debit Cards (Visa, MasterCard, RuPay, Amex), Net Banking across 55+ Indian banks, and digital wallets.',
    searchKeywords: 'payment methods accepted credit card debit card upi gpay phonepe razorpay netbanking',
  },
  {
    id: 'payments-3',
    category: 'payments',
    question: 'How do I apply coupon codes and discounts?',
    answer:
      'You can enter valid coupon codes directly in the Order Summary section during checkout or inside your Cart. Applicable discounts will instantly recalculate your subtotal before you proceed to payment. Note that only one promo code can be redeemed per transaction.',
    searchKeywords: 'coupon discount promo code offer voucher save apply discount price reduction',
  },

  // Custom Orders
  {
    id: 'custom-1',
    category: 'custom',
    question: 'How does the custom clothing feature work?',
    answer:
      'Visit our 3D Customizer Studio, select your blank silhouette (Oversized Tee, Hoodie, or Sweatshirt), pick a color, and upload your high-resolution artwork or type custom typography. Position, scale, and rotate your graphics on the front or back in real time before placing your order.',
    searchKeywords: 'custom clothing customizer artwork upload print design 3d personalize create your own',
  },
  {
    id: 'custom-2',
    category: 'custom',
    question: 'What file format and resolution should I upload?',
    answer:
      'For the crispest high-definition prints, upload PNG files with a transparent background at 300 DPI (minimum 2000 × 2000 pixels). We also accept high-res JPEG, SVG, and WEBP formats. Ensure your artwork does not contain copyrighted brand logos or trademarks.',
    searchKeywords: 'file format resolution dpi png transparent svg upload graphic quality print quality',
  },
  {
    id: 'custom-3',
    category: 'custom',
    question: 'Can customized on-demand apparel be returned?',
    answer:
      'Because custom apparel is manufactured strictly to your individual specifications and personalized graphics, it cannot be restocked or returned for change of mind. However, in any rare instance of print misalignment, fabric flaw, or manufacturing defect, we will reprint and reship a fresh piece immediately.',
    searchKeywords: 'custom return exchange policy refund personalized defect guarantee',
  },

  // Account & Login
  {
    id: 'account-1',
    category: 'account',
    question: 'How can I contact customer support?',
    answer:
      'You can reach our concierge team anytime through our Contact Us page, email us directly at support@bingooo.in, or chat with us on WhatsApp at +91 79817 87317. Our support desk is active Monday through Saturday, from 10:00 AM to 7:00 PM IST.',
    searchKeywords: 'contact customer support help desk email phone whatsapp hours reach talk',
  },
  {
    id: 'account-2',
    category: 'account',
    question: 'Can I place an order without creating an account?',
    answer:
      'Yes! You can complete purchases quickly via guest checkout using just your mobile number and shipping address. However, creating a free BINGOOO account allows you to track orders in one click, save favorite designs, earn loyalty points, and speed up future checkouts.',
    searchKeywords: 'guest checkout account signup login register profile create account without login',
  },

  // Website & Technical
  {
    id: 'technical-1',
    category: 'technical',
    question: 'My payment was deducted, but the order was not confirmed. What should I do?',
    answer:
      'Do not worry! In rare instances of banking network latency, the payment provider might debit the amount before confirming the session. If an Order ID was not generated, the banking switch will automatically reverse the transaction within 24 to 48 hours. If the amount is not returned after 48 hours, share your payment UTR reference with support@bingooo.in.',
    searchKeywords: 'payment deducted money cut failed pending transaction confirmation utr bank issue',
  },
  {
    id: 'technical-2',
    category: 'technical',
    question: 'Is my personal and payment data secure on BINGOOO?',
    answer:
      'Absolutely. All sessions are encrypted using 256-bit SSL technology. Payment transactions are processed directly through PCI-DSS Level 1 compliant gateway partners (Razorpay). BINGOOO never stores or accesses your raw card numbers, CVV, or banking credentials.',
    searchKeywords: 'security safe ssl payment encryption data privacy pci dss razorpay protected',
  },
];

export function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'orders-1': true, // Keep first item open by default
  });

  const toggleItem = (id: string) => {
    triggerHaptic('light');
    setOpenItems((prev) => {
      const isOpen = !!prev[id];
      // Close all others and toggle clicked item (classic accordion behavior)
      if (isOpen) {
        return { ...prev, [id]: false };
      }
      return { [id]: true };
    });
  };

  const handleCategoryChange = (category: CategoryId) => {
    triggerHaptic('selection');
    setActiveCategory(category);
    setSearchQuery('');
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const haystack = `${item.question} ${item.answer} ${item.searchKeywords || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7EEDB] text-[#171717] font-sans selection:bg-[#E6321C] selection:text-white pb-12 sm:pb-20">
      <SEO
        title="FAQs — BINGOOO"
        description="Find answers to all frequently asked questions about Bingooo Men's Wear: orders, delivery times, size guides, return policies, custom 3D studio, and payments."
        canonical="https://bingooo.in/faq"
        schema={generateFaqSchema(FAQ_ITEMS.map((f) => ({ question: f.question, answer: f.answer })))}
      />

      {/* =======================================================
           FAQ HERO
      ======================================================== */}
      <section className="relative min-h-[380px] sm:min-h-[450px] overflow-hidden flex items-center bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="w-[min(calc(100%-32px),1440px)] sm:w-[min(calc(100%-80px),1440px)] mx-auto relative z-[3] py-10 sm:py-[70px] pb-14 sm:pb-[55px]">
          
          {/* KICKER */}
          <div className="w-[120px] mb-4 sm:mb-[25px] text-[9px] sm:text-[10px] leading-[1.9] font-extrabold tracking-[3px] uppercase text-[#171717]">
            QUESTIONS
            <br />
            LEAD TO
            <br />
            BETTER STYLE.
            <div className="w-[35px] h-[1px] bg-[#171717] mt-2 sm:mt-[10px]" />
          </div>

          {/* GIANT TITLE */}
          <h1 className="text-[clamp(80px,15vw,205px)] leading-[0.75] sm:leading-[0.72] tracking-[-4px] sm:tracking-[-10px] font-extrabold uppercase text-[#171717] select-none">
            FAQ
          </h1>

          {/* CAPTION */}
          <div className="mt-4 sm:mt-[18px] ml-1 sm:ml-2 text-[11px] sm:text-[13px] tracking-[3px] sm:tracking-[4px] font-extrabold uppercase text-[#171717]">
            WE'RE HERE TO HELP.
          </div>

          {/* SIDE TEXT */}
          <div className="absolute right-4 sm:right-[25px] bottom-6 sm:bottom-[35px] w-[80px] sm:w-[100px] text-[8px] sm:text-[9px] leading-[1.9] font-extrabold tracking-[2px] sm:tracking-[3px] uppercase text-[#171717] text-right sm:text-left">
            NOT
            <br />
            JUST
            <br />
            CLOTHES.
            <br />
            A YOU.
            <div className="w-[30px] sm:w-[34px] h-[1px] bg-[#171717] mt-2 sm:mt-[9px] ml-auto sm:ml-0" />
          </div>
        </div>

        {/* HERO MODEL EDITORIAL IMAGE */}
        <div
          className="absolute right-[-10px] sm:right-[8%] lg:right-[17%] bottom-0 w-[170px] sm:w-[260px] lg:w-[330px] h-[260px] sm:h-[340px] lg:h-[405px] z-[2] pointer-events-none select-none opacity-85 sm:opacity-100"
          aria-hidden="true"
        >
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#d5cfc5] to-[#8d8983]">
            <img
              src="/hero-banner-2.jpg"
              alt="Bingooo Editorial Menswear"
              className="w-full h-full object-cover object-top grayscale contrast-110 mix-blend-multiply opacity-90"
              onError={(e) => {
                // Fallback graceful editorial placeholder if image is unavailable
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F7EEDB] via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4 text-center text-white text-[9px] sm:text-[11px] font-extrabold tracking-[2px] uppercase drop-shadow-sm pointer-events-none">
              BINGOOO <br />
              EDITORIAL ARCHIVE
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           MAIN CONTENT
      ======================================================== */}
      <main>
        <div className="w-[min(calc(100%-32px),1440px)] sm:w-[min(calc(100%-80px),1440px)] mx-auto">
          
          {/* BREADCRUMB */}
          <nav
            aria-label="Breadcrumbs"
            className="py-5 sm:py-[22px] flex items-center gap-[9px] text-[10px] sm:text-[11px] font-medium text-[#6F6A63]"
          >
            <Link to="/" className="hover:text-[#171717] transition-colors">
              Home
            </Link>
            <span className="text-[#DDD3C5]">›</span>
            <Link to="/contact" className="hover:text-[#171717] transition-colors">
              Help
            </Link>
            <span className="text-[#DDD3C5]">›</span>
            <strong className="text-[#171717] font-bold">FAQs</strong>
          </nav>

          {/* FAQ SECTION */}
          <section className="pb-14 sm:pb-[80px]">
            <div className="grid grid-cols-1 lg:grid-cols-[265px_minmax(0,1fr)] gap-7 lg:gap-[38px] items-start">
              
              {/* =================================================
                   SIDEBAR
              ================================================== */}
              <aside className="w-full">
                {/* CATEGORY LIST */}
                <div
                  role="tablist"
                  aria-label="FAQ Categories"
                  className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-0 border-0 lg:border lg:border-[#DDD3C5] bg-transparent lg:bg-white/[0.28] scrollbar-none pb-1 lg:pb-0"
                >
                  {CATEGORIES.map((cat, idx) => {
                    const isActive = activeCategory === cat.id;
                    const isLast = idx === CATEGORIES.length - 1;

                    return (
                      <button
                        key={cat.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-auto lg:w-full min-h-[40px] lg:min-h-[56px] px-3.5 lg:px-[17px] flex items-center justify-between border shrink-0 text-left text-[11px] lg:text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6321C] ${
                          isActive
                            ? 'bg-[#171717] text-white font-extrabold border-[#171717]'
                            : 'bg-white/35 lg:bg-transparent text-[#171717] hover:bg-[#EDE0CC] font-semibold border-[#DDD3C5]'
                        } ${!isLast ? 'lg:border-b lg:border-[#DDD3C5]' : 'lg:border-b-0'}`}
                      >
                        <span>{cat.label}</span>
                        <span className="hidden lg:inline text-[17px] font-normal opacity-70 ml-2" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* SUPPORT CARD (Desktop / Tablet) */}
                <div className="hidden lg:block mt-6 p-6 bg-[#EDE0CC] rounded-[2px] border border-[#DDD3C5]/60">
                  <h3 className="text-[23px] leading-tight tracking-[-1px] font-extrabold text-[#171717] mb-2">
                    STILL NEED HELP?
                  </h3>
                  <p className="text-[11px] text-[#4f4a44] mb-5 leading-relaxed">
                    Our concierge support team is here for you.
                  </p>

                  <Link
                    to="/contact"
                    className="inline-flex h-10 px-5 items-center justify-center bg-[#171717] text-white text-[9px] font-extrabold tracking-[0.7px] uppercase hover:bg-[#E6321C] transition-colors focus-visible:ring-2 focus-visible:ring-[#E6321C]"
                  >
                    CONTACT US →
                  </Link>

                  <div className="grid gap-2.5 mt-5 pt-4 border-t border-[#DDD3C5]/70">
                    <div className="flex items-center gap-2.5 text-[10px] font-semibold text-[#171717]">
                      <svg
                        className="w-[18px] h-[18px] text-[#171717] shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      <span>Mon – Sat, 10AM – 7PM</span>
                    </div>

                    <a
                      href="mailto:support@bingooo.in"
                      className="flex items-center gap-2.5 text-[10px] font-semibold text-[#171717] hover:text-[#E6321C] transition-colors"
                    >
                      <svg
                        className="w-[18px] h-[18px] text-[#171717] shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                      <span>support@bingooo.in</span>
                    </a>
                  </div>
                </div>
              </aside>

              {/* =================================================
                   FAQ CONTENT
              ================================================== */}
              <div className="min-w-0">
                {/* SEARCH INPUT */}
                <div className="relative mb-3.5">
                  <label htmlFor="faqSearch" className="sr-only">
                    Search your question
                  </label>
                  <input
                    id="faqSearch"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your question..."
                    autoComplete="off"
                    className="w-full h-[48px] sm:h-[53px] pl-4 sm:pl-[17px] pr-12 bg-white/35 border border-[#DDD3C5] outline-none text-[#171717] text-[11px] sm:text-[12px] focus:border-[#171717] placeholder:text-[#8c867e] transition-colors"
                  />
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#171717] pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>

                {/* ACCORDION LIST */}
                <div className="border border-[#DDD3C5] bg-white/[0.22]" id="faqList">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, idx) => {
                      const isOpen = !!openItems[item.id];
                      const isLast = idx === filteredItems.length - 1;

                      return (
                        <div
                          key={item.id}
                          className={`border-b border-[#DDD3C5] transition-colors ${
                            isLast ? 'border-b-0' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            aria-expanded={isOpen}
                            aria-controls={`answer-${item.id}`}
                            className="w-full min-h-[57px] sm:min-h-[59px] px-3.5 sm:px-[18px] py-3 flex items-center justify-between gap-4 text-left font-extrabold text-[12px] sm:text-[13px] text-[#171717] hover:bg-[#EDE0CC]/45 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6321C]"
                          >
                            <span>{item.question}</span>
                            <span
                              className="w-5 shrink-0 text-center text-[22px] font-normal leading-none select-none text-[#171717]"
                              aria-hidden="true"
                            >
                              {isOpen ? '−' : '+'}
                            </span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                id={`answer-${item.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-3.5 sm:px-[18px] pr-8 sm:pr-[50px] pb-5 text-[11px] sm:text-[11.5px] leading-[1.75] text-[#6F6A63] border-t border-[#DDD3C5]/30 pt-2 font-normal">
                                  {item.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 px-5 text-center text-[#6F6A63] text-[12px]">
                      No questions found. Try another search keyword or select another category.
                    </div>
                  )}
                </div>

                {/* MOBILE SUPPORT CARD */}
                <div className="block lg:hidden mt-8 p-5 bg-[#EDE0CC] rounded-[2px] border border-[#DDD3C5]">
                  <h3 className="text-[20px] font-extrabold text-[#171717] mb-1">
                    STILL NEED HELP?
                  </h3>
                  <p className="text-[11px] text-[#4f4a44] mb-4">
                    Our concierge support team is here for you.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex h-9 px-4 items-center justify-center bg-[#171717] text-white text-[9px] font-extrabold tracking-[0.7px] uppercase hover:bg-[#E6321C] transition-colors"
                  >
                    CONTACT US →
                  </Link>
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[#DDD3C5]">
                    <span className="text-[10px] font-semibold text-[#171717]">
                      Mon – Sat, 10AM – 7PM IST
                    </span>
                    <a
                      href="mailto:support@bingooo.in"
                      className="text-[10px] font-semibold text-[#171717] underline"
                    >
                      support@bingooo.in
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </section>

        </div>

        {/* =====================================================
             SERVICE STRIP
        ====================================================== */}
        <section className="border-t border-b border-[#DDD3C5] py-7 sm:py-[28px] mt-1 bg-[#F7EEDB]">
          <div className="w-[min(calc(100%-32px),1440px)] sm:w-[min(calc(100%-80px),1440px)] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-[30px]">
              
              {/* FAST DELIVERY */}
              <div className="flex items-center gap-3 sm:gap-[13px]">
                <svg
                  className="w-6 h-6 sm:w-[29px] sm:h-[29px] text-[#171717] shrink-0 stroke-[1.4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 6h11v10H3z" />
                  <path d="M14 10h4l3 3v3h-7z" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
                <div>
                  <div className="text-[9px] font-extrabold tracking-[0.4px] uppercase text-[#171717] mb-[2px]">
                    Fast Delivery
                  </div>
                  <div className="text-[9px] text-[#6F6A63]">
                    Quick & safe delivery
                  </div>
                </div>
              </div>

              {/* EASY RETURNS */}
              <div className="flex items-center gap-3 sm:gap-[13px]">
                <svg
                  className="w-6 h-6 sm:w-[29px] sm:h-[29px] text-[#171717] shrink-0 stroke-[1.4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4 7h16v13H4z" />
                  <path d="m8 7 1.5-3h5L16 7" />
                  <path d="M8 12h8" />
                </svg>
                <div>
                  <div className="text-[9px] font-extrabold tracking-[0.4px] uppercase text-[#171717] mb-[2px]">
                    Easy Returns
                  </div>
                  <div className="text-[9px] text-[#6F6A63]">
                    Within applicable policy
                  </div>
                </div>
              </div>

              {/* QUALITY ASSURED */}
              <div className="flex items-center gap-3 sm:gap-[13px]">
                <svg
                  className="w-6 h-6 sm:w-[29px] sm:h-[29px] text-[#171717] shrink-0 stroke-[1.4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 3 20 6v6c0 4.7-3.2 7.8-8 9-4.8-1.2-8-4.3-8-9V6z" />
                  <path d="m8.5 12 2.3 2.3 4.7-5" />
                </svg>
                <div>
                  <div className="text-[9px] font-extrabold tracking-[0.4px] uppercase text-[#171717] mb-[2px]">
                    Quality Assured
                  </div>
                  <div className="text-[9px] text-[#6F6A63]">
                    Best fashion, best quality
                  </div>
                </div>
              </div>

              {/* SECURE PAYMENT */}
              <div className="flex items-center gap-3 sm:gap-[13px]">
                <svg
                  className="w-6 h-6 sm:w-[29px] sm:h-[29px] text-[#171717] shrink-0 stroke-[1.4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <div>
                  <div className="text-[9px] font-extrabold tracking-[0.4px] uppercase text-[#171717] mb-[2px]">
                    Secure Payment
                  </div>
                  <div className="text-[9px] text-[#6F6A63]">
                    100% secure checkout
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
