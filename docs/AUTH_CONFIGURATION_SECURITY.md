# Auth Configuration Security Settings

## Overview

This document describes Auth configuration settings that must be enabled in Supabase Dashboard to resolve security warnings.

## Leaked Password Protection

**Status**: ⚠️ WARN - Must be enabled in Supabase Dashboard

**Issue**: Supabase Auth can prevent users from using compromised passwords by checking against HaveIBeenPwned.org database.

**Current State**: Disabled

**Impact**: Users could potentially use passwords that have been exposed in data breaches

### How to Enable

1. **Navigate to Supabase Dashboard**:

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your CertChain project

2. **Open Auth Settings**:

   - Click on "Authentication" in the left sidebar
   - Click on "Policies" tab
   - Find "Password Security" section

3. **Enable Leaked Password Protection**:

   - Toggle on "**Leaked Password Protection**"
   - This feature checks passwords against HaveIBeenPwned.org API
   - When enabled, users cannot register/reset password with compromised passwords

4. **Verify Configuration**:
   - Run Database Linter again
   - Confirm `auth_leaked_password_protection` warning is resolved

### Technical Details

**What it does**:

- Queries HaveIBeenPwned.org API using k-Anonymity model
- Checks new passwords during registration and password reset
- Rejects passwords that appear in known breach databases
- No actual password is sent to external service (uses hash prefix)

**Security Model**:

- Uses k-Anonymity: Only first 5 characters of SHA-1 hash are sent
- API returns list of suffixes matching that prefix
- Client-side comparison finds exact match
- Zero actual password data leaves your system

**User Experience**:

- User tries to register with compromised password (e.g., "password123")
- System rejects with error: "This password has been exposed in a data breach. Please choose a different password."
- User selects a secure, unique password
- Registration proceeds normally

### Why This Matters

**Risk Scenario**:

1. User reuses password from another service
2. That service gets breached
3. Attacker tries credential stuffing on CertChain
4. User account compromised

**With Protection Enabled**:

1. User tries to use breached password
2. System rejects during registration
3. User creates unique password
4. Account remains secure even if other services are compromised

### Configuration Priority

- **Priority**: HIGH
- **Effort**: LOW (1-click toggle)
- **Impact**: HIGH (prevents credential stuffing attacks)
- **Recommended**: Enable immediately

### Additional Password Security Settings

While enabling Leaked Password Protection, consider these settings:

1. **Minimum Password Length**: 12+ characters recommended
2. **Password Complexity**: Require mix of uppercase, lowercase, numbers, symbols
3. **Password History**: Prevent reuse of last 5 passwords
4. **Password Expiration**: Optional, consider for high-security requirements

## References

- [Supabase Auth Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Model](https://en.wikipedia.org/wiki/K-anonymity)
- [Database Linter: auth_leaked_password_protection](https://supabase.com/docs/guides/database/database-linter)

## Next Steps

After enabling this setting:

1. ✅ Enable Leaked Password Protection in Supabase Dashboard
2. ✅ Run Database Linter to verify warning is resolved
3. ✅ Test user registration with compromised password (should be rejected)
4. ✅ Test user registration with strong unique password (should succeed)
5. ✅ Document for team that this protection is active
