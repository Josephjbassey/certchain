# CertChain Test Plan

## Test Execution Summary

- **Project**: CertChain - Decentralized Certificate Verification Platform
- **Test Type**: Frontend End-to-End Testing
- **Environment**: http://localhost:8080
- **Test Scope**: Full codebase
- **Generated**: October 31, 2025

## Test Requirements

### Requirement 1: Public Pages Accessibility

**Priority**: Critical  
**Description**: All public pages should load correctly without authentication

#### Test Cases:

1. **Landing Page Load**

   - Navigate to `/`
   - Verify hero section displays
   - Verify navigation menu is present
   - Verify CTA buttons are clickable

2. **About Page Load**

   - Navigate to `/about`
   - Verify content displays
   - Verify team information loads

3. **Pricing Page Load**

   - Navigate to `/pricing`
   - Verify pricing tiers display
   - Verify feature comparisons show

4. **Docs Page Load**

   - Navigate to `/docs`
   - Verify documentation content loads
   - Verify navigation sidebar works

5. **Contact Page Load**
   - Navigate to `/contact`
   - Verify contact form displays
   - Verify form fields are interactive

### Requirement 2: Authentication Flows

**Priority**: Critical  
**Description**: Users should be able to register, login, and manage their sessions

#### Test Cases:

1. **User Registration**

   - Navigate to `/auth/signup`
   - Fill registration form with valid data
   - Submit form
   - Verify success message or redirect

2. **User Login**

   - Navigate to `/auth/login`
   - Enter valid credentials
   - Submit form
   - Verify redirect to dashboard

3. **Form Validation - Registration**

   - Navigate to `/auth/signup`
   - Submit empty form
   - Verify validation errors display
   - Enter invalid email format
   - Verify email validation error

4. **Form Validation - Login**

   - Navigate to `/auth/login`
   - Submit empty form
   - Verify validation errors display
   - Enter invalid credentials
   - Verify error message shows

5. **Password Reset Flow**
   - Navigate to `/auth/forgot-password`
   - Enter email address
   - Submit form
   - Verify confirmation message

### Requirement 3: Certificate Verification (Public)

**Priority**: Critical  
**Description**: Anyone should be able to verify certificates without authentication

#### Test Cases:

1. **Verification Page Access**

   - Navigate to `/verify`
   - Verify page loads without authentication
   - Verify search interface displays

2. **Certificate ID Lookup**

   - Navigate to `/verify`
   - Enter certificate ID
   - Click search button
   - Verify results display or not found message

3. **QR Code Scanner Access**

   - Navigate to `/verify/scan`
   - Verify QR scanner component loads
   - Verify camera permission request (or message)

4. **Verification Result Display**

   - Navigate to `/verify/:id` (with valid ID)
   - Verify certificate details display
   - Verify issuer information shows
   - Verify blockchain link is present

5. **Invalid Certificate Handling**
   - Navigate to `/verify/invalid-id-123`
   - Verify "not found" message displays
   - Verify helpful error message shows

### Requirement 4: Role-Based Dashboard Access

**Priority**: Critical  
**Description**: Users should access role-specific dashboards based on their permissions

#### Test Cases:

1. **Candidate Dashboard Access**

   - Login as candidate user
   - Verify redirect to `/candidate/*`
   - Verify candidate-specific features display
   - Verify sidebar navigation shows correct items

2. **Instructor Dashboard Access**

   - Login as instructor user
   - Verify redirect to `/instructor/*`
   - Verify instructor-specific features display
   - Verify "Issue Certificate" option available

3. **Institution Admin Dashboard Access**

   - Login as institution admin
   - Verify redirect to `/institution/*`
   - Verify admin features available
   - Verify staff management option visible

4. **Super Admin Dashboard Access**

   - Login as super admin
   - Verify redirect to `/admin/*`
   - Verify all admin features available
   - Verify user management accessible

5. **Unauthorized Route Protection**
   - Login as candidate
   - Try to navigate to `/admin/*`
   - Verify redirect or access denied message
   - Verify proper error handling

### Requirement 5: Hedera Wallet Connection

**Priority**: High  
**Description**: Users should be able to connect their Hedera wallets via WalletConnect

#### Test Cases:

1. **Wallet Connection Button**

   - Login as institution admin
   - Navigate to profile/settings
   - Verify "Connect Wallet" button displays
   - Click button
   - Verify WalletConnect modal opens

2. **Wallet Connection Modal**

   - Click "Connect Wallet"
   - Verify modal displays wallet options
   - Verify HashPack option present
   - Verify Blade option present
   - Verify modal is closable

3. **Connected Wallet Display**

   - After wallet connection (mocked or real)
   - Verify account ID displays
   - Verify disconnect option available
   - Verify wallet status indicator

4. **Wallet Disconnection**

   - With connected wallet
   - Click disconnect button
   - Verify wallet disconnects
   - Verify UI updates to show disconnected state

5. **Network Display**
   - With connected wallet
   - Verify network (testnet/mainnet) displays
   - Verify network indicator is correct

### Requirement 6: Certificate Issuance Flow

**Priority**: High  
**Description**: Instructors and admins should be able to issue certificates

#### Test Cases:

1. **Issue Certificate Page Access**

   - Login as instructor
   - Navigate to "Issue Certificate"
   - Verify form displays
   - Verify all required fields present

2. **Form Field Validation**

   - On issue certificate page
   - Submit empty form
   - Verify all required field errors display
   - Fill invalid data
   - Verify specific validation errors

3. **Image Upload**

   - On issue certificate page
   - Click image upload area
   - Select image file (mock or test file)
   - Verify image preview displays
   - Verify file size validation

4. **Certificate Form Submission**

   - Fill all required fields
   - Upload valid image
   - Click submit button
   - Verify loading state displays
   - Verify success message or redirect

5. **Success Feedback**
   - After successful submission
   - Verify success toast/notification
   - Verify certificate ID displayed
   - Verify option to issue another certificate

### Requirement 7: Certificate Claiming Flow

**Priority**: High  
**Description**: Students should be able to claim certificates sent to them

#### Test Cases:

1. **Claim Page Access**

   - Navigate to `/claim/:token`
   - Verify page loads
   - Verify certificate preview displays

2. **Certificate Preview**

   - On claim page
   - Verify certificate details visible
   - Verify course name displays
   - Verify issuer information shows
   - Verify "Claim" button present

3. **Claim Without Wallet**

   - On claim page without wallet connected
   - Click "Claim Certificate" button
   - Verify wallet connection prompt
   - Verify WalletConnect modal opens

4. **Claim With Wallet**

   - On claim page with wallet connected
   - Click "Claim Certificate" button
   - Verify transaction prompt
   - Verify loading state during claim

5. **Claim Success**
   - After successful claim
   - Verify success message displays
   - Verify certificate shown as claimed
   - Verify redirect or next steps shown

### Requirement 8: Navigation and Routing

**Priority**: High  
**Description**: Application routing should work correctly for all user types

#### Test Cases:

1. **Public Header Navigation**

   - On homepage
   - Verify all nav links clickable
   - Click each nav item
   - Verify correct page loads

2. **Dashboard Sidebar Navigation**

   - Login and go to dashboard
   - Verify sidebar displays
   - Click each sidebar item
   - Verify navigation works
   - Verify active state highlights

3. **Breadcrumb Navigation**

   - Navigate to nested route
   - Verify breadcrumbs display
   - Click breadcrumb links
   - Verify navigation back works

4. **Not Found Page**

   - Navigate to `/invalid-route-12345`
   - Verify 404 page displays
   - Verify helpful message shown
   - Verify home link present

5. **Back Navigation**
   - Navigate through multiple pages
   - Click browser back button
   - Verify correct page history
   - Verify state preservation

### Requirement 9: Responsive Design

**Priority**: Medium  
**Description**: Application should work well on mobile and desktop

#### Test Cases:

1. **Mobile Viewport - Homepage**

   - Set viewport to mobile (375px width)
   - Navigate to homepage
   - Verify mobile menu icon displays
   - Verify content is readable
   - Verify no horizontal scroll

2. **Mobile Viewport - Dashboard**

   - Set viewport to mobile
   - Login and go to dashboard
   - Verify sidebar collapses or becomes drawer
   - Verify dashboard cards stack vertically

3. **Tablet Viewport**

   - Set viewport to tablet (768px width)
   - Navigate through key pages
   - Verify layout adapts properly
   - Verify touch targets are adequate

4. **Desktop Viewport**

   - Set viewport to desktop (1920px width)
   - Navigate through application
   - Verify full sidebar displays
   - Verify optimal use of space

5. **Responsive Images**
   - View certificate images on various viewports
   - Verify images scale properly
   - Verify images maintain aspect ratio

### Requirement 10: Error Handling and Edge Cases

**Priority**: Medium  
**Description**: Application should handle errors gracefully

#### Test Cases:

1. **Network Error Handling**

   - Simulate network failure
   - Try to submit a form
   - Verify error message displays
   - Verify retry option available

2. **Invalid Token Handling**

   - Navigate to claim page with expired token
   - Verify expiration message displays
   - Verify helpful instructions shown

3. **Empty State Handling**

   - Login as new user with no certificates
   - Navigate to certificates page
   - Verify empty state displays
   - Verify helpful message and CTA

4. **Loading States**

   - Trigger data loading operation
   - Verify loading spinner/skeleton displays
   - Verify loading doesn't block UI unnecessarily

5. **Form Error Recovery**
   - Submit form with errors
   - Fix errors
   - Resubmit form
   - Verify successful submission
   - Verify errors cleared

### Requirement 11: UI/UX Consistency

**Priority**: Medium  
**Description**: UI elements should be consistent across the application

#### Test Cases:

1. **Button Styles**

   - Navigate through application
   - Verify primary buttons consistent
   - Verify secondary buttons consistent
   - Verify hover states work

2. **Form Input Styles**

   - View multiple forms
   - Verify input field styling consistent
   - Verify label positioning consistent
   - Verify error message styling consistent

3. **Typography**

   - Check headings across pages
   - Verify font sizes consistent
   - Verify heading hierarchy logical
   - Verify text colors consistent

4. **Spacing and Layout**

   - View different pages
   - Verify padding consistent
   - Verify margins consistent
   - Verify grid layouts uniform

5. **Theme Toggle**
   - Click theme toggle button
   - Verify dark/light mode switches
   - Verify all elements adapt
   - Verify preference persists

### Requirement 12: Accessibility

**Priority**: Medium  
**Description**: Application should be accessible to all users

#### Test Cases:

1. **Keyboard Navigation**

   - Use tab key to navigate
   - Verify focus indicators visible
   - Verify tab order logical
   - Verify all interactive elements accessible

2. **Screen Reader Labels**

   - Inspect form elements
   - Verify aria-labels present
   - Verify alt text on images
   - Verify semantic HTML used

3. **Color Contrast**

   - Check text against backgrounds
   - Verify sufficient contrast ratio
   - Verify links distinguishable
   - Verify focus states visible

4. **Form Accessibility**

   - View forms
   - Verify labels associated with inputs
   - Verify error messages announced
   - Verify required fields indicated

5. **Interactive Element Size**
   - Check buttons and links
   - Verify minimum touch target size (44px)
   - Verify adequate spacing between elements

## Test Execution Strategy

1. **Setup Phase**

   - Ensure dev server running on port 8080
   - Verify test database available
   - Prepare test data and accounts

2. **Execution Order**

   - Run critical tests first (auth, verification)
   - Then high priority (wallet, issuance, claiming)
   - Finally medium priority (responsive, accessibility)

3. **Test Data Requirements**

   - Test accounts for each role
   - Sample certificates
   - Test claim tokens
   - Mock wallet connections

4. **Success Criteria**
   - All critical tests pass: 100%
   - High priority tests pass: > 95%
   - Medium priority tests pass: > 90%
   - No blocking issues found

## Notes

- Some tests may require mock data or services
- Wallet integration tests may need WalletConnect mocking
- Blockchain transaction tests should use testnet
- Email functionality may need mock service
