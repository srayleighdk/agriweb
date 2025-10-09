# AgriWeb - Agricultural Investment Platform

A comprehensive platform connecting farmers and investors for sustainable agriculture.

## Project Structure

```
agriweb.com          → Main application (Farmer + Investor portals)
admin.agriweb.com    → Admin CMS
```

## Features

### Main Application (agriweb.com)
- **Landing Page**: Public homepage with platform information
- **Authentication**: Login/Register for farmers and investors
- **Farmer Portal**: Manage farmlands, crops, livestock, and funding requests
- **Investor Portal**: Browse opportunities, make investments, track returns

### Admin CMS (admin.agriweb.com)
- **Dashboard**: Overview statistics and metrics
- **User Management**: Manage all users (farmers, investors, admins)
- **Farmer Management**: Verify farmers, manage farmlands
- **Investor Management**: Verify investors, manage portfolios
- **Investment Management**: Approve/reject requests, track funding
- **Agricultural Data**: Manage plants, crop varieties, animals, breeds
- **Location Management**: Manage provinces and communes
- **Notifications**: System-wide notification management
- **Reports**: Analytics and data export

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: SWR + Axios
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: NestJS (agridb)
- **Database**: PostgreSQL with Prisma

## Getting Started

### Prerequisites
- Node.js 20+
- npm/yarn/pnpm/bun

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open:
- Main app: [http://localhost:3000](http://localhost:3000)
- Admin CMS: [http://admin.localhost:3000](http://admin.localhost:3000)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── app/
│   ├── (main)/              # Main application routes
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── farmer/          # Farmer portal
│   │   └── investor/        # Investor portal
│   ├── admin/               # Admin CMS routes
│   │   ├── page.tsx         # Admin dashboard
│   │   ├── users/           # User management
│   │   ├── farmers/         # Farmer management
│   │   ├── investors/       # Investor management
│   │   └── ...
│   └── layout.tsx           # Root layout
├── components/
│   ├── layout/              # Layout components
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   └── ui/                  # UI components (shadcn)
├── lib/
│   ├── api/                 # API client
│   └── utils.ts             # Utilities
├── store/
│   └── auth.ts              # Auth state management
├── types/
│   └── index.ts             # TypeScript types
└── middleware.ts            # Subdomain routing

```

## Subdomain Routing

The middleware handles subdomain-based routing:
- `agriweb.com` → Main application
- `admin.agriweb.com` → Admin CMS

For local development:
- `localhost:3000` → Main application
- `admin.localhost:3000` → Admin CMS

## Backend API

The backend (agridb) runs on `http://localhost:3000/api` and provides:
- Authentication (JWT + OAuth)
- User management
- Farmland & crop management
- Investment system
- Agricultural data
- Notifications
- File uploads

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project structure with subdomain routing
- [x] Authentication pages (login/register)
- [x] Admin CMS layout (sidebar, header)
- [x] Basic dashboards (admin, farmer, investor)
- [x] Auth store with Zustand

### Phase 2: Core Features (In Progress)
- [ ] API integration
- [ ] User management CRUD
- [ ] Farmer profile & verification
- [ ] Investor profile & verification
- [ ] Investment request workflow

### Phase 3: Advanced Features
- [ ] Farmland & crop management
- [ ] Livestock management
- [ ] Diary system
- [ ] Notification system
- [ ] File upload system

### Phase 4: Analytics & Polish
- [ ] Reports and charts
- [ ] Data export (PDF/Excel)
- [ ] Performance optimization
- [ ] UI/UX refinements

## License

Private project
# agriweb
