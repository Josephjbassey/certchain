# CertChain Project Analysis

## Project Overview

CertChain is a decentralized application for issuing, verifying, and managing tamper-proof certificates as NFTs on the Hedera Hashgraph network. The project is built with a modern tech stack, including React, TypeScript, and Vite for the frontend, and leverages Supabase for backend services and database management. It integrates with Hedera for blockchain functionalities and IPFS for decentralized storage.

### Key Technologies

*   **Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui
*   **Backend:** Supabase (Edge Functions, PostgreSQL)
*   **Blockchain:** Hedera Hashgraph (HTS, HCS, DID SDK)
*   **Storage:** IPFS (via Pinata)
*   **Deployment:** Cloudflare Pages

## Building and Running

### Prerequisites

*   Node.js 18+
*   Hedera testnet account
*   Supabase project
*   Pinata account

### Installation and Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Copy the `.env.example` file to a new file named `.env` and fill in the required values for your Hedera, Supabase, and Pinata accounts.

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

### Building and Deployment

*   **Build for production:**
    ```bash
    npm run build
    ```

*   **Deploy to Cloudflare Pages:**
    ```bash
    npm run deploy:prod
    ```

### Testing and Linting

*   **Run tests:**
    ```bash
    npm run test
    ```

*   **Lint the code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Code Style:** The project uses ESLint for code linting and Prettier for code formatting. The configuration can be found in the `eslint.config.js` and `prettier.config.js` files.
*   **Testing:** The project uses Vitest for unit and integration testing. Test files are located alongside the source files with a `.test.ts` or `.test.tsx` extension.
*   **Routing:** The project uses React Router for routing. All routes are defined in the `src/App.tsx` file.
*   **State Management:** The project uses React Context and TanStack Query for state management.
*   **Component Library:** The project uses shadcn/ui for its component library.
*   **Hedera Integration:** All interactions with the Hedera network are handled through the `src/lib/hedera/service.ts` file, which communicates with Supabase Edge Functions.
