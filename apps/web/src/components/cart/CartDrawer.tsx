import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
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
    <Drawer isOpen={drawerOpen} onClose={closeDrawer} title="Your Bag" position="right" size="md">
      <div className="flex h-full flex-col justify-between">
        {/* Free shipping banner */}
        <div className="border-b border-border bg-paper p-4">
          <div className="flex items-center justify-between text-caption font-medium text-ink">
            <span>
              {subtotal >= freeShippingThreshold ? (
                <span className="text-success font-semibold">🎉 You unlocked FREE Shipping!</span>
              ) : (
                <span>Add ₹{remainingForFree} more for <strong className="text-accent">FREE Shipping</strong></span>
              )}
            </span>
            <span className="text-muted">{Math.round(progressToFree)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressToFree}%` }}
            />
          </div>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-caption text-muted">
              Loading bag...
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper border border-border mb-4 p-3 shadow-inner">
                <Logo variant="icon" size="md" />
              </div>
              <h3 className="text-body font-semibold text-ink">Your bag is empty</h3>
              <p className="mt-1 text-caption text-muted max-w-[240px]">
                Explore our collections or customize your dream apparel today.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-6"
                onClick={() => {
                  closeDrawer();
                  navigate('/shop');
                }}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            cart.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                {/* Thumbnail / Mockup preview */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-paper border border-border flex items-center justify-center">
                  {item.customization ? (
                    <div className="flex flex-col items-center text-center p-1">
                      <Sparkles size={16} className="text-accent mb-0.5" />
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Custom</span>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-muted/60 uppercase">
                      {item.variant?.color || 'BGO'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-body font-medium text-ink line-clamp-1">
                        {item.product?.title || 'Bingooo Apparel'}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted hover:text-danger transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-1.5 text-caption text-muted">
                      {item.variant?.size && (
                        <span className="rounded bg-paper px-1.5 py-0.5 text-[11px] font-medium border border-border/60">
                          Size {item.variant.size}
                        </span>
                      )}
                      {item.variant?.color && (
                        <span className="rounded bg-paper px-1.5 py-0.5 text-[11px] font-medium border border-border/60">
                          {item.variant.color}
                        </span>
                      )}
                      {item.customization && (
                        <span className="rounded bg-accent/10 text-accent-dark px-1.5 py-0.5 text-[11px] font-medium">
                          Custom Print
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity counter */}
                    <div className="flex items-center rounded border border-border">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center text-ink hover:bg-paper transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-caption font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-ink hover:bg-paper transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="text-body font-bold text-ink">
                      ₹{item.total}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {cart?.items && cart.items.length > 0 && (
          <div className="border-t border-border bg-white p-4 space-y-3">
            <div className="space-y-1.5 text-caption">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink font-medium">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated Shipping</span>
                <span className="text-ink font-medium">
                  {cart.shippingFee === 0 ? <strong className="text-success font-semibold">FREE</strong> : `₹${cart.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-body font-bold text-ink pt-1 border-t border-border">
                <span>Estimated Total</span>
                <span>₹{cart.total}</span>
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg" onClick={handleCheckout} className="mt-2">
              Proceed to Checkout
              <ArrowRight size={17} />
            </Button>

            <Link
              to="/cart"
              onClick={closeDrawer}
              className="block text-center text-caption font-medium text-muted hover:text-ink transition-colors"
            >
              View Full Shopping Bag
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
