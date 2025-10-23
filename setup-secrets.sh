#!/bin/bash

# Supabase Secrets Setup Script
# This script sets up all required secrets for edge functions

set -e

echo "🔐 Setting up Supabase Secrets"
echo "==============================="
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

PROJECT_REF="asxskeceekllmzxatlvn"

# Load environment variables from .env
if [ -f .env ]; then
    echo -e "${BLUE}📄 Loading secrets from .env file...${NC}"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

echo -e "${BLUE}🔗 Linking to project...${NC}"
npx supabase link --project-ref $PROJECT_REF

echo ""
echo -e "${BLUE}🔑 Setting Hedera secrets...${NC}"

# Set Hedera secrets
if [ ! -z "$HEDERA_OPERATOR_ID" ]; then
    echo "Setting HEDERA_OPERATOR_ID..."
    echo "$HEDERA_OPERATOR_ID" | npx supabase secrets set HEDERA_OPERATOR_ID --project-ref $PROJECT_REF
    echo -e "${GREEN}✅ HEDERA_OPERATOR_ID set${NC}"
else
    echo -e "${YELLOW}⚠️  HEDERA_OPERATOR_ID not found in .env${NC}"
fi

if [ ! -z "$HEDERA_OPERATOR_KEY" ]; then
    echo "Setting HEDERA_OPERATOR_KEY..."
    echo "$HEDERA_OPERATOR_KEY" | npx supabase secrets set HEDERA_OPERATOR_KEY --project-ref $PROJECT_REF
    echo -e "${GREEN}✅ HEDERA_OPERATOR_KEY set${NC}"
else
    echo -e "${YELLOW}⚠️  HEDERA_OPERATOR_KEY not found in .env${NC}"
fi

echo ""
echo -e "${BLUE}🔑 Setting Pinata secrets...${NC}"

if [ ! -z "$PINATA_JWT" ]; then
    echo "Setting PINATA_JWT..."
    echo "$PINATA_JWT" | npx supabase secrets set PINATA_JWT --project-ref $PROJECT_REF
    echo -e "${GREEN}✅ PINATA_JWT set${NC}"
else
    echo -e "${YELLOW}⚠️  PINATA_JWT not found in .env${NC}"
fi

if [ ! -z "$PINATA_GATEWAY" ]; then
    echo "Setting PINATA_GATEWAY..."
    echo "$PINATA_GATEWAY" | npx supabase secrets set PINATA_GATEWAY --project-ref $PROJECT_REF
    echo -e "${GREEN}✅ PINATA_GATEWAY set${NC}"
else
    echo -e "${YELLOW}⚠️  PINATA_GATEWAY not found in .env${NC}"
fi

echo ""
echo -e "${BLUE}📋 Listing all secrets...${NC}"
npx supabase secrets list --project-ref $PROJECT_REF

echo ""
echo -e "${GREEN}🎉 Secrets setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Run ./deploy-functions.sh to deploy edge functions"
echo "2. Test the functions from Supabase dashboard"
echo ""
