// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificateRegistry
 * @dev Manages certificate hashes and revocation status on Hedera
 */
contract CertificateRegistry {
    // Maps tokenId → certificate data hash
    mapping(uint256 => bytes32) public certificateHashes;

    // Maps institution account → authorized
    mapping(address => bool) public authorizedInstitutions;

    // Maps tokenId → revoked status
    mapping(uint256 => bool) public revokedCertificates;

    // Events stored on HCS (and emitted here)
    event CertificateIssued(uint256 tokenId, bytes32 hash);
    event CertificateRevoked(uint256 tokenId);
    event InstitutionAuthorized(address institution);
    event InstitutionDeauthorized(address institution);

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeInstitution(address institution) public onlyOwner {
        authorizedInstitutions[institution] = true;
        emit InstitutionAuthorized(institution);
    }

    function deauthorizeInstitution(address institution) public onlyOwner {
        authorizedInstitutions[institution] = false;
        emit InstitutionDeauthorized(institution);
    }

    function issueCertificate(uint256 tokenId, bytes32 hash) public {
        require(authorizedInstitutions[msg.sender], "Not an authorized institution");
        certificateHashes[tokenId] = hash;
        emit CertificateIssued(tokenId, hash);
    }

    function revokeCertificate(uint256 tokenId) public {
        require(authorizedInstitutions[msg.sender], "Not an authorized institution");
        revokedCertificates[tokenId] = true;
        emit CertificateRevoked(tokenId);
    }

    function isCertificateValid(uint256 tokenId, bytes32 hash) public view returns (bool) {
        return certificateHashes[tokenId] == hash && !revokedCertificates[tokenId];
    }
}
