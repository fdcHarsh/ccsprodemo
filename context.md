# CCS Pro - Healthcare Provider Credentialing Platform

## Project Overview

CCS Pro is a comprehensive healthcare provider credentialing platform designed to streamline the complex process of medical credentialing for healthcare providers in Texas. The application provides a complete solution for managing credentials, documents, payer requirements, and generating credentialing packets.

### Core Value Proposition
- **Primary User Journey**: Upload documents → Fill out provider profile → Select documents → Generate credential packet → Download PDF
- **Target Users**: Healthcare providers (physicians, nurses, etc.) seeking credentialing with Texas insurance payers
- **Problem Solved**: Simplifies and organizes the traditionally complex, paper-intensive credentialing process

## Technical Architecture

### Technology Stack
- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **UI Components**: shadcn/ui with Radix UI primitives
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Context API (domain-specific contexts)
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76 validation
- **Backend**: Lovable Cloud (Supabase) with PostgreSQL
- **Authentication**: Supabase Auth (currently mock implementation with localStorage)
- **File Storage**: Supabase Storage
- **PDF Generation**: jsPDF 4.1.0 + pdf-lib 1.17.1
- **Charts**: Recharts 2.15.4
- **Notifications**: Sonner 1.7.4
- **Icons**: Lucide React 0.462.0
- **Date Handling**: date-fns 3.6.0

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── profile-builder/ # Profile form sections
│   ├── dashboard/       # Dashboard-specific components
│   └── credentials/     # Credential management components
├── contexts/            # Domain-specific state management
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── pages/              # Route components
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
    └── supabase/       # Database types and client
```

### State Management Architecture

The application uses a domain-separated Context API approach for optimal performance:

#### Core Contexts
1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - User authentication state
   - Login/logout functionality
   - Currently uses localStorage (mock implementation)

2. **DocumentsContext** (`src/contexts/DocumentsContext.tsx`)
   - Document vault management
   - CRUD operations for uploaded documents
   - Status tracking (current, expiring, missing)

3. **CredentialsContext** (`src/contexts/CredentialsContext.tsx`)
   - Credential tracking and management
   - Renewal status and expiration monitoring
   - Statistics calculation

4. **PayersContext** (`src/contexts/PayersContext.tsx`)
   - Insurance payer management
   - Payer-specific requirements and checklists

5. **UIContext** (`src/contexts/UIContext.tsx`)
   - UI state (sidebar open/closed)
   - CAQH attestation status
   - CME course tracking
   - General UI preferences

### Design System

#### Color Palette (Healthcare Blues)
- **Primary**: Deep Trust Blue (#1F4788) - HSL(216 63% 33%)
- **Secondary**: Medium Blue (#2E5C8A) - HSL(209 50% 36%)
- **Accent**: Bright Sky Blue (#0EA5E9) - HSL(199 89% 48%)
- **Status Colors**: Success (#22C55E), Warning (#F59E0B), Destructive (#EF4444)

#### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

#### Custom CSS Classes
- **Gradients**: `.gradient-primary`, `.gradient-accent`, `.gradient-hero`
- **Status Badges**: `.status-current`, `.status-expiring`, `.status-urgent`, `.status-expired`
- **Navigation**: `.nav-link`, `.nav-link-active`, `.nav-link-inactive`
- **Effects**: `.glass-card`, `.card-hover`, `.btn-primary-gradient`

## Core Features & Pages

### 1. Authentication System
**Files**: `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`, `src/components/PasswordGate.tsx`
- Mock authentication using localStorage
- Password gate for preview access (Supabase edge function validation)
- Protected routes with redirect logic
- Session persistence

### 2. Dashboard (`src/pages/DashboardPage.tsx`)
**Primary landing page showing:**
- **Onboarding Journey**: Step-by-step progress through setup
- **Profile Completion Card**: Visual progress of LHL234 profile
- **Payer Readiness Card**: Status for each insurance payer
- **Actionable Insights**: Personalized recommendations and alerts
- **CAQH Re-Attestation Alerts**: Time-sensitive notifications

### 3. Profile Builder (`src/pages/ProfileBuilderPage.tsx`)
**Core Feature**: LHL234 Texas Standardized Credentialing Application

#### 11 Profile Sections:
1. **Individual Information** - Personal details, contact info, demographics
2. **Education** - Medical school, residency, fellowship details
3. **Licenses** - State licenses, DEA, NPI, provider numbers
4. **Specialty Information** - Board certifications, practice focus
5. **Work History** - Current and previous employment
6. **Hospital Affiliations** - Privileges and appointments
7. **References** - Professional references (minimum 3)
8. **Liability Insurance** - Malpractice coverage details
9. **Call Coverage** - On-call arrangements
10. **Practice Locations** - Office details and hours
11. **Disclosures** - Legal and professional disclosures (23 questions)

**Key Features**:
- Auto-save to localStorage (500ms debounce)
- Real-time completion percentage calculation
- Section-based progress tracking
- Multi-step wizard interface
- Form validation and error handling

### 4. Document Vault (`src/pages/DocumentVaultPage.tsx`)
- File upload and organization
- Document categorization and tagging
- Status tracking (current, expiring, expired)
- Bulk operations and export functionality
- Integration with profile builder

### 5. Credential Tracker (`src/pages/CredentialTrackerPage.tsx`)
- License and certification management
- Expiration monitoring and alerts
- Renewal tracking workflow
- Portfolio export functionality
- Statistical dashboard

### 6. Texas Payers (`src/pages/TexasPayersPage.tsx`)
**Supported Payers**:
- Blue Cross Blue Shield of Texas
- UnitedHealthcare
- Aetna
- Cigna
- Humana
- Texas Medicaid
- Medicare (PECOS)
- Bexar County

**Features**:
- Dynamic payer checklists
- Document requirement mapping
- Progress tracking per payer
- Credential packet generation

### 7. Packet Generator (`src/pages/PacketGeneratorPage.tsx`)
**Three Generation Modes**:

#### Mode 1: Payer-Specific Packets
- Select target insurance payer
- Auto-populated document requirements
- Payer-specific application forms

#### Mode 2: Custom Packets
- Manual document selection
- Flexible packet composition
- Custom document combinations

#### Mode 3: LHL234 Application
- Complete Texas standardized application
- Integrated provider information
- Electronic signature capture
- PDF generation with form fields

**PDF Generation Pipeline**:
- Provider data extraction from LHL234 profile
- Document compilation and packaging
- Digital signature integration
- Downloadable ZIP archives

### 8. CAQH Management (`src/pages/CAQHAttestationPage.tsx`)
- CAQH attestation status tracking
- Renewal reminders and workflows
- Document verification checklist
- Integration with provider profile

### 9. Additional Features
- **CME Tracker** - Continuing education credit management
- **Expiration Calendar** - Timeline view of all expiring items
- **Settings Page** - Account preferences and configuration

## Data Models & Types

### Primary Data Structures

#### LHL234Profile (`src/types/lhl234Profile.ts`)
The single source of truth for all provider data:
```typescript
interface LHL234Profile {
  metadata: ProfileMetadata;
  individualInfo: IndividualInfo;
  education: EducationSection;
  licenses: LicensesSection;
  specialtyInfo: SpecialtySection;
  workHistory: WorkHistorySection;
  hospitalAffiliations: HospitalAffiliationsSection;
  references: ReferencesSection;
  liabilityInsurance: LiabilityInsuranceSection;
  callCoverage: CallCoverageSection;
  practiceLocations: PracticeLocation[];
  disclosures: DisclosuresSection;
}
```

#### Document Management
```typescript
interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  expirationDate?: string;
  status: 'current' | 'expiring' | 'urgent' | 'expired';
  fileUrl: string;
  tags: string[];
  description?: string;
}
```

#### Payer Checklists (`src/lib/payerChecklists.ts`)
Dynamic requirement mapping:
```typescript
interface PayerChecklistItem {
  id: number;
  name: string;
  uploaded: boolean;
  status: 'current' | 'expiring' | 'missing';
}
```

### Custom Hooks

#### useLHL234Profile (`src/hooks/useLHL234Profile.ts`)
- Profile state management
- Auto-save functionality (500ms debounce)
- Completion percentage calculation
- Section progress tracking
- localStorage persistence

#### useDynamicChecklists (`src/hooks/useDynamicChecklists.ts`)
- Document-to-requirement mapping
- Status derivation from expiration dates
- Progress calculation per payer
- Missing item identification

## Backend Infrastructure (Lovable Cloud)

### Supabase Integration
- **Project ID**: rmytqorrsrcthnrecvoh
- **Anonymous Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Client**: `src/integrations/supabase/client.ts`
- **Types**: Auto-generated in `src/integrations/supabase/types.ts`

### Edge Functions
- **verify-preview-password**: Password gate validation for preview access

### Current Database Schema
- Empty schema (no tables defined yet)
- Ready for migration from localStorage to persistent storage

## Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run test suite
npm run lint         # ESLint checking
```

### Code Quality
- **Linting**: ESLint 9.32.0 with React hooks and TypeScript rules
- **Testing**: Vitest 3.2.4 with jsdom and React Testing Library
- **TypeScript**: Strict mode configuration
- **CSS**: Tailwind CSS with design system constraints

### File Conventions
- **Components**: PascalCase (e.g., `ProfileBuilder.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useProfile.ts`)
- **Utilities**: camelCase (e.g., `payerChecklists.ts`)
- **Types**: PascalCase interfaces (e.g., `LHL234Profile`)

## Security & Access Control

### Preview Access
- Password-protected preview environment
- Server-side validation via Supabase edge function
- Session-based unlock mechanism

### Data Privacy
- Local storage for sensitive profile data (temporary)
- No direct database access in current implementation
- Planned migration to encrypted cloud storage

### Future Authentication
- Supabase Auth integration planned
- Row Level Security (RLS) policies for data isolation
- Secure file upload and storage

## Performance Considerations

### Optimization Strategies
- Domain-separated contexts to minimize re-renders
- Debounced auto-save (500ms) to reduce storage writes
- Lazy loading for large form sections
- Memoized calculations for progress tracking

### Bundle Analysis
- Tree-shaking enabled via Vite
- Component-level code splitting ready
- Optimized asset loading

## Deployment & Environment

### Environment Variables
```
VITE_SUPABASE_URL=https://rmytqorrsrcthnrecvoh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon_key]
VITE_SUPABASE_PROJECT_ID=rmytqorrsrcthnrecvoh
```

### Build Configuration
- **Preview URL**: https://id-preview--4d5f7559-e3df-49f7-9517-fb8e3c762066.lovable.app
- **Published URL**: https://tx-credential-coach.lovable.app
- **Password Gate**: Active on preview environment

## Current Limitations & Technical Debt

### Data Persistence
- **Current**: localStorage only (client-side)
- **Needed**: Migration to Supabase database with proper schemas

### Authentication
- **Current**: Mock implementation with localStorage
- **Needed**: Real Supabase Auth with email/password

### File Storage
- **Current**: No actual file upload capability
- **Needed**: Supabase Storage integration for document uploads

### Scalability
- **Current**: Single-user, browser-based storage
- **Needed**: Multi-user database with proper isolation

## Roadmap & Next Steps

### Immediate Priorities
1. **Database Migration**: Move from localStorage to Supabase tables
2. **Authentication**: Implement real user accounts and login
3. **File Upload**: Enable actual document storage and retrieval
4. **Data Security**: Implement RLS policies and user isolation

### Feature Enhancements
1. **Mobile Optimization**: Responsive design improvements
2. **Collaboration**: Multi-user credential management
3. **API Integration**: CAQH, state licensing board connections
4. **Advanced PDF**: Dynamic form filling and e-signature
5. **Notifications**: Email reminders for expirations

### Technical Improvements
1. **Testing**: Comprehensive test coverage
2. **Performance**: Bundle optimization and lazy loading
3. **Accessibility**: WCAG compliance
4. **Documentation**: API docs and user guides

## Key Business Rules

### Profile Completion Requirements
- Minimum 70% completion for packet generation
- All required sections must have basic information
- References require minimum of 3 entries
- License information is mandatory

### Document Status Logic
- **Current**: More than 90 days until expiration
- **Expiring**: 30-90 days until expiration
- **Urgent**: Less than 30 days until expiration
- **Expired**: Past expiration date

### Payer-Specific Requirements
- Each payer has unique document requirements
- Status derived from uploaded document expiration dates
- Profile completion affects requirement satisfaction
- Progress calculated as percentage of satisfied requirements

This documentation captures the current state of CCS Pro as a sophisticated healthcare credentialing platform with a robust technical foundation, comprehensive feature set, and clear roadmap for future development.