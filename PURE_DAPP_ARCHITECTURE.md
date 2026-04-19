# Pure dApp Architecture: Hedera-Native RBAC & Operations

If CertChain transitions to a 100% decentralized application (dApp) eliminating Supabase entirely, the architecture must shift to rely solely on on-chain state, wallet authentication, and decentralized storage.

Here is how the system can achieve Role-Based Access Control (RBAC), hierarchical administration, and secure operations without a centralized backend.

## 1. Authentication & Identity
**Current (Supabase):** Email/Password + JWT Auth.
**Pure dApp:** Wallet-based Authentication.
- Users authenticate exclusively via Hedera-compatible wallets (e.g., HashPack, Blade Wallet) using WalletConnect.
- The user's identity is their Hedera Account ID (e.g., `0.0.12345`).
- Instead of sessions, the frontend verifies ownership of the account by asking the wallet to sign a strictly formatted, timestamped challenge message.

## 2. Role-Based Access Control (RBAC) & Hierarchy
**Current (Supabase):** PostgreSQL `user_roles` table with Row Level Security (RLS).
**Pure dApp:** Smart Contract Access Control.
To maintain the `Super Admin > Institution Admin > Instructor > Candidate` hierarchy, we deploy a **Registry Smart Contract** on Hedera (via Hedera Smart Contract Service - HSCS).

### The Registry Contract (Solidity)
```solidity
contract CertChainRegistry {
    enum Role { Candidate, Instructor, InstitutionAdmin, SuperAdmin }

    mapping(address => Role) public userRoles;
    mapping(address => address) public institutionInstructors; // Maps instructor to institution

    modifier onlySuperAdmin() {
        require(userRoles[msg.sender] == Role.SuperAdmin, "Unauthorized");
        _;
    }

    function assignRole(address user, Role newRole) external onlySuperAdmin {
        userRoles[user] = newRole;
    }

    // Additional logic for Institution Admins to add Instructors, etc.
}
```
**How it works:**
1. The dApp frontend queries the Smart Contract (via a read-only mirror node query) to check the connected wallet's role.
2. The UI conditionally renders dashboard options based on the returned role.
3. Operations (like minting) are protected by the contract's modifiers, making it physically impossible to bypass RBAC even if the frontend is compromised.

## 3. Certificate Minting (Replacing Edge Functions)
**Current (Supabase):** Deno Edge Function uses `VITE_HEDERA_OPERATOR_KEY` to mint HTS tokens.
**Pure dApp:** Direct User-Signed Minting via Smart Contract or HTS.
- **Problem with purely frontend HTS:** If the frontend holds an operator key, anyone can extract it and mint tokens.
- **Solution:** A **Factory Smart Contract**.
    - The Institution Admin / Instructor calls a `mintCertificate()` function on the Factory Smart Contract.
    - The contract verifies the caller's RBAC role.
    - If authorized, the *contract* (which holds the treasury/admin keys or uses Hedera precompiles) executes the HTS token minting and associates it with the recipient's account.
    - The user pays the gas fee via their connected wallet.

## 4. Metadata & Storage
**Current (Supabase):** Relational data mapping `token_id` to `recipient_name`.
**Pure dApp:** IPFS + HCS (Hedera Consensus Service).
- **Metadata:** When a certificate is issued, a JSON metadata file (containing recipient name, course details, date) is uploaded to IPFS (via Pinata directly from the frontend, using a scoped/restricted JWT, or via a decentralized node).
- **State Indexing:** We replace the Supabase SQL database by logging every action to a dedicated **HCS Topic**.
    - E.g., `TopicMessageSubmitTransaction` containing: `{"action": "ISSUE", "recipient": "0.0.999", "ipfs_hash": "Qm..."}`
    - The frontend queries the Hedera Mirror Node for this Topic ID to build a history of all issued certificates (the "Database").

## 5. Summary of the Pure dApp Stack
| Feature | Current Hybrid Stack | Pure dApp Stack |
| :--- | :--- | :--- |
| **Authentication** | Supabase Auth (Email/Pass) | Hedera Wallet Connect (HashPack) |
| **User Roles (RBAC)** | Postgres `user_roles` table | Solidity Smart Contract Mapping |
| **Database/History** | Supabase Postgres (SQL) | Hedera Mirror Node (HCS Topic Queries) |
| **Server Logic** | Supabase Edge Functions | Solidity Smart Contracts (HSCS) |
| **Storage** | Supabase Storage / IPFS | IPFS via decentralized gateway |

Moving to a pure dApp offers maximum decentralization and trustlessness, eliminating monthly SaaS costs (Supabase), but introduces complexity regarding Smart Contract deployment, gas fees paid by end-users, and slightly slower data querying (Mirror Node vs SQL).
