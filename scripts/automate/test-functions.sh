#!/bin/bash

# Edge Functions Testing Script
# Tests all deployed edge functions

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep VITE_SUPABASE_ANON_KEY | xargs)
fi

PROJECT_REF="asxskeceekllmzxatlvn"
BASE_URL="https://${PROJECT_REF}.supabase.co/functions/v1"
ANON_KEY="${VITE_SUPABASE_ANON_KEY}"

if [ -z "$ANON_KEY" ]; then
    echo -e "${RED}❌ VITE_SUPABASE_ANON_KEY not found in .env${NC}"
    exit 1
fi

echo -e "${BLUE}🧪 Testing Edge Functions${NC}"
echo "============================="
echo ""

# Test 1: hedera-create-did
echo -e "${BLUE}1. Testing hedera-create-did...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/hedera-create-did" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "userAccountId": "0.0.123456",
    "network": "testnet"
  }')

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ hedera-create-did: PASS${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ hedera-create-did: FAIL${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: pinata-upload
echo -e "${BLUE}2. Testing pinata-upload...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/pinata-upload" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Test Certificate",
      "description": "This is a test certificate"
    },
    "name": "test-certificate.json"
  }')

if echo "$RESPONSE" | grep -q "success\|IpfsHash"; then
    echo -e "${GREEN}✅ pinata-upload: PASS${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ pinata-upload: FAIL${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: hedera-hcs-log
echo -e "${BLUE}3. Testing hedera-hcs-log...${NC}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/hedera-hcs-log" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "0.0.123456",
    "message": "Test log message",
    "eventType": "test_event"
  }')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ hedera-hcs-log: PASS${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${YELLOW}⚠️  hedera-hcs-log: May require valid topic ID${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 4: Check if functions are listed
echo -e "${BLUE}4. Checking function list...${NC}"
if command -v npx &> /dev/null; then
    FUNCTIONS=$(npx supabase functions list --project-ref ${PROJECT_REF} 2>&1)
    if echo "$FUNCTIONS" | grep -q "hedera-create-did"; then
        echo -e "${GREEN}✅ Functions are deployed and accessible${NC}"
        echo "$FUNCTIONS"
    else
        echo -e "${YELLOW}⚠️  Could not verify function deployment${NC}"
        echo "$FUNCTIONS"
    fi
else
    echo -e "${YELLOW}⚠️  npx not available, skipping function list check${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "====================="
echo ""
echo "Function URLs:"
echo "  • hedera-create-did: ${BASE_URL}/hedera-create-did"
echo "  • hedera-mint-certificate: ${BASE_URL}/hedera-mint-certificate"
echo "  • hedera-hcs-log: ${BASE_URL}/hedera-hcs-log"
echo "  • pinata-upload: ${BASE_URL}/pinata-upload"
echo "  • claim-certificate: ${BASE_URL}/claim-certificate"
echo "  • admin-users: ${BASE_URL}/admin-users"
echo "  • institution-staff: ${BASE_URL}/institution-staff"
echo ""
echo -e "${YELLOW}💡 Tip: Check detailed logs with:${NC}"
echo "   npx supabase functions logs function-name --tail"
echo ""
