import { useParams } from 'react-router-dom';

export function PoliciesPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="container-narrow py-12 space-y-6">
      <h1 className="text-display-lg font-bold text-ink capitalize">
        {slug ? slug.replace(/-/g, ' ') : 'Store Policies'}
      </h1>

      <div className="prose text-body text-muted leading-relaxed space-y-4">
        <p>
          Welcome to Bingooo. We take quality and transparency seriously. All standard catalog garments are eligible for our 7-day hassle-free exchange and return policy.
        </p>

        <h3 className="text-heading font-bold text-ink pt-4">Custom-Printed Apparel</h3>
        <p>
          Customized items with your uploaded artwork or personalized text are printed on-demand exclusively for you. Therefore, customized garments can only be refunded or reprinted if there is a manufacturing defect or printing flaw.
        </p>

        <h3 className="text-heading font-bold text-ink pt-4">Shipping & Delivery</h3>
        <p>
          All orders are dispatched within 24 to 48 hours from our production facility. Standard express delivery across India typically takes 3 to 5 business days. Free shipping applies automatically to all orders above ₹999.
        </p>

        <h3 className="text-heading font-bold text-ink pt-4">Cash on Delivery (COD)</h3>
        <p>
          Cash on delivery is available for all standard items. For customized products, a partial advance deposit of 30% is requested via Razorpay to ensure order commitment before custom printing.
        </p>
      </div>
    </div>
  );
}
