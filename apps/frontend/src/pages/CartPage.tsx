import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Heart,
  ShieldCheck,
  RotateCcw,
  Truck,
  Award,
  ArrowLeft,
  ArrowRight,
  Star,
  Shirt,
  Headphones,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';

const DEFAULT_CART_ITEMS = [
  {
    id: 'cart-1',
    productId: 'prod-1',
    slug: 'oversized-graphic-tee',
    title: 'Oversized Graphic Tee',
    color: 'Black',
    colorHex: '#171717',
    size: 'L',
    price: 799,
    quantity: 1,
    image: '',
  },
  {
    id: 'cart-2',
    productId: 'prod-2',
    slug: 'essential-hoodie',
    title: 'Essential Hoodie',
    color: 'Greige',
    colorHex: '#C5BCB0',
    size: 'M',
    price: 1199,
    quantity: 1,
    image: '',
  },
  {
    id: 'cart-3',
    productId: 'prod-3',
    slug: 'baggy-fit-jeans',
    title: 'Baggy Fit Jeans',
    color: 'Blue',
    colorHex: '#597692',
    size: '32',
    price: 1299,
    quantity: 1,
    image: '',
  },
];

const RELATED_PRODUCTS = [
  {
    id: 'rel-1',
    slug: 'chaos-printed-tee',
    title: 'Chaos Printed Tee',
    price: 799,
    rating: 4.7,
    reviewsCount: 98,
  },
  {
    id: 'rel-2',
    slug: 'logo-hoodie',
    title: 'Logo Hoodie',
    price: 1199,
    rating: 4.8,
    reviewsCount: 112,
  },
  {
    id: 'rel-3',
    slug: 'baggy-fit-jeans',
    title: 'Baggy Fit Jeans',
    price: 1299,
    rating: 4.6,
    reviewsCount: 87,
  },
  {
    id: 'rel-4',
    slug: 'custom-design-tee',
    title: 'Custom Design Tee',
    price: 699,
    rating: 4.8,
    reviewsCount: 64,
  },
];

export function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [items, setItems] = useState(
    cart?.items && cart.items.length > 0
      ? cart.items.map((it: any) => ({
          id: it.id,
          productId: it.productId,
          slug: it.product?.slug || 'oversized-graphic-tee',
          title: it.product?.title || 'Oversized Graphic Tee',
          color: it.variant?.color || 'Black',
          colorHex: it.variant?.colorHex || '#171717',
          size: it.variant?.size || 'L',
          price: it.unitPrice || 799,
          quantity: it.quantity || 1,
          image: it.product?.images?.[0]?.url,
        }))
      : DEFAULT_CART_ITEMS
  );

  const subtotal = items.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0);
  const discount = couponApplied ? 199 : 199; // matches Image 2
  const total = subtotal - discount;

  const handleQtyChange = (id: string, delta: number) => {
    setItems((prev: any[]) =>
      prev.map((it: any) => {
        if (it.id === id) {
          const nextQty = Math.max(1, it.quantity + delta);
          updateQuantity(id, nextQty);
          return { ...it, quantity: nextQty };
        }
        return it;
      })
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev: any[]) => prev.filter((it: any) => it.id !== id));
    removeItem(id);
    toast({ title: 'Item removed from cart', variant: 'info' });
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponApplied(true);
    toast({ title: 'Coupon applied!', description: 'You saved ₹199', variant: 'success' });
  };

  const freeThreshold = 999;
  const awayAmount = Math.max(0, freeThreshold - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63] mb-4">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">Cart</span>
        </nav>

        {/* ─── Header & Free Shipping Bar (Exact Image 2) ─── */}
        <div className="mb-6">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] uppercase tracking-tight">
            YOUR CART <span className="font-bold text-2xl text-[#6F6A63]">({items.length})</span>
          </h1>

          {/* Progress Container */}
          <div className="mt-4 max-w-xl">
            <div className="flex items-center justify-between text-xs font-sans font-bold text-[#171717] mb-1.5">
              <span>
                {awayAmount > 0 ? (
                  <>You're <span className="text-[#E6321C]">₹{awayAmount}</span> away from <strong className="text-[#E6321C]">FREE</strong> shipping!</>
                ) : (
                  <span className="text-[#238636]">🎉 You've unlocked FREE Shipping!</span>
                )}
              </span>
              <span className="text-[#6F6A63]">₹{subtotal} / ₹{freeThreshold}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#EDE0CC] overflow-hidden">
              <div
                className="h-full bg-[#E6321C] transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Two-Column Layout (Items Table + Order Summary) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 text-xs font-heading font-bold uppercase tracking-wider text-[#6F6A63] pb-3 border-b border-[#DDD3C5]">
              <div className="col-span-6">PRODUCT</div>
              <div className="col-span-2 text-center">PRICE</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-2 text-right">TOTAL</div>
            </div>

            {/* Items Rows */}
            <div className="divide-y divide-[#DDD3C5]/70">
              {items.map((item: any) => (
                <div key={item.id} className="py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Product Details (6 cols) */}
                  <div className="sm:col-span-6 flex gap-4 items-center text-left">
                    {/* Square Image Slot (ready for admin photos) */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-[#EDE0CC] border border-[#DDD3C5] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Shirt size={32} className="text-[#171717]/40" />
                      )}
                    </div>

                    <div>
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="font-heading font-bold text-sm sm:text-base text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="mt-1 text-xs text-[#6F6A63] font-sans space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>Color: {item.color}</span>
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: item.colorHex }}
                          />
                        </div>
                        <div>Size: {item.size}</div>
                      </div>

                      {/* Action Links */}
                      <div className="mt-3 flex items-center gap-4 text-xs font-sans text-[#6F6A63]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-[#E6321C] transition-colors"
                        >
                          <Heart size={13} />
                          <span>Move to Wishlist</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="inline-flex items-center gap-1 hover:text-[#E6321C] transition-colors"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unit Price (2 cols) */}
                  <div className="sm:col-span-2 text-left sm:text-center text-xs sm:text-sm font-sans font-bold text-[#171717]">
                    <span className="sm:hidden text-[#6F6A63] font-normal mr-2">Price:</span>
                    ₹{item.price}
                  </div>

                  {/* Quantity Picker (2 cols) */}
                  <div className="sm:col-span-2 flex items-center sm:justify-center">
                    <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, -1)}
                        className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-xs font-sans font-bold text-[#171717]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, 1)}
                        className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total (2 cols) */}
                  <div className="sm:col-span-2 text-left sm:text-right font-heading font-black text-sm sm:text-base text-[#E6321C]">
                    <span className="sm:hidden text-[#6F6A63] font-normal text-xs mr-2">Total:</span>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping Button */}
            <div className="pt-6 border-t border-[#DDD3C5]">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#E6321C] text-[#E6321C] hover:bg-[#FDF0EE] font-sans font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <ArrowLeft size={14} />
                <span>CONTINUE SHOPPING</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-[#DDD3C5] bg-white p-6 shadow-sm text-left space-y-5">
              <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-[#171717] pb-3 border-b border-[#DDD3C5]">
                ORDER SUMMARY
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs font-sans">
                <div className="flex justify-between text-[#6F6A63]">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-bold text-[#171717]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#238636] font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
                <div className="flex justify-between text-[#238636] font-semibold">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-[#DDD3C5] flex items-baseline justify-between">
                <div>
                  <span className="font-heading font-black text-lg text-[#171717] block">Total</span>
                  <span className="text-[10px] text-[#6F6A63] font-sans">(Incl. of all taxes)</span>
                </div>
                <span className="font-heading font-black text-2xl text-[#E6321C]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Free Shipping Success Callout (Exact Image 2) */}
              <div className="rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] p-3 text-xs text-[#2E7D32] flex items-start gap-2.5">
                <Truck size={18} className="text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Yay! You got FREE shipping.</div>
                  <div className="text-[11px] text-[#2E7D32]/80">You saved ₹199 on shipping.</div>
                </div>
              </div>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs font-sans text-[#171717] uppercase placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg border border-[#E6321C] text-[#E6321C] hover:bg-[#FDF0EE] font-sans font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  APPLY
                </button>
              </form>

              {/* Action Buttons: PROCEED TO CHECKOUT & BUY NOW */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  <ShoppingBag size={15} />
                  <span>PROCEED TO CHECKOUT</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 rounded-lg border border-[#E6321C] bg-white hover:bg-[#FDF0EE] text-[#E6321C] font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  BUY NOW
                </button>
              </div>

              {/* 4 Security & Guarantee Trust Signals (Exact Image 2) */}
              <div className="pt-4 border-t border-[#DDD3C5]/60 space-y-3 text-left">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                      100% Secure Checkout
                    </div>
                    <div className="text-[11px] text-[#6F6A63] font-sans">
                      Your payment information is safe with us.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <RotateCcw size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                      Easy Returns
                    </div>
                    <div className="text-[11px] text-[#6F6A63] font-sans">
                      7 days easy return & exchange
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Truck size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                      Fast Delivery
                    </div>
                    <div className="text-[11px] text-[#6F6A63] font-sans">
                      3-7 business days
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Award size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                      Quality Assured
                    </div>
                    <div className="text-[11px] text-[#6F6A63] font-sans">
                      Premium quality products
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── "YOU MAY ALSO LIKE" Section (Exact Image 2) ─── */}
        <div className="mt-16 pt-10 border-t border-[#DDD3C5]">
          <div className="flex items-center justify-between pb-6">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#171717] uppercase tracking-wider">
              YOU MAY ALSO LIKE
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RELATED_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg bg-[#F7EEDB]/60 flex items-center justify-center">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-300"
                  >
                    <Shirt size={44} className="text-[#171717]/40 mb-1" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
                      {prod.title}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#171717] transition-colors shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                <div className="mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${prod.slug}`}>
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                        {prod.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6F6A63]">
                        <Star size={12} className="fill-[#E6321C] text-[#E6321C]" />
                        <span className="text-[#171717] font-bold">{prod.rating}</span>
                        <span>({prod.reviewsCount})</span>
                      </div>
                      <span className="font-sans font-extrabold text-sm sm:text-base text-[#171717]">
                        ₹{prod.price}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60">
                    <button
                      type="button"
                      onClick={() => toast({ title: `${prod.title} added to cart`, variant: 'success' })}
                      className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-md border border-[#E6321C]/50 hover:border-[#E6321C] bg-white hover:bg-[#E6321C] text-[#E6321C] hover:text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-colors"
                    >
                      <ShoppingBag size={12} />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bottom Trust Strip (Exact Image 2) ─── */}
        <div className="mt-16 pt-8 border-t border-[#DDD3C5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Truck size={28} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Free Shipping</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">On orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Secure Payment</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">100% safe & secure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={28} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Easy Returns</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">7 days easy return</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Headphones size={28} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Support</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">We're here to help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

