# Legal Pages Documentation

## Overview

This document describes the newly added Terms of Service and Privacy Policy pages for CertChain.

## Files Created

### 1. Terms of Service (`src/pages/TermsOfService.tsx`)

Comprehensive legal terms covering:

**14 Main Sections:**

1. **Acceptance of Terms** - Agreement to use the platform
2. **Description of Service** - What CertChain offers (NFT certificates, IPFS storage, DIDs)
3. **User Accounts and Roles** - Four roles: super_admin, institution_admin, instructor, candidate
4. **Certificate Issuance and Claims** - Institution responsibilities and ownership
5. **Blockchain and Wallet Integration** - Hedera network disclaimers, wallet responsibility
6. **Prohibited Activities** - Fraud prevention, security rules
7. **Intellectual Property** - Platform ownership rights
8. **Fees and Payments** - Subscription fees, transaction fees, refund policy
9. **Limitation of Liability** - Service disclaimers and liability caps
10. **Indemnification** - User responsibility for violations
11. **Termination** - Account suspension and termination rules
12. **Governing Law and Disputes** - Jurisdiction and dispute resolution
13. **Privacy** - Links to Privacy Policy
14. **Contact Information** - Legal contact details

**Key Features:**

- Blockchain-specific clauses (irreversible transactions, wallet security)
- Role-based user responsibilities
- Clear certificate ownership and revocation rights
- Hedera network fee disclaimers
- IPFS permanence notices

### 2. Privacy Policy (`src/pages/PrivacyPolicy.tsx`)

GDPR and CCPA compliant privacy policy covering:

**13 Main Sections:**

1. **Introduction** - Overview of data practices
2. **Information We Collect** - User data, device data, blockchain data
3. **How We Use Your Information** - Service delivery, improvement, security
4. **Information Sharing and Disclosure** - When and why we share data
5. **Data Retention** - How long we keep different types of data
6. **Data Security** - Technical and organizational safeguards
7. **Your Rights and Choices** - Access, deletion, portability, privacy controls
8. **Cookies and Tracking** - Types of cookies and how to manage them
9. **International Data Transfers** - Cross-border data handling
10. **Children's Privacy** - COPPA compliance (under 13/16)
11. **Changes to This Privacy Policy** - Update notification process
12. **Contact Us** - Privacy contact information
13. **Regional-Specific Information** - CCPA (California) and GDPR (EU) rights

**Key Features:**

- Blockchain transparency notices (public, immutable data)
- Detailed third-party service providers (Supabase, Hedera, Pinata)
- User privacy controls from settings page
- Cookie management options
- Regional compliance (CCPA, GDPR)
- Data retention schedules
- Security measures (encryption, 2FA, access controls)

## Design Features

Both pages include:

- ✅ Consistent header with logo and home button
- ✅ Professional layout with proper typography
- ✅ Icon-enhanced headings for visual hierarchy
- ✅ Card-based important notices (blue/amber highlights)
- ✅ Cross-links between ToS and Privacy Policy
- ✅ Responsive design with container constraints
- ✅ Dark mode support via theme provider
- ✅ Navigation buttons (Back to Home, View Other Policy)
- ✅ Last updated dates
- ✅ Contact information cards

## Routing

### Routes Added to `App.tsx`:

```tsx
<Route path="/terms-of-service" element={<TermsOfService />} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
```

### Footer Links Added to `Index.tsx`:

Under the "Company" section:

- Terms of Service
- Privacy Policy

## Access Points

Users can access these pages from:

1. **Homepage footer** - Company section links
2. **Direct URLs**:
   - `/terms-of-service`
   - `/privacy-policy`
3. **Cross-references** - Each policy links to the other
4. **Future implementations**:
   - Signup page (checkbox: "I agree to Terms of Service")
   - Settings pages (privacy controls reference)
   - Contact/Support pages

## Customization Required

Before deploying to production, update the following placeholders:

### Terms of Service:

- `[Your Jurisdiction]` (Section 12) - Replace with actual legal jurisdiction
- `[Your Business Address]` (Section 14) - Add actual business address
- `legal@certchain.io` - Verify email address is active
- Contact form link validation

### Privacy Policy:

- `[Your Business Address]` (Section 12) - Add actual mailing address
- `[City, State, ZIP Code]` (Section 12) - Complete address details
- `[Country]` (Section 12) - Add country
- `privacy@certchain.io` - Verify email is active
- `dpo@certchain.io` - Set up DPO email if required by GDPR
- Regional compliance sections - Adjust based on target markets

## Legal Review Recommended

⚠️ **Important**: These documents are templates and should be reviewed by a qualified attorney before use in production. Consider:

1. **Jurisdiction-specific requirements** - Local laws may require additional clauses
2. **Industry regulations** - Education sector may have specific compliance needs
3. **International users** - Multi-jurisdictional considerations
4. **Blockchain-specific laws** - Evolving regulations around crypto/NFTs
5. **Data protection laws** - GDPR, CCPA, and other regional privacy laws
6. **Educational records** - FERPA compliance if applicable
7. **Age verification** - COPPA and international age requirements

## Testing

To test the new pages:

1. **Navigate to homepage** (`/`)
2. **Scroll to footer**
3. **Click "Terms of Service"** under Company section
4. **Verify page loads** with proper formatting
5. **Click "Privacy Policy"** from ToS page
6. **Verify cross-links work** between both pages
7. **Test "Back to Home" button**
8. **Check dark mode** toggle works correctly
9. **Verify responsive design** on mobile/tablet
10. **Validate all internal links** work correctly

## Future Enhancements

Consider adding:

- [ ] Acceptance tracking (log when users accept ToS)
- [ ] Version history (track policy changes over time)
- [ ] PDF download option for both documents
- [ ] Print-friendly styling
- [ ] Breadcrumb navigation
- [ ] Table of contents with anchor links
- [ ] Search functionality for long documents
- [ ] Multilingual versions
- [ ] Cookie consent banner integration
- [ ] Terms acceptance checkbox on signup form

## Maintenance

Keep policies updated when:

- Adding new features or services
- Changing data collection practices
- Integrating new third-party services
- Expanding to new jurisdictions
- Responding to legal/regulatory changes
- User feedback indicates unclear sections

**Review Schedule**: Quarterly review recommended, with immediate updates for material changes.

---

**Created**: October 24, 2025
**Last Updated**: October 24, 2025
**Status**: Ready for legal review and customization
