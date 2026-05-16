# Code Review Report

**Repository:** Figma Exporter Dashboard (frontend)  
**Date:** April 10, 2026  
**Reviewer:** Automated Code Review  
**Scope:** Entire codebase (src/, e2e/, configuration files)

---

## 1. Executive Summary

This codebase is a Next.js 16 admin dashboard application with a feature-based architecture, URL-driven state management, and comprehensive test coverage. The application uses mock data services and in-memory authentication, with no real backend integration.

**Overall Assessment:** The codebase demonstrates solid architectural patterns with clean separation of concerns. However, there are **critical issues** that block compilation and **security concerns** that must be addressed before production deployment.

| Category | Status |
|----------|--------|
| TypeScript Compilation | **FAILED** - 3 errors |
| ESLint | **FAILED** - 1 error, 6 warnings |
| Unit Tests | **FAILED** - 12 tests failing |
| Security | **FAILED** - Multiple vulnerabilities |

---

## 2. Critical Issues (Must Fix)

### 2.1 TypeScript Compilation Errors

#### Error 1: Type Mismatch in Donations View Model
**File:** `src/features/admin/data/services/get-donations-view-model.ts:252`

```
Type '{ donorsLabel: string; totalLabel: string; totalTone: "success" | "accent" | "warning" | "danger" }' 
is not assignable to type '{ donorsLabel: string; totalLabel: string; totalTone: "success" | "info" | "warning" | "danger" }'.
```

**Root Cause:** The `totalTone` property includes `"accent"` which is not in the expected type union.

**Action:** Update the type definition or change `"accent"` to `"info"`.

---

#### Error 2: Required Parameter After Optional Parameter
**File:** `src/features/admin/data/services/get-notifications-history-view-model.ts:73`

```
A required parameter cannot follow an optional parameter.
```

**Root Cause:** Function `parseReadIds(read?: string, selectedIds: number[])` has required `selectedIds` after optional `read`.

**Action:** Either make both parameters required or both optional:
```typescript
// Option 1: Make selectedIds required
function parseReadIds(read: string | undefined, selectedIds: number[]): number[]

// Option 2: Make both optional
function parseReadIds(read?: string, selectedIds?: number[]): number[]
```

---

#### Error 3: Type Comparison Issue in Donations Table
**File:** `src/features/admin/presentation/components/donations/donations-table.tsx:207`

```
This comparison appears to be unintentional because the types '"success" | "info" | "warning" | "danger"' 
and '"accent"' have no overlap.
```

**Root Cause:** Conditional logic uses `"accent"` when the type only allows `"success" | "info" | "warning" | "danger"`.

**Action:** Review and fix the conditional logic to use valid tone values.

---

### 2.2 ESLint Error

#### Error: setState Called Directly in useEffect
**File:** `src/features/admin/presentation/components/admin-sidebar-nav.tsx:135`

```
Calling setState synchronously within an effect can trigger cascading renders.
```

**Current Code:**
```typescript
useEffect(() => {
  setExpandedItems((current) => {
    const next = { ...current };
    sidebarItems.forEach((item) => { ... });
    return next;
  });
}, [sidebarItems]);
```

**Root Cause:** The effect initializes state based on props, which is an anti-pattern in React.

**Action:** Use initialization with `useState` instead:
```typescript
const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => 
  Object.fromEntries(sidebarItems.filter((item) => item.expandable).map((item) => [item.id, false]))
);
```

---

### 2.3 Test Failures

**Status:** 12 tests failing out of 84 (14.3% failure rate)

**Affected Test Files:**
- `src/features/admin/presentation/components/__tests__/home-management-page.test.tsx` (10 failures)
- `src/features/admin/presentation/components/__tests__/admin-overview.test.tsx` (2 failures)

**Root Cause:** Missing mock for `usePathname` from `next/navigation`.

**Error Message:**
```
No "usePathname" export is defined on the "next/navigation" mock. 
Did you forget to return it from "vi.mock"?
```

**Action:** Update test setup to include `usePathname` mock:
```typescript
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/overview",
}));
```

---

## 3. Security Concerns

### 3.1 Hardcoded Credentials
**File:** `src/core/auth/mock-users.ts`

```typescript
const seedUsers: AuthUser[] = [
  {
    id: "u_admin_001",
    email: "admin@itestified.app",
    password: "pass123",  // PLAIN TEXT PASSWORD
    fullName: "Elias Igiebor",
    role: "admin",
  },
];
```

**Risk:** Credentials stored in plain text in source code. If this code is ever committed to a public repository, credentials are exposed.

**Action:**
1. Remove hardcoded passwords from source code
2. Use environment variables for any default credentials
3. Implement proper password hashing (bcrypt/argon2)

---

### 3.2 Insecure Session Tokens
**File:** `src/app/api/auth/login/route.ts`

**Current Implementation:** Base64-encoded JSON token
```typescript
const token = Buffer.from(JSON.stringify({ userId, email, role })).toString("base64");
```

**Risk:** Tokens are not cryptographically signed. Anyone can decode and modify the token to impersonate users.

**Action:** Implement proper JWT or use NextAuth.js for session management.

---

### 3.3 No Password Hashing
**File:** `src/core/auth/mock-users.ts`

Passwords are stored and compared in plain text:
```typescript
export function findUserByEmail(email: string) {
  // Direct comparison - no hashing
  return runtimeUsers.find((u) => u.email.toLowerCase() === normalizedEmail) 
    ?? seedUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
}
```

**Action:** Implement password hashing when connecting to a real backend.

---

### 3.4 In-Memory User Storage
**File:** `src/core/auth/mock-users.ts`

```typescript
const runtimeUsers: AuthUser[] = [];
```

**Risk:** All runtime users are lost on server restart. No data persistence.

**Action:** For production, integrate with a database (PostgreSQL, MongoDB, etc.).

---

## 4. Code Quality Issues

### 4.1 Unused Variables (6 warnings)

| File | Line | Variable | Issue |
|------|------|----------|-------|
| `scripture-of-the-day-overview-table.tsx` | 2 | `ScriptureRow` | Import unused |
| `testimonies-page.tsx` | 14 | `filledButtonClass` | Assigned but never used |
| `testimonies-overlays.tsx` | 6 | `TestimonyRow` | Import unused |
| `testimonies-overlays.tsx` | 244 | `row` | Parameter unused |
| `testimonies-overlays.tsx` | 648 | `row` | Parameter unused |
| `users-overlays.tsx` | 176 | `row` | Parameter unused |

**Action:** Remove unused imports and parameters, or use `_` prefix for intentionally unused parameters.

---

### 4.2 Code Duplication Patterns

**Observation:** Many view model services follow identical patterns:
- Normalization functions (normalizeTab, normalizeState)
- Row filtering functions
- URL construction helpers

**Recommendation:** Consider creating shared utilities in `src/core/lib/` for:
- URL parameter parsing
- Row filtering logic
- Common type definitions

---

## 5. Architecture Analysis

### 5.1 Strengths

#### Feature-Based Architecture
The codebase follows a clear feature-based organization:
```
features/{feature}/
├── data/services/      # View model services
├── domain/entities/    # Type definitions
└── presentation/       # UI components
    ├── components/
    └── state/          # Route state builders
```

This provides excellent separation of concerns and makes the codebase easy to navigate.

---

#### URL-Driven State Pattern
All state is encoded in URL query parameters:
- Tab selection: `?tab=deleted`
- Modal states: `?view=1`, `?menu=1`
- Search: `?q=searchterm`
- Success messages: `?success=deactivate`

**Benefits:**
- Stateless server rendering
- Bookmarkable/shareable URLs
- No client-side state management needed

---

#### Server Components
The application uses Next.js Server Components extensively, with minimal client-side JavaScript.

**Benefits:**
- Optimal performance
- Reduced bundle size
- Better SEO

---

#### Comprehensive E2E Coverage
**File:** `e2e/smoke.spec.ts` (34 test cases)

Coverage includes:
- Authentication flow (login/logout)
- All admin routes
- UI states (empty, populated, loading, error)
- User interactions (modals, tabs, actions)

---

### 5.2 Observations

1. **No Real Backend:** View models return hardcoded mock data only
2. **No Database Integration:** Data is static/hardcoded
3. **Limited API Surface:** Only auth endpoints exist, no CRUD operations
4. **Mock-Only Architecture:** Suitable for prototyping, not production

---

## 6. Action Items

### Priority 1: Critical (Blockers)

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 1.1 | Fix type error: change `"accent"` to `"info"` in donations view model | `get-donations-view-model.ts:252` | Low |
| 1.2 | Fix function signature: make parameters consistent | `get-notifications-history-view-model.ts:73` | Low |
| 1.3 | Fix type comparison in donations table | `donations-table.tsx:207` | Low |
| 1.4 | Fix ESLint error: remove setState in useEffect | `admin-sidebar-nav.tsx:135` | Medium |
| 1.5 | Fix test mocks: add usePathname mock | `src/test/setup.ts` | Low |

---

### Priority 2: Security (Before Production)

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 2.1 | Remove hardcoded credentials | `mock-users.ts` | Medium |
| 2.2 | Implement proper session tokens (JWT or NextAuth) | API routes | High |
| 2.3 | Add password hashing | `mock-users.ts` | Medium |
| 2.4 | Integrate with database for persistence | New integration | High |

---

### Priority 3: Code Quality

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 3.1 | Remove unused imports and variables | See Section 4.1 | Low |
| 3.2 | Create shared utilities for duplicated code | `src/core/lib/` | Medium |

---

### Priority 4: Testing

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 4.1 | Fix failing unit tests (12 tests) | Test files | Medium |
| 4.2 | Add unit tests for view model services | New files | Medium |
| 4.3 | Add integration tests for API routes | `src/app/api/` | Medium |

---

## 7. Recommendations

### 7.1 Short-Term (This Sprint)

1. **Fix all critical errors** (Section 2) to restore clean build
2. **Address all ESLint warnings** for code cleanliness
3. **Fix failing tests** to restore test suite reliability

### 7.2 Mid-Term (Next Milestone)

1. **Security hardening** before any production deployment
2. **Add error boundaries** for graceful error handling
3. **Implement loading states** consistently across all pages

### 7.3 Long-Term (Production Readiness)

1. **Replace mock data** with real backend API
2. **Add authentication library** (NextAuth.js recommended)
3. **Set up CI/CD pipeline** with automated testing
4. **Add logging and monitoring** for production debugging

---

## 8. Summary

| Metric | Status |
|--------|--------|
| Files Reviewed | ~80+ |
| TypeScript Errors | 3 |
| ESLint Errors | 1 |
| ESLint Warnings | 6 |
| Test Failures | 12 |
| Security Issues | 4 |

**Overall Code Quality:** Good architecture, but needs bug fixes and security improvements before production.

---

*End of Report*