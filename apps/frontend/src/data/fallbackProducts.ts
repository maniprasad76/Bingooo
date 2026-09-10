export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  inStock: boolean;
  stockQuantity: number;
  price?: number;
}

export interface FallbackProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  customizationEnabled: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  fabric_gsm: number;
  fit_silhouette: string;
  care_instructions: string;
  rating: number;
  reviews_count: number;
  images: Array<{ url: string; alt_text: string }>;
  variants: ProductVariant[];
  tags: string[];
}

export const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Oversized Tees', slug: 'oversized-tees', product_count: 12 },
  { id: 'cat-2', name: 'Hoodies & Fleece', slug: 'hoodies', product_count: 8 },
  { id: 'cat-3', name: 'Graphic Drops', slug: 'graphic-drops', product_count: 6 },
  { id: 'cat-4', name: 'Pants & Cargos', slug: 'cargos', product_count: 5 },
  { id: 'cat-5', name: 'Denim & Jeans', slug: 'jeans', product_count: 4 },
  { id: 'cat-6', name: 'Shirts', slug: 'shirts', product_count: 5 },
  { id: 'cat-7', name: 'Accessories', slug: 'accessories', product_count: 4 },
];

export const FALLBACK_PRODUCTS: FallbackProduct[] = [
  {
    id: 'prod-1',
    title: 'Classic Heavyweight Oversized Tee',
    slug: 'classic-oversized-tee',
    description: 'Constructed from premium 240 GSM combed cotton. Boxy streetwear silhouette with double-needle ribbed collar and dropped shoulders for relaxed luxury everyday drape.',
    basePrice: 699,
    compareAtPrice: 999,
    customizationEnabled: true,
    category: {
      id: 'cat-1',
      name: 'Oversized Tees',
      slug: 'oversized-tees',
    },
    fabric_gsm: 240,
    fit_silhouette: 'Boxy Drop Shoulder',
    care_instructions: 'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.',
    rating: 4.8,
    reviews_count: 128,
    images: [
      { url: '/hero-banner.png', alt_text: 'Classic Oversized Tee Front' },
      { url: '/custom/tshirt-step-1.png', alt_text: 'Classic Oversized Tee Mockup' },
    ],
    variants: [
      { id: 'v-1-s-blk', sku: 'COT-BLK-S', size: 'S', color: 'Charcoal Black', colorHex: '#111111', inStock: true, stockQuantity: 24 },
      { id: 'v-1-m-blk', sku: 'COT-BLK-M', size: 'M', color: 'Charcoal Black', colorHex: '#111111', inStock: true, stockQuantity: 42 },
      { id: 'v-1-l-blk', sku: 'COT-BLK-L', size: 'L', color: 'Charcoal Black', colorHex: '#111111', inStock: true, stockQuantity: 38 },
      { id: 'v-1-xl-blk', sku: 'COT-BLK-XL', size: 'XL', color: 'Charcoal Black', colorHex: '#111111', inStock: true, stockQuantity: 19 },
      { id: 'v-1-m-crm', sku: 'COT-CRM-M', size: 'M', color: 'Vintage Cream', colorHex: '#F7EEDB', inStock: true, stockQuantity: 30 },
      { id: 'v-1-l-crm', sku: 'COT-CRM-L', size: 'L', color: 'Vintage Cream', colorHex: '#F7EEDB', inStock: true, stockQuantity: 25 },
      { id: 'v-1-m-red', sku: 'COT-RED-M', size: 'M', color: 'Atelier Crimson', colorHex: '#B91F12', inStock: true, stockQuantity: 18 },
    ],
    tags: ['bestseller', 'streetwear', 'heavyweight', 'customizable', 't-shirts', 'tshirts', 'tees', 'oversized-tees'],
  },
  {
    id: 'prod-2',
    title: 'Create Your Own Custom Hoodie',
    slug: 'create-your-own-hoodie',
    description: '380 GSM ultra-heavyweight cotton-poly blend fleece. Features double-lined hood, seamless kangaroo pocket, and customizable front/back graphic atelier zones.',
    basePrice: 1299,
    compareAtPrice: 1799,
    customizationEnabled: true,
    category: {
      id: 'cat-2',
      name: 'Hoodies & Fleece',
      slug: 'hoodies',
    },
    fabric_gsm: 380,
    fit_silhouette: 'Relaxed Streetwear Fit',
    care_instructions: 'Hand or delicate machine wash cold. Hang dry in shade. Do not bleach.',
    rating: 4.9,
    reviews_count: 84,
    images: [
      { url: '/custom/tshirt-step-2.png', alt_text: 'Custom Hoodie Front' },
      { url: '/hero-banner-2.jpg', alt_text: 'Custom Hoodie Lifestyle' },
    ],
    variants: [
      { id: 'v-2-m-grn', sku: 'CYH-GRN-M', size: 'M', color: 'Forest Pine', colorHex: '#2F3E34', inStock: true, stockQuantity: 20 },
      { id: 'v-2-l-grn', sku: 'CYH-GRN-L', size: 'L', color: 'Forest Pine', colorHex: '#2F3E34', inStock: true, stockQuantity: 15 },
      { id: 'v-2-m-crm', sku: 'CYH-CRM-M', size: 'M', color: 'Raw Linen', colorHex: '#EDE0CC', inStock: true, stockQuantity: 22 },
      { id: 'v-2-l-crm', sku: 'CYH-CRM-L', size: 'L', color: 'Raw Linen', colorHex: '#EDE0CC', inStock: true, stockQuantity: 18 },
      { id: 'v-2-xl-blk', sku: 'CYH-BLK-XL', size: 'XL', color: 'Ink Black', colorHex: '#171717', inStock: true, stockQuantity: 12 },
    ],
    tags: ['customizable', 'winter', 'hoodie', 'featured', 'hoodies'],
  },
  {
    id: 'prod-3',
    title: 'Minimal Atelier B Tee',
    slug: 'minimal-b-tee',
    description: 'Understated aesthetic crafted in 220 GSM high-grade cotton with subtle embroidery chest emblem. High tensile fabric with zero color bleeding guaranteed.',
    basePrice: 699,
    compareAtPrice: 899,
    customizationEnabled: false,
    category: {
      id: 'cat-1',
      name: 'Oversized Tees',
      slug: 'oversized-tees',
    },
    fabric_gsm: 220,
    fit_silhouette: 'Tailored Boxy Cut',
    care_instructions: 'Machine wash 30°C. Low tumble dry. Cool iron.',
    rating: 4.7,
    reviews_count: 65,
    images: [
      { url: '/hero-banner-5.jpg', alt_text: 'Minimal B Tee' },
      { url: '/custom/tshirt-step-1.png', alt_text: 'Minimal B Tee Mock' },
    ],
    variants: [
      { id: 'v-3-s-red', sku: 'MBT-RED-S', size: 'S', color: 'Crimson Red', colorHex: '#B91F12', inStock: true, stockQuantity: 14 },
      { id: 'v-3-m-red', sku: 'MBT-RED-M', size: 'M', color: 'Crimson Red', colorHex: '#B91F12', inStock: true, stockQuantity: 30 },
      { id: 'v-3-l-blk', sku: 'MBT-BLK-L', size: 'L', color: 'Midnight Black', colorHex: '#111111', inStock: true, stockQuantity: 26 },
      { id: 'v-3-m-wht', sku: 'MBT-WHT-M', size: 'M', color: 'Optic White', colorHex: '#FFFFFF', inStock: true, stockQuantity: 28 },
    ],
    tags: ['essential', 'minimal', 't-shirt', 't-shirts', 'tshirts', 'tees', 'oversized-tees'],
  },
  {
    id: 'prod-4',
    title: 'Cyber Tokyo Anime Graphic Hoodie',
    slug: 'graphic-anime-hoodie',
    description: 'High-density screenprint combined with reflective ink highlights on 360 GSM heavyweight French terry. Designed for standout nightwear and street style.',
    basePrice: 1299,
    compareAtPrice: 1699,
    customizationEnabled: false,
    category: {
      id: 'cat-3',
      name: 'Graphic Drops',
      slug: 'graphic-drops',
    },
    fabric_gsm: 360,
    fit_silhouette: 'Oversized Drop-Shoulder',
    care_instructions: 'Gentle cycle cold wash. Do not iron printed graphics.',
    rating: 4.9,
    reviews_count: 142,
    images: [
      { url: '/custom/tshirt-step-3-black.png', alt_text: 'Anime Graphic Hoodie Front' },
      { url: '/hero-banner-4.jpg', alt_text: 'Anime Graphic Hoodie Lifestyle' },
    ],
    variants: [
      { id: 'v-4-m-blk', sku: 'AH-BLK-M', size: 'M', color: 'Onyx Black', colorHex: '#111111', inStock: true, stockQuantity: 25 },
      { id: 'v-4-l-blk', sku: 'AH-BLK-L', size: 'L', color: 'Onyx Black', colorHex: '#111111', inStock: true, stockQuantity: 19 },
      { id: 'v-4-xl-blk', sku: 'AH-BLK-XL', size: 'XL', color: 'Onyx Black', colorHex: '#111111', inStock: true, stockQuantity: 15 },
    ],
    tags: ['anime', 'graphic', 'bestseller', 'hoodie', 'hoodies', 'graphic-drops'],
  },
  {
    id: 'prod-5',
    title: 'Waffle-Weave Textured Camp Collar Shirt',
    slug: 'textured-shirt',
    description: 'Breathable 210 GSM honeycomb textured knit shirt. Styled with a cuban open collar, horn buttons, and casual drop silhouette tailored for warm weather.',
    basePrice: 799,
    compareAtPrice: 1099,
    customizationEnabled: false,
    category: {
      id: 'cat-6',
      name: 'Shirts',
      slug: 'shirts',
    },
    fabric_gsm: 210,
    fit_silhouette: 'Cuban Relaxed Silhouette',
    care_instructions: 'Dry clean recommended or hand wash cold. Flat dry.',
    rating: 4.6,
    reviews_count: 53,
    images: [
      { url: '/hero-banner-2.jpg', alt_text: 'Textured Shirt Front' },
      { url: '/hero-banner.png', alt_text: 'Textured Shirt Model' },
    ],
    variants: [
      { id: 'v-5-m-crm', sku: 'TS-CRM-M', size: 'M', color: 'Warm Oatmeal', colorHex: '#E8DEC8', inStock: true, stockQuantity: 22 },
      { id: 'v-5-l-crm', sku: 'TS-CRM-L', size: 'L', color: 'Warm Oatmeal', colorHex: '#E8DEC8', inStock: true, stockQuantity: 18 },
      { id: 'v-5-m-blk', sku: 'TS-BLK-M', size: 'M', color: 'Pitch Black', colorHex: '#111111', inStock: true, stockQuantity: 16 },
    ],
    tags: ['textured', 'resort', 'casual', 'shirts', 'shirt'],
  },
  {
    id: 'prod-6',
    title: 'Tactical Multi-Pocket Cargo Trousers',
    slug: 'tactical-cargo-trousers',
    description: 'Engineered with 280 GSM ripstop cotton twill. Features 6 ergonomic gusseted utility pockets, adjustable ankle bungee toggles, and reinforced knee stitching.',
    basePrice: 1499,
    compareAtPrice: 1999,
    customizationEnabled: false,
    category: {
      id: 'cat-4',
      name: 'Pants & Cargos',
      slug: 'cargos',
    },
    fabric_gsm: 280,
    fit_silhouette: 'Baggy Tapered Cargo',
    care_instructions: 'Machine wash 40°C. Tumble dry medium. Iron medium heat.',
    rating: 4.8,
    reviews_count: 91,
    images: [
      { url: '/hero-banner-3.jpg', alt_text: 'Cargo Trousers Front' },
      { url: '/hero-banner.png', alt_text: 'Cargo Trousers Fit' },
    ],
    variants: [
      { id: 'v-6-30-olv', sku: 'TC-OLV-30', size: '30', color: 'Army Olive', colorHex: '#3D4532', inStock: true, stockQuantity: 18 },
      { id: 'v-6-32-olv', sku: 'TC-OLV-32', size: '32', color: 'Army Olive', colorHex: '#3D4532', inStock: true, stockQuantity: 24 },
      { id: 'v-6-34-olv', sku: 'TC-OLV-34', size: '34', color: 'Army Olive', colorHex: '#3D4532', inStock: true, stockQuantity: 15 },
      { id: 'v-6-32-blk', sku: 'TC-BLK-32', size: '32', color: 'Stealth Black', colorHex: '#171717', inStock: true, stockQuantity: 30 },
    ],
    tags: ['tactical', 'cargos', 'utility', 'pants', 'jeans', 'denim'],
  },
  {
    id: 'prod-7',
    title: 'Heavyweight Raw Selvedge Denim Jeans',
    slug: 'raw-selvedge-denim-jeans',
    description: '14.5 oz premium Japanese selvedge denim. Straight relaxed vintage fit with copper rivet reinforcements, custom leather waistband patch, and deep indigo fade potential.',
    basePrice: 1799,
    compareAtPrice: 2499,
    customizationEnabled: false,
    category: {
      id: 'cat-5',
      name: 'Denim & Jeans',
      slug: 'jeans',
    },
    fabric_gsm: 410,
    fit_silhouette: 'Straight Relaxed Silhouette',
    care_instructions: 'Wash inside out in cold water after 3-6 months of wear. Hang dry.',
    rating: 4.9,
    reviews_count: 38,
    images: [
      { url: '/hero-banner-3.jpg', alt_text: 'Raw Selvedge Denim Front' },
      { url: '/hero-banner-4.jpg', alt_text: 'Raw Denim Lifestyle' },
    ],
    variants: [
      { id: 'v-7-30-ind', sku: 'RSD-IND-30', size: '30', color: 'Raw Indigo', colorHex: '#1A2744', inStock: true, stockQuantity: 12 },
      { id: 'v-7-32-ind', sku: 'RSD-IND-32', size: '32', color: 'Raw Indigo', colorHex: '#1A2744', inStock: true, stockQuantity: 20 },
      { id: 'v-7-34-ind', sku: 'RSD-IND-34', size: '34', color: 'Raw Indigo', colorHex: '#1A2744', inStock: true, stockQuantity: 16 },
    ],
    tags: ['jeans', 'denim', 'pants', 'selvedge', 'bestseller'],
  },
  {
    id: 'prod-8',
    title: 'Atelier Boxy Heavy Oxford Shirt',
    slug: 'boxy-oxford-shirt',
    description: '260 GSM structured heavyweight Oxford cloth. Tailored drop shoulders, mother-of-pearl buttons, and structured collar that maintains its shape all day.',
    basePrice: 999,
    compareAtPrice: 1499,
    customizationEnabled: false,
    category: {
      id: 'cat-6',
      name: 'Shirts',
      slug: 'shirts',
    },
    fabric_gsm: 260,
    fit_silhouette: 'Boxy Drop Fit',
    care_instructions: 'Machine wash warm. Hang dry. Steam iron.',
    rating: 4.8,
    reviews_count: 47,
    images: [
      { url: '/hero-banner-2.jpg', alt_text: 'Oxford Shirt Front' },
      { url: '/hero-banner-5.jpg', alt_text: 'Oxford Shirt Side' },
    ],
    variants: [
      { id: 'v-8-m-wht', sku: 'BOS-WHT-M', size: 'M', color: 'Chalk White', colorHex: '#FDFBF7', inStock: true, stockQuantity: 18 },
      { id: 'v-8-l-wht', sku: 'BOS-WHT-L', size: 'L', color: 'Chalk White', colorHex: '#FDFBF7', inStock: true, stockQuantity: 14 },
      { id: 'v-8-m-blu', sku: 'BOS-BLU-M', size: 'M', color: 'Pale Sky Blue', colorHex: '#D2DFEC', inStock: true, stockQuantity: 12 },
    ],
    tags: ['shirts', 'shirt', 'oxford', 'formal', 'casual'],
  },
];

export const FALLBACK_FILTERS = {
  categories: FALLBACK_CATEGORIES,
  sizes: ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34'],
  colors: [
    { name: 'Black', hex: '#111111' },
    { name: 'Cream', hex: '#F7EEDB' },
    { name: 'Crimson', hex: '#B91F12' },
    { name: 'Olive', hex: '#3D4532' },
    { name: 'White', hex: '#FFFFFF' },
  ],
  priceRange: { min: 499, max: 2499 },
};
