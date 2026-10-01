# Technology Stack

> Inventory of runtimes, frameworks, dependencies, and infrastructure for BINGOOO.

## Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v20+ / v22 LTS | Monorepo JavaScript runtime |
| TypeScript | 5.5+ | Type-safe development across all workspaces |
| npm Workspaces | 10+ | Monorepo dependency management |

## Core Technologies

### Frontend (`apps/frontend`)
| Feature | System | Purpose |
|---------|--------|---------|
| Framework | React 19 + Vite 8 | Customer storefront & Customizer Studio PWA |
| Styling | Tailwind CSS | Curated design system (Warm cream, Charcoal, Signal red) |
| Icons | Lucide React | Standardized SVG vector icons |
| Mobile Bridge | Capacitor 8 | Native Android container with haptics & status bar |

### Admin Control Center (`apps/admin`)
| Feature | System | Purpose |
|---------|--------|---------|
| Framework | React 19 + Vite 8 | 27-route operational control center |
| Styling | Tailwind CSS | High-density data tables and operational views |
| Charts / Telemetry | Recharts / Custom | GMV and order pipeline telemetry |

### Backend API (`apps/backend`)
| Feature | System | Purpose |
|---------|--------|---------|
| Framework | NestJS 10 | High-throughput REST API with modular controllers |
| Database / Caching | File Store + In-Memory Hash Indexes | Low-latency O(1) hash indexed storage |
| ORM | Prisma Client | Supabase PostgreSQL schema and models |
| Security | Helmet, Rate Limit, Passport JWT | Enterprise API security |

## External Services & Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Payment Gateway | Razorpay | UPI intent/QR, NetBanking, Cards, COD |
| Object Storage | Cloudflare R2 | Custom artwork uploads & product media CDN |
| Hosting / CDN | Vercel | Production deployments for Frontend, Admin, Backend |
| Database | Supabase (PostgreSQL) | Managed PostgreSQL with row-level security |

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root monorepo configuration with npm workspaces |
| `tsconfig.base.json` | Shared compiler options across all packages |
| `.env.example` | Template for environment secrets (Razorpay, Cloudflare, Supabase) |
| `capacitor.config.ts` | Mobile native application configuration |
| `prisma/schema.prisma` | PostgreSQL relational schema definitions |

---

*Last updated: 2026-10-01*
