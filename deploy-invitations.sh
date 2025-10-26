#!/bin/bash
# Quick deployment script for invitations table migration

echo "🚀 Deploying Invitations System"
echo "================================"
echo ""

# Check if we're logged in
if ! npx supabase projects list > /dev/null 2>&1; then
  echo "❌ Not logged in to Supabase CLI"
  echo "Please run: npx supabase login"
  exit 1
fi

echo "✅ Supabase CLI authenticated"
echo ""

# Open the SQL Editor with instructions
echo "📋 To apply the database migration:"
echo ""
echo "1. Opening Supabase SQL Editor in your browser..."
echo "   URL: https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/sql/new"
echo ""
echo "2. Copy the SQL migration file:"
echo "   File: supabase/migrations/20251025025908_create_invitations_table.sql"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""

# Open browser
"$BROWSER" "https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/sql/new" 2>/dev/null || true

echo ""
echo "📄 Migration SQL:"
echo "================================"
cat supabase/migrations/20251025025908_create_invitations_table.sql
echo ""
echo "================================"
echo ""
echo "After running the SQL in the dashboard, press Enter to continue..."
read -r

# Regenerate types
echo ""
echo "🔄 Regenerating TypeScript types..."
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts

if [ $? -eq 0 ]; then
  echo "✅ TypeScript types updated"
else
  echo "⚠️  Failed to regenerate types. You can do this manually later with:"
  echo "   npx supabase gen types typescript --linked > src/integrations/supabase/types.ts"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set RESEND_API_KEY secret for email functionality:"
echo "   npx supabase secrets set RESEND_API_KEY=your_api_key_here"
echo ""
echo "2. Test the invitation flow:"
echo "   - Go to Admin → Institution Management"
echo "   - Create a new institution"
echo "   - Check that invitation email is sent"
echo "   - Use invitation link to sign up"
echo ""
