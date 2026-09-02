# Bingooo --- Complete Design System & UI/UX Specification

**Product:** Bingooo Men's Wear\
**Core promise:** **Wear what feels like you.**\
**Secondary message:** **Create. Customize. Wear.**

## 1. Design North Star

Bingooo must feel like a real premium men's fashion brand, not a generic
ecommerce template. Every customer and admin screen must use one shared
design system.

Brand personality: modern, confident, youthful, premium, expressive,
minimal, streetwear-inspired.

Principles: - Product first - Warm minimalism - Bingooo red used
strategically - Editorial photography - Clear Shop and Custom Design
journeys - Consistency over novelty - Mobile-first responsive UX -
Accessible controls - No AI-slop aesthetics

## 2. Brand Identity

Use the supplied Bingooo logo as the source of truth. Never distort,
stretch, recolor, redraw, or replace it.

Primary logo: Bingooo + MEN'S WEAR.\
Secondary mark: stylized B.

Use the primary logo in the desktop header and packaging. Use the B mark
for favicon, app icon and compact product branding.

## 3. Color System

  Token        Hex         Usage
  ------------ ----------- ------------------------------------------
  Brand Red    `#E6321C`   Primary CTA, active state, price, accent
  Deep Red     `#B91F12`   Hover, pressed and strong red surfaces
  Warm Cream   `#F7EEDB`   Main page background
  Soft Beige   `#EDE0CC`   Secondary surfaces
  Charcoal     `#171717`   Primary text and dark sections
  White        `#FFFFFF`   Cards and forms
  Muted Text   `#6F6A63`   Secondary text
  Border       `#DDD3C5`   Borders and dividers

Semantic colors should be restrained: success `#238636`, warning
`#B7791F`, error `#C62828`, info `#2563A6`.

Red should be an accent, not the dominant background.

## 4. Typography

Primary typeface: **Inter**. Fallback: system-ui, sans-serif.

  Style          Desktop   Mobile   Weight
  ------------ --------- -------- --------
  Display XL        64px     40px      800
  Display           52px     36px      800
  H1                42px     32px      700
  H2                32px     26px      700
  H3                24px     21px      650
  H4                20px     18px      600
  Body Large        18px     17px      400
  Body              16px     15px      400
  Small             14px     13px      400
  Label             13px     12px      600
  Price             20px     18px      700

Do not change fonts between pages or between storefront and admin.

## 5. Spacing

Use an 8px spacing system:

`4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128px`.

## 6. Layout

Desktop maximum content width: 1280--1440px, preferred 1320px.

Desktop padding: 32--48px.\
Tablet padding: 24px.\
Mobile padding: 16--20px.

Product grids: - Desktop: 4 columns - Tablet: 2--3 columns - Mobile: 2
columns where appropriate

Use a 12-column editorial grid for marketing sections.

## 7. Responsive Breakpoints

-   Mobile: `<640px`
-   Tablet: `640–1023px`
-   Desktop: `1024–1279px`
-   Wide: `>=1280px`

Mobile must use dedicated layouts, not simply compressed desktop
layouts.

## 8. Radius, Borders and Shadows

Radius: - Small: 6px - Medium: 10px - Large: 14px - XL: 18px - Pill:
999px only where appropriate

Default border: `1px solid #DDD3C5`.

Focus ring: `2px solid #E6321C`.

Use subtle elevation only. Avoid dramatic shadows.

## 9. Buttons

Primary: Bingooo red, white text, 10px radius, 44--48px minimum height,
600 weight.

Secondary: transparent/white surface, red border and red text.

Tertiary: text action.

Every button supports default, hover, focus, pressed, disabled and
loading states.

## 10. Forms

All inputs, selects, checkboxes, radios and textareas use one consistent
component system.

States: - default - focused - filled - error - disabled - loading

Errors appear directly below the relevant field.

## 11. Iconography

Use one consistent professional line-icon family with 1.5--2px stroke.

Core icons: search, user, heart, cart, menu, close, chevron, filter,
sort, home, categories, upload, edit, eye, package, truck, shield,
payment, support and settings.

## 12. Photography

Photography must feel editorial, natural, premium and contemporary.

Preferred environments: - warm architecture - textured beige walls -
minimal studios - clean urban locations - natural sunlight - directional
shadows - subtle red accents

Use realistic garment texture and natural poses. Avoid obvious AI
artifacts.

Hero images must reserve negative space for HTML copy. Important website
text must never be baked into images.

Product images must use consistent aspect ratio, lighting, crop and
background family.

## 13. Global Header

Desktop:

`Bingooo Logo | Home | Shop | Custom Design | Categories | About Us | Contact | Search | Account | Wishlist | Cart`

Use a cream/white surface and red active state.

Mobile:

`Menu | Bingooo | Search | Cart`

## 14. Hamburger Drawer

Mobile drawer includes: 1. Home 2. Shop 3. Custom Design 4. Categories
5. Wishlist 6. Cart 7. My Account 8. My Orders 9. My Designs 10. About
Us 11. Contact Us 12. FAQ 13. Privacy Policy 14. Terms & Conditions 15.
Logout when authenticated

Include support and social links.

## 15. Footer

Columns: - Shop - Customer Care - My Account - Legal - Contact

Include Bingooo brand statement, social icons and business contact
information.

## 16. Customer Routes

``` text
/
/landing
/shop
/search
/category/:slug
/product/:slug
/custom
/custom/design
/cart
/wishlist
/checkout
/checkout/payment
/order-success/:id
/login
/register
/forgot-password
/reset-password
/verify-otp
/account
/account/orders
/account/orders/:id
/account/orders/:id/track
/account/orders/:id/review
/account/designs
/account/addresses
/about
/contact
/faq
/shipping-policy
/returns-refunds
/cancellation-policy
/privacy-policy
/terms
/404
```

## 17. Homepage / Landing Page

Sections: 1. Hero 2. Trust strip 3. Shop by Category 4. Create.
Customize. Wear. 5. New Arrivals 6. Best Sellers 7. Why Bingooo? 8.
Brand Story 9. Community Reviews 10. Promotional CTA 11. Newsletter 12.
Footer

Hero copy: **Wear what feels like you.**

CTAs: **Shop Men's Wear** **Create Your Design**

The hero must communicate clothing + personality + customization.

## 18. Shop

Include: - breadcrumbs - page title - category shortcuts - filters -
sort - grid/list toggle - product grid - pagination/infinite loading -
mobile filter drawer

Filters: - category - size - color - price - availability - collection

## 19. Search

Route: `/search?q=...`

Show query, result count, suggestions, filters, sorting and products.

No-result state must offer a useful next action.

## 20. Category

Route: `/category/:slug`.

Use the same shop system with a category-specific editorial
introduction.

## 21. Product Card

Anatomy:

``` text
Image
Badge + Wishlist
Product name
Fabric/GSM
Price
Color swatches
```

States: default, hover, loading, sale, bestseller, new, out-of-stock.

## 22. Product Details

Desktop: gallery left, purchase panel right.\
Mobile: gallery first and sticky purchase action.

Include: - image gallery - zoom - title - rating - price - sale price -
size - size guide - color - quantity - wishlist - Add to Cart - Buy
Now - delivery estimate - COD/partial COD - fabric - GSM - description -
specifications - reviews - related products

## 23. Custom Design

This is a core Bingooo differentiator.

Workflow:

`Choose Product → Choose Color → Upload → Position/Scale/Rotate → Select Print Area → Preview → Validate → Add to Cart`

Controls: - upload - drag - resize - rotate - delete - undo/redo -
front/back - print area - zoom - reset

Validate file type, size and dimensions.

Show a realistic garment preview whenever possible.

## 24. My Designs

Route: `/account/designs`.

Users can view, rename, edit, reuse and delete designs.

Actions: - Edit - Use Design - Delete

## 25. Cart

Show products, variants, quantity, price, remove/save actions and order
summary.

Summary: - subtotal - discount - shipping - applicable COD/handling -
total

Primary CTA: Proceed to Checkout.

## 26. Wishlist

Show saved products, availability, price, Add to Cart and remove.

## 27. Checkout

Progressive sections: 1. Contact 2. Address 3. Delivery 4. Payment 5.
Review

Payment methods can include Razorpay-supported methods, COD and partial
COD.

Never expose secret payment credentials in the browser.

## 28. Payment States

Provide: - processing - success - failed - cancelled

Failed payment must offer retry and payment-method change.

## 29. Order Success

Route: `/order-success/:id`.

Show success, order number, payment status, amount, delivery estimate,
address summary, Track Order, Continue Shopping and View Order.

## 30. Order Tracking

Timeline:

`Order Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered`

Completed/current states use red; future states remain neutral.

## 31. Account

Sections: - Profile - Orders - Wishlist - My Designs - Addresses -
Payment preferences - Security - Logout

## 32. Addresses

Fields: - full name - phone - address - city - state - postal code -
landmark - address type - default

Actions: add, edit, delete, set default.

## 33. Reviews

Customer can submit: - rating - optional title - text - product images

## 34. About

Tell the Bingooo story through editorial sections covering: - why
Bingooo exists - men's fashion philosophy - customization - quality -
self-expression - future vision

## 35. Contact

Include contact form, WhatsApp/support CTA, support information and FAQ
link.

## 36. FAQ and Legal

Required: - FAQ - Shipping Policy - Returns & Refunds - Cancellation
Policy - Privacy Policy - Terms & Conditions

Use simple readable layouts with the same header/footer.

## 37. Admin Design

Admin should feel like Bingooo but prioritize information density.

Use cream backgrounds, white cards, charcoal text, red actions, compact
tables and the same Inter typography.

Never use a generic blue/purple SaaS dashboard.

## 38. Admin Routes

``` text
/admin/login
/admin
/admin/products
/admin/products/new
/admin/products/:id/edit
/admin/categories
/admin/inventory
/admin/orders
/admin/orders/:id
/admin/custom-orders
/admin/custom-requirements
/admin/uploads
/admin/banners
/admin/coupons
/admin/discounts
/admin/payments
/admin/returns
/admin/customers
/admin/customers/:id
/admin/reviews
/admin/users
/admin/roles
/admin/notifications
/admin/analytics
/admin/audit-logs
/admin/settings
/admin/profile
```

## 39. Admin Dashboard

Stats: - revenue - orders - customers - average order value - custom
orders

Also show sales chart, order status, low stock, recent orders, recent
activity and quick actions.

## 40. Admin Products

Table: - image - product - SKU - category - price - stock - status -
updated - actions

Actions: view, edit, duplicate, archive/delete.

## 41. Add/Edit Product

Fields: - name - slug - description - category - subcategory - SKU -
price - sale price - cost - inventory - sizes - colors - fabric - GSM -
images - tags - featured/bestseller/new - SEO title - SEO description -
status

## 42. Inventory

Show SKU, product, variant, current stock, reserved, available,
low-stock threshold and status.

Actions: adjust stock, history, bulk update.

## 43. Categories

Manage name, slug, image, description, ordering and active state.

## 44. Orders

Filters: - order number - customer - date - status - payment -
fulfillment

Statuses: Pending, Confirmed, Processing, Shipped, Out for Delivery,
Delivered, Cancelled, Returned, Refunded.

## 45. Custom Orders

Show customer, order, garment, size, color, quantity, artwork, preview,
placement, production status, payment status, shipping status and notes.

Actions: approve, reject, request changes, download artwork, update
production status.

## 46. Custom Requirements

Statuses: - New - Reviewing - Awaiting Customer - Approved - Rejected -
Converted to Order

Manage uploaded files, requirements, estimates and internal notes.

## 47. Uploads

Media library for: - product images - customer uploads - custom
designs - banners

Provide search, filtering, preview and secure file actions.

## 48. Banners

Manage: - desktop image - mobile image - title - subtitle - CTA - target
URL - priority - start/end date - active state

## 49. Coupons

Manage code, type, value, minimum order, maximum discount, usage limit,
per-user limit, dates, eligible products/categories and active state.

## 50. Discounts

Manage product/category discounts, value, schedule, priority,
stackability and status.

## 51. Payments

Show: - transaction ID - Razorpay payment ID - order ID - customer -
amount - method - status - refund status - timestamp

Statuses: Created, Pending, Paid, Failed, Refunded, Partially Refunded.

## 52. Returns & Refunds

Workflow:

`Request → Review → Approve/Reject → Pickup/Return → Inspect → Refund → Complete`

## 53. Customers

Show customer, contact, order count, total spent, last order, status and
creation date.

Customer detail: - profile - addresses - orders - payments - custom
orders - reviews - activity

## 54. Reviews Admin

Moderation: - pending - approved - rejected

Actions: - approve - reject - remove

## 55. Users & Roles

Roles: - Super Admin - Admin - Product Manager - Order Manager -
Customer Support

Use granular backend-enforced permissions.

Examples: `products.read`, `products.create`, `products.update`,
`products.delete`, `orders.read`, `orders.update`, `payments.read`,
`refunds.manage`, `users.manage`, `roles.manage`, `settings.manage`.

## 56. Notifications

Support order, payment, custom design and stock events. Channels may
include in-app, email and WhatsApp/SMS where integrated.

## 57. Analytics

Show: - sales - revenue - orders - average order value - top products -
category performance - custom-order performance - customer growth

## 58. Audit Logs

Record admin, action, resource, resource ID, timestamp and relevant
metadata for sensitive operations.

## 59. Settings

Sections: - Store - Commerce - Shipping - COD - Partial COD - Payments -
Notifications - Storage - SEO

Settings must be permission protected.

## 60. Admin Profile

Include name, email, avatar, password/security, sessions and logout.

## 61. Reusable Components

Build once and reuse everywhere:

-   Header
-   Mobile Header
-   Footer
-   Navigation
-   Search
-   ProductCard
-   ProductGrid
-   ProductGallery
-   PriceDisplay
-   Rating
-   WishlistButton
-   QuantitySelector
-   SizeSelector
-   ColorSelector
-   FilterSidebar
-   MobileFilterDrawer
-   Breadcrumb
-   Button
-   Input
-   Select
-   Checkbox
-   Radio
-   Modal
-   Drawer
-   Toast
-   Badge
-   Tabs
-   Accordion
-   Pagination
-   EmptyState
-   LoadingState
-   ErrorState
-   ConfirmationDialog
-   ImageUploader
-   FileUploader
-   DataTable
-   AdminSidebar
-   AdminHeader
-   StatusBadge
-   StatCard
-   OrderTimeline
-   AddressCard
-   CouponInput

## 62. Loading, Empty and Error States

Every asynchronous page requires loading, empty, error and success
states.

Use skeletons that match final component dimensions.

Never show raw stack traces.

## 63. System States

Design: - 404 - 500 - offline/network error - payment failed - payment
cancelled - session expired - out of stock - empty cart - empty
wishlist - empty orders - empty designs - empty search - no products -
no customers - no reviews

## 64. Accessibility

Target WCAG 2.2 AA where practical.

Requirements: - semantic HTML - keyboard navigation - visible focus -
labels - alt text - sufficient contrast - logical headings - accessible
dialogs/drawers - Escape support - screen-reader names - reduced-motion
support - no color-only status communication

## 65. Motion

Use restrained motion: - 150--250ms micro interactions - 250--400ms
drawers/modals - subtle image hover scale - gentle state transitions

Respect `prefers-reduced-motion`.

## 66. SEO

Every public page should support: - title - meta description - canonical
URL - Open Graph metadata - social image - descriptive image alt text

Product pages should expose appropriate structured product metadata.

## 67. Performance

Prioritize: - optimized responsive images - lazy loading below fold -
modern image formats - reserved image dimensions - minimized layout
shift - code splitting - separate admin/public bundles where
appropriate - caching catalog data

## 68. Technical Integration

Frontend: React + TypeScript.

Backend: NestJS + TypeScript + REST APIs.

Database: Supabase PostgreSQL.

Authentication: Supabase Auth with backend authorization/RBAC.

Storage: Cloudflare R2.

Payments: Razorpay with server-side verification and verified webhooks.

Security: - no secrets in frontend - environment variables - server-side
validation - secure upload handling - MIME and size validation - signed
URLs when required - webhook verification - authorization guards - rate
limiting where appropriate - audit logging

## 69. Core Data Entities

``` text
users
roles
permissions
user_roles
products
product_images
product_variants
categories
inventory
inventory_transactions
carts
cart_items
wishlists
wishlist_items
addresses
orders
order_items
payments
refunds
coupons
discounts
custom_designs
custom_orders
custom_requirements
uploads
banners
reviews
notifications
audit_logs
```

## 70. Customer Journeys

Standard:

`Landing → Discover → Shop/Category → Product → Cart → Checkout → Payment → Order Success → Track Order → Review`

Customization:

`Landing → Custom Design → Choose Garment → Upload → Customize → Preview → Cart → Checkout → Order`

Brand story:

`Discover → Create → Customize → Preview → Wear`

## 71. Content Rules

Preferred language: - Wear what feels like you. - Create. Customize.
Wear. - Premium fits. Your vibe. - Made for your style. - Your idea.
Your garment.

Avoid generic ecommerce filler, fake urgency, fake reviews and
unsupported claims.

Product copy should state useful facts such as fabric, GSM, fit, care,
sizing, print details and delivery.

## 72. Trust Signals

Use only verified business claims, such as: - Premium Quality - Custom
Printing - Secure Payments - 3--7 Day Delivery - COD / Partial COD -
Easy Support / Returns

## 73. Mobile Rules

Mobile navigation uses hamburger drawer.

Shop uses filter/sort drawers.

Product pages use sticky purchase actions.

Checkout uses stacked sections and collapsible summary.

Product grids may use two columns.

No horizontal overflow.

## 74. Design Token Architecture

Centralize tokens:

``` text
colors.brand.red
colors.brand.redDark
colors.surface.cream
colors.surface.beige
colors.surface.white
colors.text.primary
colors.text.muted
colors.border.default

font.family.sans
font.size.display
font.size.h1
font.size.body
font.weight.regular
font.weight.medium
font.weight.semibold
font.weight.bold

space.*
radius.*
shadow.*
breakpoint.*
```

No page should create its own visual system.

## 75. Final Consistency Rules

Non-negotiable: - one typography system - one color system - one button
system - one form system - one card system - one icon family - one
spacing system - one radius system - one responsive breakpoint system -
one product-card system - one navigation system

Do not create independent page-specific visual languages.

## 76. Acceptance Criteria

Visual: - all pages use Bingooo palette - all pages use Inter - shared
spacing/radius/buttons - correct logo usage - consistent photography

UX: - primary CTAs work - forms validate - async actions have loading
states - collections have empty states - failures have recovery - mobile
navigation works - checkout is usable on mobile

Technical: - secrets remain server-side - backend enforces
authorization - uploads are validated - R2 assets are secure - Razorpay
verification is server-side - webhooks are verified - sensitive admin
actions are audited

## 77. Final Brand Experience

Bingooo is a premium men's fashion brand where customers discover
clothing, express their identity and create their own designs.

The experience should communicate:

**SEE IT → WANT IT → MAKE IT YOURS → BUY IT → WEAR IT**

The visual identity is:

**Warm cream + beige + charcoal + Bingooo red + Inter + editorial
photography + restrained modern UI.**

The product identity is:

**Men's Wear + Customization + Personal Expression.**

The single most important implementation rule is:

> Build one Bingooo Design System and make every page consume that
> system.
