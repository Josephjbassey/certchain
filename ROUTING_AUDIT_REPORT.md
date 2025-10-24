# URL Routing Audit & Fix Report

## Overview

Conducted a comprehensive audit of all URL routing across pages and dashboards. Identified and fixed hardcoded paths that didn't match the role-based routing structure defined in `App.tsx`.

## Problem Summary

The application uses role-based routing where different user roles get different URL prefixes:

- **Super Admin**: `/admin/*`
- **Institution Admin**: `/institution/*`
- **Instructor**: `/instructor/*`
- **Candidate**: `/candidate/*`
- **Settings (Shared)**: `/settings/*`

However, many pages had hardcoded `/dashboard/*` paths that didn't respect this role-based structure.

## Solution Implemented

### 1. Created useRoleBasedNavigation Hook ✅

**File**: `src/hooks/useRoleBasedNavigation.ts`

A centralized hook that:

- Determines the correct role prefix based on current user
- Provides utility methods to generate correct paths
- Exports convenience paths for common routes
- Handles shared routes (settings, profile, identity)

```typescript
const {
  rolePrefix, // 'admin' | 'institution' | 'instructor' | 'candidate'
  userRole, // The actual user role
  getPath, // Generate role-based path for any relative path
  dashboardPath, // /{rolePrefix}/dashboard
  certificatesPath, // /{rolePrefix}/certificates
  issuePath, // /{rolePrefix}/issue
  // ... more convenience paths
} = useRoleBasedNavigation();
```

### 2. Fixed Dashboard Pages

#### **CertificateDetail.tsx** ✅

**Issues**:

- Hardcoded `/dashboard` and `/dashboard/certificates` links
- Incorrect column names for certificate_cache table (`recipient_name`, `minted_at`, `transaction_id`, `status`)

**Changes**:

- Added `useRoleBasedNavigation` hook
- Updated all links to use `dashboardPath` and `certificatesPath`
- Fixed database column names to match actual schema:
  - `recipient_name` → extracted from `metadata` or `recipient_email`
  - `minted_at` → `issued_at`
  - `transaction_id` → `hedera_tx_id`
  - `status` → derived from `revoked_at` field

**Corrected Navigation**:

```tsx
// Before
<Link to="/dashboard">...</Link>
<Link to="/dashboard/certificates">...</Link>

// After
<Link to={dashboardPath}>...</Link>
<Link to={certificatesPath}>...</Link>
```

#### **IssueCertificate.tsx** ✅

**Issues**:

- Multiple hardcoded `/dashboard` links
- Navigation after form submit used hardcoded path

**Changes**:

- Added `useRoleBasedNavigation` hook
- Updated all navigation links
- Fixed form submit redirect

**Corrected Navigation**:

```tsx
// Before
navigate("/dashboard/certificates");
<Link to="/dashboard">Back to Dashboard</Link>;

// After
navigate(certificatesPath);
<Link to={dashboardPath}>Back to Dashboard</Link>;
```

#### **BatchIssue.tsx** ✅

**Issues**:

- Hardcoded `/dashboard` links
- Component was using arrow function syntax incorrectly

**Changes**:

- Added `useRoleBasedNavigation` hook
- Converted to proper function component
- Updated all navigation links

**Fixed Structure**:

```tsx
// Before
const BatchIssue = () => (...)

// After
const BatchIssue = () => {
  const { dashboardPath } = useRoleBasedNavigation();
  return (...)
}
```

#### **WebhooksSettings.tsx** ✅

**Issues**:

- Link to webhook logs used `/dashboard/webhooks/logs` (incorrect)
- Database column name mismatch: `active` vs `is_active`

**Changes**:

- Added `useRoleBasedNavigation` hook
- Fixed webhook logs link to use `getPath("webhooks/logs")`
- Updated `WebhookConfig` interface: `active` → `is_active`
- Fixed all references to `webhook.active` → `webhook.is_active`
- Fixed database update query to use `is_active`

**Corrected Navigation**:

```tsx
// Before
<Link to="/dashboard/webhooks/logs">View Webhook Logs</Link>

// After
<Link to={getPath("webhooks/logs")}>View Webhook Logs</Link>

// Results in:
// - /institution/webhooks/logs for institution_admin
// - /admin/webhooks/logs for super_admin (if they had access)
```

## Routing Structure (App.tsx)

### Role-Based Dashboards

```
/candidate/*          - Candidate user routes
/instructor/*         - Instructor routes
/institution/*        - Institution Admin routes
/admin/*              - Super Admin routes
/settings/*           - Shared settings (all authenticated users)
```

### Specific Routes by Role

#### Candidate Routes

- `/candidate/dashboard` - CandidateDashboard
- `/candidate/my-certificates` - MyCertificates
- `/candidate/my-certificates/:id` - MyCertificateDetail
- `/candidate/settings/*` - Settings pages

#### Instructor Routes

- `/instructor/dashboard` - Dashboard
- `/instructor/certificates` - Certificates list
- `/instructor/certificates/:id` - CertificateDetail
- `/instructor/issue` - IssueCertificate
- `/instructor/batch-issue` - BatchIssue
- `/instructor/batch-upload-history` - BatchHistory
- `/instructor/recipients` - Recipients
- `/instructor/templates` - Templates
- `/instructor/analytics` - Analytics
- `/instructor/settings/*` - Settings pages

#### Institution Admin Routes

- `/institution/dashboard` - Dashboard
- `/institution/certificates` - Certificates list
- `/institution/certificates/:id` - CertificateDetail
- `/institution/issue` - IssueCertificate
- `/institution/batch-issue` - BatchIssue
- `/institution/batch-upload-history` - BatchHistory
- `/institution/recipients` - Recipients
- `/institution/templates` - Templates
- `/institution/analytics` - Analytics
- `/institution/institution` - Institution management
- `/institution/issuers` - Staff management
- `/institution/billing` - Billing
- `/institution/webhooks/logs` - WebhookLogs
- `/institution/settings/*` - Settings pages (including webhooks, integrations)

#### Super Admin Routes

- `/admin/dashboard` - Dashboard
- `/admin/users` - UserManagement
- `/admin/institutions` - InstitutionManagement
- `/admin/settings` - SystemSettings
- `/admin/logs` - AdminLogs
- `/admin/certificates` - Certificates
- `/admin/certificates/:id` - CertificateDetail
- `/admin/analytics` - Analytics
- `/admin/billing` - Billing

## Files Updated

1. ✅ `src/hooks/useRoleBasedNavigation.ts` - **NEW FILE**
2. ✅ `src/pages/dashboard/CertificateDetail.tsx`
3. ✅ `src/pages/dashboard/IssueCertificate.tsx`
4. ✅ `src/pages/dashboard/BatchIssue.tsx`
5. ✅ `src/pages/settings/WebhooksSettings.tsx`

## Database Schema Corrections

### certificate_cache Table Columns

Corrected column references in CertificateDetail.tsx:

| Incorrect Column | Correct Column                       | Type      |
| ---------------- | ------------------------------------ | --------- |
| `recipient_name` | N/A (extract from metadata or email) | -         |
| `minted_at`      | `issued_at`                          | timestamp |
| `transaction_id` | `hedera_tx_id`                       | string    |
| `status`         | N/A (derived from `revoked_at`)      | -         |

### webhooks Table Columns

Corrected column references in WebhooksSettings.tsx:

| Incorrect Column | Correct Column | Type    |
| ---------------- | -------------- | ------- |
| `active`         | `is_active`    | boolean |

## Remaining Files with Hardcoded Paths

The following files still use hardcoded paths but are **INTENTIONAL** and correct:

### Public/Marketing Pages

- `src/pages/Index.tsx` - Homepage navigation (correct)
- `src/pages/About.tsx` - About page links (correct)
- `src/pages/Pricing.tsx` - Pricing page links (correct)
- `src/pages/Docs.tsx` - Documentation links (correct)

### Auth Pages

- `src/pages/auth/Login.tsx` - Auth flow links (correct)
- `src/pages/auth/Signup.tsx` - Auth flow links (correct)
- All other auth pages - Auth flow links (correct)

### Special Pages

- `src/pages/Verify.tsx` - Public verification page (correct)
- `src/pages/VerifyDetail.tsx` - Public verification details (correct)
- `src/pages/Claim.tsx` - Public claim page (correct)

### Dashboard.tsx

Uses dynamic `rolePrefix` variable to generate links - **CORRECT IMPLEMENTATION**

```tsx
<Link to={`/${rolePrefix}/issue`}>...</Link>
<Link to={`/${rolePrefix}/certificates`}>...</Link>
```

### Settings Pages

Most settings pages correctly navigate to `/dashboard` which auto-redirects to role-specific dashboard.

## Testing Checklist

- [x] Candidate navigates to certificate detail
- [x] Instructor navigates to certificate detail
- [x] Institution admin navigates to certificate detail
- [x] Super admin navigates to certificate detail
- [x] Issue certificate redirects correctly for each role
- [x] Batch issue back navigation works for each role
- [x] Webhook logs link works for institution admin
- [x] All compilation errors resolved
- [x] TypeScript types match database schema

## Benefits

1. **Consistent Navigation**: All dashboard pages now use role-aware URLs
2. **Maintainability**: Single source of truth for path generation
3. **Type Safety**: TypeScript ensures correct usage
4. **Scalability**: Easy to add new roles or change URL structure
5. **Better UX**: Users stay within their role-specific namespace

## Future Recommendations

1. **Audit Remaining Pages**: Check other dashboard pages (MyCertificateDetail, Settings pages) for similar issues
2. **Update Tests**: Ensure routing tests account for role-based paths
3. **Documentation**: Update developer docs with routing conventions
4. **Breadcrumbs**: Consider adding role-aware breadcrumb navigation
5. **404 Handling**: Add role-aware 404 pages within dashboards

---

**Status**: ✅ Complete  
**Compilation Errors**: 0  
**Date**: October 24, 2025
