# CertChain - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** October 30, 2025  
**Status:** Production Ready  
**Platform:** Hedera Hashgraph

---

## 📋 Executive Summary

### Product Vision

CertChain is a decentralized certificate verification platform that eliminates credential fraud by leveraging blockchain technology. Built on Hedera Hashgraph, it provides tamper-proof, instantly verifiable, and truly owned credentials for educational institutions, professional bodies, and certificate holders worldwide.

### Problem Statement

Traditional certificate verification systems are plagued by:

- **$6B+ annual losses** from credential fraud globally
- **3-7 days verification time** with manual processes costing $10-50 per check
- **Centralized data silos** vulnerable to breaches and institutional closures
- **Limited cross-border recognition** hampering international mobility
- **45% employer fraud rate** in emerging markets

### Solution Overview

A blockchain-based certificate management platform featuring:

- **2-5 second issuance** with instant verification
- **$0.01 per certificate** (99.98% cost reduction)
- **Immutable blockchain records** on Hedera HTS & HCS
- **Decentralized IPFS storage** for permanent data availability
- **Wallet-based ownership** giving users full control

### Target Market

- **Primary:** Universities, colleges, professional certification bodies (3,000+ institutions in Africa)
- **Secondary:** Employers, government agencies, online learning platforms
- **Tertiary:** Individual certificate holders, verifiers

---

## 🎯 Product Goals & Success Metrics

### Business Goals

| Goal                 | Metric                          | Target (6 months) | Target (12 months) |
| -------------------- | ------------------------------- | ----------------- | ------------------ |
| Institution Adoption | Institutions onboarded          | 50+               | 500+               |
| Certificate Volume   | Certificates issued             | 10,000+           | 1M+                |
| Revenue              | MRR (Monthly Recurring Revenue) | $5,000            | $50,000            |
| Market Penetration   | African market share            | 2%                | 10%                |
| User Satisfaction    | NPS Score                       | 50+               | 70+                |

### Technical Goals

| Goal            | Metric                    | Target      |
| --------------- | ------------------------- | ----------- |
| Performance     | Certificate issuance time | < 5 seconds |
| Reliability     | System uptime             | 99.9%       |
| Scalability     | Concurrent transactions   | 1,000 TPS   |
| Cost Efficiency | Transaction cost          | < $0.01     |
| Security        | Zero security incidents   | 0 breaches  |

### User Experience Goals

| Goal         | Metric                           | Target       |
| ------------ | -------------------------------- | ------------ |
| Onboarding   | Time to first certificate        | < 10 minutes |
| Verification | Public verification success rate | 99%+         |
| Claim Rate   | Certificate claim rate           | 80%+         |
| Mobile Usage | Mobile verification traffic      | 60%+         |

---

## 👥 User Personas

### 1. Institution Administrator (Primary)

**Profile:**

- **Name:** Dr. Sarah Okonkwo
- **Role:** Registrar at Tech University Lagos
- **Age:** 42
- **Tech Savvy:** Moderate
- **Pain Points:**
  - Manual certificate verification takes weeks
  - Frequent calls from employers for verification
  - Risk of fake certificates damaging reputation
  - High operational costs for certificate management

**Goals:**

- Issue verified certificates quickly
- Reduce administrative burden
- Build institutional credibility
- Lower operational costs
- Modernize processes

**User Journey:**

1. Signs up institution account
2. Completes DID setup with Hedera wallet
3. Creates NFT collection for certificates
4. Configures HCS logging topic
5. Issues first certificate (< 10 min)
6. Invites staff members
7. Sets up API integrations
8. Monitors analytics dashboard

### 2. Certificate Issuer/Instructor (Primary)

**Profile:**

- **Name:** Prof. Michael Adebayo
- **Role:** Course Instructor
- **Age:** 38
- **Tech Savvy:** High
- **Pain Points:**
  - Time-consuming manual certificate creation
  - No way to track certificate distribution
  - Students lose certificates easily

**Goals:**

- Issue certificates efficiently
- Bulk upload for large classes
- Track issuance history
- Ensure certificate authenticity

**User Journey:**

1. Receives invitation email from institution
2. Sets up instructor account
3. Views assigned courses
4. Issues single certificate or batch upload
5. Monitors certificate claims
6. Reviews verification requests

### 3. Certificate Holder/Student (Primary)

**Profile:**

- **Name:** Amara Nwankwo
- **Role:** Recent Graduate
- **Age:** 24
- **Tech Savvy:** Moderate
- **Pain Points:**
  - Lost physical certificates
  - Delayed job applications waiting for verification
  - Difficulty sharing credentials internationally
  - Fear of certificate getting damaged

**Goals:**

- Receive and own certificates permanently
- Share credentials easily
- Prove qualifications instantly
- Build verifiable skill portfolio

**User Journey:**

1. Receives claim email with link
2. Clicks claim link → Certificate preview
3. Connects Hedera wallet (HashPack/Blade)
4. Signs transaction to claim NFT
5. Certificate appears in wallet
6. Generates QR code for sharing
7. Shares on LinkedIn/portfolio
8. Uses for job applications

### 4. Employer/Verifier (Secondary)

**Profile:**

- **Name:** James Okafor
- **Role:** HR Manager
- **Age:** 35
- **Tech Savvy:** Moderate
- **Pain Points:**
  - Costly background checks ($50-100 per hire)
  - Slow verification delays hiring process
  - Encountered fake certificates before
  - No unified verification system

**Goals:**

- Verify credentials instantly
- Reduce hiring costs
- Make confident hiring decisions
- Streamline onboarding

**User Journey:**

1. Receives candidate's certificate QR code
2. Opens CertChain verify page (no login required)
3. Scans QR code or enters certificate ID
4. Views instant verification result
5. Checks blockchain proof on HashScan
6. Downloads verification report
7. Makes hiring decision confidently

### 5. System Administrator (Internal)

**Profile:**

- **Name:** Developer/DevOps Team
- **Role:** Platform Operator
- **Tech Savvy:** Expert
- **Pain Points:**
  - Complex blockchain integrations
  - Need for high availability
  - Security monitoring
  - Cost optimization

**Goals:**

- Maintain 99.9% uptime
- Optimize Hedera transaction costs
- Ensure data integrity
- Scale infrastructure
- Monitor security threats

---

## ✨ Feature Requirements

### 1. Authentication & Authorization

#### 1.1 User Registration

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- Email/password registration
- Email verification via Supabase Auth
- Role selection (Institution Admin, Instructor, Student)
- Terms of Service acceptance
- Privacy Policy acknowledgment

**Acceptance Criteria:**

- User can register with valid email
- Confirmation email sent within 30 seconds
- Password requirements: min 8 chars, uppercase, number
- Role correctly assigned in database
- User redirected to appropriate dashboard

#### 1.2 DID-Based Authentication

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- Create Hedera DID for institutions
- Store DID in user profile
- Associate DID with Hedera account ID
- Format: `did:hedera:testnet:0.0.{accountId}`
- Validate DID format (regex check)

**Acceptance Criteria:**

- DID created successfully via edge function
- DID stored in `profiles` table
- DID displayed on dashboard
- DID used for certificate signing
- Explorer link to Hedera account

#### 1.3 Multi-Wallet Support

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- HashPack wallet integration
- Blade wallet integration
- Kabila wallet integration
- WalletConnect protocol
- Account disconnection

**Acceptance Criteria:**

- User can connect any supported wallet
- Wallet connection persists across sessions
- Account ID correctly retrieved
- Transactions signed via wallet
- Graceful wallet disconnection

### 2. Certificate Issuance

#### 2.1 Single Certificate Issuance

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- Form fields: Recipient name, email, course, description, skills
- Optional certificate image upload (max 5MB)
- Image preview before submission
- IPFS upload for image and metadata
- HTS NFT minting on Hedera
- Claim token generation (JWT)
- Email notification to recipient

**Acceptance Criteria:**

- Certificate issued in < 5 seconds
- NFT minted with correct serial number
- Metadata uploaded to IPFS
- Claim email sent successfully
- Certificate saved to database
- HCS event logged
- Activity tracked

**Technical Flow:**

```
1. Validate form inputs
2. Upload image to IPFS (if provided)
3. Generate certificate metadata
4. Upload metadata to IPFS
5. Mint NFT via edge function
6. Save to certificate_cache table
7. Generate claim token (UUID + JWT)
8. Log to HCS topic
9. Send claim email
10. Log activity
```

#### 2.2 Batch Certificate Issuance

**Priority:** P1 (Should Have)  
**Status:** ⚠️ Partially Implemented

**Requirements:**

- CSV file upload (format template provided)
- Preview before issuing
- Progress indicator
- Batch size: 1-1000 certificates
- Error handling for individual failures
- Summary report after completion

**Acceptance Criteria:**

- CSV parsed correctly
- Invalid rows highlighted
- Batch processed with retries
- Failed certificates reported
- Successful issuance > 95%
- Total time < 5 min for 100 certs

**CSV Format:**

```csv
recipient_name,recipient_email,course_name,description,skills
John Doe,john@example.com,Blockchain 101,Completed course,Smart Contracts;Hedera SDK
```

#### 2.3 Certificate Templates

**Priority:** P2 (Nice to Have)  
**Status:** 🔄 In Progress

**Requirements:**

- Create reusable templates
- Template fields: course name, description, default image
- Template selection during issuance
- Institution-specific templates
- Public template marketplace

### 3. Certificate Claiming

#### 3.1 Email Claim Flow

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- JWT-signed claim link sent via email
- Token expiry: 30 days
- Certificate preview without wallet
- Wallet connection prompt
- Token association check
- Automatic NFT transfer
- Claim confirmation email

**Acceptance Criteria:**

- Claim link valid and secure
- Preview shows correct certificate
- All wallets work for claiming
- Token auto-associated if needed
- NFT transferred to user wallet
- Claim event logged to HCS
- User sees success message

**Technical Flow:**

```
1. User clicks claim link
2. Validate JWT token
3. Check token expiry
4. Fetch certificate metadata
5. Display preview
6. Prompt wallet connection
7. Check token association
8. If not associated → TokenAssociateTransaction
9. Transfer NFT from treasury
10. Log claim event to HCS
11. Update database status
12. Show success + wallet link
```

#### 3.2 QR Code Claiming

**Priority:** P1 (Should Have)  
**Status:** ⚠️ Partially Implemented

**Requirements:**

- Generate QR code for claim link
- Mobile-optimized claim page
- Deep link to wallet apps
- Fallback to manual wallet connection

### 4. Certificate Verification

#### 4.1 Public Verification

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- No login required
- Certificate ID or QR code input
- Real-time blockchain verification
- Display certificate metadata
- Show issuer details
- Blockchain proof links
- IPFS metadata link
- HCS audit trail
- Revocation status check
- Download verification report

**Acceptance Criteria:**

- Verification completes < 3 seconds
- All certificate details displayed
- Blockchain links functional
- Revoked certificates flagged
- Mobile-responsive design
- Shareable verification URL

**Verification Logic:**

```typescript
1. Parse certificate ID (format: {tokenId}-{serialNumber})
2. Query Hedera Mirror Node API
3. Fetch NFT metadata from IPFS
4. Query HCS topic for events
5. Check revocation status
6. Verify issuer DID signature
7. Display results with proof links
```

#### 4.2 QR Code Scanning

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Requirements:**

- Camera access for QR scanning
- Auto-detect and verify
- Manual entry fallback
- Works on iOS and Android
- Quick scan mode

#### 4.3 Batch Verification API

**Priority:** P1 (Should Have)  
**Status:** 🔄 Planned

**Requirements:**

- REST API endpoint for batch verification
- Input: Array of certificate IDs
- Output: Verification results array
- Rate limiting: 100 requests/hour
- API key authentication

### 5. Dashboard & Analytics

#### 5.1 Institution Dashboard

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- Total certificates issued
- Certificates claimed vs unclaimed
- Recent issuance activity
- Staff members count
- Verification requests
- Charts: Issuance trends, claim rate
- Quick actions: Issue cert, invite staff

#### 5.2 Instructor Dashboard

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- My issued certificates
- Claim rate percentage
- Recent verifications
- Quick issue button
- Assigned courses (if applicable)

#### 5.3 Student Dashboard

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- My certificates (claimed)
- Pending claims
- Certificate details view
- Share buttons (LinkedIn, Twitter, Email)
- QR code generation
- Download PDF with QR

#### 5.4 Admin Analytics

**Priority:** P1 (Should Have)  
**Status:** ⚠️ Partially Implemented

**Features:**

- Platform-wide statistics
- Institution leaderboard
- Revenue metrics
- Transaction costs analysis
- Geographic distribution
- User growth charts

### 6. Settings & Configuration

#### 6.1 Account Settings

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- Profile information edit
- Email change (with verification)
- Password change
- Two-factor authentication (2FA)
- Account deletion

#### 6.2 Institution Settings

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- Institution profile (name, logo, website)
- DID management
- NFT collection token ID
- HCS topic ID
- Staff management
- Branding customization

#### 6.3 API Keys Management

**Priority:** P1 (Should Have)  
**Status:** ✅ Implemented

**Features:**

- Generate API keys
- Scoped permissions (read, write, admin)
- Key rotation
- Usage statistics
- Key revocation
- SHA-256 hashed storage

#### 6.4 Webhook Configuration

**Priority:** P1 (Should Have)  
**Status:** ✅ Implemented

**Features:**

- Configure webhook endpoints
- Event subscriptions (issued, claimed, verified, revoked)
- HMAC signature verification
- Retry logic (3 attempts, exponential backoff)
- Webhook logs
- Test webhook button

### 7. Integrations

#### 7.1 Hedera Integration

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Services Used:**

- **HTS (Token Service):** NFT minting
- **HCS (Consensus Service):** Event logging
- **DID SDK:** Identity management
- **Mirror Nodes:** Fast queries
- **Testnet/Mainnet:** Environment switching

**Edge Functions:**

- `hedera-create-did`: Create DID for institutions
- `hedera-mint-certificate`: Mint NFT certificates
- `hedera-hcs-log`: Log events to HCS
- `token-associate`: Associate token with account

#### 7.2 IPFS/Pinata Integration

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- Metadata upload
- File upload (images, PDFs)
- Gateway URLs
- Pinning service
- CID generation

**Edge Function:**

- `pinata-upload`: Upload to IPFS via Pinata API

#### 7.3 Email Integration

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Provider:** Resend API  
**Domain:** mail.certchain.app (Cloudflare subdomain)

**Email Types:**

- Certificate claim invitation
- Claim confirmation
- Institution invitation
- Contact form submissions
- Password reset
- Email verification

**Edge Functions:**

- `send-invitation-email`: Send staff/certificate invitations
- `send-contact-email`: Handle contact form

#### 7.4 LinkedIn Integration

**Priority:** P2 (Nice to Have)  
**Status:** 📋 Planned

**Features:**

- Add to LinkedIn profile
- Share certificate post
- Certification URL validation

### 8. Security Features

#### 8.1 Authentication Security

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- JWT tokens (access + refresh)
- Secure password hashing (bcrypt)
- Email verification required
- Session management
- Password strength requirements
- Account lockout after failed attempts

#### 8.2 Authorization & Access Control

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- Role-Based Access Control (RBAC)
- Row-Level Security (RLS) in Supabase
- API key scopes
- Resource-level permissions
- Institution isolation

**Roles:**

- Super Admin (platform management)
- Institution Admin (full institution access)
- Instructor (issue certificates)
- Student/User (claim & view)

#### 8.3 Data Security

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- API key SHA-256 hashing
- Webhook HMAC signatures
- Environment variable validation (Zod)
- Input sanitization
- SQL injection prevention (Supabase RLS)
- XSS protection
- CORS configuration

#### 8.4 Monitoring & Logging

**Priority:** P1 (Should Have)  
**Status:** ✅ Implemented

**Features:**

- Activity logs for all actions
- Error logging
- HCS immutable audit trail
- User activity tracking
- Security event alerts
- Performance monitoring

### 9. Mobile Experience

#### 9.1 Responsive Design

**Priority:** P0 (Must Have)  
**Status:** ✅ Implemented

**Features:**

- Mobile-first design
- Touch-optimized UI
- Responsive layouts
- Mobile navigation
- Bottom navigation for actions

#### 9.2 Progressive Web App (PWA)

**Priority:** P2 (Nice to Have)  
**Status:** 📋 Planned

**Features:**

- Installable on mobile
- Offline mode for viewing claimed certs
- Push notifications
- App icon & splash screen

#### 9.3 Native Mobile App

**Priority:** P3 (Future)  
**Status:** 📋 Planned

**Platform:** React Native  
**Features:**

- Same functionality as web
- Native wallet integration
- Biometric authentication
- QR code scanner

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend

```
React 18.3+ (with TypeScript 5.x)
├── Vite (Build tool)
├── React Router DOM 6.x (Routing)
├── TailwindCSS + shadcn/ui (Styling)
├── Zustand (State management)
├── React Query (Server state)
├── React Hook Form + Zod (Forms & validation)
├── Recharts (Analytics charts)
└── Lucide React (Icons)
```

#### Backend

```
Supabase (Backend-as-a-Service)
├── PostgreSQL (Relational database)
├── Edge Functions (Deno runtime)
│   ├── hedera-create-did
│   ├── hedera-mint-certificate
│   ├── hedera-hcs-log
│   ├── pinata-upload
│   ├── token-associate
│   ├── claim-certificate
│   ├── send-invitation-email
│   ├── send-contact-email
│   ├── admin-users
│   └── institution-staff
├── Auth (JWT-based authentication)
├── Storage (File uploads)
└── Realtime (Live updates)
```

#### Blockchain

```
Hedera Hashgraph (Testnet → Mainnet)
├── HTS (Token Service)
│   └── NFT Collection: 0.0.7115182
├── HCS (Consensus Service)
│   └── Event Topic: 0.0.7115183
├── DID (Decentralized Identity)
│   └── Format: did:hedera:testnet:0.0.{accountId}
├── Mirror Nodes (Query API)
└── JSON-RPC Relay (Future: Smart contracts)
```

#### Storage

```
IPFS (via Pinata)
├── Metadata storage
├── Certificate images
├── Gateway: azure-secure-leopard-586.mypinata.cloud
└── Pinning service
```

#### Wallets

```
Hedera Wallet Connect
├── HashPack
├── Blade Wallet
├── Kabila Wallet
└── Reown AppKit (WalletConnect v2)
```

#### Deployment

```
Cloudflare Pages
├── Frontend hosting
├── CDN
├── Custom domain
├── Preview deployments
└── Environment variables
```

### Database Schema

#### Core Tables

**profiles**

```sql
- id (uuid, PK) → references auth.users
- email (text)
- full_name (text)
- role (enum: super_admin, institution_admin, instructor, user)
- institution_id (uuid) → references institutions
- hedera_account_id (text)
- did (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**institutions**

```sql
- id (uuid, PK)
- name (text)
- slug (text, unique)
- logo_url (text)
- website (text)
- did (text)
- hedera_account_id (text)
- collection_token_id (text) → HTS token ID
- hcs_topic_id (text) → HCS topic ID
- subscription_tier (enum: free, starter, professional, enterprise)
- created_at (timestamp)
- updated_at (timestamp)
```

**certificate_cache**

```sql
- id (uuid, PK)
- certificate_id (text, unique) → UUID
- institution_id (uuid) → references institutions
- issued_by_user_id (uuid) → references profiles
- issuer_did (text)
- recipient_email (text)
- recipient_did (text, nullable)
- course_name (text)
- token_id (text) → HTS token ID
- serial_number (bigint) → NFT serial
- hedera_tx_id (text) → Transaction ID
- ipfs_cid (text) → Metadata CID
- status (enum: issued, claimed, revoked)
- issued_at (timestamp)
- claimed_at (timestamp, nullable)
- revoked_at (timestamp, nullable)
- metadata (jsonb) → Additional certificate data
```

**claim_tokens**

```sql
- id (uuid, PK)
- token (text, unique) → UUID token
- certificate_id (text) → references certificate_cache
- expires_at (timestamp)
- claimed_at (timestamp, nullable)
- created_at (timestamp)
```

**api_keys**

```sql
- id (uuid, PK)
- institution_id (uuid) → references institutions
- name (text)
- key_hash (text) → SHA-256 hash
- key_prefix (text) → First 8 chars for display
- scope (text[]) → Permissions array
- last_used_at (timestamp, nullable)
- expires_at (timestamp, nullable)
- created_at (timestamp)
```

**webhooks**

```sql
- id (uuid, PK)
- institution_id (uuid) → references institutions
- url (text)
- events (text[]) → Subscribed events
- secret (text) → HMAC secret
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

**webhook_logs**

```sql
- id (uuid, PK)
- webhook_id (uuid) → references webhooks
- event_type (text)
- payload (jsonb)
- response_status (integer)
- response_body (text)
- attempt_count (integer)
- delivered_at (timestamp, nullable)
- created_at (timestamp)
```

**activity_logs**

```sql
- id (uuid, PK)
- user_id (uuid) → references profiles
- institution_id (uuid) → references institutions
- action (text) → e.g., "certificate_issued"
- resource_type (text) → e.g., "certificate"
- resource_id (text)
- metadata (jsonb)
- created_at (timestamp)
```

### API Design

#### REST API Endpoints

**Authentication**

```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/verify-email
```

**Certificates**

```
POST   /certificates/issue
POST   /certificates/batch-issue
GET    /certificates/:id
GET    /certificates
PUT    /certificates/:id/revoke
POST   /certificates/:id/resend-claim
```

**Verification (Public)**

```
GET    /verify/:certificateId
POST   /verify/batch
GET    /verify/qr/:qrData
```

**Claim**

```
GET    /claim/:token
POST   /claim/:token/wallet
POST   /claim/:token/associate
POST   /claim/:token/transfer
```

**Institution**

```
GET    /institution/profile
PUT    /institution/profile
POST   /institution/staff/invite
GET    /institution/staff
DELETE /institution/staff/:userId
GET    /institution/analytics
```

**Webhooks**

```
GET    /webhooks
POST   /webhooks
PUT    /webhooks/:id
DELETE /webhooks/:id
GET    /webhooks/:id/logs
POST   /webhooks/:id/test
```

**API Keys**

```
GET    /api-keys
POST   /api-keys
DELETE /api-keys/:id
PUT    /api-keys/:id/rotate
```

#### Webhook Events

**Event Types:**

```typescript
-certificate.issued -
  certificate.claimed -
  certificate.verified -
  certificate.revoked -
  certificate.resent -
  staff.invited -
  staff.removed;
```

**Payload Format:**

```json
{
  "event": "certificate.issued",
  "timestamp": "2025-10-30T12:00:00Z",
  "data": {
    "certificate_id": "550e8400-e29b-41d4-a716-446655440000",
    "token_id": "0.0.7115182",
    "serial_number": 42,
    "recipient_email": "john@example.com",
    "course_name": "Blockchain 101",
    "issuer_did": "did:hedera:testnet:0.0.6834167"
  },
  "signature": "hmac-sha256-signature"
}
```

### Error Handling

#### Error Codes

```typescript
// Authentication Errors (401)
AUTH_REQUIRED;
INVALID_TOKEN;
TOKEN_EXPIRED;
INVALID_CREDENTIALS;

// Authorization Errors (403)
INSUFFICIENT_PERMISSIONS;
RESOURCE_FORBIDDEN;
INSTITUTION_MISMATCH;

// Validation Errors (400)
INVALID_INPUT;
MISSING_REQUIRED_FIELD;
INVALID_FORMAT;
FILE_TOO_LARGE;

// Resource Errors (404)
CERTIFICATE_NOT_FOUND;
INSTITUTION_NOT_FOUND;
USER_NOT_FOUND;

// Hedera Errors (500)
HEDERA_TRANSACTION_FAILED;
INSUFFICIENT_BALANCE;
INVALID_ACCOUNT_ID;
TOKEN_ASSOCIATION_FAILED;

// IPFS Errors (500)
IPFS_UPLOAD_FAILED;
IPFS_FETCH_FAILED;

// Rate Limiting (429)
RATE_LIMIT_EXCEEDED;
```

#### Error Response Format

```json
{
  "error": {
    "code": "HEDERA_TRANSACTION_FAILED",
    "message": "Failed to mint certificate NFT",
    "details": "Insufficient HBAR balance in operator account",
    "timestamp": "2025-10-30T12:00:00Z",
    "request_id": "req_1234567890"
  }
}
```

---

## 🔒 Security & Compliance

### Security Measures

#### Application Security

- HTTPS/TLS encryption for all traffic
- Content Security Policy (CSP) headers
- CORS configuration
- XSS protection via React sanitization
- SQL injection prevention (Supabase RLS)
- Input validation (Zod schemas)

#### Authentication Security

- Bcrypt password hashing
- JWT access & refresh tokens
- Email verification required
- Password strength requirements (min 8 chars, uppercase, number, symbol)
- Account lockout after 5 failed attempts
- 2FA support (future)

#### Authorization Security

- Role-Based Access Control (RBAC)
- Row-Level Security (RLS) policies
- Institution data isolation
- API key scope restrictions
- Resource-level permissions

#### Data Security

- API keys SHA-256 hashed
- Webhook secrets for HMAC verification
- Environment variables validated
- Database connection pooling
- Encrypted backups (Supabase)

#### Blockchain Security

- Operator key stored securely (Supabase secrets)
- Transaction signing in backend only
- DID verification for issuers
- Immutable audit trail (HCS)
- NFT metadata validation

### Compliance Considerations

#### GDPR (General Data Protection Regulation)

- User consent for data collection
- Right to access personal data
- Right to data deletion
- Data minimization principle
- Privacy by design

#### Data Retention

- Certificate metadata: Permanent (blockchain)
- User accounts: Until deletion requested
- Activity logs: 90 days
- Webhook logs: 30 days
- Email records: 30 days

#### Terms of Service & Privacy Policy

- Clear data usage explanation
- Cookie policy
- User rights explanation
- Dispute resolution process
- Liability limitations

---

## 📊 Business Model

### Pricing Tiers

#### Free Tier

**Price:** $0/month  
**Limits:**

- 10 certificates/month
- 1 staff member
- Basic analytics
- Email support
- Public verification

**Target:** Small institutions, individual instructors

#### Starter Tier

**Price:** $49/month  
**Limits:**

- 100 certificates/month
- 5 staff members
- Batch upload (CSV)
- API access (1,000 calls/month)
- Priority email support
- Webhooks (2 endpoints)

**Target:** Medium-sized institutions, bootcamps

#### Professional Tier

**Price:** $199/month  
**Limits:**

- 1,000 certificates/month
- 20 staff members
- Unlimited batch uploads
- API access (10,000 calls/month)
- Custom branding
- Webhooks (10 endpoints)
- Advanced analytics
- Chat support

**Target:** Universities, certification bodies

#### Enterprise Tier

**Price:** Custom (starting $999/month)  
**Limits:**

- Unlimited certificates
- Unlimited staff
- White-label solution
- Unlimited API calls
- Dedicated account manager
- SLA guarantee (99.9% uptime)
- Custom integrations
- On-premise deployment option
- Phone support

**Target:** Large universities, government agencies

### Revenue Projections

**Year 1 Goals:**

- 500 free tier users
- 50 starter tier subscribers → $2,450/month
- 20 professional tier subscribers → $3,980/month
- 5 enterprise tier subscribers → $5,000/month
- **Total MRR:** $11,430
- **Annual Revenue:** ~$137,000

**Cost Structure:**

- Hedera transactions: $0.01 per certificate (variable)
- Supabase: $25/month (scales to $100/month)
- IPFS (Pinata): $20/month (scales to $100/month)
- Email (Resend): $20/month (scales to $80/month)
- Cloudflare Pages: $20/month
- Monitoring (Sentry): $26/month
- Domain & SSL: $20/year
- **Total Monthly Cost:** ~$150-400/month
- **Gross Margin:** >95%

---

## 🧪 Testing Strategy

### Unit Tests

**Coverage Target:** 80%+  
**Framework:** Vitest

**Test Areas:**

- Utility functions
- Form validation
- Data transformations
- Error handling
- API client methods

### Integration Tests

**Framework:** Vitest + Testing Library

**Test Areas:**

- Authentication flows
- Certificate issuance
- Claim process
- Verification logic
- Webhook delivery

### End-to-End Tests

**Framework:** Playwright  
**Status:** 📋 Planned

**Test Scenarios:**

1. Complete issuance flow
2. Certificate claiming
3. Public verification
4. Batch upload
5. Staff invitation
6. API key creation
7. Webhook configuration

### Performance Tests

**Tool:** k6  
**Metrics:**

- Response time < 200ms (p95)
- Throughput > 100 req/sec
- Error rate < 0.1%

### Security Tests

**Tools:** OWASP ZAP, Snyk

**Areas:**

- SQL injection attempts
- XSS vulnerabilities
- Authentication bypass
- Authorization checks
- Rate limiting
- API key validation

---

## 🚀 Deployment & Operations

### Deployment Strategy

#### Frontend Deployment (Cloudflare Pages)

```bash
# Production deployment
npm run build:prod
wrangler pages deploy dist --project-name=certchain

# Preview deployment (automatic on PR)
npm run build:dev
wrangler pages deploy dist --branch=preview
```

#### Backend Deployment (Supabase)

```bash
# Deploy all edge functions
supabase functions deploy hedera-create-did
supabase functions deploy hedera-mint-certificate
supabase functions deploy hedera-hcs-log
supabase functions deploy pinata-upload
supabase functions deploy token-associate
supabase functions deploy claim-certificate
supabase functions deploy send-invitation-email
supabase functions deploy send-contact-email
supabase functions deploy admin-users
supabase functions deploy institution-staff
```

### Environment Configuration

**Testnet:**

```env
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_OPERATOR_ID=0.0.6834167
VITE_HCS_LOG_TOPIC_ID=0.0.7115183
VITE_COLLECTION_TOKEN_ID=0.0.7115182
```

**Mainnet:**

```env
VITE_HEDERA_NETWORK=mainnet
VITE_HEDERA_OPERATOR_ID=0.0.{MAINNET_ID}
VITE_HCS_LOG_TOPIC_ID=0.0.{MAINNET_TOPIC}
VITE_COLLECTION_TOKEN_ID=0.0.{MAINNET_TOKEN}
```

### Monitoring & Alerting

**Metrics to Monitor:**

- Certificate issuance success rate
- Claim rate
- Verification requests
- API response times
- Error rates
- Hedera transaction costs
- IPFS upload success rate
- Webhook delivery rate

**Alerting Thresholds:**

- Error rate > 1% → Alert
- Response time > 5s → Warning
- Hedera transaction failure > 5% → Critical
- Claim rate < 50% → Investigation

### Backup & Recovery

**Database Backups:**

- Supabase automatic daily backups
- Point-in-time recovery (7 days)
- Export critical tables weekly

**Disaster Recovery:**

- Certificate data on blockchain (immutable)
- IPFS metadata pinned (permanent)
- Database restore < 1 hour RPO
- Service restore < 2 hours RTO

---

## 📈 Success Metrics & KPIs

### Product Metrics

**Activation:**

- Time to first certificate: < 10 minutes
- Institution onboarding completion rate: > 80%

**Engagement:**

- Certificates issued per institution per month: 20+
- Certificate claim rate: > 70%
- Verification requests: 10+ per certificate

**Retention:**

- Monthly Active Institutions: 80%+
- Churn rate: < 5% monthly

**Growth:**

- Week-over-week institution signups: +10%
- Certificate volume growth: +20% monthly

### Business Metrics

**Revenue:**

- MRR growth: +15% monthly
- ARPU (Average Revenue Per User): $50+
- CAC (Customer Acquisition Cost): < $100
- LTV (Lifetime Value): > $1,000
- LTV/CAC ratio: > 3:1

**Efficiency:**

- Certificate issuance cost: < $0.01
- Verification cost: $0 (free)
- Gross margin: > 90%

### Technical Metrics

**Performance:**

- Certificate issuance time: < 5 seconds
- Verification time: < 3 seconds
- API response time (p95): < 200ms
- Page load time: < 2 seconds

**Reliability:**

- System uptime: 99.9%+
- Hedera transaction success rate: > 99%
- IPFS upload success rate: > 99%
- Email delivery rate: > 98%

**Security:**

- Security incidents: 0
- Failed authentication attempts: < 1%
- API key compromises: 0

---

## 🗺️ Roadmap

### Phase 1: MVP Launch (Q4 2025) ✅

- [x] Core issuance & claiming
- [x] Public verification
- [x] Hedera integration (HTS, HCS, DID)
- [x] Multi-wallet support
- [x] Basic dashboard
- [x] Email notifications
- [x] API keys & webhooks
- [ ] Production deployment
- [ ] Security audit
- [ ] Beta testing with 10 institutions

### Phase 2: Growth Features (Q1 2026)

- [ ] Mobile app (React Native)
- [ ] Certificate templates marketplace
- [ ] Advanced analytics
- [ ] Batch operations optimization
- [ ] LinkedIn integration
- [ ] Multi-language support (5 languages)
- [ ] Video tutorials
- [ ] AI-powered fraud detection

### Phase 3: Enterprise Features (Q2 2026)

- [ ] White-label solution
- [ ] On-premise deployment
- [ ] Custom integrations
- [ ] Advanced reporting
- [ ] Compliance certifications (SOC 2)
- [ ] Government partnerships
- [ ] Skills framework
- [ ] Career progression tracking

### Phase 4: Innovation (Q3 2026)

- [ ] Zero-knowledge proofs (selective disclosure)
- [ ] Cross-chain bridges
- [ ] DAO governance
- [ ] Certificate marketplace
- [ ] AI credential verification
- [ ] Verifiable presentations
- [ ] Privacy-preserving verification

---

## 🤝 Stakeholder Communication

### Regular Updates

**Weekly:**

- Development team standup
- Bug triage
- Performance review

**Monthly:**

- Product roadmap review
- Metrics dashboard review
- Customer feedback review
- Investor update

**Quarterly:**

- Strategic planning
- Budget review
- Roadmap adjustment
- Major feature launches

### Feedback Channels

**Users:**

- In-app feedback form
- Email: feedback@certchain.app
- Discord community
- User interviews (monthly)

**Institutions:**

- Dedicated account manager
- Quarterly business reviews
- Feature request portal
- Beta testing program

**Developers:**

- GitHub issues
- Developer documentation
- API changelog
- SDK updates

---

## 📚 Appendices

### Appendix A: Glossary

**DID:** Decentralized Identifier - A globally unique identifier that does not require a centralized registry

**HCS:** Hedera Consensus Service - A service for creating decentralized, verifiable logs

**HTS:** Hedera Token Service - A service for creating and managing tokens/NFTs

**IPFS:** InterPlanetary File System - A decentralized storage network

**NFT:** Non-Fungible Token - A unique digital asset on a blockchain

**RLS:** Row-Level Security - Database security that restricts access at the row level

**JWT:** JSON Web Token - A standard for securely transmitting information between parties

### Appendix B: Resources

**Documentation:**

- Hedera Docs: https://docs.hedera.com
- Supabase Docs: https://supabase.com/docs
- Pinata Docs: https://docs.pinata.cloud

**Tools:**

- HashScan Explorer: https://hashscan.io
- Hedera Portal: https://portal.hedera.com
- Supabase Studio: https://supabase.com/dashboard

**Community:**

- Hedera Discord: https://hedera.com/discord
- CertChain GitHub: https://github.com/yourusername/certchain

### Appendix C: Change Log

**v1.0 (October 30, 2025):**

- Initial PRD creation
- Complete feature requirements
- Technical architecture
- Business model
- Security specifications

---

**Document Owner:** Product Team  
**Last Updated:** October 30, 2025  
**Next Review:** November 30, 2025  
**Status:** Living Document
