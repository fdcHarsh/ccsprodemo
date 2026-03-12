

# Codebase Architecture Improvements

## Overview
Three structural improvements to the CCS Pro codebase: consolidating the dual profile data models, splitting the monolithic AppContext, and adding route-level code splitting.

---

## 1. Consolidate Profile Data Models

**Problem**: Two overlapping profile types exist -- `ProviderProfile` in `mockData.ts` (flat, 40+ fields) and `LHL234Profile` in `lhl234Profile.ts` (structured, 11 sections, 750+ lines). The Packet Generator currently reads from the simpler `ProviderProfile` and ignores detailed LHL234 data the user has entered in the Profile Builder.

**Solution**: Make `LHL234Profile` the single source of truth. Remove `ProviderProfile` entirely and update all consumers to read from the LHL234 profile.

### Changes

**`src/types/lhl234Profile.ts`** -- No changes needed. This is already comprehensive.

**`src/lib/mockData.ts`**:
- Remove the `ProviderProfile` interface (lines 57-121)
- Remove the `initialProfile` constant (lines 464-551)
- Keep all other exports (Documents, Credentials, Payers, CME, helper data)

**`src/hooks/useLHL234Profile.ts`** -- No changes needed. Already manages the LHL234 profile with auto-save.

**`src/pages/PacketGeneratorPage.tsx`**:
- Import `useLHL234Profile` instead of relying on `profile` from `useApp()`
- Update `renderProviderReview()` to read fields from the LHL234 structure (e.g., `lhl234Profile.individualInfo.firstName` + `lhl234Profile.individualInfo.lastName` instead of `profile.fullName`)
- Update `generatePDF()` to pull provider info from the LHL234 profile fields
- Map fields:

```text
profile.fullName        -> individualInfo.firstName + " " + individualInfo.lastName
profile.npiNumber       -> licenses.providerNumbers.npi
profile.deaNumber       -> licenses.deaRegistration.deaNumber
profile.stateLicenseNumber -> licenses.stateLicenses[0].licenseNumber
profile.specialty       -> specialtyInfo.primarySpecialty.specialty
profile.practiceName    -> workHistory.currentPractice.employerName
profile.practicePhone   -> individualInfo.homePhone
profile.email           -> individualInfo.email
profile.practiceAddress -> workHistory.currentPractice.address
profile.practiceCity    -> workHistory.currentPractice.city
profile.practiceState   -> workHistory.currentPractice.state
profile.practiceZip     -> workHistory.currentPractice.postalCode
```

**`src/pages/TexasPayersPage.tsx`**:
- Uses `profile` from `useApp()` for provider info display
- Switch to `useLHL234Profile()` and map the same fields

**`src/pages/DashboardPage.tsx`** -- Currently does not use `profile`; no changes needed.

**`src/contexts/AppContext.tsx`**:
- Remove the `profile` state, `updateProfile`, and the `ProviderProfile` import
- Remove the `credflow_profile` localStorage persistence effect
- Remove `profile` and `updateProfile` from the context value and type

---

## 2. Split AppContext into Domain-Specific Contexts

**Problem**: A single `AppContext` manages auth, documents, credentials, payers, CME, CAQH, profile, and UI state. Every state change triggers re-renders across all consumers even if they only use one slice.

**Solution**: Split into 5 focused contexts:

```text
AuthContext        -- user, isAuthenticated, login, logout
DocumentsContext   -- documents, addDocument, deleteDocument, updateDocument
CredentialsContext -- credentials, addCredential, deleteCredential, updateCredential
PayersContext      -- payers, updatePayer
UIContext          -- sidebarOpen, setSidebarOpen, caqhChecklist, caqhAttestation, CME
```

### New Files

**`src/contexts/AuthContext.tsx`**:
- Manages `user` state with localStorage persistence
- Exports `AuthProvider` and `useAuth()` hook

**`src/contexts/DocumentsContext.tsx`**:
- Manages `documents` state with localStorage persistence
- Exports `DocumentsProvider` and `useDocuments()` hook

**`src/contexts/CredentialsContext.tsx`**:
- Manages `credentials` state with localStorage persistence
- Exports `CredentialsProvider` and `useCredentials()` hook

**`src/contexts/PayersContext.tsx`**:
- Manages `payers` state with localStorage persistence
- Exports `PayersProvider` and `usePayers()` hook

**`src/contexts/UIContext.tsx`**:
- Manages `sidebarOpen`, `caqhChecklist`, `caqhAttestation`, `cmeCourses` with localStorage persistence
- Exports `UIProvider` and `useUI()` hook

### Updated Files

**`src/App.tsx`**:
- Nest all providers in order: `AuthProvider` > `DocumentsProvider` > `CredentialsProvider` > `PayersProvider` > `UIProvider`
- Update `ProtectedRoute` and `AppRoutes` to use `useAuth()` instead of `useApp()`

**Every page/component using `useApp()`** (15 files):
- Replace `useApp()` with the specific hook(s) needed:

| File | Current | New hook(s) |
|---|---|---|
| `App.tsx` (ProtectedRoute/AppRoutes) | `useApp()` | `useAuth()` |
| `AppSidebar.tsx` | `sidebarOpen, setSidebarOpen, logout` | `useAuth()`, `useUI()` |
| `DashboardLayout.tsx` | `sidebarOpen` | `useUI()` |
| `TopNav.tsx` | `user, logout, credentials, sidebarOpen` | `useAuth()`, `useCredentials()`, `useUI()` |
| `LoginPage.tsx` | `login` | `useAuth()` |
| `SignupPage.tsx` | `login` | `useAuth()` |
| `DashboardPage.tsx` | `documents, credentials, payers` | `useDocuments()`, `useCredentials()`, `usePayers()` |
| `DocumentVaultPage.tsx` | `documents, addDocument, deleteDocument` | `useDocuments()` |
| `CredentialTrackerPage.tsx` | `credentials, deleteCredential` | `useCredentials()` |
| `TexasPayersPage.tsx` | `payers, profile` | `usePayers()`, `useLHL234Profile()` |
| `PacketGeneratorPage.tsx` | `documents, profile` | `useDocuments()`, `useLHL234Profile()` |
| `CAQHAttestationPage.tsx` | `caqhAttestation, updateCAQHAttestation, documents, addDocument` | `useUI()`, `useDocuments()` |
| `CAQHManagerPage.tsx` | `caqhChecklist, updateCAQHChecklist, credentials` | `useUI()`, `useCredentials()` |
| `CMETrackerPage.tsx` | `cmeCourses, addCMECourse, deleteCMECourse` | `useUI()` |

**`src/contexts/AppContext.tsx`** -- Will be deleted entirely once all consumers are migrated.

---

## 3. Route-Level Code Splitting

**Problem**: All page components are eagerly imported in `App.tsx`, meaning the entire app loads upfront even though users only visit one page at a time.

**Solution**: Use `React.lazy()` with `Suspense` for all route page components.

### Changes to `src/App.tsx`

Replace static imports with lazy imports:

```typescript
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentVaultPage = lazy(() => import('./pages/DocumentVaultPage'));
const CredentialTrackerPage = lazy(() => import('./pages/CredentialTrackerPage'));
const TexasPayersPage = lazy(() => import('./pages/TexasPayersPage'));
const ProfileBuilderPage = lazy(() => import('./pages/ProfileBuilderPage'));
const PacketGeneratorPage = lazy(() => import('./pages/PacketGeneratorPage'));
const CAQHAttestationPage = lazy(() => import('./pages/CAQHAttestationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
```

Wrap the `Routes` block in a `Suspense` boundary with a simple loading spinner fallback component.

---

## Implementation Order

1. **Consolidate data models** first -- remove `ProviderProfile`, update PacketGenerator and TexasPayersPage
2. **Split AppContext** -- create new contexts, update all 15 consumer files, delete old AppContext
3. **Code splitting** -- convert to lazy imports and add Suspense (quick change at the end)

## Risk Notes

- localStorage keys stay the same so existing saved data is preserved
- The LHL234 profile starts empty by default (from `createEmptyLHL234Profile()`), so the Packet Generator provider review will show blank fields until the user fills in their profile -- this is correct behavior for a fresh start
- The old `credflow_profile` localStorage key will become orphaned; harmless but could be cleaned up

