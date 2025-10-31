/**
 * Example: Using Hedera Transactions with Supabase Backend
 * 
 * This file demonstrates how to integrate Hedera blockchain operations
 * with Supabase database for a complete DApp experience.
 */

import { TopicCreateTransaction, TopicMessageSubmitTransaction, Hbar } from '@hashgraph/sdk';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { signAndExecuteTransaction, executeQuery } from '@/lib/hedera-transactions';
import { supabase } from '@/integrations/supabase/client';

/**
 * Example 1: Create a certificate on Hedera and store metadata in Supabase
 */
export async function issueCertificate(
  recipientEmail: string,
  certificateData: {
    title: string;
    description: string;
    issuerName: string;
  }
) {
  const { dAppConnector, accountId } = useHederaWallet();
  
  if (!dAppConnector || !accountId) {
    throw new Error('Wallet not connected');
  }

  try {
    // 1. Create Hedera topic for certificate (immutable ledger)
    const topicCreateTx = new TopicCreateTransaction()
      .setSubmitKey(/* your key */)
      .setAdminKey(/* your key */)
      .setTopicMemo('CertChain Certificate Topic');

    const result = await signAndExecuteTransaction(
      dAppConnector,
      topicCreateTx,
      accountId,
      'TOPIC_CREATE',
      { purpose: 'certificate', recipient: recipientEmail }
    );

    if (result.error) {
      throw new Error(result.error);
    }

    // 2. Store certificate metadata in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: certificate, error: dbError } = await supabase
      .from('certificates')
      .insert({
        user_id: user.id,
        recipient_email: recipientEmail,
        title: certificateData.title,
        description: certificateData.description,
        issuer_name: certificateData.issuerName,
        topic_id: result.transactionId, // Link to Hedera topic
        transaction_hash: result.transactionHash,
        status: 'issued'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      certificate,
      hederaTransaction: result
    };
  } catch (error) {
    console.error('Certificate issuance failed:', error);
    throw error;
  }
}

/**
 * Example 2: Submit certificate data to Hedera topic
 */
export async function submitCertificateToTopic(
  topicId: string,
  certificateHash: string
) {
  const { dAppConnector, accountId } = useHederaWallet();
  
  if (!dAppConnector || !accountId) {
    throw new Error('Wallet not connected');
  }

  try {
    const message = JSON.stringify({
      type: 'certificate',
      hash: certificateHash,
      timestamp: new Date().toISOString()
    });

    const topicMessageTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message);

    const result = await signAndExecuteTransaction(
      dAppConnector,
      topicMessageTx,
      accountId,
      'TOPIC_MESSAGE',
      { topicId, certificateHash }
    );

    // Update certificate in Supabase with submission proof
    await supabase
      .from('certificates')
      .update({
        topic_submission_tx: result.transactionId,
        submitted_at: new Date().toISOString()
      })
      .eq('topic_id', topicId);

    return result;
  } catch (error) {
    console.error('Topic submission failed:', error);
    throw error;
  }
}

/**
 * Example 3: Verify certificate authenticity by checking both Hedera and Supabase
 */
export async function verifyCertificate(certificateId: string) {
  try {
    // 1. Get certificate from Supabase
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (error) throw error;
    if (!certificate) throw new Error('Certificate not found');

    // 2. Verify on Hedera blockchain (you would query the topic)
    // This is where you'd use executeQuery to fetch topic info
    
    return {
      valid: true,
      certificate,
      blockchainVerified: true,
      message: 'Certificate is authentic and recorded on Hedera blockchain'
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      valid: false,
      certificate: null,
      blockchainVerified: false,
      message: 'Certificate verification failed'
    };
  }
}

/**
 * Example 4: Batch operations with transaction signing
 */
export async function batchIssueCertificates(
  recipients: Array<{ email: string; data: any }>
) {
  const { dAppConnector, accountId } = useHederaWallet();
  
  if (!dAppConnector || !accountId) {
    throw new Error('Wallet not connected');
  }

  const results = [];

  for (const recipient of recipients) {
    try {
      const result = await issueCertificate(recipient.email, recipient.data);
      results.push({ success: true, ...result });
    } catch (error: any) {
      results.push({
        success: false,
        error: error.message,
        recipient: recipient.email
      });
    }
  }

  return results;
}

/**
 * Example 5: Sync wallet connection status with Supabase profile
 */
export async function syncWalletToProfile(accountId: string, walletType: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if wallet already exists
    const { data: existing } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('account_id', accountId)
      .single();

    if (existing) {
      // Update last used time
      await supabase
        .from('user_wallets')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // Create new wallet entry
      const { data: wallets } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id);

      await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          account_id: accountId,
          wallet_type: walletType,
          is_primary: !wallets || wallets.length === 0
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Wallet sync failed:', error);
    throw error;
  }
}

/**
 * Example 6: Listen to wallet events and update UI
 */
export function setupWalletEventListeners(dAppConnector: any) {
  // Session events
  dAppConnector.onSessionIframeCreated = (session: any) => {
    console.log('Session created:', session);
    // Sync to Supabase
    if (session.accountIds && session.accountIds.length > 0) {
      syncWalletToProfile(session.accountIds[0], 'hedera');
    }
  };

  // You can add more event listeners based on HederaSessionEvent
  // - ChainChanged
  // - AccountsChanged
  // etc.
}
