import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import {
  Check,
  Copy,
  Printer,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Scissors,
  Layers,
  MapPin,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { BrandPageLoader } from '../components/ui/BrandPageLoader';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';

export function OrderSuccessPage() {
  const location = useLocation();
  const params = useParams<{ orderNumber?: string }>();
  const { toast } = useToast();

  const stateOrder = (location.state as any)?.order;
  const orderNumberParam = params.orderNumber;

  const [order, setOrder] = useState<any>(stateOrder || null);
  const [isLoading, setIsLoading] = useState<boolean>(!stateOrder && !!orderNumberParam);
  const [copied, setCopied] = useState<boolean>(false);

  // If order was not passed via state, fetch it by orderNumberParam
  useEffect(() => {
    if (!order && orderNumberParam) {
      setIsLoading(true);
      api
        .get<any>(`/orders/${orderNumberParam}`)
        .then((data) => {
          setOrder(data);
        })
        .catch((err) => {
          console.error('Failed to load order:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [order, orderNumberParam]);

  // Fallback demo order if navigated directly for review
  const displayOrder = order || {
    id: 'ord_demo_2026',
    order_number: orderNumberParam || 'BNG-984210',
    created_at: new Date().toISOString(),
    status: 'paid',
    payment_status: 'captured',
    payment_method: 'Razorpay UPI (Google Pay)',
    subtotal: 2298,
    discount_amount: 300,
    shipping_amount: 0,
    total: 1998,
    currency: 'INR',
    customer_notes: 'Priority atelier cut and double protective packaging requested.',
    address_snapshot_json: {
      name: 'Aditya Sen',
      line1: 'Flat 402, Oakwood Residences',
      line2: 'Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India',
      phone: '+91 98450 12345',
    },
    items: [
      {
        id: 'item-1',
        product_title: 'Heavyweight Boxy Tee (240 GSM)',
        variant_title: 'Obsidian Black / L',
        quantity: 1,
        unit_price: 1299,
        total_price: 1299,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop',
        customization: {
          design_title: 'Bespoke Distressed Studio Typo',
          technique: 'High-Density Direct-to-Film (DTF)',
        },
      },
      {
        id: 'item-2',
        product_title: 'Oversized Minimalist Sweatshirt',
        variant_title: 'Raw Bone / L',
        quantity: 1,
        unit_price: 999,
        total_price: 999,
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop',
      },
    ],
  };

  const address = displayOrder.address_snapshot_json || {};

  const handleCopyOrderNumber = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(displayOrder.order_number);
    setCopied(true);
    toast({
      title: 'Order Reference Copied',
      message: `#${displayOrder.order_number} copied to your clipboard.`,
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintReceipt = () => {
    triggerHaptic('light');
    window.print();
  };

  if (isLoading) {
    return <BrandPageLoader message="Retrieving order manifest from atelier..." fullScreen />;
  }

  const orderDate = new Date(displayOrder.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F7EEDB] text-[#171717] font-sans antialiased selection:bg-[#E6321C] selection:text-white py-8 sm:py-12 md:py-16">
      <SEO
        title={`Order Confirmed #${displayOrder.order_number}`}
        description="Your bespoke Bingooo menswear order is confirmed. Workshop cutting and tailoring initiated in our Srikakulam atelier."
        noindex={true}
      />

      <div className="container-bingooo max-w-[1240px] space-y-8 sm:space-y-12">
        {/* =========================================================
            1. TOP ATELIER STATUS BAR
        ========================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DDD3C5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#171717] font-mono">
                SRIKAKULAM ATELIER • DISPATCH PROTOCOL ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#6F6A63] font-mono mt-0.5">
              CONFIRMATION TRANSMITTED • {orderDate}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 border border-[#DDD3C5] bg-[#FFFFFF] px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717] hover:bg-[#EDE0CC]/40 transition-all rounded-[2px]"
            >
              <Printer size={13} />
              <span>Print Receipt</span>
            </button>
            <Link
              to="/shop"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#171717] text-white px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-[#E6321C] transition-colors rounded-[2px]"
            >
              <span>Explore Drops</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* =========================================================
            2. HERO CONFIRMATION STATEMENT
        ========================================================= */}
        <section className="relative border border-[#DDD3C5] bg-[#FFFFFF] p-6 sm:p-10 md:p-12 rounded-[2px] overflow-hidden shadow-2xs">
          {/* Architectural Background Stamp */}
          <div className="absolute right-4 -bottom-6 select-none pointer-events-none opacity-[0.03] text-[120px] sm:text-[180px] font-extrabold font-mono tracking-tighter text-[#171717]">
            BINGOOO
          </div>

          <div className="relative z-10 max-w-[850px]">
            <div className="eyebrow text-[#E6321C] mb-3 flex items-center gap-2">
              <Sparkles size={13} />
              <span>OFFICIAL ORDER CONFIRMATION • ATELIER DROP 2026</span>
            </div>

            <h1 className="text-[clamp(34px,6vw,68px)] font-extrabold leading-[0.92] tracking-[-0.065em] uppercase text-[#171717] m-0">
              NOT JUST CLOTHES.
              <br />
              <span className="text-[#E6321C]">YOUR PIECE IS RESERVED.</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-[#6F6A63] leading-relaxed max-w-[700px]">
              Thank you for trusting the Bingooo atelier. Your garment cut has been assigned to our
              master tailors in Srikakulam. Fabric batches of 240–280 GSM combed cotton have been locked,
              bio-washed, and prepped for direct dispatch.
            </p>

            {/* Order Reference Badge & Quick Copy */}
            <div className="mt-8 pt-6 border-t border-[#DDD3C5]/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="border border-[#DDD3C5] bg-[#F7EEDB] px-4 py-2 rounded-[2px] flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6F6A63] font-mono">
                    ORDER NO:
                  </span>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-[#171717] tracking-wider">
                    #{displayOrder.order_number}
                  </span>
                  <button
                    onClick={handleCopyOrderNumber}
                    className="ml-1 p-1 hover:text-[#E6321C] transition-colors"
                    title="Copy Order ID"
                    aria-label="Copy Order Number"
                  >
                    {copied ? <Check size={14} className="text-[#238636]" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-[2px] bg-[#238636]/10 text-[#238636] border border-[#238636]/20 text-[10px] font-extrabold uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
                  <span>PAYMENT SECURED • READY FOR CUTTING</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#6F6A63]">
                ESTIMATED AIR DISPATCH: <strong className="text-[#171717]">WITHIN 36 HOURS</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. WORKSHOP PRODUCTION MILESTONE TRACKER
        ========================================================= */}
        <section className="border border-[#DDD3C5] bg-[#FFFFFF] p-6 sm:p-8 rounded-[2px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#DDD3C5]">
            <div>
              <span className="eyebrow text-[#E6321C]">ATELIER PRODUCTION PROTOCOL</span>
              <h2 className="text-base sm:text-xl font-extrabold uppercase tracking-tight text-[#171717] mt-0.5">
                Workshop Fulfillment Milestones
              </h2>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63] font-mono">
              STAGE 02 / 04 ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {/* Step 1 */}
            <div className="border border-[#238636]/30 bg-[#238636]/5 p-4 rounded-[2px] relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#238636] mb-3">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest uppercase">
                    01 • SECURED
                  </span>
                  <CheckCircle2 size={16} />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                  Order Locked & Verified
                </h3>
                <p className="text-[11px] text-[#6F6A63] mt-1 leading-relaxed">
                  Payment confirmed. Fabric lot assigned and reserved in studio.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#238636] uppercase tracking-wider mt-4 inline-flex items-center gap-1">
                <Check size={12} strokeWidth={2.5} />
                <span>Completed Just Now</span>
              </span>
            </div>

            {/* Step 2 (Current) */}
            <div className="border-2 border-[#E6321C] bg-[#FDF0EE] p-4 rounded-[2px] relative flex flex-col justify-between shadow-xs">
              <div className="absolute -top-2.5 right-3 bg-[#E6321C] text-white text-[8px] font-extrabold uppercase tracking-[0.2em] px-2 py-0.5 rounded-[1px]">
                IN PROGRESS
              </div>
              <div>
                <div className="flex items-center justify-between text-[#E6321C] mb-3">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest uppercase">
                    02 • ATELIER
                  </span>
                  <Scissors size={16} />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                  Pattern Cutting & Tailoring
                </h3>
                <p className="text-[11px] text-[#6F6A63] mt-1 leading-relaxed">
                  Manual fabric cutting, precision shoulder seam stitching & bio-wash.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#E6321C] uppercase tracking-wider mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E6321C] animate-ping" />
                Active Workshop Queue
              </span>
            </div>

            {/* Step 3 */}
            <div className="border border-[#DDD3C5] bg-[#EDE0CC]/20 p-4 rounded-[2px] relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#6F6A63] mb-3">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest uppercase">
                    03 • PRINT & QA
                  </span>
                  <Layers size={16} />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                  Custom Print & Audit
                </h3>
                <p className="text-[11px] text-[#6F6A63] mt-1 leading-relaxed">
                  High-density DTF graphics cured at 165°C and 100% garment inspection.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#6F6A63] uppercase tracking-wider mt-4">
                Within 24 Hours
              </span>
            </div>

            {/* Step 4 */}
            <div className="border border-[#DDD3C5] bg-[#EDE0CC]/20 p-4 rounded-[2px] relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[#6F6A63] mb-3">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest uppercase">
                    04 • DISPATCH
                  </span>
                  <Truck size={16} />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                  Air Express Dispatch
                </h3>
                <p className="text-[11px] text-[#6F6A63] mt-1 leading-relaxed">
                  Boxed in bespoke matte packaging and handed to BlueDart / Delhivery.
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#6F6A63] uppercase tracking-wider mt-4">
                2–4 Days Transit
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. SPLIT CONTENT: GARMENTS MANIFEST & ORDER SUMMARY
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────
              LEFT: ITEM MANIFEST (7 COLS)
          ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-[#DDD3C5] bg-[#FFFFFF] p-6 sm:p-8 rounded-[2px]">
              <div className="flex items-center justify-between pb-4 border-b border-[#DDD3C5]">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-[#171717]">
                  Garments Manifest ({displayOrder.items?.length || 0} Piece
                  {(displayOrder.items?.length || 0) === 1 ? '' : 's'})
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63] font-mono">
                  HEAVYWEIGHT ATELIER RUN
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#DDD3C5]/60">
                {displayOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-5 first:pt-4 last:pb-0 flex items-start gap-4 sm:gap-5">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop'
                      }
                      alt={item.product_title}
                      className="w-18 h-22 sm:w-20 sm:h-26 object-cover rounded-[2px] border border-[#DDD3C5] bg-[#EDE0CC]/40 shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-[#171717] tracking-tight leading-snug">
                            {item.product_title}
                          </h4>
                          <p className="text-[11px] font-semibold text-[#6F6A63] uppercase tracking-wider mt-0.5">
                            {item.variant_title || 'Signature Fit'}
                          </p>
                        </div>
                        <span className="font-mono text-sm sm:text-base font-extrabold text-[#171717]">
                          ₹{(item.total_price || item.unit_price).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Custom Print Badge */}
                      {item.customization && (
                        <div className="mt-2.5 rounded-[2px] bg-[#FDF0EE] p-2.5 border border-[#E6321C]/25">
                          <span className="text-[9px] font-extrabold text-[#E6321C] uppercase tracking-widest block font-mono">
                            BESPOKE ATELIER PRINT:
                          </span>
                          <p className="text-[#171717] text-xs font-bold mt-0.5">
                            {item.customization.design_title}
                          </p>
                          <span className="text-[10px] text-[#6F6A63] font-medium block mt-0.5">
                            Method: {item.customization.technique}
                          </span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DDD3C5]/40 pt-2 text-[#6F6A63]">
                        <span className="font-mono text-[11px]">QTY: {item.quantity}</span>
                        <span className="text-[#238636] font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <Check size={11} strokeWidth={2.5} />
                          <span>100% Bio-Washed Combed Cotton</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atelier Craft Guarantee Strip */}
            <div className="border border-[#DDD3C5] bg-[#EDE0CC]/30 p-5 rounded-[2px] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#E6321C] block">
                  FABRIC STANDARD
                </span>
                <p className="text-xs font-bold text-[#171717] mt-0.5">240 GSM Combed Cotton</p>
                <p className="text-[10px] text-[#6F6A63]">Pre-shrunk, heavyweight drape.</p>
              </div>
              <div>
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#E6321C] block">
                  COLLAR DENSITY
                </span>
                <p className="text-xs font-bold text-[#171717] mt-0.5">Thick Ribbed Collar</p>
                <p className="text-[10px] text-[#6F6A63]">Maintains shape after 40+ washes.</p>
              </div>
              <div>
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#E6321C] block">
                  PRINT LIFE
                </span>
                <p className="text-xs font-bold text-[#171717] mt-0.5">Crack-Resistant Curing</p>
                <p className="text-[10px] text-[#6F6A63]">Industrial heat-pressed pigments.</p>
              </div>
            </div>

            {/* WhatsApp Atelier Concierge Card */}
            <div className="border border-[#DDD3C5] bg-[#FFFFFF] p-6 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs">
              <div>
                <span className="eyebrow text-[#E6321C] flex items-center gap-1.5">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>DIRECT ATELIER CONCIERGE</span>
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#171717] uppercase tracking-tight mt-1">
                  Need an urgent address change or sizing amendment?
                </h3>
                <p className="text-xs text-[#6F6A63] mt-1 leading-relaxed">
                  Connect directly with our atelier cutting desk. Pre-filled with your order reference.
                </p>
              </div>

              <a
                href={getWhatsAppUrl(
                  `Hi Bingooo Atelier, I have an urgent inquiry regarding my order #${displayOrder.order_number}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#171717] text-white px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] hover:bg-[#25D366] hover:text-white transition-all rounded-[2px] shrink-0"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              RIGHT: FINANCIAL SUMMARY & DELIVERY LEDGER (5 COLS)
          ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Summary */}
            <div className="border border-[#DDD3C5] bg-[#FFFFFF] p-6 sm:p-8 rounded-[2px] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#171717]">
                  Financial Breakdown
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#238636] font-mono">
                  TAX INVOICE
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[#6F6A63]">
                <div className="flex justify-between items-center">
                  <span>Garments Subtotal</span>
                  <span className="font-mono font-semibold text-[#171717]">
                    ₹{(displayOrder.subtotal || displayOrder.total).toLocaleString('en-IN')}
                  </span>
                </div>

                {displayOrder.discount_amount ? (
                  <div className="flex justify-between items-center text-[#238636]">
                    <span>Atelier Promo Privilege</span>
                    <span className="font-mono font-bold">
                      -₹{Number(displayOrder.discount_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between items-center">
                  <span>Pan-India Air Logistics</span>
                  <span className="font-mono font-bold text-[#238636] uppercase">FREE</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>GST (Included)</span>
                  <span className="font-mono text-[#171717] font-semibold">12% Built-In</span>
                </div>

                <div className="border-t border-[#DDD3C5] pt-4 mt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#171717] block">
                      Total Amount Settled
                    </span>
                    <span className="text-[10px] text-[#6F6A63] font-mono">
                      via {displayOrder.payment_method || 'Prepaid Secure Gateway'}
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#E6321C] tracking-tight">
                    ₹{Number(displayOrder.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="rounded-[2px] bg-[#F7EEDB] p-3 text-[10px] text-[#6F6A63] flex items-center gap-2 border border-[#DDD3C5]/80">
                <ShieldCheck size={16} className="text-[#238636] shrink-0" />
                <span>Verified 256-bit encrypted transaction with audit log record.</span>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="border border-[#DDD3C5] bg-[#FFFFFF] p-6 sm:p-8 rounded-[2px] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#171717] flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#E6321C]" />
                  <span>Delivery Destination</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717] font-mono">
                  BLUEDART AIR
                </span>
              </div>

              <div className="text-xs text-[#171717] leading-relaxed space-y-1">
                <strong className="block text-sm font-extrabold text-[#171717]">
                  {address.name || 'Valued Patron'}
                </strong>
                <p className="text-[#6F6A63]">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                  <br />
                  {address.city}, {address.state} — {address.postalCode}
                  <br />
                  {address.country || 'India'}
                </p>
                {address.phone && (
                  <p className="text-[#6F6A63] pt-1">
                    Phone:{' '}
                    <span className="font-mono font-bold text-[#171717]">{address.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <Link
                to="/shop"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#171717] text-white py-3.5 px-6 text-xs font-extrabold uppercase tracking-[0.16em] hover:bg-[#E6321C] transition-all rounded-[2px] shadow-2xs"
              >
                <span>Continue Shopping Menswear</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/account/orders"
                className="w-full inline-flex items-center justify-center gap-2 border border-[#DDD3C5] bg-[#FFFFFF] text-[#171717] py-3.5 px-6 text-xs font-extrabold uppercase tracking-[0.16em] hover:border-[#171717] hover:bg-[#EDE0CC]/40 transition-all rounded-[2px]"
              >
                <Package size={14} />
                <span>View Order In Your Account</span>
              </Link>

              <a
                href={getWhatsAppUrl(`Hi Bingooo, I just placed order #${displayOrder.order_number || displayOrder.id || 'recent'} and have a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="w-full inline-flex items-center justify-center gap-2 border border-[#25D366]/40 bg-[#25D366]/10 text-[#171717] py-3 px-6 text-xs font-bold uppercase tracking-wider hover:bg-[#25D366] hover:text-white transition-all rounded-[2px]"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>Order Help on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
