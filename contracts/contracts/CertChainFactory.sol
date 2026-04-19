// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CertChainRegistry.sol";

/**
 * @title CertChainFactory
 * @dev Replaces Supabase Edge Functions. Securely proxies calls to Hedera Token Service (HTS).
 */
contract CertChainFactory {
    CertChainRegistry public registry;

    // Hedera HTS Precompile Address
    address constant HTS_PRECOMPILE = address(0x167);

    event CertificateMinted(address indexed institution, address indexed instructor, string ipfsHash);

    constructor(address _registryAddress) {
        registry = CertChainRegistry(_registryAddress);
    }

    modifier onlyAuthorizedMinters() {
        require(registry.isRegistered(msg.sender), "Caller is not registered");
        CertChainRegistry.Role callerRole = registry.getRole(msg.sender);
        require(
            callerRole == CertChainRegistry.Role.InstitutionAdmin ||
            callerRole == CertChainRegistry.Role.Instructor ||
            callerRole == CertChainRegistry.Role.SuperAdmin,
            "Unauthorized to issue certificates"
        );
        _;
    }

    /**
     * @dev Called by frontend to issue a certificate. Verifies RBAC, then executes HTS interactions.
     * Note: In a production Hedera environment, we would import standard Hedera precompiles (IHederaTokenService.sol).
     */
    function issueCertificate(string calldata /*ipfsHash*/, address /*recipient*/) external view onlyAuthorizedMinters {
        // Find out who is issuing
        address institution = msg.sender;
        CertChainRegistry.Role role = registry.getRole(msg.sender);

        if (role == CertChainRegistry.Role.Instructor) {
            institution = registry.institutionInstructors(msg.sender);
        }

        // Suppress unused warning while keeping implementation stub visible
        // using the institution variable
        require(institution != address(0), "Invalid institution");

        // Logic here to invoke HTS_PRECOMPILE to mint the NFT to the given token class.
        // HTS interactions typically require IHederaTokenService(HTS_PRECOMPILE).mintToken(tokenId, metadata);
        // This is a proxy mechanism. The Smart Contract itself is the admin of the Token Class.

        // TODO: Implement actual HTS precompile interactions
        revert("HTS Precompile interaction not yet implemented in pure-dApp stub");

        // The event emission is suppressed by the revert, but kept for future implementation reference.
        // emit CertificateMinted(institution, msg.sender, ipfsHash);
    }
}
