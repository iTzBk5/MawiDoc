# PROJECT_MAP.md — MawiDOC (موعدك)

> Single Source of Truth for architecture, versions, flow, and pending items.
> Last updated: 2026-07-12

---

## [TECH_STACK]

### Version Matrix (Verified Stable — July 2026)

| Layer | Package | Version | Source |
|-------|---------|---------|--------|
| **Runtime** | Node.js LTS | 24.18.0 'Krypton' | nodejs.org (2026-06-23) |
| **Language** | TypeScript | 5.8.3 | npm (safe ceiling for RN 0.86 toolchain) |
| **Backend** | Express.js | 5.2.1 | npm (latest stable) |
| **ORM** | Prisma | 7.8.0 | npm (2026-04-22) |
| **Auth** | jsonwebtoken | 9.0.3 | npm (2025-12-04) |
| **Hashing** | bcryptjs | 2.4.3 | npm (stable, no native build) |
| **Validation** | zod | 3.24.x | npm (latest) |
| **HTTP (server)** | cors + helmet | latest | npm |
| **Uploads** | multer | 2.x | npm |
| **Scheduler** | node-cron | 3.x | npm |
| **Logger** | pino | 9.x | npm (fastest Node logger) |
| **Mobile** | React Native | 0.86.0 | npm (2026) |
| **Navigation** | @react-navigation/native-stack | 7.3.6 | npm (2026-07-03) |
| **Navigation** | @react-navigation/bottom-tabs | 7.x | npm (aligned with native-stack) |
| **HTTP (client)** | axios | 1.18.1 | npm (2026-06-22) |
| **Storage** | @react-native-async-storage/async-storage | 3.1.1 | npm (2026-05-29) |
| **Maps** | react-native-maps | 1.29.0 | npm (2026-06-28) |
| **Camera/Gallery** | react-native-image-picker | 8.2.1 | npm (2025-05-04) |
| **i18n** | i18next + react-i18next | 24.x + 15.x | npm |
| **Locale detect** | react-native-localize | 3.3.x | npm |
| **Animations** | react-native-reanimated | 4.5.1 | npm (2026-07-04) |
| **Gestures** | react-native-gesture-handler | 3.0.2 | npm (2026-06-18) |
| **Safe Area** | react-native-safe-area-context | 5.8.0 | npm (2026-05-18) |
| **Screens** | react-native-screens | 4.26.0 | npm (2026-07-10) |
| **Icons** | @react-native-vector-icons/common | 13.1.2 | npm (2026-05-24) |
| **Calendar** | react-native-calendars | 1.1314.0 | npm (2026-01-29) |
| **Push (mobile)** | @react-native-firebase/messaging | 25.x | npm (aligned with @react-native-firebase/app 25.1.0) |
| **Push (server)** | firebase-admin | 12.x | npm |
| **State** | zustand | 5.x | npm |
| **Dates** | date-fns | 4.4.0 | npm (2026-05-29) |
| **Env** | react-native-config | 1.x | npm |

### Deliberate Exclusions

| Package | Reason |
|---------|--------|
| Redux / Redux Toolkit | Zustand is simpler, less boilerplate, sufficient for this scope |
| `react-native-push-notification` | Archived (2025-01-14), use Firebase Messaging instead |
| `@notifee/react-native` | Last release Dec 2024 (2yr old), not needed for this scope |
| TypeORM / Sequelize | Prisma 7.x is the chosen ORM, no mixing |
| GraphQL | REST is sufficient and simpler for this project |
| TypeScript 7.0.2 | Released 2026-07-08 (3 days old), RN 0.86 Babel/Metro toolchain untested with it. TS 5.8.3 is the safe ceiling. |
| Express 4.x | v5.2.1 is latest stable, 4.x is maintenance-only |

---

## [ASSUMPTIONS]

1. **Doctor Pre-Creation**: Doctor accounts are seeded/created by an admin. No self-registration endpoint for doctors.
2. **Single Specialty per Doctor**: Each doctor has one primary specialty. Many-to-many can be added later.
3. **30-Minute Slots**: Default appointment slot duration is 30 minutes.
4. **Single Clinic per Doctor**: One clinic location per doctor profile.
5. **Profile Photo Storage**: Photos stored on local server filesystem (`/uploads/`). Can be migrated to S3/Cloudinary later.
6. **Firebase**: A Firebase project will be created for FCM push notifications.
7. **Google Maps API Key**: Will be provided at build time via `react-native-config`.
8. **Target Market**: Arabic-speaking regions (North Africa: Algeria, Tunisia, Morocco, Libya).
9. **Currency**: Consultation price is display-only (no payment gateway integration).
10. **Backend Hosting**: VPS or single cloud instance (no microservices).

---

## [OPEN_QUESTIONS] — Require Your Clarification

| # | Question | Impact | Recommendation |
|---|----------|--------|----------------|
| Q1 | How are doctor accounts pre-created? Admin panel? Database seeding script? | Auth flow, scope | Start with a CLI seed script. Admin panel is a separate future project. |
| Q2 | Is there an admin role at all in this MVP, or purely patient/doctor? | Schema, scope | No admin role in MVP. Use seed script for doctor creation. |
| Q3 | Should appointment slots be auto-generated from working hours, or doctors manually create each slot? | UX complexity | Auto-generate from working hours. Doctor sets: working days + start/end time → system creates 30-min slots. |
| Q4 | Is the profile photo upload required for MVP, or can it be deferred? | Scope | Include in MVP — simple multer upload to `/uploads/`. |
| Q5 | Is the map feature required for MVP, or can it be deferred? | Scope | Include in MVP — basic map with markers for nearby doctors. |
| Q6 | Appointment status includes ACCEPTED/REJECTED in the flow but PENDING/CANCELLED/COMPLETED in the spec. Which is correct? | Schema | Use: PENDING → ACCEPTED/REJECTED → COMPLETED/CANCELLED. This covers the full lifecycle. |
| Q7 | Doctor working hours — same every week, or can vary per week? | Schema complexity | Same weekly schedule (recurring). Per-week overrides can be added later. |
| Q8 | Is there a "forgot password" flow needed for MVP? | Auth scope | Defer to post-MVP. Include in architecture but mark as PENDING. |

---

## [SYSTEM_FLOW]

### User Journey — First Launch

```
App Launch
  │
  ▼
┌─────────────────────┐
│  Role Selection      │  "Are you a Patient or a Doctor?"
│  Screen              │
└──────┬──────┬───────┘
       │      │
  Patient  Doctor
       │      │
       ▼      ▼
┌──────────┐ ┌──────────┐
│ Register │ │  Login   │
│ + Login  │ │  ONLY    │
└────┬─────┘ └────┬─────┘
     │             │
     ▼             ▼
┌─────────────────────────────────────────┐
│  Role-Based Navigation                   │
│  Patient → PatientTabs                   │
│  Doctor  → DoctorTabs                    │
└─────────────────────────────────────────┘
```

### Patient Flow

```
Patient Login
  │
  ▼
Home Screen (Search bar + Featured doctors)
  │
  ├──► Search Results (by name / specialty / city)
  │      │
  │      ▼
  │    Doctor Profile (info + available slots)
  │      │
  │      ▼
  │    Select Slot → Book Appointment → Confirmation
  │
  ├──► Map View (nearby doctors with markers)
  │
  ├──► My Appointments (upcoming + history)
  │      │
  │      ▼
  │    Cancel Appointment (if status = PENDING/ACCEPTED)
  │
  ├──► Notifications (real-time + in-app list)
  │
  └──► Profile (view/edit)
```

### Doctor Flow

```
Doctor Login
  │
  ▼
Dashboard (today's appointments + quick stats)
  │
  ├──► Appointments Management
  │      │
  │      ├
  │      ├── Cancel appointments
  │      └── Create manual appointment
  │
  ├──► Profile Setup / Edit
  │      │
  │      ├── Upload photo
  │      ├── Set specialties
  │      ├── Set consultation price
  │      ├── Add clinic info + address
  │      └── Set location on map
  │
  ├──► Working Hours Management
  │      │
  │      ├── Set working days (Sun-Sat)
  │      ├── Set start/end times per day
  │      └── Toggle Open/Close clinic
  │
  ├──► Statistics
  │      │
  │      ├── Total appointments
  │      ├── Today's appointments
  │      ├── Monthly appointments
  │      ├── Cancelled appointments
  │      └── Total unique patients
  │
  └──► Notifications
```

### Notification Flow

```
Event Trigger                    Recipient
─────────────────────────────────────────────
Patient books appointment   →   Doctor (push + in-app)
Doctor accepts appointment  →   Patient (push + in-app)
Doctor rejects appointment  →   Patient (push + in-app)
Appointment cancelled       →   Other party (push + in-app)
Appointment reminder (cron) →   Patient (push, 1h before)
```

---

## [ARCHITECTURE]

### High-Level: Monorepo (npm workspaces)

```
mawi-doc/
├── mobile/          React Native 0.86 (TypeScript)
├── server/          Node.js 24 + Express 5 + Prisma 7
├── shared/          Shared TypeScript types (FE ↔ BE contracts)
├── PROJECT_MAP.md   This file
└── package.json     Workspace root
```

### Backend Architecture — Layered (Feature-Based)

```
HTTP Request
  │
  ▼
┌──────────────────────────────────┐
│  Routes (URL → Controller)        │  Express Router
├──────────────────────────────────┤
│  Validation (Zod schemas)         │  Request validation
├──────────────────────────────────┤
│  Auth Middleware (JWT verify)      │  Protect routes, attach user
├──────────────────────────────────┤
│  Controller (HTTP logic)          │  Parse req/res, call service
├──────────────────────────────────┤
│  Service (Business logic)         │  Pure logic, no HTTP concerns
├──────────────────────────────────┤
│  Prisma Client (Data access)      │  ORM queries
├──────────────────────────────────┤
│  PostgreSQL                        │  Database
└──────────────────────────────────┘
```

### Frontend Architecture — Feature-Based (Clean)

```
┌──────────────────────────────────────────────────────┐
│  App (Entry)                                          │
│  ├── Navigation (RootNavigator)                       │
│  │   ├── Auth Stack (RoleSelect, Login, Register)     │
│  │   ├── Patient Tabs (Home, Appts, Notifs, Profile)  │
│  │   └── Doctor Tabs (Dashboard, Appts, Profile, Notifs)│
│  │                                                    │
│  ├── Features (Domain modules)                        │
│  │   ├── auth/     (screens, components, hooks)       │
│  │   ├── patient/  (patient-specific UI)              │
│  │   ├── doctor/   (doctor-specific UI)               │
│  │   ├── appointments/ (shared appointment views)     │
│  │   ├── search/   (search + map)                     │
│  │   ├── notifications/                               │
│  │   └── profile/                                     │
│  │                                                    │
│  ├── Services (API layer — Axios instances)            │
│  │   └── api.ts (base) + *.service.ts per domain      │
│  │                                                    │
│  ├── Store (Zustand state stores)                     │
│  │   ├── auth.store.ts                                │
│  │   ├── patient.store.ts                             │
│  │   ├── doctor.store.ts                              │
│  │   └── notification.store.ts                        │
│  │                                                    │
│  └── Shared (reusable across features)                │
│      ├── components/ (Button, Card, Input, Header...) │
│      ├── hooks/ (useAuth, useLanguage, useApi...)     │
│      ├── theme/ (colors, typography, spacing)         │
│      ├── i18n/ (translations: en, ar, fr)             │
│      └── utils/ (formatters, validators, helpers)     │
└──────────────────────────────────────────────────────┘
```

---

## [DATABASE_SCHEMA]

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Enums ──────────────────────────────────────────────

enum UserRole {
  PATIENT
  DOCTOR
}

enum Gender {
  MALE
  FEMALE
}

enum AppointmentStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
  COMPLETED
}

// ── Models ─────────────────────────────────────────────

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  phone     String   @unique
  password  String
  role      UserRole
  fcmTokens FCMToken[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  patientProfile PatientProfile?
  doctorProfile  DoctorProfile?

  @@map("users")
}

model PatientProfile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName  String
  username  String   @unique
  age       Int
  gender    Gender
  city      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments Appointment[]

  @@map("patient_profiles")
}

model DoctorProfile {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName          String
  username          String    @unique
  specialtyId       String
  specialty         Specialty @relation(fields: [specialtyId], references: [id])
  clinicName        String?
  address           String?
  description       String?
  consultationPrice Float
  profilePicture    String?
  latitude          Float?
  longitude         Float?
  isOpen            Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  workingDays    WorkingDay[]
  availableSlots AvailableSlot[]
  appointments   Appointment[]

  @@map("doctor_profiles")
}

model Specialty {
  id       String          @id @default(uuid())
  name     String          @unique
  nameAr   String
  nameFr   String
  icon     String?
  doctors  DoctorProfile[]

  @@map("specialties")
}

model WorkingDay {
  id        String  @id @default(uuid())
  doctorId  String
  doctor    DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  dayOfWeek Int     // 0 = Sunday, 6 = Saturday
  isActive  Boolean @default(true)
  startTime String  // "09:00"
  endTime   String  // "17:00"

  @@unique([doctorId, dayOfWeek])
  @@map("working_days")
}

model AvailableSlot {
  id       String        @id @default(uuid())
  doctorId String
  doctor   DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  date     DateTime      @db.Date
  startTime String       // "09:00"
  endTime   String       // "09:30"
  isBooked Boolean       @default(false)

  appointment Appointment?

  @@unique([doctorId, date, startTime])
  @@map("available_slots")
}

model Appointment {
  id          String            @id @default(uuid())
  patientId   String
  patient     PatientProfile    @relation(fields: [patientId], references: [id])
  doctorId    String
  doctor      DoctorProfile     @relation(fields: [doctorId], references: [id])
  slotId      String?           @unique
  slot        AvailableSlot?    @relation(fields: [slotId], references: [id])
  date        DateTime          @db.Date
  startTime   String
  endTime     String
  status      AppointmentStatus @default(PENDING)
  notes       String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  notifications Notification[]

  @@index([patientId, date])
  @@index([doctorId, date])
  @@index([status])
  @@map("appointments")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  body      String
  data      Json?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, isRead])
  @@map("notifications")
}

model FCMToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  platform  String   // "android" | "ios"
  createdAt DateTime @default(now())

  @@map("fcm_tokens")
}
```

---

## [API_DESIGN]

### Base URL: `/api/v1`

### Auth

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/auth/register` | `{email, phone, password, fullName, username, age, gender, city}` | `{token, user}` | No |
| POST | `/auth/login` | `{email, password, role}` | `{token, user}` | No |
| POST | `/auth/refresh` | — | `{token}` | Yes |

### Patient

| Method | Endpoint | Body/Query | Response | Auth |
|--------|----------|------------|----------|------|
| GET | `/patient/profile` | — | `PatientProfile` | Patient |
| PUT | `/patient/profile` | `{fullName?, age?, gender?, city?}` | `PatientProfile` | Patient |
| GET | `/patient/appointments` | `?status=&page=&limit=` | `Appointment[]` | Patient |
| POST | `/patient/appointments` | `{doctorId, slotId, date, startTime, endTime, notes?}` | `Appointment` | Patient |
| DELETE | `/patient/appointments/:id` | — | `{message}` | Patient |

### Doctor

| Method | Endpoint | Body/Query | Response | Auth |
|--------|----------|------------|----------|------|
| GET | `/doctor/profile` | — | `DoctorProfile` | Doctor |
| PUT | `/doctor/profile` | `{fullName?, clinicName?, address?, description?, consultationPrice?, profilePicture?}` | `DoctorProfile` | Doctor |
| PUT | `/doctor/location` | `{latitude, longitude}` | `DoctorProfile` | Doctor |
| PUT | `/doctor/status` | `{isOpen: boolean}` | `DoctorProfile` | Doctor |
| GET | `/doctor/working-days` | — | `WorkingDay[]` | Doctor |
| PUT | `/doctor/working-days` | `{days: [{dayOfWeek, isActive, startTime, endTime}]}` | `WorkingDay[]` | Doctor |
| GET | `/doctor/slots` | `?date=` | `AvailableSlot[]` | Doctor |
| GET | `/doctor/appointments` | `?status=&date=&page=&limit=` | `Appointment[]` | Doctor |
| PUT | `/doctor/appointments/:id/cancel` | — | `Appointment` | Doctor |
| POST | `/doctor/appointments` | `{patientId, date, startTime, endTime, notes?}` | `Appointment` | Doctor |
| GET | `/doctor/statistics` | `?period=` | `Statistics` | Doctor |

### Search (Public for patients)

| Method | Endpoint | Query | Response | Auth |
|--------|----------|-------|----------|------|
| GET | `/search/doctors` | `?name=&specialty=&city=&page=&limit=` | `DoctorProfile[]` | Patient |
| GET | `/search/doctors/nearby` | `?lat=&lng=&radius=5` | `DoctorProfile[]` | Patient |
| GET | `/search/specialties` | — | `Specialty[]` | Patient |

### Doctor Public (for patient view)

| Method | Endpoint | Response | Auth |
|--------|----------|----------|------|
| GET | `/doctors/:id` | `DoctorProfile` | Patient |
| GET | `/doctors/:id/slots` | `AvailableSlot[]` | Patient |

### Notifications

| Method | Endpoint | Response | Auth |
|--------|----------|----------|------|
| GET | `/notifications` | `Notification[]` | Any |
| PUT | `/notifications/:id/read` | `{message}` | Any |
| PUT | `/notifications/read-all` | `{message}` | Any |
| POST | `/notifications/fcm-token` | `{message}` | Any |

---

## [NAVIGATION_STRUCTURE]

```
RootNavigator (Stack — checks auth state + role)
│
├─ RoleSelectionScreen          (if no auth)
│
├─ AuthStack (Stack)
│  ├─ LoginScreen
│  └─ RegisterScreen            (patient only)
│
├─ PatientTabs (Bottom Tabs)
│  ├─ HomeTab (Stack)
│  │  ├─ PatientHomeScreen
│  │  ├─ DoctorSearchScreen
│  │  ├─ DoctorProfileScreen
│  │  ├─ MapScreen
│  │  └─ SlotSelectionScreen
│  │
│  ├─ AppointmentsTab (Stack)
│  │  ├─ AppointmentsListScreen
│  │  └─ AppointmentDetailScreen
│  │
│  ├─ NotificationsTab (Stack)
│  │  └─ NotificationsScreen
│  │
│  └─ ProfileTab (Stack)
│     ├─ PatientProfileScreen
│     └─ EditProfileScreen
│
└─ DoctorTabs (Bottom Tabs)
   ├─ DashboardTab (Stack)
   │  ├─ DashboardScreen
   │  ├─ TodayAppointmentsScreen
   │  └─ StatisticsScreen
   │
   ├─ AppointmentsTab (Stack)
   │  ├─ AllAppointmentsScreen
   │  └─ AppointmentDetailScreen
   │
   ├─ ProfileTab (Stack)
   │  ├─ DoctorProfileScreen
   │  ├─ EditProfileScreen
   │  ├─ WorkingDaysScreen
   │  └─ ClinicInfoScreen
   │
   └─ NotificationsTab (Stack)
      └─ NotificationsScreen
```

---

## [UI_THEME]

### Color Palette

```typescript
const Colors = {
  // Brand
  primary:    '#07274D',  // Amsterdam — headers, primary buttons, nav bar
  accent:     '#01A894',  // Persian Green — links, highlights, active states

  // Neutral
  white:      '#FFFFFF',
  background: '#F5F7FA',
  surface:    '#FFFFFF',
  border:     '#E5E7EB',
  divider:    '#F0F0F0',

  // Text
  textPrimary:   '#1A1A2E',
  textSecondary: '#6B7280',
  textLight:     '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnAccent:  '#FFFFFF',

  // Semantic
  success:  '#10B981',
  error:    '#EF4444',
  warning:  '#F59E0B',
  info:     '#3B82F6',

  // Status badges
  pending:  '#F59E0B',
  accepted: '#10B981',
  rejected: '#EF4444',
  cancelled:'#6B7280',
  completed:'#3B82F6',
} as const;
```

### Typography

```typescript
const Typography = {
  h1:     { fontSize: 28, fontWeight: '700' as const },
  h2:     { fontSize: 22, fontWeight: '600' as const },
  h3:     { fontSize: 18, fontWeight: '600' as const },
  body:   { fontSize: 16, fontWeight: '400' as const },
  bodyBold:{ fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small:   { fontSize: 11, fontWeight: '400' as const },
} as const;
```

### Spacing Scale (4px base)

```
xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48
```

### Border Radius

```
sm: 6, md: 10, lg: 16, full: 9999
```

---

## [PROJECT_STRUCTURE]

### Server (Backend)

```
server/
├── prisma/
│   └── schema.prisma
├── uploads/                    # Profile photos storage
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment variable loading + validation
│   │   └── firebase.ts         # Firebase Admin SDK init
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── doctor/
│   │   │   ├── doctor.routes.ts
│   │   │   ├── doctor.controller.ts
│   │   │   ├── doctor.service.ts
│   │   │   └── doctor.validation.ts
│   │   ├── patient/
│   │   │   ├── patient.routes.ts
│   │   │   ├── patient.controller.ts
│   │   │   ├── patient.service.ts
│   │   │   └── patient.validation.ts
│   │   ├── appointment/
│   │   │   ├── appointment.routes.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── appointment.validation.ts
│   │   ├── notification/
│   │   │   ├── notification.routes.ts
│   │   │   └── notification.service.ts
│   │   └── search/
│   │       ├── search.routes.ts
│   │       ├── search.controller.ts
│   │       └── search.service.ts
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   ├── cron/
│   │   │   └── appointment-reminder.ts
│   │   └── types/
│   │       └── index.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```

### Mobile (Frontend)

```
mobile/
├── android/
├── ios/
├── src/
│   ├── app/
│   │   └── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── PatientNavigator.tsx
│   │   ├── DoctorNavigator.tsx
│   │   └── types.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── RoleSelectionScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── RegisterScreen.tsx
│   │   │   └── components/
│   │   │       └── AuthForm.tsx
│   │   ├── patient/
│   │   │   ├── screens/
│   │   │   │   ├── PatientHomeScreen.tsx
│   │   │   │   ├── DoctorSearchScreen.tsx
│   │   │   │   ├── DoctorProfileScreen.tsx
│   │   │   │   ├── SlotSelectionScreen.tsx
│   │   │   │   └── MapScreen.tsx
│   │   │   └── components/
│   │   │       ├── DoctorCard.tsx
│   │   │       ├── SlotPicker.tsx
│   │   │       └── SearchBar.tsx
│   │   ├── doctor/
│   │   │   ├── screens/
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── TodayAppointmentsScreen.tsx
│   │   │   │   ├── StatisticsScreen.tsx
│   │   │   │   ├── WorkingDaysScreen.tsx
│   │   │   │   └── ClinicInfoScreen.tsx
│   │   │   └── components/
│   │   │       ├── StatsCard.tsx
│   │   │       ├── AppointmentRow.tsx
│   │   │       └── WorkingDayItem.tsx
│   │   ├── appointments/
│   │   │   ├── screens/
│   │   │   │   ├── AppointmentsListScreen.tsx
│   │   │   │   └── AppointmentDetailScreen.tsx
│   │   │   └── components/
│   │   │       ├── AppointmentCard.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── notifications/
│   │   │   └── screens/
│   │   │       └── NotificationsScreen.tsx
│   │   └── profile/
│   │       ├── screens/
│   │       │   ├── PatientProfileScreen.tsx
│   │       │   ├── DoctorProfileScreen.tsx
│   │       │   └── EditProfileScreen.tsx
│   │       └── components/
│   │           └── ProfileHeader.tsx
│   ├── services/
│   │   ├── api.ts               # Axios instance (baseURL, interceptors)
│   │   ├── auth.service.ts
│   │   ├── doctor.service.ts
│   │   ├── patient.service.ts
│   │   ├── appointment.service.ts
│   │   ├── search.service.ts
│   │   └── notification.service.ts
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── appointment.store.ts
│   │   └── notification.store.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── SafeMapView.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLanguage.ts
│   │   │   └── useApi.ts
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   ├── i18n/
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       ├── ar.json
│   │   │       └── fr.json
│   │   └── utils/
│   │       ├── storage.ts       # AsyncStorage wrapper
│   │       └── formatters.ts
│   └── config/
│       └── env.ts               # react-native-config
├── .env
├── app.json
├── package.json
├── tsconfig.json
└── babel.config.js
```

### Shared Types

```
shared/
└── types/
    ├── user.ts          # User, UserRole
    ├── patient.ts       # PatientProfile
    ├── doctor.ts        # DoctorProfile, Specialty
    ├── appointment.ts   # Appointment, AppointmentStatus, AvailableSlot
    ├── notification.ts  # Notification
    ├── working-day.ts   # WorkingDay
    ├── api.ts           # API response wrappers
    └── index.ts         # Re-exports
```

---

## [LOGGING_STRATEGY]

### Server-side — Pino (Async, Structured)

```typescript
// shared/utils/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  // Production: writes JSON to stdout (async, zero-blocking)
  // Development: pretty-prints with colors
});

export default logger;
```

**Rules:**
- Log levels: `error`, `warn`, `info` (no `debug` in production)
- All logs are structured JSON (machine-readable)
- Never log: passwords, tokens, PII
- Request logging via Express middleware (pino-http)

### Client-side — Console wrapper (lightweight)

```typescript
// Production: strip console.log via babel-plugin-transform-remove-console
// Only console.warn and console.error remain in release builds
```

---

## [MILESTONES]

### Milestone 1: Foundation
**Goal: Runnable skeleton with auth working end-to-end**

| Task | Verifiable |
|------|-----------|
| Monorepo setup (workspace, configs, .env) | `npm install` succeeds at root |
| PostgreSQL + Prisma schema + migrations | `npx prisma migrate dev` succeeds, all tables created |
| Backend: Express app + health check endpoint | `GET /api/v1/health` returns 200 |
| Backend: Auth (register + login + JWT) | Patient can register, both roles can login, get JWT |
| Frontend: RN project + navigation skeleton | App launches, role selection screen shows, navigation works |
| Frontend: Login + Register screens | Can register patient, login as both roles |
| Frontend: Auth state persistence (Zustand + AsyncStorage) | Closing/reopening app retains session |

**Exit criteria:** Fresh install → register → login → see empty home screen.

---

### Milestone 2: Patient Core
**Goal: Patient can find a doctor and book an appointment**

| Task | Verifiable |
|------|-----------|
| Seed specialties + test doctors | DB has at least 5 specialties and 10 doctors |
| Patient profile: view + edit | Can update name, city, etc. |
| Search doctors (by name, specialty, city) | Search returns correct results |
| View doctor profile (with working days + price) | All fields display correctly |
| View available slots by date | Slots shown for next 7 days |
| Book appointment | POST creates appointment with PENDING status |
| Cancel appointment (patient) | Status changes to CANCELLED |
| View appointment history | List shows past + upcoming appointments |

**Exit criteria:** Patient registers → searches → books → cancels → views history.

---

### Milestone 3: Doctor Core
**Goal: Doctor can manage profile, hours, and appointments**

| Task | Verifiable |
|------|-----------|
| Doctor profile: view + edit | Can update all profile fields |
| Upload profile picture | Photo uploads and displays |
| Set working days + hours | Working days saved, slots auto-generated |
| Open/Close clinic toggle | Status reflected in DB and patient search |
| View today's appointments | List shows today's bookings |
| Accept/Reject appointment | Status changes, patient notified |
| Cancel appointment (doctor) | Status changes, patient notified |
| Create manual appointment | Doctor can book for a patient directly |
| Statistics dashboard | Shows correct counts |

**Exit criteria:** Doctor logs in → sets up profile/hours → manages appointments → sees stats.

---

### Milestone 4: Maps + Search Enhancement
**Goal: Map view with nearby doctor markers**

| Task | Verifiable |
|------|-----------|
| Google Maps integration (react-native-maps) | Map renders on screen |
| Doctor location stored in profile | Lat/lng saved via PUT endpoint |
| Map screen: show doctor markers | Markers appear for doctors in area |
| Nearby doctor search (geospatial query) | Returns doctors within radius |
| Tap marker → doctor profile | Navigation works |

**Exit criteria:** Patient opens map → sees nearby doctors → taps to view profile.

---

### Milestone 5: Notifications
**Goal: Push notifications for all events + reminders**

| Task | Verifiable |
|------|-----------|
| Firebase project setup (FCM) | `google-services.json` / `GoogleService-Info.plist` configured |
| FCM token registration on login | Token saved to `fcm_tokens` table |
| Send push: new appointment → doctor | Doctor receives push notification |
| Send push: accept/reject → patient | Patient receives push notification |
| Send push: cancel → other party | Other party receives push |
| In-app notifications list | Notifications screen shows all |
| Mark as read / read-all | Badge count updates |
| Cron job: 24h appointment reminder | Patient receives reminder day before |

**Exit criteria:** Full notification lifecycle works end-to-end.

---

### Milestone 6: Internationalization + UI Polish
**Goal: Arabic RTL + English + French, production-quality UI**

| Task | Verifiable |
|------|-----------|
| i18n setup (i18next + react-native-localize) | Language switches at runtime |
| English translation file | All strings covered |
| Arabic translation file + RTL layout | App works in RTL, no layout breakage |
| French translation file | All strings covered |
| Language selection in profile/settings | Can switch language manually |
| Theme applied consistently | All screens use Amsterdam + Persian Green palette |
| Loading states (skeletons/spinners) | No blank screens during API calls |
| Error states + empty states | Meaningful messages shown |
| Form validation (client-side) | Rejects invalid input with clear messages |

**Exit criteria:** App fully functional in AR/EN/FR with polished UI.

---

### Milestone 7: Hardening + Deployment
**Goal: Production-ready, deployable**

| Task | Verifiable |
|------|-----------|
| Backend: input validation on all endpoints | Zod schemas reject malformed requests |
| Backend: error handling middleware | Structured error responses (no stack traces in prod) |
| Backend: rate limiting | Brute-force login blocked |
| Backend: CORS configured | Only mobile app can access API |
| Backend: environment variables validated on startup | App crashes with clear message if .env missing |
| Backend: CORS configured | Only mobile app can access API |
| Backend: env validated on startup | App crashes if required vars missing |
| Security audit | No secrets in code, no SQL injection, JWT expiry works |
| Performance: pagination on all list endpoints | No unbounded queries |
| Deployment: Docker or PM2 config | Backend runs as a service |
| App: release build (APK + IPA) | Installable on device |

**Exit criteria:** Backend deployed, app installable, full flow works on real device.

---

## [ORPHANS & PENDING]

### MVP Completed (All Milestones 1-3)
- [x] Monorepo setup + shared types
- [x] Server: Express 5.2.1 + Prisma 7.8.0 + all features
- [x] Server: Auth, Patient, Doctor, Appointment, Search, Notification
- [x] Server: Seed script (10 specialties, 5 doctors)
- [x] Mobile: RN 0.86 + Navigation + all screens
- [x] Mobile: Services, stores, theme, i18n (EN/AR/FR)
- [x] Mobile: Auth (role selection, login, register)
- [x] Mobile: Patient (home, search, profile, slots, map, appointments)
- [x] Mobile: Doctor (dashboard, appointments, profile, working days, clinic info, stats)
- [x] Mobile: Notifications screen

### Deferred Features (Post-MVP)
- [ ] Admin panel (for creating doctor accounts)
- [ ] Forgot password / password reset flow
- [ ] Doctor multi-specialty support (many-to-many)
- [ ] Per-week working schedule overrides
- [ ] Payment integration (Stripe, local payment)
- [ ] Cloud photo storage (S3 / Cloudinary migration)
- [ ] Offline mode / caching
- [ ] Video consultation
- [ ] Doctor reviews / ratings
- [ ] Patient medical records
- [ ] Multi-clinic support per doctor

### Bug Fixes Applied (2026-07-12)
- [x] Specialty click shows all doctors instead of filtered → `DoctorSearchScreen.tsx`: replaced stale `useCallback`/`useEffect` with direct `doSearch()` function + `useRef` guard; fixed `search.service.ts` params type to include `specialtyId`
- [x] Nearby doctors button crashes → `MapScreen.tsx`: replaced direct `react-native-maps` import with `SafeMapView` (try/catch + error boundary + fallback)
- [x] Doctor profile screen crashes → `DoctorProfileScreen.tsx`: replaced direct `react-native-maps` with `SafeMapView`; added API error state with retry
- [x] New shared component: `SafeMapView.tsx` — wraps `react-native-maps` with `MapErrorBoundary`, try/catch import, and graceful degradation

### Technical Debt Trackers
- [ ] Add integration tests (Jest + Supertest for backend)
- [ ] Add E2E tests (Detox for React Native)
- [ ] Set up CI/CD pipeline
- [ ] Add Sentry for error monitoring
- [ ] API documentation (Swagger/OpenAPI)

### Blockers / External Dependencies (Required for full functionality)
- [ ] PostgreSQL instance (local or hosted)
- [ ] Google Maps API key (for map screen)
- [ ] Firebase project + config files (for push notifications)
- [ ] Domain + SSL certificate for API
- [ ] Apple Developer Account (for iOS builds)
- [ ] Google Play Console Account (for Android builds)

---

## [CONVENTIONS]

### Git
- `main` — production
- `develop` — integration
- Feature branches: `feat/milestone-N-feature-name`
- Commits: `feat:`, `fix:`, `chore:`, `docs:`

### Code
- No comments unless explaining WHY (not WHAT)
- Components: PascalCase (`DoctorCard.tsx`)
- Services: camelCase + `.service.ts` suffix
- Types: PascalCase interfaces (`AppointmentStatus`)
- Routes: kebab-case (`/api/v1/doctor/working-days`)

### Backend Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": []
  }
}
```

### Backend Success Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

---

*This document is the single source of truth. Update it as decisions are made.*
