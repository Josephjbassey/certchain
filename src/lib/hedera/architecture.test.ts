import { describe, it, expect, vi } from 'vitest';
import { hederaService } from './service';
import { buildCertificateNFTMetadata } from './nft';

describe('Decentralized Architecture Implementation', () => {
  it('should have the hederaService singleton initialized', () => {
    expect(hederaService).toBeDefined();
  });

  it('should correctly build NFT metadata following the new schema', () => {
    const mockData = {
      certificateId: 'test-cert-123',
      recipientName: 'John Doe',
      courseName: 'Hedera Fundamentals',
      institutionName: 'Hashgraph Academy',
      issueDate: '2025-01-01T00:00:00Z',
      fileHash: 'sha256-hash',
      ipfsCid: 'QmTestCID',
      hcsTopicId: '0.0.12345',
      additionalAttributes: {
        "Grade": "A+"
      }
    };

    const metadata = buildCertificateNFTMetadata(mockData);

    expect(metadata.name).toBe('Hedera Fundamentals - John Doe');
    expect(metadata.properties.certificateId).toBe('test-cert-123');
    expect(metadata.properties.hcsTopicId).toBe('0.0.12345');
    expect(metadata.attributes).toContainEqual({ trait_type: 'Institution', value: 'Hashgraph Academy' });
    expect(metadata.attributes).toContainEqual({ trait_type: 'Grade', value: 'A+' });
  });

  it('should have the core operations defined in hederaService', () => {
    expect(typeof hederaService.initializeInstitution).toBe('function');
    expect(typeof hederaService.issueCertificate).toBe('function');
    expect(typeof hederaService.verifyCertificate).toBe('function');
    expect(typeof hederaService.revokeCertificate).toBe('function');
    expect(typeof hederaService.batchIssueCertificates).toBe('function');
  });
});
