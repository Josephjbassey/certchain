#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys all edge functions to Supabase

set -e

echo "🚀 CertChain Edge Functions Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN not set${NC}"
    echo "Please run: export SUPABASE_ACCESS_TOKEN=your_token"
    echo "Get your token from: https://supabase.com/dashboard/account/tokens"
    echo ""
    echo "Or login with: npx supabase login"
    exit 1
fi

# Project details
PROJECT_ID="asxskeceekllmzxatlvn"
PROJECT_REF="asxskeceekllmzxatlvn"

echo -e "${BLUE}📋 Project: ${PROJECT_REF}${NC}"
echo ""

# Link to project
echo -e "${BLUE}🔗 Linking to Supabase project...${NC}"
npx supabase link --project-ref $PROJECT_REF

# List of functions to deploy
FUNCTIONS=(
    "hedera-create-did"
    "hedera-mint-certificate"
    "hedera-hcs-log"
    "pinata-upload"
    "claim-certificate"
    "admin-users"
    "institution-staff"
)

echo -e "${BLUE}📦 Deploying ${#FUNCTIONS[@]} edge functions...${NC}"
echo ""

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
    echo -e "${BLUE}Deploying ${func}...${NC}"
    if npx supabase functions deploy $func --project-ref $PROJECT_REF --no-verify-jwt --debug; then
        echo -e "${GREEN}✅ ${func} deployed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to deploy ${func}${NC}"
        exit 1
    fi
    echo ""
done

echo ""
echo -e "${GREEN}🎉 All edge functions deployed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Set up Supabase secrets (see setup-secrets.sh)"
echo "2. Test the functions from your dashboard"
echo "3. Check function logs: npx supabase functions list"
echo ""
echo -e "${BLUE}Function URLs:${NC}"
for func in "${FUNCTIONS[@]}"; do
    echo "  - https://${PROJECT_REF}.supabase.co/functions/v1/${func}"
done
