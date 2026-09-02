import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';

export function WishlistPage() {
  const { wishlist, toggleWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    const variant = product.variants?.[0];
    if (variant) {
      addItem(variant.id, 1);
    }
  };

  return (
    <div className="container-page py-8 sm:py-12 space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-display-lg font-bold text-ink">My Wishlist</h1>
        <p className="text-body text-muted">Items you've saved for later</p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted">Loading saved items...</div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-paper/50">
          <div className="h-16 w-16 rounded-full bg-paper flex items-center justify-center mb-4 text-muted">
            <Heart size={28} />
          </div>
          <h3 className="text-heading font-bold text-ink">Your wishlist is empty</h3>
          <p className="mt-1 text-body text-muted max-w-sm">
            Save items you love by tapping the heart icon on any product.
          </p>
          <Link to="/shop" className="mt-6">
            <Button variant="primary">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product: any) => (
            <div key={product.id} className="rounded-xl border border-border bg-white p-4 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-4">
                <Link to={`/product/${product.slug}`} className="h-24 w-24 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-muted/60">BGO</span>
                </Link>

                <div className="flex-1">
                  <Link to={`/product/${product.slug}`} className="text-body font-bold text-ink hover:text-accent line-clamp-1">
                    {product.title}
                  </Link>
                  <p className="mt-1 text-price text-ink">₹{product.base_price}</p>
                  <span className={`inline-block mt-2 text-xs font-semibold ${product.inStock ? 'text-success' : 'text-danger'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!product.inStock}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBag size={14} /> Add to Bag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWishlist(product.id, true)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} className="text-muted hover:text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
