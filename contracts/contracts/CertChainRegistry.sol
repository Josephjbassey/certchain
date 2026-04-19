// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertChainRegistry
 * @dev Replaces Supabase user_roles mapping. Manages Role-Based Access Control on Hedera.
 */
contract CertChainRegistry {
    enum Role { None, Candidate, Instructor, InstitutionAdmin, SuperAdmin }

    address public owner;
    mapping(address => Role) public userRoles;
    mapping(address => address) public institutionInstructors; // maps instructor to institution admin

    event RoleAssigned(address indexed user, Role newRole, address indexed assignedBy);

    constructor() {
        owner = msg.sender;
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

    // Super Admin can assign any role
    function assignRole(address user, Role newRole) external onlySuperAdmin {
        userRoles[user] = newRole;
        emit RoleAssigned(user, newRole, msg.sender);
    }

    // Institution Admin can only add Instructors and Candidates
    function assignInstructor(address instructor) external onlyInstitutionAdmin {
        require(userRoles[instructor] == Role.None || userRoles[instructor] == Role.Candidate, "User already has a higher role");
        userRoles[instructor] = Role.Instructor;
        institutionInstructors[instructor] = msg.sender;
        emit RoleAssigned(instructor, Role.Instructor, msg.sender);
    }

    // Checking access levels
    function getRole(address user) external view returns (Role) {
        return userRoles[user] == Role.None ? Role.Candidate : userRoles[user]; // Fallback
    }
}
