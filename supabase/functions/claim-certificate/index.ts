import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.4";
// Use pinned Skypack ESM build to avoid bundling the npm package
import {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  TokenAssociateTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  claimToken: z.string().min(10),
  userId: z.string().uuid(),
  network: z.enum(["testnet", "mainnet"]).optional().default("testnet"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { claimToken, userId, network } = BodySchema.parse(body);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service role not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Lookup claim token
    const { data: claimRow, error: claimErr } = await supabase
      .from("claim_tokens")
      .select("*, certificate_id")
      .eq("token", claimToken)
      .is("claimed_by", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (claimErr) throw claimErr;
    if (!claimRow) throw new Error("Invalid or expired claim token");

    // 2) Fetch user profile for recipient Hedera account
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, hedera_account_id")
      .eq("id", userId)
      .single();

    if (profileErr) throw profileErr;
    if (!profile?.hedera_account_id) {
      throw new Error("User profile missing Hedera account ID");
    }

    const recipientAccountId = profile.hedera_account_id as string;

    // 3) Fetch certificate record (requires token_id + serial_number)
    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("certificate_id, token_id, serial_number, issued_at")
      .eq("certificate_id", claimRow.certificate_id)
      .single();

    if (certErr) throw certErr;
    if (!cert?.token_id || cert.serial_number == null) {
      throw new Error("Certificate does not contain token info");
    }

    const tokenId = cert.token_id as string;
    const serialNumber = Number(cert.serial_number);

    // 4) Setup Hedera client
    const operatorId = Deno.env.get("HEDERA_OPERATOR_ID");
    const operatorKey = Deno.env.get("HEDERA_OPERATOR_KEY");
    if (!operatorId || !operatorKey) {
      throw new Error("Hedera credentials not configured");
    }

    const client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    // NOTE: if key is DER-encoded, use fromStringDer; else fromString
    const operatorPrivateKey = PrivateKey.fromString(operatorKey);

    client.setOperator(AccountId.fromString(operatorId), operatorPrivateKey);

    // 5) Check if token is associated, if not, associate it
    console.log('Checking token association for recipient...');
    const mirrorNodeUrl = network === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com';

    let isAssociated = false;
    try {
      const accountUrl = `${mirrorNodeUrl}/api/v1/accounts/${recipientAccountId}/tokens?token.id=${tokenId}`;
      const checkResponse = await fetch(accountUrl);
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        isAssociated = data.tokens && data.tokens.length > 0;
        console.log('Token association status:', isAssociated ? 'Associated' : 'Not associated');
      }
    } catch (error) {
      console.log('Could not check association status, will attempt transfer');
    }

    // Associate token if needed (requires recipient's private key)
    // NOTE: In production, this should be done client-side by the user's wallet
    // For now, we'll return an error asking the user to associate
    if (!isAssociated) {
      console.log('Token not associated. User must associate token first.');
      return new Response(
        JSON.stringify({
          success: false,
          certificateId: cert.certificate_id,
          tokenId,
          serialNumber,
          needsAssociation: true,
          error: "Token must be associated with your account before claiming.",
          help: "Please associate token " + tokenId + " with your Hedera account, then retry the claim.",
          associationInstructions: {
            step1: "Open your Hedera wallet (HashPack, Blade, etc.)",
            step2: "Find 'Token Association' or 'Add Token' option",
            step3: `Enter token ID: ${tokenId}`,
            step4: "Confirm the association transaction",
            step5: "Return here and retry claiming your certificate"
          }
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 6) Attempt transfer from treasury (operator) to recipient
    console.log('Transferring NFT to recipient...');
    try {
      const transferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, serialNumber, AccountId.fromString(operatorId), AccountId.fromString(recipientAccountId))
        .freezeWith(client);

      const transferSign = await transferTx.sign(operatorPrivateKey);
      const transferSubmit = await transferSign.execute(client);
      const transferRx = await transferSubmit.getReceipt(client);

      console.log('NFT transferred successfully:', transferSubmit.transactionId.toString());

      // 7) Mark claim as used
      const { error: updateErr } = await supabase
        .from("claim_tokens")
        .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
        .eq("token", claimToken);

      if (updateErr) throw updateErr;

      // 8) Log to HCS for audit trail
      try {
        console.log('Logging claim event to HCS...');
        const hcsMessage = JSON.stringify({
          event: "certificate_claimed",
          certificateId: cert.certificate_id,
          tokenId,
          serialNumber,
          claimant: recipientAccountId,
          claimedBy: userId,
          transactionId: transferSubmit.transactionId.toString(),
          timestamp: new Date().toISOString()
        });

        // Note: This would require importing TopicMessageSubmitTransaction
        // For now, we'll log to console and can add HCS logging in next iteration
        console.log('HCS log (to be implemented):', hcsMessage);
      } catch (hcsError) {
        console.error('Failed to log to HCS:', hcsError);
        // Don't fail the claim if HCS logging fails
      }

      return new Response(
        JSON.stringify({
          success: true,
          certificateId: cert.certificate_id,
          tokenId,
          serialNumber,
          transactionId: transferSubmit.transactionId.toString(),
          explorerUrl: `https://hashscan.io/${network}/transaction/${transferSubmit.transactionId}`,
          message: "Certificate claimed and transferred",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (transferErr: any) {
      // Common cause: TOKEN_NOT_ASSOCIATED_TO_ACCOUNT or ACCOUNT_FROZEN_FOR_TOKEN
      return new Response(
        JSON.stringify({
          success: false,
          certificateId: cert.certificate_id,
          tokenId,
          serialNumber,
          needsAssociation: true,
          error: transferErr?.message || "Transfer failed. Ensure token association is completed.",
          help: "Ask the user to associate the token ID in their wallet, then retry the claim.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error: any) {
    console.error("Error in claim-certificate:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Failed to claim certificate" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
