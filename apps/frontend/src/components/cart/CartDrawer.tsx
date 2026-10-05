import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from '../ui/Drawer';
import { useCartStore } from '../../store/cart';
import { useCart } from '../../hooks/useCart';
import { triggerHaptic } from '../../lib/native/capacitorBridge';
import { getCartItemMeta } from '../../lib/cartMeta';
import { resolveImageUrl } from '../../lib/utils';

export function CartDrawer() {
  const { drawerOpen, closeDrawer } = useCartStore();
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    triggerHaptic('medium');
    closeDrawer();
    navigate('/checkout');
  };

  const subtotal = cart?.subtotal || 0;
  const total = Math.max(0, subtotal);
  const items = cart?.items || [];

  return (
    <Drawer
      isOpen={drawerOpen}
      onClose={closeDrawer}
      position="right"
      size="md"
      className="!bg-[#F7EEDB] border-l border-[#DDD3C5] font-sans text-[#171717]"
    >
      <div className="flex h-full flex-col justify-between">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between border-b border-[#DDD3C5] px-6 py-5 bg-[#F7EEDB] shrink-0">
          <div className="flex items-baseline gap-2">
            <h2 className="m-0 text-[18px] font-extrabold uppercase tracking-[-0.04em] text-[#171717]">
              YOUR CART
            </h2>
            <span className="font-mono text-xs font-bold text-[#6F6A63]">
              ({items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)})
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              closeDrawer();
            }}
            className="w-7 h-7 grid place-items-center text-xl text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= ITEM LIST ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#DDD3C5]">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xs font-mono text-[#6F6A63]">
              Loading cart...
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <h3 className="text-[26px] font-extrabold uppercase tracking-[-0.04em] text-[#171717] mb-2">
                YOUR CART IS EMPTY.
              </h3>
              <p className="text-[12px] text-[#6F6A63] max-w-[240px] leading-relaxed mb-6">
                Nothing here yet. Find something that feels like you.
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  closeDrawer();
                  navigate('/shop');
                }}
                className="inline-flex h-11 items-center px-6 bg-[#171717] text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#E6321C] transition-colors cursor-pointer"
              >
                SHOP THE COLLECTION →
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item: any) => {
                const meta = getCartItemMeta(
                  item.variantId || item.variant_id || item.variant?.id || item.id,
                  item.product?.title || item.productTitle,
                  item.product?.slug
                );
                const productTitle = item.product?.title || item.productTitle || meta?.title || 'Bingooo Garment';
                const productSlug = item.product?.slug || meta?.slug || '';
                const rawCategory = item.product?.category?.name || item.product?.category || meta?.category || '';
                const category = (typeof rawCategory === 'string' && rawCategory.trim()) ? rawCategory.trim() : 'APPAREL';

                const variantColor = item.variant?.color || meta?.color || '';
                const variantSize = item.variant?.size || meta?.size || '';
                const gsm = item.product?.fabricWeight || (item.product?.gsm ? `${item.product.gsm} GSM` : '') || meta?.gsm || '';

                const rawImg =
                  item.image ||
                  item.imageUrl ||
                  item.product?.images?.[0]?.url ||
                  item.product?.images?.[0] ||
                  meta?.image;
                const imageUrl = rawImg
                  ? resolveImageUrl(typeof rawImg === 'string' ? rawImg : rawImg.url || rawImg.object_key)
                  : '';

                const attributes = [variantColor, variantSize, gsm].filter(Boolean);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-4 py-4.5">
                      {/* Image Thumbnail */}
                      <div className="relative h-[105px] w-[82px] shrink-0 overflow-hidden bg-[#EDE0CC] border border-[#DDD3C5] flex items-center justify-center">
                        {imageUrl ? (
                          productSlug ? (
                            <Link
                              to={`/product/${productSlug}`}
                              onClick={closeDrawer}
                              className="block w-full h-full"
                            >
                              <img
                                src={imageUrl}
                                alt={productTitle}
                                className="h-full w-full object-cover"
                              />
                            </Link>
                          ) : (
                            <img
                              src={imageUrl}
                              alt={productTitle}
                              className="h-full w-full object-cover"
                            />
                          )
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center p-2 text-center bg-[#EDE0CC]">
                            <span className="font-heading font-black text-sm tracking-widest text-[#E6321C]">B.</span>
                            <span className="text-[7px] font-mono text-[#6F6A63] uppercase tracking-wider mt-0.5 line-clamp-1">
                              {category}
                            </span>
                          </div>
                        )}
                        {item.customization && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-[#E6321C] text-white text-[7px] font-mono font-bold uppercase">
                            CUSTOM
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[8px] font-extrabold uppercase tracking-[1.2px] text-[#6F6A63] mb-0.5">
                                {category}
                              </div>
                              {productSlug ? (
                                <Link
                                  to={`/product/${productSlug}`}
                                  onClick={closeDrawer}
                                >
                                  <h4 className="m-0 text-[13px] font-extrabold text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                                    {productTitle}
                                  </h4>
                                </Link>
                              ) : (
                                <h4 className="m-0 text-[13px] font-extrabold text-[#171717] line-clamp-1">
                                  {productTitle}
                                </h4>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                removeItem(item.id);
                              }}
                              className="text-[#6F6A63] hover:text-[#E6321C] text-base p-1 transition-colors cursor-pointer shrink-0"
                              aria-label="Remove item"
                            >
                              ×
                            </button>
                          </div>

                          {attributes.length > 0 && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[#6F6A63] font-semibold">
                              {attributes.map((attr, idx) => (
                                <span key={idx} className="flex items-center gap-1.5">
                                  {idx > 0 && <span>/</span>}
                                  <span>{attr}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Stepper & Price */}
                        <div className="mt-2.5 flex items-center justify-between pt-1">
                          <div className="flex items-center border border-[#DDD3C5] bg-transparent">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeItem(item.id);
                                }
                              }}
                              className="flex h-6 w-6 items-center justify-center text-[#171717] hover:bg-[#F4EEE4] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-6 text-center font-mono text-[10px] font-extrabold text-[#171717]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              className="flex h-6 w-6 items-center justify-center text-[#171717] hover:bg-[#F4EEE4] transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="font-mono text-[13px] font-extrabold text-[#171717]">
                            ₹{(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        {items.length > 0 && (
          <div className="border-t border-[#DDD3C5] bg-white/30 backdrop-blur-xs p-6 space-y-3.5 shrink-0">
            <div className="space-y-1.5 text-xs text-[#6F6A63]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-[#171717]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#DDD3C5] text-base font-extrabold text-[#171717]">
                <span className="uppercase tracking-tight">Total</span>
                <span className="font-mono text-xl text-[#171717]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right text-[9px] text-[#6F6A63]">
                Inclusive of all applicable taxes
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full h-[48px] bg-[#E6321C] text-white text-[10px] font-extrabold uppercase tracking-[0.5px] hover:bg-[#B91F12] active:translate-y-[1px] transition-all cursor-pointer shadow-xs"
            >
              PROCEED TO CHECKOUT →
            </button>

            <Link
              to="/cart"
              onClick={closeDrawer}
              className="block text-center text-[10px] font-extrabold tracking-wider uppercase text-[#171717] hover:text-[#E6321C] underline underline-offset-4 transition-colors"
            >
              VIEW FULL CART DETAILS
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default CartDrawer;
