with open('supabase/functions/_shared/hedera-dapp-client.ts', 'r') as f:
    content = f.read()

if 'function getErrorMessage' not in content:
    helper = """
import { TransactionReceipt } from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
}
"""
    # Insert at top below imports
    idx = content.find('export')
    content = content[:idx] + helper + content[idx:]
    with open('supabase/functions/_shared/hedera-dapp-client.ts', 'w') as f:
        f.write(content)

with open('supabase/functions/_shared/hedera-resilient-client.ts', 'r') as f:
    content = f.read()

if 'function getErrorMessage' not in content:
    helper = """
function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
}
"""
    idx = content.find('export')
    content = content[:idx] + helper + content[idx:]
    with open('supabase/functions/_shared/hedera-resilient-client.ts', 'w') as f:
        f.write(content)
