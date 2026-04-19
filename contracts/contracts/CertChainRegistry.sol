// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertChainRegistry
 * @dev Replaces Supabase user_roles mapping. Manages Role-Based Access Control on Hedera.
 */
contract CertChainRegistry {
    enum Role { None, Candidate, Instructor, InstitutionAdmin, SuperAdmin }

    mapping(address => Role) public userRoles;
    mapping(address => address) public institutionInstructors; // maps instructor to institution admin

    event RoleAssigned(address indexed user, Role newRole, address indexed assignedBy);
    event RoleRevoked(address indexed user, address indexed revokedBy);

    constructor() {
        userRoles[msg.sender] = Role.SuperAdmin;
    }

    modifier onlySuperAdmin() {
        require(userRoles[msg.sender] == Role.SuperAdmin, "Not a Super Admin");
        _;
    }

    modifier onlyInstitutionAdmin() {
        require(
            userRoles[msg.sender] == Role.InstitutionAdmin ||
            userRoles[msg.sender] == Role.SuperAdmin,
            "Not an Institution Admin"
        );
        _;
    }

    // Super Admin can assign any role EXCEPT Instructor (which requires an institution mapping)
    function assignRole(address user, Role newRole) external onlySuperAdmin {
        require(newRole != Role.Instructor, "Use assignInstructor to map institution");
        _updateRole(user, newRole);
    }

    // Institution Admin can only add Instructors
    function assignInstructor(address instructor, address institution) external onlyInstitutionAdmin {
        require(userRoles[instructor] == Role.None || userRoles[instructor] == Role.Candidate, "User already has a higher role");
        userRoles[instructor] = Role.Instructor;
        institutionInstructors[instructor] = institution;
        emit RoleAssigned(instructor, Role.Instructor, msg.sender);
    }

    // Revoke or Demote a user to Candidate
    function revokeRole(address user) external onlySuperAdmin {
        _updateRole(user, Role.Candidate);
    }

    function _updateRole(address user, Role newRole) internal {
        // If demoting an instructor, clear their institution mapping
        if (userRoles[user] == Role.Instructor && newRole != Role.Instructor) {
            institutionInstructors[user] = address(0);
        }
        userRoles[user] = newRole;
        emit RoleAssigned(user, newRole, msg.sender);
    }

    // Checking access levels
    function getRole(address user) external view returns (Role) {
        return userRoles[user]; // Return the raw stored role
    }

    // Check if user is explicitly registered in the system
    function isRegistered(address user) external view returns (bool) {
        return userRoles[user] != Role.None;
    }
}
