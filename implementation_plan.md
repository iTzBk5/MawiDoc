# MawiDOC Mobile App — Major Upgrade Plan

This plan covers 7 interconnected improvements to the MawiDOC mobile application: a complete UI redesign, logo integration, language settings, appointment calendar fix, specialty-to-doctors navigation fix, nearby doctors map fix, and doctor location on map.

## User Review Required

> [!IMPORTANT]
> **Logo file found at** `c:\Users\yassi\Documents\mawidoc\logo.jpg`. It will be copied into the mobile app's assets and used on the Role Selection (welcome) screen, Login screen headers, and the Profile screens.

> [!IMPORTANT]
> **Google Maps API Key**: The Nearby Doctors map and Doctor Profile map both use `react-native-maps`. The current key in [env.ts](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/config/env.ts) is `'YOUR_GOOGLE_MAPS_API_KEY'`. You will need to provide a real Google Maps API key for the map features to render correctly. Without it, the maps will show a blank gray area. Do you have a Google Maps API key, or would you like me to use the built-in Android emulator map (which works without a key)?

## Open Questions

> [!WARNING]
> **Appointment slot generation**: Currently, slots must exist in the `available_slots` database table before a patient can book. The doctor's seed data creates working days (Mon–Fri, 09:00–17:00) but does NOT auto-generate individual time slots. Should I:
> - **(A)** Add auto-generation of 30-minute slots when a doctor sets their working days? (Recommended)
> - **(B)** Keep manual slot creation by the doctor?

---

## Proposed Changes

### Component 1: UI Design System Overhaul

Complete visual redesign of the design system to make the app feel premium and modern. The logo colors (teal/dark navy) will drive the palette.

#### [MODIFY] [colors.ts](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/theme/colors.ts)
- Replace flat colors with a curated gradient-ready palette inspired by the logo (teal `#01A894` + dark navy `#07274D`)
- Add `gradientStart`, `gradientEnd`, `cardShadow`, `backdrop` colors
- Add semantic surface colors: `surfaceElevated`, `surfaceMuted`

#### [MODIFY] [typography.ts](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/theme/typography.ts)
- Add font family references (system fonts with proper weight mappings)
- Add `titleLarge`, `label`, `overline` styles for richer hierarchy

#### [MODIFY] [spacing.ts](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/theme/spacing.ts)
- Add `shadow` presets (card shadows, elevated shadows)

---

### Component 2: Shared Components Redesign

All 7 shared components will be redesigned to feel polished and modern.

#### [MODIFY] [Button.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/Button.tsx)
- Add shadow/elevation, rounded corners (16px), subtle press animation via `Animated`
- Add icon support (optional leading icon)

#### [MODIFY] [Card.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/Card.tsx)
- Add shadow elevation, larger border radius (16px), subtle border
- Support `variant` prop: `default`, `elevated`, `outlined`

#### [MODIFY] [Header.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/Header.tsx)
- Redesign with gradient background (primary → accent), white text, proper safe area padding
- Add optional subtitle and right-side action button

#### [MODIFY] [Input.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/Input.tsx)
- Floating label animation, focus border color transition, error state styling
- Larger touch targets (56px height)

#### [MODIFY] [Loading.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/Loading.tsx)
- Replace with a branded loading spinner using the accent color

#### [MODIFY] [EmptyState.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/EmptyState.tsx)
- Add illustration/icon, title + subtitle layout, optional action button

#### [MODIFY] [StatusBadge.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/components/StatusBadge.tsx)
- Pill-shaped badges with colored backgrounds + matching text

---

### Component 3: Logo Integration

#### [NEW] `mobile/src/assets/logo.jpg`
- Copy [logo.jpg](file:///c:/Users/yassi/Documents/mawidoc/logo.jpg) into the mobile assets folder

#### [MODIFY] [RoleSelectionScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/auth/screens/RoleSelectionScreen.tsx)
- Replace the emoji `🏥` with the actual logo `<Image>` component
- Redesign with gradient background, glassmorphism card for role buttons
- Add subtle entrance animation

#### [MODIFY] [LoginScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/auth/screens/LoginScreen.tsx)
- Add logo at the top of the login form (smaller size)
- Redesign with gradient header section + white form card below

---

### Component 4: Language Settings

#### [NEW] `mobile/src/features/profile/screens/SettingsScreen.tsx`
- New Settings screen with a Language selector section
- Three language options displayed as selectable cards: English 🇬🇧, Français 🇫🇷, العربية 🇩🇿
- Selecting a language calls `i18n.changeLanguage()` and saves the preference to `AsyncStorage`
- App restarts the navigation to apply RTL changes for Arabic

#### [MODIFY] [index.ts (i18n)](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/shared/i18n/index.ts)
- Change default language from device locale to English (`'en'`)
- On startup, check `AsyncStorage` for a saved language preference and apply it

#### [MODIFY] [PatientNavigator.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/navigation/PatientNavigator.tsx)
- Add a "Settings" tab (gear icon ⚙️) to the bottom tab bar, linking to `SettingsScreen`

#### [MODIFY] [DoctorNavigator.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/navigation/DoctorNavigator.tsx)
- Add a "Settings" tab (gear icon ⚙️) to the bottom tab bar, linking to `SettingsScreen`

#### [MODIFY] [PatientProfileScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/profile/screens/PatientProfileScreen.tsx)
- Move Logout button into the Settings screen instead
- Keep profile view clean with just profile info + Edit Profile

#### [MODIFY] [DoctorProfileScreen.tsx (profile)](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/profile/screens/DoctorProfileScreen.tsx)
- Same: move Logout into Settings

#### [MODIFY] [types.ts](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/navigation/types.ts)
- Add Settings screen to both Patient and Doctor tab param lists

---

### Component 5: Fix Appointment Booking (Calendar View)

The current slot selection is broken because there are no slots in the database, and the UI is a flat list with no calendar context.

#### [MODIFY] [SlotSelectionScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/patient/screens/SlotSelectionScreen.tsx)
- **Add a horizontal date picker** at the top (scrollable row of date pills for the next 14 days)
- When a date is selected, fetch slots for that specific date from the API
- Display time slots in a **grid layout** with color coding:
  - 🟥 **Red** = already booked (slot.isBooked === true) — disabled, not tappable
  - ⬜ **Gray/White** = available — tappable to select
  - 🟢 **Green border** = currently selected slot
- Add a "Confirm Booking" button at the bottom that only appears when a slot is selected

#### [MODIFY] [search.service.ts (mobile)](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/services/search.service.ts)
- Update `getDoctorSlots()` to pass the selected `date` parameter to the API

#### [NEW] `server/src/features/doctor/slotGenerator.ts`
- Utility function that auto-generates 30-minute slots for a doctor based on their working days
- Called when a doctor updates their working days
- Generates slots for the next 30 days (and can be re-run via cron)

#### [MODIFY] [doctor.service.ts (backend)](file:///c:/Users/yassi/Documents/mawidoc/server/src/features/doctor/doctor.service.ts)
- After `updateWorkingDays()`, call the slot generator to create available slots for the next 30 days
- Add a `getSlotsByDate()` method that returns slots for a specific doctor on a specific date, including `isBooked` status

---

### Component 6: Fix Specialty → Doctors Navigation

Currently, tapping a specialty on the Patient Home screen navigates to `DoctorSearch` without passing the specialty, so no doctors are shown.

#### [MODIFY] [PatientHomeScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/patient/screens/PatientHomeScreen.tsx)
- When a specialty card is tapped, navigate to `DoctorSearch` and pass `{ specialtyId: item.id, specialtyName: item.name }` as route params
- Redesign the specialty grid: 2-column grid with icon, name, and Arabic name
- Add a gradient welcome banner at the top with the user's name

#### [MODIFY] [DoctorSearchScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/patient/screens/DoctorSearchScreen.tsx)
- Accept optional `specialtyId` from route params
- If `specialtyId` is provided, auto-load doctors for that specialty on mount (no need to type and search)
- Add filter chips at the top (by specialty, by city)
- Redesign doctor cards with avatar placeholder, rating stars, price badge

#### [MODIFY] [types.ts](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/navigation/types.ts)
- Update `DoctorSearch` route params to accept optional `{ specialtyId?: string; specialtyName?: string }`

#### [MODIFY] [search.service.ts (mobile)](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/services/search.service.ts)
- Update `searchDoctors()` to support `specialtyId` as a filter parameter

#### [MODIFY] [search.service.ts (backend)](file:///c:/Users/yassi/Documents/mawidoc/server/src/features/search/search.service.ts)
- Add `specialtyId` filter support to `searchDoctors()` query (currently only supports `specialty` name text search)

---

### Component 7: Fix Nearby Doctors Map + Doctor Profile Map

#### [MODIFY] [MapScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/patient/screens/MapScreen.tsx)
- Use the device's actual GPS location instead of hardcoded Algiers coordinates
- Add loading state while getting location
- Show the user's own location as a blue dot marker
- Show doctor markers with custom callouts (name, specialty, price)
- Add a "Recenter" floating button

#### [MODIFY] [DoctorProfileScreen.tsx (patient view)](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/patient/screens/DoctorProfileScreen.tsx)
- Add a mini-map section (200px height) showing the doctor's exact location with a pin
- Tapping the map opens it fullscreen
- Redesign the entire profile page: hero header with gradient, info cards with icons

#### [MODIFY] [ClinicInfoScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/doctor/screens/ClinicInfoScreen.tsx)
- Add a "Set Location on Map" button
- Opens a fullscreen map where the doctor can long-press to drop a pin
- The selected coordinates are saved to the doctor's profile via the existing `PUT /doctor/location` endpoint

---

### Component 8: Screen-by-Screen UI Polish

All remaining screens get a visual refresh to match the new design system.

#### [MODIFY] [DashboardScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/doctor/screens/DashboardScreen.tsx)
- Gradient header with greeting, stat cards with shadows and icons

#### [MODIFY] [AppointmentsListScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/appointments/screens/AppointmentsListScreen.tsx)
- Tab-based filtering (Upcoming / Past / All), appointment cards with status badges

#### [MODIFY] [AppointmentDetailScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/appointments/screens/AppointmentDetailScreen.tsx)
- Clean detail layout with status timeline, action buttons with confirmation dialogs

#### [MODIFY] [RegisterScreen.tsx](file:///c:/Users/yassi/Documents/mawidoc/mobile/src/features/auth/screens/RegisterScreen.tsx)
- Match login screen design: gradient header + form card

#### [MODIFY] Remaining doctor screens (`TodayAppointmentsScreen`, `StatisticsScreen`, `WorkingDaysScreen`)
- Apply new card styles, shadows, and color scheme consistently

---

## Verification Plan

### Manual Verification
1. **UI**: Launch the app on the emulator and visually verify every screen looks polished
2. **Logo**: Confirm the logo appears on the Role Selection and Login screens
3. **Language**: Go to Settings → change to Arabic → verify RTL layout; change to French → verify French text; change back to English
4. **Appointments**: As a patient, select a doctor → see the calendar date picker → see red (booked) vs gray (available) slots → book a slot → verify it appears as booked
5. **Specialties**: Tap a specialty on the home screen → verify doctors of that specialty are listed
6. **Nearby Doctors**: Tap "Nearby Doctors" → verify the map loads with doctor pins
7. **Doctor Map**: View a doctor's profile → verify the mini-map shows their location
8. **Doctor Location Setting**: As a doctor, go to Clinic Info → tap "Set Location" → drop a pin on the map → save → verify coordinates are stored in the database

### Automated Tests
- `npx tsx tmp_query.ts` — verify patient/doctor data integrity after changes
- Health check: `curl http://localhost:3000/api/v1/health`
