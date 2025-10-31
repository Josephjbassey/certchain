# CertChain - Standardized PRD for TestSprite

## Product Overview

**Product Name:** CertChain  
**Type:** Decentralized Certificate Verification Platform  
**Platform:** Web Application (React + Vite)  
**Blockchain:** Hedera Hashgraph  
**Status:** Production Ready

## Core Value Proposition

CertChain eliminates credential fraud by providing tamper-proof, instantly verifiable, blockchain-anchored certificates. It reduces verification time from 3-7 days to 2-5 seconds and cost from $10-50 to $0.01 per certificate.

## Target Users

1. **Institution Administrators** - Issue and manage certificates
2. **Instructors/Issuers** - Create and distribute certificates to students
3. **Certificate Holders/Students** - Claim, own, and share their credentials
4. **Employers/Verifiers** - Verify credentials instantly without login
5. **Super Admins** - Platform management and monitoring

## Key Features

### 1. Authentication & User Management

- **Email/Password Registration**: Supabase Auth with email verification
- **Role-Based Access Control**: 4 roles (candidate, instructor, institution_admin, super_admin)
- **Hedera DID Setup**: Create and manage Hedera Decentralized Identifiers
- **Multi-Wallet Support**: HashPack, Blade, Kabila via WalletConnect
- **Profile Management**: User profile editing with wallet connections
- **Session Management**: Secure session handling with auto-logout

**User Flow:**

1. User registers with email/password
2. Email verification sent
3. User selects role during onboarding
4. Setup Hedera wallet connection (for issuers)
5. Create Hedera DID (for institutions)
6. Access role-specific dashboard

### 2. Certificate Issuance

- **Single Certificate Creation**: Form-based issuance with image upload
- **Batch Certificate Upload**: CSV upload for bulk issuance (1-1000 certs)
- **IPFS Metadata Storage**: Decentralized storage via Pinata
- **NFT Minting**: Hedera Token Service (HTS) NFT creation
- **Claim Token Generation**: Secure JWT tokens for certificate claiming
- **Email Notifications**: Automated claim emails to recipients
- **HCS Event Logging**: Immutable audit trail on Hedera Consensus Service

**User Flow (Instructor):**

1. Navigate to "Issue Certificate" page
2. Fill form: recipient name, email, course, description, skills
3. Upload optional certificate image (max 5MB)
4. Preview certificate
5. Submit → Backend mints NFT on Hedera
6. System uploads metadata to IPFS
7. Claim email sent to recipient
8. Success confirmation with certificate ID

**Expected Outcome:**

- Certificate issued in < 5 seconds
- NFT minted with unique serial number
- Metadata permanently stored on IPFS
- Claim email delivered within 30 seconds

### 3. Certificate Claiming

- **Secure Claim Links**: JWT-signed links with 30-day expiry
- **Certificate Preview**: View before claiming (no wallet required)
- **Wallet Connection**: Connect Hedera wallet to receive NFT
- **Token Association**: Automatic token association if needed
- **NFT Transfer**: Certificate transferred to user's wallet
- **Claim Confirmation**: Email notification after successful claim

**User Flow (Student):**

1. Receive claim email with secure link
2. Click link → Certificate preview page
3. View certificate details (issuer, course, description)
4. Click "Claim Certificate"
5. Connect Hedera wallet (HashPack/Blade/Kabila)
6. Approve token association (if first time)
7. Certificate NFT transferred to wallet
8. View certificate in wallet and on dashboard

**Expected Outcome:**

- Certificate claimed in < 30 seconds
- NFT visible in user's Hedera wallet
- Certificate ownership transferred permanently
- User can now share and verify credential

### 4. Certificate Verification

- **Public Verification Portal**: No login required
- **QR Code Scanning**: Mobile-friendly QR scanner
- **Certificate ID Lookup**: Search by certificate ID or email
- **Blockchain Proof**: Direct link to HashScan explorer
- **Verification Report**: Downloadable PDF report
- **Real-time Status**: Shows if certificate is valid, revoked, or expired

**User Flow (Employer):**

1. Navigate to public /verify page
2. Either scan QR code or enter certificate ID
3. View instant verification result:
   - Certificate status (valid/invalid)
   - Issuer details (institution name, DID)
   - Recipient information
   - Issuance date
   - Blockchain transaction ID
4. Click "View on HashScan" to see blockchain proof
5. Download verification report (optional)
6. Make hiring decision

**Expected Outcome:**

- Verification completes in < 2 seconds
- Blockchain proof accessible via HashScan
- Clear validity status displayed
- No registration required

### 5. Dashboard & Analytics

- **Role-Based Dashboards**: Custom views for each user role
- **Certificate Statistics**: Total issued, claimed, verified
- **Activity Timeline**: Recent actions and events
- **User Management** (Admin): Create, edit, delete users
- **Institution Management** (Admin): Manage organizations
- **Activity Logs** (Admin): Comprehensive audit trail
- **Staff Invitations**: Invite instructors to institutions

**User Flow (Institution Admin):**

1. Login to dashboard
2. View overview:
   - Total certificates issued
   - Claim rate percentage
   - Recent verifications
   - Active instructors
3. Navigate to "Issue Certificate" or "Certificates" page
4. Manage staff via "Institution Settings"
5. View activity logs for audit purposes

### 6. Edge Functions (Backend)

- **hedera-mint-certificate**: Mints NFT certificates on Hedera
- **claim-certificate**: Handles certificate claiming process
- **verify-certificate**: Verifies certificate authenticity
- **pinata-upload**: Uploads metadata to IPFS
- **create-hedera-did**: Creates Hedera DIDs for institutions
- **Shared Utilities**:
  - Error handler for standardized responses
  - Validators for input validation
  - Logger for structured logging
  - Auth helpers for role-based access

## Technical Architecture

### Frontend Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19 (dev server on port 8080)
- **Routing**: React Router DOM with role-based routes
- **State Management**: React Context + TanStack Query
- **Styling**: TailwindCSS + Radix UI components
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toast library

### Backend Stack

- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Edge Functions**: Deno-based serverless functions
- **Blockchain**: Hedera Hashgraph (Testnet/Mainnet)
- **Storage**: IPFS via Pinata
- **Real-time**: Supabase Realtime subscriptions

### Key Integrations

- **Hedera SDK** v2.75.0: Transaction creation and signing
- **Hedera Wallet Connect** v2.0.3: DApp connector
- **WalletConnect Modal** v2.7.0: Wallet UI
- **Supabase Client** v2.75.0: Database and auth
- **IPFS/Pinata**: Decentralized metadata storage

## User Roles & Permissions

### Super Admin

- Full system access
- User management (CRUD all users)
- Institution management
- System configuration
- Activity log viewing
- Platform analytics

### Institution Admin

- Manage own institution
- Issue certificates
- Invite/manage instructors
- View institution analytics
- Setup Hedera DID
- Configure NFT collection

### Instructor

- Issue certificates to students
- View own issued certificates
- Batch certificate upload
- Track certificate claims
- Access course-specific data

### Candidate (Student)

- Claim certificates
- View owned certificates
- Share certificate QR codes
- Update profile
- Connect Hedera wallet

## Success Criteria

### Performance

- Certificate issuance: < 5 seconds
- Certificate verification: < 2 seconds
- Page load time: < 3 seconds
- System uptime: 99.9%

### Usability

- Onboarding time: < 10 minutes
- Certificate claim rate: > 80%
- Verification success rate: 99%
- Mobile verification traffic: 60%+

### Security

- Zero security breaches
- All data encrypted at rest and in transit
- Row Level Security enforced on all tables
- JWT tokens for secure claims
- DID-based authentication for issuers

## Testing Requirements

### Critical User Flows

1. **Registration & Onboarding**: New user can register, verify email, and access dashboard
2. **Certificate Issuance**: Instructor can issue certificate successfully
3. **Certificate Claiming**: Student can claim certificate to wallet
4. **Certificate Verification**: Employer can verify certificate without login
5. **Wallet Connection**: User can connect HashPack/Blade wallet
6. **Role-Based Access**: Each role only accesses permitted features

### Edge Cases

- Expired claim tokens
- Invalid certificate IDs
- Wallet connection failures
- IPFS upload timeouts
- Hedera network congestion
- Duplicate certificate claims
- Invalid CSV format (batch upload)
- Missing required fields

### Security Tests

- SQL injection prevention
- XSS attack prevention
- CSRF protection
- RLS policy enforcement
- JWT token validation
- Rate limiting on API calls
- Input sanitization

### Performance Tests

- 100 concurrent certificate issuances
- 1000 verification requests/minute
- Batch upload of 1000 certificates
- Database query optimization
- IPFS upload under poor network
- Frontend rendering with large datasets

## Known Limitations

- Hedera mainnet costs $0.0001 per transaction (testnet is free)
- IPFS gateway latency varies (3-10 seconds)
- Email delivery depends on third-party service
- Wallet extensions required for claiming
- Maximum 1000 certificates per batch upload
- Certificate images limited to 5MB
