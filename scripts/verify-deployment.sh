#!/bin/bash

# CertChain Deployment Verification Script
# Hedera Africa Hackathon 2025 Submission

set -e

echo "🔷 CertChain Deployment Verification"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    pass "Environment variables loaded from .env"
else
    fail "No .env file found"
    exit 1
fi

echo ""
echo "1️⃣  Checking Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check frontend environment variables
if [ -n "$VITE_HEDERA_NETWORK" ]; then
    pass "VITE_HEDERA_NETWORK: $VITE_HEDERA_NETWORK"
else
    fail "VITE_HEDERA_NETWORK not set"
fi

if [ -n "$VITE_SUPABASE_URL" ]; then
    pass "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
else
    fail "VITE_SUPABASE_URL not set"
fi

if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
    pass "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."
else
    fail "VITE_SUPABASE_ANON_KEY not set"
fi

if [ -n "$VITE_HCS_LOG_TOPIC_ID" ]; then
    pass "VITE_HCS_LOG_TOPIC_ID: $VITE_HCS_LOG_TOPIC_ID"
else
    warn "VITE_HCS_LOG_TOPIC_ID not set"
fi

if [ -n "$VITE_COLLECTION_TOKEN_ID" ]; then
    pass "VITE_COLLECTION_TOKEN_ID: $VITE_COLLECTION_TOKEN_ID"
else
    warn "VITE_COLLECTION_TOKEN_ID not set"
fi

if [ -n "$VITE_WALLETCONNECT_PROJECT_ID" ]; then
    pass "VITE_WALLETCONNECT_PROJECT_ID set"
else
    warn "VITE_WALLETCONNECT_PROJECT_ID not set (wallet connection may not work)"
fi

echo ""
echo "2️⃣  Verifying Hedera Resources"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check HTS Token
if [ -n "$VITE_COLLECTION_TOKEN_ID" ]; then
    info "Checking token $VITE_COLLECTION_TOKEN_ID on Hedera testnet..."
    TOKEN_RESPONSE=$(curl -s "https://testnet.mirrornode.hedera.com/api/v1/tokens/$VITE_COLLECTION_TOKEN_ID")

    if echo "$TOKEN_RESPONSE" | grep -q "token_id"; then
        TOKEN_NAME=$(echo "$TOKEN_RESPONSE" | grep -o '"name":"[^"]*"' | head -1 | sed 's/"name":"//;s/"$//')
        TOKEN_SYMBOL=$(echo "$TOKEN_RESPONSE" | grep -o '"symbol":"[^"]*"' | head -1 | sed 's/"symbol":"//;s/"$//')
        pass "HTS Token found: $TOKEN_NAME ($TOKEN_SYMBOL)"
        info "🔗 HashScan: https://hashscan.io/testnet/token/$VITE_COLLECTION_TOKEN_ID"
    else
        fail "HTS Token $VITE_COLLECTION_TOKEN_ID not found on testnet"
    fi
else
    warn "Skipping token check (VITE_COLLECTION_TOKEN_ID not set)"
fi

# Check HCS Topic
if [ -n "$VITE_HCS_LOG_TOPIC_ID" ]; then
    info "Checking topic $VITE_HCS_LOG_TOPIC_ID on Hedera testnet..."
    TOPIC_RESPONSE=$(curl -s "https://testnet.mirrornode.hedera.com/api/v1/topics/$VITE_HCS_LOG_TOPIC_ID")

    if echo "$TOPIC_RESPONSE" | grep -q "topic_id"; then
        pass "HCS Topic found: $VITE_HCS_LOG_TOPIC_ID"
        info "🔗 HashScan: https://hashscan.io/testnet/topic/$VITE_HCS_LOG_TOPIC_ID"

        # Check for messages
        MESSAGES_RESPONSE=$(curl -s "https://testnet.mirrornode.hedera.com/api/v1/topics/$VITE_HCS_LOG_TOPIC_ID/messages?limit=1")
        if echo "$MESSAGES_RESPONSE" | grep -q "messages"; then
            pass "HCS Topic has messages"
        else
            warn "HCS Topic has no messages yet"
        fi
    else
        fail "HCS Topic $VITE_HCS_LOG_TOPIC_ID not found on testnet"
    fi
else
    warn "Skipping topic check (VITE_HCS_LOG_TOPIC_ID not set)"
fi

echo ""
echo "3️⃣  Testing Supabase Edge Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FUNCTIONS=(
    "hedera-create-did"
    "pinata-upload"
    "admin-users"
    "institution-staff"
)

for func in "${FUNCTIONS[@]}"; do
    info "Testing $func..."
    FUNC_URL="$VITE_SUPABASE_URL/functions/v1/$func"

    # Test with HEAD request to avoid triggering actual operations
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X HEAD "$FUNC_URL" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "000" ]; then
        fail "$func: Cannot connect"
    elif [ "$HTTP_CODE" = "404" ]; then
        fail "$func: Not found (not deployed?)"
    elif [ "$HTTP_CODE" = "401" ]; then
        warn "$func: Requires authentication (expected for some functions)"
    elif [ "$HTTP_CODE" = "405" ]; then
        pass "$func: Deployed (Method Not Allowed is OK for HEAD request)"
    elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        pass "$func: Deployed and accessible"
    else
        warn "$func: Returned HTTP $HTTP_CODE"
    fi
done

echo ""
echo "4️⃣  Testing DID Creation Function"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

info "Sending test request to hedera-create-did..."
DID_RESPONSE=$(curl -s -X POST "$VITE_SUPABASE_URL/functions/v1/hedera-create-did" \
    -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"userAccountId": "0.0.123456", "network": "testnet"}' 2>/dev/null || echo '{"error": "Connection failed"}')

if echo "$DID_RESPONSE" | grep -q "did:hedera"; then
    DID=$(echo "$DID_RESPONSE" | grep -o 'did:hedera:[^"]*' | head -1)
    pass "DID creation works: $DID"
elif echo "$DID_RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$DID_RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//')
    fail "DID creation failed: $ERROR"
else
    warn "DID creation response unclear"
fi

echo ""
echo "5️⃣  Checking Frontend Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "package.json" ]; then
    pass "package.json found"

    # Check for required dependencies
    if grep -q "@hashgraph/hedera-wallet-connect" package.json; then
        pass "Hedera Wallet Connect dependency found"
    else
        warn "Hedera Wallet Connect dependency not found"
    fi

    if grep -q "@supabase/supabase-js" package.json; then
        pass "Supabase client dependency found"
    else
        fail "Supabase client dependency not found"
    fi
else
    fail "package.json not found"
fi

if [ -f "vite.config.ts" ]; then
    pass "Vite config found"
else
    warn "vite.config.ts not found"
fi

# Try to build (if npm/bun available)
if command -v npm &> /dev/null || command -v bun &> /dev/null; then
    info "Attempting to build project..."

    if command -v bun &> /dev/null; then
        BUILD_OUTPUT=$(bun run build 2>&1 || echo "Build failed")
    else
        BUILD_OUTPUT=$(npm run build 2>&1 || echo "Build failed")
    fi

    if echo "$BUILD_OUTPUT" | grep -q "Build failed"; then
        fail "Build failed"
        warn "Run 'npm run build' or 'bun run build' manually to see errors"
    elif [ -d "dist" ]; then
        pass "Build successful (dist/ folder created)"
        DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        info "Build size: $DIST_SIZE"
    else
        warn "Build may have issues (dist/ folder not found)"
    fi
else
    warn "npm/bun not found, skipping build test"
fi

echo ""
echo "6️⃣  Checking Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOCS=(
    "README.md"
    "HACKATHON_SUBMISSION.md"
    "HEDERA_DEPLOYMENT.md"
    "DEMO_VIDEO_SCRIPT.md"
    "SUBMISSION_TESTING_CHECKLIST.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        pass "$doc exists"
        WORD_COUNT=$(wc -w < "$doc")
        if [ "$WORD_COUNT" -gt 100 ]; then
            info "  $WORD_COUNT words"
        else
            warn "  $WORD_COUNT words (seems short)"
        fi
    else
        fail "$doc not found"
    fi
done

echo ""
echo "7️⃣  Checking Repository"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".git" ]; then
    pass "Git repository initialized"

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        warn "Uncommitted changes detected"
        git status --short
    else
        pass "No uncommitted changes"
    fi

    # Check remote
    REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
    if [ "$REMOTE" != "none" ]; then
        pass "Git remote configured: $REMOTE"
    else
        warn "No git remote configured"
    fi
else
    warn "Not a git repository"
fi

if [ -f ".gitignore" ]; then
    pass ".gitignore exists"
    if grep -q ".env" .gitignore; then
        pass ".env is in .gitignore"
    else
        fail ".env is NOT in .gitignore (security risk!)"
    fi
else
    warn ".gitignore not found"
fi

if [ -f "LICENSE" ]; then
    pass "LICENSE file exists"
else
    warn "LICENSE file not found (recommended for open source)"
fi

echo ""
echo "8️⃣  Security Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env is tracked by git
if git ls-files --error-unmatch .env &> /dev/null; then
    fail ".env is tracked by git (SECURITY RISK!)"
    warn "Run: git rm --cached .env && git commit -m 'Remove .env from git'"
else
    pass ".env is not tracked by git"
fi

# Check for hardcoded secrets in code
info "Scanning for potential hardcoded secrets..."
SECRETS_FOUND=0

if grep -r "PRIVATE.*KEY.*=.*302e" src/ 2>/dev/null | grep -v "\.test\." | grep -v "example" > /dev/null; then
    fail "Potential private key found in source code!"
    ((SECRETS_FOUND++))
fi

if grep -r "eyJhbGc" src/ 2>/dev/null | grep -v "\.test\." | grep -v "example" > /dev/null; then
    fail "Potential JWT token found in source code!"
    ((SECRETS_FOUND++))
fi

if [ "$SECRETS_FOUND" -eq 0 ]; then
    pass "No obvious secrets found in source code"
else
    fail "Found $SECRETS_FOUND potential secrets in code"
fi

echo ""
echo "9️⃣  Testing IPFS Gateway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$PINATA_GATEWAY" ] || [ -n "$VITE_PINATA_GATEWAY" ]; then
    GATEWAY="${PINATA_GATEWAY:-$VITE_PINATA_GATEWAY}"
    info "Testing gateway: $GATEWAY"

    # Test with a known IPFS CID (empty json)
    TEST_CID="QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN"
    GATEWAY_URL="https://$GATEWAY/ipfs/$TEST_CID"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        pass "Pinata gateway is accessible"
    elif [ "$HTTP_CODE" = "000" ]; then
        fail "Cannot connect to Pinata gateway"
    else
        warn "Pinata gateway returned HTTP $HTTP_CODE"
    fi
else
    warn "No Pinata gateway configured"
fi

echo ""
echo "🎯 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "✅ Passed:   ${GREEN}$PASSED${NC}"
echo -e "❌ Failed:   ${RED}$FAILED${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

# Overall status
if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed!${NC}"
    echo ""
    echo "✅ Your CertChain deployment looks good!"
    echo ""
    echo "Next steps:"
    echo "1. Complete any items marked with warnings"
    echo "2. Test the application manually"
    echo "3. Record your demo video"
    echo "4. Capture screenshots"
    echo "5. Submit to Hedera Africa Hackathon"
    echo ""
    exit 0
elif [ "$FAILED" -le 2 ]; then
    echo -e "${YELLOW}⚠️  Some checks failed${NC}"
    echo ""
    echo "Please review the failed checks above and fix them."
    echo "Your deployment might work but could have issues."
    echo ""
    exit 1
else
    echo -e "${RED}❌ Multiple checks failed${NC}"
    echo ""
    echo "Please fix the failed checks before proceeding."
    echo "Your deployment is likely not ready for submission."
    echo ""
    exit 1
fi
