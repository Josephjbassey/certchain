import re

def replace_in_file(filepath, replacements):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        with open(filepath, 'w') as f:
            f.write(content)
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

# 1. hedera-dapp-client.ts
replace_in_file('supabase/functions/_shared/hedera-dapp-client.ts', [
    ('receipt?: any;', 'receipt?: TransactionReceipt;'),
    ('catch (error: any)', 'catch (error: unknown)'),
    ('error.message', 'getErrorMessage(error)')
])

# 2. hedera-resilient-client.ts
replace_in_file('supabase/functions/_shared/hedera-resilient-client.ts', [
    ('catch (error: any)', 'catch (error: unknown)'),
    ('metadata?: any', 'metadata?: Record<string, unknown>'),
    ('error.message', 'getErrorMessage(error)')
])

# 3. error-handler.ts
replace_in_file('supabase/functions/_shared/error-handler.ts', [
    ('export function successResponse<T = any>(', 'export function successResponse<T = unknown>(')
])

print("Fixes applied.")
