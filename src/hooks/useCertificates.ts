import { useState, useEffect, useCallback } from "react";
import {
  useCertificateStore,
  selectFilteredCertificates,
} from "@/lib/store/certificate.store";
import { hederaService } from "@/lib/hedera/service";
import { fetchCertificateMetadata } from "@/lib/ipfs/client";

export function useCertificates(accountId?: string) {
  const {
    certificates,
    isLoading,
    error,
    setCertificates,
    setLoading,
    setError,
    filterStatus,
    searchQuery,
    setFilterStatus,
    setSearchQuery,
  } = useCertificateStore();

  const filteredCertificates = useCertificateStore(selectFilteredCertificates);

  /**
   * Load certificates for account
   */
  const loadCertificates = useCallback(async () => {
    if (!accountId) return;

    setLoading(true);
    setError(null);

    try {
      // Query certificates using Hedera Service (which uses Mirror Node or DB cache)
      const certs = await hederaService.getCertificatesForAccount(accountId);

      // Process and enrich certificates
      const certificatesData = await Promise.all(
        certs.map(async (cert: any) => {
          try {
            // Enrich with metadata if needed or handle status
            return {
              certificateId: cert.certificate_id,
              tokenId: cert.token_id,
              serialNumber: cert.serial_number,
              recipientName: cert.recipient_name || 'Unknown',
              recipientAccountId: cert.recipient_account_id,
              courseName: cert.course_name || 'Unknown',
              institutionName: cert.institution_name || 'Unknown',
              issueDate: cert.issued_at,
              expiryDate: cert.expires_at,
              status: cert.revoked_at ? 'REVOKED' : 'ACTIVE',
              fileHash: cert.file_hash,
              ipfsCid: cert.ipfs_cid,
              metadata: cert.metadata,
            };
          } catch (err) {
            console.error("Failed to enrich certificate:", err);
            return null;
          }
        })
      );

      const validCertificates = certificatesData.filter(
        (c): c is any => c !== null
      );

      setCertificates(validCertificates);
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  }, [accountId, setCertificates, setLoading, setError]);

  // Auto-load on mount
  useEffect(() => {
    loadCertificates();
  }, [accountId, loadCertificates]);

  return {
    certificates: filteredCertificates,
    allCertificates: certificates,
    isLoading,
    error,
    filterStatus,
    searchQuery,
    setFilterStatus,
    setSearchQuery,
    reload: loadCertificates,
  };
}

export function useCertificateStats(accountId?: string) {
  const { certificates, isLoading } = useCertificates(accountId);

  return {
    total: certificates.length,
    active: certificates.filter(c => c.status === 'ACTIVE').length,
    revoked: certificates.filter(c => c.status === 'REVOKED').length,
    expired: certificates.filter(c => c.status === 'EXPIRED').length,
    isLoading
  };
}

export function useMyCertificates(accountId?: string) {
  const { certificates, isLoading, reload } = useCertificates(accountId);
  return {
    certificates,
    isLoading,
    reload
  };
}
