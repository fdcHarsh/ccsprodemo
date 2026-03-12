# CCS Pro — Complete Frontend Demo Documentation

> **Version**: MVP Demo (March 2026)
> **Published URL**: https://tx-credential-coach.lovable.app
> **Stack**: React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Lovable Cloud (Supabase)

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Part 1 — Provider Experience](#2-part-1--provider-experience)
3. [Part 2 — Group Admin Experience](#3-part-2--group-admin-experience)
4. [Part 3 — Shared / Overlapping Systems](#4-part-3--shared--overlapping-systems)
5. [Data Models & Mock Data](#5-data-models--mock-data)
6. [Technical Architecture](#6-technical-architecture)
7. [Design System](#7-design-system)
8. [Known Limitations & Roadmap](#8-known-limitations--roadmap)

---

## 1. Application Overview

CCS Pro is a healthcare provider credentialing platform designed for the Texas market. It serves two distinct user roles:

| Role | Demo User | Description |
|------|-----------|-------------|
| **Provider** | Dr. Sarah Chen, MD — Family Medicine | Individual provider managing their own credentials, documents, and payer applications |
| **Group Admin** | Maria Gonzalez — Austin Regional Medical Group | Practice manager overseeing credentialing for a roster of 9 providers |

### Entry Point & Authentication

- **Password Gate**: Preview access requires a server-validated password (Edge Function `verify-preview-password`). Password persists in `sessionStorage` for the browser tab session.
- **Login Page** (`/login`): No email/password — two demo cards let the user pick a role:
  - "Dr. Sarah Chen" → Provider dashboard (`/dashboard`)
  - "Maria Gonzalez" → Group admin dashboard (`/group/dashboard`)
- **Auth State**: Stored in `localStorage` via `AuthContext`. Keys: `credflow_user`, `credflow_role`.
- **Protected Routes**: `ProtectedRoute` component checks `isAuthenticated` and `requiredRole`. Wrong-role users are redirected to their own dashboard.

### Application Shell

Both roles share:
- A collapsible left sidebar (expanded 256 px / collapsed 80 px)
- A fixed top navigation bar with dark-mode toggle, notification bell, and user menu
- Content area with page-level route rendering via `<Outlet />`

---

## 2. Part 1 — Provider Experience

### 2.1 Sidebar Navigation (AppSidebar)

| Route | Icon | Label |
|-------|------|-------|
| `/dashboard` | LayoutDashboard | Dashboard |
| `/documents` | FolderOpen | Document Vault |
| `/credentials` | ClipboardList | Credential Tracker |
| `/calendar` | CalendarDays | Expiration Calendar |
| `/my-groups` | Users | My Groups |
| `/notifications` | Bell | Notifications (badge) |
| `/profile` | UserCircle | Profile Builder |
| `/packet` | Package | Create Packet |
| `/caqh` | ShieldCheck | CAQH Manager |
| `/settings` | Settings | Settings |

### 2.2 Dashboard (`/dashboard`)

The provider's home page, assembled from multiple sub-components:

#### Onboarding Journey (`OnboardingJourney`)
A step-by-step checklist guiding new providers through setup:
1. Upload documents to vault
2. Complete provider profile (LHL234)
3. Verify CAQH status
4. Generate first credentialing packet

#### Profile Completion Card (`ProfileCompletionCard`)
- Shows overall completion percentage (mock: 78%)
- Bar chart of per-section progress across 11 LHL234 sections
- Direct link to Profile Builder

#### Payer Readiness Card
- Status for each insurance payer (readiness percentage)
- Visual indicators for document-to-requirement mapping
- Links to Texas Payers page

#### Actionable Insights (`ActionableInsights`)
- Personalized recommendations and alerts
- Expiring credential warnings
- CAQH re-attestation reminders

#### CAQH Re-Attestation Alert (`CAQHReattestationAlert`)
- Time-sensitive notification for upcoming CAQH attestation deadlines
- Direct link to CAQH Manager

#### Additional Sections
- **Group Memberships**: Shows groups the provider belongs to (from `providerGroupMemberships`)
- **Packet History**: Recent packet generation activity (from `packetHistory`)

### 2.3 Document Vault (`/documents`)

Full document management system:
- **Upload**: File upload with categorization
- **Categories**: Licenses, Certifications, Insurance, Education, CME, Immunizations
- **Status Tracking**: Automatic status based on expiration dates:
  - **Current**: > 90 days until expiration
  - **Expiring**: 30–90 days
  - **Urgent**: < 30 days
  - **Expired**: Past expiration date
- **Bulk Operations**: Select multiple, export, delete
- **Search & Filter**: By category, status, name
- **Integration**: Documents feed into payer checklists and packet generator

### 2.4 Credential Tracker (`/credentials`)

Credential lifecycle management:
- **Types**: License, Certification, Insurance, Profile, Education
- **Expiration Monitoring**: Visual dashboard with status badges
- **Renewal Tracking**: `RenewalDialog` component with renewal links per credential
- **Portfolio Export**: `PortfolioExport` component for bulk credential download
- **Statistics**: Summary cards showing total, current, expiring, urgent counts

### 2.5 Expiration Calendar (`/calendar`)

Interactive calendar view:
- Monthly grid with event markers for credential/document expirations
- Color-coded by status (current/expiring/urgent)
- Combines data from credentials and documents contexts
- Month navigation with today highlight

### 2.6 Profile Builder (`/profile`)

**Core Feature**: LHL234 Texas Standardized Credentialing Application

11 sections, each rendered as its own component in `src/components/profile-builder/`:

| # | Section | Component | Key Fields |
|---|---------|-----------|------------|
| 1 | Individual Information | `IndividualInfoSection` | Name, DOB, SSN, contact, demographics |
| 2 | Education | `EducationSection` | Medical school, residency, fellowship |
| 3 | Licenses | `LicensesSection` | State license, DEA, NPI, provider numbers |
| 4 | Specialty Information | `SpecialtySection` | Board certifications, practice focus |
| 5 | Work History | `WorkHistorySection` | Current and previous employment |
| 6 | Hospital Affiliations | `HospitalAffiliationsSection` | Privileges and appointments |
| 7 | References | `ReferencesSection` | Professional references (min. 3) |
| 8 | Liability Insurance | `LiabilityInsuranceSection` | Malpractice coverage |
| 9 | Call Coverage | `CallCoverageSection` | On-call arrangements |
| 10 | Practice Locations | `PracticeLocationsSection` | Office details, hours |
| 11 | Disclosures | `DisclosuresSection` | 23 yes/no legal disclosure questions |

**Technical Details**:
- Data type: `LHL234Profile` (`src/types/lhl234Profile.ts`)
- Hook: `useLHL234Profile` — auto-save to `localStorage` with 500 ms debounce
- Real-time completion % calculation per section
- Wizard-style UI with section navigation

### 2.7 Create Packet (`/packet`)

**Three generation modes**:

| Mode | Description | Output |
|------|-------------|--------|
| **TSCA Packet** | Full Texas Standardized Credentialing Application package | ZIP (LHL234 PDF + all vault documents) |
| **Custom Packet** | Manually select which documents to include | ZIP (selected documents) |
| **Single LHL234 PDF** | Just the credentialing form, signed or unsigned | Single PDF |

**Workflow** (TSCA/Custom):
1. Select mode → 2. Review provider info → 3. E-signature capture (react-signature-canvas) → 4. Pre-flight check → 5. Generate & download

**Pre-flight Check** (`PreFlightCheckDialog`):
- Animated sequential validation of: Profile %, License, DEA, Malpractice, CAQH
- Status per check: Pass (green) / Warn (amber) / Fail (red) / Info (gray)
- If all pass → "Generate" button; if any warn/fail → "Generate Anyway"
- On success: shows included documents list, "Send to Group" selector, download button

**Credits System** (`CreditsContext`):
- Each packet costs 1 credit ($69)
- Credit balance tracked in context
- Purchase dialog for buying more credits

### 2.8 CAQH Manager (`/caqh`)

Dedicated CAQH attestation management:
- Attestation status tracking and history
- Renewal workflow with checklist
- Document verification
- Re-attestation countdown timer
- Upload prompts for CAQH-specific documents
- External link to CAQH ProView

### 2.9 My Groups (`/my-groups`)

Provider-side group membership management:
- View groups the provider belongs to
- **Consent management**: Grant / Revoke / Decline group access to profile
- Status: Active, Pending Consent, Revoked
- Mock data: Austin Regional Medical Group, Bexar County Health Network, Central Texas PCA

### 2.10 Notifications (`/notifications`)

Centralized notification center:
- **Types**: Group, CAQH, Document, Credential
- **Tabs**: All, Unread, Groups, Documents, CAQH
- **Actions**: "Mark all as read" clears unread badge across entire app
- **State**: Managed by `NotificationsContext` (shared with TopNav badge)
- **Per-notification**: Icon, title, message, timestamp, optional action button with route

### 2.11 Settings (`/settings`)

Account preferences:
- Notification preferences (toggles for email types)
- Account information display
- Danger zone: Delete account (with "DELETE" confirmation)

---

## 3. Part 2 — Group Admin Experience

### 3.1 Sidebar Navigation (GroupSidebar)

| Route | Icon | Label |
|-------|------|-------|
| `/group/dashboard` | LayoutDashboard | Dashboard |
| `/group/providers` | Users | Provider Roster |
| `/group/payer-workflows` | Briefcase | Payer Workflows |
| `/group/compliance` | Shield | Compliance |
| `/group/packets` | FileText | Packet Generation |
| `/group/settings` | Settings | Settings |

Bottom: User card (Maria Gonzalez / Austin Regional Medical Group) + Logout

### 3.2 Top Nav (GroupTopNav)

- Group name and subtitle ("Group Admin Dashboard")
- Dark mode toggle
- Notification bell with "Needs Attention" count badge (from `needsAttentionItems`)
- Dropdown shows top 3 urgent items with actions
- User avatar dropdown with settings and logout

### 3.3 Group Dashboard (`/group/dashboard`)

Overview metrics and actionable items:

#### KPI Cards
| Metric | Value | Source |
|--------|-------|--------|
| Total Providers | 9 | `rosterProviders.length` |
| Compliance Score | 71% | `GROUP_INFO.complianceScore` |
| Expiring Credentials | 3 | Hardcoded demo |
| Packets This Month | 7 | Hardcoded demo |

#### Needs Attention Panel
- Top 5 urgent provider issues (from `needsAttentionItems`)
- Each item: provider name, issue description, priority badge, action button
- Actions route to Provider Roster page

#### Payer Pipeline Summary
- Per-payer progress bars showing credentialed / in-progress / not-started counts
- 5 payers: BCBSTX, UnitedHealthcare, Aetna, Humana, Texas Medicaid
- Color-coded payer badges

#### Recent Activity Feed
- Chronological list of recent group actions (from `recentActivityFeed`)
- Entries: packet generation, document requests, roster additions, credentialing approvals

#### Invite Provider Button
- Opens `InviteProviderDialog` for adding new providers to the roster

### 3.4 Provider Roster (`/group/providers`)

Searchable, filterable provider table:

#### Table Columns
| Column | Data |
|--------|------|
| Provider | Name, credentials, specialty |
| Profile % | Progress bar + percentage |
| CAQH | Status badge (Active/Inactive/Pending) with tooltip |
| License | Status badge with days-left |
| Malpractice | Status badge with days-left |
| Packet Ready | Yes (green) / No (red) |
| Actions | Eye (detail) · Send (request) · FileText (packet) |

#### Filters
- Search by name/specialty
- Filter: All Providers, Packet Ready, Needs Attention, Expiring Credentials

#### Provider Detail Drawer (Sheet)
Opens from the Eye icon, 4 tabs:
1. **Overview**: NPI, CAQH ID, email, phone, practice location, profile %, group, last updated
2. **Documents**: List of provider documents with status badges, "Request Document" button
3. **Credentials**: License, malpractice, CAQH status with color-coded cards
4. **Payers**: Per-payer credentialing status

#### Actions
- **Request Document**: Opens dialog with message textarea → sends request (toast)
- **Generate Packet**: Opens Pre-flight Check dialog with provider-specific data
- **Invite Provider**: Opens `InviteProviderDialog`

### 3.5 Payer Workflows (`/group/payer-workflows`)

Track credentialing status across all providers per payer:

#### Per-Payer Card
- Payer name with color-coded icon
- Progress: X / 9 credentialed, Y in progress
- Expandable detail view

#### Expanded Provider Table
| Column | Data |
|--------|------|
| Provider | Name, credentials, specialty |
| Status | Credentialed / In Progress / Not Started (badge) |
| Actions | Status dropdown (update) + Packet button |

- Status updates trigger toast notifications
- Packet button opens Pre-flight Check with provider-specific data
- Data sourced from `payerPipelineData` in mock data

### 3.6 Compliance (`/group/compliance`)

Roster-wide compliance monitoring:

#### Compliance Score Card
- Overall score: 71%
- **Dynamic Donut Chart** computed from actual roster data:
  - Fully Compliant: Providers with all statuses "current" + profile ≥ 90% + CAQH Active
  - Attention Needed: Providers with "expiring" statuses or profile 70–89%
  - Action Required: Providers with "urgent"/"expired" statuses, CAQH Inactive, or profile < 70%
- Legend with provider counts per category

#### Expiry Timeline Chart
- Scatter plot showing credential expirations across next 180 days
- X-axis: days from now, Y-axis: provider name
- Tooltip: provider full name + credential type + days remaining

#### Missing / Incomplete Items Table
| Column | Data |
|--------|------|
| Provider | Name |
| Issue | Description of compliance gap |
| Priority | High (red) / Medium (gray) / Low (outline) badge |
| Days Until Impact | Number or "—" |
| Action | Button opening notification dialog |

#### Compliance Action Notification Dialog
Triggered by clicking any action button in the compliance table:
- **Issue Summary**: Provider name, issue description, priority badge
- **Notification Method** (radio): Email Notification / In-App Notification
- **Message Template**: Auto-generated based on issue type:
  - Expiring documents → renewal request template
  - CAQH inactive → reactivation request template
  - Profile incomplete → completion request template
  - Generic fallback for other issues
- Editable textarea for customization
- Send button (mock → success toast)

#### Document Collection Requests
- Active outbound requests to providers
- Per request: provider name, message, sent date, status
- "Send Reminder" button per request

### 3.7 Packet Generation (`/group/packets`)

Generate credentialing packets for providers:

#### Single Provider Packet
1. Select provider (dropdown, disabled if not packet-ready)
2. Select payer (5 group payers + Custom)
3. "Run Pre-Flight Check" → opens `PreFlightCheckDialog` with selected provider's data
4. On success: download button + "Mark as submitted" toggle

#### Bulk Packet Generation
1. Checkbox selection of packet-ready providers
2. Select payer
3. "Generate Packets for Selected Providers" → sequential generation with loading
4. On success: "Download All" button

### 3.8 Group Settings (`/group/settings`)

Organization management:

#### Group Profile
- Editable: Group name, NPI, address, phone, primary contact
- Save button

#### Billing & Plan
- Current plan: Group Pro
- Renewal date display
- Provider slots: usage / included count

#### Notification Preferences
- Toggles: Expiring credential alerts, document request updates, weekly summary

#### Team Management
- Table of admin team members (mock: Maria Gonzalez, David Kim)
- Roles and email display
- "Invite Admin" button (opens InviteProviderDialog)

---

## 4. Part 3 — Shared / Overlapping Systems

### 4.1 Authentication (`AuthContext`)

| Feature | Detail |
|---------|--------|
| Storage | `localStorage` (keys: `credflow_user`, `credflow_role`) |
| Roles | `'provider'` or `'group_admin'` |
| Demo Users | `providerUser` (Dr. Sarah Chen) / `groupAdminUser` (Maria Gonzalez) |
| Methods | `loginAsProvider()`, `loginAsGroupAdmin()`, `logout()` |
| Route Protection | `ProtectedRoute` component with `requiredRole` prop |

### 4.2 Password Gate (`PasswordGate`)

- Wraps entire application
- Validates password via Supabase Edge Function (`verify-preview-password`)
- Uses `sessionStorage` key `preview_access` for persistence
- Renders CCS logo + password input form

### 4.3 Design System & Theming

#### Color Tokens (HSL in `index.css`)
| Token | Light Mode | Purpose |
|-------|-----------|---------|
| `--primary` | 216 63% 33% (Deep Blue) | Buttons, links, accents |
| `--secondary` | 209 50% 36% | Secondary elements |
| `--accent` | 199 89% 48% | Highlights, sky blue |
| `--success` | 142 76% 36% | Current/pass states |
| `--warning` | 38 92% 50% | Expiring/attention states |
| `--destructive` | 0 84% 60% | Urgent/error states |

#### Dark Mode
- Toggle in TopNav persists to `localStorage` key `theme`
- `document.documentElement.classList.toggle('dark')`
- Full dark token set in `index.css` under `.dark`

#### Custom Utility Classes
- `.gradient-primary`, `.gradient-accent`, `.gradient-hero` — background gradients
- `.status-badge`, `.status-current`, `.status-expiring`, `.status-urgent`, `.status-expired` — status indicators
- `.nav-link`, `.nav-link-active`, `.nav-link-inactive` — navigation links
- `.glass-card`, `.card-hover`, `.btn-primary-gradient` — card and button effects
- `.animate-slide-up` — page entry animation

### 4.4 Shared UI Components

| Component | Purpose | Used By |
|-----------|---------|---------|
| `PreFlightCheckDialog` | Pre-flight validation before packet generation | Provider Packet, Group Providers, Group Packets, Group Payer Workflows |
| `InviteProviderDialog` | Invite new provider to group | Group Dashboard, Group Providers, Group Settings |
| `CredentialingTooltip` | Hover tooltips for credentialing terms (CAQH, NPI, DEA, PECOS, LHL234, TSCA, Pre-flight Check, Credentialing Packet) | Various pages |
| `EmptyState` | Placeholder for empty lists/tables | Multiple pages |
| `SidebarNavLink` | Navigation link with active state | Both sidebars |

### 4.5 Pre-Flight Check System

The `PreFlightCheckDialog` component is shared across provider and group admin views:

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `open` | boolean | Dialog visibility |
| `onOpenChange` | function | Toggle callback |
| `packetName` | string | Display name for the packet |
| `documents` | string[] | List of document names to include |
| `onComplete` | function | Called when generation succeeds |
| `missingDisclosureAttachments` | DisclosureQuestion[] | Disclosure warnings (provider only) |
| `providerData` | ProviderPreFlightData | Dynamic provider data for status computation |

**ProviderPreFlightData shape**:
```typescript
{
  profileCompletion: number;
  licenseStatus: string;       // 'current' | 'expiring' | 'urgent'
  licenseDaysLeft?: number;
  malpracticeStatus: string;
  malpracticeDaysLeft?: number;
  caqhStatus: string;          // 'Active' | 'Pending' | 'Inactive'
  hasDEA?: boolean;
  deaStatus?: string;
  deaDaysLeft?: number;
}
```

**Behavior**:
- When `providerData` is provided: dynamically computes check statuses based on actual data
- When omitted: falls back to hardcoded defaults (78% profile, etc.)
- Animated sequential check execution (600 ms per check)
- Button text: "Generate" if all pass, "Generate Anyway" if any warn/fail

### 4.6 Context Providers

All contexts wrap the app in `App.tsx`:

```
PasswordGate
  └─ QueryClientProvider
       └─ AuthProvider
            └─ DocumentsProvider
                 └─ CredentialsProvider
                      └─ CreditsProvider
                           └─ PayersProvider
                                └─ NotificationsProvider
                                     └─ UIProvider
                                          └─ TooltipProvider
                                               └─ BrowserRouter
```

| Context | File | Purpose |
|---------|------|---------|
| `AuthContext` | `src/contexts/AuthContext.tsx` | User state, login/logout, role |
| `DocumentsContext` | `src/contexts/DocumentsContext.tsx` | Document CRUD, status tracking |
| `CredentialsContext` | `src/contexts/CredentialsContext.tsx` | Credential management, statistics |
| `CreditsContext` | `src/contexts/CreditsContext.tsx` | Packet generation credit balance |
| `PayersContext` | `src/contexts/PayersContext.tsx` | Payer requirements and checklists |
| `NotificationsContext` | `src/contexts/NotificationsContext.tsx` | Shared notification state, unread count |
| `UIContext` | `src/contexts/UIContext.tsx` | Sidebar state, CAQH status, CME data |

### 4.7 Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useLHL234Profile` | `src/hooks/useLHL234Profile.ts` | Profile CRUD, auto-save (500 ms debounce), completion % |
| `useDynamicChecklists` | `src/hooks/useDynamicChecklists.ts` | Map documents to payer requirements dynamically |
| `useDebounce` | `src/hooks/useDebounce.ts` | Generic debounce utility |
| `useMobile` | `src/hooks/use-mobile.tsx` | Responsive breakpoint detection |
| `useToast` | `src/hooks/use-toast.ts` | Toast notification management |

### 4.8 Notifications System

**Provider**: `NotificationsContext` manages shared state between `TopNav` badge and `NotificationsPage`.
- Initialized from `providerNotifications` mock data
- `markAllRead()` clears all unread flags → badge updates reactively
- Notification types: group, caqh, document, credential

**Group Admin**: `GroupTopNav` shows `needsAttentionItems.length` as badge count (separate from notification system — represents active compliance issues, not read/unread notifications).

---

## 5. Data Models & Mock Data

### 5.1 Core Types (`src/lib/mockData.ts`)

```typescript
User         // id, name, email, providerType, specialty, practiceLocation, npiNumber, deaNumber, role
Document     // id, name, category, uploadDate, expirationDate, status, fileType, fileSize
Credential   // id, name, type, issueDate, expirationDate, issuingOrganization, status, daysLeft
Payer        // id, name, status, recredentialingDate, progress
CMECourse    // id, name, provider, completionDate, credits, category, certificateUploaded
```

### 5.2 Group/Roster Types

```typescript
RosterProvider       // Full provider profile for group roster (id, name, credentials, specialty, npi,
                     // caqhId, email, phone, practiceLocation, profileCompletion, caqhStatus,
                     // licenseStatus, licenseDaysLeft, malpracticeStatus, malpracticeDaysLeft,
                     // packetReady, packetNotReadyReason, needsAttention, lastUpdated,
                     // payerStatuses, documents[])

NeedsAttentionItem   // providerId, providerName, issue, daysUntilImpact, priority, actionType
DocumentCollectionRequest  // id, providerId, providerName, message, sentDate, status
GroupMembership      // id, groupName, role, dateJoined, consentStatus
PacketHistoryItem    // id, packetName, payer, generatedDate, status
Notification         // id, title, message, type, read, timeAgo, actionLabel, actionRoute
ActivityFeedItem     // id, description, timeAgo
PayerCredentialingStatus  // 'Credentialed' | 'In Progress' | 'Not Started'
```

### 5.3 Mock Roster (9 Providers)

| # | Provider | Profile % | CAQH | License | Malpractice | Packet Ready |
|---|----------|-----------|------|---------|-------------|--------------|
| 1 | Dr. Sarah Chen, MD | 78% | Active | Current (174d) | Current (306d) | No — Profile < 90% |
| 2 | Dr. James Patel, MD | 95% | Active | Current (240d) | Urgent (11d) | No — Malpractice expiring |
| 3 | Dr. Linda Torres, DO | 100% | Active | Current (310d) | Current (290d) | ✅ Yes |
| 4 | Dr. Kevin Morris, MD | 62% | Inactive | Current (200d) | Current (250d) | No — CAQH inactive + low profile |
| 5 | Dr. Aisha Okonkwo, MD | 91% | Active | Urgent (34d) | Current (270d) | No — License expiring |
| 6 | Dr. Marcus Williams, DO | 100% | Active | Current (380d) | Current (320d) | ✅ Yes |
| 7 | Dr. Rachel Kim, MD | 85% | Active | Current (290d) | Current (260d) | ✅ Yes |
| 8 | Dr. Carlos Mendez, MD | 100% | Active | Current (400d) | Current (350d) | ✅ Yes |
| 9 | NP Jennifer Hayes, NP-C | 70% | Pending | Current (220d) | Current (200d) | No — CAQH not set up |

### 5.4 Payer Pipeline Data

5 payers with per-provider credentialing status (Credentialed / In Progress / Not Started):
- **BCBSTX**: 3 credentialed (Torres, Williams, Mendez), 2 in progress
- **UnitedHealthcare**: 2 credentialed, 2 in progress
- **Aetna**: 2 credentialed, 1 in progress
- **Humana**: 3 credentialed, 0 in progress
- **Texas Medicaid**: 2 credentialed, 1 in progress

### 5.5 Compliance Issues (8 items)

Ranging from High priority (malpractice expiring in 11 days) to Low priority (profile at 85%).

### 5.6 LHL234 Profile Type (`src/types/lhl234Profile.ts`)

Central data model with 11 sections, each containing nested interfaces for structured provider data. Used by Profile Builder, Packet Generator, and Dashboard.

---

## 6. Technical Architecture

### 6.1 Routing Structure

```
/                          → Login (or redirect if authenticated)
/login                     → Login page
/signup                    → Signup page

── Provider Routes (DashboardLayout) ──
/dashboard                 → DashboardPage
/documents                 → DocumentVaultPage
/credentials               → CredentialTrackerPage
/profile                   → ProfileBuilderPage
/packet                    → PacketGeneratorPage
/caqh                      → CAQHManagerPage
/calendar                  → ExpirationCalendarPage
/settings                  → SettingsPage
/my-groups                 → MyGroupsPage
/notifications             → NotificationsPage

── Group Admin Routes (GroupDashboardLayout) ──
/group/dashboard           → GroupDashboardPage
/group/providers           → GroupProvidersPage
/group/payer-workflows     → GroupPayerWorkflowsPage
/group/compliance          → GroupCompliancePage
/group/packets             → GroupPacketGeneratorPage
/group/settings            → GroupSettingsPage

/*                         → NotFound (404)
```

### 6.2 Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| react | 18.3.1 | UI framework |
| react-router-dom | 6.30.1 | Client-side routing |
| @tanstack/react-query | 5.83.0 | Server state (ready for API integration) |
| react-hook-form + zod | 7.61.1 / 3.25.76 | Form management + validation |
| recharts | 2.15.4 | Charts (pie, scatter, bar) |
| jspdf | 4.1.0 | PDF generation |
| pdf-lib | 1.17.1 | PDF manipulation |
| jszip | 3.10.1 | ZIP file creation |
| react-signature-canvas | 1.1.0-alpha.2 | E-signature capture |
| sonner | 1.7.4 | Toast notifications |
| date-fns | 3.6.0 | Date formatting/calculation |
| lucide-react | 0.462.0 | Icons |

### 6.3 Backend (Lovable Cloud / Supabase)

- **Project ID**: `rmytqorrsrcthnrecvoh`
- **Edge Functions**: `verify-preview-password` (password gate validation)
- **Database**: Empty schema (tables not yet created)
- **Current data persistence**: `localStorage` only (mock data)

### 6.4 PDF Generation Pipeline

1. Provider data extracted from `useLHL234Profile` hook
2. `generateLHL234PDF` creates structured PDF with profile data
3. E-signature embedded via `react-signature-canvas`
4. Cover sheet generated with provider info + document list
5. Documents compiled into ZIP via `jszip`
6. Download triggered via browser blob URL

---

## 7. Design System

### 7.1 Typography
- **Font**: Inter (Google Fonts), weights 300–800
- **Headings**: `text-2xl font-bold` (page titles), `text-lg` (card titles)
- **Body**: `text-sm` (default), `text-xs` (captions, badges)

### 7.2 Component Library
Built on shadcn/ui with Radix UI primitives. Key components:
- Dialog, Sheet, AlertDialog — modals and drawers
- Table — data display
- Tabs — content organization
- Select, Input, Textarea, Checkbox, RadioGroup, Switch — form controls
- Card — content containers
- Badge — status indicators
- Progress — completion bars
- Tooltip — contextual help
- DropdownMenu — action menus

### 7.3 Animation
- Page transitions: `.animate-slide-up` (CSS keyframe)
- Pre-flight checks: Sequential reveal with spinner → icon transition
- Card hover: `.card-hover` (subtle lift + shadow)

---

## 8. Known Limitations & Roadmap

### Current Limitations
| Area | Current State | Target State |
|------|--------------|-------------|
| Data persistence | localStorage only | Supabase PostgreSQL |
| Authentication | Mock (localStorage) | Supabase Auth with email/password |
| File storage | No actual uploads | Supabase Storage |
| Notifications | In-memory only | Persistent, push-capable |
| Credits/billing | Mock counter | Stripe integration |
| CAQH integration | Mock status | API connection to CAQH ProView |

### Planned Improvements
1. Database schema migration for all data models
2. Real authentication with RLS policies
3. File upload to Supabase Storage
4. Email notifications for expirations
5. Mobile-responsive optimization
6. WCAG accessibility compliance
7. Comprehensive test coverage
8. API integrations (CAQH, state licensing boards)
