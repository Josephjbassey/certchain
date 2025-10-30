#!/bin/bash

# Resend & Hedera Integration Testing Script
# Usage: ./test-integration.sh

echo "🧪 Testing CertChain Integrations"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking Prerequisites..."
if ! command_exists npx; then
    echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
    exit 1
fi

if ! command_exists supabase; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Step 1: Deploy Email Functions
echo "📧 Step 1: Deploying Email Functions..."
echo "----------------------------------------"

echo "Deploying send-contact-email..."
npx supabase functions deploy send-contact-email
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ send-contact-email deployed${NC}"
else
    echo -e "${RED}❌ send-contact-email deployment failed${NC}"
fi

echo "Deploying send-invitation-email..."
npx supabase functions deploy send-invitation-email
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ send-invitation-email deployed${NC}"
else
    echo -e "${RED}❌ send-invitation-email deployment failed${NC}"
fi

echo ""

# Step 2: Check Environment Variables
echo "🔐 Step 2: Checking Environment Variables..."
echo "----------------------------------------"

REQUIRED_VARS=("RESEND_API_KEY" "HEDERA_OPERATOR_ID" "HEDERA_OPERATOR_KEY" "PINATA_JWT")

for var in "${REQUIRED_VARS[@]}"; do
    if npx supabase secrets list | grep -q "$var"; then
        echo -e "${GREEN}✅ $var is set${NC}"
    else
        echo -e "${RED}❌ $var is NOT set${NC}"
        echo "   Set it with: npx supabase secrets set $var=<value>"
    fi
done

echo ""

# Step 3: Test Email Configuration
echo "📨 Step 3: Testing Email Configuration..."
echo "----------------------------------------"

echo "To test email functionality:"
echo "1. Open your app at: http://localhost:5173"
echo "2. Navigate to the Contact page"
echo "3. Fill out and submit the contact form"
echo "4. Check for emails at: support@mail.certchain.app"
echo ""
echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
read -r

# Step 4: Test Hedera Functions
echo "🔷 Step 4: Testing Hedera Functions..."
echo "----------------------------------------"

echo "To test Hedera integration:"
echo "1. Open browser console (F12)"
echo "2. Navigate to DID Setup page"
echo "3. Enter a valid Hedera Account ID (format: 0.0.xxxxx)"
echo "4. Click 'Create DID'"
echo "5. Check console logs for detailed output"
echo ""
echo "Expected console logs:"
echo "  - 'Creating DID with request: {...}'"
echo "  - 'DID creation response: {...}'"
echo "  - 'DID Document: {...}' (if successful)"
echo "  - 'HCS Topic ID: ...' (if successful)"
echo ""
echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
read -r

# Step 5: Test Certificate Issuance
echo "📜 Step 5: Testing Certificate Issuance..."
echo "----------------------------------------"

echo "To test certificate issuance:"
echo "1. Open browser console (F12)"
echo "2. Navigate to Issue Certificate page"
echo "3. Fill out the form and submit"
echo "4. Watch the console for detailed logs"
echo ""
echo "Expected console logs:"
echo "  - 'IPFS upload successful: Qm...'"
echo "  - 'Minting successful: { tokenId: ..., serialNumber: ..., transactionId: ... }'"
echo "  - 'HCS logging successful: {...}'"
echo ""
echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
read -r

# Step 6: Summary
echo "📊 Testing Summary"
echo "=================="
echo ""
echo "✅ What was tested:"
echo "  - Email functions deployment"
echo "  - Environment variables configuration"
echo "  - Email sending functionality"
echo "  - DID creation with enhanced logging"
echo "  - Certificate issuance with error handling"
echo ""
echo "🔍 What to check:"
echo "  - Email received at support@mail.certchain.app"
echo "  - Detailed console logs during operations"
echo "  - User-friendly error messages on failures"
echo "  - Successful operations complete without errors"
echo ""
echo "📚 For more details, see:"
echo "  - docs/RESEND_AND_HEDERA_FIXES.md"
echo "  - docs/HEDERA_SERVICES.md"
echo "  - docs/CONTACT_FORM_EMAIL_SETUP.md"
echo ""
echo -e "${GREEN}🎉 Testing guide complete!${NC}"
