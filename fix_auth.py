import re

# 1. Update hedera-mint-certificate/index.ts
with open('supabase/functions/hedera-mint-certificate/index.ts', 'r') as f:
    content = f.read()

auth_check = """
    // Authorization Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user || user.id !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
"""
if '// Authorization Check' not in content:
    idx = content.find('const supabaseAdmin = createClient')
    if idx > -1:
        content = content[:idx] + auth_check + content[idx:]
        with open('supabase/functions/hedera-mint-certificate/index.ts', 'w') as f:
            f.write(content)


# 2. Update claim-certificate/index.ts
with open('supabase/functions/claim-certificate/index.ts', 'r') as f:
    content = f.read()
if '// Authorization Check' not in content:
    idx = content.find('const supabaseAdmin = createClient')
    if idx > -1:
        content = content[:idx] + auth_check + content[idx:]
        with open('supabase/functions/claim-certificate/index.ts', 'w') as f:
            f.write(content)

# 3. Update token-associate/index.ts
with open('supabase/functions/token-associate/index.ts', 'r') as f:
    content = f.read()
if '// Authorization Check' not in content:
    idx = content.find('const supabaseAdmin = createClient')
    if idx > -1:
        content = content[:idx] + auth_check + content[idx:]
        with open('supabase/functions/token-associate/index.ts', 'w') as f:
            f.write(content)


# 4. Update institution-staff/index.ts catch block
with open('supabase/functions/institution-staff/index.ts', 'r') as f:
    content = f.read()

# Replace general catch with 403 detection
content = content.replace(
"""  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }""",
"""  } catch (error: unknown) {
    console.error('Function error:', error);
    const errObj = error as { status?: number, message?: string };
    const status = errObj.status === 403 ? 403 : 500;
    return new Response(
      JSON.stringify({ success: false, error: errObj.message || 'Internal server error' }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }""")

with open('supabase/functions/institution-staff/index.ts', 'w') as f:
    f.write(content)
