# E-Nömrə Reyestri — React Frontend

Modern React frontend for the E-Number Registry system. Connects to the same backend API used by the Laravel sample project.

## Tech Stack

- **React 19** + **Vite 8** + **TypeScript 6**
- **React Router v7** — routing and navigation
- **React Hook Form** + **Zod** — forms and validation
- **TanStack Table v8** — registry table with sorting, filtering, pagination
- **Tailwind CSS v4** — utility-first styling
- **Radix UI** — accessible UI primitives
- **Axios** — typed HTTP client with auth interceptors
- **Zustand** — lightweight auth state
- **dayjs** — date formatting
- **Lucide React** — icons

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance, token management, error formatting
│   ├── auth.ts            # Login endpoint
│   ├── registrations.ts   # Registry CRUD endpoints
│   ├── excel.ts           # CSV export + Excel import
│   └── types.ts           # TypeScript interfaces for all API data
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx  # Main shell with sidebar
│   │   ├── Sidebar.tsx    # Navigation sidebar with role-based items
│   │   └── Header.tsx     # Top bar with font-size controls
│   ├── ui/                # shadcn-style UI components
│   └── ExcelUploadModal.tsx
├── hooks/
│   ├── useFontSize.ts     # Adjustable font size
│   └── useRegistrations.ts # Data fetching hooks
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RegistrationsPage.tsx   # Main table (TanStack Table)
│   ├── RegistrationFormPage.tsx # Create + Edit
│   ├── RegistrationDetailPage.tsx
│   ├── DraftsPage.tsx
│   ├── NotFoundPage.tsx
│   └── UnauthorizedPage.tsx
├── router/
│   └── ProtectedRoute.tsx
└── store/
    └── authStore.ts       # Zustand auth + permission helpers
```

## Getting Started

```bash
# Copy environment config
cp .env.example .env
# Edit VITE_API_URL to point to your backend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## API Endpoints (from sample project)

All endpoints use **POST** method, with `Bearer <token>` auth.

| Operation | Endpoint |
|-----------|----------|
| Login | `POST /digital-login` `{ role }` |
| IKTA — list | `POST /icta/getAllNumberRegistrations` |
| IKTA — detail | `POST /icta/getNumberRegistration` `{ enc_id }` |
| RINN — list | `POST /rinn/getAllNumberRegistrations` |
| RINN — detail | `POST /rinn/getNumberRegistration` `{ enc_id }` |
| Create | `POST /icta/storeNumberRegistration` (FormData) |
| Edit | `POST /icta/editNumberRegistration` (FormData + enc_id) |
| Submit/Approve | `POST /icta/submitNumberRegistration` `{ enc_id }` |
| Delete | `POST /icta/deleteNumberRegistration` `{ enc_id }` |

**Response format:** `{ success: boolean, message: string, payload: ... }`

## Roles & Permissions

| Role | Can View | Can Create | Can Edit | Can Submit | Can Delete |
|------|----------|------------|----------|------------|------------|
| `icta` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `rinn` | ✅ | ❌ | ❌ | ❌ | ❌ |

## Draft Workflow

Records with `status.slug === 'draft'` or `status.slug === 'qaralama'` are editable.
All other statuses are read-only — only the "View" action is shown.

**Flow:** Create → Saved as Draft → Submit (approve) → Confirmed

## Auth

- Token stored in `localStorage` as `e_number_auth_token`
- Role stored as `e_number_auth_role`
- Bearer token attached to all API requests via Axios interceptor
- 401 response → auto logout + redirect to /login
