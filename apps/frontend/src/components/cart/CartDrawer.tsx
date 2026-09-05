import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { useCartStore } from '../../store/cart';
import { useCart } from '../../hooks/useCart';

export function CartDrawer() {
  const { drawerOpen, closeDrawer } = useCartStore();
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const freeShippingThreshold = cart?.freeShippingThreshold || 999;
  const subtotal = cart?.subtotal || 0;
  const progressToFree = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <Drawer isOpen={drawerOpen} onClose={closeDrawer} title="YOUR BAG" position="right" size="md">
      <div className="flex h-full flex-col justify-between bg-white font-sans">
        {/* Free shipping progress bar */}
        <div className="border-b border-border bg-paper/60 p-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-ink">
            <span>
              {subtotal >= freeShippingThreshold ? (
                <span className="text-success flex items-center gap-1.5">
                  <ShieldCheck size={14} /> FREE EXPRESS SHIPPING UNLOCKED!
                </span>
              ) : (
                <span>
                  ADD <strong className="text-brand-red">₹{remainingForFree}</strong> FOR FREE AIR SHIPPING
                </span>
              )}
            </span>
            <span className="text-muted">{Math.round(progressToFree)}%</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              initial={false}
              animate={{ width: `${progressToFree}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className={`h-full rounded-full ${
                subtotal >= freeShippingThreshold ? 'bg-success' : 'bg-brand-red'
              }`}
            />
          </div>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-border">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xs font-mono text-muted">
              Syncing bag with atelier...
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper border border-border mb-4 p-3 shadow-inner">
                <Logo variant="icon" size="md" />
              </div>
              <h3 className="text-body font-bold text-ink font-display">Your bag is empty</h3>
              <p className="mt-1 text-caption text-muted max-w-[240px] font-sans">
                Explore our curated drops or launch the 2D studio to customize your dream piece.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-6 bg-brand-red hover:bg-brand-red-hover text-white font-mono font-bold"
                onClick={() => {
                  closeDrawer();
                  navigate('/shop');
                }}
              >
                <ShoppingBag size={16} />
                Explore Catalog
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cart.items.map((item: any) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.94, transition: { duration: 0.22 } }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    {/* Thumbnail / Realistic Garment preview */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#EDE0CC] border border-border flex items-center justify-center p-1">
                      <img
                        src={
                          item.customization?.previewUrl ||
                          item.product?.images?.[0]?.url ||
                          item.product?.images?.[0]?.object_key ||
                          (item.product?.slug?.includes('graphic')
                            ? '/custom/tshirt-step-3-black.png'
                            : item.product?.slug?.includes('classic')
                            ? '/custom/tshirt-step-1.png'
                            : item.product?.slug?.includes('hoodie')
                            ? '/custom/tshirt-step-2.png'
                            : '/custom/tshirt-step-1.png')
                        }
                        alt={item.product?.title || 'Garment item'}
                        className="h-full w-full object-contain p-1"
                      />

                      {item.customization && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-brand-red text-white text-[8px] font-mono font-bold uppercase">
                          STUDIO
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-body font-bold text-ink font-display line-clamp-1">
                            {item.product?.title || 'Bingooo Custom Garment'}
                          </h4>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => removeItem(item.id)}
                            className="text-muted hover:text-danger transition-colors p-1 rounded-lg hover:bg-paper"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </motion.button>
                        </div>

                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-caption font-mono text-muted">
                          {item.variant?.size && (
                            <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold text-ink border border-border">
                              SZ {item.variant.size}
                            </span>
                          )}
                          {item.variant?.color && (
                            <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold text-ink border border-border">
                              {item.variant.color}
                            </span>
                          )}
                          {item.customization && (
                            <span className="rounded-md bg-brand-red/10 text-brand-red px-2 py-0.5 text-[10px] font-bold border border-brand-red/30">
                              Custom Print
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity counter */}
                        <div className="flex items-center rounded-lg border border-border bg-paper">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center text-ink hover:bg-white rounded-l-lg transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-8 text-center text-xs font-mono font-bold text-ink"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-ink hover:bg-white rounded-r-lg transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>

                        <span className="text-body font-bold text-ink font-mono">
                          ₹{item.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer checkout actions */}
        {cart?.items && cart.items.length > 0 && (
          <div className="border-t border-border bg-white p-6 space-y-4 shadow-elevated">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted">
                <span>SUBTOTAL</span>
                <span className="text-ink font-bold font-mono">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>ESTIMATED AIR FREIGHT</span>
                <span className="text-ink font-bold font-mono">
                  {cart.shippingFee === 0 ? (
                    <strong className="text-success font-bold">FREE</strong>
                  ) : (
                    `₹${cart.shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-border">
                <span className="font-display">TOTAL</span>
                <span className="font-mono text-xl text-brand-red">₹{cart.total}</span>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleCheckout}
              className="bg-brand-red hover:bg-brand-red-hover text-white shadow-glow font-mono font-bold text-sm tracking-wider py-4"
            >
              PROCEED TO CHECKOUT
              <ArrowRight size={17} />
            </Button>

            <Link
              to="/cart"
              onClick={closeDrawer}
              className="block text-center text-xs font-mono font-bold text-muted hover:text-ink transition-colors uppercase tracking-wider"
            >
              View Full Shopping Bag Details
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
